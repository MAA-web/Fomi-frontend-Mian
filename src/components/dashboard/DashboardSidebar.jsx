'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  BarChart3, 
  Activity, 
  Settings, 
  Info, 
  MessageSquare, 
  Crown,
  Coins,
  TrendingUp,
  MoreVertical
} from 'lucide-react'

export default function DashboardSidebar({ 
  user, 
  userPlan, 
  userStats, 
  onNavigate 
}) {
  const [activeItem, setActiveItem] = useState('dashboard')
  const router = useRouter()

  const handleNavigation = (item, path) => {
    setActiveItem(item)
    if (path) {
      router.push(path)
    }
    if (onNavigate) {
      onNavigate(item)
    }
  }

  const getPlanColor = (planName) => {
    switch (planName?.toLowerCase()) {
      case 'pro':
        return 'from-[#C15F3C] to-[#F59B7B]'
      case 'premium':
        return 'from-purple-500 to-purple-700'
      default:
        return 'from-gray-400 to-gray-600'
    }
  }

  const getPlanIcon = (planName) => {
    switch (planName?.toLowerCase()) {
      case 'pro':
        return '👑'
      case 'premium':
        return '⭐'
      default:
        return '✨'
    }
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen flex-shrink-0">
      {/* Navigation Items */}
      <div className="flex-1 p-6">
        <div className="space-y-2">
          <button
            onClick={() => handleNavigation('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
              activeItem === 'dashboard' 
                ? 'bg-[#f9f3f0] text-[#C15F3C] border border-[#C15F3C]/20' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => handleNavigation('analytics')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
              activeItem === 'analytics' 
                ? 'bg-[#f9f3f0] text-[#C15F3C] border border-[#C15F3C]/20' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">Analytics</span>
          </button>

          <button
            onClick={() => handleNavigation('generations')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
              activeItem === 'generations' 
                ? 'bg-[#f9f3f0] text-[#C15F3C] border border-[#C15F3C]/20' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="font-medium">Generations</span>
          </button>

          <button
            onClick={() => handleNavigation('activity')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
              activeItem === 'activity' 
                ? 'bg-[#f9f3f0] text-[#C15F3C] border border-[#C15F3C]/20' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="font-medium">Activity</span>
          </button>
        </div>

        {/* Separator */}
        <div className="my-6 border-t border-gray-200"></div>

        {/* Settings Section */}
        <div className="space-y-2">
          <button
            onClick={() => handleNavigation('settings', '/settings')}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-gray-600 hover:bg-gray-50"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>

          <button
            onClick={() => handleNavigation('about')}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-gray-600 hover:bg-gray-50"
          >
            <Info className="w-5 h-5" />
            <span className="font-medium">About</span>
          </button>

          <button
            onClick={() => handleNavigation('feedback')}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-gray-600 hover:bg-gray-50"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Feedback</span>
          </button>
        </div>
      </div>

      {/* Plan Information Card */}
      {userPlan && (
        <div className="p-6 border-t border-gray-200">
          <div className="bg-gradient-to-r from-[#f9f3f0] to-[#faf7f4] rounded-xl p-4 border border-[#C15F3C]/20">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-8 h-8 bg-gradient-to-r ${getPlanColor(userPlan?.subscription?.plan?.name)} rounded-lg flex items-center justify-center text-white text-sm`}>
                {getPlanIcon(userPlan?.subscription?.plan?.name)}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{userPlan?.subscription?.plan?.name || 'Free'} Plan</h4>
                <p className="text-xs text-gray-600">Current subscription</p>
              </div>
            </div>
            
            {/* Usage Stats */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Generations:</span>
                <span className="font-medium text-gray-900">
                  {userStats?.totalGenerations || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Credits:</span>
                <span className="font-medium text-gray-900">
                  {userPlan?.credits || 0}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleNavigation('upgrade', '/pricing')}
              className="w-full mt-3 bg-[#C15F3C] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#A54F32] transition-colors text-sm"
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      )}

      {/* User Profile Section */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#C15F3C] to-[#F59B7B] rounded-full flex items-center justify-center text-white font-semibold">
            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {user?.displayName || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-sm text-gray-600 truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
