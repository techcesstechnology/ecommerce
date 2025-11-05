import { DataSource } from 'typeorm';
import { dataSourceOptions } from './database.config';

// Export a default data source for TypeORM CLI
export default new DataSource(dataSourceOptions);
