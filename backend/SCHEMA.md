# Database Schema Reference

## Quick Reference

### Table Relationships

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│  Users   │──────<│  Orders  │>──────│ Delivery │
└──────────┘   1:N └──────────┘  1:1  └──────────┘
                        │                    │
                        │ 1:N                │ N:1
                        │                    │
                   ┌────┴────┐          ┌────┴────┐
                   │  Order  │          │ Drivers │
                   │  Items  │          └─────────┘
                   └────┬────┘
                        │ N:1
                        │
                   ┌────┴────┐
                   │Products │
                   └────┬────┘
                        │
              ┌─────────┴─────────┐
              │                   │
              │ N:1          N:1  │
              │                   │
         ┌────┴────┐        ┌────┴────┐
         │Category │        │Supplier │
         └────┬────┘        └─────────┘
              │
              │ Self-referencing (parent-child)
              │
         ┌────┴────┐
         │Category │
         └─────────┘
```

## Tables Summary

| Table | Primary Key | Soft Delete | Description |
|-------|-------------|-------------|-------------|
| users | UUID | Yes | User accounts (customers, admins, managers) |
| categories | UUID | Yes | Product categories with parent-child hierarchy |
| suppliers | UUID | Yes | Product suppliers |
| products | UUID | Yes | Product catalog with multi-currency |
| orders | UUID | Yes | Customer orders |
| order_items | UUID | No | Line items in orders |
| drivers | UUID | Yes | Delivery drivers |
| deliveries | UUID | Yes | Delivery tracking |

## Indexes

### Users
- email (unique)
- role
- is_active

### Categories
- name (unique)
- parent_id
- is_active

### Suppliers
- name
- is_active

### Products
- sku (unique)
- category_id
- supplier_id
- name
- is_active
- is_featured

### Orders
- order_number (unique)
- user_id
- status
- payment_status
- created_at

### Order Items
- order_id
- product_id

### Drivers
- email (unique, nullable)
- license_number (unique)
- is_available
- is_active

### Deliveries
- order_id (unique)
- driver_id
- status
- scheduled_date

## Enums

### User.role
- customer
- admin
- manager

### Order.status
- pending
- confirmed
- processing
- shipped
- delivered
- cancelled
- refunded

### Order.payment_status
- pending
- paid
- failed
- refunded

### Order.currency
- USD
- ZWL

### Delivery.status
- pending
- assigned
- in_transit
- delivered
- failed
- cancelled

## Foreign Key Cascade Rules

| From Table | To Table | On Update | On Delete |
|------------|----------|-----------|-----------|
| categories.parent_id | categories | CASCADE | SET NULL |
| products.category_id | categories | CASCADE | RESTRICT |
| products.supplier_id | suppliers | CASCADE | SET NULL |
| orders.user_id | users | CASCADE | RESTRICT |
| order_items.order_id | orders | CASCADE | CASCADE |
| order_items.product_id | products | CASCADE | RESTRICT |
| deliveries.order_id | orders | CASCADE | CASCADE |
| deliveries.driver_id | drivers | CASCADE | SET NULL |

## Multi-Currency Support

Products and Orders support dual pricing:
- **price_usd / currency: USD**: US Dollar pricing
- **price_zwl / currency: ZWL**: Zimbabwean Dollar pricing

## Soft Delete (Paranoid Mode)

Tables with soft delete:
- users
- categories
- suppliers
- products
- orders
- drivers
- deliveries

To query soft-deleted records:
```javascript
Model.findAll({ paranoid: false })
```

To restore soft-deleted records:
```javascript
instance.restore()
```

## Common Queries

### Get User Orders with Items
```javascript
const orders = await Order.findAll({
  where: { user_id: userId },
  include: [
    { 
      association: 'order_items',
      include: ['product']
    },
    { association: 'delivery' }
  ]
});
```

### Get Products by Category
```javascript
const products = await Product.findAll({
  where: { 
    category_id: categoryId,
    is_active: true 
  },
  include: ['category', 'supplier']
});
```

### Get Active Deliveries for Driver
```javascript
const deliveries = await Delivery.findAll({
  where: { 
    driver_id: driverId,
    status: ['assigned', 'in_transit']
  },
  include: [
    { 
      association: 'order',
      include: ['user', 'order_items']
    }
  ]
});
```

### Get Category Tree
```javascript
const categories = await Category.findAll({
  where: { parent_id: null },
  include: [{ 
    association: 'subcategories',
    include: ['subcategories']
  }]
});
```
