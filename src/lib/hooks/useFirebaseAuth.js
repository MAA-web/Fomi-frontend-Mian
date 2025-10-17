import { useState, useEffect, useCallback } from 'react';
import firebaseAuthService from '../firebaseAuth';

// Firebase-based Authentication Hook
const useFirebaseAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Firebase auth service
  useEffect(() => {
    const initializeAuth = async () => {
      await firebaseAuthService.initialize();
      console.log("useFirebaseAuth: Firebase Auth Service Initialized");
    };
    initializeAuth();
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    console.log('🔧 useFirebaseAuth: Setting up auth listener...')
    
    const unsubscribe = firebaseAuthService.onAuthStateChanged((firebaseUser) => {
      console.log('🔄 useFirebaseAuth: Auth state changed', firebaseUser ? firebaseUser.email : 'No user');
      
      if (firebaseUser) {
        const transformedUser = firebaseAuthService.transformFirebaseUser(firebaseUser);
        
        // Only set as authenticated if transformation was successful
        if (transformedUser && transformedUser.id) {
          console.log('✅ useFirebaseAuth: Valid user, setting authenticated state');
          setUser(transformedUser);
          setIsAuthenticated(true);
        } else {
          console.log('⚠️ useFirebaseAuth: User transformation failed, setting as unauthenticated');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('❌ useFirebaseAuth: No user, setting isLoading=false')
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
      console.log('✅ useFirebaseAuth: isLoading set to false, isAuthenticated =', firebaseUser ? 'checking...' : false)
      setError(null);
    });
    
    console.log('✅ useFirebaseAuth: Listener set up, unsubscribe:', typeof unsubscribe)
    
    // Check if auth is already initialized and call the listener immediately
    if (firebaseAuthService.isReady()) {
      console.log('🚀 useFirebaseAuth: Auth already ready, getting current user...')
      const currentUser = firebaseAuthService.getCurrentUser()
      console.log('🚀 useFirebaseAuth: Current user:', currentUser?.email || 'No user')
      
      if (currentUser) {
        const transformedUser = firebaseAuthService.transformFirebaseUser(currentUser);
        
        // Only set as authenticated if transformation was successful
        if (transformedUser && transformedUser.id) {
          console.log('✅ useFirebaseAuth: Valid user from initial check');
          setUser(transformedUser);
          setIsAuthenticated(true);
        } else {
          console.log('⚠️ useFirebaseAuth: User transformation failed in initial check');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    }

    return () => {
      console.log('🧹 useFirebaseAuth: Cleaning up listener')
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Register with email and password
  const register = useCallback(async (params) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await firebaseAuthService.registerWithEmail(
        params.email,
        params.password,
        params.name
      );

      if (!result.success) {
        setError({ message: result.message });
        return result;
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError({ message: errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCurrentUser = useCallback(() => {
    return firebaseAuthService.getCurrentUser();
  }, []);

  // Login with email and password
  const login = useCallback(async (params) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await firebaseAuthService.loginWithEmail(
        params.email,
        params.password
      );

      if (!result.success) {
        setError({ message: result.message });
        return result;
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError({ message: errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login with Google
  const loginWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await firebaseAuthService.loginWithGoogle();

      if (!result.success) {
        setError({ message: result.message });
        return result;
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Google login failed';
      setError({ message: errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await firebaseAuthService.logout();

      if (!result.success) {
        setError({ message: result.message });
        return result;
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Logout failed';
      setError({ message: errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await firebaseAuthService.updateProfile(updates);

      if (!result.success) {
        setError({ message: result.message });
        return result;
      }

      // Update local user state
      if (result.user) {
        setUser(result.user);
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Profile update failed';
      setError({ message: errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete account
  const deleteAccount = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await firebaseAuthService.deleteAccount();

      if (!result.success) {
        setError({ message: result.message });
        return result;
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Account deletion failed';
      setError({ message: errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send password reset email
  const sendPasswordResetEmail = useCallback(async (email) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await firebaseAuthService.sendPasswordResetEmail(email);

      if (!result.success) {
        setError({ message: result.message });
        return result;
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Password reset failed';
      setError({ message: errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send email verification
  const sendEmailVerification = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await firebaseAuthService.sendEmailVerification();

      if (!result.success) {
        setError({ message: result.message });
        return result;
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Email verification failed';
      setError({ message: errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get ID token for backend API calls
  const getIdToken = useCallback(async (forceRefresh = false) => {
    return await firebaseAuthService.getIdToken(forceRefresh);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get user credits (placeholder - you can fetch from your backend)
  const userCredits = user?.credits || 0;

  // Add credits (placeholder - you can implement backend integration)
  const addCredits = useCallback(async (amount) => {
    try {
      // For now, just update local state
      // In a real app, you'd call your backend API
      setUser(prev => prev ? { ...prev, credits: (prev.credits || 0) + amount } : null);
      
      return {
        success: true,
        message: `Added ${amount} credits successfully!`,
        newCreditsBalance: (user?.credits || 0) + amount
      };
    } catch (err) {
      const errorMessage = err.message || 'Failed to add credits';
      setError({ message: errorMessage });
      return { success: false, message: errorMessage };
    }
  }, [user?.credits]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    userCredits,
    
    // Actions
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
    getCurrentUser,

    // Backend integration
    prepareUserDataForBackend: () => firebaseAuthService.prepareUserDataForBackend(),
    
    // Utility
    // getCurrentUser: async () => await firebaseAuthService.getCurrentUser(),
    getUserInfo: () => firebaseAuthService.getUserInfo(),
    isReady: () => firebaseAuthService.isReady(),
  };


};

export default useFirebaseAuth;
