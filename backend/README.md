# FreshRoute Backend API

Backend API service for the FreshRoute e-commerce platform built with Express.js and Node.js.

## Features

- RESTful API architecture
- Express.js framework
- Security middleware (Helmet, CORS, Rate Limiting)
- Environment-based configuration
- Error handling and logging
- MongoDB integration ready
- JWT authentication ready
- Request validation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (optional, for database)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` file with your configuration

### Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### Testing

Run tests:
```bash
npm test
```

### Linting

Run linter:
```bash
npm run lint
```

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
│   └── app.js          # Express app setup
├── .env.example        # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### API Info
- `GET /api` - API information

## Security

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Request size limits
- Environment-based security settings

## Environment Variables

See `.env.example` for all available configuration options.

## License

ISC
