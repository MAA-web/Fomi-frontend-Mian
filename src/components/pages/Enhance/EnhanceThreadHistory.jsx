'use client'

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { Clock, Image as ImageIcon, Sparkles, Loader2, RefreshCw, X, Plus, History } from "lucide-react"

export default function EnhanceThreadHistory({
  firebaseId,
  currentThreadId,
  onSelectThread,
  onNewThread,
  isOpen,
  onClose
}) {
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch enhancement threads
  const fetchThreads = async () => {
    console.log('Fetching enhance threads for firebaseId:', firebaseId)
    if (!firebaseId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://api.tarum.ai/generation-service/conversations?firebaseId=${firebaseId}&page=Upscale`
      )
      
      if (!response.ok) {
        throw new Error(`Failed to fetch threads: ${response.status}`)
      }

      const data = await response.json()
      console.log('Enhance threads response:', data)
      
      if (data.success && data.threads) {
        // Sort threads by createdAt (newest first)
        const sortedThreads = data.threads.sort((a, b) => {
          const dateA = new Date(a.createdAt)
          const dateB = new Date(b.createdAt)
          return dateB - dateA // Descending order (newest first)
        })
        setThreads(sortedThreads)
      }
    } catch (err) {
      console.error('Error fetching enhance threads:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch threads when component opens or firebaseId changes
  useEffect(() => {
    if (isOpen && firebaseId) {
      fetchThreads()
    }
  }, [firebaseId, isOpen])

  // Format timestamp
  const formatTimestamp = (dateString) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = (now - date) / (1000 * 60 * 60)
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } else if (diffInHours < 168) { // 7 days
        return date.toLocaleDateString([], { weekday: 'short' })
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      }
    } catch {
      return 'Unknown time'
    }
  }

  // Handle thread selection
  const handleThreadClick = (thread) => {
    console.log('Selected thread:', thread)
    if (onSelectThread) {
      onSelectThread(thread.threadId)
    }
  }

  // Handle new thread
  const handleNewThread = () => {
    console.log('Creating new thread')
    if (onNewThread) {
      onNewThread()
    }
  }

  return (
    <div className={`w-80 bg-[#f9f3f0] rounded-2xl shadow-sm border border-gray-200 h-full flex flex-col transition-all duration-300 ease-in-out ${
      isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#C15F3C]" />
          <h3 className="text-lg font-semibold text-gray-800">Enhancement History</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/50 rounded-lg transition-colors group"
        >
          <X className="w-5 h-5 text-gray-500 group-hover:text-[#C15F3C] transition-colors" />
        </button>
      </div>

      {/* New Thread Button */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={handleNewThread}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#C15F3C] to-[#F59B7B] hover:from-[#A54F32] hover:to-[#E08A6A] text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>New Upscale</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C15F3C]"></div>
              <span className="text-sm text-gray-600">Loading history...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm mb-2">{error}</p>
              <button
                onClick={fetchThreads}
                className="text-[#C15F3C] hover:text-[#A54F32] text-sm font-medium flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
            </div>
          </div>
        ) : threads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-[#C15F3C]" />
            </div>
            <p className="font-medium text-gray-700">No enhancement history</p>
            <p className="text-sm mt-1">Your enhanced images will appear here</p>
          </div>
        ) : (
          <div className="overflow-y-auto h-full">
            <div className="p-3 space-y-2">
              {threads.map((thread) => {
                const isActive = thread.threadId === currentThreadId
                
                return (
                  <div
                    key={thread.threadId}
                    onClick={() => handleThreadClick(thread)}
                    className={`
                      group relative p-3 rounded-xl cursor-pointer transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-[#faf7f4] to-[#f9f3f0] border-2 border-[#C15F3C] shadow-md' 
                        : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#C15F3C]/50'
                      }
                    `}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#C15F3C]" />
                    )}

                    <div className="flex items-start gap-3">
                      {/* Thread preview image or icon */}
                      <div className="flex-shrink-0">
                        {thread.firstImageUrl ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border-2 border-white shadow-sm">
                            <img
                              src={thread.firstImageUrl}
                              alt="Thread preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 border-2 border-white shadow-sm flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-[#C15F3C]" />
                          </div>
                        )}
                      </div>

                      {/* Thread info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate mb-1">
                          {thread.firstMessage || 'enhance image'}
                        </p>
                        
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(thread.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            <span>{thread.messageCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={fetchThreads}
          className="w-full text-sm text-gray-600 hover:text-[#C15F3C] flex items-center justify-center gap-1 py-2 hover:bg-white/50 rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh History
        </button>
      </div>
    </div>
  )
}
