# Product Management API Documentation

## Overview

This document describes the Product Management System and Admin Dashboard API endpoints for the FreshRoute e-commerce platform.

## Authentication

Currently using a simplified authentication system with the `x-admin-role: admin` header for admin operations.

**Note:** In production, implement proper JWT authentication.

## Base URL

```
http://localhost:5000/api
```

---

## Products API

### Get All Products

Get a paginated list of products with optional filters.

**Endpoint:** `GET /products`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `category` (optional): Filter by category ID
- `status` (optional): Filter by status (draft, published, archived)
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `search` (optional): Search in name, description, or SKU
- `tags` (optional): Comma-separated list of tags
- `sortBy` (optional): Field to sort by
- `sortOrder` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "perPage": 10,
    "totalPages": 10
  },
  "timestamp": "2025-11-04T11:00:00.000Z"
}
```

### Get Product by ID

**Endpoint:** `GET /products/:id`

**Response:**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Product Name",
    "description": "Product description",
    "price": 99.99,
    "comparePrice": 149.99,
    "images": ["url1", "url2"],
    "category": "category-id",
    "tags": ["tag1", "tag2"],
    "stock": 100,
    "sku": "SKU-001",
    "status": "published",
    "features": ["feature1", "feature2"],
    "specifications": {"key": "value"},
    "createdAt": "2025-11-04T11:00:00.000Z",
    "updatedAt": "2025-11-04T11:00:00.000Z"
  }
}
```

### Get Product by SKU

**Endpoint:** `GET /products/sku/:sku`

### Get Products by Category

**Endpoint:** `GET /products/category/:category`

### Get Low Stock Products

**Endpoint:** `GET /products/low-stock?threshold=10`

### Create Product (Admin Only)

**Endpoint:** `POST /products`

**Headers:**
- `x-admin-role: admin`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description (min 10 chars)",
  "price": 99.99,
  "comparePrice": 149.99,
  "category": "category-id",
  "stock": 100,
  "sku": "SKU-001",
  "status": "draft",
  "images": ["url1", "url2"],
  "tags": ["tag1", "tag2"],
  "features": ["feature1", "feature2"],
  "specifications": {"key": "value"}
}
```

**Validation Rules:**
- `name`: Required, 3-200 characters
- `description`: Required, min 10 characters
- `price`: Required, positive number
- `comparePrice`: Optional, positive number
- `category`: Required
- `stock`: Required, non-negative integer
- `sku`: Required, uppercase letters, numbers, and hyphens only
- `status`: Optional, one of: draft, published, archived

### Update Product (Admin Only)

**Endpoint:** `PUT /products/:id`

**Headers:**
- `x-admin-role: admin`

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "price": 109.99,
  "stock": 150
}
```

### Update Product Stock (Admin Only)

**Endpoint:** `PATCH /products/:id/stock`

**Headers:**
- `x-admin-role: admin`

**Request Body:**
```json
{
  "stock": 200
}
```

### Delete Product (Admin Only)

**Endpoint:** `DELETE /products/:id`

**Headers:**
- `x-admin-role: admin`

---

## Categories API

### Get All Categories

**Endpoint:** `GET /categories?status=active`

**Query Parameters:**
- `status` (optional): Filter by status (active, inactive)

### Get Category by ID

**Endpoint:** `GET /categories/:id`

### Get Category by Slug

**Endpoint:** `GET /categories/slug/:slug`

### Get Subcategories

**Endpoint:** `GET /categories/:id/subcategories`

### Get Root Categories

Get categories without a parent.

**Endpoint:** `GET /categories/root`

### Get Category Tree

Get hierarchical category structure.

**Endpoint:** `GET /categories/tree`

### Create Category (Admin Only)

**Endpoint:** `POST /categories`

**Headers:**
- `x-admin-role: admin`

**Request Body:**
```json
{
  "name": "Category Name",
  "slug": "category-slug",
  "description": "Category description",
  "parentId": "parent-category-id",
  "image": "image-url",
  "status": "active"
}
```

**Validation Rules:**
- `name`: Required, 2-100 characters
- `slug`: Optional (auto-generated from name), lowercase letters, numbers, and hyphens
- `description`: Optional, max 500 characters
- `status`: Optional, one of: active, inactive

### Update Category (Admin Only)

**Endpoint:** `PUT /categories/:id`

**Headers:**
- `x-admin-role: admin`

### Delete Category (Admin Only)

**Endpoint:** `DELETE /categories/:id`

**Headers:**
- `x-admin-role: admin`

**Note:** Cannot delete categories with subcategories.

---

## Admin Dashboard API

All admin endpoints require the `x-admin-role: admin` header.

### Get Dashboard Statistics

**Endpoint:** `GET /admin/dashboard/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 100,
    "publishedProducts": 80,
    "draftProducts": 15,
    "archivedProducts": 5,
    "lowStockProducts": 10,
    "outOfStockProducts": 3,
    "totalCategories": 20,
    "activeCategories": 18,
    "totalInventoryValue": 50000.00,
    "recentProducts": [...]
  }
}
```

### Get Inventory Alerts

Get alerts for low stock and out-of-stock products.

**Endpoint:** `GET /admin/dashboard/inventory-alerts`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "productId": "uuid",
      "productName": "Product Name",
      "sku": "SKU-001",
      "currentStock": 5,
      "alertType": "low_stock"
    }
  ]
}
```

### Get Sales Summary

**Endpoint:** `GET /admin/dashboard/sales-summary`

**Note:** Placeholder for future implementation when order management is added.

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": "Error details or validation errors array",
  "timestamp": "2025-11-04T11:00:00.000Z"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `403` - Forbidden (admin access required)
- `404` - Not Found
- `500` - Internal Server Error

---

## Features

### Product Management
- ✅ CRUD operations for products
- ✅ Product search and filtering
- ✅ Pagination support
- ✅ Stock management
- ✅ SKU validation
- ✅ Multiple images support
- ✅ Product tags and features
- ✅ Custom specifications

### Category Management
- ✅ Hierarchical categories
- ✅ Auto-slug generation
- ✅ Category status management
- ✅ Subcategory support
- ✅ Category tree structure

### Admin Dashboard
- ✅ Product statistics
- ✅ Inventory alerts
- ✅ Low stock monitoring
- ✅ Category overview
- ✅ Inventory value tracking

### Security & Validation
- ✅ Admin role authorization
- ✅ Input validation with express-validator
- ✅ Type-safe TypeScript implementation
- ✅ Error handling

---

## Implementation Notes

### In-Memory Storage
Currently using in-memory storage (Map) for products and categories. In production:
- Replace with PostgreSQL database
- Implement proper database migrations
- Add database connection pooling
- Implement transaction support

### Image Upload
Image upload utility is configured but requires:
- Proper file system or cloud storage (AWS S3, Cloudinary)
- Image processing and optimization
- CDN integration

### Authentication
Current authentication is simplified using headers. Implement:
- JWT token-based authentication
- User session management
- Role-based access control (RBAC)
- Refresh token mechanism

### Future Enhancements
- [ ] Order management integration
- [ ] Real-time inventory updates
- [ ] Product reviews and ratings
- [ ] Advanced analytics
- [ ] Bulk import/export
- [ ] Product variants support
- [ ] Discount and promotion management
