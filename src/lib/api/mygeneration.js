import apiClient from './client.js';

// My Generation API Service

class MyGenerationApiService {
  // Fetch user's generations by user ID
  async getGenerationsByUserId(userId) {
        try {
            const response = await apiClient.get(`/asset-service/assets/user/${userId}`);
            return response
        } catch (error) {
            console.error('❌ Error fetching user generations:', error);
        }
    }
    // Fetch a specific generation by its ID
    async getGenerationById(generationId) {
    try {
            const response = await apiClient.get(`/asset-service/assets/${generationId}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.log('❌ MyGeneration API Error Response:', response.status, errorData);
                throw new ApiError(
                response.status,
                errorData.error || `HTTP ${response.status}`,
                errorData.code || 'UNKNOWN_ERROR',
                errorData.details
                );
            }
            const data = await response.json();
            console.log('✅ MyGeneration API Response:', data);
            return data;
        } catch (error) {
            console.error('❌ MyGeneration API Error:', error);
            throw error;
        }
    }
}


const mygenerationApi = new MyGenerationApiService();

export default mygenerationApi;