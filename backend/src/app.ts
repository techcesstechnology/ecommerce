import express, { Application } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import { database } from './config/database.config';
import { swaggerSpec } from './config/swagger.config';
import productRoutes from './routes/product.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Load environment variables
dotenv.config();

class App {
  public app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000');
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // CORS - restrictive by default
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : ['http://localhost:3000', 'http://localhost:3001'];

    this.app.use(cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true
    }));

    // Body parser
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Static files
    this.app.use('/uploads', express.static('uploads'));

    // Health check
    this.app.get('/health', (_req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString()
      });
    });
  }

  private initializeRoutes(): void {
    const apiPrefix = process.env.API_PREFIX || '/api';

    // Swagger documentation
    this.app.use(
      `${apiPrefix}/docs`,
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }'
      })
    );

    // Product routes
    this.app.use(`${apiPrefix}/products`, productRoutes);

    // API info
    this.app.get(apiPrefix, (_req, res) => {
      res.json({
        name: 'FreshRoute Product Management API',
        version: '1.0.0',
        documentation: `${apiPrefix}/docs`
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await database.connect();

      // Start server
      this.app.listen(this.port, () => {
        console.log(`Server is running on port ${this.port}`);
        console.log(`API Documentation: http://localhost:${this.port}/api/docs`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    try {
      await database.disconnect();
      console.log('Server stopped');
    } catch (error) {
      console.error('Error stopping server:', error);
    }
  }
}

export default App;
