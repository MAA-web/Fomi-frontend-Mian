import generationApi from '../api/generation';

class ActivityService {
  constructor() {
    this.baseURL = 'https://api.tarum.ai/generation-service';
  }

  /**
   * Fetch user's recent activity from RecentActivity endpoint
   * @param {string} firebaseId - User's Firebase ID
   * @param {number} limit - Number of activities to fetch (default: 10)
   * @returns {Promise<Array>} Array of activity objects
   */
  async getRecentActivity(firebaseId, limit = 10) {
    try {
      if (!firebaseId) {
        throw new Error('Firebase ID is required');
      }

      // Fetch recent activity from the new API endpoint
      const response = await fetch(`${this.baseURL}/RecentActivity?firebaseId=${firebaseId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        return [];
      }

      // Transform recent activity data into activity items
      const activities = data
        .slice(0, limit) // Limit the number of activities
        .map(activity => this.transformRecentActivityToActivity(activity))
        .filter(activity => activity !== null); // Remove any null activities

      return activities;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  /**
   * Transform recent activity data into an activity object
   * @param {Object} activityData - Activity data from RecentActivity API
   * @returns {Object|null} Activity object or null if invalid
   */
  transformRecentActivityToActivity(activityData) {
    try {
      const createdAt = new Date(activityData.created_at);
      const now = new Date();
      const timeDiff = now - createdAt;
      
      // Calculate relative time
      const timeAgo = this.getRelativeTime(timeDiff);
      
      // Determine activity type and icon based on generation request
      const activityType = this.getActivityTypeFromGeneration(activityData.generation_request);
      
      // Get image URL if available
      const imageUrl = activityData.image_id ? 
        `https://api.tarum.ai/generation-service/image/${activityData.image_id}` : null;
      
      return {
        id: activityData.id,
        type: activityType.name,
        time: timeAgo,
        icon: activityType.icon,
        threadId: activityData.thread_id,
        firstMessage: activityData.user_message,
        messageCount: activityData.messages ? activityData.messages.length : 1,
        firstImageUrl: imageUrl,
        createdAt: activityData.created_at,
        threadType: activityType.threadType,
        status: activityData.status,
        modelUsed: activityData.generation_request?.model_used,
        prompt: activityData.user_message,
        aspectRatio: activityData.generation_request?.aspect_ratio,
        totalImages: activityData.generation_request?.total_images
      };
    } catch (error) {
      console.error('Error transforming recent activity to activity:', error);
      return null;
    }
  }

  /**
   * Transform a conversation thread into an activity object (legacy method)
   * @param {Object} thread - Thread object from API
   * @returns {Object|null} Activity object or null if invalid
   */
  transformThreadToActivity(thread) {
    try {
      const createdAt = new Date(thread.createdAt);
      const now = new Date();
      const timeDiff = now - createdAt;
      
      // Calculate relative time
      const timeAgo = this.getRelativeTime(timeDiff);
      
      // Determine activity type and icon based on thread type
      const activityType = this.getActivityType(thread.type);
      
      return {
        id: thread.threadId,
        type: activityType.name,
        time: timeAgo,
        icon: activityType.icon,
        threadId: thread.threadId,
        firstMessage: thread.firstMessage,
        messageCount: thread.messageCount,
        firstImageUrl: thread.firstImageUrl,
        createdAt: thread.createdAt,
        threadType: thread.type
      };
    } catch (error) {
      console.error('Error transforming thread to activity:', error);
      return null;
    }
  }

  /**
   * Get relative time string (e.g., "2 hours ago", "1 day ago")
   * @param {number} timeDiff - Time difference in milliseconds
   * @returns {string} Relative time string
   */
  getRelativeTime(timeDiff) {
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  /**
   * Get activity type information based on generation request
   * @param {Object} generationRequest - Generation request object from API
   * @returns {Object} Activity type object with name, icon, and threadType
   */
  getActivityTypeFromGeneration(generationRequest) {
    if (!generationRequest) {
      return {
        name: 'Content Created',
        icon: 'Sparkles',
        threadType: 'image'
      };
    }

    const modelUsed = generationRequest.model_used?.toLowerCase() || '';
    
    // Determine activity type based on model used
    if (modelUsed.includes('img2img') || modelUsed.includes('image-to-image')) {
      return {
        name: 'Image Enhanced',
        icon: 'Star',
        threadType: 'enhance'
      };
    } else if (modelUsed.includes('video') || modelUsed.includes('vid2vid')) {
      return {
        name: 'Video Created',
        icon: 'TrendingUp',
        threadType: 'video'
      };
    } else if (modelUsed.includes('edit') || modelUsed.includes('inpaint')) {
      return {
        name: 'Image Edited',
        icon: 'Edit',
        threadType: 'edit'
      };
    } else {
      return {
        name: 'Image Generated',
        icon: 'Sparkles',
        threadType: 'image'
      };
    }
  }

  /**
   * Get activity type information based on thread type (legacy method)
   * @param {string} threadType - Type of thread (image, video, etc.)
   * @returns {Object} Activity type object with name and icon
   */
  getActivityType(threadType) {
    const activityTypes = {
      image: {
        name: 'Image Generated',
        icon: 'Sparkles'
      },
      video: {
        name: 'Video Created',
        icon: 'TrendingUp'
      },
      enhance: {
        name: 'Image Enhanced',
        icon: 'Star'
      },
      edit: {
        name: 'Image Edited',
        icon: 'Edit'
      }
    };

    return activityTypes[threadType] || {
      name: 'Content Created',
      icon: 'Sparkles'
    };
  }

  /**
   * Get user statistics from activity data
   * @param {string} firebaseId - User's Firebase ID
   * @returns {Promise<Object>} User statistics object
   */
  async getUserStats(firebaseId) {
    try {
      const activities = await this.getRecentActivity(firebaseId, 100); // Get more for stats
      
      const stats = {
        totalGenerations: activities.length,
        imageGenerations: activities.filter(a => a.threadType === 'image').length,
        videoGenerations: activities.filter(a => a.threadType === 'video').length,
        enhancements: activities.filter(a => a.threadType === 'enhance').length,
        edits: activities.filter(a => a.threadType === 'edit').length,
        lastActivity: activities.length > 0 ? activities[0].time : 'No recent activity',
        completedGenerations: activities.filter(a => a.status === 'completed' || a.status === 'uploaded').length,
        pendingGenerations: activities.filter(a => a.status === 'processing' || a.status === 'queued').length
      };

      return stats;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        totalGenerations: 0,
        imageGenerations: 0,
        videoGenerations: 0,
        enhancements: 0,
        edits: 0,
        lastActivity: 'No recent activity',
        completedGenerations: 0,
        pendingGenerations: 0
      };
    }
  }
}

export default new ActivityService();
