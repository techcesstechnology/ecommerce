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

1. Build the backend:
   ```bash
   npm run build:backend
   ```
2. Set environment variables on your hosting platform
3. Deploy the `backend/dist` directory
4. Ensure PostgreSQL and Redis are accessible

See [Backend README](./backend/README.md#deployment) for detailed deployment instructions.

### Frontend

The frontend can be deployed to static hosting services (Vercel, Netlify, AWS S3, etc.)

1. Build the frontend:
   ```bash
   npm run build:frontend
   ```
2. Deploy the `frontend/dist` directory to your hosting service
3. Configure environment variables for production

See [Frontend README](./frontend/README.md#deployment) for platform-specific deployment guides.

### Mobile

The mobile app can be built and deployed to:

- **iOS:** App Store (requires Apple Developer account)
- **Android:** Google Play Store (requires Google Play Developer account)

See [Mobile README](./mobile/README.md#publishing) for detailed publishing instructions.

## 🔧 Troubleshooting

### Common Issues

**Issue:** Port 5000 already in use
```bash
# Solution: Change the port in .env
BACKEND_PORT=5001
```

**Issue:** Database connection error
```bash
# Solution: Ensure PostgreSQL is running and credentials are correct
# Check backend logs for specific error messages
```

**Issue:** CORS errors in frontend
```bash
# Solution: Add frontend URL to CORS_ORIGIN in .env
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

**Issue:** Module not found errors
```bash
# Solution: Reinstall dependencies
npm install
npm run install-all
```

**Issue:** TypeScript compilation errors
```bash
# Solution: Rebuild shared package first
npm run build:shared
```

**Issue:** Expo app won't connect
```bash
# Solution: Ensure devices are on same network
# Try using tunnel mode: expo start --tunnel
```

### Getting Help

If you encounter issues:
1. Check the [documentation](./API_DOCUMENTATION.md)
2. Search existing [GitHub Issues](https://github.com/edmundtafadzwa-commits/freshroute/issues)
3. Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/freshroute.git
   cd freshroute
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```

### Making Changes

1. Make your changes in the appropriate workspace (backend, frontend, mobile, or shared)
2. Follow the existing code style and conventions
3. Write or update tests for your changes
4. Ensure all tests pass:
   ```bash
   npm test
   ```
5. Lint your code:
   ```bash
   npm run lint
   ```
6. Commit your changes with a clear message:
   ```bash
   git commit -m 'Add amazing feature'
   ```

### Submitting Changes

1. **Push to your fork:**
   ```bash
   git push origin feature/amazing-feature
   ```
2. **Open a Pull Request** on GitHub
3. Describe your changes clearly in the PR description
4. Link any related issues
5. Wait for review and address any feedback

### Contribution Guidelines

- **Code Style:** Follow the existing TypeScript and React conventions
- **Commits:** Use clear, descriptive commit messages
- **Tests:** Add tests for new features and bug fixes
- **Documentation:** Update relevant documentation for your changes
- **Pull Requests:** Keep PRs focused on a single feature or fix
- **Issues:** Check existing issues before creating new ones

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect different viewpoints and experiences

### Areas Where You Can Contribute

- 🐛 **Bug Fixes:** Find and fix bugs
- ✨ **New Features:** Implement new functionality
- 📝 **Documentation:** Improve or add documentation
- 🎨 **UI/UX:** Enhance user interface and experience
- 🧪 **Testing:** Add or improve test coverage
- 🌍 **Localization:** Add support for more languages
- ⚡ **Performance:** Optimize code and improve performance

### Questions?

If you have questions about contributing, please:
- Check the [documentation](./API_DOCUMENTATION.md)
- Open a [GitHub Issue](https://github.com/edmundtafadzwa-commits/freshroute/issues)
- Join our community discussions

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

FreshRoute Team - Building the future of e-commerce in Zimbabwe

## 📚 Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Complete REST API reference
- **Backend** - [Backend README](./backend/README.md)
- **Frontend** - [Frontend README](./frontend/README.md)
- **Mobile** - [Mobile README](./mobile/README.md)
- **Shared** - [Shared Library README](./shared/README.md)

## 🔗 Links

- [Issue Tracker](https://github.com/edmundtafadzwa-commits/freshroute/issues)
- [Changelog](./CHANGELOG.md)

---

Made with ❤️ for Zimbabwe
