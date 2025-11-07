# FreshRoute E-commerce Platform

## Overview

FreshRoute is a comprehensive e-commerce platform designed for the Zimbabwean market, offering a seamless shopping experience across web and mobile channels. It utilizes a monorepo architecture managing a backend API, a web frontend, a mobile app, and a shared code library. This structure promotes code reuse, consistent typing, and centralized tooling while allowing independent deployments. The platform integrates Zimbabwe-specific features like local payment methods (EcoCash), currency (ZWL), and tax calculations, aiming to address the unique needs of the local market. It includes a complete customer-facing experience with authentication, secure checkout, account management, and a comprehensive backend admin management system for managing all e-commerce operations.

### Recent Critical Fixes (Nov 2025)

Fixed critical TypeScript compilation errors preventing deployment by aligning TypeORM entities with existing Drizzle schema:

**Entity Updates** (all now match existing database schema created by Drizzle):
- Updated Product, Category, CartItem, WishlistItem, Cart, Wishlist, Review, and Promotion entities to use serial integer IDs and foreign keys
- Added explicit column name mappings for all snake_case database columns (e.g., `created_at`, `product_id`, `user_id`, `promo_code_id`)
- Implemented decimal-to-number transformers for all price fields to ensure API returns numbers instead of strings
- Fixed Promotion entity field names to match promo_codes table: discountType, discountValue, validFrom, validUntil, minOrderValue
- Fixed Wishlist entity to use isPrivate instead of isPublic (matching database schema)
- No database migrations performed - entities updated to match existing Drizzle-created tables

**Service Layer Fixes** (comprehensive ID validation before all database operations):
- Added Number.isInteger() validation guards in ALL service methods across CartService, WishlistService, ReviewService, OrderService, PromotionService, and ProductService
- All methods now validate string IDs from request parameters (userId, productId, cartId, wishlistId, reviewId, orderId, deliverySlotId, categoryId) and convert to integers before database queries
- Invalid IDs return controlled 400 errors that properly propagate through error handling middleware
- CartService: Updated all promo code logic to use correct Promotion field names (validFrom, validUntil, minOrderValue, discountType, discountValue)
- WishlistService: All 7 methods now validate userId; isPrivate logic corrected throughout
- ReviewService: All 6 methods now validate userId and reviewId; fixed verified purchase check to use proper JOIN with order_items table
- OrderService: All 8 methods validate IDs; getOrders validates userId filter and uses correct TypeORM property names (order.userId); error handling properly propagates AppError instances
- PromotionService: All 7 methods validate promotion IDs and use correct field names
- ProductService: getCategoryById validates categoryId before database queries

**Results**:
- TypeScript compiles successfully with zero errors
- Backend API runs without type mismatches
- All endpoints return correct integer IDs and numeric prices
- Application deployment-ready
- All service methods now consistently validate and convert IDs before database operations

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure

The project uses npm workspaces to manage four packages: Backend, Frontend, Mobile, and Shared. This enables type sharing, common business logic centralization, simplified dependency management, and coordinated releases across services.

### Backend Architecture

Built with Node.js, Express.js, and TypeScript, the backend follows a RESTful API pattern. It uses Express.js middleware for request processing, route-based API organization, and separation of concerns. Key decisions include TypeScript for type safety, Express.js for its maturity, and a middleware stack for security (Helmet), compression, CORS, and logging (Morgan). CORS is dynamically configured to support local development and Replit environments.

### Frontend Architecture

The web application uses React 18 with Vite and TypeScript. It features Vite for fast development, React Router for client-side routing, Styled Components for styling, and Axios for API communication. Vite was chosen over Create React App for faster builds. It implements a mobile-first responsive design with a Zimbabwe-inspired green color scheme. Authentication and route protection are handled via a custom `PrivateRoute` component.

### Mobile Architecture

The mobile app is developed with React Native and Expo, utilizing Expo's managed workflow for simplified development and deployment, and React Navigation for screen management. Axios is used for consistent API communication. Expo's managed workflow was chosen for faster development cycles, with the option to eject to a bare workflow if native modules are required.

### Shared Library Architecture

This package centralizes common code, including TypeScript types, application-wide constants, utility functions (e.g., currency formatting), and shared validation logic, ensuring consistency across all applications. It compiles to CommonJS with declaration files and source maps.

### Admin Management System

The backend includes a complete admin management API with role-based authorization:

- **Admin Routes**: All admin endpoints are protected by authentication and admin role authorization middleware
- **Product Management**: Create, update, delete products and manage stock levels
- **Category Management**: Full CRUD operations for product categories
- **Order Management**: View all orders with filtering, update order status
- **User Management**: View users with filtering, update user roles
- **Delivery Slot Management**: Create and manage delivery time slots with capacity limits and overlap detection
- **Promotion Management**: Full CRUD for promo codes (percentage, fixed, BOGO, free shipping types) with usage tracking and validation
- **Dashboard Analytics**: Endpoint for order statistics and analytics
- **Request Validation**: All admin endpoints use express-validator for input validation
- **Error Handling**: Consistent error responses using custom domain errors (NotFoundError, ConflictError, BadRequestError, etc.)

Admin API is available at `/api/admin/*` with endpoints like:
- `/api/admin/products`, `/api/admin/categories`
- `/api/admin/orders`, `/api/admin/users`
- `/api/admin/delivery-slots`, `/api/admin/promotions`
- `/api/admin/dashboard/stats`

### Code Quality & Development Workflow

The project enforces code quality through strict TypeScript, ESLint with Prettier integration, and Husky + Lint-staged for pre-commit hooks, ensuring consistent style and early error detection. Custom error classes are used throughout the application for consistent error handling, with domain-specific errors (NotFoundError, ConflictError, ValidationError) that are automatically handled by the centralized error handling middleware.

## External Dependencies

### Database

- **PostgreSQL**: Primary data store (Neon-hosted), accessed via the `pg` npm package. 
- **Drizzle ORM**: Used for schema definition and migrations (14 tables created)
- **TypeORM**: Used by backend services for data access (configured to read Drizzle-created tables with `synchronize: false`)
- All 14 database tables successfully created: users, categories, products, promo_codes, carts, cart_items, wishlists, wishlist_items, delivery_slots, orders, order_items, reviews, review_helpful, audit_logs
- 21 foreign key constraints and 30+ performance indexes in place

### Caching Layer

- **Redis**: Used for application-level caching, session storage, and rate limiting.

### Frontend Build & Development

- **Vite**: Modern build tool and development server for the frontend.
- **Babel**: JavaScript transpilation (for mobile via Expo).

### Mobile Development

- **Expo**: Framework providing build services, over-the-air updates, a development client, and access to native APIs for the mobile app.

### HTTP & API Communication

- **Axios**: HTTP client used consistently across both frontend and mobile applications for API requests.

### Security & Middleware

- **Helmet**: Sets secure HTTP headers for Express.js.
- **CORS**: Configurable Cross-Origin Resource Sharing.
- **Compression**: Response compression middleware.
- **Morgan**: HTTP request logging.

### Development Tools

- **Concurrently**: Runs multiple npm scripts simultaneously.
- **ts-node-dev**: TypeScript execution with auto-restart for backend development.
- **Jest**: Testing framework (configured).
- **dotenv**: Manages environment variables for configuration.