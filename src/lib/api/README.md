# 🚀 FOMI API Layer Documentation

## Overview

The API layer is designed to be **resilient to backend changes** and provide a clean interface for frontend components. It uses abstraction layers, response transformation, and error handling to ensure your frontend doesn't break when the backend API changes.

## 🏗️ Architecture

```
Frontend Components
       ↓
Custom Hooks (useAuth, useGeneration, etc.)
       ↓
API Services (auth.js, images.js, videos.js, etc.)
       ↓
Base API Client (client.js)
       ↓
Backend API
```

## 🔧 Key Features

### 1. **Response Transformation**
The API layer transforms backend responses into a consistent frontend format:

```javascript
// Backend might return:
{
  "generation": {
    "id": "gen_123",
    "status": "processing",
    "images": [...]
  }
}

// API layer transforms to:
{
  "id": "gen_123",
  "status": "processing", 
  "images": [...],
  // Always consistent structure
}
```

### 2. **Version Management**
Easy API version updates:

```javascript
// In client.js
this.version = 'v1'; // Change to 'v2' when backend updates

// All endpoints automatically use new version
```

### 3. **Error Handling**
Consistent error handling across all API calls:

```javascript
// API errors are transformed to user-friendly messages
{
  error: true,
  message: "You don't have enough credits",
  code: "INSUFFICIENT_CREDITS",
  status: 402
}
```

### 4. **Retry Logic**
Automatic retry for failed requests with exponential backoff.

### 5. **Authentication & Token Refresh**
Automatic JWT token refresh and authentication handling:

```javascript
// Automatic token refresh on 401 errors
// Queue management for concurrent requests
// Persistent authentication state
```

## 📁 File Structure

```
src/lib/api/
├── client.js          # Base API client with error handling & auth
├── auth.js            # Authentication API service
├── images.js          # Image generation API
├── videos.js          # Video generation API
├── gallery.js         # Gallery API
└── README.md          # This file

src/lib/store/
├── authStore.js       # Authentication state management
├── generationStore.js # Generation state management
└── ...

src/lib/hooks/
├── useAuth.js         # Authentication hook
├── useGeneration.js   # Generation hook
└── ...

src/types/
└── api.js             # Type definitions and validation
```

## 🎯 How It Handles Backend Changes

### **Scenario 1: Endpoint URL Changes**

**Before:**
```javascript
// Backend changes from /images/generate to /generations/create
```

**Solution:**
```javascript
// Only change in images.js
async generateImage(params) {
  // Change this line:
  const response = await apiClient.post('/generations/create', params);
  // Everything else stays the same!
}
```

### **Scenario 2: Response Structure Changes**

**Before:**
```javascript
// Backend response
{
  "generation": { "id": "123", "status": "done" }
}
```

**After:**
```javascript
// Backend changes to
{
  "result": { "generationId": "123", "state": "completed" }
}
```

**Solution:**
```javascript
// Update transformGenerationResponse() in images.js
transformGenerationResponse(response) {
  // Handle both old and new formats
  const generation = response.generation || response.result;
  
  return {
    id: generation.id || generation.generationId,
    status: generation.status || generation.state,
    // ... rest stays the same
  };
}
```

### **Scenario 3: New Required Fields**

**Before:**
```javascript
// Backend adds required "model" field
```

**Solution:**
```javascript
// Update in images.js
async generateImage(params) {
  // Add default value
  const requestData = {
    ...params,
    model: params.model || 'stable-diffusion-xl', // Default fallback
  };
  
  const response = await apiClient.post('/images/generate', requestData);
  return this.transformGenerationResponse(response);
}
```

### **Scenario 4: Authentication Changes**

**Before:**
```javascript
// Backend changes auth header format
```

**Solution:**
```javascript
// Update in client.js
createHeaders(customHeaders = {}) {
  const token = this.getAuthToken();
  return {
    'Content-Type': 'application/json',
    // Change this line:
    ...(token && { 'X-Auth-Token': token }), // New header format
    ...customHeaders,
  };
}
```

## 🔄 Migration Strategy

When the backend team makes changes:

### **1. API Version Update**
```javascript
// In client.js
this.version = 'v2'; // Update version
```

### **2. Update Service Layer**
```javascript
// In images.js, videos.js, etc.
// Update only the API calls, keep transformations the same
```

### **3. Test Transformations**
```javascript
// Ensure response transformations handle new format
transformGenerationResponse(response) {
  // Update to handle new response structure
}
```

### **4. Update Types (Optional)**
```javascript
// In types/api.js
// Update JSDoc types if needed
```

## 🛡️ Benefits

### **Frontend Stability**
- Components don't need to change when API changes
- Consistent data structure across the app
- Graceful handling of API errors
- Automatic authentication management

### **Development Experience**
- Type safety with JSDoc
- IntelliSense support
- Easy debugging with error boundaries
- Centralized state management

### **Maintainability**
- Single place to update API logic
- Reusable across components
- Easy to test and mock
- Automatic token refresh

## 📝 Usage Examples

### **Authentication in Components:**
```javascript
import useAuth from '@/lib/hooks/useAuth';

function LoginForm() {
  const { register, loginWithGoogle, isLoading, error } = useAuth();
  
  const handleRegister = async () => {
    try {
      await register({
        email: "user@example.com",
        password: "password123",
        name: "John Doe"
      });
    } catch (error) {
      console.log(error.message);
    }
  };
}
```

### **Generation with Authentication:**
```javascript
import useGeneration from '@/lib/hooks/useGeneration';
import useAuth from '@/lib/hooks/useAuth';

function ImageGenerator() {
  const { generateImage, isLoading } = useGeneration();
  const { isAuthenticated, userCredits, hasEnoughCredits } = useAuth();
  
  const handleGenerate = async () => {
    if (!isAuthenticated) {
      // Redirect to login
      return;
    }
    
    if (!hasEnoughCredits(1)) {
      // Show insufficient credits message
      return;
    }
    
    await generateImage({
      prompt: "A beautiful sunset",
      numImages: 4
    });
  };
}
```

### **Direct API Usage:**
```javascript
import authApiService from '@/lib/api/auth';
import imageApiService from '@/lib/api/images';

// Register user
const authResponse = await authApiService.registerUser({
  email: "user@example.com",
  password: "password123",
  name: "John Doe"
});

// Generate image
const generation = await imageApiService.generateImage({
  prompt: "A beautiful sunset"
});
```

## 🚨 Error Handling

The API layer provides consistent error handling:

```javascript
// All errors are transformed to this format:
{
  error: true,
  message: "User-friendly error message",
  code: "ERROR_CODE",
  status: 400,
  details: { /* additional info */ }
}
```

## 🔧 Configuration

Environment variables for API configuration:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.fomi.com/v1
NEXT_PUBLIC_WS_URL=wss://api.fomi.com/v1/ws
```

## 📊 Monitoring

The API layer includes built-in monitoring:

- Request/response logging
- Error tracking
- Performance metrics
- Retry attempts
- Authentication state tracking

## 🎯 Best Practices

1. **Always use the service layer** - Don't call the base client directly
2. **Transform responses** - Keep frontend data structure consistent
3. **Handle errors gracefully** - Use error boundaries and user-friendly messages
4. **Use TypeScript/JSDoc** - For better development experience
5. **Test API changes** - Update tests when API changes
6. **Document changes** - Update this README when making changes
7. **Use custom hooks** - For consistent state management
8. **Validate inputs** - Use type validation helpers

## 🔄 Migration Checklist

When backend changes:

- [ ] Update API version in `client.js`
- [ ] Update endpoint URLs in service files
- [ ] Update response transformations
- [ ] Update type definitions
- [ ] Test all API calls
- [ ] Update documentation
- [ ] Deploy with feature flags if needed

## 🔐 Authentication Features

### **Automatic Token Refresh**
- JWT tokens are automatically refreshed before expiry
- Failed requests due to expired tokens are retried
- Queue management for concurrent requests during refresh

### **Persistent Authentication**
- Tokens are stored in localStorage
- Authentication state persists across page reloads
- Automatic logout on invalid tokens

### **Error Handling**
- 401 errors trigger automatic token refresh
- Failed refresh results in automatic logout
- User-friendly error messages for auth failures

This architecture ensures your frontend remains stable and maintainable even when the backend API evolves! 🚀
