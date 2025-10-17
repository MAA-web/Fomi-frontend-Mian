"use client";

import React, { useState, useEffect } from 'react';
import useAuth from '@/lib/hooks/useAuth';
import LoadingSpinner, { LoadingStates } from '@/components/ui/LoadingSpinner';
import LoginStatusIndicator from '@/components/ui/LoginStatusIndicator';

// Testing component for authentication services
const AuthTester = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    userCredits,
    register,
    login,
    loginWithGoogle,
    getProfile,
    updateProfile,
    deleteAccount,
    addCredits,
    logout,
    checkHealth,
    clearError,
  } = useAuth();

  const [formData, setFormData] = useState({
    email: 'muhammadalikhan0003@gmail.com',
    password: 'your_secure_password',
    name: 'John Doe',
    avatar_url: 'https://example.com/avatar.jpg',
  });

  const [loginData, setLoginData] = useState({
    email: 'muhammadalikhan0003@gmail.com',
    password: 'your_secure_password',
  });

  const [updateData, setUpdateData] = useState({
    name: '',
    email: '',
    avatar_url: '',
  });

  const [creditAmount, setCreditAmount] = useState(50);
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, result, success = true) => {
    setTestResults(prev => [...prev, {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      test,
      result,
      success,
      timestamp: new Date().toLocaleTimeString(),
    }]);
  };

  const handleInputChange = (e, formType = 'register') => {
    const { name, value } = e.target;
    if (formType === 'register') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'login') {
      setLoginData(prev => ({ ...prev, [name]: value }));
    } else {
      setUpdateData(prev => ({ ...prev, [name]: value }));
    }
  };

  const testRegister = async () => {
    try {
      addTestResult('Register', 'Starting registration...', true);
      console.log('Registration form data:', formData);
      const result = await register(formData);
      console.log('Registration result:', result);
      
      // Check if token was stored
      const storedToken = localStorage.getItem('fomi_token');
      console.log('Token stored after registration:', storedToken ? 'YES' : 'NO');
      if (storedToken) {
        console.log('Stored token (first 50 chars):', storedToken.substring(0, 50) + '...');
      }
      
      addTestResult('Register', `Success! User ID: ${result.userId}`, true);
    } catch (error) {
      console.error('Registration error:', error);
      addTestResult('Register', `Failed: ${error.message}`, false);
    }
  };

  const testLogin = async () => {
    try {
      addTestResult('Login', 'Starting standard login...', true);
      console.log('=== STANDARD LOGIN DEBUG ===');
      console.log('Login form data:', loginData);
      console.log('Sending to endpoint: /user-service/auth/login');
      console.log('Request body:', {
        email: loginData.email,
        password: loginData.password ? '[HIDDEN]' : 'Not provided'
      });
      
      const result = await login(loginData);
      console.log('Login result:', result);
      
      // Check if token was stored
      const storedToken = localStorage.getItem('fomi_token');
      console.log('Token stored after login:', storedToken ? 'YES' : 'NO');
      if (storedToken) {
        console.log('Stored token (first 50 chars):', storedToken.substring(0, 50) + '...');
      }
      
      // Check user data
      if (result.user) {
        console.log('User data received:', {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          credits: result.user.credits
        });
      }
      
      addTestResult('Login', `Success! User ID: ${result.userId}`, true);
    } catch (error) {
      console.error('Login error:', error);
      addTestResult('Login', `Failed: ${error.message}`, false);
    }
  };

  const testGoogleLogin = async () => {
    try {
      addTestResult('Google Login', 'Starting Google login...', true);
      
      // Import Firebase Auth for real Google login
      const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');
      
      // Create Google provider
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      console.log('=== GOOGLE LOGIN DEBUG ===');
      console.log('Firebase auth object:', auth);
      console.log('Google provider created:', provider);
      
      // Sign in with Google popup
      console.log('Attempting Google sign-in popup...');
      const userCredential = await signInWithPopup(auth, provider);
      console.log('Google sign-in successful!');
      
      const idToken = await userCredential.user.getIdToken();
      
      console.log('Google user info:', {
        email: userCredential.user.email,
        name: userCredential.user.displayName,
        uid: userCredential.user.uid,
        photoURL: userCredential.user.photoURL
      });
      console.log('Google ID token length:', idToken.length);
      console.log('Google ID token (first 100 chars):', idToken.substring(0, 100) + '...');
      console.log('Google ID token (last 50 chars):', '...' + idToken.substring(idToken.length - 50));
      
      // Check token format
      const tokenParts = idToken.split('.');
      console.log('Token parts count:', tokenParts.length);
      if (tokenParts.length === 3) {
        try {
          const header = JSON.parse(atob(tokenParts[0]));
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('Token header:', header);
          console.log('Token payload:', payload);
        } catch (e) {
          console.log('Could not decode token parts:', e.message);
        }
      }
      
      console.log('Sending ID token to backend...');
      // Send the real ID token to your backend
      const result = await loginWithGoogle(idToken);
      console.log('Backend response:', result);
      
      // Show detailed success message with user info
      const successMessage = `Success! User ID: ${result.userId}`;
      if (result.user) {
        addTestResult('Google Login', `${successMessage} | Email: ${result.user.email} | Avatar: ${result.user.avatarUrl ? 'Yes' : 'No'}`, true);
      } else {
        addTestResult('Google Login', successMessage, true);
      }
    } catch (error) {
      console.error('Google login error:', error);
      console.log('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      addTestResult('Google Login', `Failed: ${error.message}`, false);
    }
  };

  const testMockGoogleLogin = async () => {
    try {
      addTestResult('Mock Google Login', 'Starting mock Google login...', true);
      // Mock Google ID token for testing (this will likely fail with 500 error)
      const mockIdToken = 'mock-google-id-token-' + Date.now();
      const result = await loginWithGoogle(mockIdToken);
      addTestResult('Mock Google Login', `Success! User ID: ${result.userId}`, true);
    } catch (error) {
      addTestResult('Mock Google Login', `Failed: ${error.message}`, false);
    }
  };

  const testGetProfile = async () => {
    try {
      addTestResult('Get Profile', 'Fetching profile...', true);
      
      // Debug localStorage state
      console.log('=== LOCALSTORAGE DEBUG ===');
      console.log('All localStorage keys:', Object.keys(localStorage));
      console.log('fomi_token exists:', localStorage.getItem('fomi_token') ? 'YES' : 'NO');
      console.log('fomi_refresh_token exists:', localStorage.getItem('fomi_refresh_token') ? 'YES' : 'NO');
      
      // Check if we have a token
      const token = localStorage.getItem('fomi_token');
      console.log('Current token:', token ? token.substring(0, 50) + '...' : 'No token');
      
      // Additional token verification
      if (token) {
        console.log('Token verification:');
        console.log('- Token length:', token.length);
        console.log('- Token format valid:', token.split('.').length === 3);
        console.log('- Token starts with eyJ:', token.startsWith('eyJ'));
        
        // Try to decode the JWT payload (for debugging only)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('- Token payload:', payload);
          console.log('- Token expiration:', new Date(payload.exp * 1000));
          console.log('- Token is expired:', payload.exp < Date.now() / 1000);
        } catch (e) {
          console.log('- Could not decode token payload:', e.message);
        }
      } else {
        console.log('WARNING: No token found in localStorage!');
        console.log('This might mean:');
        console.log('1. Token was never stored');
        console.log('2. Token was cleared');
        console.log('3. localStorage is not working');
      }
      console.log('=== END LOCALSTORAGE DEBUG ===');
      
      const result = await getProfile();
      console.log('Get Profile result:', result);
      addTestResult('Get Profile', `Success! Name: ${result.user.name}`, true);
    } catch (error) {
      console.error('Get Profile error:', error);
      addTestResult('Get Profile', `Failed: ${error.message}`, false);
    }
  };

  const testUpdateProfile = async () => {
    try {
      addTestResult('Update Profile', 'Starting profile update...', true);
      console.log('=== UPDATE PROFILE DEBUG ===');
      console.log('Update form data:', updateData);
      console.log('Sending to endpoint: PUT /user-service/auth/profile');
      console.log('Request body:', {
        name: updateData.name || 'Not provided',
        email: updateData.email || 'Not provided',
        avatar_url: updateData.avatar_url || 'Not provided'
      });
      
      // Debug the current JWT token before making the request
      const token = localStorage.getItem('fomi_token');
      if (token) {
        console.log('=== JWT TOKEN BEFORE UPDATE ===');
        console.log('Token length:', token.length);
        console.log('Token starts with:', token.substring(0, 50) + '...');
        
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('JWT Payload:', payload);
            console.log('Available fields:');
            console.log('- sub:', payload.sub);
            console.log('- user_id:', payload.user_id);
            console.log('- id:', payload.id);
            console.log('- aud:', payload.aud);
            console.log('- iss:', payload.iss);
            console.log('- exp:', new Date(payload.exp * 1000));
            console.log('- iat:', new Date(payload.iat * 1000));
            
            // Check token expiration
            const now = Date.now() / 1000;
            const isExpired = payload.exp < now;
            console.log('- Current time:', new Date(now * 1000));
            console.log('- Token expiration:', new Date(payload.exp * 1000));
            console.log('- Is token expired:', isExpired);
            console.log('- Time until expiry:', Math.floor(payload.exp - now), 'seconds');
            
            // Check which field might contain the user ID
            const possibleUserId = payload.sub || payload.user_id || payload.id;
            console.log('Possible User ID field:', possibleUserId);
            
            // Check if token is close to expiration (within 5 minutes)
            const timeUntilExpiry = payload.exp - now;
            if (timeUntilExpiry < 300) { // 5 minutes
              console.log('⚠️ WARNING: Token expires soon! Consider refreshing.');
            }
          }
        } catch (e) {
          console.log('Could not decode JWT payload:', e.message);
        }
      } else {
        console.log('WARNING: No JWT token found in localStorage!');
      }
      
      const result = await updateProfile(updateData);
      console.log('Update Profile result:', result);
      
             // Check if user data was updated
       if (result.user) {
         console.log('Updated user data:', {
           id: result.user.id,
           email: result.user.email,
           name: result.user.name
         });
       }
      
      addTestResult('Update Profile', `Success! Updated: ${result.user.name}`, true);
    } catch (error) {
      console.error('Update Profile error:', error);
      addTestResult('Update Profile', `Failed: ${error.message}`, false);
    }
  };

  const testAddCredits = async () => {
    try {
      addTestResult('Add Credits', `Adding ${creditAmount} credits...`, true);

      console.log('=== ADD CREDITS DEBUG ===');
      console.log('Current user:', user);
      console.log('User ID:', user?.id);
      console.log('Current credits:', userCredits);
      console.log('Is authenticated:', isAuthenticated);

      if (!isAuthenticated || !user?.id) {
        addTestResult('Add Credits', 'Failed: User not authenticated. Please log in first.', false);
        return;
      }

      const result = await addCredits(user.id, creditAmount);
      console.log('Add credits result:', result);

      addTestResult('Add Credits', `Success! New balance: ${result.newCreditsBalance}`, true);
    } catch (error) {
      console.error('Add credits error:', error);
      addTestResult('Add Credits', `Failed: ${error.message}`, false);
    }
  };

  const testHealthCheck = async () => {
    try {
      addTestResult('Health Check', 'Checking service health...', true);
      const result = await checkHealth();
      addTestResult('Health Check', `Service is ${result.isHealthy ? 'healthy' : 'unhealthy'}`, result.isHealthy);
    } catch (error) {
      addTestResult('Health Check', `Failed: ${error.message}`, false);
    }
  };

  const testLogout = () => {
    try {
      addTestResult('Logout', 'Logging out...', true);
      logout();
      addTestResult('Logout', 'Successfully logged out', true);
    } catch (error) {
      addTestResult('Logout', `Failed: ${error.message}`, false);
    }
  };

  const testLocalStorage = () => {
    try {
      addTestResult('LocalStorage Test', 'Testing localStorage...', true);
      
      // Test write
      localStorage.setItem('test_key', 'test_value');
      console.log('Write test - stored value:', localStorage.getItem('test_key'));
      
      // Test read
      const readValue = localStorage.getItem('test_key');
      console.log('Read test - retrieved value:', readValue);
      
      // Clean up
      localStorage.removeItem('test_key');
      
      if (readValue === 'test_value') {
        addTestResult('LocalStorage Test', 'localStorage is working correctly', true);
      } else {
        addTestResult('LocalStorage Test', 'localStorage read/write failed', false);
      }
    } catch (error) {
      addTestResult('LocalStorage Test', `Failed: ${error.message}`, false);
    }
  };

  const testDataCheck = () => {
    try {
      addTestResult('Data Check', 'Checking what data is being sent...', true);
      
      console.log('=== CURRENT FORM DATA ===');
      console.log('Registration form data:', formData);
      console.log('Login form data:', loginData);
      console.log('Update form data:', updateData);
      
      console.log('=== WHAT WILL BE SENT TO BACKEND ===');
             console.log('For Registration:');
       console.log('- Email:', formData.email);
       console.log('- Name:', formData.name);
       console.log('- Avatar URL:', formData.avatar_url);
      
      console.log('For Login:');
      console.log('- Email:', loginData.email);
      console.log('- Password:', loginData.password ? '[HIDDEN]' : 'Not set');
      
      console.log('For Google Login:');
      console.log('- Only id_token is sent (user data extracted by backend)');
      
      console.log('=== CURRENT USER DATA ===');
      if (user) {
        console.log('User object:', user);
               console.log('- Name:', user.name);
        console.log('- Credits:', userCredits);
        console.log('- Avatar:', user.avatar || user.avatarUrl);
        console.log('- Subscription:', user.subscription);
      } else {
        console.log('No user data available');
      }
      
      addTestResult('Data Check', 'Check console for detailed data analysis', true);
    } catch (error) {
      addTestResult('Data Check', `Failed: ${error.message}`, false);
    }
  };

  const testJWTToken = () => {
    try {
      addTestResult('JWT Token Check', 'Analyzing JWT token structure...', true);
      
      const token = localStorage.getItem('fomi_token');
      if (!token) {
        addTestResult('JWT Token Check', 'No token found in localStorage', false);
        return;
      }
      
      console.log('=== JWT TOKEN ANALYSIS ===');
      console.log('Token length:', token.length);
      console.log('Token starts with:', token.substring(0, 20));
      console.log('Token ends with:', token.substring(token.length - 20));
      
      const tokenParts = token.split('.');
      console.log('Token parts count:', tokenParts.length);
      
      if (tokenParts.length === 3) {
        try {
          const header = JSON.parse(atob(tokenParts[0]));
          const payload = JSON.parse(atob(tokenParts[1]));
          
          console.log('=== JWT HEADER ===');
          console.log(header);
          
          console.log('=== JWT PAYLOAD ===');
          console.log(payload);
          
          console.log('=== KEY FIELDS ===');
          console.log('- Subject (sub):', payload.sub);
          console.log('- User ID:', payload.user_id);
          console.log('- ID:', payload.id);
          console.log('- Audience (aud):', payload.aud);
          console.log('- Issuer (iss):', payload.iss);
          console.log('- Expiration (exp):', new Date(payload.exp * 1000));
          console.log('- Issued At (iat):', new Date(payload.iat * 1000));
          
          // Check if token is expired
          const now = Date.now() / 1000;
          const isExpired = payload.exp < now;
          console.log('- Is Expired:', isExpired);
          console.log('- Time until expiry:', Math.floor(payload.exp - now), 'seconds');
          
          addTestResult('JWT Token Check', `Token valid. User ID: ${payload.sub || payload.user_id || payload.id || 'Unknown'}`, true);
        } catch (e) {
          console.log('Could not decode JWT parts:', e.message);
          addTestResult('JWT Token Check', `Failed to decode token: ${e.message}`, false);
        }
      } else {
        addTestResult('JWT Token Check', 'Invalid token format (not 3 parts)', false);
      }
    } catch (error) {
      addTestResult('JWT Token Check', `Failed: ${error.message}`, false);
    }
  };

  const testCookies = () => {
    try {
      addTestResult('Cookie Check', 'Analyzing authentication cookies...', true);
      
      console.log('=== COOKIE ANALYSIS ===');
      console.log('All cookies:', document.cookie);
      
      // Check for our specific cookies
      const authToken = getCookie('fomi_token');
      const refreshToken = getCookie('fomi_refresh_token');
      
      console.log('=== AUTH COOKIES ===');
      console.log('fomi_token cookie:', authToken ? 'Present' : 'Missing');
      console.log('fomi_refresh_token cookie:', refreshToken ? 'Present' : 'Missing');
      
      if (authToken) {
        console.log('Auth token from cookie length:', authToken.length);
        console.log('Auth token from cookie (first 50 chars):', authToken.substring(0, 50) + '...');
      }
      
      if (refreshToken) {
        console.log('Refresh token from cookie length:', refreshToken.length);
        console.log('Refresh token from cookie (first 20 chars):', refreshToken.substring(0, 20) + '...');
      }
      
      // Compare with localStorage
      const localAuthToken = localStorage.getItem('fomi_token');
      const localRefreshToken = localStorage.getItem('fomi_refresh_token');
      
      console.log('=== COMPARISON ===');
      console.log('localStorage fomi_token:', localAuthToken ? 'Present' : 'Missing');
      console.log('localStorage fomi_refresh_token:', localRefreshToken ? 'Present' : 'Missing');
      
      if (authToken && localAuthToken) {
        console.log('Tokens match:', authToken === localAuthToken);
      }
      
      addTestResult('Cookie Check', `Auth cookie: ${authToken ? 'Present' : 'Missing'}, Refresh cookie: ${refreshToken ? 'Present' : 'Missing'}`, true);
    } catch (error) {
      addTestResult('Cookie Check', `Failed: ${error.message}`, false);
    }
  };

  const testTokenStorage = () => {
    try {
      addTestResult('Token Storage Check', 'Checking token storage...', true);
      
      console.log('=== TOKEN STORAGE DEBUG ===');
      
      // Check localStorage
      const localAuthToken = localStorage.getItem('fomi_token');
      const localRefreshToken = localStorage.getItem('fomi_refresh_token');
      
      console.log('localStorage fomi_token:', localAuthToken ? 'Present' : 'Missing');
      console.log('localStorage fomi_refresh_token:', localRefreshToken ? 'Present' : 'Missing');
      
      // Check cookies
      const cookieAuthToken = getCookie('fomi_token');
      const cookieRefreshToken = getCookie('fomi_refresh_token');
      
      console.log('Cookie fomi_token:', cookieAuthToken ? 'Present' : 'Missing');
      console.log('Cookie fomi_refresh_token:', cookieRefreshToken ? 'Present' : 'Missing');
      
      // Check all localStorage keys
      console.log('All localStorage keys:', Object.keys(localStorage));
      
      // Check if tokens are valid JWT format
      if (localAuthToken) {
        const parts = localAuthToken.split('.');
        console.log('Auth token parts:', parts.length);
        if (parts.length === 3) {
          try {
            const payload = JSON.parse(atob(parts[1]));
            console.log('Auth token payload:', payload);
            console.log('=== JWT PAYLOAD ANALYSIS ===');
            console.log('All payload fields:', Object.keys(payload));
            console.log('sub (subject):', payload.sub);
            console.log('user_id:', payload.user_id);
            console.log('id:', payload.id);
            console.log('aud (audience):', payload.aud);
            console.log('iss (issuer):', payload.iss);
            console.log('exp (expiration):', new Date(payload.exp * 1000));
            console.log('iat (issued at):', new Date(payload.iat * 1000));
            
            // Check token expiration
            const now = Date.now() / 1000;
            const isExpired = payload.exp < now;
            console.log('Current time:', new Date(now * 1000));
            console.log('Is token expired:', isExpired);
            console.log('Time until expiry:', Math.floor(payload.exp - now), 'seconds');
            
            // Check which field the backend might be looking for
            const possibleUserIds = [
              { field: 'sub', value: payload.sub },
              { field: 'user_id', value: payload.user_id },
              { field: 'id', value: payload.id },
              { field: 'userId', value: payload.userId },
              { field: 'user', value: payload.user }
            ];
            
            console.log('=== POSSIBLE USER ID FIELDS ===');
            possibleUserIds.forEach(({ field, value }) => {
              console.log(`${field}:`, value ? `"${value}"` : 'undefined');
            });
            
            // Find the first non-empty user ID
            const userId = possibleUserIds.find(({ value }) => value)?.value;
            console.log('Recommended User ID field:', userId);
          } catch (e) {
            console.log('Could not decode auth token payload:', e.message);
          }
        }
      }
      
      addTestResult('Token Storage Check', `localStorage: ${localAuthToken ? 'Present' : 'Missing'}, Cookie: ${cookieAuthToken ? 'Present' : 'Missing'}`, true);
    } catch (error) {
      addTestResult('Token Storage Check', `Failed: ${error.message}`, false);
    }
  };

    const testRefreshToken = async () => {
    try {
      addTestResult('Refresh Token', 'Attempting to refresh token...', true);

      console.log('=== REFRESH TOKEN DEBUG ===');

      // Get current refresh token
      const refreshToken = localStorage.getItem('fomi_refresh_token');
      if (!refreshToken) {
        addTestResult('Refresh Token', 'No refresh token found', false);
        return;
      }

      console.log('Refresh token found:', refreshToken ? 'Present' : 'Missing');
      console.log('Refresh token length:', refreshToken.length);

      // Import the auth service to use refreshToken method
      const { authApiService } = await import('@/lib/api/auth');

      // Attempt to refresh the token
      console.log('Calling refreshToken method...');
      const result = await authApiService.refreshToken(refreshToken);

      console.log('Refresh result:', result);

      // Check if new token was stored
      const newToken = localStorage.getItem('fomi_token');
      console.log('New token stored:', newToken ? 'YES' : 'NO');

      if (newToken) {
        console.log('New token length:', newToken.length);
        console.log('New token starts with:', newToken.substring(0, 50) + '...');
      }

      addTestResult('Refresh Token', 'Token refreshed successfully', true);
    } catch (error) {
      console.error('Refresh token error:', error);
      addTestResult('Refresh Token', `Failed: ${error.message}`, false);
    }
  };

  const testAutoRefresh = async () => {
    try {
      addTestResult('Auto Refresh', 'Testing auto-refresh system...', true);

      console.log('=== AUTO REFRESH DEBUG ===');

      // Import the auth service
      const { authApiService } = await import('@/lib/api/auth');

      // Get current token info
      const token = localStorage.getItem('fomi_token');
      if (!token) {
        addTestResult('Auto Refresh', 'No token found', false);
        return;
      }

      // Decode token to get expiry info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Date.now() / 1000;
        const expiresAt = payload.exp;
        const timeUntilExpiry = Math.floor(expiresAt - now);

        console.log('Current token expires at:', new Date(expiresAt * 1000));
        console.log('Time until expiry:', timeUntilExpiry, 'seconds');

        // Test auto-refresh methods
        const expiryTime = authApiService.getTokenExpiryTime();
        const timeUntil = authApiService.getTimeUntilExpiry();

        console.log('getTokenExpiryTime():', expiryTime);
        console.log('getTimeUntilExpiry():', timeUntil, 'seconds');

        addTestResult('Auto Refresh', `Token expires in ${timeUntilExpiry}s, auto-refresh active`, true);
      } catch (e) {
        console.error('Error decoding token:', e);
        addTestResult('Auto Refresh', 'Error decoding token', false);
      }
    } catch (error) {
      console.error('Auto refresh test error:', error);
      addTestResult('Auto Refresh', `Failed: ${error.message}`, false);
    }
  };

  const testForceRefresh = async () => {
    try {
      addTestResult('Force Refresh', 'Forcing immediate token refresh...', true);

      console.log('=== FORCE REFRESH DEBUG ===');

      // Import the auth service
      const { authApiService } = await import('@/lib/api/auth');

      // Force a refresh by calling the internal method
      await authApiService.refreshTokenIfNeeded();

      addTestResult('Force Refresh', 'Force refresh completed', true);
    } catch (error) {
      console.error('Force refresh error:', error);
      addTestResult('Force Refresh', `Failed: ${error.message}`, false);
    }
  };

  const testDeleteAccount = async () => {
    try {
      addTestResult('Delete Account', 'Starting account deletion...', true);

      console.log('=== DELETE ACCOUNT DEBUG ===');
      console.log('Current user:', user);
      console.log('User ID:', user?.id);
      console.log('User email:', user?.email);

      // Show confirmation dialog
      const confirmed = window.confirm(
        `Are you sure you want to delete your account?\n\n` +
        `This action cannot be undone and will permanently delete:\n` +
        `• Your profile (${user?.email})\n` +
        `• All your data\n` +
        `• Your credits (${userCredits || 0})\n\n` +
        `Click OK to proceed or Cancel to abort.`
      );

      if (!confirmed) {
        addTestResult('Delete Account', 'Account deletion cancelled by user', true);
        return;
      }

      console.log('User confirmed account deletion');
      const result = await deleteAccount();
      
      console.log('Delete account result:', result);
      addTestResult('Delete Account', 'Account deleted successfully', true);
    } catch (error) {
      console.error('Delete account error:', error);
      addTestResult('Delete Account', `Failed: ${error.message}`, false);
    }
  };

  const clearTokensAndRelogin = async () => {
    try {
      addTestResult('Clear Tokens', 'Clearing all stored tokens...', true);
      
      // Import auth service and clear tokens
      const { authApiService } = await import('@/lib/api/auth');
      authApiService.clearStoredTokens();
      
      addTestResult('Clear Tokens', 'Tokens cleared successfully. Please log in again.', true);
      
      // Force page reload to reset state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Clear tokens error:', error);
      addTestResult('Clear Tokens', `Error: ${error.message}`, false);
    }
  };

  // Helper function to get cookie value
  const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const clearResults = () => {
    setTestResults([]);
    clearError();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
                 <h1 className="text-3xl font-bold text-gray-900 mb-8">🔐 Authentication Service Tester</h1>
         
         {/* Login Status Indicator */}
         <div className="bg-white rounded-lg shadow-md p-6 mb-8">
           <div className="flex items-center justify-between">
             <h2 className="text-xl font-semibold">🔍 Login Status</h2>
             <LoginStatusIndicator showDetails={true} />
           </div>
         </div>
        
                 {/* Current Status */}
         <div className="bg-white rounded-lg shadow-md p-6 mb-8">
           <h2 className="text-xl font-semibold mb-4">Current Status</h2>
           
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p className="text-sm font-medium">Authenticated</p>
                <p className="text-xs text-gray-500">{isAuthenticated ? 'Yes' : 'No'}</p>
              </div>
              <div className="text-center">
                <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${isLoading ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                <p className="text-sm font-medium">Loading</p>
                <p className="text-xs text-gray-500">{isLoading ? 'Yes' : 'No'}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Credits</p>
                <p className="text-xs text-gray-500">{userCredits || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">User</p>
                <p className="text-xs text-gray-500">{user?.name || 'None'}</p>
              </div>
            </div>
            
            {/* User Information Display */}
            {isAuthenticated && user && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-medium text-blue-800 mb-2">👤 Current User Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>ID:</strong> <span className="font-mono text-xs">{user.id}</span></p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Name:</strong> {user.name || 'Not set'}</p>
                    <p><strong>Credits:</strong> {userCredits || 0}</p>
                  </div>
                  <div>
                                         <p><strong>Avatar:</strong> {user.avatar || user.avatarUrl ? 'Yes' : 'No'}</p>
                    <p><strong>Created:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</p>
                    <p><strong>Updated:</strong> {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Unknown'}</p>
                    {user.subscription && (
                      <p><strong>Plan:</strong> {user.subscription.plan || 'Unknown'}</p>
                    )}
                  </div>
                </div>
                                 {(user.avatar || user.avatarUrl) && (
                   <div className="mt-2">
                     <img 
                       src={user.avatar || user.avatarUrl} 
                       alt="User Avatar" 
                       className="w-12 h-12 rounded-full border-2 border-blue-300"
                     />
                   </div>
                 )}
              </div>
            )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>Error:</strong> {error.message}
            </div>
          )}
        </div>

                 {/* Test Controls */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Registration Form */}
           <div className="bg-white rounded-lg shadow-md p-6">
             <h3 className="text-lg font-semibold mb-4">📝 Registration</h3>
             <div className="space-y-3">
               <input
                 type="email"
                 name="email"
                 placeholder="Email"
                 value={formData.email}
                 onChange={handleInputChange}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
               <input
                 type="password"
                 name="password"
                 placeholder="Password"
                 value={formData.password}
                 onChange={handleInputChange}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
                                                             <input
                   type="text"
                   name="name"
                   placeholder="Full Name"
                   value={formData.name}
                   onChange={handleInputChange}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
                                <input
                   type="url"
                   name="avatar_url"
                   placeholder="Avatar URL (optional)"
                   value={formData.avatar_url}
                   onChange={handleInputChange}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
               <button
                 onClick={testRegister}
                 disabled={isLoading}
                 className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
               >
                 {isLoading ? <LoadingStates.Button text="Registering..." /> : 'Register'}
               </button>
             </div>
           </div>

           {/* Login Form */}
           <div className="bg-white rounded-lg shadow-md p-6">
             <h3 className="text-lg font-semibold mb-4">🔑 Login</h3>
             <div className="space-y-3">
               <input
                 type="email"
                 name="email"
                 placeholder="Email"
                 value={loginData.email}
                 onChange={(e) => handleInputChange(e, 'login')}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
               <input
                 type="password"
                 name="password"
                 placeholder="Password"
                 value={loginData.password}
                 onChange={(e) => handleInputChange(e, 'login')}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
               <button
                 onClick={testLogin}
                 disabled={isLoading}
                 className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
               >
                 {isLoading ? <LoadingStates.Button text="Logging in..." /> : 'Login'}
               </button>
             </div>
           </div>

          {/* Profile Update Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">✏️ Update Profile</h3>
                                                   <div className="space-y-3">
                <input
                  type="text"
                  name="name"
                  placeholder="New Full Name"
                  value={updateData.name}
                  onChange={(e) => handleInputChange(e, 'update')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
               <input
                 type="email"
                 name="email"
                 placeholder="New Email"
                 value={updateData.email}
                 onChange={(e) => handleInputChange(e, 'update')}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
               <input
                 type="url"
                 name="avatar_url"
                 placeholder="New Avatar URL"
                 value={updateData.avatar_url}
                 onChange={(e) => handleInputChange(e, 'update')}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
              <button
                onClick={testUpdateProfile}
                disabled={isLoading || !isAuthenticated}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? <LoadingStates.Button text="Updating..." /> : 'Update Profile'}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">🚀 Test Actions</h3>
                                                                 <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
             <button
               onClick={testGoogleLogin}
               disabled={isLoading}
               className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
             >
               Google Login (Real)
             </button>
             <button
               onClick={testMockGoogleLogin}
               disabled={isLoading}
               className="bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50"
             >
               Mock Google Login
             </button>
             <button
               onClick={testGetProfile}
               disabled={isLoading || !isAuthenticated}
               className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
             >
               Get Profile
             </button>
             <button
               onClick={testHealthCheck}
               disabled={isLoading}
               className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
             >
               Health Check
             </button>
                           <button
                onClick={testLogout}
                disabled={isLoading || !isAuthenticated}
                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Logout
              </button>
                             <button
                 onClick={testLocalStorage}
                 disabled={isLoading}
                 className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50"
               >
                 Test localStorage
               </button>
                               <button
                  onClick={testDataCheck}
                  disabled={isLoading}
                  className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  Check Data
                </button>
                                 <button
                   onClick={testJWTToken}
                   disabled={isLoading}
                   className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
                 >
                   Check JWT Token
                 </button>
                                   <button
                    onClick={testCookies}
                    disabled={isLoading}
                    className="bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 disabled:opacity-50"
                  >
                    Check Cookies
                  </button>
                                     <button
                     onClick={testTokenStorage}
                     disabled={isLoading}
                     className="bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 disabled:opacity-50"
                   >
                     Check Token Storage
                   </button>
                                       <button
                      onClick={testRefreshToken}
                      disabled={isLoading}
                      className="bg-cyan-600 text-white py-2 px-4 rounded-md hover:bg-cyan-700 disabled:opacity-50"
                    >
                      Refresh Token
                    </button>
                    <button
                      onClick={testAutoRefresh}
                      disabled={isLoading}
                      className="bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Test Auto Refresh
                    </button>
                                         <button
                       onClick={testForceRefresh}
                       disabled={isLoading}
                       className="bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 disabled:opacity-50"
                     >
                       Force Refresh
                     </button>
                     <button
                       onClick={testDeleteAccount}
                       disabled={isLoading || !isAuthenticated}
                       className="bg-red-700 text-white py-2 px-4 rounded-md hover:bg-red-800 disabled:opacity-50"
                     >
                       🗑️ Delete Account
                     </button>
                     <button
                       onClick={clearTokensAndRelogin}
                       disabled={isLoading}
                       className="bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50"
                     >
                       🔄 Clear Tokens & Relogin
                     </button>
           </div>

          {/* Credits Section */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium mb-2">💰 Add Credits</h4>
            <div className="flex gap-2">
              <input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Amount"
              />
              <button
                onClick={testAddCredits}
                disabled={isLoading || !isAuthenticated}
                className="bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 disabled:opacity-50"
              >
                Add Credits
              </button>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">📊 Test Results</h3>
            <button
              onClick={clearResults}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear Results
            </button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No test results yet. Run some tests to see results here.</p>
            ) : (
              testResults.map((result) => (
                <div
                  key={result.id}
                  className={`p-3 rounded-md border ${
                    result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                        {result.test}
                      </p>
                      <p className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                        {result.result}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTester;
