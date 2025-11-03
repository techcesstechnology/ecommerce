# API Usage Examples

## Authentication

First, obtain a JWT token (implementation depends on your auth system):

```bash
# Example token for testing
export TOKEN="your-jwt-token-here"
```

## Create a Category

```bash
curl -X POST http://localhost:3000/api/products/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electronics",
    "description": "Electronic devices and accessories"
  }'
```

## Create a Product

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Headphones",
    "description": "High-quality wireless headphones with noise cancellation",
    "category": "Electronics",
    "prices": [
      {"currency": "USD", "amount": 99.99},
      {"currency": "ZWL", "amount": 32499.67}
    ],
    "stock": 50,
    "tags": ["audio", "wireless", "headphones"]
  }'
```

## List Products

```bash
# Get all products
curl http://localhost:3000/api/products

# Filter by category
curl "http://localhost:3000/api/products?category=Electronics"

# Filter by price range (USD)
curl "http://localhost:3000/api/products?minPrice=50&maxPrice=150&currency=USD"

# Pagination
curl "http://localhost:3000/api/products?page=1&limit=20"
```

## Search Products

```bash
curl "http://localhost:3000/api/products/search?q=wireless+headphones"
```

## Get Product by ID

```bash
curl http://localhost:3000/api/products/507f1f77bcf86cd799439011
```

## Update a Product

```bash
curl -X PUT http://localhost:3000/api/products/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stock": 45,
    "prices": [
      {"currency": "USD", "amount": 89.99},
      {"currency": "ZWL", "amount": 29249.67}
    ]
  }'
```

## Upload Product Images

```bash
curl -X POST http://localhost:3000/api/products/507f1f77bcf86cd799439011/images \
  -H "Authorization: Bearer $TOKEN" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

## Archive a Product

```bash
curl -X DELETE http://localhost:3000/api/products/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer $TOKEN"
```

## List Categories

```bash
# Get all categories
curl http://localhost:3000/api/products/categories

# Get categories with subcategories
curl "http://localhost:3000/api/products/categories?subcategories=true"
```

## Advanced Filtering

```bash
# Combine multiple filters
curl "http://localhost:3000/api/products?category=Electronics&minPrice=50&maxPrice=200&status=ACTIVE&page=1&limit=10"

# Search with pagination
curl "http://localhost:3000/api/products/search?q=laptop&page=1&limit=20"
```

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": { /* response data */ },
  "pagination": { /* pagination info (for list endpoints) */ }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error message"
}
```

## Rate Limiting & Caching

- Popular searches are cached in Redis for 5 minutes
- Product lists are cached for 2 minutes
- Category lists are cached for 10 minutes
- Cache is automatically invalidated on updates

## Testing with Swagger

Interactive API documentation is available at:
```
http://localhost:3000/api/docs
```
