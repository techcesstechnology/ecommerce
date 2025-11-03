# FreshRoute Backend - Product Management System

E-commerce product management system with comprehensive features including multi-currency pricing, product variants, image handling, and search functionality.

## Features

- **Product CRUD Operations**: Create, read, update, and archive products
- **Multi-Currency Support**: USD and ZWL pricing
- **Product Categories**: Hierarchical category structure with subcategories
- **Product Variants**: Support for multiple variants (size, color, etc.)
- **Image Management**: Multiple image uploads with thumbnail generation
- **Search & Filtering**: Full-text search with advanced filtering
- **Redis Caching**: Performance optimization for popular searches
- **API Documentation**: Interactive Swagger documentation

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **Image Processing**: Sharp
- **Validation**: Joi
- **Testing**: Jest with Supertest
- **API Documentation**: Swagger (OpenAPI 3.0)

## Prerequisites

- Node.js 16+ 
- MongoDB 5+
- Redis 6+

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/freshroute
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Linting

Run linter:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

## API Documentation

Once the server is running, access the interactive API documentation at:
```
http://localhost:3000/api/docs
```

## API Endpoints

### Public Endpoints

- `GET /api/products` - List products with filtering
- `GET /api/products/:id` - Get product details
- `GET /api/products/search` - Search products
- `GET /api/products/categories` - List categories

### Protected Endpoints (ADMIN/MANAGER)

- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Archive product
- `POST /api/products/:id/images` - Upload product images
- `POST /api/products/categories` - Create category

## Project Structure

```
backend/
├── src/
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── validators/       # Input validation
│   ├── middleware/       # Custom middleware
│   ├── types/            # TypeScript types
│   ├── config/           # Configuration files
│   ├── tests/            # Test files
│   ├── app.ts            # Express application
│   └── index.ts          # Entry point
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Authentication

Protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Users must have ADMIN or MANAGER role to access protected endpoints.

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation as needed
4. Run linter before committing

## License

MIT
