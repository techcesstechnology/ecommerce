import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../shared/schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Always use SSL for Neon database (even in development)
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : 
        process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased to 10 seconds for Neon
});

export const db = drizzle(pool, { schema });

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

export async function checkDatabaseHealth(): Promise<boolean> {
  return testDatabaseConnection();
}

export async function closeDatabaseConnection(): Promise<void> {
  await pool.end();
}

export { schema };
