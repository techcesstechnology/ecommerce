/**
 * Test Database Utilities
 * Provides utilities for managing test database connections
 */

import { DataSource } from 'typeorm';
import { AppDataSource } from '../../config/database.config';

let testDataSource: DataSource | null = null;

/**
 * Initialize test database connection
 */
export async function initTestDatabase(): Promise<DataSource> {
  if (testDataSource && testDataSource.isInitialized) {
    return testDataSource;
  }

  // Use the existing AppDataSource but ensure it's initialized
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  
  testDataSource = AppDataSource;
  return testDataSource;
}

/**
 * Clean all test data from database
 */
export async function cleanDatabase(): Promise<void> {
  if (!testDataSource || !testDataSource.isInitialized) {
    return;
  }

  const entities = testDataSource.entityMetadatas;

  // Disable foreign key checks temporarily
  await testDataSource.query('SET session_replication_role = replica;');

  // Clear all tables
  for (const entity of entities) {
    const repository = testDataSource.getRepository(entity.name);
    await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
  }

  // Re-enable foreign key checks
  await testDataSource.query('SET session_replication_role = DEFAULT;');
}

/**
 * Close test database connection
 */
export async function closeTestDatabase(): Promise<void> {
  if (testDataSource && testDataSource.isInitialized) {
    await testDataSource.destroy();
    testDataSource = null;
  }
}

/**
 * Get test database connection
 */
export function getTestDataSource(): DataSource {
  if (!testDataSource || !testDataSource.isInitialized) {
    throw new Error('Test database not initialized. Call initTestDatabase() first.');
  }
  return testDataSource;
}
