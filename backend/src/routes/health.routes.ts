import { Router, Request, Response } from 'express';
import { checkDatabaseHealth } from '../config/database.config';

const router = Router();

// Basic health check
router.get('/', async (_req: Request, res: Response) => {
  const dbHealth = await checkDatabaseHealth();

  res.status(dbHealth ? 200 : 503).json({
    status: dbHealth ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    database: dbHealth ? 'connected' : 'disconnected',
  });
});

export default router;
