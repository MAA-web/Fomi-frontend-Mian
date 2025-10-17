'use client'

import { useRouter } from 'next/navigation'
import { 
  Sparkles, 
  TrendingUp, 
  Star, 
  Edit,
  Eye
} from 'lucide-react'

export default function RecentActivity({ recentActivity, activityLoading }) {
  const router = useRouter()

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'Sparkles':
        return Sparkles
      case 'TrendingUp':
        return TrendingUp
      case 'Star':
        return Star
      case 'Edit':
        return Edit
      default:
        return Sparkles
    }
  }

  const getGenerationType = (activity) => {
    // Use page field if available, otherwise fall back to threadType
    const pageType = activity.page || activity.threadType
    
    switch (pageType?.toLowerCase()) {
      case 'imagegen':
      case 'image':
        return 'Image Created'
      case 'video':
        return 'Video Created'
      case 'enhance':
      case 'upscale':
        return 'Image Upscaled'
      case 'edit':
      case 'inpaint':
        return 'Image Edited'
      case 'train':
        return 'Model Trained'
      default:
        return activity.type || 'Content Created'
    }
  }

  const handleActivityClick = (activity) => {
    let pathname = '/'
    
    // Use page field if available, otherwise fall back to threadType
    const pageType = activity.page || activity.threadType
    
    // Determine the correct page based on page/threadType
    switch (pageType?.toLowerCase()) {
      case 'imagegen':
      case 'image':
        pathname = '/ImageGen'
        break
      case 'video':
        pathname = '/video'
        break
      case 'enhance':
      case 'upscale':
        pathname = '/Enhance'
        break
      case 'edit':
      case 'inpaint':
        pathname = '/edit'
        break
      case 'train':
        pathname = '/train'
        break
      default:
        pathname = '/ImageGen'
    }
    
    // Navigate with threadId as query parameter
    router.push(`${pathname}?threadId=${activity.threadId}`)
  }

  if (activityLoading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#C15F3C] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!recentActivity || recentActivity.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">No recent activity</p>
          <p className="text-sm text-gray-400 mt-1">Start creating to see your activity here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
        <span className="text-sm text-gray-500">{recentActivity.length} activities</span>
      </div>
      
      <div className="space-y-2">
        {recentActivity.map((activity) => {
          const IconComponent = getIconComponent(activity.icon)
          
          return (
            <div 
              key={activity.id} 
              onClick={() => handleActivityClick(activity)}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center group-hover:bg-[#f9f3f0] transition-colors">
                <IconComponent className="w-5 h-5 text-gray-600 group-hover:text-[#C15F3C] transition-colors" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{getGenerationType(activity)}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
                {activity.firstMessage && (
                  <p className="text-xs text-gray-400 mt-1 truncate overflow-hidden whitespace-nowrap text-ellipsis">
                    "{activity.firstMessage}"
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {activity.firstImageUrl && (
                  <img 
                    src={activity.firstImageUrl} 
                    alt="Activity preview"
                    className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                  />
                )}
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="w-4 h-4 text-[#C15F3C]" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {recentActivity.length > 5 && (
        <button
          onClick={() => router.push('/profile')}
          className="w-full mt-4 text-center text-sm text-[#C15F3C] hover:text-[#A54F32] font-medium py-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          View all activity
        </button>
      )}
    </div>
  )
}
