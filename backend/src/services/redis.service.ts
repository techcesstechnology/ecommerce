/**
 * Redis Service
 * Centralized Redis caching service with connection pooling and error handling
 */

import { createClient, RedisClientOptions } from 'redis';
import { getConfig } from '../config';
import { logger } from './logger.service';

// Get configuration
const config = getConfig();
const redisConfig = config.getRedisConfig();

// Define a type for the Redis client
type RedisClient = ReturnType<typeof createClient>;

/**
 * Redis Service class
 */
export class RedisService {
  private static instance: RedisService;
  private client: RedisClient | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000; // Start with 1 second

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  /**
   * Initialize Redis connection
   */
  public async connect(): Promise<void> {
    if (this.isConnected && this.client) {
      logger.info('Redis client already connected');
      return;
    }

    // Skip Redis initialization if not configured
    if (!redisConfig.url && (!process.env.REDIS_HOST && !process.env.REDIS_URL)) {
      logger.info('⚠️  Redis not configured - caching will be disabled');
      this.isConnected = false;
      return;
    }

    try {
      let client: RedisClient;

      // If REDIS_URL is provided, use it (for cloud providers like Upstash, Redis Cloud, etc.)
      if (redisConfig.url) {
        logger.info('Connecting to Redis using URL (cloud Redis)');
        const options: RedisClientOptions = {
          url: redisConfig.url,
        };
        client = createClient(options);
      } else {
        // Traditional host/port connection (for local Redis or self-hosted)
        logger.info(`Connecting to Redis using host/port: ${redisConfig.host}:${redisConfig.port}`);
        const options: RedisClientOptions = {
          socket: {
            host: redisConfig.host,
            port: redisConfig.port,
            reconnectStrategy: (retries: number) => {
              if (retries > this.maxReconnectAttempts) {
                logger.error(`Redis connection failed after ${retries} attempts`);
                return new Error('Max reconnection attempts reached');
              }
              const delay = Math.min(retries * this.reconnectDelay, 30000); // Max 30 seconds
              logger.warn(`Redis reconnecting in ${delay}ms... (attempt ${retries})`);
              return delay;
            },
          },
          database: redisConfig.db,
        };

        // Add password if provided
        if (redisConfig.password) {
          options.password = redisConfig.password;
        }

        client = createClient(options);
      }
      this.client = client;

      // Event handlers
      client.on('error', (error) => {
        logger.error('Redis client error', error.stack);
        this.isConnected = false;
      });

      client.on('connect', () => {
        logger.info('Redis client connecting...');
      });

      client.on('ready', () => {
        logger.info('Redis client ready');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      client.on('reconnecting', () => {
        this.reconnectAttempts++;
        logger.warn(`Redis client reconnecting... (attempt ${this.reconnectAttempts})`);
      });

      client.on('end', () => {
        logger.warn('Redis client connection closed');
        this.isConnected = false;
      });

      // Connect to Redis with timeout
      const connectPromise = client.connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
      );
      
      await Promise.race([connectPromise, timeoutPromise]);
      logger.info(`✅ Redis connected successfully at ${redisConfig.host}:${redisConfig.port}`);
    } catch (error: any) {
      logger.error('Failed to connect to Redis', error.stack || error.message);
      logger.warn('⚠️  Continuing without Redis - caching will be disabled');
      this.isConnected = false;
      // Don't throw - allow app to continue without Redis
    }
  }

  /**
   * Disconnect from Redis
   */
  public async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      try {
        await this.client.quit();
        this.isConnected = false;
        logger.info('Redis client disconnected');
      } catch (error: any) {
        logger.error('Error disconnecting Redis client', error.stack);
      }
    }
  }

  /**
   * Check if Redis is connected
   */
  public isReady(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Get value from cache
   */
  public async get<T>(key: string): Promise<T | null> {
    if (!this.isReady()) {
      logger.warn('Redis not connected, skipping cache get');
      return null;
    }

    try {
      const prefixedKey = this.getPrefixedKey(key);
      const value = await this.client!.get(prefixedKey);

      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error: any) {
      logger.error(`Redis get error for key ${key}`, error.stack);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  public async set(key: string, value: any, ttl?: number): Promise<boolean> {
    if (!this.isReady()) {
      logger.warn('Redis not connected, skipping cache set');
      return false;
    }

    try {
      const prefixedKey = this.getPrefixedKey(key);
      const serializedValue = JSON.stringify(value);
      const expirySeconds = ttl || redisConfig.ttl;

      await this.client!.setEx(prefixedKey, expirySeconds, serializedValue);
      return true;
    } catch (error: any) {
      logger.error(`Redis set error for key ${key}`, error.stack);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  public async delete(key: string): Promise<boolean> {
    if (!this.isReady()) {
      logger.warn('Redis not connected, skipping cache delete');
      return false;
    }

    try {
      const prefixedKey = this.getPrefixedKey(key);
      await this.client!.del(prefixedKey);
      return true;
    } catch (error: any) {
      logger.error(`Redis delete error for key ${key}`, error.stack);
      return false;
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  public async deletePattern(pattern: string): Promise<number> {
    if (!this.isReady()) {
      logger.warn('Redis not connected, skipping cache delete pattern');
      return 0;
    }

    try {
      const prefixedPattern = this.getPrefixedKey(pattern);
      const keys = await this.client!.keys(prefixedPattern);

      if (keys.length === 0) {
        return 0;
      }

      await this.client!.del(keys);
      return keys.length;
    } catch (error: any) {
      logger.error(`Redis delete pattern error for pattern ${pattern}`, error.stack);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  public async exists(key: string): Promise<boolean> {
    if (!this.isReady()) {
      logger.warn('Redis not connected, skipping cache exists check');
      return false;
    }

    try {
      const prefixedKey = this.getPrefixedKey(key);
      const result = await this.client!.exists(prefixedKey);
      return result === 1;
    } catch (error: any) {
      logger.error(`Redis exists error for key ${key}`, error.stack);
      return false;
    }
  }

  /**
   * Set expiry time for a key
   */
  public async expire(key: string, ttl: number): Promise<boolean> {
    if (!this.isReady()) {
      logger.warn('Redis not connected, skipping cache expire');
      return false;
    }

    try {
      const prefixedKey = this.getPrefixedKey(key);
      await this.client!.expire(prefixedKey, ttl);
      return true;
    } catch (error: any) {
      logger.error(`Redis expire error for key ${key}`, error.stack);
      return false;
    }
  }

  /**
   * Increment a value
   */
  public async increment(key: string, amount: number = 1): Promise<number> {
    if (!this.isReady()) {
      logger.warn('Redis not connected, skipping cache increment');
      return 0;
    }

    try {
      const prefixedKey = this.getPrefixedKey(key);
      return await this.client!.incrBy(prefixedKey, amount);
    } catch (error: any) {
      logger.error(`Redis increment error for key ${key}`, error.stack);
      return 0;
    }
  }

  /**
   * Clear all cache (use with caution)
   */
  public async clear(): Promise<boolean> {
    if (!this.isReady()) {
      logger.warn('Redis not connected, skipping cache clear');
      return false;
    }

    try {
      const pattern = this.getPrefixedKey('*');
      const keys = await this.client!.keys(pattern);

      if (keys.length > 0) {
        await this.client!.del(keys);
        logger.info(`Cleared ${keys.length} cache entries`);
      }

      return true;
    } catch (error: any) {
      logger.error('Redis clear error', error.stack);
      return false;
    }
  }

  /**
   * Get prefixed key
   */
  private getPrefixedKey(key: string): string {
    return `${redisConfig.keyPrefix}${key}`;
  }

  /**
   * Ping Redis server
   */
  public async ping(): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }

    try {
      const result = await this.client!.ping();
      return result === 'PONG';
    } catch (error: any) {
      logger.error('Redis ping error', error.stack);
      return false;
    }
  }
}

/**
 * Export singleton instance
 */
export const redisService = RedisService.getInstance();

/**
 * Initialize Redis connection
 */
export const initializeRedis = async (): Promise<void> => {
  try {
    await redisService.connect();
  } catch (error: any) {
    logger.error('Failed to initialize Redis', error.stack);
    // Don't throw - allow app to continue without Redis
  }
};

/**
 * Close Redis connection
 */
export const closeRedis = async (): Promise<void> => {
  await redisService.disconnect();
};

/**
 * Check Redis health
 */
export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    return await redisService.ping();
  } catch (error) {
    return false;
  }
};
