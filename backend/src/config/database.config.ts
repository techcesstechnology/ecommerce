import { DataSource } from 'typeorm';
import path from 'path';
import { getConfig } from './config.service';

// Get configuration service instance
const config = getConfig();
const dbConfig = config.getDatabaseConfig();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.name,

  // Connection pool configuration
  extra: {
    min: dbConfig.poolMin,
    max: dbConfig.poolMax,
    idleTimeoutMillis: dbConfig.idleTimeout,
    connectionTimeoutMillis: dbConfig.connectionTimeout,
  },

  // Entities configuration
  entities: [path.join(__dirname, '../models/*.entity{.ts,.js}')],

  // Migrations configuration
  migrations: [path.join(__dirname, '../migrations/*{.ts,.js}')],

  // Migration table name
  migrationsTableName: 'migrations',

  // IMPORTANT: Set synchronize to false to prevent TypeORM from modifying the schema
  // The schema is managed by Drizzle, TypeORM just reads the existing tables
  synchronize: false,

  // Logging configuration
  logging: dbConfig.logging ? ['error', 'warn', 'schema'] : ['error'],

  // Enable SSL for production databases
  ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
});

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
