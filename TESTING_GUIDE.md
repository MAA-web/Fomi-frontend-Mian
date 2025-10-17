# 🧪 Testing Guide for FOMI Authentication Services

This guide will help you test all the authentication services including user signup, login, profile editing, and credit system.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Manual Testing](#manual-testing)
3. [Automated Testing](#automated-testing)
4. [Testing Scenarios](#testing-scenarios)
5. [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### 1. Install Testing Dependencies

```bash
npm install
```

### 2. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### 3. Access Manual Testing Interface

Start your development server and navigate to:
```
http://localhost:3000/testing
```

## 🖱️ Manual Testing

### Using the AuthTester Component

The `AuthTester` component provides a visual interface to test all authentication features:

#### **Current Status Panel**
- Shows authentication status (green/red indicator)
- Displays loading state
- Shows current user credits
- Displays current user name
- Shows any errors

#### **Registration Form**
1. Fill in email, password, and name
2. Click "Register" button
3. Check test results for success/failure

#### **Profile Update Form**
1. Fill in new name and/or email
2. Click "Update Profile" button
3. Verify the update in test results

#### **Test Actions**
- **Google Login**: Tests Google OAuth integration
- **Get Profile**: Fetches current user profile
- **Health Check**: Tests API service health
- **Logout**: Logs out current user

#### **Credits System**
- Enter amount of credits to add
- Click "Add Credits" button
- Verify credit balance updates

#### **Test Results**
- Real-time feedback for all operations
- Success/failure indicators
- Timestamps for each test
- Clear results button to reset

## 🤖 Automated Testing

### Running Unit Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test auth.test.js

# Run tests with verbose output
npm test -- --verbose

# Run tests matching a pattern
npm test -- --testNamePattern="register"
```

### Test Coverage

```bash
# Generate coverage report
npm run test:coverage

# Coverage will be available in:
# - Console output
# - coverage/lcov-report/index.html
```

### Test Structure

```
src/lib/api/__tests__/
├── auth.test.js          # Authentication service tests
├── client.test.js        # Base API client tests
└── images.test.js        # Image generation tests (future)
```

## 🎯 Testing Scenarios

### 1. User Registration Flow

```javascript
// Test successful registration
const testData = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
};

// Expected: User created, tokens received, automatic login
```

### 2. Google OAuth Flow

```javascript
// Test Google login
const mockIdToken = 'mock-google-id-token';

// Expected: User authenticated, profile fetched, tokens stored
```

### 3. Profile Management

```javascript
// Test profile update
const updates = {
  name: 'Updated Name',
  email: 'newemail@example.com'
};

// Expected: Profile updated, state refreshed
```

### 4. Credit System

```javascript
// Test credit addition
const userId = 'user123';
const amount = 50;

// Expected: Credits added, balance updated
```

### 5. Token Refresh

```javascript
// Test automatic token refresh
// 1. Make request with expired token
// 2. Receive 401 response
// 3. Automatically refresh token
// 4. Retry original request

// Expected: Seamless token refresh, no user interruption
```

### 6. Error Handling

```javascript
// Test various error scenarios:
// - Invalid email format
// - Weak password
// - Network errors
// - Server errors
// - Invalid tokens

// Expected: User-friendly error messages, proper error recovery
```

## 🔧 Testing Configuration

### Environment Variables

Create a `.env.local` file for testing:

```env
# Development API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Test API (for automated tests)
NEXT_PUBLIC_API_BASE_URL=https://test-api.fomi.com/v1

# Mock mode (for testing without backend)
NEXT_PUBLIC_MOCK_API=true
```

### Jest Configuration

The Jest configuration is in `package.json`:

```json
{
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
    "moduleNameMapping": {
      "^@/(.*)$": "<rootDir>/src/$1"
    },
    "collectCoverageFrom": [
      "src/**/*.{js,jsx}",
      "!src/**/*.test.{js,jsx}"
    ]
  }
}
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Tests Failing with Network Errors

```bash
# Check if backend is running
curl http://localhost:8000/api/v1/users/health

# Use mock mode for testing
NEXT_PUBLIC_MOCK_API=true npm test
```

#### 2. localStorage Not Available in Tests

```javascript
// Jest setup already mocks localStorage
// If you need custom localStorage behavior:

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});
```

#### 3. Authentication State Not Persisting

```javascript
// Check if Zustand persistence is working
// Verify localStorage is being used correctly

// In browser console:
localStorage.getItem('fomi_token')
localStorage.getItem('fomi_refresh_token')
```

#### 4. Token Refresh Not Working

```javascript
// Check if refresh token is valid
// Verify refresh endpoint is accessible

// Test refresh manually:
const refreshToken = localStorage.getItem('fomi_refresh_token');
fetch('/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refresh_token: refreshToken })
});
```

### Debug Mode

Enable debug logging:

```javascript
// In your component or test
localStorage.setItem('debug', 'true');

// Or set environment variable
NEXT_PUBLIC_DEBUG=true npm run dev
```

## 📊 Test Coverage Goals

- **Authentication Service**: 90%+
- **API Client**: 95%+
- **Custom Hooks**: 85%+
- **Components**: 80%+

## 🔄 Continuous Testing

### Pre-commit Hooks

Add to your development workflow:

```bash
# In package.json scripts
"precommit": "npm test && npm run lint"

# Install husky for git hooks
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run precommit"
```

### CI/CD Integration

Example GitHub Actions workflow:

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
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

## 📝 Test Documentation

### Writing New Tests

1. **Follow the naming convention**: `*.test.js`
2. **Use descriptive test names**: `should register user successfully`
3. **Test both success and failure cases**
4. **Mock external dependencies**
5. **Test edge cases and error conditions**

### Example Test Structure

```javascript
describe('FeatureName', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something successfully', async () => {
    // Arrange
    // Act
    // Assert
  });

  it('should handle errors gracefully', async () => {
    // Test error scenarios
  });
});
```

## 🎉 Success Criteria

Your authentication system is working correctly when:

✅ **Registration**: Users can sign up and are automatically logged in
✅ **Login**: Google OAuth works seamlessly
✅ **Profile Management**: Users can update their information
✅ **Credits**: Credit system functions properly
✅ **Token Refresh**: Authentication persists across sessions
✅ **Error Handling**: User-friendly error messages
✅ **Security**: Tokens are properly managed and secured

---

## 🚀 Next Steps

1. **Run the manual tests** using the AuthTester component
2. **Execute automated tests** to verify functionality
3. **Check test coverage** to ensure comprehensive testing
4. **Set up CI/CD** for continuous testing
5. **Document any issues** found during testing

Happy testing! 🧪✨
