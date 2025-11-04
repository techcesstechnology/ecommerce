import { Router, Request, Response } from 'express';

const router = Router();

// Basic health check
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
