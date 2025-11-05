/**
 * Analytics Service
 * Abstract analytics service for tracking user events and behavior
 * Designed to work with various analytics providers (Segment, Mixpanel, Amplitude, etc.)
 */

import { getConfig } from '../config';
import { logger } from './logger.service';

const config = getConfig();
const analyticsConfig = config.getAnalyticsConfig();

/**
 * Analytics event interface
 */
export interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, any>;
  userId?: string;
  anonymousId?: string;
  timestamp?: Date;
  context?: {
    ip?: string;
    userAgent?: string;
    locale?: string;
    [key: string]: any;
  };
}

/**
 * User traits interface
 */
export interface UserTraits {
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
  createdAt?: Date;
  [key: string]: any;
}

/**
 * E-commerce event properties
 */
export interface EcommerceEventProperties {
  orderId?: string;
  productId?: string;
  productName?: string;
  category?: string;
  price?: number;
  quantity?: number;
  currency?: string;
  revenue?: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  coupon?: string;
  [key: string]: any;
}

/**
 * Analytics Service class
 */
export class AnalyticsService {
  private enabled: boolean;
  private eventQueue: AnalyticsEvent[];
  private readonly MAX_QUEUE_SIZE = 100;

  constructor() {
    this.enabled = analyticsConfig.enabled;
    this.eventQueue = [];

    if (this.enabled) {
      logger.info('Analytics Service initialized', {
        provider: analyticsConfig.provider,
      });
    }
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Track an event
   */
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.enabled) return;

    try {
      const eventWithTimestamp: AnalyticsEvent = {
        ...event,
        timestamp: event.timestamp || new Date(),
      };

      // Add to queue
      this.eventQueue.push(eventWithTimestamp);

      // Flush if queue is full
      if (this.eventQueue.length >= this.MAX_QUEUE_SIZE) {
        await this.flush();
      }

      logger.debug(`Event tracked: ${event.eventName}`, {
        user_id: event.userId,
        properties: event.properties,
      });

      // In a real implementation, send to analytics provider
      // For example: analytics.track() for Segment
    } catch (error) {
      logger.error('Failed to track event', error as Error, {
        event_name: event.eventName,
      });
    }
  }

  /**
   * Identify a user
   */
  async identifyUser(userId: string, traits?: UserTraits): Promise<void> {
    if (!this.enabled) return;

    try {
      logger.debug(`User identified: ${userId}`, {
        traits,
      });

      // In a real implementation, send to analytics provider
      // For example: analytics.identify() for Segment
    } catch (error) {
      logger.error('Failed to identify user', error as Error, {
        user_id: userId,
      });
    }
  }

  /**
   * Track page view
   */
  async trackPageView(userId: string, pageName: string, properties?: Record<string, any>): Promise<void> {
    if (!this.enabled || !analyticsConfig.trackPageViews) return;

    await this.trackEvent({
      eventName: 'Page Viewed',
      userId,
      properties: {
        page: pageName,
        ...properties,
      },
    });
  }

  /**
   * Track user signup
   */
  async trackSignup(userId: string, properties?: Record<string, any>): Promise<void> {
    if (!this.enabled) return;

    await this.trackEvent({
      eventName: 'User Signed Up',
      userId,
      properties,
    });
  }

  /**
   * Track user login
   */
  async trackLogin(userId: string, properties?: Record<string, any>): Promise<void> {
    if (!this.enabled) return;

    await this.trackEvent({
      eventName: 'User Logged In',
      userId,
      properties,
    });
  }

  /**
   * Track user logout
   */
  async trackLogout(userId: string): Promise<void> {
    if (!this.enabled) return;

    await this.trackEvent({
      eventName: 'User Logged Out',
      userId,
    });
  }

  /**
   * Track product viewed
   */
  async trackProductViewed(userId: string, properties: EcommerceEventProperties): Promise<void> {
    if (!this.enabled) return;

    await this.trackEvent({
      eventName: 'Product Viewed',
      userId,
      properties,
    });
  }

  /**
   * Track product added to cart
   */
  async trackProductAddedToCart(userId: string, properties: EcommerceEventProperties): Promise<void> {
    if (!this.enabled) return;

    await this.trackEvent({
      eventName: 'Product Added',
      userId,
      properties,
    });
  }

  /**
   * Track product removed from cart
   */
  async trackProductRemovedFromCart(userId: string, properties: EcommerceEventProperties): Promise<void> {
    if (!this.enabled) return;

    await this.trackEvent({
      eventName: 'Product Removed',
      userId,
      properties,
    });
  }

  /**
   * Track checkout started
   */
  async trackCheckoutStarted(userId: string, properties: EcommerceEventProperties): Promise<void> {
    if (!this.enabled) return;

    await this.trackEvent({
      eventName: 'Checkout Started',
      userId,
      properties,
    });
  }

  /**
   * Track order completed
   */
  async trackOrderCompleted(userId: string, properties: EcommerceEventProperties): Promise<void> {
    if (!this.enabled) return;

    await this.trackEvent({
      eventName: 'Order Completed',
      userId,
      properties,
    });
  }

  /**
   * Track payment failed
   */
  async trackPaymentFailed(userId: string, properties: Record<string, any>): Promise<void> {
    if (!this.enabled) return;

    await this.trackEvent({
      eventName: 'Payment Failed',
      userId,
      properties,
    });
  }

  /**
   * Track search performed
   */
  async trackSearch(userId: string, query: string, resultsCount?: number): Promise<void> {
    if (!this.enabled) return;

    await this.trackEvent({
      eventName: 'Search Performed',
      userId,
      properties: {
        query,
        results_count: resultsCount,
      },
    });
  }

  /**
   * Track error
   */
  async trackError(userId: string | undefined, error: Error, context?: Record<string, any>): Promise<void> {
    if (!this.enabled || !analyticsConfig.trackErrors) return;

    await this.trackEvent({
      eventName: 'Error Occurred',
      userId,
      properties: {
        error_name: error.name,
        error_message: error.message,
        error_stack: error.stack,
        ...context,
      },
    });
  }

  /**
   * Flush queued events
   */
  async flush(): Promise<void> {
    if (!this.enabled || this.eventQueue.length === 0) return;

    try {
      logger.debug(`Flushing ${this.eventQueue.length} analytics events`);
      
      // In a real implementation, batch send to analytics provider
      // For example: analytics.flush() for Segment
      
      this.eventQueue = [];
    } catch (error) {
      logger.error('Failed to flush analytics events', error as Error);
    }
  }

  /**
   * Get queue size (for monitoring)
   */
  getQueueSize(): number {
    return this.eventQueue.length;
  }

  /**
   * Clear event queue
   */
  clearQueue(): void {
    this.eventQueue = [];
  }
}

/**
 * Export singleton instance
 */
export const analyticsService = new AnalyticsService();

/**
 * Export default
 */
export default analyticsService;
