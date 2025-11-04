# Backend - FreshRoute API

Node.js/Express.js API server for the FreshRoute e-commerce platform.

## Features

- RESTful API endpoints
- TypeScript for type safety
- PostgreSQL database with TypeORM
- Redis for caching
- JWT authentication with access and refresh tokens
- Rate limiting for authentication endpoints
- Security with Helmet
- CORS support
- Request compression
- Logging with Morgan

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 13
- Redis (optional, for caching)

### Installation

```bash
cd backend
npm install
```

### Database Setup

1. **Install PostgreSQL** (if not already installed)
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   
   # macOS
   brew install postgresql
   ```

2. **Create Database**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE freshroute_db;
   
   # Create test database (optional)
   CREATE DATABASE freshroute_test_db;
   
   # Exit psql
   \q
   ```

3. **Configure Environment Variables**
   
   Copy the root `.env.example` to `.env` in the project root and configure your database settings:
   
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=freshroute_db
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   
   # JWT Configuration
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRES_IN=7d
   
   # Rate Limiting Configuration (Optional - defaults provided)
   RATE_LIMIT_LOGIN_MAX=5
   RATE_LIMIT_LOGIN_WINDOW=900000  # 15 minutes
   RATE_LIMIT_REGISTER_MAX=3
   RATE_LIMIT_REGISTER_WINDOW=3600000  # 1 hour
   RATE_LIMIT_GENERAL_MAX=100
   RATE_LIMIT_GENERAL_WINDOW=900000  # 15 minutes
   ```

4. **Run Database Migrations**
   
   The application uses TypeORM with automatic synchronization in development mode. The database schema will be created automatically when you start the server in development mode.
   
   For production, you should run migrations manually:
   ```bash
   npm run migration:run
   ```

### Development

```bash
npm run dev
```

The server will start on `http://localhost:5000` and automatically connect to the PostgreSQL database.

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Health Check

- `GET /api/health` - Basic health check
- `GET /api/health/ready` - Readiness check with dependencies

### Authentication

All authentication endpoints have rate limiting applied for security.

- `POST /api/auth/register` - Register a new user
  - Rate limit: 3 requests per hour
  - Body: `{ email, password, firstName, lastName, phone?, role? }`
  
- `POST /api/auth/login` - Login user
  - Rate limit: 5 requests per 15 minutes
  - Body: `{ email, password }`
  
- `POST /api/auth/refresh` - Refresh access token
  - Rate limit: 100 requests per 15 minutes
  - Body: `{ refreshToken }`
  
- `POST /api/auth/logout` - Logout user (requires authentication)
  - Rate limit: 100 requests per 15 minutes
  - Headers: `Authorization: Bearer <access_token>`
  
- `GET /api/auth/me` - Get current user profile (requires authentication)
  - Rate limit: 100 requests per 15 minutes
  - Headers: `Authorization: Bearer <access_token>`

### Root

- `GET /` - API information

## Rate Limiting

The API implements IP-based rate limiting for enhanced security:

- **Login endpoint**: 5 attempts per 15 minutes
- **Registration endpoint**: 3 attempts per hour
- **General API endpoints**: 100 requests per 15 minutes

Rate limit information is included in response headers:
- `RateLimit-Limit`: Maximum number of requests allowed
- `RateLimit-Remaining`: Number of requests remaining
- `RateLimit-Reset`: Time when the rate limit resets

## Database Schema

### Users Table

| Column        | Type      | Description                    |
|---------------|-----------|--------------------------------|
| id            | UUID      | Primary key                    |
| email         | VARCHAR   | Unique user email              |
| password      | VARCHAR   | Hashed password (bcrypt)       |
| first_name    | VARCHAR   | User's first name              |
| last_name     | VARCHAR   | User's last name               |
| phone         | VARCHAR   | Phone number (optional)        |
| role          | ENUM      | User role (CUSTOMER, VENDOR, ADMIN, SUPER_ADMIN) |
| refresh_token | TEXT      | Hashed refresh token           |
| created_at    | TIMESTAMP | Creation timestamp             |
| updated_at    | TIMESTAMP | Last update timestamp          |

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── index.ts      # Main config
│   │   ├── database.config.ts  # Database connection
│   │   └── jwt.config.ts # JWT configuration
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware
│   │   ├── auth.middleware.ts  # JWT authentication
│   │   └── rate-limit.middleware.ts  # Rate limiting
│   ├── models/           # TypeORM entities
│   │   └── user.model.ts # User entity
│   ├── migrations/       # Database migrations
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── validators/       # Input validation
│   └── server.ts         # Application entry point
└── package.json
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Linting

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix
```

## Security Considerations

- Passwords are hashed using bcrypt with 10 salt rounds
- JWT tokens are used for authentication (access + refresh tokens)
- Rate limiting prevents brute force attacks
- Helmet provides security headers
- CORS is configured for allowed origins
- SQL injection protection via TypeORM parameterized queries
- Refresh tokens are stored hashed in the database

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Verify PostgreSQL is running:
   ```bash
   # Check status
   sudo service postgresql status
   
   # Start if not running
   sudo service postgresql start
   ```

2. Verify database credentials in `.env` file

3. Check if database exists:
   ```bash
   psql -U postgres -l
   ```

### TypeORM Decorator Errors

If you see errors related to decorators, ensure your `tsconfig.json` has:
```json
{
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true,
  "strictPropertyInitialization": false
}
```
