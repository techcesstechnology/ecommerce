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

Copy the root `.env.example` to `.env` and configure your settings.

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

### Health Check

- `GET /api/health` - Basic health check
- `GET /api/health/ready` - Readiness check with dependencies

### Root

- `GET /` - API information

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── server.ts       # Application entry point
└── package.json
```

## Testing

```bash
npm test
```

## Linting

```bash
npm run lint
npm run lint:fix
```
