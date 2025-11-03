import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import driverRoutes from './routes/driver.routes';
import deliveryRoutes from './routes/delivery.routes';
import { LocationHandler } from './websocket/location.handler';

// Load environment variables
dotenv.config();

const app: Application = express();
const server = http.createServer(app);

// Configure CORS based on environment - in production, MUST specify ALLOWED_ORIGINS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : (process.env.NODE_ENV === 'production' 
      ? [] // Empty array in production if ALLOWED_ORIGINS not set (will reject all)
      : ['http://localhost:3000', 'http://localhost:3001']); // Development defaults

// CORS origin checker function
const corsOriginChecker = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  // Allow requests with no origin (like mobile apps or Postman)
  if (!origin) {
    return callback(null, true);
  }
  
  // In development, allow all origins
  if (process.env.NODE_ENV !== 'production') {
    return callback(null, true);
  }
  
  // In production, check against whitelist
  if (allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

const io = new Server(server, {
  cors: {
    origin: corsOriginChecker,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: corsOriginChecker,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'FreshRoute Delivery Management System',
  });
});

// API Routes
app.use('/api/drivers', driverRoutes);
app.use('/api/deliveries', deliveryRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'FreshRoute Delivery Management System API',
    version: '1.0.0',
    endpoints: {
      drivers: '/api/drivers',
      deliveries: '/api/deliveries',
      health: '/health',
    },
    documentation: 'See README.md for API documentation',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, _next: unknown) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Initialize WebSocket handlers
const locationHandler = new LocationHandler(io);
locationHandler.initialize();

// Start server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 FreshRoute Delivery Management System`);
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🌐 HTTP: http://localhost:${PORT}`);
  console.log(`⚡ WebSocket: ws://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export { app, server, io };
