// Base API client with versioning and error handling
class ApiClient {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.tarum.ai';
    this.version = 'v1'; // API version for easy updates
    this.timeout = 30000; // 30 seconds
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  // Get auth token from localStorage or cookies
  getAuthToken() {
    if (typeof window !== 'undefined') {
      // Try localStorage first
      const localToken = localStorage.getItem('fomi_token');
      console.log('=== TOKEN RETRIEVAL DEBUG ===');
      console.log('localStorage fomi_token:', localToken ? 'Present' : 'Missing');
      if (localToken) {
        console.log('Token length:', localToken.length);
        console.log('Token starts with:', localToken.substring(0, 20));
        return localToken;
      }
      
      // Fallback to cookies
      const cookieToken = this.getCookie('fomi_token');
      console.log('Cookie fomi_token:', cookieToken ? 'Present' : 'Missing');
      return cookieToken;
    }
    return null;
  }

  // Get refresh token from localStorage or cookies
  getRefreshToken() {
    if (typeof window !== 'undefined') {
      // Try localStorage first
      const localToken = localStorage.getItem('fomi_refresh_token');
      console.log('🔄 getRefreshToken - localStorage:', localToken ? 'Present' : 'Missing');
      if (localToken) {
        console.log('🔄 getRefreshToken - Token length:', localToken.length);
        return localToken;
      }
      
      // Fallback to cookies
      const cookieToken = this.getCookie('fomi_refresh_token');
      console.log('🔄 getRefreshToken - Cookie:', cookieToken ? 'Present' : 'Missing');
      return cookieToken;
    }
    return null;
  }

  // Helper method to get a cookie
  getCookie(name) {
    if (typeof window !== 'undefined') {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  }

  // Create headers with authentication
  createHeaders(customHeaders = {}) {
    const token = this.getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': 'KJ6AqozvJAsc42tHxXumi+3gdmLgIqCd/xLAPq948v8=',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...customHeaders,
    };
    
    // Debug logging for token issues
    console.log('=== TOKEN DEBUG ===');
    console.log('Token exists:', !!token);
    if (token) {
      console.log('Token length:', token.length);
      console.log('Token starts with:', token.substring(0, 20));
      console.log('Token ends with:', token.substring(token.length - 20));
    }
    console.log('Authorization header:', headers.Authorization ? 'Present' : 'Missing');
    if (headers.Authorization) {
      console.log('Authorization value starts with:', headers.Authorization.substring(0, 30));
    }
    console.log('=== END TOKEN DEBUG ===');
    
    return headers;
  }

  // Process failed queue after token refresh
  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  // Refresh token
  async refreshToken() {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.processQueue(new Error('No refresh token available'));
      this.isRefreshing = false;
      return Promise.reject(new Error('No refresh token available'));
    }

    try {
             const response = await fetch(`${this.baseURL}/user-service/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'omit', // Don't include credentials to avoid CORS issues
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new ApiError(response.status, 'Token refresh failed', 'REFRESH_FAILED');
      }

      const data = await response.json();
      
      // Store new tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem('fomi_token', data.token);
        localStorage.setItem('fomi_refresh_token', data.refresh_token);
      }

      this.processQueue(null, data.token);
      this.isRefreshing = false;
      
      return data.token;
    } catch (error) {
      this.processQueue(error);
      this.isRefreshing = false;
      
      // Clear invalid tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fomi_token');
        localStorage.removeItem('fomi_refresh_token');
      }
      
      throw error;
    }
  }

  // Handle API responses
  async handleResponse(response) {
    console.log('=== RESPONSE DEBUG ===');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('Error Response Body:', errorData);
      console.log('=== END RESPONSE DEBUG ===');
      throw new ApiError(
        response.status,
        errorData.message || `HTTP ${response.status}`,
        errorData.code || 'UNKNOWN_ERROR',
        errorData.details
      );
    }

    const data = await response.json();
    console.log('Success Response Body:', data);
    console.log('=== END RESPONSE DEBUG ===');
    return data;
  }

  // Make HTTP request with retry logic and token refresh
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Build base headers first (may include legacy JWT). We'll override with Firebase ID token if available.
    const baseHeaders = this.createHeaders(options.headers);

    // Try to get Firebase ID token and prefer it for Authorization
    try {
      const { default: firebaseAuthService } = await import('../firebaseAuth.js');
      const firebaseIdToken = await firebaseAuthService.getIdToken();
      if (firebaseIdToken) {
        baseHeaders['Authorization'] = `Bearer ${firebaseIdToken}`;
        console.log('=== AUTH HEADER SOURCE ===');
        console.log('Using Firebase ID token for Authorization header');
        console.log('Firebase token length:', firebaseIdToken.length);
        console.log('=== END AUTH HEADER SOURCE ===');
      } else {
        console.log('Firebase ID token not available, falling back to stored token (if any)');
      }
    } catch (e) {
      console.log('Could not retrieve Firebase ID token, continuing with existing headers');
    }

    const config = {
      headers: baseHeaders,
      timeout: this.timeout,
      ...options,
    };
    
    // Debug logging for request details
    console.log('=== REQUEST DEBUG ===');
    console.log('URL:', url);
    console.log('Method:', config.method || 'GET');
    console.log('Headers:', config.headers);
    console.log('=== END REQUEST DEBUG ===');

    // Retry logic for failed requests
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
          // Don't include credentials for any requests to avoid CORS issues
          credentials: 'omit',
        });

        clearTimeout(timeoutId);

        // Handle 401 Unauthorized with token refresh
        if (response.status === 401 && attempt === 1) {
          try {
            // Check if we have a refresh token before attempting refresh
            const refreshToken = this.getRefreshToken();
            
            if (!refreshToken) {
              console.log('🔄 No refresh token available, skipping refresh attempt');
              // Clear any remaining tokens and stop auto-refresh
              const { default: authApiService } = await import('./auth.js');
              authApiService.clearStoredTokens();
              authApiService.clearAutoRefresh();
              return await this.handleResponse(response);
            }
            
            // Import auth service to use its refreshToken method
            const { default: authApiService } = await import('./auth.js');
            
            console.log('🔄 Attempting token refresh via auth service...');
            const result = await authApiService.refreshToken(refreshToken);
            if (result && result.token) {
              // Retry with new token - also try to reapply Firebase token in case it changed
              const retryHeaders = this.createHeaders(options.headers);
              try {
                const { default: firebaseAuthService } = await import('../firebaseAuth.js');
                const firebaseIdToken = await firebaseAuthService.getIdToken();
                if (firebaseIdToken) {
                  retryHeaders['Authorization'] = `Bearer ${firebaseIdToken}`;
                }
              } catch {}
              config.headers = retryHeaders;
              continue;
            }
            // If refresh fails, throw the original 401 error
            return await this.handleResponse(response);
          } catch (refreshError) {
            console.log('🔄 Token refresh failed:', refreshError);
            
            // If refresh also returns 401, clear tokens and stop trying
            if (refreshError.status === 401) {
              console.log('🔄 Refresh token also invalid, clearing all tokens');
              const { default: authApiService } = await import('./auth.js');
              authApiService.clearStoredTokens();
              authApiService.clearAutoRefresh();
            }
            
            // If refresh fails, throw the original 401 error
            return await this.handleResponse(response);
          }
        }

        return await this.handleResponse(response);

      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors
        if (error.name === 'AbortError' || error.status === 403) {
          break;
        }

        // Don't retry on 401 after refresh attempt
        if (error.status === 401 && attempt > 1) {
          break;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError;
  }

  // HTTP methods
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  async upload(endpoint, file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request(endpoint, {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }
}

// Custom API Error class
class ApiError extends Error {
  constructor(status, message, code, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;
export { ApiError };
