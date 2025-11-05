import { Router, Request, Response } from 'express';
import { checkDatabaseHealth } from '../config/database.config';
import { checkRedisHealth } from '../services/redis.service';
import { getConfig } from '../config';
import { apmService } from '../services/apm.service';
import { sentryService } from '../services/sentry.service';
import { analyticsService } from '../services/analytics.service';
import os from 'os';

const router = Router();
const config = getConfig();

// Track uptime
const startTime = Date.now();

/**
 * Health status interface
 */
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
    };
    redis: {
      status: 'up' | 'down';
      responseTime?: number;
    };
    memory: {
      status: 'ok' | 'warning' | 'critical';
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      status: 'ok';
      loadAverage: number[];
      cores: number;
    };
  };
  monitoring: {
    apm: {
      enabled: boolean;
      activeTransactions?: number;
    };
    sentry: {
      enabled: boolean;
    };
    analytics: {
      enabled: boolean;
      queueSize?: number;
    };
  };
}

/**
 * Basic health check endpoint
 */
router.get('/', async (_req: Request, res: Response) => {
  const dbHealth = await checkDatabaseHealth();

  res.status(dbHealth ? 200 : 503).json({
    status: dbHealth ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    database: dbHealth ? 'connected' : 'disconnected',
  });
});

/**
 * Detailed health check endpoint
 */
router.get('/detailed', async (_req: Request, res: Response) => {
  try {
    // Check database health
    const dbStart = Date.now();
    const dbHealth = await checkDatabaseHealth();
    const dbResponseTime = Date.now() - dbStart;

    // Check Redis health
    const redisStart = Date.now();
    const redisHealth = await checkRedisHealth();
    const redisResponseTime = Date.now() - redisStart;

    // Check memory usage
    const memUsed = process.memoryUsage().heapUsed;
    const memTotal = process.memoryUsage().heapTotal;
    const memPercentage = (memUsed / memTotal) * 100;
    const memStatus = memPercentage > 90 ? 'critical' : memPercentage > 70 ? 'warning' : 'ok';

    // CPU info
    const loadAvg = os.loadavg();
    const cpuCores = os.cpus().length;

    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (!dbHealth) {
      overallStatus = 'unhealthy';
    } else if (!redisHealth || memStatus === 'warning') {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
      version: config.getAPIConfig().version,
      environment: config.getEnvironment(),
      checks: {
        database: {
          status: dbHealth ? 'up' : 'down',
          responseTime: dbResponseTime,
        },
        redis: {
          status: redisHealth ? 'up' : 'down',
          responseTime: redisResponseTime,
        },
        memory: {
          status: memStatus,
          used: Math.round(memUsed / 1024 / 1024),
          total: Math.round(memTotal / 1024 / 1024),
          percentage: Math.round(memPercentage),
        },
        cpu: {
          status: 'ok',
          loadAverage: loadAvg.map((avg) => Math.round(avg * 100) / 100),
          cores: cpuCores,
        },
      },
      monitoring: {
        apm: {
          enabled: apmService.isEnabled(),
          activeTransactions: apmService.isEnabled()
            ? apmService.getActiveTransactions().length
            : undefined,
        },
        sentry: {
          enabled: sentryService.isEnabled(),
        },
        analytics: {
          enabled: analyticsService.isEnabled(),
          queueSize: analyticsService.isEnabled() ? analyticsService.getQueueSize() : undefined,
        },
      },
    };

    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 503 : 503;
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

/**
 * Readiness check endpoint (for container orchestration)
 */
router.get('/ready', async (_req: Request, res: Response) => {
  const dbHealth = await checkDatabaseHealth();

  if (dbHealth) {
    res.status(200).json({ ready: true });
  } else {
    res.status(503).json({ ready: false, reason: 'Database not connected' });
  }
});

/**
 * Liveness check endpoint (for container orchestration)
 */
router.get('/live', (_req: Request, res: Response) => {
  // Simple check that the service is running
  res.status(200).json({ alive: true, uptime: Math.floor((Date.now() - startTime) / 1000) });
});

export default router;
