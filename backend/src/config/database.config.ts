/**
 * Database Configuration
 *
 * TypeORM configuration for PostgreSQL connection
 * Handles database connection, connection pooling, and error handling
 */

import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../models/user.model';
import { config } from './index';

/**
 * TypeORM DataSource configuration
 */
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.user,
  password: config.database.password,
  database: config.database.name,
  synchronize: config.env === 'development', // Auto-sync schema in development only
  logging: config.env === 'development', // Enable logging in development
  entities: [User],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: [],
  // Connection pool configuration
  extra: {
    max: 10, // Maximum number of connections in the pool
    min: 2, // Minimum number of connections in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
  },
};

/**
 * TypeORM DataSource instance
 */
export const AppDataSource = new DataSource(dataSourceOptions);

/**
 * Initialize database connection
 * @returns Promise that resolves when connection is established
 * @throws Error if connection fails
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection established successfully');
      console.log(
        `📊 Connected to ${config.database.name} at ${config.database.host}:${config.database.port}`
      );
    }
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    throw new Error(
      `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

/**
 * Close database connection
 * @returns Promise that resolves when connection is closed
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Database connection closed successfully');
    }
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
};

/**
 * Check database connection health
 * @returns Promise that resolves to true if connection is healthy
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    if (!AppDataSource.isInitialized) {
      return false;
    }
    // Run a simple query to check connection
    await AppDataSource.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
};

export default AppDataSource;
