import apiClient from './client.js';

// Gallery API Service
class GalleryApiService {
  // Fetch community gallery images with user data
  async getCommunityGalleryImages() {
    try {
      const response = await apiClient.get('/asset-service/assets/with-user/long-prompts');
      return this.transformGalleryResponse(response);
    } catch (error) {
      throw this.handleApiError(error, 'Failed to fetch community gallery images');
    }
  }

  // Fetch all assets (for admin or authenticated users)
  async getAllAssets() {
    try {
      const response = await apiClient.get('/assets');
      return this.transformAssetsResponse(response);
    } catch (error) {
      throw this.handleApiError(error, 'Failed to fetch all assets');
    }
  }

  // Fetch assets by user ID
  async getAssetsByUserId(userId) {
    try {
      const response = await apiClient.get(`/assets/user/${userId}`);
      return this.transformAssetsResponse(response);
    } catch (error) {
      throw this.handleApiError(error, 'Failed to fetch user assets');
    }
  }

  // Get asset by ID
  async getAssetById(assetId) {
    try {
      const response = await apiClient.get(`/assets/${assetId}`);
      return this.transformAssetResponse(response);
    } catch (error) {
      throw this.handleApiError(error, 'Failed to fetch asset');
    }
  }

  // Transform gallery response to match expected format
  transformGalleryResponse(response) {
    if (!response || !response.data) {
      return [];
    }

    return response.data.map(item => ({
      image_id: item.id || item.image_id,
      url: item.url,
      prompt: item.prompt,
      aspect_ratio: item.aspect_ratio,
      user: {
        first_name: item.first_name || item.user?.first_name,
        last_name: item.last_name || item.user?.last_name,
        avatar: item.avatar_url || item.user?.avatar,
        email: item.email || item.user?.email
      },
      created_at: item.created_at,
      user_id: item.user_id
    }));
  }

  // Transform assets response
  transformAssetsResponse(response) {
    if (!response || !response.data) {
      return [];
    }

    return response.data.map(item => ({
      id: item.id,
      user_id: item.user_id,
      url: item.url,
      prompt: item.prompt,
      aspect_ratio: item.aspect_ratio,
      generation_type: item.generation_type,
      size: item.size,
      model_used: item.model_used,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
  }

  // Transform single asset response
  transformAssetResponse(response) {
    if (!response || !response.data) {
      return null;
    }

    const item = response.data;
    return {
      id: item.id,
      user_id: item.user_id,
      url: item.url,
      prompt: item.prompt,
      aspect_ratio: item.aspect_ratio,
      generation_type: item.generation_type,
      size: item.size,
      model_used: item.model_used,
      created_at: item.created_at,
      updated_at: item.updated_at
    };
  }

  // Handle API errors with context
  handleApiError(error, context) {
    // Log error for debugging
    console.error(`Gallery API Error in ${context}:`, error);

    // Return user-friendly error
    return {
      error: true,
      message: error.message || context,
      code: error.code || 'UNKNOWN_ERROR',
      details: error.details,
    };
  }
}

// Create singleton instance
const galleryApiService = new GalleryApiService();

export default galleryApiService;
