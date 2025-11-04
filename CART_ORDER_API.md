# Shopping Cart and Order Management API Documentation

## Overview

This document describes the Shopping Cart and Order Management system API endpoints.

## Base URL

```
http://localhost:5000/api
```

## Authentication

All cart operations use session-based identification via headers:

- `x-session-id`: Session identifier (required for guest carts)
- `x-user-id`: User identifier (required for authenticated users)

---

## Cart Endpoints

### Get Cart

Retrieves the current cart for a session/user.

```http
GET /api/cart
Headers:
  x-session-id: string (optional)
  x-user-id: string (optional)
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "cart-uuid",
    "items": [...],
    "subtotal": 100.00,
    "discount": 10.00,
    "tax": 13.50,
    "shipping": 5.00,
    "total": 108.50,
    "currency": "USD"
  }
}
```

### Add Item to Cart

Adds a product to the cart.

```http
POST /api/cart/items
Headers:
  x-session-id: string
  x-user-id: string (optional)
Body:
{
  "productId": "product-uuid",
  "quantity": 2
}
```

### Update Cart Item

Updates the quantity of an item in the cart.

```http
PUT /api/cart/items/:itemId
Headers:
  x-session-id: string
Body:
{
  "quantity": 5
}
```

### Remove Cart Item

Removes an item from the cart.

```http
DELETE /api/cart/items/:itemId
Headers:
  x-session-id: string
```

### Clear Cart

Clears all items from the cart.

```http
DELETE /api/cart
Headers:
  x-session-id: string
```

### Apply Discount Code

Applies a discount code to the cart.

```http
POST /api/cart/discount
Headers:
  x-session-id: string
Body:
{
  "code": "SAVE10"
}
```

**Available Discount Codes:**

- `SAVE10` - 10% off
- `SAVE20` - 20% off
- `FLAT5` - $5 off
- `FLAT10` - $10 off

### Remove Discount Code

Removes the applied discount from the cart.

```http
DELETE /api/cart/discount
Headers:
  x-session-id: string
```

### Get Cart Summary

Retrieves a summary of the cart.

```http
GET /api/cart/summary
Headers:
  x-session-id: string
```

### Save Item For Later

Saves a cart item for later (requires authentication).

```http
POST /api/cart/save-for-later/:itemId
Headers:
  x-session-id: string
  x-user-id: string (required)
```

### Get Saved Items

Retrieves all saved items for a user.

```http
GET /api/cart/saved
Headers:
  x-user-id: string (required)
```

### Move Saved Item to Cart

Moves a saved item back to the cart.

```http
POST /api/cart/saved/:itemId/move
Headers:
  x-session-id: string
  x-user-id: string (required)
```

### Share Cart

Shares the cart via email.

```http
POST /api/cart/share
Headers:
  x-session-id: string
Body:
{
  "email": "recipient@example.com",
  "message": "Check out my cart!"
}
```

### Merge Carts

Merges a guest cart with a user cart (used during login).

```http
POST /api/cart/merge
Headers:
  x-user-id: string (required)
Body:
{
  "guestSessionId": "guest-session-id"
}
```

---

## Order Endpoints

### Create Order

Creates a new order from cart items.

```http
POST /api/orders
Headers:
  x-user-id: string (optional)
Body:
{
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 2,
      "price": 25.99
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "+263712345678",
    "addressLine1": "123 Main St",
    "addressLine2": "Apt 4B",
    "city": "Harare",
    "province": "Harare",
    "postalCode": "00263",
    "country": "Zimbabwe"
  },
  "billingAddress": { ... },
  "paymentMethod": "credit_card",
  "discountCode": "SAVE10",
  "notes": "Please deliver during business hours",
  "email": "customer@example.com"
}
```

**Payment Methods:**

- `credit_card`
- `debit_card`
- `mobile_money`
- `cash_on_delivery`

### Get Orders

Retrieves orders with filters.

```http
GET /api/orders?userId=user-id&status=pending&page=1&limit=10
Headers:
  x-user-id: string (optional)
```

**Query Parameters:**

- `userId` - Filter by user ID
- `status` - Filter by order status (pending, confirmed, processing, shipped, delivered, cancelled, refunded)
- `paymentStatus` - Filter by payment status (pending, processing, completed, failed, refunded)
- `startDate` - Filter orders from date (ISO 8601)
- `endDate` - Filter orders to date (ISO 8601)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort order (asc/desc, default: desc)

### Get Order by ID

Retrieves a specific order.

```http
GET /api/orders/:orderId
```

### Get Order Tracking

Retrieves tracking information for an order.

```http
GET /api/orders/:orderId/tracking
```

**Response:**

```json
{
  "success": true,
  "data": {
    "orderNumber": "ORD-20240101-1234",
    "status": "shipped",
    "trackingNumber": "TRACK-123456",
    "history": [
      {
        "status": "pending",
        "timestamp": "2024-01-01T10:00:00Z",
        "description": "Order placed"
      },
      {
        "status": "shipped",
        "timestamp": "2024-01-02T14:00:00Z",
        "description": "Order shipped"
      }
    ]
  }
}
```

### Get Order Invoice

Generates and retrieves an invoice for an order.

```http
GET /api/orders/:orderId/invoice?format=html
```

**Query Parameters:**

- `format` - Invoice format (html or pdf, default: html)

### Cancel Order

Cancels an order (restores product stock).

```http
PUT /api/orders/:orderId/cancel
```

### Request Refund

Requests a refund for a delivered order.

```http
POST /api/orders/:orderId/refund
Body:
{
  "reason": "Product was defective",
  "amount": 50.00,
  "items": [
    {
      "orderItemId": "item-uuid",
      "quantity": 1
    }
  ]
}
```

### Request Return

Requests a return for a delivered order.

```http
POST /api/orders/:orderId/return
Body:
{
  "items": [
    {
      "orderItemId": "item-uuid",
      "quantity": 1,
      "reason": "Size doesn't fit"
    }
  ],
  "notes": "Please process return quickly"
}
```

### Update Order Status (Admin Only)

Updates the status of an order.

```http
PUT /api/orders/:orderId/status
Headers:
  x-admin-key: admin-key (required)
Body:
{
  "status": "shipped",
  "trackingNumber": "TRACK-123456",
  "estimatedDelivery": "2024-01-10T00:00:00Z"
}
```

**Order Statuses:**

- `pending` - Order placed, awaiting confirmation
- `confirmed` - Order confirmed, payment processed
- `processing` - Order being prepared
- `shipped` - Order shipped to customer
- `delivered` - Order delivered to customer
- `cancelled` - Order cancelled
- `refunded` - Order refunded

---

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

---

## Currency Support

The system supports multiple currencies:

- USD (US Dollar)
- ZWL (Zimbabwe Dollar)
- ZAR (South African Rand)
- EUR (Euro)
- GBP (British Pound)

Currency conversion is handled automatically based on the cart's currency setting.

---

## Tax and Shipping Calculations

### Tax

- Default tax rate: 15%
- Applied to subtotal after discount

### Shipping

- Free shipping for orders over $100
- Standard shipping rate: $5
- Rates adjusted based on destination and weight

---

## Real-time Features

### Cart Persistence

- Guest carts expire after 7 days
- User carts persist indefinitely
- Carts are automatically merged on user login

### Stock Validation

- Real-time stock checks on add to cart
- Stock reserved during order creation
- Stock restored on order cancellation

### Notifications

- Order confirmation emails
- Order status update emails
- Abandoned cart reminders
- SMS tracking updates (for supported carriers)

---

## Testing

### Test Endpoints

Use these product SKUs for testing:

- Products are dynamically created during tests
- Use the `/api/products` endpoint to create test products

### Test Discount Codes

- `SAVE10` - 10% discount
- `SAVE20` - 20% discount
- `FLAT5` - $5 flat discount
- `FLAT10` - $10 flat discount

---

## Notes

1. All timestamps are in ISO 8601 format
2. All monetary amounts are in decimal format with 2 decimal places
3. Session management is handled via custom headers (no cookies required)
4. Product stock is automatically updated on order creation and cancellation
5. Payment processing is mocked for development (integrate real payment gateways in production)
6. Email and SMS notifications are logged to console in development
