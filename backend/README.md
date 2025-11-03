# FreshRoute E-commerce Backend - Order Management System

A comprehensive order management system for the FreshRoute e-commerce platform with multi-currency support, payment integration, and real-time notifications.

## Features

### Order Processing
- Shopping cart management with Redis persistence
- Order creation and checkout
- Multi-currency support (USD/ZWL)
- Order status management and tracking
- Order history

### Payment Integration
- Multiple payment methods:
  - Stripe for international payments
  - Ecocash for local Zimbabwe payments
  - Cash on Delivery
- Payment initialization and verification
- Secure transaction handling

### Notifications
- Real-time WebSocket notifications
- Email notifications for:
  - Order confirmation
  - Order status updates
  - Payment receipts

### API Endpoints

#### Cart Endpoints
```
POST   /api/cart/add           - Add item to cart
PUT    /api/cart/update        - Update cart item quantity
DELETE /api/cart/remove        - Remove item from cart
GET    /api/cart              - Get cart contents
```

#### Order Endpoints
```
POST   /api/orders            - Create new order
GET    /api/orders           - List user orders
GET    /api/orders/:id       - Get order details
PUT    /api/orders/:id/status - Update order status
```

#### Payment Endpoints
```
POST   /api/payments/initialize - Initialize payment
POST   /api/payments/verify    - Verify payment status
```

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Caching**: Redis for cart persistence
- **WebSocket**: ws for real-time notifications
- **Email**: Nodemailer
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd freshroute/backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start Redis (required):
```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or install Redis locally
```

## Configuration

Edit `.env` file with your settings:

```env
PORT=3000
NODE_ENV=development

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Payment Configuration
STRIPE_SECRET_KEY=your_stripe_key
ECOCASH_MERCHANT_ID=your_merchant_id
ECOCASH_API_KEY=your_api_key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_password
EMAIL_FROM=noreply@freshroute.com

# Currency Configuration
DEFAULT_CURRENCY=USD
USD_TO_ZWL_RATE=1000
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

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
npm run lint:fix
```

## API Usage Examples

### Add Item to Cart
```bash
curl -X POST http://localhost:3000/api/cart/add \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "productId": "prod456",
    "name": "Fresh Apples",
    "price": 5.99,
    "quantity": 2,
    "currency": "USD"
  }'
```

### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "currency": "USD",
    "paymentMethod": "STRIPE",
    "shippingAddress": {
      "fullName": "John Doe",
      "phone": "+263771234567",
      "street": "123 Main St",
      "city": "Harare",
      "state": "Harare",
      "postalCode": "00000",
      "country": "Zimbabwe"
    }
  }'
```

### Initialize Payment
```bash
curl -X POST http://localhost:3000/api/payments/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-1234567890-1234",
    "amount": 50.00,
    "currency": "USD",
    "method": "STRIPE"
  }'
```

## Project Structure

```
backend/
├── src/
│   ├── cart/
│   │   ├── cart.controller.ts
│   │   ├── cart.service.ts
│   │   └── cart.validator.ts
│   ├── orders/
│   │   ├── order.controller.ts
│   │   ├── order.service.ts
│   │   └── order.validator.ts
│   ├── payments/
│   │   ├── payment.controller.ts
│   │   ├── payment.service.ts
│   │   └── providers/
│   │       ├── stripe.ts
│   │       └── ecocash.ts
│   ├── notifications/
│   │   ├── email.service.ts
│   │   └── templates/
│   │       ├── order-confirmation.ts
│   │       └── payment-receipt.ts
│   ├── types/
│   │   └── index.ts
│   ├── config/
│   │   └── index.ts
│   ├── middleware/
│   │   └── error.middleware.ts
│   ├── utils/
│   │   ├── redis.ts
│   │   ├── websocket.ts
│   │   └── helpers.ts
│   ├── routes/
│   │   └── index.ts
│   └── index.ts
├── package.json
├── tsconfig.json
├── jest.config.js
└── .env.example
```

## Order Status Workflow

1. **PENDING** - Order created, awaiting payment
2. **CONFIRMED** - Payment confirmed
3. **PROCESSING** - Order being prepared
4. **SHIPPED** - Order shipped with tracking number
5. **DELIVERED** - Order delivered to customer
6. **CANCELLED** - Order cancelled

## Payment Status Workflow

1. **PENDING** - Payment initiated
2. **PROCESSING** - Payment being processed
3. **COMPLETED** - Payment successful
4. **FAILED** - Payment failed
5. **REFUNDED** - Payment refunded

## WebSocket Events

Connect to `ws://localhost:3001` and subscribe:

```javascript
ws.send(JSON.stringify({
  type: 'subscribe',
  data: { userId: 'user123' }
}));
```

Events received:
- `order_created` - New order created
- `order_status_updated` - Order status changed
- `payment_status_updated` - Payment status changed

## Security Features

- Helmet for HTTP headers security
- CORS protection
- Rate limiting (100 requests per 15 minutes)
- Input validation with Zod
- Environment variable configuration

## Development

### Code Style
- TypeScript with strict mode
- ESLint for code quality
- Consistent naming conventions

### Testing
- Jest for unit and integration tests
- Test coverage reporting

## License

ISC

## Support

For support, email support@freshroute.com or open an issue in the repository.
