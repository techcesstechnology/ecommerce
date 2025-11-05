/**
 * Cache Middleware
 * Redis-based caching middleware for route responses
 */

import { Request, Response, NextFunction } from 'express';
import { redisService } from '../services/redis.service';
import { logger } from '../services/logger.service';

/**
 * Cache options
 */
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyPrefix?: string; // Key prefix for cache entries
  skipCache?: (req: Request) => boolean; // Function to determine if cache should be skipped
}

/**
 * Generate cache key from request
 */
const generateCacheKey = (req: Request, prefix?: string): string => {
  const baseKey = `${req.method}:${req.originalUrl}`;
  return prefix ? `${prefix}:${baseKey}` : baseKey;
};

/**
 * Cache middleware factory
 */
export const cache = (options: CacheOptions = {}) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Skip cache if Redis is not ready
    if (!redisService.isReady()) {
      logger.debug('Cache skipped: Redis not ready');
      return next();
    }

    // Skip cache based on custom logic
    if (options.skipCache && options.skipCache(req)) {
      logger.debug('Cache skipped: Custom skip logic');
      return next();
    }

    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = generateCacheKey(req, options.keyPrefix);

    try {
      // Try to get cached response
      const cachedData = await redisService.get<any>(cacheKey);

      if (cachedData) {
        logger.debug(`Cache hit: ${cacheKey}`);
        res.json(cachedData);
        return;
      }

      logger.debug(`Cache miss: ${cacheKey}`);

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache the response
      res.json = function (data: any): Response {
        // Cache the response asynchronously
        redisService
          .set(cacheKey, data, options.ttl)
          .then(() => {
            logger.debug(`Cached response: ${cacheKey}`);
          })
          .catch((error) => {
            logger.error(`Failed to cache response: ${cacheKey}`, error.stack);
          });

        // Call original json method
        return originalJson(data);
      };

      next();
    } catch (error: any) {
      logger.error('Cache middleware error', error.stack);
      // Continue without cache on error
      next();
    }
  };
};

/**
 * Invalidate cache by pattern
 */
export const invalidateCache = async (pattern: string): Promise<number> => {
  if (!redisService.isReady()) {
    logger.warn('Cannot invalidate cache: Redis not ready');
    return 0;
  }

  try {
    const count = await redisService.deletePattern(pattern);
    logger.info(`Invalidated ${count} cache entries matching pattern: ${pattern}`);
    return count;
  } catch (error: any) {
    logger.error(`Failed to invalidate cache pattern: ${pattern}`, error.stack);
    return 0;
  }
};

/**
 * Invalidate specific cache key
 */
export const invalidateCacheKey = async (key: string): Promise<boolean> => {
  if (!redisService.isReady()) {
    logger.warn('Cannot invalidate cache key: Redis not ready');
    return false;
  }

  try {
    const deleted = await redisService.delete(key);
    if (deleted) {
      logger.info(`Invalidated cache key: ${key}`);
    }
    return deleted;
  } catch (error: any) {
    logger.error(`Failed to invalidate cache key: ${key}`, error.stack);
    return false;
  }
};
