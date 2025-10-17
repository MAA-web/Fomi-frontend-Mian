import authApiService from '../auth';
import apiClient from '../client';

// Mock the API client
jest.mock('../client');

describe('AuthApiService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  describe('checkHealth', () => {
    it('should return health status when API is healthy', async () => {
      const mockResponse = {
        status: 'ok',
        message: 'User Service is healthy',
      };

      apiClient.get.mockResolvedValue(mockResponse);

      const result = await authApiService.checkHealth();

      expect(apiClient.get).toHaveBeenCalledWith('/users/health');
      expect(result).toEqual({
        status: 'ok',
        message: 'User Service is healthy',
        isHealthy: true,
      });
    });

    it('should handle health check failure', async () => {
      const mockError = new Error('Service unavailable');
      apiClient.get.mockRejectedValue(mockError);

      await expect(authApiService.checkHealth()).rejects.toThrow();
    });
  });

  describe('registerUser', () => {
    it('should register user successfully', async () => {
      const mockResponse = {
        message: 'User registered successfully',
        user_id: 'user123',
        token: 'jwt-token',
        refresh_token: 'refresh-token',
      };

      apiClient.post.mockResolvedValue(mockResponse);

      const params = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const result = await authApiService.registerUser(params);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result).toEqual({
        message: 'User registered successfully',
        userId: 'user123',
        token: 'jwt-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should handle registration with optional fields', async () => {
      const mockResponse = {
        message: 'User registered successfully',
        user_id: 'user123',
        token: 'jwt-token',
        refresh_token: 'refresh-token',
      };

      apiClient.post.mockResolvedValue(mockResponse);

      const params = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        googleId: 'google123',
        avatar: 'avatar-url',
      };

      await authApiService.registerUser(params);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        googleId: 'google123',
        avatar: 'avatar-url',
      });
    });
  });

  describe('loginWithGoogle', () => {
    it('should login with Google successfully', async () => {
      const mockResponse = {
        message: 'Logged in successfully with Google',
        user_id: 'user123',
        token: 'jwt-token',
        refresh_token: 'refresh-token',
      };

      apiClient.post.mockResolvedValue(mockResponse);

      const result = await authApiService.loginWithGoogle('google-id-token');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/google/login', {
        id_token: 'google-id-token',
      });

      expect(result).toEqual({
        message: 'Logged in successfully with Google',
        userId: 'user123',
        token: 'jwt-token',
        refreshToken: 'refresh-token',
      });
    });
  });

  describe('getUserProfile', () => {
    it('should get user profile successfully', async () => {
      const mockResponse = {
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          credits: 100,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
      };

      apiClient.get.mockResolvedValue(mockResponse);

      const result = await authApiService.getUserProfile();

      expect(apiClient.get).toHaveBeenCalledWith('/auth/profile');
      expect(result).toEqual({
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          credits: 100,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
        message: undefined,
      });
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const mockResponse = {
        user: {
          id: 'user123',
          email: 'new@example.com',
          name: 'New Name',
          credits: 100,
          updated_at: '2023-01-01T00:00:00Z',
        },
        message: 'User profile updated successfully',
      };

      apiClient.put.mockResolvedValue(mockResponse);

      const updates = {
        name: 'New Name',
        email: 'new@example.com',
      };

      const result = await authApiService.updateUserProfile(updates);

      expect(apiClient.put).toHaveBeenCalledWith('/auth/profile', {
        name: 'New Name',
        email: 'new@example.com',
      });

      expect(result).toEqual({
        user: {
          id: 'user123',
          email: 'new@example.com',
          name: 'New Name',
          credits: 100,
          updatedAt: '2023-01-01T00:00:00Z',
        },
        message: 'User profile updated successfully',
      });
    });
  });

  describe('addCredits', () => {
    it('should add credits successfully', async () => {
      const mockResponse = {
        message: 'Credits added successfully',
        user_id: 'user123',
        new_credits_balance: 150,
      };

      apiClient.post.mockResolvedValue(mockResponse);

      const result = await authApiService.addCredits('user123', 50);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/user123/credits', {
        amount: 50,
      });

      expect(result).toEqual({
        message: 'Credits added successfully',
        userId: 'user123',
        newCreditsBalance: 150,
        success: true,
      });
    });
  });

  describe('token management', () => {
    it('should store and retrieve tokens', () => {
      const token = 'test-token';
      const refreshToken = 'test-refresh-token';

      authApiService.storeToken(token);
      authApiService.storeRefreshToken(refreshToken);

      expect(localStorage.setItem).toHaveBeenCalledWith('fomi_token', token);
      expect(localStorage.setItem).toHaveBeenCalledWith('fomi_refresh_token', refreshToken);

      localStorage.getItem.mockReturnValue(token);
      const retrievedToken = authApiService.getStoredToken();
      expect(retrievedToken).toBe(token);
    });

    it('should clear stored tokens', () => {
      authApiService.clearStoredTokens();

      expect(localStorage.removeItem).toHaveBeenCalledWith('fomi_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('fomi_refresh_token');
    });

    it('should check authentication status', () => {
      // Mock a valid JWT token
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.signature';
      
      localStorage.getItem.mockReturnValue(validToken);
      
      const isAuth = authApiService.isAuthenticated();
      expect(isAuth).toBe(true);
    });

    it('should return false for invalid token', () => {
      localStorage.getItem.mockReturnValue('invalid-token');
      
      const isAuth = authApiService.isAuthenticated();
      expect(isAuth).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockError = {
        status: 400,
        message: 'Invalid email format',
        code: 'INVALID_EMAIL',
      };

      apiClient.post.mockRejectedValue(mockError);

      await expect(authApiService.registerUser({
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      })).rejects.toThrow();
    });

    it('should clear tokens on 401 error', () => {
      const error = {
        status: 401,
        message: 'Unauthorized',
      };

      const result = authApiService.handleApiError(error, 'Test context');
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('fomi_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('fomi_refresh_token');
      expect(result.error).toBe(true);
    });
  });
});
