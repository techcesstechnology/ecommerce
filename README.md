# FreshRoute 🛒🇿🇼

A modern e-commerce platform tailored for Zimbabwe, built with a monorepo architecture to support web, mobile, and backend services.

## 🌟 Overview

FreshRoute is a comprehensive e-commerce solution designed specifically for the Zimbabwean market. The platform provides a seamless shopping experience across multiple channels while addressing local market needs including multi-currency support, local payment integrations, and optimized performance for varying connectivity conditions.

## 🏗️ Architecture

This project uses a **monorepo** structure to manage multiple related projects:

```
freshroute/
├── backend/          # Node.js/Express.js API server
├── frontend/         # React web application
├── mobile/           # React Native mobile app
├── shared/           # Shared types, utilities, and constants
└── .github/          # CI/CD workflows
```

### Technology Stack

**Backend:**
- Node.js with Express.js
- TypeScript
- PostgreSQL (Database)
- Redis (Caching)
- JWT Authentication

**Frontend (Web):**
- React 18
- TypeScript
- React Router
- Axios
- Styled Components

**Mobile:**
- React Native
- TypeScript
- React Navigation
- Expo (for development)

**Shared:**
- TypeScript types and interfaces
- Common utilities
- Validation schemas

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 14.0
- **Redis** >= 6.0
- **Git**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/edmundtafadzwa-commits/freshroute.git
   cd freshroute
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Install dependencies for all workspaces:**
   ```bash
   npm run install-all
   ```

5. **Start the development servers:**
   ```bash
   # Start backend and frontend together
   npm run dev

   # Or start individually:
   npm run dev:backend
   npm run dev:frontend
   npm run dev:mobile
   ```

## 📦 Available Scripts

### Root Level Commands

- `npm run dev` - Start backend and frontend in development mode
- `npm run build` - Build all projects for production
- `npm run test` - Run tests for all projects
- `npm run lint` - Lint all projects
- `npm run format` - Format code with Prettier

### Project-Specific Commands

Each workspace (backend, frontend, mobile, shared) has its own scripts:

```bash
npm run dev:backend      # Start backend server
npm run dev:frontend     # Start frontend dev server
npm run dev:mobile       # Start mobile app with Expo
npm run build:backend    # Build backend
npm run build:frontend   # Build frontend
npm run test:backend     # Test backend
npm run lint:frontend    # Lint frontend
```

## 🗂️ Project Structure

### Backend (`/backend`)

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── server.ts       # Application entry point
├── tests/              # Test files
└── package.json
```

### Frontend (`/frontend`)

```
frontend/
├── public/             # Static files
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── styles/         # Global styles
│   ├── utils/          # Utility functions
│   └── App.tsx         # Root component
└── package.json
```

### Mobile (`/mobile`)

```
mobile/
├── assets/             # Images, fonts, etc.
├── src/
│   ├── components/     # Reusable components
│   ├── navigation/     # Navigation configuration
│   ├── screens/        # Screen components
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   └── App.tsx         # Root component
└── package.json
```

### Shared (`/shared`)

```
shared/
├── src/
│   ├── types/          # TypeScript types/interfaces
│   ├── constants/      # Shared constants
│   ├── utils/          # Shared utilities
│   └── validators/     # Validation schemas
└── package.json
```

## 🔧 Development

### Code Quality

The project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for Git hooks
- **lint-staged** for pre-commit checks

Code is automatically formatted and linted before each commit.

### TypeScript

All projects use TypeScript for type safety. Shared types are defined in the `/shared` directory and can be imported by other workspaces.

### Testing

Each workspace has its own test suite. Run all tests with:

```bash
npm test
```

## 🚢 Deployment

### Backend

The backend can be deployed to any Node.js hosting platform (Heroku, AWS, DigitalOcean, etc.)

### Frontend

The frontend can be deployed to static hosting services (Vercel, Netlify, AWS S3, etc.)

### Mobile

The mobile app can be built and deployed to:
- **iOS:** App Store (requires Apple Developer account)
- **Android:** Google Play Store

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

FreshRoute Team - Building the future of e-commerce in Zimbabwe

## 🔗 Links

- [Documentation](./docs)
- [Issue Tracker](https://github.com/edmundtafadzwa-commits/freshroute/issues)
- [Changelog](./CHANGELOG.md)

---

Made with ❤️ for Zimbabwe
