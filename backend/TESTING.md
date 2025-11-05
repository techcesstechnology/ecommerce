# Testing Guide

This document provides comprehensive information about testing in the FreshRoute backend application.

## Table of Contents

1. [Test Structure](#test-structure)
2. [Running Tests](#running-tests)
3. [Test Types](#test-types)
4. [Writing Tests](#writing-tests)
5. [Test Coverage](#test-coverage)
6. [CI/CD Integration](#cicd-integration)

## Test Structure

Tests are organized in the `src/__tests__` directory with the following structure:

```
src/__tests__/
├── fixtures/          # Test data factories
│   ├── user.factory.ts
│   └── product.factory.ts
├── utils/            # Test utilities and helpers
│   ├── test-db.ts
│   ├── test-helpers.ts
│   └── performance.utils.ts
├── integration/      # Integration tests
│   └── user.service.integration.test.ts
├── api/             # API endpoint tests
│   └── auth.api.test.ts
├── e2e/             # End-to-end tests (Playwright)
│   └── auth.e2e.test.ts
├── performance/     # Performance tests
│   └── api.performance.test.ts
└── *.test.ts        # Unit tests
```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### API Tests
```bash
npm run test:api
```

### E2E Tests
```bash
npm run test:e2e
```

### Performance Tests
```bash
npm run test:performance
```

### Test Coverage
```bash
npm run test:coverage
```

### Watch Mode
```bash
npm run test:watch
```

## Test Types

### 1. Unit Tests

Unit tests test individual functions, classes, and components in isolation.

**Location:** `src/__tests__/*.test.ts`

**Example:**
```typescript
describe('AuthService', () => {
  it('should hash a password', async () => {
    const password = 'TestPassword123!';
    const hash = await authService.hashPassword(password);
    expect(hash).toBeDefined();
  });
});
```

### 2. Integration Tests

Integration tests verify that different parts of the system work together correctly, including database interactions.

**Location:** `src/__tests__/integration/*.integration.test.ts`

**Example:**
```typescript
describe('UserService Integration Tests', () => {
  beforeAll(async () => {
    await initTestDatabase();
  });

  it('should create a new user', async () => {
    const user = await userService.createUser(userData);
    expect(user.id).toBeDefined();
  });
});
```

### 3. API Tests

API tests verify that REST API endpoints work correctly, including request/response handling and validation.

**Location:** `src/__tests__/api/*.api.test.ts`

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

End-to-end tests simulate real user interactions using Playwright.

**Location:** `src/__tests__/e2e/*.e2e.test.ts`

**Example:**
```typescript
test('should login with valid credentials', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.click('button[type="submit"]');
});
```

### 5. Performance Tests

Performance tests measure response times, throughput, and system behavior under load.

**Location:** `src/__tests__/performance/*.performance.test.ts`

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

## Writing Tests

### Test Factories

Use test factories to create consistent test data:

```typescript
import { buildUser, buildUserWithHashedPassword } from '../fixtures/user.factory';

const userData = await buildUserWithHashedPassword({
  email: 'test@example.com',
  role: 'admin',
});
```

### Test Helpers

Use helper functions for common operations:

```typescript
import { randomEmail, createMockRequest } from '../utils/test-helpers';

const email = randomEmail();
const req = createMockRequest({ body: { email } });
```

### Database Testing

For tests that need database access:

```typescript
import { initTestDatabase, cleanDatabase, closeTestDatabase } from '../utils/test-db';

beforeAll(async () => {
  await initTestDatabase();
});

afterEach(async () => {
  await cleanDatabase(); // Clean data between tests
});

afterAll(async () => {
  await closeTestDatabase();
});
```

## Test Coverage

### Coverage Thresholds

The project maintains the following coverage thresholds:
- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%
- **Statements:** 70%

### Viewing Coverage Reports

After running `npm run test:coverage`, open the HTML report:

```bash
open coverage/index.html
```

### Coverage Reports

Coverage reports are generated in multiple formats:
- **Text:** Console output
- **HTML:** `coverage/index.html`
- **LCOV:** `coverage/lcov.info` (for CI tools)
- **JSON Summary:** `coverage/coverage-summary.json`

## Test Environment

### Environment Variables

Tests use the following environment variables (configured in `src/__tests__/setup.ts`):

```
NODE_ENV=test
DB_HOST=localhost
DB_PORT=5432
DB_NAME=test_db
DB_USER=test_user
DB_PASSWORD=test_password
JWT_SECRET=test_jwt_secret_at_least_32_characters_long_12345
JWT_REFRESH_SECRET=test_refresh_secret_at_least_32_characters_long_12345
```

### Test Database

Integration tests require a PostgreSQL test database. Configure it using the environment variables above.

## CI/CD Integration

### GitHub Actions

The project includes GitHub Actions workflows for automated testing. Tests run on:
- Every pull request
- Every push to main branch
- Scheduled runs (nightly)

### Running Tests in CI

Tests automatically run in CI with the following configuration:

```yaml
- name: Run tests
  run: npm test

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

## Best Practices

1. **Write descriptive test names** - Use clear, descriptive names that explain what is being tested
2. **Follow AAA pattern** - Arrange, Act, Assert
3. **Keep tests independent** - Tests should not depend on each other
4. **Use factories** - Use test factories for consistent test data
5. **Clean up** - Always clean up test data after tests
6. **Mock external dependencies** - Mock external APIs and services
7. **Test edge cases** - Include tests for error conditions and edge cases
8. **Keep tests fast** - Unit tests should be fast; use integration tests sparingly

## Troubleshooting

### Tests Timing Out

If tests are timing out, increase the timeout in `jest.config.js`:

```javascript
testTimeout: 30000, // 30 seconds
```

### Database Connection Issues

Ensure your test database is running and accessible:

```bash
# Check PostgreSQL is running
psql -h localhost -U test_user -d test_db
```

### Module Not Found

If you encounter module resolution errors, check `tsconfig.json` paths configuration.

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)
