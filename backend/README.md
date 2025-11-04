# Backend - FreshRoute API

Node.js/Express.js API server for the FreshRoute e-commerce platform.

## Features

- RESTful API endpoints
- TypeScript for type safety
- PostgreSQL database integration
- Redis for caching
- JWT authentication (to be implemented)
- Security with Helmet
- CORS support
- Request compression
- Logging with Morgan

## Getting Started

### Installation

```bash
cd backend
npm install
```

### Environment Variables

The backend requires several environment variables. Copy the root `.env.example` to `.env` and configure:

```env
# Application Environment
NODE_ENV=development

# Backend Configuration
BACKEND_PORT=5000
BACKEND_HOST=localhost

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=freshroute_db
DB_USER=postgres
DB_PASSWORD=your_password_here

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:19006
```

**Required Variables:**
- `BACKEND_PORT` - Port the server listens on
- `JWT_SECRET` - Secret key for signing JWT tokens

**Optional Variables:**
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - PostgreSQL connection
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` - Redis connection
- `CORS_ORIGIN` - Comma-separated list of allowed origins

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

## API Endpoints

For complete API documentation with request/response examples, see [API_DOCUMENTATION.md](../API_DOCUMENTATION.md).

### Health Check

**GET /api/health** - Basic health check

Returns the current health status of the API server.

```bash
curl -X GET http://localhost:5000/api/health
```

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2025-11-04T10:16:03.177Z",
  "uptime": 12345.678,
  "environment": "development",
  "version": "1.0.0"
}
```

---

**GET /api/health/ready** - Readiness check with dependencies

Checks if the API and all its dependencies (database, redis) are ready to accept requests.

```bash
curl -X GET http://localhost:5000/api/health/ready
```

**Response:** `200 OK` (when ready)
```json
{
  "status": "ready",
  "timestamp": "2025-11-04T10:16:03.177Z",
  "checks": {
    "database": "not_configured",
    "redis": "not_configured"
  }
}
```

**Response:** `503 Service Unavailable` (when not ready)
```json
{
  "status": "not_ready",
  "timestamp": "2025-11-04T10:16:03.177Z",
  "checks": {
    "database": "error",
    "redis": "ok"
  }
}
```

### Root

**GET /** - API information

Returns basic information about the API and available endpoints.

```bash
curl -X GET http://localhost:5000/
```

**Response:** `200 OK`
```json
{
  "message": "Welcome to FreshRoute API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/api/health"
  }
}
```

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files (database, redis, etc.)
│   ├── controllers/    # Request handlers (business logic endpoints)
│   │   └── health.controller.ts
│   ├── middleware/     # Custom middleware (auth, validation, error handling)
│   ├── models/         # Database models (TypeORM/Sequelize entities)
│   ├── routes/         # API route definitions
│   │   └── health.routes.ts
│   ├── services/       # Business logic layer
│   ├── utils/          # Utility functions (helpers, formatters)
│   └── server.ts       # Application entry point & Express setup
├── tests/              # Test files (unit & integration tests)
├── jest.config.js      # Jest test configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies and scripts
```

### Architecture

The backend follows a layered architecture:

1. **Routes** - Define API endpoints and map them to controllers
2. **Controllers** - Handle HTTP requests/responses, call services
3. **Services** - Implement business logic, interact with models
4. **Models** - Define data structures and database interactions
5. **Middleware** - Process requests before they reach controllers (auth, validation, etc.)
6. **Utils** - Reusable helper functions

### Key Technologies

- **Express.js** - Fast, unopinionated web framework
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Relational database (via `pg` driver)
- **Redis** - In-memory cache for sessions and data
- **Helmet** - Security middleware (sets HTTP headers)
- **CORS** - Cross-Origin Resource Sharing configuration
- **Morgan** - HTTP request logger
- **Compression** - Response compression middleware
- **Jest** - Testing framework

## Testing

```bash
npm test
```

## Linting

```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Auto-fix linting errors
```

## Deployment

### Production Build

1. **Build the TypeScript code:**
   ```bash
   npm run build
   ```
   This compiles TypeScript to JavaScript in the `dist/` directory.

2. **Set environment variables:**
   ```bash
   export NODE_ENV=production
   export BACKEND_PORT=5000
   # Set other required variables
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

### Deployment Platforms

The backend can be deployed to various platforms:

#### Heroku
```bash
# Add Heroku remote
heroku git:remote -a your-app-name

# Push to Heroku
git push heroku main

# Set environment variables
heroku config:set BACKEND_PORT=5000
heroku config:set JWT_SECRET=your_secret
```

#### DigitalOcean App Platform
- Connect your GitHub repository
- Set environment variables in the dashboard
- Configure build and run commands:
  - Build: `cd backend && npm install && npm run build`
  - Run: `cd backend && npm start`

#### AWS EC2
- Install Node.js on your EC2 instance
- Clone the repository
- Install dependencies: `npm install`
- Build: `npm run build`
- Use PM2 for process management:
  ```bash
  npm install -g pm2
  pm2 start dist/server.js --name freshroute-api
  pm2 save
  pm2 startup
  ```

#### Docker
Create a `Dockerfile` in the backend directory:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

Build and run:
```bash
docker build -t freshroute-backend .
docker run -p 5000:5000 --env-file .env freshroute-backend
```

## Security

The backend implements several security measures:

- **Helmet.js** - Sets secure HTTP headers
- **CORS** - Controlled cross-origin resource sharing
- **JWT** - Token-based authentication (to be implemented)
- **Environment Variables** - Sensitive data stored in environment variables, not code
- **Request Validation** - Input validation to prevent injection attacks
- **Rate Limiting** - Planned to prevent abuse
- **HTTPS** - SSL/TLS encryption in production

### Security Best Practices

1. Never commit `.env` files to version control
2. Use strong, unique JWT secrets in production
3. Keep dependencies updated: `npm audit` and `npm update`
4. Enable HTTPS in production
5. Implement rate limiting for public endpoints
6. Validate and sanitize all user inputs
7. Use parameterized queries to prevent SQL injection

## Performance

### Optimization Features

- **Compression** - Gzip compression for responses
- **Connection Pooling** - PostgreSQL connection pooling
- **Redis Caching** - Cache frequently accessed data
- **Async/Await** - Non-blocking I/O operations

### Monitoring

For production, consider implementing:
- **Logging** - Winston or Bunyan for structured logging
- **APM** - Application Performance Monitoring (New Relic, DataDog)
- **Health Checks** - Use `/api/health` and `/api/health/ready` endpoints
- **Metrics** - Prometheus metrics for Grafana dashboards
