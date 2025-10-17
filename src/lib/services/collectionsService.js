import generationApi from '../api/generation'

class CollectionsService {
  constructor() {
    this.baseUrl = 'https://api.tarum.ai/asset-service'
  }

  async getFirebaseId() {
    try {
      return await generationApi.getFirebaseId()
    } catch (error) {
      throw new Error('User not authenticated')
    }
  }

  // Create a new collection
  async createCollection(name) {
    try {
      const userId = await this.getFirebaseId()
      
      const formData = new FormData()
      formData.append('user_id', userId)
      formData.append('name', name)

      const response = await fetch(`${this.baseUrl}/collections/create`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('❌ Create collection failed:', error)
      throw error
    }
  }

  // Get all collections for user
  async getUserCollections() {
    try {
      console.log('🔑 Getting Firebase ID...')
      const userId = await this.getFirebaseId()
      console.log('🔑 Firebase ID:', userId)
      
      const url = `${this.baseUrl}/collections?user_id=${userId}`
      console.log('📡 Fetching collections from:', url)
      
      const response = await fetch(url)
      console.log('📡 Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Response error body:', errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('📦 Collections data received:', data)
      return data
    } catch (error) {
      console.error('❌ Get collections failed:', error)
      throw error
    }
  }

  // Get single collection by ID
  async getCollection(collectionId) {
    try {
      const response = await fetch(`${this.baseUrl}/collections/${collectionId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('❌ Get collection failed:', error)
      throw error
    }
  }

  // Add image to collection
  async addImageToCollection(collectionId, imageId) {
    try {
      const response = await fetch(`${this.baseUrl}/collections/add-image?collection_id=${collectionId}&jobId=${imageId}`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('❌ Add image to collection failed:', error)
      throw error
    }
  }

  // Remove image from collection
  async removeImageFromCollection(collectionId, imageId) {
    try {
      const response = await fetch(`${this.baseUrl}/collections/remove-image?collection_id=${collectionId}&jobId=${imageId}`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('❌ Remove image from collection failed:', error)
      throw error
    }
  }

  // Delete collection
  async deleteCollection(collectionId) {
    try {
      const response = await fetch(`${this.baseUrl}/collections/${collectionId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('❌ Delete collection failed:', error)
      throw error
    }
  }

  // Get all user assets (images/videos)
  async getUserAssets() {
    try {
      const userId = await this.getFirebaseId()
      
      const response = await fetch(`${this.baseUrl}/assets?user_id=${userId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('❌ Get user assets failed:', error)
      throw error
    }
  }
}

// Create singleton instance
const collectionsService = new CollectionsService()

export default collectionsService
