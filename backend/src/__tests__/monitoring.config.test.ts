/**
 * Monitoring Configuration Tests
 */

import { getConfig } from '../config';

describe('Monitoring Configuration', () => {
  let config: ReturnType<typeof getConfig>;

  beforeAll(() => {
    config = getConfig();
  });

  describe('APM Configuration', () => {
    it('should load APM config', () => {
      const apmConfig = config.getApmConfig();
      expect(apmConfig).toBeDefined();
      expect(apmConfig).toHaveProperty('enabled');
      expect(apmConfig).toHaveProperty('serviceName');
      expect(apmConfig).toHaveProperty('environment');
      expect(apmConfig).toHaveProperty('version');
      expect(apmConfig).toHaveProperty('apiKey');
      expect(apmConfig).toHaveProperty('samplingRate');
      expect(apmConfig).toHaveProperty('tags');
    });

    it('should have correct types', () => {
      const apmConfig = config.getApmConfig();
      expect(typeof apmConfig.enabled).toBe('boolean');
      expect(typeof apmConfig.serviceName).toBe('string');
      expect(typeof apmConfig.samplingRate).toBe('number');
      expect(typeof apmConfig.tags).toBe('object');
    });

    it('should have valid sampling rate', () => {
      const apmConfig = config.getApmConfig();
      expect(apmConfig.samplingRate).toBeGreaterThanOrEqual(0);
      expect(apmConfig.samplingRate).toBeLessThanOrEqual(1);
    });
  });

  describe('Sentry Configuration', () => {
    it('should load Sentry config', () => {
      const sentryConfig = config.getSentryConfig();
      expect(sentryConfig).toBeDefined();
      expect(sentryConfig).toHaveProperty('enabled');
      expect(sentryConfig).toHaveProperty('dsn');
      expect(sentryConfig).toHaveProperty('environment');
      expect(sentryConfig).toHaveProperty('release');
      expect(sentryConfig).toHaveProperty('tracesSampleRate');
      expect(sentryConfig).toHaveProperty('profilesSampleRate');
      expect(sentryConfig).toHaveProperty('allowUrls');
      expect(sentryConfig).toHaveProperty('ignoreErrors');
    });

    it('should have correct types', () => {
      const sentryConfig = config.getSentryConfig();
      expect(typeof sentryConfig.enabled).toBe('boolean');
      expect(typeof sentryConfig.dsn).toBe('string');
      expect(typeof sentryConfig.environment).toBe('string');
      expect(typeof sentryConfig.release).toBe('string');
      expect(typeof sentryConfig.tracesSampleRate).toBe('number');
      expect(typeof sentryConfig.profilesSampleRate).toBe('number');
      expect(Array.isArray(sentryConfig.allowUrls)).toBe(true);
      expect(Array.isArray(sentryConfig.ignoreErrors)).toBe(true);
    });

    it('should have valid sample rates', () => {
      const sentryConfig = config.getSentryConfig();
      expect(sentryConfig.tracesSampleRate).toBeGreaterThanOrEqual(0);
      expect(sentryConfig.tracesSampleRate).toBeLessThanOrEqual(1);
      expect(sentryConfig.profilesSampleRate).toBeGreaterThanOrEqual(0);
      expect(sentryConfig.profilesSampleRate).toBeLessThanOrEqual(1);
    });

    it('should have default ignored errors', () => {
      const sentryConfig = config.getSentryConfig();
      expect(sentryConfig.ignoreErrors.length).toBeGreaterThan(0);
      expect(sentryConfig.ignoreErrors).toContain('ValidationError');
      expect(sentryConfig.ignoreErrors).toContain('UnauthorizedError');
      expect(sentryConfig.ignoreErrors).toContain('NotFoundError');
    });
  });

  describe('Analytics Configuration', () => {
    it('should load Analytics config', () => {
      const analyticsConfig = config.getAnalyticsConfig();
      expect(analyticsConfig).toBeDefined();
      expect(analyticsConfig).toHaveProperty('enabled');
      expect(analyticsConfig).toHaveProperty('provider');
      expect(analyticsConfig).toHaveProperty('apiKey');
      expect(analyticsConfig).toHaveProperty('trackPageViews');
      expect(analyticsConfig).toHaveProperty('trackErrors');
    });

    it('should have correct types', () => {
      const analyticsConfig = config.getAnalyticsConfig();
      expect(typeof analyticsConfig.enabled).toBe('boolean');
      expect(typeof analyticsConfig.provider).toBe('string');
      expect(typeof analyticsConfig.apiKey).toBe('string');
      expect(typeof analyticsConfig.trackPageViews).toBe('boolean');
      expect(typeof analyticsConfig.trackErrors).toBe('boolean');
    });

    it('should have valid provider', () => {
      const analyticsConfig = config.getAnalyticsConfig();
      const validProviders = ['segment', 'mixpanel', 'amplitude', 'mock'];
      expect(validProviders).toContain(analyticsConfig.provider);
    });
  });

  describe('Monitoring Configuration', () => {
    it('should load complete monitoring config', () => {
      const monitoringConfig = config.getMonitoringConfig();
      expect(monitoringConfig).toBeDefined();
      expect(monitoringConfig).toHaveProperty('apm');
      expect(monitoringConfig).toHaveProperty('sentry');
      expect(monitoringConfig).toHaveProperty('analytics');
    });

    it('should have all sub-configs', () => {
      const monitoringConfig = config.getMonitoringConfig();
      expect(monitoringConfig.apm).toBeDefined();
      expect(monitoringConfig.sentry).toBeDefined();
      expect(monitoringConfig.analytics).toBeDefined();
    });
  });
});
