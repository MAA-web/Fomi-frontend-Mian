# 🔥 Firebase Authentication System

This project now uses **Firebase Authentication** instead of backend JWT tokens for user authentication.

## 🚀 Features

- **Email/Password Registration & Login**
- **Google OAuth Login**
- **Email Verification**
- **Password Reset**
- **Profile Management**
- **Account Deletion**
- **Automatic Token Management**

## 📁 Files Created

### Core Files
- `src/lib/firebaseAuth.js` - Firebase authentication service
- `src/lib/hooks/useFirebaseAuth.js` - React hook for Firebase auth
- `src/components/testing/FirebaseAuthTester.jsx` - Testing component
- `src/app/firebase-test/page.jsx` - Test page

### Configuration
- `src/lib/firebase.js` - Firebase configuration (already existed)

## 🛠️ How to Use

### 1. Basic Usage

```javascript
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth';

function MyComponent() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    register,
    login,
    loginWithGoogle,
    logout,
    updateProfile,
    deleteAccount
  } = useFirebaseAuth();

  // Your component logic here
}
```

### 2. Registration

```javascript
const result = await register({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe'
});

if (result.success) {
  console.log('User registered:', result.user);
} else {
  console.error('Registration failed:', result.message);
}
```

### 3. Login

```javascript
// Email/Password Login
const result = await login({
  email: 'user@example.com',
  password: 'password123'
});

// Google Login
const result = await loginWithGoogle();
```

### 4. Profile Management

```javascript
// Update Profile
const result = await updateProfile({
  displayName: 'New Name',
  photoURL: 'https://example.com/avatar.jpg'
});

// Delete Account
const result = await deleteAccount();
```

### 5. Password Reset

```javascript
const result = await sendPasswordResetEmail('user@example.com');
```

### 6. Email Verification

```javascript
const result = await sendEmailVerification();
```

## 🧪 Testing

Visit `/firebase-test` to test all Firebase authentication features:

- Registration with email/password
- Login with email/password
- Google OAuth login
- Profile updates
- Password reset
- Email verification
- Account deletion
- Credit management

## 🔧 Configuration

The Firebase configuration is in `src/lib/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  clientId: "your-google-client-id",
};
```

## 🔄 Migration from Backend Auth

### What Changed
- ❌ No more JWT token management
- ❌ No more refresh token logic
- ❌ No more backend authentication endpoints
- ✅ Firebase handles all authentication
- ✅ Automatic token refresh
- ✅ Built-in security features

### Benefits
- **Simplified**: No complex token management
- **Secure**: Firebase handles security best practices
- **Reliable**: Google's infrastructure
- **Feature-rich**: Email verification, password reset, etc.
- **Scalable**: Handles millions of users

## 🚨 Important Notes

1. **Firebase Console**: Make sure your Firebase project is properly configured
2. **Google OAuth**: Enable Google sign-in in Firebase console
3. **Email Templates**: Customize email templates in Firebase console
4. **Security Rules**: Configure Firebase security rules as needed

## 🔗 Backend Integration

If you need to call your backend APIs with Firebase authentication:

```javascript
const getIdToken = useFirebaseAuth().getIdToken;

// Get Firebase ID token for backend calls
const token = await getIdToken();

// Use in API calls
const response = await fetch('/api/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 📚 Firebase Documentation

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firebase Auth Web Setup](https://firebase.google.com/docs/auth/web/start)
- [Firebase Auth API Reference](https://firebase.google.com/docs/reference/js/auth)

## 🎯 Next Steps

1. Test the Firebase authentication system
2. Integrate with your backend APIs using Firebase ID tokens
3. Customize email templates in Firebase console
4. Set up Firebase security rules
5. Configure additional authentication providers if needed
