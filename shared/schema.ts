import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  timestamp,
  json,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// NOTE: updatedAt fields must be manually updated in application code
// PostgreSQL doesn't support automatic ON UPDATE CURRENT_TIMESTAMP
// Services should call: UPDATE table SET updated_at = NOW() WHERE id = ?

// ============================================================================
// USERS TABLE
// ============================================================================
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }),
    role: varchar('role', { length: 20 }).notNull().default('customer'), // customer, admin, vendor
    isActive: boolean('is_active').notNull().default(true),
    isEmailVerified: boolean('is_email_verified').notNull().default(false),
    emailVerificationToken: varchar('email_verification_token', { length: 255 }),
    emailVerificationExpires: timestamp('email_verification_expires'),
    passwordResetToken: varchar('password_reset_token', { length: 255 }),
    passwordResetExpires: timestamp('password_reset_expires'),
    twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
    twoFactorSecret: varchar('two_factor_secret', { length: 255 }),
    refreshToken: varchar('refresh_token', { length: 500 }),
    lastLogin: timestamp('last_login'),
    failedLoginAttempts: integer('failed_login_attempts').notNull().default(0),
    accountLockedUntil: timestamp('account_locked_until'),
    lastLoginIp: varchar('last_login_ip', { length: 45 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
    roleIdx: index('users_role_idx').on(table.role),
  })
);

// ============================================================================
// CATEGORIES TABLE
// ============================================================================
export const categories: any = pgTable(
  'categories',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    description: text('description'),
    parentId: integer('parent_id').references((): any => categories.id, { onDelete: 'set null' }),
    imageUrl: varchar('image_url', { length: 500 }),
    isActive: boolean('is_active').notNull().default(true),
    displayOrder: integer('display_order').notNull().default(0),
    metadata: json('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex('categories_slug_idx').on(table.slug),
    parentIdx: index('categories_parent_idx').on(table.parentId),
  })
);

// ============================================================================
// PRODUCTS TABLE
// ============================================================================
export const products = pgTable(
  'products',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    sku: varchar('sku', { length: 100 }).notNull().unique(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    salePrice: decimal('sale_price', { precision: 10, scale: 2 }),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    subcategory: varchar('subcategory', { length: 255 }),
    imageUrl: varchar('image_url', { length: 500 }),
    images: json('images').$type<string[]>(),
    stockQuantity: integer('stock_quantity').notNull().default(0),
    lowStockThreshold: integer('low_stock_threshold').notNull().default(10),
    isActive: boolean('is_active').notNull().default(true),
    isFeatured: boolean('is_featured').notNull().default(false),
    unit: varchar('unit', { length: 50 }), // kg, liters, pieces, etc.
    weight: decimal('weight', { precision: 10, scale: 2 }), // in kg
    dimensions: json('dimensions').$type<{ length?: number; width?: number; height?: number }>(),
    nutritionalInfo: json('nutritional_info'),
    tags: json('tags').$type<string[]>(),
    specifications: json('specifications'),
    averageRating: decimal('average_rating', { precision: 3, scale: 2 }).notNull().default('0'),
    reviewCount: integer('review_count').notNull().default(0),
    viewCount: integer('view_count').notNull().default(0),
    salesCount: integer('sales_count').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    skuIdx: uniqueIndex('products_sku_idx').on(table.sku),
    categoryIdx: index('products_category_idx').on(table.categoryId),
    activeIdx: index('products_active_idx').on(table.isActive),
    featuredIdx: index('products_featured_idx').on(table.isFeatured),
    priceIdx: index('products_price_idx').on(table.price),
  })
);

// ============================================================================
// PROMO CODES TABLE
// ============================================================================
export const promoCodes = pgTable(
  'promo_codes',
  {
    id: serial('id').primaryKey(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    description: text('description'),
    discountType: varchar('discount_type', { length: 20 }).notNull(), // percentage, fixed
    discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
    minOrderValue: decimal('min_order_value', { precision: 10, scale: 2 }),
    maxDiscountAmount: decimal('max_discount_amount', { precision: 10, scale: 2 }),
    usageLimit: integer('usage_limit'), // null = unlimited
    usageCount: integer('usage_count').notNull().default(0),
    validFrom: timestamp('valid_from').notNull(),
    validUntil: timestamp('valid_until').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    applicableCategories: json('applicable_categories').$type<number[]>(),
    applicableProducts: json('applicable_products').$type<number[]>(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    codeIdx: uniqueIndex('promo_codes_code_idx').on(table.code),
    activeIdx: index('promo_codes_active_idx').on(table.isActive),
  })
);

// ============================================================================
// CARTS TABLE
// ============================================================================
export const carts = pgTable(
  'carts',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    promoCodeId: integer('promo_code_id').references(() => promoCodes.id, {
      onDelete: 'set null',
    }),
    subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull().default('0'),
    tax: decimal('tax', { precision: 10, scale: 2 }).notNull().default('0'),
    discount: decimal('discount', { precision: 10, scale: 2 }).notNull().default('0'),
    total: decimal('total', { precision: 10, scale: 2 }).notNull().default('0'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdx: uniqueIndex('carts_user_idx').on(table.userId),
  })
);

// ============================================================================
// CART ITEMS TABLE
// ============================================================================
export const cartItems = pgTable(
  'cart_items',
  {
    id: serial('id').primaryKey(),
    cartId: integer('cart_id')
      .notNull()
      .references(() => carts.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(1),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    cartProductIdx: uniqueIndex('cart_items_cart_product_idx').on(table.cartId, table.productId),
    cartIdx: index('cart_items_cart_idx').on(table.cartId),
    productIdx: index('cart_items_product_idx').on(table.productId),
  })
);

// ============================================================================
// WISHLISTS TABLE
// ============================================================================
export const wishlists = pgTable(
  'wishlists',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull().default('My Wishlist'),
    isPrivate: boolean('is_private').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index('wishlists_user_idx').on(table.userId),
  })
);

// ============================================================================
// WISHLIST ITEMS TABLE
// ============================================================================
export const wishlistItems = pgTable(
  'wishlist_items',
  {
    id: serial('id').primaryKey(),
    wishlistId: integer('wishlist_id')
      .notNull()
      .references(() => wishlists.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    wishlistProductIdx: uniqueIndex('wishlist_items_wishlist_product_idx').on(
      table.wishlistId,
      table.productId
    ),
    wishlistIdx: index('wishlist_items_wishlist_idx').on(table.wishlistId),
    productIdx: index('wishlist_items_product_idx').on(table.productId),
  })
);

// ============================================================================
// DELIVERY SLOTS TABLE
// ============================================================================
export const deliverySlots = pgTable(
  'delivery_slots',
  {
    id: serial('id').primaryKey(),
    date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD
    startTime: varchar('start_time', { length: 5 }).notNull(), // HH:MM
    endTime: varchar('end_time', { length: 5 }).notNull(), // HH:MM
    capacity: integer('capacity').notNull().default(50),
    booked: integer('booked').notNull().default(0),
    price: decimal('price', { precision: 10, scale: 2 }).notNull().default('0'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    dateTimeIdx: index('delivery_slots_date_time_idx').on(table.date, table.startTime),
  })
);

// ============================================================================
// ORDERS TABLE
// ============================================================================
export const orders = pgTable(
  'orders',
  {
    id: serial('id').primaryKey(),
    orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, confirmed, processing, shipped, delivered, cancelled
    paymentStatus: varchar('payment_status', { length: 20 }).notNull().default('pending'), // pending, paid, failed, refunded
    paymentMethod: varchar('payment_method', { length: 50 }).notNull(), // cash, ecocash, card
    subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
    tax: decimal('tax', { precision: 10, scale: 2 }).notNull(),
    shippingCost: decimal('shipping_cost', { precision: 10, scale: 2 }).notNull().default('0'),
    discount: decimal('discount', { precision: 10, scale: 2 }).notNull().default('0'),
    total: decimal('total', { precision: 10, scale: 2 }).notNull(),
    promoCodeId: integer('promo_code_id').references(() => promoCodes.id, {
      onDelete: 'set null',
    }),
    deliverySlotId: integer('delivery_slot_id').references(() => deliverySlots.id, {
      onDelete: 'set null',
    }),
    shippingAddress: json('shipping_address')
      .$type<{
        fullName: string;
        phone: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        province: string;
        postalCode?: string;
        country?: string;
        deliveryInstructions?: string;
      }>()
      .notNull(),
    notes: text('notes'),
    trackingNumber: varchar('tracking_number', { length: 100 }),
    cancelledAt: timestamp('cancelled_at'),
    cancelledBy: integer('cancelled_by').references(() => users.id, { onDelete: 'set null' }),
    cancellationReason: text('cancellation_reason'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    orderNumberIdx: uniqueIndex('orders_order_number_idx').on(table.orderNumber),
    userIdx: index('orders_user_idx').on(table.userId),
    statusIdx: index('orders_status_idx').on(table.status),
    paymentStatusIdx: index('orders_payment_status_idx').on(table.paymentStatus),
    createdAtIdx: index('orders_created_at_idx').on(table.createdAt),
  })
);

// ============================================================================
// ORDER ITEMS TABLE
// ============================================================================
export const orderItems = pgTable(
  'order_items',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'restrict' }),
    name: varchar('name', { length: 255 }).notNull(),
    sku: varchar('sku', { length: 100 }).notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    quantity: integer('quantity').notNull(),
    subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    orderIdx: index('order_items_order_idx').on(table.orderId),
    productIdx: index('order_items_product_idx').on(table.productId),
  })
);

// ============================================================================
// REVIEWS TABLE
// ============================================================================
export const reviews = pgTable(
  'reviews',
  {
    id: serial('id').primaryKey(),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orderId: integer('order_id').references(() => orders.id, { onDelete: 'set null' }),
    rating: integer('rating').notNull(), // 1-5
    title: varchar('title', { length: 255 }),
    comment: text('comment'),
    isVerifiedPurchase: boolean('is_verified_purchase').notNull().default(false),
    helpfulCount: integer('helpful_count').notNull().default(0),
    isApproved: boolean('is_approved').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    productIdx: index('reviews_product_idx').on(table.productId),
    userIdx: index('reviews_user_idx').on(table.userId),
    ratingIdx: index('reviews_rating_idx').on(table.rating),
  })
);

// ============================================================================
// REVIEW HELPFUL TABLE (tracking who marked reviews as helpful)
// ============================================================================
export const reviewHelpful = pgTable(
  'review_helpful',
  {
    id: serial('id').primaryKey(),
    reviewId: integer('review_id')
      .notNull()
      .references(() => reviews.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    reviewUserIdx: uniqueIndex('review_helpful_review_user_idx').on(table.reviewId, table.userId),
  })
);

// ============================================================================
// AUDIT LOGS TABLE
// ============================================================================
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
    action: varchar('action', { length: 100 }).notNull(), // create, update, delete, etc.
    resourceType: varchar('resource_type', { length: 100 }).notNull(), // product, order, user, etc.
    resourceId: integer('resource_id'),
    details: json('details'),
    ipAddress: varchar('ip_address', { length: 50 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index('audit_logs_user_idx').on(table.userId),
    resourceIdx: index('audit_logs_resource_idx').on(table.resourceType, table.resourceId),
    createdAtIdx: index('audit_logs_created_at_idx').on(table.createdAt),
  })
);

// ============================================================================
// PAYMENT TRANSACTIONS TABLE
// ============================================================================
export const paymentTransactions = pgTable(
  'payment_transactions',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    provider: varchar('provider', { length: 50 }).notNull(), // pesepay, paynow, stripe
    providerTransactionId: varchar('provider_transaction_id', { length: 255 }),
    pollUrl: varchar('poll_url', { length: 500 }),
    redirectUrl: varchar('redirect_url', { length: 500 }),
    paymentMethod: varchar('payment_method', { length: 50 }).notNull(), // ecocash, visa, onemoney
    paymentMethodCode: varchar('payment_method_code', { length: 20 }), // PZW201 for EcoCash
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 10 }).notNull().default('ZWL'), // ZWL or USD
    status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, processing, paid, failed, cancelled, refunded
    customerPhone: varchar('customer_phone', { length: 50 }),
    customerEmail: varchar('customer_email', { length: 255 }),
    transactionReference: varchar('transaction_reference', { length: 255 }).notNull(),
    paymentDescription: text('payment_description'),
    metadata: json('metadata'),
    errorMessage: text('error_message'),
    paidAt: timestamp('paid_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    orderIdx: index('payment_transactions_order_idx').on(table.orderId),
    userIdx: index('payment_transactions_user_idx').on(table.userId),
    statusIdx: index('payment_transactions_status_idx').on(table.status),
    providerTransactionIdx: index('payment_transactions_provider_transaction_idx').on(
      table.providerTransactionId
    ),
    referenceIdx: uniqueIndex('payment_transactions_reference_idx').on(table.transactionReference),
  })
);

// ============================================================================
// RELATIONS (for Drizzle ORM query builder)
// ============================================================================
export const usersRelations = relations(users, ({ many }) => ({
  carts: many(carts),
  orders: many(orders),
  reviews: many(reviews),
  wishlists: many(wishlists),
}));

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  products: many(products),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  reviews: many(reviews),
  wishlistItems: many(wishlistItems),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  promoCode: one(promoCodes, {
    fields: [carts.promoCodeId],
    references: [promoCodes.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const wishlistsRelations = relations(wishlists, ({ one, many }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  items: many(wishlistItems),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  wishlist: one(wishlists, {
    fields: [wishlistItems.wishlistId],
    references: [wishlists.id],
  }),
  product: one(products, {
    fields: [wishlistItems.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  promoCode: one(promoCodes, {
    fields: [orders.promoCodeId],
    references: [promoCodes.id],
  }),
  deliverySlot: one(deliverySlots, {
    fields: [orders.deliverySlotId],
    references: [deliverySlots.id],
  }),
  items: many(orderItems),
  paymentTransactions: many(paymentTransactions),
}));

export const paymentTransactionsRelations = relations(paymentTransactions, ({ one }) => ({
  order: one(orders, {
    fields: [paymentTransactions.orderId],
    references: [orders.id],
  }),
  user: one(users, {
    fields: [paymentTransactions.userId],
    references: [users.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
}));

export const reviewHelpfulRelations = relations(reviewHelpful, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewHelpful.reviewId],
    references: [reviews.id],
  }),
  user: one(users, {
    fields: [reviewHelpful.userId],
    references: [users.id],
  }),
}));
