// API Type Definitions (JSDoc for better IntelliSense)

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether the API call was successful
 * @property {any} data - The response data
 * @property {string} [message] - Optional success message
 */

/**
 * @typedef {Object} ApiError
 * @property {boolean} success - Always false for errors
 * @property {Object} error - Error details
 * @property {string} error.code - Error code
 * @property {string} error.message - Error message
 * @property {Object} [error.details] - Additional error details
 */

/**
 * @typedef {Object} GenerationImage
 * @property {string} id - Image ID
 * @property {string} url - Image URL
 * @property {string} thumbnail - Thumbnail URL
 * @property {number} width - Image width
 * @property {number} height - Image height
 * @property {number} fileSize - File size in bytes
 * @property {number} [seed] - Generation seed
 */

/**
 * @typedef {Object} GenerationSettings
 * @property {string} aspectRatio - Image aspect ratio
 * @property {string} quality - Image quality
 * @property {number} guidanceScale - Guidance scale
 * @property {number} steps - Number of steps
 * @property {string} [style] - Art style
 */

/**
 * @typedef {Object} Generation
 * @property {string} id - Generation ID
 * @property {string} status - Generation status (pending, processing, completed, failed)
 * @property {number} progress - Progress percentage (0-100)
 * @property {GenerationImage[]} images - Generated images
 * @property {string} prompt - Generation prompt
 * @property {string} model - Model used
 * @property {GenerationSettings} settings - Generation settings
 * @property {string} createdAt - Creation timestamp
 * @property {string} [estimatedCompletion] - Estimated completion time
 * @property {string} [completedAt] - Completion timestamp
 */

/**
 * @typedef {Object} ProgressResponse
 * @property {number} progress - Current progress (0-100)
 * @property {string} status - Current status
 * @property {string} [message] - Progress message
 */

/**
 * @typedef {Object} Pagination
 * @property {number} page - Current page
 * @property {number} limit - Items per page
 * @property {number} total - Total items
 * @property {boolean} hasNext - Whether there are more pages
 */

/**
 * @typedef {Object} GenerationHistory
 * @property {Generation[]} generations - List of generations
 * @property {Pagination} pagination - Pagination info
 */

/**
 * @typedef {Object} ImageGenerationParams
 * @property {string} prompt - Text prompt
 * @property {string} [negativePrompt] - Negative prompt
 * @property {string} [model] - Model to use
 * @property {number} [numImages] - Number of images to generate
 * @property {string} [aspectRatio] - Aspect ratio
 * @property {string} [quality] - Image quality
 * @property {string} [style] - Art style
 * @property {number} [seed] - Generation seed
 * @property {number} [guidanceScale] - Guidance scale
 * @property {number} [steps] - Number of steps
 * @property {boolean} [safetyFilter] - Safety filter
 * @property {boolean} [enhancePrompt] - Enhance prompt
 */

/**
 * @typedef {Object} ImageVariationParams
 * @property {string} imageId - Source image ID
 * @property {string} [prompt] - Variation prompt
 * @property {number} [strength] - Variation strength
 * @property {number} [numVariations] - Number of variations
 * @property {string} [model] - Model to use
 * @property {number} [guidanceScale] - Guidance scale
 * @property {number} [steps] - Number of steps
 */

/**
 * @typedef {Object} ImageEditParams
 * @property {string} originalImageId - Original image ID
 * @property {string} prompt - Edit prompt
 * @property {string} [negativePrompt] - Negative prompt
 * @property {string} [model] - Model to use
 * @property {number} [strength] - Edit strength
 * @property {number} [guidanceScale] - Guidance scale
 * @property {number} [steps] - Number of steps
 */

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} name - Display name
 * @property {string} [avatar] - Avatar URL
 * @property {number} credits - Available credits
 * @property {string} createdAt - Account creation date
 * @property {string} updatedAt - Last update date
 * @property {Object} [subscription] - Subscription info
 * @property {Object} [settings] - User settings
 */

/**
 * @typedef {Object} AuthResponse
 * @property {string} message - Success message
 * @property {string} userId - User ID
 * @property {string} token - JWT access token
 * @property {string} refreshToken - JWT refresh token
 */

/**
 * @typedef {Object} ProfileResponse
 * @property {User} user - User profile data
 * @property {string} [message] - Success message
 */

/**
 * @typedef {Object} HealthResponse
 * @property {string} status - Health status (ok/error)
 * @property {string} message - Health message
 * @property {boolean} isHealthy - Whether service is healthy
 */

/**
 * @typedef {Object} CreditsResponse
 * @property {string} message - Success message
 * @property {string} userId - Target user ID
 * @property {number} newCreditsBalance - Updated credits balance
 * @property {boolean} success - Success flag
 */

/**
 * @typedef {Object} RegisterParams
 * @property {string} email - User email
 * @property {string} password - User password
 * @property {string} name - User name
 * @property {string} [googleId] - Google ID for upsert
 * @property {string} [avatar] - User avatar URL
 */

/**
 * @typedef {Object} ProfileUpdateParams
 * @property {string} [name] - New name
 * @property {string} [email] - New email
 * @property {string} [avatar] - New avatar URL
 */

/**
 * @typedef {Object} Subscription
 * @property {string} plan - Subscription plan
 * @property {string} status - Subscription status
 * @property {Object} credits - Credit information
 * @property {Object} limits - Usage limits
 * @property {Object} features - Available features
 * @property {Object} billing - Billing information
 */

/**
 * @typedef {Object} GalleryItem
 * @property {string} id - Item ID
 * @property {string} type - Item type (image, video, canvas)
 * @property {string} url - Item URL
 * @property {string} thumbnail - Thumbnail URL
 * @property {string} prompt - Generation prompt
 * @property {string} model - Model used
 * @property {string} createdAt - Creation date
 * @property {string[]} tags - Item tags
 * @property {boolean} isPublic - Whether item is public
 * @property {number} downloads - Download count
 * @property {number} likes - Like count
 * @property {Object} [author] - Author information (for community items)
 */

// Export types for use in components
export const API_TYPES = {
  // Status constants
  STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
  },

  // Model constants
  MODELS: {
    STABLE_DIFFUSION_XL: 'stable-diffusion-xl',
    STABLE_DIFFUSION_1_5: 'stable-diffusion-1.5',
    STABLE_VIDEO_DIFFUSION: 'stable-video-diffusion',
  },

  // Aspect ratios
  ASPECT_RATIOS: {
    SQUARE: '1:1',
    LANDSCAPE: '16:9',
    PORTRAIT: '9:16',
    WIDE: '4:3',
    TALL: '3:4',
  },

  // Quality levels
  QUALITY: {
    STANDARD: 'standard',
    HD: 'hd',
    ULTRA_HD: 'ultra-hd',
  },

  // Error codes
  ERROR_CODES: {
    INVALID_PROMPT: 'INVALID_PROMPT',
    INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
    MODEL_UNAVAILABLE: 'MODEL_UNAVAILABLE',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    RATE_LIMITED: 'RATE_LIMITED',
    AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    GENERATION_FAILED: 'GENERATION_FAILED',
    TRAINING_FAILED: 'TRAINING_FAILED',
    REFRESH_FAILED: 'REFRESH_FAILED',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  },

  // Auth status
  AUTH_STATUS: {
    AUTHENTICATED: 'authenticated',
    UNAUTHENTICATED: 'unauthenticated',
    LOADING: 'loading',
  },
};

// Type validation helpers
export const validateGeneration = (generation) => {
  const required = ['id', 'status', 'prompt', 'model'];
  const missing = required.filter(field => !generation[field]);
  
  if (missing.length > 0) {
    throw new Error(`Invalid generation: missing fields: ${missing.join(', ')}`);
  }
  
  return true;
};

export const validateImageGenerationParams = (params) => {
  if (!params.prompt) {
    throw new Error('Prompt is required for image generation');
  }
  
  if (params.numImages && (params.numImages < 1 || params.numImages > 4)) {
    throw new Error('Number of images must be between 1 and 4');
  }
  
  return true;
};

export const validateRegisterParams = (params) => {
  if (!params.email) {
    throw new Error('Email is required for registration');
  }
  
  if (!params.password) {
    throw new Error('Password is required for registration');
  }
  
  if (!params.name) {
    throw new Error('Name is required for registration');
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(params.email)) {
    throw new Error('Invalid email format');
  }
  
  // Basic password validation
  if (params.password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  
  return true;
};

export const validateProfileUpdateParams = (params) => {
  if (params.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(params.email)) {
      throw new Error('Invalid email format');
    }
  }
  
  return true;
};

// Default values
export const DEFAULT_GENERATION_PARAMS = {
  model: API_TYPES.MODELS.STABLE_DIFFUSION_XL,
  numImages: 1,
  aspectRatio: API_TYPES.ASPECT_RATIOS.SQUARE,
  quality: API_TYPES.QUALITY.STANDARD,
  guidanceScale: 7.5,
  steps: 30,
  safetyFilter: true,
  enhancePrompt: false,
};

export const DEFAULT_AUTH_PARAMS = {
  // Default auth settings
  tokenRefreshThreshold: 300, // 5 minutes before expiry
  maxRetries: 3,
  retryDelay: 1000, // 1 second
};

