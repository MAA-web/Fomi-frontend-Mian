import apiClient from '../client';

// Mock fetch globally
global.fetch = jest.fn();

describe('ApiClient', () => {
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

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(apiClient.baseURL).toBe('https://api.fomi.com/v1');
      expect(apiClient.version).toBe('v1');
      expect(apiClient.timeout).toBe(30000);
    });

    it('should use environment variable for baseURL', () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://test-api.com/v2';
      
      // Create new instance to test env variable
      const testClient = new (require('../client').default.constructor)();
      expect(testClient.baseURL).toBe('https://test-api.com/v2');
      
      // Restore original env
      process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv;
    });
  });

  describe('token management', () => {
    it('should get auth token from localStorage', () => {
      const mockToken = 'test-token';
      localStorage.getItem.mockReturnValue(mockToken);
      
      const token = apiClient.getAuthToken();
      expect(token).toBe(mockToken);
      expect(localStorage.getItem).toHaveBeenCalledWith('fomi_token');
    });

    it('should return null when no token exists', () => {
      localStorage.getItem.mockReturnValue(null);
      
      const token = apiClient.getAuthToken();
      expect(token).toBe(null);
    });

    it('should get refresh token from localStorage', () => {
      const mockRefreshToken = 'test-refresh-token';
      localStorage.getItem.mockReturnValue(mockRefreshToken);
      
      const token = apiClient.getRefreshToken();
      expect(token).toBe(mockRefreshToken);
      expect(localStorage.getItem).toHaveBeenCalledWith('fomi_refresh_token');
    });
  });

  describe('header creation', () => {
    it('should create headers with auth token', () => {
      const mockToken = 'test-token';
      localStorage.getItem.mockReturnValue(mockToken);
      
      const headers = apiClient.createHeaders();
      
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      });
    });

    it('should create headers without auth token', () => {
      localStorage.getItem.mockReturnValue(null);
      
      const headers = apiClient.createHeaders();
      
      expect(headers).toEqual({
        'Content-Type': 'application/json',
      });
    });

    it('should merge custom headers', () => {
      const mockToken = 'test-token';
      localStorage.getItem.mockReturnValue(mockToken);
      
      const customHeaders = { 'X-Custom-Header': 'custom-value' };
      const headers = apiClient.createHeaders(customHeaders);
      
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
        'X-Custom-Header': 'custom-value',
      });
    });
  });

  describe('HTTP methods', () => {
    beforeEach(() => {
      // Mock successful response
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'test' }),
      };
      fetch.mockResolvedValue(mockResponse);
    });

    it('should make GET request', async () => {
      const result = await apiClient.get('/test-endpoint');
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.fomi.com/v1/test-endpoint',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should make GET request with query parameters', async () => {
      const params = { page: 1, limit: 10 };
      await apiClient.get('/test-endpoint', params);
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.fomi.com/v1/test-endpoint?page=1&limit=10',
        expect.any(Object)
      );
    });

    it('should make POST request', async () => {
      const data = { name: 'test', email: 'test@example.com' };
      await apiClient.post('/test-endpoint', data);
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.fomi.com/v1/test-endpoint',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should make PUT request', async () => {
      const data = { name: 'updated' };
      await apiClient.put('/test-endpoint', data);
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.fomi.com/v1/test-endpoint',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(data),
        })
      );
    });

    it('should make DELETE request', async () => {
      await apiClient.delete('/test-endpoint');
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.fomi.com/v1/test-endpoint',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle HTTP error responses', async () => {
      const mockErrorResponse = {
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({
          message: 'Bad Request',
          code: 'INVALID_INPUT',
        }),
      };
      fetch.mockResolvedValue(mockErrorResponse);

      await expect(apiClient.get('/test-endpoint')).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      await expect(apiClient.get('/test-endpoint')).rejects.toThrow('Network error');
    });
  });

  describe('retry logic', () => {
    it('should retry failed requests', async () => {
      // Mock first two failures, then success
      const mockErrorResponse = {
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({ message: 'Server error' }),
      };
      const mockSuccessResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'success' }),
      };

      fetch
        .mockResolvedValueOnce(mockErrorResponse)
        .mockResolvedValueOnce(mockErrorResponse)
        .mockResolvedValueOnce(mockSuccessResponse);

      const result = await apiClient.get('/test-endpoint');
      
      expect(fetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ data: 'success' });
    });

    it('should not retry 401 errors', async () => {
      const mock401Response = {
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ message: 'Unauthorized' }),
      };
      fetch.mockResolvedValue(mock401Response);

      await expect(apiClient.get('/test-endpoint')).rejects.toThrow();
      expect(fetch).toHaveBeenCalledTimes(1); // No retry
    });

    it('should not retry 403 errors', async () => {
      const mock403Response = {
        ok: false,
        status: 403,
        json: jest.fn().mockResolvedValue({ message: 'Forbidden' }),
      };
      fetch.mockResolvedValue(mock403Response);

      await expect(apiClient.get('/test-endpoint')).rejects.toThrow();
      expect(fetch).toHaveBeenCalledTimes(1); // No retry
    });
  });

  describe('timeout handling', () => {
    it('should handle request timeouts', async () => {
      // Mock a slow response that exceeds timeout
      fetch.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ data: 'timeout' }),
        }), 100))
      );

      // Set a very short timeout for testing
      apiClient.timeout = 10;

      await expect(apiClient.get('/test-endpoint')).rejects.toThrow();
    });
  });

  describe('token refresh', () => {
    it('should refresh token on 401 error', async () => {
      // Mock 401 response, then successful refresh, then successful retry
      const mock401Response = {
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ message: 'Unauthorized' }),
      };
      const mockRefreshResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          token: 'new-token',
          refresh_token: 'new-refresh-token',
        }),
      };
      const mockSuccessResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'success' }),
      };

      fetch
        .mockResolvedValueOnce(mock401Response) // First request fails
        .mockResolvedValueOnce(mockRefreshResponse) // Refresh succeeds
        .mockResolvedValueOnce(mockSuccessResponse); // Retry succeeds

      // Mock refresh token in localStorage
      localStorage.getItem.mockReturnValue('old-refresh-token');

      const result = await apiClient.get('/test-endpoint');
      
      expect(fetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ data: 'success' });
    });

    it('should handle refresh token failure', async () => {
      const mock401Response = {
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ message: 'Unauthorized' }),
      };
      const mockRefreshFailure = {
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ message: 'Invalid refresh token' }),
      };

      fetch
        .mockResolvedValueOnce(mock401Response)
        .mockResolvedValueOnce(mockRefreshFailure);

      localStorage.getItem.mockReturnValue('invalid-refresh-token');

      await expect(apiClient.get('/test-endpoint')).rejects.toThrow();
    });
  });
});
