import { useState, useCallback, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import authApiService from '../api/auth';

// Custom hook for authentication with API integration
export const useAuth = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    token,
    refreshToken,
    setUser,
    setTokens,
    setLoading,
    setError,
    clearError,
    login: storeLogin,
    logout: storeLogout,
    updateUser: storeUpdateUser,
    updateCredits,
    checkAuth,
    getUserId,
    getUserCredits,
    hasEnoughCredits,
    reset,
  } = useAuthStore();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have stored tokens
        const storedToken = authApiService.getStoredToken();
        const storedRefreshToken = authApiService.getStoredRefreshToken();

        if (storedToken && authApiService.isAuthenticated()) {
          // Try to get user profile
          const profileResponse = await authApiService.getUserProfile();
          if (profileResponse.user) {
            storeLogin(profileResponse.user, storedToken, storedRefreshToken);
          }
        }
      } catch (error) {
        // Clear invalid tokens
        authApiService.clearStoredTokens();
        storeLogout();
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [storeLogin, storeLogout]);

  // Register user
  const register = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authApiService.registerUser(params);
      
      // Get user profile after successful registration
      const profileResponse = await authApiService.getUserProfile();
      
      storeLogin(
        profileResponse.user,
        response.token,
        response.refreshToken
      );

      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, storeLogin]);

  // Standard Login
  const login = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authApiService.login(params);
      
      // Get user profile after successful login
      const profileResponse = await authApiService.getUserProfile();
      
      storeLogin(
        profileResponse.user,
        response.token,
        response.refreshToken
      );

      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, storeLogin]);

  // Login with Google
  const loginWithGoogle = useCallback(async (idToken) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authApiService.loginWithGoogle(idToken);
      
      // Get user profile after successful login
      const profileResponse = await authApiService.getUserProfile();
      
      storeLogin(
        profileResponse.user,
        response.token,
        response.refreshToken
      );

      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, storeLogin]);

  // Refresh token
  const refreshAuthToken = useCallback(async () => {
    try {
      const currentRefreshToken = authApiService.getStoredRefreshToken();
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authApiService.refreshToken(currentRefreshToken);
      setTokens(response.token, response.refreshToken);
      
      return response;
    } catch (error) {
      // If refresh fails, logout user
      logout();
      throw error;
    }
  }, [setTokens]);

  // Get user profile
  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authApiService.getUserProfile();
      setUser(response.user);
      
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setUser]);

  // Update user profile
  const updateProfile = useCallback(async (updates) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authApiService.updateUserProfile(updates);
      storeUpdateUser(response.user);
      
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, storeUpdateUser]);

  // Delete user account
  const deleteAccount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authApiService.deleteUser();
      logout();
      
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Add credits (admin/privileged)
  const addCredits = useCallback(async (userId, amount) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authApiService.addCredits(userId, amount);
      
      // Update credits if it's the current user
      if (userId === getUserId()) {
        updateCredits(response.newCreditsBalance);
      }
      
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, getUserId, updateCredits]);

  // Logout
  const logout = useCallback(() => {
    authApiService.clearStoredTokens();
    storeLogout();
  }, [storeLogout]);

  // Check health
  const checkHealth = useCallback(async () => {
    try {
      const response = await authApiService.checkHealth();
      return response;
    } catch (error) {
      console.error('Health check failed:', error);
      return { isHealthy: false, error };
    }
  }, []);

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;
      
      // Refresh token 5 minutes before expiry
      if (timeUntilExpiry > 0 && timeUntilExpiry < 300) {
        refreshAuthToken();
      }
    } catch (error) {
      console.error('Error parsing JWT token:', error);
    }
  }, [token, refreshAuthToken]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    isInitializing,
    error,
    token,
    refreshToken,
    
    // Actions
    register,
    login,
    loginWithGoogle,
    refreshAuthToken,
    getProfile,
    updateProfile,
    deleteAccount,
    addCredits,
    logout,
    checkHealth,
    clearError,
    reset,
    
    // Computed
    userId: getUserId(),
    userCredits: getUserCredits(),
    hasEnoughCredits,
    isAuthValid: checkAuth(),
  };
};

export default useAuth;
