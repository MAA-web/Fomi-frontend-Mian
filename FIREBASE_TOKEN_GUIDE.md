# Firebase Token Guide for Backend Integration

## What's Inside a Firebase ID Token

Firebase ID tokens are JWT (JSON Web Tokens) that contain user authentication information. Here's what's included:

### Standard JWT Fields
```json
{
  "iss": "https://securetoken.google.com/your-project-id",
  "aud": "your-project-id",
  "auth_time": 1640995200,
  "user_id": "firebase-user-uid",
  "sub": "firebase-user-uid",
  "iat": 1640995200,
  "exp": 1640998800,
  "email": "user@example.com",
  "email_verified": true,
  "firebase": {
    "identities": {
      "email": ["user@example.com"]
    },
    "sign_in_provider": "password"
  }
}
```

### Key Fields Explained

| Field | Description | Use Case |
|-------|-------------|----------|
| `sub` / `user_id` | Firebase User UID | Primary identifier for your database |
| `email` | User's email address | User identification, billing |
| `email_verified` | Email verification status | Security validation |
| `iss` | Token issuer | Verify token authenticity |
| `aud` | Token audience | Verify it's for your project |
| `exp` | Expiration timestamp | Check if token is still valid |
| `auth_time` | When user authenticated | Session management |
| `firebase.sign_in_provider` | How user signed in | Analytics, security |

## What to Send to Your Backend

### 1. Authentication Data
```javascript
{
  "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...", // Firebase ID token
  "firebase": {
    "uid": "XqyAYhb0ktVt97AcszOaliJyXsi2",
    "email": "test@example.com",
    "displayName": "Test User",
    "emailVerified": false
  }
}
```

### 2. User Profile Data
```javascript
{
  "profile": {
    "email": "test@example.com",
    "name": "Test User",
    "firstName": "Test",
    "lastName": "User",
    "avatar": "https://example.com/avatar.jpg",
    "emailVerified": false,
    "createdAt": "2025-08-29T10:00:00.000Z",
    "lastSignIn": "2025-08-29T10:00:00.000Z"
  }
}
```

### 3. Billing and Subscription Data (Backend Should Populate)
```javascript
{
  "billing": {
    "plan": "Free", // or "Pro", "Enterprise"
    "subscriptionStatus": "active", // "active", "cancelled", "past_due"
    "subscriptionExpiresAt": "2025-09-29T10:00:00.000Z",
    "paymentMethod": {
      "type": "card",
      "last4": "1234",
      "brand": "visa"
    },
    "billingAddress": {
      "line1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "US"
    }
  }
}
```

### 4. Credits and Usage Data (Backend Should Populate)
```javascript
{
  "credits": {
    "currentBalance": 50,
    "totalEarned": 100,
    "totalSpent": 50,
    "usageHistory": [
      {
        "action": "image_generation",
        "creditsUsed": 1,
        "timestamp": "2025-08-29T10:00:00.000Z",
        "details": "Generated image with prompt: 'a cat'"
      }
    ],
    "lastUpdated": "2025-08-29T10:00:00.000Z"
  }
}
```

## Backend Integration Flow

### 1. Token Verification
```javascript
// Backend should verify the Firebase token
const admin = require('firebase-admin');

async function verifyToken(idToken) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

### 2. User Creation/Upsert
```javascript
// When user first signs in or registers
async function createOrUpdateUser(firebaseUser) {
  const user = await db.users.findOne({ firebaseUid: firebaseUser.uid });
  
  if (!user) {
    // Create new user
    return await db.users.create({
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      emailVerified: firebaseUser.emailVerified,
      plan: 'Free',
      credits: 50,
      subscriptionStatus: 'active',
      createdAt: new Date(),
      lastSignIn: new Date()
    });
  } else {
    // Update existing user
    return await db.users.update(
      { firebaseUid: firebaseUser.uid },
      {
        lastSignIn: new Date(),
        emailVerified: firebaseUser.emailVerified,
        name: firebaseUser.displayName
      }
    );
  }
}
```

### 3. Credits Management
```javascript
// Check if user has enough credits
async function checkCredits(uid, requiredCredits) {
  const user = await db.users.findOne({ firebaseUid: uid });
  return user.credits >= requiredCredits;
}

// Deduct credits after usage
async function deductCredits(uid, credits, action, details) {
  const user = await db.users.findOne({ firebaseUid: uid });
  
  if (user.credits < credits) {
    throw new Error('Insufficient credits');
  }
  
  // Update credits
  await db.users.update(
    { firebaseUid: uid },
    { credits: user.credits - credits }
  );
  
  // Log usage
  await db.usageHistory.create({
    userId: user.id,
    action,
    creditsUsed: credits,
    details,
    timestamp: new Date()
  });
}
```

### 4. Subscription Management
```javascript
// Check subscription status
async function checkSubscription(uid) {
  const user = await db.users.findOne({ firebaseUid: uid });
  
  if (user.subscriptionStatus !== 'active') {
    throw new Error('Subscription not active');
  }
  
  if (user.subscriptionExpiresAt && new Date() > user.subscriptionExpiresAt) {
    throw new Error('Subscription expired');
  }
  
  return user;
}
```

## API Endpoints You Should Implement

### 1. User Profile Endpoint
```
GET /api/user/profile
Headers: Authorization: Bearer <firebase-id-token>

Response:
{
  "user": {
    "id": "user-id",
    "email": "test@example.com",
    "name": "Test User",
    "plan": "Free",
    "credits": 50,
    "subscriptionStatus": "active",
    "subscriptionExpiresAt": null
  }
}
```

### 2. Credits Usage Endpoint
```
POST /api/user/credits/use
Headers: Authorization: Bearer <firebase-id-token>
Body: {
  "credits": 1,
  "action": "image_generation",
  "details": "Generated image with prompt: 'a cat'"
}

Response:
{
  "success": true,
  "remainingCredits": 49,
  "usageId": "usage-123"
}
```

### 3. Subscription Management Endpoint
```
GET /api/user/subscription
Headers: Authorization: Bearer <firebase-id-token>

Response:
{
  "subscription": {
    "plan": "Pro",
    "status": "active",
    "expiresAt": "2025-09-29T10:00:00.000Z",
    "paymentMethod": {
      "type": "card",
      "last4": "1234"
    }
  }
}
```

## Security Best Practices

1. **Always verify Firebase tokens** on your backend
2. **Never trust client-side data** for billing/credits
3. **Use HTTPS** for all API calls
4. **Implement rate limiting** to prevent abuse
5. **Log all credit transactions** for audit trails
6. **Validate user permissions** before allowing actions
7. **Use environment variables** for sensitive configuration

## Testing the Integration

Use the "Prepare User Data for Backend" button in the Firebase Auth Tester to see the complete data structure that should be sent to your backend.

The test will show you:
- Firebase user information
- Token contents
- Default billing/credits structure
- Client metadata

This data structure provides everything your backend needs to:
- Authenticate the user
- Create/update user profiles
- Manage billing and subscriptions
- Track credits and usage
- Handle user preferences







