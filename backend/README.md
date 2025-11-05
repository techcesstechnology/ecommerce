# Backend - FreshRoute API

Node.js/Express.js API server for the FreshRoute e-commerce platform with PostgreSQL and TypeORM integration.

## Features

- RESTful API endpoints
- TypeScript for type safety
- **PostgreSQL database with TypeORM ORM**
- **Database migrations and seeding**
- **Comprehensive entity models (Users, Products, Categories, Orders, Audit Logs)**
- Redis for caching
- JWT authentication (to be implemented)
- Security with Helmet
- CORS support
- Request compression
- Logging with Morgan

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 12 or higher
- npm or yarn

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Create a `.env` file in the backend directory (or use root `.env`):

```env
# Application
NODE_ENV=development
BACKEND_PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=freshroute_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_SYNC=false  # Set to true only in development for auto-sync

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:19006
```

### Database Setup

1. Create PostgreSQL database:
   ```bash
   createdb freshroute_db
   ```

2. Run migrations:
   ```bash
   npm run migration:run
   ```

3. (Optional) Seed with sample data:
   ```bash
   npm run seed
   ```

For detailed database setup instructions, see [DATABASE_SETUP.md](./DATABASE_SETUP.md)

### Development

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

## Database

### Entities

- **User**: User accounts with roles (customer, admin, vendor)
- **Category**: Product categories with hierarchical support
- **Product**: Product catalog with inventory management
- **Order**: Order management with status tracking
- **AuditLog**: Comprehensive audit trail for all actions

### Services

Each entity has a corresponding service class providing:
- Repository pattern implementation
- CRUD operations
- Complex query builders
- Error handling
- Transaction support

Example usage:
```typescript
import { productService } from './services/product.service';

// Get paginated products
const { products, total } = await productService.getProducts({
  isActive: true,
  categoryId: 'some-uuid',
  page: 1,
  limit: 20
});
```

### Migrations

```bash
# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Generate migration from entity changes
npm run migration:generate -- src/migrations/MigrationName

# Create empty migration
npm run migration:create -- src/migrations/MigrationName
```

## API Endpoints

### Health Check

- `GET /api/health` - Health check with database connectivity status

### Root

- `GET /` - API information

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.config.ts   # TypeORM configuration
│   │   └── data-source.ts       # TypeORM CLI data source
│   ├── migrations/      # Database migrations
│   ├── models/          # TypeORM entities
│   │   ├── user.entity.ts
│   │   ├── category.entity.ts
│   │   ├── product.entity.ts
│   │   ├── order.entity.ts
│   │   └── audit-log.entity.ts
│   ├── routes/          # API routes
│   ├── seeds/           # Database seed scripts
│   ├── services/        # Business logic & repositories
│   │   ├── user.service.ts
│   │   ├── category.service.ts
│   │   ├── product.service.ts
│   │   ├── order.service.ts
│   │   └── audit.service.ts
│   └── server.ts        # Application entry point
├── DATABASE_SETUP.md    # Detailed database documentation
└── package.json
```

## Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Linting

```bash
npm run lint
npm run lint:fix
```

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run lint` | Check code style |
| `npm run lint:fix` | Fix code style issues |
| `npm run migration:run` | Run pending migrations |
| `npm run migration:revert` | Revert last migration |
| `npm run migration:generate` | Generate migration from entities |
| `npm run seed` | Seed database with sample data |

## Database Connection Pooling

Connection pooling is configured with:
- Min connections: 2
- Max connections: 10
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds

## Security Features

- Helmet for security headers
- CORS configuration
- Environment variable protection
- SQL injection prevention (TypeORM parameterized queries)
- Input validation (to be enhanced)

## Performance Optimizations

- Database connection pooling
- Indexed database queries
- Response compression
- Efficient query builders
- Lazy loading of relations

## Future Enhancements

- [ ] JWT authentication implementation
- [ ] API rate limiting
- [ ] Advanced caching with Redis
- [ ] File upload handling
- [ ] Email notifications
- [ ] Payment gateway integration
- [ ] WebSocket support for real-time updates

## Documentation

- [Database Setup Guide](./DATABASE_SETUP.md) - Detailed database configuration and management
- [API Documentation](../API_DOCUMENTATION.md) - API endpoints and examples (to be created)

## Contributing

1. Follow TypeScript best practices
2. Write tests for new features
3. Run linter before committing
4. Follow conventional commit messages
5. Document API changes

## License

MIT
