# Simplified Firebase-Backend Data Flow

## 🎯 **The Simple Approach**

Firebase handles ALL authentication. Your backend just needs the Firebase ID token to verify the user.

## 📤 **Frontend → Backend (What You Send)**

### **Only 2 Things:**

1. **Firebase ID Token** (in Authorization header)
2. **Request-specific data** (like image generation prompts)

```javascript
// Example: Generate an image
const response = await fetch('/api/generate-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${firebaseIdToken}`, // Only this for auth
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: 'a beautiful sunset',  // Your actual request data
    style: 'realistic',
    size: '1024x1024'
  })
});
```

## 🔐 **Backend Authentication (What Backend Does)**

### **1. Verify Firebase Token**
```javascript
// Backend middleware
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Add user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### **2. Get/Create User from Database**
```javascript
// Backend route handler
app.post('/api/generate-image', verifyFirebaseToken, async (req, res) => {
  const { uid, email } = req.user; // From Firebase token
  
  // Get user from your database
  let user = await db.users.findOne({ firebaseUid: uid });
  
  if (!user) {
    // Create new user
    user = await db.users.create({
      firebaseUid: uid,
      email: email,
      credits: 50,  // Default credits
      plan: 'Free'
    });
  }
  
  // Check if user has enough credits
  if (user.credits < 1) {
    return res.status(402).json({ error: 'Insufficient credits' });
  }
  
  // Process the request (generate image)
  const imageResult = await generateImage(req.body.prompt);
  
  // Deduct credits
  await db.users.update(
    { firebaseUid: uid },
    { credits: user.credits - 1 }
  );
  
  res.json({
    success: true,
    image: imageResult,
    remainingCredits: user.credits - 1
  });
});
```

## 📥 **Backend → Frontend (What Backend Sends Back)**

### **Success Response**
```javascript
{
  "success": true,
  "image": "https://example.com/generated-image.jpg",
  "remainingCredits": 49,
  "usageId": "usage-123"
}
```

### **Error Response**
```javascript
{
  "success": false,
  "error": "Insufficient credits",
  "code": "INSUFFICIENT_CREDITS"
}
```

## 🛠️ **Backend API Endpoints You Need**

### **1. Get User Profile**
```
GET /api/user/profile
Headers: Authorization: Bearer <firebase-id-token>

Response: {
  "success": true,
  "user": {
    "email": "user@example.com",
    "credits": 50,
    "plan": "Free",
    "createdAt": "2025-08-29T10:00:00.000Z"
  }
}
```

### **2. Generate Image**
```
POST /api/generate-image
Headers: Authorization: Bearer <firebase-id-token>
Body: {
  "prompt": "a beautiful sunset",
  "style": "realistic",
  "size": "1024x1024"
}

Response: {
  "success": true,
  "image": "https://example.com/image.jpg",
  "remainingCredits": 49
}
```

### **3. Get Credits**
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

## 🎯 **Frontend Implementation**

### **API Client (Simplified)**
```javascript
// api/client.js
class ApiClient {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL;
  }

  async request(endpoint, options = {}) {
    // Get Firebase token
    const token = await firebaseAuthService.getIdToken();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Only this for auth
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

  async getUserCredits() {
    return this.request('/user/credits');
  }

  // AI operations
  async generateImage(prompt, options = {}) {
    return this.request('/generate-image', {
      method: 'POST',
      body: JSON.stringify({ prompt, ...options })
    });
  }

  async generateVideo(prompt, options = {}) {
    return this.request('/generate-video', {
      method: 'POST',
      body: JSON.stringify({ prompt, ...options })
    });
  }
}
```

### **React Hook (Simplified)**
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

## 📊 **Data Flow Summary**

### **Frontend Sends:**
- Firebase ID token (for authentication)
- Request-specific data (prompts, options, etc.)

### **Backend Does:**
- Verifies Firebase token
- Gets/creates user in database
- Checks credits
- Processes request
- Deducts credits
- Returns result

### **Backend Sends:**
- Success/error responses
- Generated content (images, videos)
- Updated credit balance

### **Frontend Displays:**
- User information
- Credit balance
- Generated content
- Success/error messages

## ✅ **Benefits of This Approach**

1. **Simple**: Firebase handles all auth complexity
2. **Secure**: Firebase tokens are cryptographically signed
3. **Scalable**: No need to manage passwords, sessions, etc.
4. **Fast**: No custom auth logic needed
5. **Reliable**: Firebase handles token refresh, security, etc.

## 🔧 **Backend Setup**

### **1. Install Firebase Admin SDK**
```bash
npm install firebase-admin
```

### **2. Initialize Firebase Admin**
```javascript
// backend/firebase-admin.js
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  // or use service account key
  // credential: admin.credential.cert(require('./service-account-key.json'))
});

module.exports = admin;
```

### **3. Create Auth Middleware**
```javascript
// backend/middleware/auth.js
const admin = require('../firebase-admin');

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { verifyFirebaseToken };
```

That's it! Firebase handles all the authentication complexity, and your backend just needs to verify the token and process requests. Much simpler! 🎉
