'use client'

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { Clock, Image as ImageIcon, Sparkles, Loader2, RefreshCw, X } from "lucide-react"

export default function EditThreadHistory({
  firebaseId,
  currentThreadId,
  onSelectThread,
  onNewThread,
  onNewChat,
  isOpen,
  onClose
}) {
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch thread history from backend
  const fetchThreadHistory = async () => {
    if (!firebaseId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`https://api.tarum.ai/generation-service/conversations?firebaseId=${firebaseId}&page=Edit`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📚 Received edit thread history:', data)
      
      // Sort threads by date (newest first)
      const sortedThreads = data.conversations?.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA; // Descending order (newest first)
      }) || []
      
      setThreads(sortedThreads)
    } catch (error) {
      console.error('❌ Failed to fetch edit thread history:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch history when firebaseId changes
  useEffect(() => {
    if (firebaseId) {
      fetchThreadHistory()
    }
  }, [firebaseId])

  const formatTimestamp = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch (error) {
      return 'Unknown time'
    }
  }

  const handleThreadClick = (threadId) => {
    console.log('Thread clicked:', threadId)
    if (onSelectThread) {
      onSelectThread(threadId)
    }
  }

  const handleNewThread = () => {
    if (onNewThread) {
      onNewThread()
    }
  }

  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat()
    }
  }

  if (!isOpen) return null

  return (
    <div className="w-80 bg-white rounded-2xl shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <ImageIcon className="w-5 h-5 text-[#C15F3C]" />
          <h3 className="font-semibold text-gray-900">Edit History</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchThreadHistory}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Refresh History"
          >
            <RefreshCw className="w-4 h-4 text-gray-500 hover:text-[#C15F3C]" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors group"
            title="Close History"
          >
            <X className="w-4 h-4 text-gray-500 group-hover:text-[#C15F3C]" />
          </button>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={handleNewChat}
          className="w-full bg-gradient-to-r from-[#C15F3C] to-[#F59B7B] hover:from-[#A54F32] hover:to-[#E08A6A] text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          New Edit
        </button>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin border-b-2 border-[#C15F3C]" />
              <span>Loading threads...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-500 mb-2">Failed to load threads</p>
              <button
                onClick={fetchThreadHistory}
                className="text-[#C15F3C] hover:text-[#A54F32] underline"
              >
                Try again
              </button>
            </div>
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center text-gray-500 py-8 px-4">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No edit threads yet</p>
            <p className="text-sm">Your edit conversations will appear here</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {threads.map((thread) => (
              <div
                key={thread.id}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  currentThreadId === thread.id
                    ? 'bg-gradient-to-r from-[#faf7f4] to-[#f9f3f0] border-2 border-[#C15F3C] shadow-md'
                    : 'hover:bg-gray-50 border border-transparent hover:border-gray-200'
                }`}
                onClick={() => handleThreadClick(thread.id)}
              >
                <div className="flex items-start space-x-3">
                  {/* Thread indicator */}
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    currentThreadId === thread.id ? 'bg-[#C15F3C]' : 'bg-gray-300'
                  }`} />
                  
                  {/* Thread content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        Edit Thread
                      </h4>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(thread.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(thread.createdAt)}</span>
                      <span>•</span>
                      <span>{thread.messageCount || 0} edits</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

