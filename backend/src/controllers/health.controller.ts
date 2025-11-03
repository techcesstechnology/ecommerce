import { Request, Response } from 'express';

export const healthCheck = (_req: Request, res: Response): void => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  };

  res.status(200).json(healthData);
};

export const readinessCheck = async (_req: Request, res: Response): Promise<void> => {
  // TODO: Add actual database and redis connectivity checks
  const checks = {
    database: 'not_configured',
    redis: 'not_configured',
  };

  const allHealthy = Object.values(checks).every(
    (status) => status === 'ok' || status === 'not_configured'
  );

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ready' : 'not_ready',
    timestamp: new Date().toISOString(),
    checks,
  });
};
