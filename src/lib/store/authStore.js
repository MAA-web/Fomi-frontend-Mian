import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Authentication Store for managing user state
const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null,
      refreshToken: null,

      // Actions
      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          error: null 
        });
      },

      setTokens: (token, refreshToken) => {
        set({ 
          token, 
          refreshToken,
          isAuthenticated: !!token 
        });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // Login action
      login: (userData, token, refreshToken) => {
        set({
          user: userData,
          token,
          refreshToken,
          isAuthenticated: true,
          error: null,
          isLoading: false,
        });
      },

      // Logout action
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
        });
      },

      // Update user profile
      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      // Update credits
      updateCredits: (newCredits) => {
        set((state) => ({
          user: state.user ? { ...state.user, credits: newCredits } : null,
        }));
      },

      // Check authentication status
      checkAuth: () => {
        const state = get();
        return state.isAuthenticated && !!state.token;
      },

      // Get user ID
      getUserId: () => {
        const state = get();
        return state.user?.id;
      },

      // Get user credits
      getUserCredits: () => {
        const state = get();
        return state.user?.credits || 0;
      },

      // Check if user has enough credits
      hasEnoughCredits: (requiredCredits) => {
        const state = get();
        return (state.user?.credits || 0) >= requiredCredits;
      },

      // Reset store
      reset: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          token: null,
          refreshToken: null,
        });
      },
    }),
    {
      name: 'fomi-auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
