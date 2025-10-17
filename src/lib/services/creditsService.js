// Credits Service - Handles all credit-related functionality
import generationApi from '../api/generation.js';

class CreditsService {
  constructor(generationApi) {
    this.generationApi = generationApi;
    this.cache = {
      credits: null,
      models: null,
      lastFetch: null,
      cacheTimeout: 30000, // 30 seconds
    };
  }

  // Get user's current credit balance
  async getUserCredits() {
    try {
      // Get Firebase ID if not provided
      // if (!firebaseId) {
      //   firebaseId = await generationApi.getFirebaseId();
        
        // TEMPORARY: Use hardcoded firebaseId for testing if dynamic one fails
        // if (!firebaseId) {
        //   console.warn('⚠️ No Firebase ID found for credits, using hardcoded one for testing')
        //   firebaseId = 'QKMRjEnFcCfCCsiuOLTKrfHXz7x1' // From your console logs
        // }
      // }
      let firebaseId = await generationApi.getFirebaseId();

      // Check cache first
      const now = Date.now();
      if (
        this.cache.credits && 
        this.cache.lastFetch && 
        (now - this.cache.lastFetch) < this.cache.cacheTimeout
      ) {
        console.log('💾 Using cached credits data');
        return this.cache.credits;
      }

      console.log('🔍 Fetching fresh credits data for:', firebaseId);
      const response = await generationApi.getUserCredits(firebaseId);
      console.log('💳 Credits API response:', response);
      if (response.success) {
        // Cache the result
        this.cache.credits = response.credits;
        this.cache.lastFetch = now;
        
        console.log('💳 Credits fetched:', response.credits);
        return response.credits;
      } else {
        throw new Error('Failed to fetch credits');
      }
    } catch (error) {
      console.error('❌ Error fetching user credits:', error);
      throw error;
    }
  }

  // Get available models with credit costs
  async getModels() {
    try {
      // Check cache first
      const now = Date.now();
      if (
        this.cache.models && 
        this.cache.lastFetch && 
        (now - this.cache.lastFetch) < this.cache.cacheTimeout
      ) {
        console.log('💾 Using cached models data');
        return this.cache.models;
      }

      console.log('🔍 Fetching fresh models data');
      const response = await generationApi.getModels();
      
      if (response.success) {
        // Cache the result
        this.cache.models = response.models;
        this.cache.lastFetch = now;
        
        console.log('🤖 Models fetched:', response.models);
        return response.models;
      } else {
        throw new Error('Failed to fetch models');
      }
    } catch (error) {
      console.error('❌ Error fetching models:', error);
      throw error;
    }
  }

  // Get credit cost for a specific model
  async getModelCreditCost(modelName) {
    try {
      const models = await this.getModels();
      const model = models.find(m => m.name === modelName);
      
      if (!model) {
        console.warn('⚠️ Model not found:', modelName);
        return 1; // Default cost
      }
      
      return model.credit_cost;
    } catch (error) {
      console.error('❌ Error getting model cost:', error);
      return 1; // Default cost on error
    }
  }

  // Check if user has enough credits for a specific model
  async hasEnoughCredits(modelName, firebaseId = null) {
    try {
      const [credits, cost] = await Promise.all([
        this.getUserCredits(firebaseId),
        this.getModelCreditCost(modelName)
      ]);
      
      const hasEnough = credits.current_credits >= cost;
      console.log(`💳 Credit check for ${modelName}:`, {
        current: credits.current_credits,
        required: cost,
        hasEnough
      });
      
      return {
        hasEnough,
        current: credits.current_credits,
        required: cost,
        remaining: credits.current_credits - cost
      };
    } catch (error) {
      console.error('❌ Error checking credits:', error);
      return {
        hasEnough: false,
        current: 0,
        required: 1,
        remaining: -1
      };
    }
  }

  // Clear cache (useful after generation to force refresh)
  clearCache() {
    console.log('🗑️ Clearing credits cache');
    this.cache.credits = null;
    this.cache.models = null;
    this.cache.lastFetch = null;
  }

  // Update cached credits after generation
  updateCreditsAfterGeneration(creditsDeducted) {
    if (this.cache.credits) {
      this.cache.credits.current_credits -= creditsDeducted;
      this.cache.credits.total_spent_credits += creditsDeducted;
      console.log('💳 Updated cached credits after generation:', this.cache.credits);
    }
  }

  // Format credits for display
  formatCredits(credits) {
    if (typeof credits === 'number') {
      return credits.toLocaleString();
    }
    return '0';
  }

  // Get credit status color for UI
  getCreditStatusColor(currentCredits) {
    if (currentCredits >= 100) return 'text-green-600';
    if (currentCredits >= 20) return 'text-yellow-600';
    return 'text-red-600';
  }

  // Get credit status message
  getCreditStatusMessage(currentCredits) {
    if (currentCredits >= 100) return 'You have plenty of credits';
    if (currentCredits >= 20) return 'Consider purchasing more credits soon';
    if (currentCredits > 0) return 'Low credits - purchase more to continue';
    return 'No credits remaining - purchase credits to generate';
  }
}

// Create singleton instance
const creditsService = new CreditsService(generationApi);

export default creditsService;
