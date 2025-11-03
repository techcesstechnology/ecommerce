import { NotificationPayload } from '../types';

class SMSService {
  private smsGatewayUrl: string;
  private apiKey: string;
  private senderId: string;

  constructor() {
    this.smsGatewayUrl = process.env.SMS_GATEWAY_URL || 'https://api.sms-gateway.zw/send';
    this.apiKey = process.env.SMS_GATEWAY_API_KEY || '';
    this.senderId = process.env.SMS_SENDER_ID || 'FreshRoute';
  }

  /**
   * Send SMS notification
   */
  async sendSMS(payload: NotificationPayload): Promise<boolean> {
    try {
      // In production, this would call the actual SMS gateway API
      // For Zimbabwe, common providers include: Econet, NetOne, Telecel SMS gateways
      
      console.log(`[SMS] Sending to ${payload.recipient}:`);
      console.log(`[SMS] Message: ${payload.message}`);
      
      // Simulate API call
      if (!this.apiKey) {
        console.log('[SMS] Warning: SMS_GATEWAY_API_KEY not configured. SMS not sent.');
        return false;
      }

      // In production, you would make an actual HTTP request:
      /*
      const response = await fetch(this.smsGatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          to: payload.recipient,
          from: this.senderId,
          message: payload.message,
        }),
      });

      if (!response.ok) {
        throw new Error(`SMS API error: ${response.statusText}`);
      }
      */

      return true;
    } catch (error) {
      console.error('[SMS] Error sending SMS:', error);
      return false;
    }
  }

  /**
   * Send delivery assigned notification to customer
   */
  async notifyDeliveryAssigned(
    customerPhone: string,
    deliveryId: string,
    driverName: string,
    estimatedArrival?: Date
  ): Promise<boolean> {
    const eta = estimatedArrival 
      ? ` ETA: ${estimatedArrival.toLocaleTimeString()}`
      : '';
    
    const message = `Your FreshRoute delivery #${deliveryId.substring(0, 8)} has been assigned to ${driverName}.${eta} Track: ${this.getTrackingUrl(deliveryId)}`;

    return this.sendSMS({
      recipient: customerPhone,
      message,
      type: 'sms',
      deliveryId,
    });
  }

  /**
   * Send delivery picked up notification
   */
  async notifyDeliveryPickedUp(
    customerPhone: string,
    deliveryId: string
  ): Promise<boolean> {
    const message = `Your FreshRoute order has been picked up and is on its way! Track: ${this.getTrackingUrl(deliveryId)}`;

    return this.sendSMS({
      recipient: customerPhone,
      message,
      type: 'sms',
      deliveryId,
    });
  }

  /**
   * Send delivery in transit notification
   */
  async notifyDeliveryInTransit(
    customerPhone: string,
    deliveryId: string,
    estimatedArrival?: Date
  ): Promise<boolean> {
    const eta = estimatedArrival 
      ? ` ETA: ${estimatedArrival.toLocaleTimeString()}`
      : '';
    
    const message = `Your FreshRoute delivery is nearby!${eta} Track: ${this.getTrackingUrl(deliveryId)}`;

    return this.sendSMS({
      recipient: customerPhone,
      message,
      type: 'sms',
      deliveryId,
    });
  }

  /**
   * Send delivery completed notification
   */
  async notifyDeliveryCompleted(
    customerPhone: string,
    deliveryId: string
  ): Promise<boolean> {
    const message = `Your FreshRoute order has been delivered successfully! Thank you for your order.`;

    return this.sendSMS({
      recipient: customerPhone,
      message,
      type: 'sms',
      deliveryId,
    });
  }

  /**
   * Send delivery failed notification
   */
  async notifyDeliveryFailed(
    customerPhone: string,
    deliveryId: string,
    reason: string
  ): Promise<boolean> {
    const message = `We couldn't complete your FreshRoute delivery #${deliveryId.substring(0, 8)}. Reason: ${reason}. Please contact support.`;

    return this.sendSMS({
      recipient: customerPhone,
      message,
      type: 'sms',
      deliveryId,
    });
  }

  /**
   * Get tracking URL for a delivery
   */
  private getTrackingUrl(deliveryId: string): string {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/track/${deliveryId}`;
  }

  /**
   * Validate Zimbabwe phone number format
   */
  validatePhoneNumber(phone: string): boolean {
    // Zimbabwe phone format: +263 followed by 9 digits or 0 followed by 9 digits
    const regex = /^(\+263|0)[0-9]{9}$/;
    return regex.test(phone);
  }

  /**
   * Format phone number to international format
   */
  formatPhoneNumber(phone: string): string {
    // Convert local format to international
    if (phone.startsWith('0')) {
      return '+263' + phone.substring(1);
    }
    return phone;
  }
}

export default new SMSService();
