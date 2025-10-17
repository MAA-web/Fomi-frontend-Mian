import apiClient from './client.js';

// Image Generation API Service
class ImageApiService {
  // Text-to-Image Generation
  async generateImage(params) {
    try {
      const response = await apiClient.post('/image-service/generate', {
        prompt: params.prompt,
        negativePrompt: params.negativePrompt,
        model: params.model || 'stable-diffusion-xl',
        numImages: params.numImages || 1,
        aspectRatio: params.aspectRatio || '1:1',
        quality: params.quality || 'standard',
        style: params.style,
        seed: params.seed,
        guidanceScale: params.guidanceScale || 7.5,
        steps: params.steps || 30,
        safetyFilter: params.safetyFilter !== false, // default true
        enhancePrompt: params.enhancePrompt || false,
      });

      return this.transformGenerationResponse(response);
    } catch (error) {
      throw this.handleApiError(error, 'Image generation failed');
    }
  }

  // Get generation progress
  async getGenerationProgress(generationId) {
    try {
      const response = await apiClient.get(`/image-service/generate/${generationId}/progress`);
      return this.transformProgressResponse(response);
    } catch (error) {
      throw this.handleApiError(error, 'Failed to get generation progress');
    }
  }

  // Get generation by ID
  async getGeneration(generationId) {
    try {
      const response = await apiClient.get(`/image-service/generate/${generationId}`);
      return this.transformGenerationResponse(response);
    } catch (error) {
      throw this.handleApiError(error, 'Failed to get generation');
    }
  }

  // Image Variations
  async generateVariations(params) {
    try {
      const response = await apiClient.post('/image-service/variations', {
        imageId: params.imageId,
        prompt: params.prompt,
        strength: params.strength || 0.7,
        numVariations: params.numVariations || 4,
        model: params.model || 'stable-diffusion-xl',
        guidanceScale: params.guidanceScale || 7.5,
        steps: params.steps || 30,
      });

      return this.transformGenerationResponse(response);
    } catch (error) {
      throw this.handleApiError(error, 'Image variation generation failed');
    }
  }

  // Image Editing
  async editImage(params) {
    try {
      const response = await apiClient.post('/image-service/edit', {
        originalImageId: params.originalImageId,
        prompt: params.prompt,
        negativePrompt: params.negativePrompt,
        model: params.model || 'stable-diffusion-xl',
        strength: params.strength || 0.8,
        guidanceScale: params.guidanceScale || 7.5,
        steps: params.steps || 30,
      });

      return this.transformGenerationResponse(response);
    } catch (error) {
      throw this.handleApiError(error, 'Image editing failed');
    }
  }

  // Get generation history
  async getGenerationHistory(params = {}) {
    try {
      const response = await apiClient.get('/image-service/history', {
        page: params.page || 1,
        limit: params.limit || 20,
        model: params.model || 'all',
        type: params.type || 'all',
      });

      return this.transformHistoryResponse(response);
    } catch (error) {
      throw this.handleApiError(error, 'Failed to get generation history');
    }
  }

  // Delete generation
  async deleteGeneration(generationId) {
    try {
      await apiClient.delete(`/image-service/generate/${generationId}`);
      return { success: true };
    } catch (error) {
      throw this.handleApiError(error, 'Failed to delete generation');
    }
  }

  // Transform API response to frontend format
  transformGenerationResponse(response) {
    // Handle different API response formats
    const generation = response.generation || response;
    
    return {
      id: generation.id,
      status: generation.status,
      progress: generation.progress || 0,
      images: this.transformImages(generation.images || []),
      prompt: generation.prompt,
      model: generation.model,
      settings: generation.settings || {},
      createdAt: generation.createdAt,
      estimatedCompletion: generation.estimatedCompletion,
      completedAt: generation.completedAt,
    };
  }

  // Transform images array
  transformImages(images) {
    return images.map(image => ({
      id: image.id,
      url: image.url,
      thumbnail: image.thumbnail || image.url,
      width: image.width,
      height: image.height,
      fileSize: image.fileSize,
      seed: image.seed,
    }));
  }

  // Transform progress response
  transformProgressResponse(response) {
    return {
      progress: response.progress || 0,
      status: response.status,
      message: response.message || '',
    };
  }

  // Transform history response
  transformHistoryResponse(response) {
    const items = response.generations || response.items || [];
    
    return {
      generations: items.map(item => ({
        id: item.id,
        prompt: item.prompt,
        images: this.transformImages(item.images || []),
        model: item.model,
        status: item.status,
        createdAt: item.createdAt,
        thumbnail: item.thumbnail,
      })),
      pagination: response.pagination || {
        page: 1,
        limit: 20,
        total: items.length,
        hasNext: false,
      },
    };
  }

  // Handle API errors with context
  handleApiError(error, context) {
    // Log error for debugging
    console.error(`API Error in ${context}:`, error);

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
const imageApiService = new ImageApiService();

export default imageApiService;

