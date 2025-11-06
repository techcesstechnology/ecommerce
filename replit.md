# FreshRoute E-commerce Platform

## Overview

FreshRoute is a comprehensive e-commerce platform designed for the Zimbabwean market, offering a seamless shopping experience across web and mobile channels. It utilizes a monorepo architecture managing a backend API, a web frontend, a mobile app, and a shared code library. This structure promotes code reuse, consistent typing, and centralized tooling while allowing independent deployments. The platform integrates Zimbabwe-specific features like local payment methods (EcoCash), currency (ZWL), and tax calculations, aiming to address the unique needs of the local market. It includes a complete customer-facing experience with authentication, secure checkout, account management, and an in-progress admin dashboard.

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

### Code Quality & Development Workflow

The project enforces code quality through strict TypeScript, ESLint with Prettier integration, and Husky + Lint-staged for pre-commit hooks, ensuring consistent style and early error detection.

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