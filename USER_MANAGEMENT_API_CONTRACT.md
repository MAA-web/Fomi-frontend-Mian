# 🔐 **FOMI User Management API Contract**

## **📋 Overview**
This document outlines the complete user management system requirements for the FOMI AI platform, including authentication, profile management, subscription handling, and user preferences.

---

## **🌐 Base URL Structure**
```
https://api.tarum.ai/user-service/
```

---

## **🔐 Authentication Endpoints**

### **1. Health Check**
```http
GET /users/health
```
**Authentication:** None (Public endpoint)
**Response:**
```json
{
  "status": "ok",
  "message": "User service is healthy",
  "isHealthy": true
}
```

### **2. User Registration**
```http
POST /auth/register
```
**Authentication:** None
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123!",
  "first_name": "John",
  "last_name": "Doe",
  "avatar_url": "https://example.com/avatar.jpg"
}
```
**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user_id": "uuid-of-the-user",
  "token": "jwt-access-token",
  "refresh_token": "refresh-token-for-jwt-renewal"
}
```

### **3. User Login**
```http
POST /auth/login
```
**Authentication:** None
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123!"
}
```
**Success Response (200):**
```json
{
  "message": "Login successful",
  "user_id": "uuid-of-the-user",
  "token": "jwt-access-token",
  "refresh_token": "refresh-token-for-jwt-renewal"
}
```

### **4. Google OAuth Login**
```http
POST /auth/google/login
```
**Authentication:** None
**Request Body:**
```json
{
  "id_token": "google-id-token-from-firebase"
}
```
**Success Response (200):**
```json
{
  "message": "Google login successful",
  "user_id": "uuid-of-the-user",
  "token": "jwt-access-token",
  "refresh_token": "refresh-token-for-jwt-renewal"
}
```

### **5. Refresh Token**
```http
POST /auth/refresh
```
**Authentication:** None
**Request Body:**
```json
{
  "refresh_token": "refresh-token-from-login"
}
```
**Success Response (200):**
```json
{
  "message": "Token refreshed successfully",
  "token": "new-jwt-access-token",
  "refresh_token": "new-refresh-token"
}
```

---

## **👤 User Profile Management**

### **6. Get User Profile**
```http
GET /auth/profile
```
**Authentication:** JWT Token (Bearer)
**Success Response (200):**
```json
{
  "user": {
    "id": "uuid-of-the-user",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg",
    "credits": 1500,
    "subscription": {
      "plan": "pro",
      "status": "active",
      "credits": {
        "remaining": 1500,
        "total": 2500,
        "resetDate": "2024-02-01T00:00:00Z"
      },
      "limits": {
        "dailyGenerations": 100,
        "maxImagesPerGeneration": 4,
        "maxVideoDuration": 30,
        "customModels": 5,
        "priorityQueue": true
      },
      "features": {
        "advancedSettings": true,
        "customModels": true,
        "commercialUse": true,
        "apiAccess": true
      },
      "billing": {
        "cycle": "monthly",
        "nextBilling": "2024-02-01T00:00:00Z",
        "amount": 20.00
      }
    },
    "preferences": {
      "theme": "light",
      "language": "en",
      "timezone": "UTC",
      "notifications": {
        "email": true,
        "push": true,
        "generationComplete": true,
        "trainingComplete": true
      }
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "Profile retrieved successfully"
}
```

### **7. Update User Profile**
```http
PUT /auth/profile
```
**Authentication:** JWT Token (Bearer)
**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "newemail@example.com",
  "avatar_url": "https://example.com/new-avatar.jpg"
}
```
**Success Response (200):**
```json
{
  "user": {
    "id": "uuid-of-the-user",
    "email": "newemail@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "name": "John Doe",
    "avatar_url": "https://example.com/new-avatar.jpg",
    "credits": 1500,
    "subscription": { /* subscription object */ },
    "preferences": { /* preferences object */ },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "message": "Profile updated successfully"
}
```

### **8. Delete User Account**
```http
DELETE /auth/profile
```
**Authentication:** JWT Token (Bearer)
**Success Response (200):**
```json
{
  "message": "Account deleted successfully",
  "success": true
}
```

---

## **💰 Credits Management**

### **9. Add Credits to User**
```http
POST /auth/{user_id}/credits
```
**Authentication:** JWT Token (Bearer) - Admin/Privileged
**Request Body:**
```json
{
  "amount": 100
}
```
**Success Response (200):**
```json
{
  "message": "Credits added successfully",
  "user_id": "uuid-of-the-user",
  "newCreditsBalance": 1600,
  "success": true
}
```

---

## **⚙️ User Settings & Preferences**

### **10. Get User Settings**
```http
GET /auth/settings
```
**Authentication:** JWT Token (Bearer)
**Success Response (200):**
```json
{
  "settings": {
    "profile": {
      "displayName": "John Doe",
      "avatar": "https://example.com/avatar.jpg",
      "bio": "AI artist",
      "website": "https://example.com"
    },
    "preferences": {
      "theme": "light",
      "language": "en",
      "timezone": "UTC",
      "notifications": {
        "email": true,
        "push": true,
        "generationComplete": true,
        "trainingComplete": true
      }
    },
    "security": {
      "twoFactorEnabled": false,
      "lastPasswordChange": "2024-01-01T00:00:00Z"
    }
  }
}
```

### **11. Update User Settings**
```http
PUT /auth/settings
```
**Authentication:** JWT Token (Bearer)
**Request Body:**
```json
{
  "preferences": {
    "theme": "dark",
    "language": "es",
    "notifications": {
      "email": false,
      "push": true
    }
  }
}
```

---

## **💳 Subscription Management**

### **12. Get Subscription Details**
```http
GET /auth/subscription
```
**Authentication:** JWT Token (Bearer)
**Success Response (200):**
```json
{
  "subscription": {
    "plan": "pro",
    "status": "active",
    "credits": {
      "remaining": 1500,
      "total": 2500,
      "resetDate": "2024-02-01T00:00:00Z"
    },
    "limits": {
      "dailyGenerations": 100,
      "maxImagesPerGeneration": 4,
      "maxVideoDuration": 30,
      "customModels": 5,
      "priorityQueue": true
    },
    "features": {
      "advancedSettings": true,
      "customModels": true,
      "commercialUse": true,
      "apiAccess": true
    },
    "billing": {
      "cycle": "monthly",
      "nextBilling": "2024-02-01T00:00:00Z",
      "amount": 20.00
    }
  }
}
```

### **13. Upgrade Subscription**
```http
POST /auth/subscription/upgrade
```
**Authentication:** JWT Token (Bearer)
**Request Body:**
```json
{
  "plan": "pro",
  "cycle": "monthly",
  "paymentMethod": "card_123"
}
```

---

## **📊 Analytics & Usage**

### **14. Get User Analytics**
```http
GET /auth/analytics?period=30d
```
**Authentication:** JWT Token (Bearer)
**Success Response (200):**
```json
{
  "analytics": {
    "generations": {
      "total": 150,
      "images": 120,
      "videos": 30,
      "enhancements": 25
    },
    "credits": {
      "used": 500,
      "remaining": 1500,
      "efficiency": 0.85
    },
    "models": {
      "stable-diffusion-xl": 80,
      "stable-video-diffusion": 30,
      "custom-model-1": 40
    }
  }
}
```

---

## **🔒 Security & Authentication**

### **JWT Token Structure**
```json
{
  "sub": "user-id",
  "iss": "your-sso-auth-service.com",
  "aud": "your-resource-server.com",
  "identifier": "user_auth",
  "scope": "user-id",
  "exp": 1756295527,
  "iat": 1756294627
}
```

### **Authentication Headers**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

---

## **🚨 Error Responses**

### **Standard Error Format**
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

### **Common HTTP Status Codes**
- `200` - Success
- `201` - Created (Registration)
- `400` - Bad Request (Invalid input)
- `401` - Unauthorized (Invalid/missing token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `409` - Conflict (Email already exists)
- `422` - Validation Error
- `500` - Internal Server Error

---

## **📋 Frontend Expectations**

### **User Data Structure (Frontend expects):**
```typescript
interface User {
  id: string;
  email: string;
  name: string;           // Concatenated first_name + last_name
  firstName: string;      // first_name from backend
  lastName: string;       // last_name from backend
  avatar: string;         // avatar_url from backend
  credits: number;
  subscription?: {
    plan: 'free' | 'basic' | 'pro' | 'max';
    status: 'active' | 'cancelled' | 'expired';
    credits: {
      remaining: number;
      total: number;
      resetDate: string;
    };
    limits: {
      dailyGenerations: number;
      maxImagesPerGeneration: number;
      maxVideoDuration: number;
      customModels: number;
      priorityQueue: boolean;
    };
    features: {
      advancedSettings: boolean;
      customModels: boolean;
      commercialUse: boolean;
      apiAccess: boolean;
    };
    billing: {
      cycle: 'monthly' | 'yearly';
      nextBilling: string;
      amount: number;
    };
  };
  preferences?: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      generationComplete: boolean;
      trainingComplete: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}
```

### **Subscription Plans (Frontend expects):**
- **Free**: Limited generations, basic features
- **Basic**: 1000 images, 1500 upscale, 5 videos
- **Pro**: 2500 images, 2000 upscale, 15 videos, 5 characters
- **Max**: 4000 images, 3000 upscale, 150 videos, 10 characters, avatars, 5 trainings

### **Frontend Features Requiring Backend Support:**
1. **Profile Management**: Update name, email, avatar
2. **Settings**: Theme, language, notifications
3. **Security**: Password change, 2FA
4. **Billing**: Payment methods, subscription management
5. **Analytics**: Usage tracking, generation history
6. **Credits**: Real-time credit balance, purchase history
7. **Data Export**: User data download
8. **Session Management**: Active sessions, logout

---

## **🔄 Real-time Updates**

### **WebSocket Events (Future Enhancement)**
```javascript
// Credit balance updates
{
  "type": "credits_updated",
  "userId": "user-id",
  "newBalance": 1500,
  "change": -1,
  "reason": "image_generation"
}

// Subscription status changes
{
  "type": "subscription_updated",
  "userId": "user-id",
  "plan": "pro",
  "status": "active"
}
```

---

## **📝 Implementation Notes**

### **Critical Requirements:**
1. **JWT Token Validation**: Backend must extract user ID from `sub` claim
2. **Credit System**: Real-time credit deduction for AI operations
3. **Subscription Limits**: Enforce plan-based usage limits
4. **Data Consistency**: Ensure user data consistency across all endpoints
5. **Error Handling**: Comprehensive error messages for frontend display
6. **Rate Limiting**: Plan-based rate limiting (Free: 10/min, Pro: 60/min, etc.)

### **Security Considerations:**
1. **Password Hashing**: Secure password storage
2. **Token Expiration**: Reasonable JWT expiration times
3. **Input Validation**: Comprehensive input sanitization
4. **CORS Configuration**: Proper CORS headers for frontend
5. **Rate Limiting**: Prevent abuse and ensure fair usage

---

## **🎯 Priority Implementation Order**

### **Phase 1 - Core Authentication (High Priority)**
1. Health Check
2. User Registration
3. User Login
4. Refresh Token
5. Get User Profile
6. Update User Profile
7. Delete User Account

### **Phase 2 - Credits & Subscription (Medium Priority)**
8. Add Credits to User
9. Get Subscription Details
10. Upgrade Subscription

### **Phase 3 - Settings & Analytics (Lower Priority)**
11. Get User Settings
12. Update User Settings
13. Get User Analytics
14. Google OAuth Login

---

## **🔧 Testing Requirements**

### **Frontend Testing Endpoints:**
- `/testing` - Authentication service tester
- All endpoints must work with the existing frontend test suite
- Comprehensive error handling for all scenarios
- Token validation and refresh flow testing

### **Integration Testing:**
- End-to-end user registration and login flow
- Profile update and retrieval
- Credit system integration
- Subscription plan management
- Real-time credit deduction for AI operations

---

This contract ensures the backend team understands exactly what the frontend expects and can implement a robust user management system that supports all FOMI features! 

**Document Version:** 1.0  
**Last Updated:** 27 08 2025  
**Frontend Version:** FOMI v1.0  
**Backend Integration:** Tarum AI API
