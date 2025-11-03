# FreshRoute Backend

Backend API for the FreshRoute e-commerce platform.

## Database Schema

The application uses PostgreSQL with Sequelize ORM and includes the following tables:

### Core Tables

- **Users**: Customer and admin user accounts
- **Categories**: Product categories with hierarchical structure (parent-child)
- **Suppliers**: Product suppliers
- **Products**: Product catalog with multi-currency support (USD/ZWL)
- **Orders**: Customer orders with payment tracking
- **Order Items**: Individual items in an order
- **Drivers**: Delivery drivers
- **Deliveries**: Delivery tracking and management

### Key Features

- UUID primary keys for all tables
- Timestamps (created_at, updated_at) on all tables
- Soft delete functionality (paranoid mode) on most tables
- Proper foreign key relationships with cascade rules
- Indexes on frequently queried fields
- Multi-currency support (USD/ZWL)
- Comprehensive validation rules

## Setup

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure database:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Create database:
```bash
createdb freshroute_dev
```

4. Run migrations:
```bash
npm run migrate
```

## Scripts

### Test database connection
```bash
npm run test:connection
```

### Run CRUD examples
```bash
npm run example:crud
```
Note: This requires a working database connection and completed migrations.

## Database Migrations

### Run all pending migrations
```bash
npm run migrate
```

### Undo last migration
```bash
npm run migrate:undo
```

## Database Schema Diagram

### Entity Relationships

```
Users (1) ──< (N) Orders
Categories (1) ──< (N) Products
Categories (1) ──< (N) Categories (parent-child)
Suppliers (1) ──< (N) Products
Products (1) ──< (N) OrderItems
Orders (1) ──< (N) OrderItems
Orders (1) ── (1) Deliveries
Drivers (1) ──< (N) Deliveries
```

## Models

### User Model
- id (UUID, PK)
- email (String, unique)
- password (String)
- first_name (String)
- last_name (String)
- phone (String, optional)
- address (Text, optional)
- city (String, optional)
- country (String, optional)
- role (Enum: customer, admin, manager)
- is_active (Boolean)
- timestamps + soft delete

### Category Model
- id (UUID, PK)
- name (String, unique)
- description (Text, optional)
- parent_id (UUID, FK, optional)
- image_url (String, optional)
- is_active (Boolean)
- timestamps + soft delete

### Supplier Model
- id (UUID, PK)
- name (String)
- contact_person (String, optional)
- email (String, optional)
- phone (String, optional)
- address (Text, optional)
- city (String, optional)
- country (String, optional)
- is_active (Boolean)
- timestamps + soft delete

### Product Model
- id (UUID, PK)
- name (String)
- description (Text, optional)
- sku (String, unique)
- category_id (UUID, FK)
- supplier_id (UUID, FK, optional)
- price_usd (Decimal)
- price_zwl (Decimal, optional)
- stock_quantity (Integer)
- unit (String)
- weight (Decimal, optional)
- image_url (String, optional)
- is_active (Boolean)
- is_featured (Boolean)
- timestamps + soft delete

### Order Model
- id (UUID, PK)
- order_number (String, unique)
- user_id (UUID, FK)
- status (Enum: pending, confirmed, processing, shipped, delivered, cancelled, refunded)
- currency (Enum: USD, ZWL)
- subtotal (Decimal)
- tax (Decimal)
- shipping_fee (Decimal)
- total (Decimal)
- payment_method (String, optional)
- payment_status (Enum: pending, paid, failed, refunded)
- shipping_address (Text)
- shipping_city (String)
- shipping_country (String)
- notes (Text, optional)
- timestamps + soft delete

### OrderItem Model
- id (UUID, PK)
- order_id (UUID, FK)
- product_id (UUID, FK)
- product_name (String)
- product_sku (String)
- quantity (Integer)
- unit_price (Decimal)
- subtotal (Decimal)
- timestamps

### Driver Model
- id (UUID, PK)
- first_name (String)
- last_name (String)
- email (String, unique, optional)
- phone (String)
- license_number (String, unique)
- vehicle_type (String, optional)
- vehicle_number (String, optional)
- is_available (Boolean)
- is_active (Boolean)
- timestamps + soft delete

### Delivery Model
- id (UUID, PK)
- order_id (UUID, FK, unique)
- driver_id (UUID, FK, optional)
- status (Enum: pending, assigned, in_transit, delivered, failed, cancelled)
- scheduled_date (Date, optional)
- actual_delivery_date (Date, optional)
- delivery_address (Text)
- delivery_city (String)
- delivery_country (String)
- recipient_name (String)
- recipient_phone (String)
- notes (Text, optional)
- timestamps + soft delete

## Usage Examples

### Initialize Database Connection

```javascript
const db = require('./src/models');

// Test connection
db.sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Unable to connect:', err));
```

### Create a User

```javascript
const { User } = require('./src/models');

const user = await User.create({
  email: 'john@example.com',
  password: 'hashed_password',
  first_name: 'John',
  last_name: 'Doe',
  role: 'customer'
});
```

### Create a Product with Category and Supplier

```javascript
const { Product, Category, Supplier } = require('./src/models');

const product = await Product.create({
  name: 'Fresh Tomatoes',
  sku: 'TOMATO-001',
  category_id: 'category-uuid',
  supplier_id: 'supplier-uuid',
  price_usd: 2.99,
  price_zwl: 1500,
  stock_quantity: 100,
  unit: 'kg'
});
```

### Create an Order with Items

```javascript
const { Order, OrderItem } = require('./src/models');

const order = await Order.create({
  order_number: 'ORD-2024-0001',
  user_id: 'user-uuid',
  currency: 'USD',
  subtotal: 29.99,
  tax: 2.00,
  shipping_fee: 5.00,
  total: 36.99,
  shipping_address: '123 Main St',
  shipping_city: 'Harare',
  shipping_country: 'Zimbabwe'
});

await OrderItem.create({
  order_id: order.id,
  product_id: 'product-uuid',
  product_name: 'Fresh Tomatoes',
  product_sku: 'TOMATO-001',
  quantity: 10,
  unit_price: 2.99,
  subtotal: 29.99
});
```

### Query with Associations

```javascript
const { Order } = require('./src/models');

const orders = await Order.findAll({
  include: [
    { 
      association: 'user',
      attributes: ['email', 'first_name', 'last_name']
    },
    { 
      association: 'order_items',
      include: ['product']
    },
    { 
      association: 'delivery',
      include: ['driver']
    }
  ],
  where: { status: 'pending' }
});
```

## License

ISC
