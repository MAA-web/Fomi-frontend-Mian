'use client'

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { Clock, Image as ImageIcon, Sparkles, Loader2, RefreshCw, Eye } from "lucide-react"
import { Compare } from "@/components/ui/compare"

export default function EditHistory({
  threadId,
  onSelectEdit,
  refreshTrigger,
  originalImage,
  editedImage,
  state
}) {
  const [editHistory, setEditHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch edit history from backend
  const fetchEditHistory = async () => {
    if (!threadId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`https://api.tarum.ai/generation-service/conversations?firebaseId=bscUhhSwrbPitTU4DOjoCk3mhiL2&page=Edit&threadId=${threadId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📚 Received edit history:', data)
      
      // Sort threads by date (newest first)
      const sortedThreads = data.generation_requests?.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA; // Descending order (newest first)
      }) || []
      
      setEditHistory(sortedThreads)
    } catch (error) {
      console.error('❌ Failed to fetch edit history:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch history when threadId changes or refresh is triggered
  useEffect(() => {
    fetchEditHistory()
  }, [threadId, refreshTrigger])

  // Get the first completed message from a request
  const getCompletedMessage = (request) => {
    console.log('getCompletedMessage - full request:', request)
    console.log('getCompletedMessage - messages:', request.messages)

    // First, try to find a message with status === 'completed' and image_url
    const completedMessage = request.messages?.find(msg => 
      msg.status === 'completed' && msg.image_url
    )
    
    if (completedMessage) {
      console.log('✅ Found completed message:', completedMessage)
      return completedMessage
    }
    
    // Fallback: return the first message if available
    if (request.messages && request.messages.length > 0) {
      console.log('⚠️ Using first message as fallback:', request.messages[0])
      return request.messages[0]
    }
    
    // Last resort: construct a basic message from job_ids if available
    if (request.job_ids && request.job_ids.length > 0) {
      console.log('⚠️ Constructing message from job_ids:', request.job_ids[0])
      return {
        job_id: request.job_ids[0],
        status: 'completed'
      }
    }
    
    console.log('❌ No suitable message found')
    return null
  }

  // Get original image from request
  const getOriginalImage = (request) => {
    const originalMessage = request.messages?.find(msg => msg.status === 'uploaded')
    return originalMessage?.image_url || originalImage
  }

  const formatTimestamp = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch (error) {
      return 'Unknown time'
    }
  }

  const handleEditClick = (edit) => {
    console.log('Edit clicked:', edit)
    if (onSelectEdit) {
      onSelectEdit(edit)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center space-x-2 text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin border-b-2 border-[#C15F3C]" />
          <span>Loading edit history...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load edit history</p>
          <button
            onClick={fetchEditHistory}
            className="text-[#C15F3C] hover:text-[#A54F32] underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <ImageIcon className="w-5 h-5 text-[#C15F3C]" />
          <h3 className="font-semibold text-gray-900">Edit History</h3>
        </div>
        <button
          onClick={fetchEditHistory}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Refresh History"
        >
          <RefreshCw className="w-4 h-4 text-gray-500 hover:text-[#C15F3C]" />
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {editHistory.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No edit history yet</p>
            <p className="text-sm">Your edits will appear here</p>
          </div>
        ) : (
          editHistory.map((edit, index) => {
            const completedMessage = getCompletedMessage(edit)
            
            if (!completedMessage) {
              console.log('Skipping request - missing data:', edit)
              return null
            }

            return (
              <div
                key={edit.id || index}
                className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleEditClick(edit)}
              >
                <div className="flex items-start space-x-3">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {completedMessage.image_url ? (
                        <img
                          src={`https://api.tarum.ai/generation-service/Image/${completedMessage.job_id}`}
                          alt="Edit result"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 truncate">
                        Edit #{editHistory.length - index}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(edit.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(edit.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

