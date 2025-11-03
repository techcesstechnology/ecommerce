import { Router } from 'express';
import { healthCheck, readinessCheck } from '../controllers/health.controller';

const router = Router();

// Health check endpoint
router.get('/', healthCheck);

// Readiness check endpoint
router.get('/ready', readinessCheck);

export default router;
