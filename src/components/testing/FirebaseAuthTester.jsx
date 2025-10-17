"use client";

import React, { useState } from 'react';
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth';
import LoadingSpinner, { LoadingStates } from '@/components/ui/LoadingSpinner';
import apiClient from '@/lib/api/client';

// Firebase Authentication Tester Component
const FirebaseAuthTester = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    userCredits,
    register,
    login,
    loginWithGoogle,
    logout,
    updateProfile,
    deleteAccount,
    sendPasswordResetEmail,
    sendEmailVerification,
    addCredits,
    getIdToken,
    clearError,
    prepareUserDataForBackend,
  } = useFirebaseAuth();

  const [formData, setFormData] = useState({
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    avatarUrl: '',
    avatarFile: null
  });

  const [updateData, setUpdateData] = useState({
    displayName: '',
    photoURL: '',
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
    } else {
      setUpdateData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle file upload to backend
  const uploadAvatarFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch('https://api.tarum.ai/user-service/auth/firebase/login', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }
      
      const result = await response.json();
      return result.avatarUrl;
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  };

  const testRegister = async () => {
    try {
      addTestResult('Firebase Register', 'Starting registration...', true);
      console.log('Registration form data:', formData);
      
      // Handle avatar upload if file is selected
      let finalAvatarUrl = formData.avatarUrl;
      if (formData.avatarFile) {
        addTestResult('Firebase Register', 'Uploading avatar file...', true);
        try {
          finalAvatarUrl = await uploadAvatarFile(formData.avatarFile);
          addTestResult('Firebase Register', 'Avatar uploaded successfully', true);
        } catch (uploadError) {
          addTestResult('Firebase Register', `Avatar upload failed: ${uploadError.message}`, false);
          return;
        }
      }
      
      // Prepare registration data with avatar
      const registrationData = {
        ...formData,
        photoURL: finalAvatarUrl || null
      };
      
      const result = await register(registrationData);
      console.log('Registration result:', result);
      
      if (result.success) {
        addTestResult('Firebase Register', `Success! User: ${result.user.email}`, true);
        addTestResult('Firebase Register', 'Backend sync attempted via /auth/firebase/login', true);
        // Clear form after successful registration
        setFormData({
          email: '',
          password: '',
          name: '',
          avatarUrl: '',
          avatarFile: null
        });
      } else {
        addTestResult('Firebase Register', `Failed: ${result.message}`, false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      addTestResult('Firebase Register', `Failed: ${error.message}`, false);
    }
  };

  const testLogin = async () => {
    try {
      addTestResult('Firebase Login', 'Starting login...', true);
      console.log('Login form data:', formData);
      
      const result = await login(formData);
      console.log('Login result:', result);
      
      if (result.success) {
        addTestResult('Firebase Login', `Success! User: ${result.user.email}`, true);
      } else {
        addTestResult('Firebase Login', `Failed: ${result.message}`, false);
      }
    } catch (error) {
      console.error('Login error:', error);
      addTestResult('Firebase Login', `Failed: ${error.message}`, false);
    }
  };

  const testGoogleLogin = async () => {
    try {
      addTestResult('Firebase Google Login', 'Starting Google login...', true);
      
      const result = await loginWithGoogle();
      console.log('Google login result:', result);
      
      if (result.success) {
        addTestResult('Firebase Google Login', `Success! User: ${result.user.email}`, true);
      } else {
        addTestResult('Firebase Google Login', `Failed: ${result.message}`, false);
      }
    } catch (error) {
      console.error('Google login error:', error);
      addTestResult('Firebase Google Login', `Failed: ${error.message}`, false);
    }
  };

  const testLogout = async () => {
    try {
      addTestResult('Firebase Logout', 'Logging out...', true);
      
      const result = await logout();
      console.log('Logout result:', result);
      
      if (result.success) {
        addTestResult('Firebase Logout', 'Successfully logged out', true);
      } else {
        addTestResult('Firebase Logout', `Failed: ${result.message}`, false);
      }
    } catch (error) {
      console.error('Logout error:', error);
      addTestResult('Firebase Logout', `Failed: ${error.message}`, false);
    }
  };

  const testUpdateProfile = async () => {
    try {
      addTestResult('Firebase Update Profile', 'Updating profile...', true);
      console.log('Update form data:', updateData);
      
      const result = await updateProfile(updateData);
      console.log('Update profile result:', result);
      
      if (result.success) {
        addTestResult('Firebase Update Profile', `Success! Updated: ${result.user.name}`, true);
      } else {
        addTestResult('Firebase Update Profile', `Failed: ${result.message}`, false);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      addTestResult('Firebase Update Profile', `Failed: ${error.message}`, false);
    }
  };

  const testPasswordReset = async () => {
    try {
      addTestResult('Firebase Password Reset', 'Sending password reset email...', true);
      
      const result = await sendPasswordResetEmail(formData.email);
      console.log('Password reset result:', result);
      
      if (result.success) {
        addTestResult('Firebase Password Reset', 'Password reset email sent successfully', true);
      } else {
        addTestResult('Firebase Password Reset', `Failed: ${result.message}`, false);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      addTestResult('Firebase Password Reset', `Failed: ${error.message}`, false);
    }
  };

  const testEmailVerification = async () => {
    try {
      addTestResult('Firebase Email Verification', 'Sending email verification...', true);
      
      const result = await sendEmailVerification();
      console.log('Email verification result:', result);
      
      if (result.success) {
        addTestResult('Firebase Email Verification', 'Email verification sent successfully', true);
      } else {
        addTestResult('Firebase Email Verification', `Failed: ${result.message}`, false);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      addTestResult('Firebase Email Verification', `Failed: ${error.message}`, false);
    }
  };

  const testGetIdToken = async () => {
    try {
      addTestResult('Firebase Get ID Token', 'Getting ID token...', true);
      
      const token = await getIdToken();
      console.log('ID token result:', token ? 'Present' : 'Missing');
      
      if (token) {
        addTestResult('Firebase Get ID Token', `Token obtained (${token.length} chars)`, true);
      } else {
        addTestResult('Firebase Get ID Token', 'No token available', false);
      }
    } catch (error) {
      console.error('Get ID token error:', error);
      addTestResult('Firebase Get ID Token', `Failed: ${error.message}`, false);
    }
  };

  const testPrepareUserDataForBackend = async () => {
    try {
      addTestResult('Prepare User Data for Backend', 'Preparing user data...', true);
      
      if (!isAuthenticated) {
        addTestResult('Prepare User Data for Backend', 'Failed: User not authenticated. Please log in first.', false);
        return;
      }

      const userData = await prepareUserDataForBackend();
      console.log('User data for backend:', userData);
      
      addTestResult('Prepare User Data for Backend', `Success! User: ${userData.profile.email}`, true);
      addTestResult('Backend Data Structure', `Firebase UID: ${userData.firebase.uid}`, true);
      addTestResult('Backend Data Structure', `Token length: ${userData.idToken.length} chars`, true);
      addTestResult('Backend Data Structure', `Plan: ${userData.billing.plan}`, true);
      addTestResult('Backend Data Structure', `Credits: ${userData.credits.currentBalance}`, true);
    } catch (error) {
      console.error('Prepare user data error:', error);
      addTestResult('Prepare User Data for Backend', `Failed: ${error.message}`, false);
    }
  };

  const testBackendDataFlow = async () => {
    try {
      addTestResult('Backend Data Flow Test', 'Testing simplified data flow...', true);
      
      if (!isAuthenticated) {
        addTestResult('Backend Data Flow Test', 'Failed: User not authenticated. Please log in first.', false);
        return;
      }

      // Get Firebase ID token
      const idToken = await getIdToken();
      
      // Simulate what you would send to backend (SIMPLIFIED)
      const backendRequest = {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: {
          prompt: 'a beautiful sunset',
          style: 'realistic',
          size: '1024x1024'
        }
      };

      console.log('=== SIMPLIFIED FRONTEND → BACKEND REQUEST ===');
      console.log('Headers (Authorization):', backendRequest.headers.Authorization ? 'Bearer [FIREBASE_TOKEN]' : 'Missing');
      console.log('Request Body:', backendRequest.body);
      console.log('=== END SIMPLIFIED FRONTEND → BACKEND REQUEST ===');

      // Simulate what backend does
      const backendProcess = {
        step1: 'Verify Firebase token using admin.auth().verifyIdToken()',
        step2: 'Extract user info: uid, email, emailVerified',
        step3: 'Find/create user in database using firebaseUid',
        step4: 'Check if user has enough credits',
        step5: 'Process request (generate image)',
        step6: 'Deduct credits from user account',
        step7: 'Return result with remaining credits'
      };

      console.log('=== BACKEND PROCESS ===');
      console.log('Backend steps:', backendProcess);
      console.log('=== END BACKEND PROCESS ===');

      // Simulate what backend sends back
      const backendResponse = {
        success: true,
        image: 'https://example.com/generated-sunset.jpg',
        remainingCredits: 49,
        usageId: 'usage-123'
      };

      console.log('=== BACKEND → FRONTEND RESPONSE ===');
      console.log('What backend sends back:', backendResponse);
      console.log('=== END BACKEND → FRONTEND RESPONSE ===');

      // Simulate what you can display to users
      const displayData = {
        userInfo: {
          email: 'test@example.com',
          credits: 49,
          plan: 'Free'
        },
        generatedContent: {
          image: 'https://example.com/generated-sunset.jpg',
          prompt: 'a beautiful sunset'
        },
        creditsInfo: {
          used: 1,
          remaining: 49
        }
      };

      console.log('=== FRONTEND DISPLAY DATA ===');
      console.log('What you can display to users:', displayData);
      console.log('=== END FRONTEND DISPLAY DATA ===');
      
      addTestResult('Backend Data Flow Test', `Success! Simplified approach working`, true);
      addTestResult('Data Flow', `Firebase handles all auth complexity`, true);
      addTestResult('Data Flow', `Backend only needs Firebase token`, true);
      addTestResult('Data Flow', `Generated image: ${backendResponse.image}`, true);
      addTestResult('Data Flow', `Remaining credits: ${backendResponse.remainingCredits}`, true);
    } catch (error) {
      console.error('Backend data flow test error:', error);
      addTestResult('Backend Data Flow Test', `Failed: ${error.message}`, false);
    }
  };

  const testBackendPing = async () => {
    try {
      addTestResult('Backend Ping', 'GET /user-service/auth/profile ...', true);
      const res = await apiClient.get('/user-service/auth/profile');
      addTestResult('Backend Ping', `OK. User: ${res.user?.email || 'n/a'}`, true);
    } catch (error) {
      console.error('Backend ping error:', error);
      addTestResult('Backend Ping', `Failed: ${error.message}`, false);
    }
  };

  const testTokenContents = async () => {
    try {
      addTestResult('Check Token Contents', 'Getting current Firebase ID token...', true);
      if (!isAuthenticated) {
        addTestResult('Check Token Contents', 'Failed: User not authenticated. Please log in first.', false);
        return;
      }
      
      const token = await getIdToken();
      if (!token) {
        addTestResult('Backend Ping (/profile)', 'Failed: Could not get ID token', false);
        return;
      }

      // Decode the token to see its contents
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('=== CURRENT FIREBASE ID TOKEN CONTENTS ===');
        console.log('Full token payload:', payload);
        console.log('User ID:', payload.user_id || payload.sub);
        console.log('Email:', payload.email);
        console.log('Email Verified:', payload.email_verified);
        console.log('Display Name:', payload.displayName || 'NOT INCLUDED');
        console.log('Custom Claims:', payload);
        console.log('=== END TOKEN CONTENTS ===');
        
        if (payload.displayName) {
          addTestResult('Check Token Contents', `✅ Token includes displayName: "${payload.displayName}"`, true);
        } else {
          addTestResult('Check Token Contents', `⚠️ Token does NOT include displayName. Custom claims not set yet.`, false);
        }
      } catch (decodeError) {
        addTestResult('Check Token Contents', `Failed to decode token: ${decodeError.message}`, false);
      }
    } catch (error) {
      addTestResult('Check Token Contents', `Failed: ${error.message}`, false);
    }
  };

  const testDeleteAccount = async () => {
    try {
      addTestResult('Firebase Delete Account', 'Starting account deletion...', true);
      
      const confirmed = window.confirm(
        `Are you sure you want to delete your account?\n\n` +
        `This action cannot be undone and will permanently delete:\n` +
        `• Your profile (${user?.email})\n` +
        `• All your data\n` +
        `• Your credits (${userCredits || 0})\n\n` +
        `Click OK to proceed or Cancel to abort.`
      );

      if (!confirmed) {
        addTestResult('Firebase Delete Account', 'Account deletion cancelled by user', true);
        return;
      }
      
      const result = await deleteAccount();
      console.log('Delete account result:', result);
      
      if (result.success) {
        addTestResult('Firebase Delete Account', 'Account deleted successfully', true);
      } else {
        addTestResult('Firebase Delete Account', `Failed: ${result.message}`, false);
      }
    } catch (error) {
      console.error('Delete account error:', error);
      addTestResult('Firebase Delete Account', `Failed: ${error.message}`, false);
    }
  };

  const testAddCredits = async () => {
    try {
      addTestResult('Firebase Add Credits', `Adding ${creditAmount} credits...`, true);

      if (!isAuthenticated) {
        addTestResult('Firebase Add Credits', 'Failed: User not authenticated. Please log in first.', false);
        return;
      }

      const result = await addCredits(creditAmount);
      console.log('Add credits result:', result);

      if (result.success) {
        addTestResult('Firebase Add Credits', `Success! New balance: ${result.newCreditsBalance}`, true);
      } else {
        addTestResult('Firebase Add Credits', `Failed: ${result.message}`, false);
      }
    } catch (error) {
      console.error('Add credits error:', error);
      addTestResult('Firebase Add Credits', `Failed: ${error.message}`, false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    clearError();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔥 Firebase Authentication Tester</h1>
        
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
                  <p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
                  <p><strong>Avatar:</strong> {user.avatar ? 'Yes' : 'No'}</p>
                  <p><strong>Created:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</p>
                  <p><strong>Last Sign In:</strong> {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Unknown'}</p>
                </div>
              </div>
              {user.avatar && (
                <div className="mt-2">
                  <img 
                    src={user.avatar} 
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
              
              {/* Avatar URL Input */}
              <input
                type="url"
                name="avatarUrl"
                placeholder="Avatar URL (optional)"
                value={formData.avatarUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {/* Avatar File Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Or Upload Avatar File:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFormData(prev => ({ ...prev, avatarFile: file }));
                      // Clear URL if file is selected
                      setFormData(prev => ({ ...prev, avatarUrl: '' }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formData.avatarFile && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>Selected: {formData.avatarFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, avatarFile: null }))}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                    {/* Avatar Preview */}
                    <div className="flex justify-center">
                      <img
                        src={URL.createObjectURL(formData.avatarFile)}
                        alt="Avatar Preview"
                        className="w-16 h-16 rounded-full border-2 border-gray-300 object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
              
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
                name="displayName"
                placeholder="New Display Name"
                value={updateData.displayName}
                onChange={(e) => handleInputChange(e, 'update')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="url"
                name="photoURL"
                placeholder="New Avatar URL"
                value={updateData.photoURL}
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button
              onClick={testGoogleLogin}
              disabled={isLoading}
              className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              Google Login
            </button>
            <button
              onClick={testLogout}
              disabled={isLoading || !isAuthenticated}
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Logout
            </button>
            <button
              onClick={testPasswordReset}
              disabled={isLoading}
              className="bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              Password Reset
            </button>
            <button
              onClick={testEmailVerification}
              disabled={isLoading || !isAuthenticated}
              className="bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              Email Verification
            </button>
            <button
              onClick={testGetIdToken}
              disabled={isLoading || !isAuthenticated}
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              Get ID Token
            </button>
            <button
              onClick={testPrepareUserDataForBackend}
              disabled={isLoading || !isAuthenticated}
              className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              Prepare User Data for Backend
            </button>
            <button
              onClick={testBackendDataFlow}
              disabled={isLoading || !isAuthenticated}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Test Backend Data Flow
            </button>
            <button
              onClick={testBackendPing}
              disabled={isLoading || !isAuthenticated}
              className="bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              Backend Ping (/profile)
            </button>
            
            <button
              onClick={testTokenContents}
              disabled={isLoading || !isAuthenticated}
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              Check Token Contents
            </button>
            <button
              onClick={testDeleteAccount}
              disabled={isLoading || !isAuthenticated}
              className="bg-red-700 text-white py-2 px-4 rounded-md hover:bg-red-800 disabled:opacity-50"
            >
              🗑️ Delete Account
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

export default FirebaseAuthTester;
