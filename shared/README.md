# Shared - FreshRoute Shared Library

Shared types, utilities, constants, and validators used across FreshRoute projects.

## Features

- TypeScript types and interfaces
- Common utilities and helper functions
- Shared constants
- Validation functions
- Currency and date formatting
- Zimbabwe-specific utilities

## Installation

This package is part of the monorepo and is automatically linked to other workspaces.

## Usage

### In Backend

```typescript
import { User, UserRole, isValidEmail } from '@freshroute/shared';

const user: User = {
  id: '1',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: UserRole.CUSTOMER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const valid = isValidEmail(user.email);
```

### In Frontend/Mobile

```typescript
import { Product, formatCurrency, ZIMBABWE_PROVINCES } from '@freshroute/shared';

const price = formatCurrency(100, 'USD'); // "$100.00"
const provinces = ZIMBABWE_PROVINCES;
```

## Structure

```
shared/
├── src/
│   ├── types/          # TypeScript interfaces and types
│   ├── constants/      # App-wide constants
│   ├── utils/          # Utility functions
│   ├── validators/     # Validation functions
│   └── index.ts        # Main export file
└── package.json
```

## Build

```bash
npm run build
```

## Development

```bash
npm run dev
```

## Contents

### Types

- User, UserRole
- Product, Currency
- Order, OrderStatus, OrderItem
- Address
- ApiResponse, PaginatedResponse

### Constants

- API_VERSION, API_TIMEOUT
- DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
- ZIMBABWE_PROVINCES
- PRODUCT_CATEGORIES
- SUPPORTED_CURRENCIES
- ORDER_STATUS_COLORS
- APP_NAME, APP_DESCRIPTION

### Utils

- isValidEmail
- isValidZimbabwePhone
- isStrongPassword
- formatCurrency
- formatDate
- truncateText
- generateSlug
- calculateDiscount

### Validators

- validateUserRegistration
- validateProduct
