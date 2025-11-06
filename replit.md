# FreshRoute E-commerce Platform

## Overview

FreshRoute is a comprehensive e-commerce platform specifically designed for the Zimbabwean market. The project uses a monorepo architecture that manages three main applications (backend API, web frontend, and mobile app) along with a shared code library. This structure enables code reuse, consistent typing across platforms, and centralized tooling while maintaining independent deployments for each service.

The platform aims to provide a seamless shopping experience across web and mobile channels, addressing the unique needs of the local market.

## Recent Changes

### November 6, 2025 - Complete Customer-Facing Frontend Implementation
- Built complete authentication flow (Login, Register pages) with form validation and error handling
- Implemented secure checkout flow with shipping address form (Zimbabwe provinces), payment method selection (Cash, EcoCash, Card)
- Created Order Success page with order confirmation and details display
- Built complete account management section:
  - Account Dashboard with order statistics and quick links
  - Order History page with status badges and order details
  - Profile Management for updating personal info and changing password
  - Wishlist page with add-to-cart and bulk operations
- **Security**: Implemented PrivateRoute component to protect authenticated routes, preventing unauthorized access and premature API calls
- All protected routes (wishlist, checkout, order-success, account pages) now require authentication
- Frontend successfully integrates with all backend APIs (products, cart, orders, reviews, wishlist, auth)
- Mobile-first responsive design with Zimbabwe-inspired green (#00A859) brand color
- ZWL currency formatting and 15% tax calculations throughout

**Complete Page Inventory**:
- Public: HomePage, ProductListPage, ProductDetailPage, CartPage, LoginPage, RegisterPage
- Protected: WishlistPage, CheckoutPage, OrderSuccessPage, AccountDashboardPage, OrderHistoryPage, ProfilePage

### November 4, 2025 - Replit Environment Setup & Deployment Configuration
- Configured backend to use flexible port configuration: PORT (production) or BACKEND_PORT (dev) with default to 5000
- Backend binds to 0.0.0.0 for Replit compatibility (not localhost)
- Configured frontend to run on port 5000 with 0.0.0.0 host and allowedHosts for Replit proxy
- Updated CORS configuration to automatically include Replit domain (REPLIT_DEV_DOMAIN) for seamless development and production deployment
- Created missing `frontend/tsconfig.node.json` for proper Vite TypeScript configuration
- Set up unified development workflow running both backend (port 3000) and frontend (port 5000) via concurrently
- Configured autoscale deployment to only build and run backend service on port 5000
- Frontend should be deployed separately as a Static Deployment
- All services verified and running without errors

**Deployment Configuration**:
- **Development**: Backend on port 3000 (via BACKEND_PORT), Frontend on port 5000
- **Production (Autoscale)**: Backend only on port 5000 (via PORT env variable)
- **Frontend Production**: Deploy separately as Static Deployment
- **Environment Variables**: PORT (production port), BACKEND_PORT (dev port), CORS_ORIGIN (optional override)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure

The project uses npm workspaces to manage four interconnected packages:

1. **Backend** (`@freshroute/backend`) - RESTful API server
2. **Frontend** (`@freshroute/frontend`) - Web application
3. **Mobile** (`@freshroute/mobile`) - Native mobile app
4. **Shared** (`@freshroute/shared`) - Common code, types, and utilities

This architecture was chosen to:
- Enable type sharing across all platforms, reducing duplication and ensuring consistency
- Centralize common business logic and validation rules
- Simplify dependency management and versioning
- Facilitate coordinated releases across services

**Tradeoff**: Monorepos can become complex to manage at scale, but for this project size, the benefits of code sharing and simplified development workflow outweigh the complexity.

### Backend Architecture

**Technology**: Node.js with Express.js and TypeScript

The backend follows a traditional RESTful API server pattern with:
- Express.js middleware stack for request processing
- Route-based organization for API endpoints
- Separation of concerns (routes, controllers pattern ready)
- Environment-based configuration using dotenv

**Key Design Decisions**:
- **TypeScript**: Chosen for type safety and better developer experience, catching errors at compile time
- **Express.js**: Selected for its maturity, extensive middleware ecosystem, and simplicity
- **Middleware Stack**: Layered security (Helmet), compression, CORS, and logging (Morgan) to handle cross-cutting concerns

**CORS Configuration**: Dynamic origin handling supports both local development (localhost) and Replit environments, with environment variable customization for production deployments.

### Frontend Architecture

**Technology**: React 18 with Vite and TypeScript

The web application uses a modern React setup with:
- **Vite**: Fast development server with HMR (Hot Module Replacement)
- **React Router**: Client-side routing (dependency present)
- **Styled Components**: CSS-in-JS for component styling
- **Axios**: HTTP client for API communication

**Key Design Decisions**:
- **Vite over Create React App**: Significantly faster build times and development server, better tree-shaking, and native ESM support
- **Styled Components**: Enables component-scoped styling, dynamic theming, and better TypeScript integration compared to traditional CSS
- **React 18**: Latest stable version provides improved performance through concurrent rendering features

**Alternative Considered**: Next.js was likely considered but not chosen, possibly to keep the frontend as a pure SPA without SSR complexity for initial MVP.

**Authentication & Route Protection**:
- Custom PrivateRoute component wraps protected routes
- Checks authentication state before rendering protected content
- Automatically redirects unauthenticated users to login page
- Prevents premature API calls and provides smooth user experience with loading states

**Page Structure**:
The frontend is organized into clear page categories:
- **Public Pages**: Homepage, Product Listing, Product Detail, Shopping Cart, Login, Register
- **Protected Pages**: Wishlist, Checkout, Order Success, Account Dashboard, Order History, Profile Management
- All pages follow consistent Zimbabwe-inspired design with green (#00A859) primary color
- Mobile-first responsive design with tablet and desktop breakpoints

### Mobile Architecture

**Technology**: React Native with Expo

The mobile app uses:
- **Expo Framework**: Managed workflow for simplified development and deployment
- **React Navigation**: Navigation library for screen management
- **Axios**: Consistent API client with web frontend

**Key Design Decisions**:
- **Expo Managed Workflow**: Chosen for faster development cycles, easier setup, and built-in tooling. Enables immediate testing without native build configuration.
- **React Native**: Allows code sharing with web frontend (React knowledge transfer) and shared business logic
- **Navigation Stack**: Ready for multi-screen application structure

**Tradeoff**: Expo's managed workflow limits access to native modules but dramatically simplifies the development and deployment process. Can eject to bare workflow if native features are needed later.

### Shared Library Architecture

**Purpose**: Centralize common code across all applications

Contains:
- **Types** (`src/types`): Shared TypeScript interfaces (User model, etc.)
- **Constants** (`src/constants`): Application-wide constants
- **Utils** (`src/utils`): Common utility functions (e.g., currency formatting for Zimbabwe)
- **Validators** (`src/validators`): Shared validation logic (e.g., email validation)

**Key Design Decisions**:
- **CommonJS Output**: The shared library compiles to CommonJS for maximum compatibility with Node.js backend
- **Declaration Files**: TypeScript declaration files are generated for full type support in consuming packages
- **Source Maps**: Enabled for better debugging experience across packages

### Code Quality & Development Workflow

**Tooling**:
- **TypeScript**: Strict mode enabled across all packages for maximum type safety
- **ESLint**: Code linting with TypeScript-specific rules and Prettier integration
- **Prettier**: Consistent code formatting (single quotes, 100 char line length, 2-space indentation)
- **Husky + Lint-staged**: Pre-commit hooks ensure code quality before commits

**Rationale**: This tooling stack prevents common errors, enforces consistent style, and reduces code review friction. The strict TypeScript configuration catches potential bugs early in development.

## External Dependencies

### Database

**PostgreSQL** (`pg` client in backend dependencies)
- Primary data store for the application
- Accessed via the `pg` npm package
- No ORM layer currently implemented (raw SQL or query builder expected)

### Caching Layer

**Redis** (`redis` client in backend dependencies)
- Used for application-level caching
- Improves performance for frequently accessed data
- Can also support session storage and rate limiting

**Note**: Both PostgreSQL and Redis connections are not yet configured in the codebase but are present as dependencies.

### Frontend Build & Development

- **Vite**: Modern build tool and dev server
- **Babel**: JavaScript transpilation (for mobile via Expo)

### Mobile Development

- **Expo**: Development platform providing:
  - Build services
  - Over-the-air updates
  - Development client
  - Access to native APIs

### HTTP & API Communication

- **Axios**: HTTP client used in both frontend and mobile apps for API requests
- Enables consistent request/response handling and interceptors across platforms

### Security & Middleware

- **Helmet**: Sets secure HTTP headers for Express.js
- **CORS**: Configurable cross-origin resource sharing
- **Compression**: Response compression middleware for bandwidth optimization
- **Morgan**: HTTP request logging for debugging and monitoring

### Development Tools

- **Concurrently**: Runs multiple npm scripts simultaneously (backend + frontend dev servers)
- **ts-node-dev**: TypeScript execution with auto-restart for backend development
- **Jest**: Testing framework (configured but tests not yet implemented)

### Environment Variables

The application uses **dotenv** for environment configuration management, with a centralized `.env` file at the root level referenced by the backend service. This allows for:
- Separate configuration for development, staging, and production
- Secure handling of sensitive credentials
- Easy Replit deployment integration via `REPLIT_DEV_DOMAIN` detection