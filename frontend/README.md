# Frontend - FreshRoute Web Application

React web application for the FreshRoute e-commerce platform.

## Features

- React 18 with TypeScript
- Vite for fast development and building
- React Router for navigation
- Styled Components for styling
- Axios for API calls

## Getting Started

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Application Configuration
VITE_APP_NAME=FreshRoute
VITE_APP_DESCRIPTION=Zimbabwe's Premier E-commerce Platform

# Feature Flags (optional)
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_CHAT=false
```

**Note:** Vite requires environment variables to be prefixed with `VITE_` to be exposed to the client.

### Development

Start the development server with hot module replacement:

```bash
npm run dev
```

The app will start on `http://localhost:3000` (or the next available port).

**Development Features:**
- **Hot Module Replacement (HMR)** - Instant updates without full page reload
- **Fast Refresh** - Preserves component state during updates
- **TypeScript Error Checking** - Real-time type checking in the terminal
- **ESLint Integration** - Code quality checks during development

### Production Build

Build the application for production:

```bash
npm run build
```

The build output will be in the `dist/` directory, optimized and minified.

**Build Features:**
- **Code Splitting** - Automatic code splitting for optimal loading
- **Tree Shaking** - Removes unused code
- **Minification** - Compressed JavaScript and CSS
- **Asset Optimization** - Optimized images and other assets
- **Source Maps** - Generated for debugging production issues

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

This serves the built application from the `dist/` directory.

## API Integration

### Making API Calls

Use the centralized API service in `src/services/api.ts`:

```typescript
import api from './services/api';

// GET request
const products = await api.get('/products');

// POST request
const newProduct = await api.post('/products', {
  name: 'Product Name',
  price: 99.99
});

// PUT request
const updated = await api.put('/products/123', {
  price: 89.99
});

// DELETE request
await api.delete('/products/123');
```

### Example Service

```typescript
// src/services/product.service.ts
import api from './api';
import { Product } from '@freshroute/shared';

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (product: Partial<Product>): Promise<Product> => {
    const response = await api.post('/products', product);
    return response.data;
  }
};
```

## Styling

The application uses **Styled Components** for styling.

### Theme Configuration

Define your theme in `src/styles/theme.ts`:

```typescript
export const theme = {
  colors: {
    primary: '#00a651',
    secondary: '#ffd700',
    text: '#333333',
    background: '#ffffff'
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px'
  },
  breakpoints: {
    mobile: '576px',
    tablet: '768px',
    desktop: '992px'
  }
};
```

### Example Component

```typescript
import styled from 'styled-components';

const Button = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: ${props => props.theme.spacing.medium};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

export default Button;
```

## Deployment

### Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

### Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Build and deploy:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

### Static Hosting (AWS S3, GitHub Pages, etc.)

1. Build the application:
   ```bash
   npm run build
   ```

2. Upload the `dist/` directory to your hosting provider.

3. Configure your server to:
   - Serve `index.html` for all routes (SPA routing)
   - Set appropriate cache headers
   - Enable gzip compression

### Environment Variables in Production

Set environment variables in your hosting platform:

**Vercel:** Use the dashboard or `vercel.json`
**Netlify:** Use the dashboard or `netlify.toml`
**Custom Server:** Set as system environment variables

Example `vercel.json`:
```json
{
  "env": {
    "VITE_API_URL": "https://api.freshroute.zw/api"
  }
}
```

## Project Structure

```
frontend/
├── public/              # Static assets (index.html, favicon, etc.)
├── src/
│   ├── assets/          # Images, fonts, icons, and other media files
│   ├── components/      # Reusable React components
│   │   ├── common/      # Common UI components (Button, Input, Card, etc.)
│   │   ├── layout/      # Layout components (Header, Footer, Sidebar)
│   │   └── ...          # Feature-specific components
│   ├── hooks/           # Custom React hooks
│   │   ├── useAuth.ts   # Authentication hook
│   │   ├── useCart.ts   # Shopping cart hook
│   │   └── ...
│   ├── pages/           # Page components (one per route)
│   │   ├── Home.tsx
│   │   ├── Products.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── Cart.tsx
│   │   └── ...
│   ├── services/        # API service layer
│   │   ├── api.ts       # Axios instance configuration
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   └── ...
│   ├── styles/          # Global styles and theme
│   │   ├── GlobalStyle.ts
│   │   ├── theme.ts     # Styled-components theme
│   │   └── ...
│   ├── utils/           # Utility functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── ...
│   ├── App.tsx          # Root component with routing
│   ├── main.tsx         # Application entry point
│   └── vite-env.d.ts    # Vite TypeScript definitions
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

### Component Architecture

The frontend follows a component-based architecture:

1. **Pages** - Top-level components that represent routes
2. **Layout Components** - Structural components (Header, Footer, Sidebar)
3. **Feature Components** - Components for specific features (ProductCard, CartItem)
4. **Common Components** - Reusable UI components (Button, Input, Modal)
5. **Services** - API interaction layer
6. **Hooks** - Reusable stateful logic
7. **Utils** - Pure helper functions

## Technologies

- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Styled Components** - CSS-in-JS
- **Axios** - HTTP client
