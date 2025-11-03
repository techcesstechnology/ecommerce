import {
  Payment,
  PaymentStatus,
  PaymentMethod,
  PaymentInitializeRequest,
  PaymentInitializeResponse,
  PaymentVerifyRequest,
} from '../types';
import { generatePaymentId } from '../utils/helpers';
import { redisClient } from '../utils/redis';
import { orderService } from '../orders/order.service';
import { stripeProvider } from './providers/stripe';
import { ecocashProvider } from './providers/ecocash';
import { PaymentProvider } from './providers/stripe';
import { emailService } from '../notifications/email.service';

const PAYMENT_PREFIX = 'payment:';

export class PaymentService {
  private getPaymentKey(paymentId: string): string {
    return `${PAYMENT_PREFIX}${paymentId}`;
  }

  private getProvider(method: PaymentMethod): PaymentProvider | null {
    switch (method) {
      case PaymentMethod.STRIPE:
        return stripeProvider;
      case PaymentMethod.ECOCASH:
        return ecocashProvider;
      case PaymentMethod.CASH_ON_DELIVERY:
        return null;
      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }
  }

  async initializePayment(
    request: PaymentInitializeRequest
  ): Promise<PaymentInitializeResponse> {
    const paymentId = generatePaymentId();

    const payment: Payment = {
      id: paymentId,
      orderId: request.orderId,
      amount: request.amount,
      currency: request.currency,
      method: request.method,
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.savePayment(payment);

    // Handle cash on delivery
    if (request.method === PaymentMethod.CASH_ON_DELIVERY) {
      payment.status = PaymentStatus.PENDING;
      await this.savePayment(payment);
      
      return {
        paymentId,
        instructions: 'Payment will be collected upon delivery',
      };
    }

    // Handle online payment providers
    const provider = this.getProvider(request.method);
    if (!provider) {
      throw new Error('Invalid payment method');
    }

    payment.status = PaymentStatus.PROCESSING;
    await this.savePayment(payment);

    const providerResponse = await provider.initialize(payment);

    return {
      paymentId,
      ...providerResponse,
    };
  }

  async verifyPayment(request: PaymentVerifyRequest): Promise<Payment> {
    const payment = await this.getPayment(request.paymentId);

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      return payment;
    }

    const provider = this.getProvider(payment.method);
    if (!provider) {
      throw new Error('Invalid payment method');
    }

    const status = await provider.verify(payment, request.reference || request.transactionId);

    payment.status = status;
    payment.transactionId = request.transactionId;
    payment.updatedAt = new Date();

    await this.savePayment(payment);

    // Update order payment status
    if (status === PaymentStatus.COMPLETED) {
      await orderService.updatePaymentStatus(payment.orderId, PaymentStatus.COMPLETED);
      await emailService.sendPaymentReceipt(payment);
    }

    return payment;
  }

  async getPayment(paymentId: string): Promise<Payment | null> {
    const paymentKey = this.getPaymentKey(paymentId);
    const paymentData = await redisClient.get(paymentKey);

    if (!paymentData) {
      return null;
    }

    return JSON.parse(paymentData);
  }

  private async savePayment(payment: Payment): Promise<void> {
    const paymentKey = this.getPaymentKey(payment.id);
    const paymentData = JSON.stringify(payment);
    await redisClient.set(paymentKey, paymentData);
  }
}

export const paymentService = new PaymentService();
