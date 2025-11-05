import { DataSource, DataSourceOptions } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'freshroute_db',

  // Connection pool configuration
  extra: {
    min: 2, // Minimum connections in pool
    max: 10, // Maximum connections in pool
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 2000, // Wait 2 seconds for connection
  },

  // Entities configuration
  entities: [path.join(__dirname, '../models/*.entity{.ts,.js}')],

  // Migrations configuration
  migrations: [path.join(__dirname, '../migrations/*{.ts,.js}')],

  // Migration table name
  migrationsTableName: 'migrations',

  // Synchronize schema in development only (not recommended for production)
  synchronize: process.env.NODE_ENV === 'development' && process.env.DB_SYNC === 'true',

  // Logging configuration
  logging: process.env.NODE_ENV === 'development' ? ['error', 'warn', 'schema'] : ['error'],

  // Enable SSL for production databases
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

// Create and export the data source
export const AppDataSource = new DataSource(dataSourceOptions);

/**
 * Initialize database connection
 */
export async function initializeDatabase(): Promise<DataSource> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection established successfully');
    }
    return AppDataSource;
  } catch (error) {
    console.error('❌ Error during database connection:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Database connection closed successfully');
    }
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
}

/**
 * Check database connection health
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    if (!AppDataSource.isInitialized) {
      return false;
    }
    await AppDataSource.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
}
