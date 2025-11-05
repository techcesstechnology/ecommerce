# Database Setup Guide

This guide explains how to set up and manage the PostgreSQL database with TypeORM for the FreshRoute backend.

## Prerequisites

- PostgreSQL 12 or higher installed
- Node.js 18 or higher
- npm or yarn package manager

## Installation

1. Install PostgreSQL on your system:
   - **macOS**: `brew install postgresql@14`
   - **Ubuntu/Debian**: `sudo apt-get install postgresql`
   - **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/)

2. Start PostgreSQL service:
   - **macOS**: `brew services start postgresql@14`
   - **Ubuntu/Debian**: `sudo service postgresql start`
   - **Windows**: Start via Services app

## Database Configuration

1. Create a PostgreSQL database:
   ```bash
   createdb freshroute_db
   ```

2. Create a database user (optional):
   ```bash
   psql -d postgres
   CREATE USER freshroute_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE freshroute_db TO freshroute_user;
   ```

3. Configure environment variables in `backend/.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=freshroute_db
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   DB_SYNC=false
   ```

   **Important**: Set `DB_SYNC=false` in production to prevent automatic schema synchronization.

## Running Migrations

### Run all pending migrations:
```bash
cd backend
npm run migration:run
```

### Revert the last migration:
```bash
npm run migration:revert
```

### Generate a new migration (after entity changes):
```bash
npm run migration:generate -- src/migrations/YourMigrationName
```

### Create an empty migration:
```bash
npm run migration:create -- src/migrations/YourMigrationName
```

## Seeding the Database

To populate the database with initial test data:

```bash
cd backend
npm run seed
```

This will create:
- 3 test users (admin, vendor, customer)
- 5 product categories
- 10 sample products across different categories

**Note**: The seed script clears existing data before seeding. Use with caution in production!

## Database Entities

The following entities are defined:

### 1. User
- User accounts with roles (customer, admin, vendor)
- Email-based authentication
- Activity tracking

### 2. Category
- Product categories with slug-based URLs
- Hierarchical organization support
- Active/inactive status

### 3. Product
- Product catalog with SKU management
- Inventory tracking
- Category relationships
- Multiple images support
- Pricing and stock management

### 4. Order
- Order management with unique order numbers
- JSON-based order items storage
- Status tracking (pending → confirmed → processing → shipped → delivered)
- Payment status tracking
- Shipping address storage

### 5. AuditLog
- Comprehensive audit trail
- User action tracking
- Resource-level logging
- IP address and user agent capture

## Connection Pooling

The database is configured with the following connection pool settings:

- **Minimum connections**: 2
- **Maximum connections**: 10
- **Idle timeout**: 30 seconds
- **Connection timeout**: 2 seconds

## Database Features

### Indexes
All entities include optimized indexes for:
- Primary keys (UUID)
- Foreign keys
- Frequently queried fields
- Unique constraints

### Timestamps
All entities automatically track:
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp (except AuditLog)

### Data Types
- UUIDs for all primary keys
- JSONB for flexible metadata and nested objects
- INET for IP addresses
- Proper decimal precision for monetary values

## Development vs Production

### Development
- Set `DB_SYNC=true` to auto-sync schema changes (convenient but risky)
- Enable verbose logging
- Use local PostgreSQL instance

### Production
- **Always** set `DB_SYNC=false`
- Use migrations for schema changes
- Enable SSL connections
- Use connection pooling
- Implement proper backup strategies
- Monitor database performance

## Troubleshooting

### Connection Issues
1. Verify PostgreSQL is running: `pg_isready`
2. Check connection parameters in `.env`
3. Ensure database exists: `psql -l`
4. Check PostgreSQL logs

### Migration Issues
1. Check migration table: `SELECT * FROM migrations;`
2. Ensure migrations folder exists
3. Verify TypeScript compilation
4. Check for conflicting schema changes

### Performance
1. Monitor slow queries using PostgreSQL logs
2. Add indexes for frequently queried fields
3. Use query builder for complex queries
4. Implement pagination for large result sets

## Services

Each entity has a corresponding service class providing:
- CRUD operations
- Query builders for complex filters
- Transaction support
- Error handling
- Repository pattern implementation

Example usage:
```typescript
import { productService } from './services/product.service';

// Get all active products
const { products, total } = await productService.getProducts({
  isActive: true,
  page: 1,
  limit: 20
});

// Create a new product
const product = await productService.createProduct({
  name: 'Fresh Tomatoes',
  sku: 'TOM-001',
  price: 2.50,
  categoryId: 'category-uuid',
  stockQuantity: 100
});
```

## Health Check

The health check endpoint (`/api/health`) includes database connectivity status:

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-11-05T10:00:00.000Z",
  "database": "connected"
}
```

## Backup and Restore

### Backup
```bash
pg_dump -U postgres freshroute_db > backup.sql
```

### Restore
```bash
psql -U postgres freshroute_db < backup.sql
```

## Additional Resources

- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Design Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)
