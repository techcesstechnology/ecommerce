import { v4 as uuidv4 } from 'uuid';
import {
  PaymentTransaction,
  ProcessPaymentDto,
  PaymentRefundDto,
  PaymentResponse,
} from '../models/payment.model';

// In-memory storage for payment transactions
const transactionsStore = new Map<string, PaymentTransaction>();

export class PaymentService {
  /**
   * Process payment
   */
  async processPayment(data: ProcessPaymentDto): Promise<PaymentResponse> {
    const transaction: PaymentTransaction = {
      id: uuidv4(),
      orderId: data.orderId,
      amount: data.amount,
      currency: data.currency,
      provider: data.provider,
      status: 'processing',
      paymentMethod: data.paymentMethod,
      metadata: data.paymentDetails,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    transactionsStore.set(transaction.id, transaction);

    // Mock payment processing
    // In production, integrate with actual payment providers
    const success = await this.mockPaymentProcessing(data);

    if (success) {
      transaction.status = 'completed';
      transaction.completedAt = new Date();
      transaction.providerTransactionId = `${data.provider.toUpperCase()}-${uuidv4().substring(0, 8)}`;
    } else {
      transaction.status = 'failed';
      transaction.failureReason = 'Payment declined by provider';
    }

    transaction.updatedAt = new Date();
    transactionsStore.set(transaction.id, transaction);

    return {
      success,
      transactionId: transaction.id,
      providerTransactionId: transaction.providerTransactionId,
      status: transaction.status,
      message: success ? 'Payment processed successfully' : transaction.failureReason,
    };
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string): Promise<PaymentTransaction | undefined> {
    return transactionsStore.get(transactionId);
  }

  /**
   * Get transactions by order ID
   */
  async getTransactionsByOrderId(orderId: string): Promise<PaymentTransaction[]> {
    return Array.from(transactionsStore.values()).filter((t) => t.orderId === orderId);
  }

  /**
   * Process refund
   */
  async processRefund(data: PaymentRefundDto): Promise<PaymentResponse> {
    const transaction = transactionsStore.get(data.transactionId);

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status === 'refunded') {
      throw new Error('Transaction already refunded');
    }

    if (transaction.status !== 'completed') {
      throw new Error('Can only refund completed transactions');
    }

    // Mock refund processing
    const refundAmount = data.amount || transaction.amount;

    if (refundAmount > transaction.amount) {
      throw new Error('Refund amount cannot exceed transaction amount');
    }

    // Create refund transaction
    const refundTransaction: PaymentTransaction = {
      id: uuidv4(),
      orderId: transaction.orderId,
      amount: -refundAmount,
      currency: transaction.currency,
      provider: transaction.provider,
      status: 'completed',
      paymentMethod: transaction.paymentMethod,
      metadata: { originalTransactionId: transaction.id, reason: data.reason },
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: new Date(),
      providerTransactionId: `REFUND-${uuidv4().substring(0, 8)}`,
    };

    transactionsStore.set(refundTransaction.id, refundTransaction);

    // Update original transaction
    transaction.status = 'refunded';
    transaction.updatedAt = new Date();
    transactionsStore.set(transaction.id, transaction);

    return {
      success: true,
      transactionId: refundTransaction.id,
      providerTransactionId: refundTransaction.providerTransactionId,
      status: 'refunded',
      message: 'Refund processed successfully',
    };
  }

  /**
   * Mock payment processing
   */
  private async mockPaymentProcessing(_data: ProcessPaymentDto): Promise<boolean> {
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock success rate (95% success)
    return Math.random() > 0.05;
  }

  /**
   * Validate payment details
   */
  validatePaymentDetails(
    provider: string,
    _paymentDetails: Record<string, unknown>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (provider) {
      case 'stripe':
      case 'paypal':
        if (!_paymentDetails.token) {
          errors.push('Payment token is required');
        }
        break;
      case 'ecocash':
      case 'onemoney':
        if (!_paymentDetails.phoneNumber) {
          errors.push('Phone number is required for mobile money');
        }
        break;
      case 'cash_on_delivery':
        // No validation needed
        break;
      default:
        errors.push('Invalid payment provider');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const paymentService = new PaymentService();
