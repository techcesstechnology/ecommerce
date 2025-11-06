"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewHelpfulRelations = exports.reviewsRelations = exports.orderItemsRelations = exports.ordersRelations = exports.wishlistItemsRelations = exports.wishlistsRelations = exports.cartItemsRelations = exports.cartsRelations = exports.productsRelations = exports.categoriesRelations = exports.usersRelations = exports.auditLogs = exports.reviewHelpful = exports.reviews = exports.orderItems = exports.orders = exports.deliverySlots = exports.wishlistItems = exports.wishlists = exports.cartItems = exports.carts = exports.promoCodes = exports.products = exports.categories = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
// NOTE: updatedAt fields must be manually updated in application code
// PostgreSQL doesn't support automatic ON UPDATE CURRENT_TIMESTAMP
// Services should call: UPDATE table SET updated_at = NOW() WHERE id = ?
// ============================================================================
// USERS TABLE
// ============================================================================
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull().unique(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    password: (0, pg_core_1.varchar)('password', { length: 255 }).notNull(),
    phone: (0, pg_core_1.varchar)('phone', { length: 50 }),
    role: (0, pg_core_1.varchar)('role', { length: 20 }).notNull().default('customer'), // customer, admin, vendor
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    isEmailVerified: (0, pg_core_1.boolean)('is_email_verified').notNull().default(false),
    emailVerificationToken: (0, pg_core_1.varchar)('email_verification_token', { length: 255 }),
    emailVerificationExpires: (0, pg_core_1.timestamp)('email_verification_expires'),
    passwordResetToken: (0, pg_core_1.varchar)('password_reset_token', { length: 255 }),
    passwordResetExpires: (0, pg_core_1.timestamp)('password_reset_expires'),
    twoFactorEnabled: (0, pg_core_1.boolean)('two_factor_enabled').notNull().default(false),
    twoFactorSecret: (0, pg_core_1.varchar)('two_factor_secret', { length: 255 }),
    refreshToken: (0, pg_core_1.varchar)('refresh_token', { length: 500 }),
    lastLogin: (0, pg_core_1.timestamp)('last_login'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, (table) => ({
    emailIdx: (0, pg_core_1.uniqueIndex)('users_email_idx').on(table.email),
    roleIdx: (0, pg_core_1.index)('users_role_idx').on(table.role),
}));
// ============================================================================
// CATEGORIES TABLE
// ============================================================================
exports.categories = (0, pg_core_1.pgTable)('categories', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    slug: (0, pg_core_1.varchar)('slug', { length: 255 }).notNull().unique(),
    description: (0, pg_core_1.text)('description'),
    parentId: (0, pg_core_1.integer)('parent_id').references(() => exports.categories.id, { onDelete: 'set null' }),
    imageUrl: (0, pg_core_1.varchar)('image_url', { length: 500 }),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    displayOrder: (0, pg_core_1.integer)('display_order').notNull().default(0),
    metadata: (0, pg_core_1.json)('metadata'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, (table) => ({
    slugIdx: (0, pg_core_1.uniqueIndex)('categories_slug_idx').on(table.slug),
    parentIdx: (0, pg_core_1.index)('categories_parent_idx').on(table.parentId),
}));
// ============================================================================
// PRODUCTS TABLE
// ============================================================================
exports.products = (0, pg_core_1.pgTable)('products', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    sku: (0, pg_core_1.varchar)('sku', { length: 100 }).notNull().unique(),
    price: (0, pg_core_1.decimal)('price', { precision: 10, scale: 2 }).notNull(),
    salePrice: (0, pg_core_1.decimal)('sale_price', { precision: 10, scale: 2 }),
    categoryId: (0, pg_core_1.integer)('category_id')
        .notNull()
        .references(() => exports.categories.id, { onDelete: 'restrict' }),
    subcategory: (0, pg_core_1.varchar)('subcategory', { length: 255 }),
    imageUrl: (0, pg_core_1.varchar)('image_url', { length: 500 }),
    images: (0, pg_core_1.json)('images').$type(),
    stockQuantity: (0, pg_core_1.integer)('stock_quantity').notNull().default(0),
    lowStockThreshold: (0, pg_core_1.integer)('low_stock_threshold').notNull().default(10),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    isFeatured: (0, pg_core_1.boolean)('is_featured').notNull().default(false),
    unit: (0, pg_core_1.varchar)('unit', { length: 50 }), // kg, liters, pieces, etc.
    weight: (0, pg_core_1.decimal)('weight', { precision: 10, scale: 2 }), // in kg
    dimensions: (0, pg_core_1.json)('dimensions').$type(),
    nutritionalInfo: (0, pg_core_1.json)('nutritional_info'),
    tags: (0, pg_core_1.json)('tags').$type(),
    specifications: (0, pg_core_1.json)('specifications'),
    averageRating: (0, pg_core_1.decimal)('average_rating', { precision: 3, scale: 2 }).notNull().default('0'),
    reviewCount: (0, pg_core_1.integer)('review_count').notNull().default(0),
    viewCount: (0, pg_core_1.integer)('view_count').notNull().default(0),
    salesCount: (0, pg_core_1.integer)('sales_count').notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, (table) => ({
    skuIdx: (0, pg_core_1.uniqueIndex)('products_sku_idx').on(table.sku),
    categoryIdx: (0, pg_core_1.index)('products_category_idx').on(table.categoryId),
    activeIdx: (0, pg_core_1.index)('products_active_idx').on(table.isActive),
    featuredIdx: (0, pg_core_1.index)('products_featured_idx').on(table.isFeatured),
    priceIdx: (0, pg_core_1.index)('products_price_idx').on(table.price),
}));
// ============================================================================
// PROMO CODES TABLE
// ============================================================================
exports.promoCodes = (0, pg_core_1.pgTable)('promo_codes', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    code: (0, pg_core_1.varchar)('code', { length: 50 }).notNull().unique(),
    description: (0, pg_core_1.text)('description'),
    discountType: (0, pg_core_1.varchar)('discount_type', { length: 20 }).notNull(), // percentage, fixed
    discountValue: (0, pg_core_1.decimal)('discount_value', { precision: 10, scale: 2 }).notNull(),
    minOrderValue: (0, pg_core_1.decimal)('min_order_value', { precision: 10, scale: 2 }),
    maxDiscountAmount: (0, pg_core_1.decimal)('max_discount_amount', { precision: 10, scale: 2 }),
    usageLimit: (0, pg_core_1.integer)('usage_limit'), // null = unlimited
    usageCount: (0, pg_core_1.integer)('usage_count').notNull().default(0),
    validFrom: (0, pg_core_1.timestamp)('valid_from').notNull(),
    validUntil: (0, pg_core_1.timestamp)('valid_until').notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    applicableCategories: (0, pg_core_1.json)('applicable_categories').$type(),
    applicableProducts: (0, pg_core_1.json)('applicable_products').$type(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, (table) => ({
    codeIdx: (0, pg_core_1.uniqueIndex)('promo_codes_code_idx').on(table.code),
    activeIdx: (0, pg_core_1.index)('promo_codes_active_idx').on(table.isActive),
}));
// ============================================================================
// CARTS TABLE
// ============================================================================
exports.carts = (0, pg_core_1.pgTable)('carts', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id')
        .notNull()
        .unique()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    promoCodeId: (0, pg_core_1.integer)('promo_code_id').references(() => exports.promoCodes.id, {
        onDelete: 'set null',
    }),
    subtotal: (0, pg_core_1.decimal)('subtotal', { precision: 10, scale: 2 }).notNull().default('0'),
    tax: (0, pg_core_1.decimal)('tax', { precision: 10, scale: 2 }).notNull().default('0'),
    discount: (0, pg_core_1.decimal)('discount', { precision: 10, scale: 2 }).notNull().default('0'),
    total: (0, pg_core_1.decimal)('total', { precision: 10, scale: 2 }).notNull().default('0'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, (table) => ({
    userIdx: (0, pg_core_1.uniqueIndex)('carts_user_idx').on(table.userId),
}));
// ============================================================================
// CART ITEMS TABLE
// ============================================================================
exports.cartItems = (0, pg_core_1.pgTable)('cart_items', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    cartId: (0, pg_core_1.integer)('cart_id')
        .notNull()
        .references(() => exports.carts.id, { onDelete: 'cascade' }),
    productId: (0, pg_core_1.integer)('product_id')
        .notNull()
        .references(() => exports.products.id, { onDelete: 'cascade' }),
    quantity: (0, pg_core_1.integer)('quantity').notNull().default(1),
    price: (0, pg_core_1.decimal)('price', { precision: 10, scale: 2 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, (table) => ({
    cartProductIdx: (0, pg_core_1.uniqueIndex)('cart_items_cart_product_idx').on(table.cartId, table.productId),
    cartIdx: (0, pg_core_1.index)('cart_items_cart_idx').on(table.cartId),
    productIdx: (0, pg_core_1.index)('cart_items_product_idx').on(table.productId),
}));
// ============================================================================
// WISHLISTS TABLE
// ============================================================================
exports.wishlists = (0, pg_core_1.pgTable)('wishlists', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull().default('My Wishlist'),
    isPrivate: (0, pg_core_1.boolean)('is_private').notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, (table) => ({
    userIdx: (0, pg_core_1.index)('wishlists_user_idx').on(table.userId),
}));
// ============================================================================
// WISHLIST ITEMS TABLE
// ============================================================================
exports.wishlistItems = (0, pg_core_1.pgTable)('wishlist_items', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    wishlistId: (0, pg_core_1.integer)('wishlist_id')
        .notNull()
        .references(() => exports.wishlists.id, { onDelete: 'cascade' }),
    productId: (0, pg_core_1.integer)('product_id')
        .notNull()
        .references(() => exports.products.id, { onDelete: 'cascade' }),
    notes: (0, pg_core_1.text)('notes'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, (table) => ({
    wishlistProductIdx: (0, pg_core_1.uniqueIndex)('wishlist_items_wishlist_product_idx').on(table.wishlistId, table.productId),
    wishlistIdx: (0, pg_core_1.index)('wishlist_items_wishlist_idx').on(table.wishlistId),
    productIdx: (0, pg_core_1.index)('wishlist_items_product_idx').on(table.productId),
}));
// ============================================================================
// DELIVERY SLOTS TABLE
// ============================================================================
exports.deliverySlots = (0, pg_core_1.pgTable)('delivery_slots', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    date: (0, pg_core_1.varchar)('date', { length: 10 }).notNull(), // YYYY-MM-DD
    startTime: (0, pg_core_1.varchar)('start_time', { length: 5 }).notNull(), // HH:MM
    endTime: (0, pg_core_1.varchar)('end_time', { length: 5 }).notNull(), // HH:MM
    capacity: (0, pg_core_1.integer)('capacity').notNull().default(50),
    booked: (0, pg_core_1.integer)('booked').notNull().default(0),
    price: (0, pg_core_1.decimal)('price', { precision: 10, scale: 2 }).notNull().default('0'),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, (table) => ({
    dateTimeIdx: (0, pg_core_1.index)('delivery_slots_date_time_idx').on(table.date, table.startTime),
}));
// ============================================================================
// ORDERS TABLE
// ============================================================================
exports.orders = (0, pg_core_1.pgTable)('orders', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    orderNumber: (0, pg_core_1.varchar)('order_number', { length: 50 }).notNull().unique(),
    userId: (0, pg_core_1.integer)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'restrict' }),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('pending'), // pending, confirmed, processing, shipped, delivered, cancelled
    paymentStatus: (0, pg_core_1.varchar)('payment_status', { length: 20 }).notNull().default('pending'), // pending, paid, failed, refunded
    paymentMethod: (0, pg_core_1.varchar)('payment_method', { length: 50 }).notNull(), // cash, ecocash, card
    subtotal: (0, pg_core_1.decimal)('subtotal', { precision: 10, scale: 2 }).notNull(),
    tax: (0, pg_core_1.decimal)('tax', { precision: 10, scale: 2 }).notNull(),
    shippingCost: (0, pg_core_1.decimal)('shipping_cost', { precision: 10, scale: 2 }).notNull().default('0'),
    discount: (0, pg_core_1.decimal)('discount', { precision: 10, scale: 2 }).notNull().default('0'),
    total: (0, pg_core_1.decimal)('total', { precision: 10, scale: 2 }).notNull(),
    promoCodeId: (0, pg_core_1.integer)('promo_code_id').references(() => exports.promoCodes.id, {
        onDelete: 'set null',
    }),
    deliverySlotId: (0, pg_core_1.integer)('delivery_slot_id').references(() => exports.deliverySlots.id, {
        onDelete: 'set null',
    }),
    shippingAddress: (0, pg_core_1.json)('shipping_address')
        .$type()
        .notNull(),
    notes: (0, pg_core_1.text)('notes'),
    trackingNumber: (0, pg_core_1.varchar)('tracking_number', { length: 100 }),
    cancelledAt: (0, pg_core_1.timestamp)('cancelled_at'),
    cancelledBy: (0, pg_core_1.integer)('cancelled_by').references(() => exports.users.id, { onDelete: 'set null' }),
    cancellationReason: (0, pg_core_1.text)('cancellation_reason'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, (table) => ({
    orderNumberIdx: (0, pg_core_1.uniqueIndex)('orders_order_number_idx').on(table.orderNumber),
    userIdx: (0, pg_core_1.index)('orders_user_idx').on(table.userId),
    statusIdx: (0, pg_core_1.index)('orders_status_idx').on(table.status),
    paymentStatusIdx: (0, pg_core_1.index)('orders_payment_status_idx').on(table.paymentStatus),
    createdAtIdx: (0, pg_core_1.index)('orders_created_at_idx').on(table.createdAt),
}));
// ============================================================================
// ORDER ITEMS TABLE
// ============================================================================
exports.orderItems = (0, pg_core_1.pgTable)('order_items', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    orderId: (0, pg_core_1.integer)('order_id')
        .notNull()
        .references(() => exports.orders.id, { onDelete: 'cascade' }),
    productId: (0, pg_core_1.integer)('product_id')
        .notNull()
        .references(() => exports.products.id, { onDelete: 'restrict' }),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    sku: (0, pg_core_1.varchar)('sku', { length: 100 }).notNull(),
    price: (0, pg_core_1.decimal)('price', { precision: 10, scale: 2 }).notNull(),
    quantity: (0, pg_core_1.integer)('quantity').notNull(),
    subtotal: (0, pg_core_1.decimal)('subtotal', { precision: 10, scale: 2 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, (table) => ({
    orderIdx: (0, pg_core_1.index)('order_items_order_idx').on(table.orderId),
    productIdx: (0, pg_core_1.index)('order_items_product_idx').on(table.productId),
}));
// ============================================================================
// REVIEWS TABLE
// ============================================================================
exports.reviews = (0, pg_core_1.pgTable)('reviews', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    productId: (0, pg_core_1.integer)('product_id')
        .notNull()
        .references(() => exports.products.id, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.integer)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    orderId: (0, pg_core_1.integer)('order_id').references(() => exports.orders.id, { onDelete: 'set null' }),
    rating: (0, pg_core_1.integer)('rating').notNull(), // 1-5
    title: (0, pg_core_1.varchar)('title', { length: 255 }),
    comment: (0, pg_core_1.text)('comment'),
    isVerifiedPurchase: (0, pg_core_1.boolean)('is_verified_purchase').notNull().default(false),
    helpfulCount: (0, pg_core_1.integer)('helpful_count').notNull().default(0),
    isApproved: (0, pg_core_1.boolean)('is_approved').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, (table) => ({
    productIdx: (0, pg_core_1.index)('reviews_product_idx').on(table.productId),
    userIdx: (0, pg_core_1.index)('reviews_user_idx').on(table.userId),
    ratingIdx: (0, pg_core_1.index)('reviews_rating_idx').on(table.rating),
}));
// ============================================================================
// REVIEW HELPFUL TABLE (tracking who marked reviews as helpful)
// ============================================================================
exports.reviewHelpful = (0, pg_core_1.pgTable)('review_helpful', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    reviewId: (0, pg_core_1.integer)('review_id')
        .notNull()
        .references(() => exports.reviews.id, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.integer)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, (table) => ({
    reviewUserIdx: (0, pg_core_1.uniqueIndex)('review_helpful_review_user_idx').on(table.reviewId, table.userId),
}));
// ============================================================================
// AUDIT LOGS TABLE
// ============================================================================
exports.auditLogs = (0, pg_core_1.pgTable)('audit_logs', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id, { onDelete: 'set null' }),
    action: (0, pg_core_1.varchar)('action', { length: 100 }).notNull(), // create, update, delete, etc.
    resourceType: (0, pg_core_1.varchar)('resource_type', { length: 100 }).notNull(), // product, order, user, etc.
    resourceId: (0, pg_core_1.integer)('resource_id'),
    details: (0, pg_core_1.json)('details'),
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 50 }),
    userAgent: (0, pg_core_1.text)('user_agent'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, (table) => ({
    userIdx: (0, pg_core_1.index)('audit_logs_user_idx').on(table.userId),
    resourceIdx: (0, pg_core_1.index)('audit_logs_resource_idx').on(table.resourceType, table.resourceId),
    createdAtIdx: (0, pg_core_1.index)('audit_logs_created_at_idx').on(table.createdAt),
}));
// ============================================================================
// RELATIONS (for Drizzle ORM query builder)
// ============================================================================
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    carts: many(exports.carts),
    orders: many(exports.orders),
    reviews: many(exports.reviews),
    wishlists: many(exports.wishlists),
}));
exports.categoriesRelations = (0, drizzle_orm_1.relations)(exports.categories, ({ many, one }) => ({
    products: many(exports.products),
    parent: one(exports.categories, {
        fields: [exports.categories.parentId],
        references: [exports.categories.id],
    }),
    children: many(exports.categories),
}));
exports.productsRelations = (0, drizzle_orm_1.relations)(exports.products, ({ one, many }) => ({
    category: one(exports.categories, {
        fields: [exports.products.categoryId],
        references: [exports.categories.id],
    }),
    cartItems: many(exports.cartItems),
    orderItems: many(exports.orderItems),
    reviews: many(exports.reviews),
    wishlistItems: many(exports.wishlistItems),
}));
exports.cartsRelations = (0, drizzle_orm_1.relations)(exports.carts, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [exports.carts.userId],
        references: [exports.users.id],
    }),
    promoCode: one(exports.promoCodes, {
        fields: [exports.carts.promoCodeId],
        references: [exports.promoCodes.id],
    }),
    items: many(exports.cartItems),
}));
exports.cartItemsRelations = (0, drizzle_orm_1.relations)(exports.cartItems, ({ one }) => ({
    cart: one(exports.carts, {
        fields: [exports.cartItems.cartId],
        references: [exports.carts.id],
    }),
    product: one(exports.products, {
        fields: [exports.cartItems.productId],
        references: [exports.products.id],
    }),
}));
exports.wishlistsRelations = (0, drizzle_orm_1.relations)(exports.wishlists, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [exports.wishlists.userId],
        references: [exports.users.id],
    }),
    items: many(exports.wishlistItems),
}));
exports.wishlistItemsRelations = (0, drizzle_orm_1.relations)(exports.wishlistItems, ({ one }) => ({
    wishlist: one(exports.wishlists, {
        fields: [exports.wishlistItems.wishlistId],
        references: [exports.wishlists.id],
    }),
    product: one(exports.products, {
        fields: [exports.wishlistItems.productId],
        references: [exports.products.id],
    }),
}));
exports.ordersRelations = (0, drizzle_orm_1.relations)(exports.orders, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [exports.orders.userId],
        references: [exports.users.id],
    }),
    promoCode: one(exports.promoCodes, {
        fields: [exports.orders.promoCodeId],
        references: [exports.promoCodes.id],
    }),
    deliverySlot: one(exports.deliverySlots, {
        fields: [exports.orders.deliverySlotId],
        references: [exports.deliverySlots.id],
    }),
    items: many(exports.orderItems),
}));
exports.orderItemsRelations = (0, drizzle_orm_1.relations)(exports.orderItems, ({ one }) => ({
    order: one(exports.orders, {
        fields: [exports.orderItems.orderId],
        references: [exports.orders.id],
    }),
    product: one(exports.products, {
        fields: [exports.orderItems.productId],
        references: [exports.products.id],
    }),
}));
exports.reviewsRelations = (0, drizzle_orm_1.relations)(exports.reviews, ({ one }) => ({
    product: one(exports.products, {
        fields: [exports.reviews.productId],
        references: [exports.products.id],
    }),
    user: one(exports.users, {
        fields: [exports.reviews.userId],
        references: [exports.users.id],
    }),
    order: one(exports.orders, {
        fields: [exports.reviews.orderId],
        references: [exports.orders.id],
    }),
}));
exports.reviewHelpfulRelations = (0, drizzle_orm_1.relations)(exports.reviewHelpful, ({ one }) => ({
    review: one(exports.reviews, {
        fields: [exports.reviewHelpful.reviewId],
        references: [exports.reviews.id],
    }),
    user: one(exports.users, {
        fields: [exports.reviewHelpful.userId],
        references: [exports.users.id],
    }),
}));
//# sourceMappingURL=schema.js.map