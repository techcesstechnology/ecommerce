# FreshRoute API Documentation

> Complete API reference for the FreshRoute e-commerce platform backend services.

## Base URL

```
Development: http://localhost:5000/api
Production: https://api.freshroute.zw/api
```

## Table of Contents

- [Authentication](#authentication)
- [Health & Status Endpoints](#health--status-endpoints)
- [Error Handling](#error-handling)
- [Response Format](#response-format)
- [Rate Limiting](#rate-limiting)

---

## Authentication

FreshRoute API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Authentication Flow

1. User registers or logs in
2. API returns a JWT token
3. Client includes token in subsequent requests
4. Token expires after 7 days (configurable)

---

## Health & Status Endpoints

### Get API Status

Returns basic information about the API.

**Endpoint:** `GET /`

**Authentication:** Not required

**Request:**

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

---

### Health Check

Provides basic health status of the API service.

**Endpoint:** `GET /api/health`

**Authentication:** Not required

**Request:**

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

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| status | string | Current health status (`ok` or `error`) |
| timestamp | string | ISO 8601 timestamp of the check |
| uptime | number | Server uptime in seconds |
| environment | string | Current environment (`development`, `production`, etc.) |
| version | string | API version |

---

### Readiness Check

Checks if the API and its dependencies are ready to accept requests.

**Endpoint:** `GET /api/health/ready`

**Authentication:** Not required

**Request:**

```bash
curl -X GET http://localhost:5000/api/health/ready
```

**Response (Ready):** `200 OK`

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

**Response (Not Ready):** `503 Service Unavailable`

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

**Check Status Values:**
- `ok` - Service is connected and working
- `not_configured` - Service is not yet configured (accepted as ready)
- `error` - Service is configured but not responding

---

## Error Handling

The API uses standard HTTP status codes and returns error details in a consistent format.

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### Error Response Format

All errors return a JSON response with the following structure:

```json
{
  "error": "Error Type",
  "message": "Human-readable error description"
}
```

**Example - Not Found Error:**

```json
{
  "error": "Not Found",
  "message": "The requested resource was not found"
}
```

**Example - Validation Error:**

```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

## Response Format

### Standard Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Rate Limiting

To ensure fair usage and prevent abuse, the API implements rate limiting:

- **Anonymous requests:** 100 requests per 15 minutes
- **Authenticated requests:** 1000 requests per 15 minutes

When rate limit is exceeded, the API returns:

**Response:** `429 Too Many Requests`

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 300
}
```

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1730716563
```

---

## Future Endpoints (Coming Soon)

The following endpoint categories are planned for implementation:

### User Management
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User authentication
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/logout` - User logout

### Products
- `GET /api/products` - List products with filtering and pagination
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create new product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get category details
- `POST /api/categories` - Create category (Admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove cart item
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - List user's orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `GET /api/payments/:id/status` - Check payment status
- `POST /api/payments/webhook` - Payment gateway webhook

### Search
- `GET /api/search` - Search products
- `GET /api/search/suggestions` - Get search suggestions

---

## API Versioning

The current API version is `v1` and is included in the base URL. Future versions will be released as:

```
/api/v2/...
```

Breaking changes will always result in a new API version, while backward-compatible changes will be added to the existing version.

---

## Support & Contact

For API support and questions:
- **Email:** api-support@freshroute.zw
- **GitHub Issues:** [https://github.com/edmundtafadzwa-commits/freshroute/issues](https://github.com/edmundtafadzwa-commits/freshroute/issues)
- **Documentation:** [https://docs.freshroute.zw](https://docs.freshroute.zw)

---

*Last Updated: November 2024*
