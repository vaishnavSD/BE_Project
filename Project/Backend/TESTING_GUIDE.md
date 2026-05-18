# Testing Guide

## Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests with detailed output
npm run test:verbose
```

## Test Structure

```
Backend/
├── tests/
│   ├── setup.js                    # Global test configuration
│   ├── unit/
│   │   ├── controllers/            # Controller tests
│   │   │   └── users.controller.test.js
│   │   ├── models/                 # Model tests
│   │   │   └── users.model.test.js
│   │   └── middleware/             # Middleware tests
│   │       └── validation.middleware.test.js
│   ├── integration/                # Integration tests (future)
│   └── fixtures/                   # Test data (future)
```

## Writing Tests

### Controller Test Example

```javascript
import { registerUser } from '../../../controllers/users.controller.js';
import * as usersModel from '../../../models/users.model.js';

jest.mock('../../../models/users.model.js');

describe('Users Controller', () => {
  let req, res;

  beforeEach(() => {
    req = mockReq();  // From global setup
    res = mockRes();  // From global setup
  });

  it('should register a new user successfully', async () => {
    // Arrange
    req.body = {
      name: 'John Doe',
      email: 'john@example.com',
      mobile_No: '1234567890',
      address: '123 Main St',
      role: 'agent',
      password: 'Password123'
    };
    usersModel.adduser.mockResolvedValue(1);

    // Act
    await registerUser(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'User registered successfully',
      userId: 1
    });
  });
});
```

### Model Test Example

```javascript
import { adduser } from '../../../models/users.model.js';

describe('Users Model', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = { query: jest.fn() };
  });

  it('should insert a new user', async () => {
    mockDb.query.mockResolvedValue([{ insertId: 1 }]);

    const result = await adduser(mockDb, {
      name: 'John',
      email: 'john@example.com',
      mobile_No: '1234567890',
      address: '123 Main St',
      role: 'agent',
      password: 'hashed'
    });

    expect(result).toBe(1);
    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO users'),
      expect.any(Array)
    );
  });
});
```

### Validation Test Example

```javascript
import { validateEmail } from '../../../middleware/validation.middleware.js';

describe('Validation Middleware', () => {
  it('should validate correct email formats', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('invalid')).toBe(false);
  });
});
```

## Test Utilities

### Global Mocks (from setup.js)

```javascript
// Mock database
const mockDb = global.mockDb;

// Mock request
const req = mockReq({
  body: { name: 'John' },
  params: { id: '1' },
  query: { page: '1' }
});

// Mock response
const res = mockRes();
expect(res.status).toHaveBeenCalledWith(200);
expect(res.json).toHaveBeenCalledWith({ success: true });
```

## Coverage Report

After running `npm run test:coverage`, open:
```
Backend/coverage/lcov-report/index.html
```

### Coverage Goals
- **Statements:** 80%+
- **Branches:** 75%+
- **Functions:** 80%+
- **Lines:** 80%+

## Best Practices

### 1. Test Naming
```javascript
// ✅ Good: Descriptive test names
it('should return 400 when email is invalid', () => {});

// ❌ Bad: Vague test names
it('test email', () => {});
```

### 2. Arrange-Act-Assert Pattern
```javascript
it('should do something', () => {
  // Arrange: Set up test data
  const input = { name: 'John' };
  
  // Act: Execute the function
  const result = doSomething(input);
  
  // Assert: Verify the result
  expect(result).toBe(expected);
});
```

### 3. Test One Thing
```javascript
// ✅ Good: Tests one specific behavior
it('should return 400 when name is missing', () => {});
it('should return 400 when email is invalid', () => {});

// ❌ Bad: Tests multiple things
it('should validate all fields', () => {});
```

### 4. Mock External Dependencies
```javascript
// ✅ Good: Mock database calls
jest.mock('../../../models/users.model.js');
usersModel.adduser.mockResolvedValue(1);

// ❌ Bad: Real database calls in unit tests
// (Use integration tests for this)
```

### 5. Clean Up After Tests
```javascript
beforeEach(() => {
  jest.clearAllMocks();  // Automatically done in setup.js
});

afterEach(() => {
  // Clean up any test-specific resources
});
```

## Common Test Scenarios

### Testing Success Cases
```javascript
it('should create user successfully', async () => {
  req.body = validUserData;
  usersModel.adduser.mockResolvedValue(1);
  
  await registerUser(req, res);
  
  expect(res.status).toHaveBeenCalledWith(201);
});
```

### Testing Validation Errors
```javascript
it('should reject invalid email', async () => {
  req.body = { ...validUserData, email: 'invalid' };
  
  await registerUser(req, res);
  
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({
    error: 'Invalid email format'
  });
});
```

### Testing Database Errors
```javascript
it('should handle duplicate entry error', async () => {
  req.body = validUserData;
  usersModel.adduser.mockRejectedValue({ code: 'ER_DUP_ENTRY' });
  
  await registerUser(req, res);
  
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({
    error: 'User with this mobile number already exists'
  });
});
```

### Testing Not Found Cases
```javascript
it('should return 404 when user not found', async () => {
  req.params = { id: '999' };
  usersModel.getUserById.mockResolvedValue(null);
  
  await deleteUserById(req, res);
  
  expect(res.status).toHaveBeenCalledWith(404);
});
```

### Testing Authorization
```javascript
it('should prevent deletion of admin users', async () => {
  req.params = { id: '1' };
  usersModel.getUserById.mockResolvedValue({ role: 'admin' });
  
  await deleteUserById(req, res);
  
  expect(res.status).toHaveBeenCalledWith(403);
  expect(usersModel.deleteUser).not.toHaveBeenCalled();
});
```

## Debugging Tests

### Run Single Test File
```bash
npm test users.controller.test.js
```

### Run Single Test Suite
```bash
npm test -- --testNamePattern="registerUser"
```

### Run with Debugging
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

Then open Chrome DevTools: `chrome://inspect`

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## Test Coverage Current Status

| File | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| users.controller.js | 95% | 90% | 100% | 95% |
| users.model.js | 100% | 100% | 100% | 100% |
| validation.middleware.js | 100% | 95% | 100% | 100% |
| **Overall** | **30%** | **25%** | **30%** | **30%** |

**Target:** 80% overall coverage

## Next Steps

1. ✅ Run tests: `npm test`
2. ✅ Check coverage: `npm run test:coverage`
3. ⏳ Add controller tests for remaining files
4. ⏳ Add model tests for remaining files
5. ⏳ Add integration tests
6. ⏳ Set up CI/CD pipeline

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
