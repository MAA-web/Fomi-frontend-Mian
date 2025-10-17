import apiClient, { ApiError } from './client.js';

// Authentication API Service
class AuthApiService {
  constructor() {
    this.refreshJob = null;
    this.refreshInterval = null;
    this.lastRefreshTime = null;
    this.minRefreshInterval = 5 * 60 * 1000; // 5 minutes minimum between refreshes
    this.isRefreshing = false; // Prevent multiple simultaneous refresh attempts
  }

  // Initialize automatic token refresh
  initializeAutoRefresh() {
    if (typeof window === 'undefined') return;
    
    // Check if we have tokens before initializing
    const token = this.getStoredToken();
    const refreshToken = this.getStoredRefreshToken();
    
    if (!token || !refreshToken) {
      console.log('🔄 No tokens available, skipping auto-refresh initialization');
      return;
    }
    
    // Check if current token is valid before starting auto-refresh
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      if (payload.exp <= currentTime) {
        console.log('🔄 Current token is expired, clearing tokens and skipping auto-refresh');
        this.clearStoredTokens();
        return;
      }
    } catch (error) {
      console.log('🔄 Invalid token format, clearing tokens and skipping auto-refresh');
      this.clearStoredTokens();
      return;
    }
    
    // Clear any existing refresh job
    this.clearAutoRefresh();
    
    // Start the refresh job
    this.startRefreshJob();
    
    // Set up periodic check (every 2 minutes - less aggressive)
    this.refreshInterval = setInterval(() => {
      this.checkAndRefreshToken();
    }, 2 * 60 * 1000); // 2 minutes
    
    console.log('🔄 Auto-refresh system initialized');
  }

  // Clear automatic token refresh
  clearAutoRefresh() {
    if (this.refreshJob) {
      clearTimeout(this.refreshJob);
      this.refreshJob = null;
    }
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    console.log('🔄 Auto-refresh system cleared');
  }

  // Start the refresh job
  startRefreshJob() {
    const token = this.getStoredToken();
    if (!token) {
      console.log('🔄 No token found, skipping auto-refresh');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      const expiresAt = payload.exp;
      const timeUntilExpiry = (expiresAt - now) * 1000; // Convert to milliseconds
      
      console.log('🔄 Token expires at:', new Date(expiresAt * 1000));
      console.log('🔄 Time until expiry:', Math.floor(timeUntilExpiry / 1000), 'seconds');
      
      // Refresh token 5 minutes before expiry
      const refreshTime = timeUntilExpiry - (5 * 60 * 1000); // 5 minutes before expiry
      
      if (refreshTime <= 0) {
        // Token expires soon, refresh immediately
        console.log('🔄 Token expires soon, refreshing immediately');
        this.refreshTokenIfNeeded();
      } else {
        // Schedule refresh
        console.log('🔄 Scheduling token refresh in', Math.floor(refreshTime / 1000), 'seconds');
        this.refreshJob = setTimeout(() => {
          this.refreshTokenIfNeeded();
        }, refreshTime);
      }
    } catch (error) {
      console.error('🔄 Error parsing token for auto-refresh:', error);
    }
  }

  // Check if token needs refresh and refresh if needed
  async checkAndRefreshToken() {
    const token = this.getStoredToken();
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      const expiresAt = payload.exp;
      const timeUntilExpiry = (expiresAt - now) * 1000;
      
      // Only refresh if token expires within 5 minutes (more conservative)
      if (timeUntilExpiry < 5 * 60 * 1000) { // 5 minutes
        console.log('🔄 Token expires soon, refreshing...');
        await this.refreshTokenIfNeeded();
      }
    } catch (error) {
      console.error('🔄 Error checking token expiry:', error);
    }
  }

  // Refresh token if enough time has passed since last refresh
  async refreshTokenIfNeeded() {
    const now = Date.now();
    
    // Prevent too frequent refreshes
    if (this.lastRefreshTime && (now - this.lastRefreshTime) < this.minRefreshInterval) {
      console.log('🔄 Skipping refresh - too soon since last refresh');
      return;
    }

    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken) {
      console.log('🔄 No refresh token available');
      return;
    }

    // Check if we're already refreshing to prevent multiple simultaneous requests
    if (this.isRefreshing) {
      console.log('🔄 Refresh already in progress, skipping');
      return;
    }

    this.isRefreshing = true;

    try {
      console.log('🔄 Proactively refreshing token...');
      console.log('🔄 Using refresh token:', refreshToken ? 'Present' : 'Missing');
      
      // Use the authApiService refreshToken method directly
      const result = await this.refreshToken(refreshToken);
      
      if (result && result.token) {
        this.lastRefreshTime = now;
        console.log('🔄 Token refreshed successfully');
        
        // Restart the refresh job with new token
        this.startRefreshJob();
      }
    } catch (error) {
      console.error('🔄 Failed to refresh token:', error);
      
      // If we get a 429 error, increase the minimum refresh interval
      if (error.status === 429) {
        console.log('🔄 Rate limited (429), increasing refresh interval');
        this.minRefreshInterval = Math.min(this.minRefreshInterval * 2, 30 * 60 * 1000); // Max 30 minutes
        this.lastRefreshTime = now; // Mark as refreshed to prevent immediate retry
      } else {
        // For other errors, clear tokens and stop auto-refresh
        this.clearStoredTokens();
        this.clearAutoRefresh();
      }
    } finally {
      this.isRefreshing = false;
    }
  }

  // Get token expiry time
  getTokenExpiryTime() {
    const token = this.getStoredToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch (error) {
      console.error('Error parsing token expiry:', error);
      return null;
    }
  }

  // Get time until token expiry (in seconds)
  getTimeUntilExpiry() {
    const expiryTime = this.getTokenExpiryTime();
    if (!expiryTime) return null;

    const now = Date.now();
    return Math.floor((expiryTime.getTime() - now) / 1000);
  }

  // Health Check
  async checkHealth() {
    try {
      const response = await apiClient.get('/user-service/users/health');
      return this.transformHealthResponse(response);
    } catch (error) {
      throw this.handleApiError(error, 'Health check failed');
    }
  }

  // Register/Upsert User
  async registerUser(params) {
    try {
      console.log('=== REGISTRATION API DEBUG ===');
      console.log('Registration params received:', params);
      
      const requestBody = {
        email: params.email,
        password: params.password,
        name: params.name,
        avatar_url: params.avatar_url,
        // Additional fields for upsert logic
        ...(params.googleId && { googleId: params.googleId }),
      };
      
      console.log('Request body being sent to backend:', requestBody);
      console.log('Fields being sent:');
      console.log('- Email:', requestBody.email);
      console.log('- Name:', requestBody.name);
      console.log('- Avatar URL:', requestBody.avatar_url);
      console.log('- Google ID:', requestBody.googleId || 'Not provided');
      
      const response = await apiClient.post('/user-service/auth/register', requestBody);

      // Initialize auto-refresh after successful registration
      this.initializeAutoRefresh();
      return this.transformAuthResponse(response);
    } catch (error) {
      throw this.handleApiError(error, 'User registration failed');
    }
  }

  // Standard Login
  async login(params) {
    try {
      console.log('=== STANDARD LOGIN API DEBUG ===');
      console.log('Login params received:', params);
      
      const requestBody = {
        email: params.email,
        password: params.password,
      };
      
      console.log('Request body being sent to backend:', requestBody);
      console.log('Fields being sent:');
      console.log('- Email:', requestBody.email);
      console.log('- Password:', requestBody.password ? '[HIDDEN]' : 'Not provided');
      
      const response = await apiClient.post('/user-service/auth/login', requestBody);
      
      console.log('Backend response received:', response);
      
      // Initialize auto-refresh after successful login
      this.initializeAutoRefresh();
      return this.transformAuthResponse(response);
    } catch (error) {
      console.log('Standard login API error:', error);
      throw this.handleApiError(error, 'Login failed');
    }
  }

  // Login with Google
  async loginWithGoogle(idToken) {
    try {
      console.log('=== GOOGLE LOGIN API DEBUG ===');
      console.log('Sending request to:', '/user-service/auth/google/login');
      console.log('ID token length:', idToken.length);
      console.log('ID token (first 50 chars):', idToken.substring(0, 50) + '...');
      
      // Decode and log the Google token payload to see what user data is available
      try {
        const tokenParts = idToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('=== GOOGLE TOKEN PAYLOAD ===');
          console.log('Full payload:', payload);
          console.log('Available user data from Google:');
          console.log('- Email:', payload.email);
          console.log('- Name:', payload.name);
          console.log('- Given name:', payload.given_name);
          console.log('- Family name:', payload.family_name);
          console.log('- Picture:', payload.picture);
          console.log('- User ID:', payload.sub);
          console.log('=== END GOOGLE TOKEN PAYLOAD ===');
        }
      } catch (e) {
        console.log('Could not decode Google token payload:', e.message);
      }
      
      const requestBody = {
        id_token: idToken,
      };
      console.log('Request body being sent to backend:', requestBody);
      console.log('Note: Backend should extract user data from the id_token');
      
      const response = await apiClient.post('/user-service/auth/google/login', requestBody);
      
      console.log('Backend response received:', response);
      
      // Initialize auto-refresh after successful Google login
      this.initializeAutoRefresh();
      return this.transformAuthResponse(response);
    } catch (error) {
      console.log('Google login API error:', error);
      throw this.handleApiError(error, 'Google login failed');
    }
  }

  // Refresh Token
  async refreshToken(refreshToken) {
    try {
      console.log('=== REFRESH TOKEN API DEBUG ===');
      console.log('Refresh token being sent:', refreshToken ? 'Present' : 'Missing');
      console.log('Refresh token length:', refreshToken ? refreshToken.length : 0);
      console.log('Refresh token (first 20 chars):', refreshToken ? refreshToken.substring(0, 20) + '...' : 'N/A');
      
      const requestBody = {
        refresh_token: refreshToken,
      };
      
      console.log('Request body being sent:', requestBody);
      
      // Use direct fetch to avoid triggering the 401 handler again
      const response = await fetch(`${apiClient.baseURL}/user-service/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'omit',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('Refresh token error response:', errorData);
        throw new ApiError(
          response.status,
          errorData.message || `HTTP ${response.status}`,
          errorData.code || 'REFRESH_FAILED',
          errorData.details
        );
      }

      const data = await response.json();
      console.log('Refresh token response:', data);
      return this.transformRefreshResponse(data);
    } catch (error) {
      console.log('Refresh token API error:', error);
      
      // Special handling for rate limiting
      if (error.status === 429) {
        console.log('🔄 Rate limited (429) - Too many refresh requests');
        console.log('🔄 Consider increasing refresh intervals or reducing frequency');
        // Don't clear tokens for rate limiting, just throw the error
        throw error;
      }
      
      throw this.handleApiError(error, 'Token refresh failed');
    }
  }

  // Get User Profile
  async getUserProfile() {
    try {
      const response = await apiClient.get('/user-service/auth/profile');
      return this.transformProfileResponse(response);
    } catch (error) {
      throw this.handleApiError(error, 'Failed to get user profile');
    }
  }

  // Update User Profile
  async updateUserProfile(updates) {
    try {
      console.log('=== UPDATE PROFILE API DEBUG ===');
      console.log('Update params received:', updates);
      
      // Extract user ID from JWT token
      let userId = null;
      const currentToken = this.getStoredToken();
      if (currentToken) {
        try {
          const tokenParts = currentToken.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('=== JWT TOKEN PAYLOAD DEBUG ===');
            console.log('Full JWT payload:', payload);
            console.log('Available fields in JWT:');
            console.log('- sub (subject):', payload.sub);
            console.log('- user_id:', payload.user_id);
            console.log('- id:', payload.id);
            console.log('- aud (audience):', payload.aud);
            console.log('- iss (issuer):', payload.iss);
            console.log('- exp (expiration):', new Date(payload.exp * 1000));
            console.log('- iat (issued at):', new Date(payload.iat * 1000));
            console.log('=== END JWT TOKEN PAYLOAD DEBUG ===');
            
            // Extract user ID from various possible fields
            userId = payload.sub || payload.user_id || payload.id;
            console.log('Extracted User ID from JWT:', userId);
          }
        } catch (e) {
          console.log('Could not decode JWT token payload:', e.message);
        }
      }
      
      const requestBody = {
        ...(userId && { sub: userId }), // Include user ID as 'sub' in request body
        ...(updates.name && { name: updates.name }),
        ...(updates.email && { email: updates.email }),
        ...(updates.avatar_url && { avatar_url: updates.avatar_url }),
        // Add other updatable fields as needed
      };
      
      console.log('Request body being sent to backend:', requestBody);
      console.log('Fields being updated:');
      console.log('- Sub (User ID):', requestBody.sub || 'Not provided');
      console.log('- Name:', requestBody.name || 'Not provided');
      console.log('- Email:', requestBody.email || 'Not provided');
      console.log('- Avatar URL:', requestBody.avatar_url || 'Not provided');
      console.log('Endpoint: PUT /user-service/auth/profile');
      console.log('Note: JWT token will be automatically included in Authorization header');
      
      const response = await apiClient.put('/user-service/auth/profile', requestBody);
      
      console.log('Backend response received:', response);
      const transformedResponse = this.transformProfileResponse(response);
      
      // If the backend only returned a success message, fetch the updated profile
      if (transformedResponse.needsProfileFetch) {
        console.log('Fetching updated profile after successful update...');
        try {
          const updatedProfile = await this.getUserProfile();
          return {
            ...transformedResponse,
            user: updatedProfile.user,
            needsProfileFetch: false,
          };
        } catch (profileError) {
          console.log('Failed to fetch updated profile:', profileError);
          // Return the success message even if profile fetch fails
          return transformedResponse;
        }
      }
      
      return transformedResponse;
    } catch (error) {
      console.log('Update profile API error:', error);
      throw this.handleApiError(error, 'Failed to update user profile');
    }
  }

  // Delete User
  async deleteUser() {
    try {
      const response = await apiClient.delete('/user-service/auth/profile');
      return this.transformDeleteResponse(response);
    } catch (error) {
      throw this.handleApiError(error, 'Failed to delete user account');
    }
  }

  // Add Credits to User (Admin/Privileged endpoint)
  async addCredits(userId, amount) {
    try {
      const response = await apiClient.post(`/user-service/auth/credits`, {
        user_id: userId,
        credits_to_add: amount,
      });

      return this.transformCreditsResponse(response);
    } catch (error) {
      throw this.handleApiError(error, 'Failed to add credits');
    }
  }

  // Transform health check response
  transformHealthResponse(response) {
    return {
      status: response.status,
      message: response.message,
      isHealthy: response.status === 'ok',
    };
  }

  // Transform authentication response
  transformAuthResponse(response) {
    console.log('=== TRANSFORM AUTH RESPONSE DEBUG ===');
    console.log('Raw response:', response);
    
    // Handle different token field names from backend
    const accessToken = response.token || response.access_token;
    const refreshToken = response.refresh_token || response.refreshToken;
    
    console.log('=== TOKEN EXTRACTION DEBUG ===');
    console.log('Response.token:', response.token);
    console.log('Response.access_token:', response.access_token);
    console.log('Extracted accessToken:', accessToken);
    console.log('Extracted refreshToken:', refreshToken);
    
    // Store tokens in localStorage for persistence
    if (accessToken) {
      this.storeToken(accessToken);
      console.log('Access token stored successfully');
    } else {
      console.log('WARNING: No access token found in response!');
    }
    if (refreshToken) {
      this.storeRefreshToken(refreshToken);
      console.log('Refresh token stored successfully');
    } else {
      console.log('WARNING: No refresh token found in response!');
    }

    // Extract user ID from various possible locations
    const userId = response.user_id || response.userId || response.id || (response.user && response.user.id);
    console.log('Extracted userId:', userId);

    // Extract user data from response
    const userData = response.user || response;
    
    return {
      message: response.message || 'Operation completed successfully',
      userId: userId,
      token: accessToken,
      refreshToken: refreshToken,
      // Include additional user info for display
      user: {
        id: userId,
        email: userData.email,
        name: `${userData.first_name || userData.firstName || ''} ${userData.last_name || userData.lastName || ''}`.trim() || userData.name || 'Unknown User',
        firstName: userData.first_name || userData.firstName,
        lastName: userData.last_name || userData.lastName,
        credits: userData.credits || (userData.subscription?.credits || 0),
        avatar: userData.avatar_url || userData.avatarUrl,
        createdAt: userData.created_at || userData.createdAt,
        updatedAt: userData.updated_at || userData.updatedAt,
        subscription: userData.subscription,
        preferences: userData.preferences,
      }
    };
  }

  // Transform refresh token response
  transformRefreshResponse(response) {
    // Handle different token field names from backend
    const accessToken = response.token || response.access_token;
    const refreshToken = response.refresh_token || response.refreshToken;
    
    return {
      message: response.message,
      token: this.storeToken(accessToken),
      refreshToken: this.storeRefreshToken(refreshToken),
    };
  }

  // Transform profile response
  transformProfileResponse(response) {
    console.log('=== TRANSFORM PROFILE RESPONSE DEBUG ===');
    console.log('Raw profile response:', response);
    
    // Check if response contains user data or just a success message
    if (response.user || (response.id && response.email)) {
      // Response contains user data
      const user = response.user || response;
      
      const transformedUser = {
        id: user.id,
        email: user.email,
        name: `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim() || user.name || 'Unknown User',
        firstName: user.first_name || user.firstName,
        lastName: user.last_name || user.lastName,
        credits: user.credits || (user.subscription?.credits || 0),
        avatar: user.avatar_url || user.avatarUrl || user.avatar,
        createdAt: user.created_at || user.createdAt,
        updatedAt: user.updated_at || user.updatedAt,
        // Add any additional profile fields
        ...(user.subscription && { subscription: user.subscription }),
        ...(user.settings && { settings: user.settings }),
      };
      
      console.log('Transformed user data:', transformedUser);
      
      return {
        user: transformedUser,
        message: response.message,
      };
    } else {
      // Response is just a success message, fetch updated profile
      console.log('Response contains only success message, fetching updated profile...');
      
      // Return a placeholder that indicates we need to fetch the profile
      return {
        user: null, // Will be populated by calling getProfile after update
        message: response.message,
        needsProfileFetch: true,
      };
    }
  }

  // Transform delete response
  transformDeleteResponse(response) {
    return {
      message: response.message,
      success: true,
    };
  }

  // Transform credits response
  transformCreditsResponse(response) {
    return {
      message: response.message,
      userId: response.user_id,
      newCreditsBalance: response.new_balance,
      success: true,
    };
  }

  // Store JWT token in localStorage and cookies
  storeToken(token) {
    if (typeof window !== 'undefined') {
      // Store in localStorage for immediate access
      localStorage.setItem('fomi_token', token);
      
      // Store in HTTP-only cookie for security (if possible)
      this.setCookie('fomi_token', token, 7); // 7 days expiry
    }
    return token;
  }

  // Store refresh token in localStorage and cookies
  storeRefreshToken(refreshToken) {
    if (typeof window !== 'undefined') {
      // Store in localStorage for immediate access
      localStorage.setItem('fomi_refresh_token', refreshToken);
      
      // Store in HTTP-only cookie for security
      this.setCookie('fomi_refresh_token', refreshToken, 30); // 30 days expiry
    }
    return refreshToken;
  }

  // Get stored token (try localStorage first, then cookies)
  getStoredToken() {
    if (typeof window !== 'undefined') {
      // Try localStorage first
      const localToken = localStorage.getItem('fomi_token');
      if (localToken) return localToken;
      
      // Fallback to cookies
      return this.getCookie('fomi_token');
    }
    return null;
  }

  // Get stored refresh token (try localStorage first, then cookies)
  getStoredRefreshToken() {
    if (typeof window !== 'undefined') {
      // Try localStorage first
      const localToken = localStorage.getItem('fomi_refresh_token');
      console.log('🔄 getStoredRefreshToken - localStorage:', localToken ? 'Present' : 'Missing');
      if (localToken) {
        console.log('🔄 getStoredRefreshToken - Token length:', localToken.length);
        return localToken;
      }
      
      // Fallback to cookies
      const cookieToken = this.getCookie('fomi_refresh_token');
      console.log('🔄 getStoredRefreshToken - Cookie:', cookieToken ? 'Present' : 'Missing');
      return cookieToken;
    }
    return null;
  }

  // Clear stored tokens from both localStorage and cookies
  clearStoredTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fomi_token');
      localStorage.removeItem('fomi_refresh_token');
      
      // Clear cookies
      this.deleteCookie('fomi_token');
      this.deleteCookie('fomi_refresh_token');
    }
    
    // Clear auto-refresh system
    this.clearAutoRefresh();
  }

  // Helper method to set a cookie
  setCookie(name, value, days) {
    if (typeof window !== 'undefined') {
      const expires = new Date();
      expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
      document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
    }
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

  // Helper method to delete a cookie
  deleteCookie(name) {
    if (typeof window !== 'undefined') {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getStoredToken();
    if (!token) return false;

    // Basic JWT expiration check (you might want to use a JWT library)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  // Logout user
  logout() {
    this.clearStoredTokens();
    console.log('🔄 Logout completed, auto-refresh cleared');
  }

  // Handle API errors with context
  handleApiError(error, context) {
    // Log error for debugging
    console.error(`Auth API Error in ${context}:`, error);

    // Handle specific error cases
    if (error.status === 401) {
      // Clear invalid tokens
      this.clearStoredTokens();
    }

    // Return user-friendly error
    return {
      error: true,
      message: error.message || context,
      code: error.code || 'UNKNOWN_ERROR',
      status: error.status,
      details: error.details,
    };
  }
}

// Create singleton instance
const authApiService = new AuthApiService();

export default authApiService;
