# Frontend-Backend Data Flow Guide

## 🔄 Essential Data Flow

### 1. Frontend → Backend (What You Send)

#### Authentication Request
```javascript
// When user logs in/registers with Firebase
{
  "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...", // Firebase ID token
  "user": {
    "uid": "XqyAYhb0ktVt97AcszOaliJyXsi2",
    "email": "test@example.com",
    "displayName": "Test User",
    "emailVerified": false,
    "photoURL": "https://example.com/avatar.jpg"
  }
}
```

#### API Call Headers
```javascript
// For all authenticated requests
{
  "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

### 2. Backend → Frontend (What Backend Should Send Back)

#### User Profile Response
```javascript
{
  "success": true,
  "user": {
    "id": "user-database-id",
    "firebaseUid": "XqyAYhb0ktVt97AcszOaliJyXsi2",
    "email": "test@example.com",
    "name": "Test User",
    "firstName": "Test",
    "lastName": "User",
    "avatar": "https://example.com/avatar.jpg",
    "emailVerified": false,
    "credits": 50,
    "plan": "Free",
    "createdAt": "2025-08-29T10:00:00.000Z",
    "lastSignIn": "2025-08-29T10:00:00.000Z"
  }
}
```

#### Credits Response
```javascript
{
  "success": true,
  "credits": {
    "currentBalance": 50,
    "totalEarned": 100,
    "totalSpent": 50
  }
}
```

#### Error Response
```javascript
{
  "success": false,
  "error": "Insufficient credits",
  "code": "INSUFFICIENT_CREDITS",
  "details": "You need 5 credits but have only 3"
}
```

## 🛠️ Backend API Endpoints You Need

### 1. User Authentication/Registration
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/google-login

Headers: Authorization: Bearer <firebase-id-token>
Body: {
  "idToken": "firebase-id-token",
  "user": {
    "uid": "firebase-uid",
    "email": "user@example.com",
    "displayName": "User Name"
  }
}

Response: {
  "success": true,
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "credits": 50,
    "plan": "Free"
  }
}
```

### 2. Get User Profile
```
GET /api/user/profile

Headers: Authorization: Bearer <firebase-id-token>

Response: {
  "success": true,
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "credits": 50,
    "plan": "Free",
    "emailVerified": false,
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

### 3. Update User Profile
```
PUT /api/user/profile

Headers: Authorization: Bearer <firebase-id-token>
Body: {
  "name": "New Name",
  "firstName": "New",
  "lastName": "Name"
}

Response: {
  "success": true,
  "user": {
    "id": "user-id",
    "name": "New Name",
    "firstName": "New",
    "lastName": "Name"
  }
}
```

### 4. Get User Credits
```
GET /api/user/credits

Headers: Authorization: Bearer <firebase-id-token>

Response: {
  "success": true,
  "credits": {
    "currentBalance": 50,
    "totalEarned": 100,
    "totalSpent": 50
  }
}
```

### 5. Use Credits (for AI operations)
```
POST /api/user/credits/use

Headers: Authorization: Bearer <firebase-id-token>
Body: {
  "credits": 1,
  "action": "image_generation",
  "details": "Generated image with prompt: 'a cat'"
}

Response: {
  "success": true,
  "remainingCredits": 49,
  "usageId": "usage-123"
}
```

## 📱 Frontend Display Data

### What You Can Display to Users

#### User Information
```javascript
// Display in user profile/settings
{
  "name": "Test User",           // Display name
  "email": "test@example.com",   // Email address
  "avatar": "https://...",       // Profile picture
  "emailVerified": false,        // Show verification status
  "plan": "Free",               // Current plan
  "credits": 50,                // Available credits
  "createdAt": "2025-08-29",    // Account creation date
  "lastSignIn": "2025-08-29"    // Last login date
}
```

#### Credits Information
```javascript
// Display in credits section
{
  "currentBalance": 50,         // Show prominently
  "totalEarned": 100,           // Show in stats
  "totalSpent": 50              // Show in stats
}
```

#### Usage Information
```javascript
// Display in usage history
{
  "usageHistory": [
    {
      "action": "image_generation",
      "creditsUsed": 1,
      "timestamp": "2025-08-29T10:00:00.000Z",
      "details": "Generated image with prompt: 'a cat'"
    }
  ]
}
```

## 🔐 Backend Security Checklist

### What Backend Should Do

1. **Verify Firebase Token**
   ```javascript
   // Backend should verify every request
   const decodedToken = await admin.auth().verifyIdToken(idToken);
   const uid = decodedToken.uid;
   ```

2. **Create/Update User in Database**
   ```javascript
   // When user first signs in
   const user = await db.users.findOne({ firebaseUid: uid });
   if (!user) {
     // Create new user with default values
     await db.users.create({
       firebaseUid: uid,
       email: decodedToken.email,
       name: decodedToken.name,
       credits: 50,  // Default credits
       plan: 'Free'  // Default plan
     });
   }
   ```

3. **Check Credits Before Operations**
   ```javascript
   // Before allowing AI operations
   const user = await db.users.findOne({ firebaseUid: uid });
   if (user.credits < requiredCredits) {
     throw new Error('Insufficient credits');
   }
   ```

4. **Deduct Credits After Operations**
   ```javascript
   // After successful AI operation
   await db.users.update(
     { firebaseUid: uid },
     { credits: user.credits - usedCredits }
   );
   ```

## 🎯 Frontend Implementation

### API Client Setup
```javascript
// api/client.js
class ApiClient {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL;
  }

  async request(endpoint, options = {}) {
    const token = await firebaseAuthService.getIdToken();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  }

  // User methods
  async getUserProfile() {
    return this.request('/user/profile');
  }

  async updateUserProfile(updates) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async getUserCredits() {
    return this.request('/user/credits');
  }

  async useCredits(credits, action, details) {
    return this.request('/user/credits/use', {
      method: 'POST',
      body: JSON.stringify({ credits, action, details })
    });
  }
}
```

### React Hook for User Data
```javascript
// hooks/useUser.js
const useUser = () => {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated]);

  const loadUserData = async () => {
    try {
      const [profileData, creditsData] = await Promise.all([
        apiClient.getUserProfile(),
        apiClient.getUserCredits()
      ]);
      
      setUser(profileData.user);
      setCredits(creditsData.credits.currentBalance);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  return { user, credits, loading, refreshUserData: loadUserData };
};
```

## 📊 Data Flow Summary

### Frontend Sends:
- Firebase ID token (for authentication)
- User profile updates
- Credit usage requests

### Backend Sends:
- User profile data
- Credit balance
- Success/error responses

### Frontend Displays:
- User name, email, avatar
- Credit balance
- Plan information
- Usage history

This gives you everything you need to:
1. ✅ Authenticate users with Firebase
2. ✅ Store user data in your database
3. ✅ Manage credits for AI operations
4. ✅ Display user information in your UI
5. ✅ Handle basic user profile management

The payment/billing complexity can be added later when you're ready for that feature!







