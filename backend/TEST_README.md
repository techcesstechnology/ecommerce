# FreshRoute Testing Suite

## Overview

This document provides a comprehensive overview of the FreshRoute backend testing infrastructure. The test suite includes unit tests, integration tests, API tests, E2E tests, and performance tests.

## Quick Start

### Prerequisites

- Node.js 18.x or 20.x
- PostgreSQL 15+
- Redis 7+ (optional for some tests)

### Installation

```bash
# Install dependencies
cd backend
npm install

# Set up test database
createdb test_db
psql test_db < path/to/schema.sql
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests
npm run test:api          # API tests
npm run test:e2e          # E2E tests
npm run test:performance  # Performance tests

# Coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

## Test Structure

```
backend/
├── src/
│   └── __tests__/
│       ├── fixtures/              # Test data factories
│       │   ├── user.factory.ts
│       │   ├── product.factory.ts
│       │   └── index.ts
│       ├── utils/                 # Test utilities
│       │   ├── test-db.ts        # Database utilities
│       │   ├── test-helpers.ts   # Helper functions
│       │   ├── performance.utils.ts
│       │   └── index.ts
│       ├── integration/           # Integration tests
│       │   ├── user.service.integration.test.ts
│       │   ├── product.service.integration.test.ts
│       │   └── auth.flow.integration.test.ts
│       ├── api/                   # API endpoint tests
│       │   └── auth.api.test.ts
│       ├── e2e/                   # End-to-end tests
│       │   └── auth.e2e.test.ts
│       ├── performance/           # Performance tests
│       │   └── api.performance.test.ts
│       ├── setup.ts              # Global test setup
│       └── *.test.ts             # Unit tests
├── jest.config.js                # Jest configuration
├── playwright.config.ts          # Playwright configuration
├── .env.test                     # Test environment variables
└── TESTING.md                    # Detailed testing guide
```

## Test Categories

### 1. Unit Tests (149 tests)

Test individual functions and classes in isolation.

**Location:** `src/__tests__/*.test.ts`

**Coverage:**
- Authentication Service
- Middleware (auth, error handling, validation, sanitization)
- Configuration Service
- Logger Service
- Custom Errors

**Example:**
```typescript
describe('AuthService', () => {
  it('should hash a password', async () => {
    const hash = await authService.hashPassword('TestPassword123!');
    expect(hash).toBeDefined();
  });
});
```

### 2. Integration Tests

Test database interactions and service integrations.

**Location:** `src/__tests__/integration/*.integration.test.ts`

**Coverage:**
- User CRUD operations
- Product CRUD operations
- Authentication flows (registration, login, password reset, 2FA)
- Email verification
- Account security

**Example:**
```typescript
describe('UserService Integration Tests', () => {
  it('should create a new user', async () => {
    const user = await userService.createUser(userData);
    expect(user.id).toBeDefined();
  });
});
```

### 3. API Tests

Test REST API endpoints with request/response validation.

**Location:** `src/__tests__/api/*.api.test.ts`

**Coverage:**
- Authentication endpoints (register, login, logout, refresh, me)
- Request validation
- Error responses
- Status codes

**Example:**
```typescript
describe('Authentication API Tests', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);
  });
});
```

### 4. E2E Tests

Test complete user workflows using Playwright.

**Location:** `src/__tests__/e2e/*.e2e.test.ts`

**Coverage:**
- User registration flow
- Login/logout flow
- Password reset flow
- Form validation

**Example:**
```typescript
test('should login with valid credentials', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.click('button[type="submit"]');
});
```

### 5. Performance Tests

Test system performance under load.

**Location:** `src/__tests__/performance/*.performance.test.ts`

**Coverage:**
- Load testing (concurrent users)
- Response time benchmarks
- Stress testing
- Throughput measurement

**Example:**
```typescript
it('should handle concurrent requests', async () => {
  const metrics = await performLoadTest({
    url: '/api/health',
    concurrentUsers: 50,
  });
  expect(metrics.averageResponseTime).toBeLessThan(1000);
});
```

## Test Utilities

### Test Factories

Create consistent test data:

```typescript
import { buildUser, buildProduct } from '../fixtures';

const user = buildUser({ role: 'admin' });
const product = buildProduct({ featured: true });
```

### Database Utilities

Manage test database:

```typescript
import { initTestDatabase, cleanDatabase, closeTestDatabase } from '../utils';

beforeAll(async () => await initTestDatabase());
afterEach(async () => await cleanDatabase());
afterAll(async () => await closeTestDatabase());
```

### Helper Functions

Common test operations:

```typescript
import { randomEmail, createMockRequest, createMockResponse } from '../utils';

const email = randomEmail();
const req = createMockRequest({ body: { email } });
const res = createMockResponse();
```

## Coverage Requirements

The project maintains minimum coverage thresholds:

- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%
- **Statements:** 70%

View coverage report:
```bash
npm run test:coverage
open coverage/index.html
```

## CI/CD Integration

Tests automatically run on:
- Every pull request
- Every push to main/develop branches
- Scheduled nightly runs

### GitHub Actions Workflow

The `.github/workflows/backend-tests.yml` workflow:
1. Sets up PostgreSQL and Redis services
2. Runs tests on Node.js 18.x and 20.x
3. Generates coverage reports
4. Uploads coverage to Codecov
5. Runs E2E tests with Playwright

## Best Practices

### Writing Tests

1. **Use descriptive names**: Clearly state what is being tested
2. **Follow AAA pattern**: Arrange, Act, Assert
3. **Keep tests independent**: No test should depend on another
4. **Use factories**: Consistent test data creation
5. **Clean up**: Always clean test data after tests
6. **Mock external services**: Use mocks for APIs and services
7. **Test edge cases**: Include error conditions

### Test Organization

1. **Group related tests**: Use `describe` blocks
2. **Single responsibility**: One test per behavior
3. **Meaningful assertions**: Test what matters
4. **Avoid test interdependence**: Tests should run in any order

### Performance

1. **Keep unit tests fast**: < 100ms per test
2. **Use beforeAll wisely**: Initialize once when possible
3. **Clean up efficiently**: Use afterEach for cleanup
4. **Parallel execution**: Tests run in parallel by default

## Troubleshooting

### Common Issues

#### Tests Timeout
```javascript
// Increase timeout in jest.config.js
testTimeout: 30000
```

#### Database Connection Errors
```bash
# Check PostgreSQL is running
pg_isready

# Verify connection
psql -h localhost -U test_user -d test_db
```

#### Module Resolution
Check `tsconfig.json` paths and ensure all dependencies are installed.

#### Test Flakiness
- Ensure proper cleanup between tests
- Avoid time-dependent tests
- Use proper async/await patterns

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [TypeORM Documentation](https://typeorm.io/)

## Contributing

When adding new tests:

1. Follow existing patterns
2. Update test documentation
3. Ensure coverage thresholds are met
4. Run full test suite before committing
5. Add tests for new features

## License

MIT
