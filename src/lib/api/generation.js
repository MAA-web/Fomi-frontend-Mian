// Generation Service API Client
// Base URL: http://localhost:8082 (from contract)

// const { default: firebaseAuthService } = import('../firebaseAuth.js');

import firebaseAuthService from '../firebaseAuth.js';
import { ApiError } from './client.js';

// let api_url = 'http://localhost:5000';

let api_url = 'https://api.tarum.ai/generation-service'; // Production URL

//let api_url = 'http://localhost:8082';

if (!api_url) {
  console.warn('⚠️ API_URL not set in environment variables, defaulting to http://localhost:5000');
}

class GenerationApiClient {
  constructor() {
    this.baseURL = api_url;
    this.timeout = 30000; // 30 seconds
    this.firebaseID = null;
  }

  // Get auth headers with Firebase ID token
  async getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    try {
      const firebaseIdToken = await firebaseAuthService.getIdToken();
      if (firebaseIdToken) {
        headers['Authorization'] = `Bearer ${firebaseIdToken}`;
      }
    } catch (e) {
      console.warn('Could not retrieve Firebase ID token:', e);
    }

    return headers;
  }

  // Make HTTP request
  async request(endpoint, options = {}) {
    let url = '';

    if (endpoint.startsWith('http')) {
      // Full URL provided
      url = endpoint;
    } else {
      // Relative path, prepend baseURL
      url = `${this.baseURL}${endpoint}`;
    }
    const headers = await this.getAuthHeaders();

    const config = {
      headers: { ...headers, ...options.headers, referer: 'no-referrer' },
      timeout: this.timeout,
      credentials: 'omit',
      ...options,
    };


    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('❌ Generation API Error Response:', response.status, errorData);
        throw new ApiError(
          response.status,
          errorData.error || `HTTP ${response.status}`,
          errorData.code || 'UNKNOWN_ERROR',
          errorData.details
        );
      }

      const data = await response.json();
      console.log('✅ Generation API Response:', data);
      return data;

    } catch (error) {
      console.error('❌ Generation API Error:', error);
      throw error;
    }
  }

  async getUserProfile() {
    return this.request("https://api.tarum.ai/user-service/auth/profile",
      {
        method: 'GET'
      }
    );
  }
  // 1. Get Conversation
  async getConversation(threadId) {
    return this.request(`/conversations/${threadId}`, {
      method: 'GET'
    });
  }

  // 2. Generate Images (Async)
  async generateAsync(data) {
    return this.request('/generate/async', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 3. Get Available Models
  async getModels(page) {
    const url = page ? `${this.baseURL}/models?page=${encodeURIComponent(page)}` : '/models';
    return this.request(url, {
      method: 'GET'
    });
  }

  async getAllModels() {
    const url = `${this.baseURL}/models`;
    
    return this.request(url, {
      method: 'GET'
    });
  }

  // 4. Get User Credits
  async getUserCredits() {
    // Wait for Firebase ID if not yet available
    let firebaseId = this.firebaseID;
    
    if (firebaseId === null) {
      console.log('⏳ Firebase ID not yet available, waiting...');
      // Wait for Firebase ID to be initialized
      firebaseId = await this.getFirebaseId();
      
      if (!firebaseId) {
        console.log('❌ Firebase ID is required to fetch user credits');
        throw new Error('User not authenticated');
      }
    }
    
    const params = new URLSearchParams({ firebaseId });
    return this.request(`/credits?${params.toString()}`, {
      method: 'GET'
    });
  }

  // 5. WebSocket connection helper
  createWebSocketConnection(firebaseId) {
    
    // const wsUrl = `ws://localhost:8082/ws?firebaseId=${firebaseId}`;
    const wsUrl = `wss://api.tarum.ai/generation-service/ws?firebaseId=${firebaseId}`;

    console.log('🔗 Creating WebSocket connection:', wsUrl);
    const ws = new WebSocket(wsUrl);
    ws.binaryType = 'arraybuffer';
    return ws;
  }

  // Helper method to get Firebase ID from auth service
  async getFirebaseId() {
    return new Promise((resolve, reject) => {
      const checkAuth = () => {
        if (firebaseAuthService.isInitialized) {
          firebaseAuthService.getCurrentUser()
            .then(user => {
              if (!user) {
                console.warn('🔑 No authenticated user found');
                resolve(null);
              } else {
                console.log('🔑 Firebase ID retrieved:', user.uid);
                resolve(user.uid);
              }
            })
            .catch(e => {
              console.error('❌ Error getting Firebase ID:', e);
              resolve(null);
            });
        } else {
          setTimeout(checkAuth, 50); // Check every 50ms
        }
      };
      checkAuth();
    });
  }
}

// Create singleton instance
const generationApi = new GenerationApiClient();

generationApi.getFirebaseId().then(id => {
  generationApi.firebaseID = id;
  console.log('GenerationApiClient initialized with Firebase ID:', id);
}).catch(() => {
  generationApi.firebaseID = null;
});


export default generationApi;
