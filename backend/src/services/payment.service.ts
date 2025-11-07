import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database.config';
import { PaymentTransaction } from '../models/paymentTransaction.entity';
import { Order } from '../models/order.entity';
import {
  CreatePaymentDto,
  InitiatePaymentResponse,
  PESEPAY_PAYMENT_METHODS,
  PaymentStatus,
  PesepayConfig,
  PesepayStatusResponse,
  PesepayTransactionRequest,
  PesepayTransactionResponse,
} from '../types/payment.types';
import { AppError } from '../utils/errors';
import crypto from 'crypto';

export class PaymentService {
  private paymentRepository: Repository<PaymentTransaction>;
  private orderRepository: Repository<Order>;
  private pesepayConfig: PesepayConfig;

  constructor() {
    this.paymentRepository = AppDataSource.getRepository(PaymentTransaction);
    this.orderRepository = AppDataSource.getRepository(Order);

    // Initialize Pesepay configuration from environment
    this.pesepayConfig = {
      integrationKey: process.env.PESEPAY_INTEGRATION_KEY || '',
      encryptionKey: process.env.PESEPAY_ENCRYPTION_KEY || '',
      resultUrl: `${process.env.API_URL}/api/payments/pesepay/callback`,
      returnUrl: `${process.env.FRONTEND_URL}/payment/complete`,
      environment: (process.env.PESEPAY_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
    };
  }

  /**
   * Generate a unique transaction reference
   */
  private generateTransactionReference(): string {
    const timestamp = Date.now();
    const randomStr = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `FR-${timestamp}-${randomStr}`;
  }

  /**
   * Get payment method code for Pesepay
   */
  private getPaymentMethodCode(paymentMethod: string): string {
    switch (paymentMethod.toLowerCase()) {
      case 'ecocash':
        return PESEPAY_PAYMENT_METHODS.ECOCASH;
      case 'visa':
      case 'card':
        return PESEPAY_PAYMENT_METHODS.VISA;
      case 'onemoney':
        return PESEPAY_PAYMENT_METHODS.ONEMONEY;
      default:
        throw new AppError(`Unsupported payment method: ${paymentMethod}`, 400);
    }
  }

  /**
   * Create a payment transaction record
   */
  async createPaymentTransaction(data: CreatePaymentDto): Promise<PaymentTransaction> {
    try {
      const transactionReference = this.generateTransactionReference();
      const paymentMethodCode = this.getPaymentMethodCode(data.paymentMethod);

      const transaction = this.paymentRepository.create({
        orderId: data.orderId,
        userId: data.userId,
        provider: 'pesepay',
        amount: data.amount,
        currency: data.currency,
        paymentMethod: data.paymentMethod,
        paymentMethodCode,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        transactionReference,
        paymentDescription: data.description || `Payment for Order #${data.orderId}`,
        status: 'pending',
      });

      return await this.paymentRepository.save(transaction);
    } catch (error) {
      console.error('Error creating payment transaction:', error);
      throw error;
    }
  }

  /**
   * Initiate payment with Pesepay
   */
  async initiatePayment(paymentData: CreatePaymentDto): Promise<InitiatePaymentResponse> {
    try {
      // Create payment transaction record
      const transaction = await this.createPaymentTransaction(paymentData);

      // For cash payments, skip Pesepay integration
      if (paymentData.paymentMethod.toLowerCase() === 'cash') {
        return {
          transactionId: transaction.id,
          transactionReference: transaction.transactionReference,
          status: 'pending' as PaymentStatus,
          message: 'Cash payment selected. Pay on delivery.',
        };
      }

      // Check if Pesepay is configured
      if (!this.pesepayConfig.integrationKey || !this.pesepayConfig.encryptionKey) {
        console.warn('Pesepay not configured, using mock payment flow');
        
        // Update transaction with mock data
        transaction.status = 'processing';
        transaction.metadata = { mock: true, environment: 'development' };
        await this.paymentRepository.save(transaction);

        return {
          transactionId: transaction.id,
          transactionReference: transaction.transactionReference,
          status: 'processing' as PaymentStatus,
          message: 'Payment processing (Development Mode)',
        };
      }

      // Initiate actual Pesepay transaction
      const pesepayRequest: PesepayTransactionRequest = {
        amount: transaction.amount,
        currencyCode: transaction.currency as 'ZWL' | 'USD',
        transactionDescription: transaction.paymentDescription!,
        transactionReference: transaction.transactionReference,
        customerPhone: transaction.customerPhone,
        customerEmail: transaction.customerEmail,
        paymentMethodCode: transaction.paymentMethodCode!,
      };

      const response = await this.callPesepayInitiate(pesepayRequest);

      if (response.success) {
        transaction.pollUrl = response.pollUrl;
        transaction.redirectUrl = response.redirectUrl;
        transaction.status = 'processing';
        await this.paymentRepository.save(transaction);

        return {
          transactionId: transaction.id,
          transactionReference: transaction.transactionReference,
          pollUrl: response.pollUrl,
          redirectUrl: response.redirectUrl,
          status: 'processing' as PaymentStatus,
          message: 'Payment initiated successfully',
        };
      } else {
        transaction.status = 'failed';
        transaction.errorMessage = response.error || 'Payment initiation failed';
        await this.paymentRepository.save(transaction);

        throw new AppError(response.error || 'Payment initiation failed', 400);
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw error;
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(transactionReference: string): Promise<PaymentTransaction | null> {
    try {
      const transaction = await this.paymentRepository.findOne({
        where: { transactionReference },
        relations: ['order'],
      });

      if (!transaction) {
        return null;
      }

      // If already paid or failed, return current status
      if (transaction.status === 'paid' || transaction.status === 'failed') {
        return transaction;
      }

      // For cash payments, status is managed manually
      if (transaction.paymentMethod === 'cash') {
        return transaction;
      }

      // For mock/dev mode, simulate payment after 10 seconds
      if (transaction.metadata?.mock) {
        const elapsed = Date.now() - new Date(transaction.createdAt).getTime();
        if (elapsed > 10000) {
          transaction.status = 'paid';
          transaction.paidAt = new Date();
          await this.paymentRepository.save(transaction);

          // Update order payment status
          await this.updateOrderPaymentStatus(transaction.orderId, 'paid' as any);
        }
        return transaction;
      }

      // Check with Pesepay if configured
      if (transaction.pollUrl && this.pesepayConfig.integrationKey) {
        const status = await this.callPesepayCheckStatus(transaction.pollUrl);

        if (status.paid) {
          transaction.status = 'paid';
          transaction.paidAt = new Date();
          await this.paymentRepository.save(transaction);

          // Update order payment status
          await this.updateOrderPaymentStatus(transaction.orderId, 'paid' as any);
        }
      }

      return transaction;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }

  /**
   * Update order payment status
   */
  private async updateOrderPaymentStatus(orderId: number, status: string): Promise<void> {
    try {
      const order = await this.orderRepository.findOne({ where: { id: orderId } });
      if (order) {
        order.paymentStatus = status as any;
        if (status === 'paid' && order.status === 'pending') {
          order.status = 'confirmed';
        }
        await this.orderRepository.save(order);
      }
    } catch (error) {
      console.error('Error updating order payment status:', error);
    }
  }

  /**
   * Call Pesepay API to initiate transaction
   */
  private async callPesepayInitiate(
    request: PesepayTransactionRequest
  ): Promise<PesepayTransactionResponse> {
    try {
      const baseUrl =
        this.pesepayConfig.environment === 'production'
          ? 'https://api.pesepay.com'
          : 'https://api-sandbox.pesepay.com';

      const payload = {
        amount: request.amount,
        currencyCode: request.currencyCode,
        transactionDescription: request.transactionDescription,
        transactionReference: request.transactionReference,
        resultUrl: this.pesepayConfig.resultUrl,
        returnUrl: this.pesepayConfig.returnUrl,
        customerPhone: request.customerPhone,
        customerEmail: request.customerEmail,
        paymentMethodCode: request.paymentMethodCode,
      };

      const response = await fetch(`${baseUrl}/api/v1/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.pesepayConfig.integrationKey}`,
          'X-Encryption-Key': this.pesepayConfig.encryptionKey,
        },
        body: JSON.stringify(payload),
      });

      const data: any = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          pollUrl: data.pollUrl,
          redirectUrl: data.redirectUrl,
          transactionReference: data.transactionReference,
          message: data.message,
        };
      } else {
        return {
          success: false,
          error: data.message || 'Payment initiation failed',
        };
      }
    } catch (error: any) {
      console.error('Pesepay API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect to payment gateway',
      };
    }
  }

  /**
   * Call Pesepay API to check transaction status
   */
  private async callPesepayCheckStatus(pollUrl: string): Promise<PesepayStatusResponse> {
    try {
      const response = await fetch(pollUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.pesepayConfig.integrationKey}`,
        },
      });

      const data: any = await response.json();

      return {
        paid: data.paid || false,
        amount: data.amount,
        transactionReference: data.transactionReference,
        paymentMethod: data.paymentMethod,
        message: data.message,
      };
    } catch (error: any) {
      console.error('Pesepay status check error:', error);
      return {
        paid: false,
        error: error.message || 'Failed to check payment status',
      };
    }
  }

  /**
   * Get payment transaction by ID
   */
  async getPaymentById(id: number): Promise<PaymentTransaction | null> {
    try {
      return await this.paymentRepository.findOne({
        where: { id },
        relations: ['order', 'user'],
      });
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  }

  /**
   * Get payment transactions for an order
   */
  async getPaymentsByOrderId(orderId: number): Promise<PaymentTransaction[]> {
    try {
      return await this.paymentRepository.find({
        where: { orderId },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      console.error('Error fetching payments for order:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
