import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { redisClient } from './utils/redis';
import { wsService } from './utils/websocket';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

class Server {
  private app: Application;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security
    this.app.use(helmet());
    this.app.use(cors({
      origin: config.app.frontendUrl,
      credentials: true,
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
    });
    this.app.use('/api/', limiter);

    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Compression
    this.app.use(compression());
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (_req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // API routes
    this.app.use(routes);
  }

  private setupErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  async start(): Promise<void> {
    try {
      // Connect to Redis
      await redisClient.connect();
      console.log('Connected to Redis');

      // Initialize WebSocket
      wsService.initialize();

      // Start HTTP server
      this.app.listen(config.port, () => {
        console.log(`Server running on port ${config.port}`);
        console.log(`Environment: ${config.nodeEnv}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    await redisClient.disconnect();
    wsService.close();
  }
}

const server = new Server();

// Start server
server.start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await server.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await server.stop();
  process.exit(0);
});

export default server;
