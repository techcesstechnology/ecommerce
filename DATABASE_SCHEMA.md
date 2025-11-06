# FreshRoute Database Schema Documentation

## Overview

This document describes the complete database structure for the FreshRoute e-commerce platform. The schema is defined using **Drizzle ORM** for type-safe database access with PostgreSQL.

## Database Location

- **Schema Definition**: `shared/schema.ts`
- **Database Access**: `backend/src/storage.ts`
- **Configuration**: `drizzle.config.ts`

## Quick Start

```bash
# Push schema to database (creates all tables)
npm run db:push

# Force push if you get warnings
npm run db:push --force

# Open Drizzle Studio (visual database browser)
npm run db:studio
```

---

## Tables Overview

| Table | Description | Key Features |
|-------|-------------|--------------|
| **users** | Customer and admin accounts | Email verification, 2FA, password reset |
| **categories** | Product categories | Hierarchical (parent/child), slug-based URLs |
| **products** | Product catalog | Stock tracking, images, ratings, tags |
| **promo_codes** | Discount codes | Percentage/fixed discounts, usage limits |
| **carts** | Shopping carts | One per user, promo code support |
| **cart_items** | Items in carts | Product, quantity, price snapshot |
| **wishlists** | Customer wishlists | Private/public, notes per item |
| **wishlist_items** | Items in wishlists | Product reference, notes |
| **delivery_slots** | Time slot booking | Date/time, capacity management |
| **orders** | Customer orders | Status tracking, payment info, shipping |
| **order_items** | Products in orders | Price snapshot, quantity |
| **reviews** | Product reviews | Ratings 1-5, verified purchases |
| **review_helpful** | Review helpfulness | Track who marked reviews helpful |
| **audit_logs** | Admin action tracking | Who did what, when |

---

## Detailed Table Definitions

### 1. Users Table

Stores all user accounts (customers and admins).

**Key Fields:**
- `id` (serial) - Auto-incrementing primary key
- `email` (varchar) - Unique, indexed
- `password` (varchar) - Hashed password
- `role` (varchar) - 'customer', 'admin', 'vendor'
- `isEmailVerified` (boolean) - Email verification status
- `twoFactorEnabled` (boolean) - 2FA enabled flag
- `twoFactorSecret` (varchar) - TOTP secret for 2FA

**Features:**
- Email verification tokens with expiration
- Password reset tokens
- Refresh token for JWT authentication
- Last login tracking
- Soft delete via `isActive` flag

**Indexes:**
- Unique index on email
- Index on role for admin queries

---

### 2. Categories Table

Product categories with hierarchical support (parent/child categories).

**Key Fields:**
- `id` (serial) - Primary key
- `name` (varchar) - Category name
- `slug` (varchar) - URL-friendly identifier (unique)
- `parentId` (integer) - Self-referencing for hierarchy
- `displayOrder` (integer) - Sort order
- `isActive` (boolean) - Visibility control

**Features:**
- Parent-child relationships for subcategories
- Image support for category pages
- Metadata JSON field for extensibility
- Slug-based SEO-friendly URLs

**Indexes:**
- Unique index on slug
- Index on parentId for hierarchy queries

---

### 3. Products Table

Main product catalog with extensive features.

**Key Fields:**
- `id` (serial) - Primary key
- `sku` (varchar) - Stock Keeping Unit (unique)
- `name` (varchar) - Product name
- `price` (decimal) - Regular price in ZWL
- `salePrice` (decimal) - Discounted price
- `categoryId` (integer) - Foreign key to categories
- `stockQuantity` (integer) - Current stock level
- `lowStockThreshold` (integer) - Alert threshold (default: 10)

**Advanced Fields:**
- `images` (json array) - Multiple product images
- `tags` (json array) - Searchable tags
- `specifications` (json) - Technical specs
- `nutritionalInfo` (json) - For food products
- `dimensions` (json) - Length, width, height for shipping

**Analytics Fields:**
- `averageRating` (decimal) - Calculated from reviews
- `reviewCount` (integer) - Total reviews
- `viewCount` (integer) - Page views
- `salesCount` (integer) - Total units sold

**Features:**
- Featured products flag
- Active/inactive status
- Unit types (kg, liters, pieces, etc.)
- Weight for shipping calculations

**Indexes:**
- Unique index on SKU
- Index on categoryId, isActive, isFeatured, price

---

### 4. Promo Codes Table

Discount codes and promotions.

**Key Fields:**
- `id` (serial) - Primary key
- `code` (varchar) - Unique promo code
- `discountType` (varchar) - 'percentage' or 'fixed'
- `discountValue` (decimal) - Discount amount
- `validFrom` (timestamp) - Start date
- `validUntil` (timestamp) - End date
- `usageLimit` (integer) - Max uses (null = unlimited)
- `usageCount` (integer) - Current usage

**Advanced Features:**
- Minimum order value requirement
- Maximum discount cap
- Applicable to specific categories/products (JSON arrays)
- Active/inactive toggle

**Indexes:**
- Unique index on code
- Index on isActive for quick lookups

---

### 5. Carts Table

One shopping cart per user.

**Key Fields:**
- `id` (serial) - Primary key
- `userId` (integer) - Foreign key to users (unique)
- `promoCodeId` (integer) - Applied promo code
- `subtotal`, `tax`, `discount`, `total` (decimals)

**Features:**
- Automatic calculation fields
- Zimbabwe 15% tax rate applied
- Promo code integration
- One cart per user enforced by unique index

**Indexes:**
- Unique index on userId

---

### 6. Cart Items Table

Products in shopping carts.

**Key Fields:**
- `id` (serial) - Primary key
- `cartId` (integer) - Foreign key to carts
- `productId` (integer) - Foreign key to products
- `quantity` (integer) - Amount
- `price` (decimal) - Price snapshot at time of add

**Features:**
- Price snapshot prevents price change issues
- Unique constraint on cart + product (one entry per product per cart)

**Indexes:**
- Unique index on (cartId, productId)
- Index on productId for inventory checks

---

### 7. Wishlists & Wishlist Items Tables

Customer wish lists with privacy controls.

**Wishlist Features:**
- Multiple wishlists per user
- Private/public sharing
- Named lists (e.g., "Birthday Wishlist")

**Wishlist Item Features:**
- Notes field for item-specific comments
- Product reference
- Unique constraint (one product per wishlist)

---

### 8. Delivery Slots Table

Time slot booking for deliveries.

**Key Fields:**
- `date` (varchar) - YYYY-MM-DD format
- `startTime`, `endTime` (varchar) - HH:MM format
- `capacity` (integer) - Max orders per slot (default: 50)
- `booked` (integer) - Current bookings
- `price` (decimal) - Delivery fee for this slot

**Features:**
- Capacity management
- Premium slot pricing (e.g., same-day delivery)
- Active/inactive control for holidays

**Indexes:**
- Index on (date, startTime) for fast lookups

---

### 9. Orders & Order Items Tables

Complete order lifecycle management.

**Order Key Fields:**
- `orderNumber` (varchar) - Unique order identifier (e.g., "ORD-20231106-001")
- `userId` (integer) - Customer
- `status` (varchar) - pending → confirmed → processing → shipped → delivered (or cancelled)
- `paymentStatus` (varchar) - pending, paid, failed, refunded
- `paymentMethod` (varchar) - cash, ecocash, card
- `shippingAddress` (json) - Full address object
- `total` (decimal) - Final order total

**Order Features:**
- Automatic order number generation
- Delivery slot booking
- Promo code tracking
- Cancellation tracking (who, when, why)
- Shipping tracking number
- Zimbabwe provinces supported

**Order Item Features:**
- Product snapshot (name, SKU, price at time of order)
- Quantity and subtotal
- Reference to original product

**Indexes:**
- Unique index on orderNumber
- Indexes on userId, status, paymentStatus, createdAt

---

### 10. Reviews & Review Helpful Tables

Product reviews and ratings.

**Review Key Fields:**
- `productId` (integer) - Product being reviewed
- `userId` (integer) - Reviewer
- `orderId` (integer) - Optional order reference
- `rating` (integer) - 1-5 stars
- `title`, `comment` (text) - Review content
- `isVerifiedPurchase` (boolean) - Bought from this store
- `helpfulCount` (integer) - How many found it helpful

**Features:**
- Verified purchase badge
- Review approval workflow
- Helpful voting system
- Linked to orders for verification

**Review Helpful Table:**
- Tracks which users marked which reviews helpful
- Prevents duplicate votes

**Indexes:**
- Indexes on productId, userId, rating

---

### 11. Audit Logs Table

Admin action tracking for compliance and security.

**Key Fields:**
- `userId` (integer) - Who performed the action
- `action` (varchar) - create, update, delete, etc.
- `resourceType` (varchar) - product, order, user, etc.
- `resourceId` (integer) - Which specific resource
- `details` (json) - Additional context
- `ipAddress` (varchar) - IP address
- `userAgent` (text) - Browser/device info

**Use Cases:**
- Track who created/modified/deleted products
- Monitor admin actions
- Compliance auditing
- Security investigations

**Indexes:**
- Index on userId
- Composite index on (resourceType, resourceId)
- Index on createdAt for time-based queries

---

## Relationships

### User-Centric
- User → Cart (1:1)
- User → Wishlists (1:many)
- User → Orders (1:many)
- User → Reviews (1:many)

### Product-Centric
- Category → Products (1:many)
- Product → Cart Items (1:many)
- Product → Order Items (1:many)
- Product → Wishlist Items (1:many)
- Product → Reviews (1:many)

### Order Flow
- Cart → Cart Items → Products
- Order → Order Items → Products
- Order → Delivery Slot (many:1)
- Order → Promo Code (many:1)

### Hierarchy
- Category → Category (self-referencing parent/child)

---

## Foreign Key Constraints

All relationships are enforced with proper foreign key constraints:

### Cascade Policies

| Relationship | Delete Policy | Reason |
|--------------|---------------|---------|
| User → Cart | CASCADE | When user deleted, remove their cart |
| User → Wishlist | CASCADE | When user deleted, remove their wishlists |
| User → Review | CASCADE | When user deleted, remove their reviews |
| Cart → Cart Items | CASCADE | When cart deleted, remove all items |
| Wishlist → Wishlist Items | CASCADE | When wishlist deleted, remove all items |
| Order → Order Items | CASCADE | When order deleted, remove all items |
| Product → Cart Items | CASCADE | When product deleted, remove from carts |
| Product → Wishlist Items | CASCADE | When product deleted, remove from wishlists |
| Product → Reviews | CASCADE | When product deleted, remove reviews |
| Category → Parent Category | SET NULL | Preserve subcategories when parent deleted |
| Product → Category | RESTRICT | Prevent category deletion if products exist |
| Order → User | RESTRICT | Prevent user deletion if orders exist |
| Order → Promo Code | SET NULL | Preserve order if promo code deleted |
| Order → Delivery Slot | SET NULL | Preserve order if slot deleted |
| Review → Order | SET NULL | Preserve review if order deleted |

**RESTRICT** = Prevent deletion if referenced records exist  
**CASCADE** = Automatically delete dependent records  
**SET NULL** = Set foreign key to NULL when parent deleted

---

## Important: updatedAt Timestamps

**PostgreSQL doesn't support automatic `ON UPDATE CURRENT_TIMESTAMP`** like MySQL does.

### Solution: Use Helper Function

Always use the `withUpdatedAt()` helper when updating records:

```typescript
import { withUpdatedAt } from './utils/db-helpers';

// Correct way to update
await db.update(products)
  .set({ 
    name: 'New Name', 
    price: '19.99',
    ...withUpdatedAt()  // This sets updated_at = NOW()
  })
  .where(eq(products.id, productId));
```

Without this helper, `updatedAt` will remain at the creation timestamp!

---

## Data Types

| Type | Used For | Example |
|------|----------|---------|
| **serial** | Auto-increment IDs | `id: serial('id').primaryKey()` |
| **varchar** | Short text with length limit | Email (255), SKU (100) |
| **text** | Unlimited text | Descriptions, comments |
| **integer** | Whole numbers | Quantity, stock, counts |
| **decimal(10,2)** | Money, ratings | Price: 1234567.89 |
| **boolean** | True/false | isActive, isVerified |
| **timestamp** | Date & time | createdAt, updatedAt |
| **json** | Structured data | Images array, address object |

---

## Indexes Strategy

**Unique Indexes** (enforce data integrity):
- User email, Product SKU, Order number
- Cart userId (one cart per user)
- Category slug
- Promo code

**Performance Indexes** (speed up queries):
- Foreign keys (userId, productId, categoryId, etc.)
- Status fields (order status, payment status)
- Date fields (createdAt for time-based queries)
- Composite indexes for common query patterns

---

## Migration Commands

```bash
# Create tables in database
npm run db:push

# Force push (if you get warnings about data loss)
npm run db:push --force

# Open visual database browser
npm run db:studio

# Generate migration files (optional)
npm run db:generate
```

---

## Zimbabwe-Specific Features

1. **Currency**: All prices in Zimbabwe Dollars (ZWL)
2. **Tax**: 15% tax rate calculated on all orders
3. **Provinces**: Shipping addresses support Zimbabwe provinces:
   - Harare, Bulawayo, Manicaland, Mashonaland Central, Mashonaland East, Mashonaland West, Masvingo, Matabeleland North, Matabeleland South, Midlands

4. **Payment Methods**:
   - Cash on Delivery
   - EcoCash (mobile money)
   - Card payments

---

## Next Steps

1. **Run Migration**: `npm run db:push` to create tables
2. **Seed Data**: Create sample products, categories, admin user
3. **Backend Services**: Build service layer to interact with these tables
4. **API Endpoints**: Create REST APIs for CRUD operations

---

## Security Considerations

✅ **Passwords**: Always hashed (never store plain text)
✅ **Email Verification**: Required before full account access
✅ **2FA Support**: Optional two-factor authentication
✅ **Audit Logging**: All admin actions tracked
✅ **Soft Deletes**: Users marked inactive instead of deleted
✅ **Price Snapshots**: Cart/order items store price at time of purchase
✅ **Token Expiration**: Password reset and email verification tokens expire

---

## Performance Tips

1. **Indexes**: All foreign keys indexed for fast joins
2. **Pagination**: Use LIMIT/OFFSET for large result sets
3. **Caching**: Cache frequently accessed data (products, categories)
4. **Connection Pooling**: Max 20 concurrent database connections
5. **Denormalization**: Product ratings cached in products table

---

## Database Access in Code

```typescript
// Import database instance
import { db, schema } from './storage';

// Query examples
const users = await db.select().from(schema.users);
const product = await db.select().from(schema.products).where(eq(schema.products.id, productId));

// With relations
const orderWithItems = await db.query.orders.findFirst({
  where: eq(schema.orders.id, orderId),
  with: {
    items: {
      with: {
        product: true,
      },
    },
  },
});
```

---

## Support

For questions about the database schema:
1. Check this documentation
2. Review `shared/schema.ts` for exact definitions
3. Use `npm run db:studio` to explore data visually
