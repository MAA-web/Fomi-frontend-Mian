'use client'

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { Clock, Image as ImageIcon, Sparkles, Loader2, RefreshCw } from "lucide-react"

export default function ChatHistory({ threadId, onSelectGeneration, refreshTrigger }) {
  const [chatHistory, setChatHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch conversation history
  const fetchChatHistory = async () => {
    if (!threadId) return

    setLoading(true)
    setError(null)

    try {
      // const response = await fetch(`https://api.tarum.ai/generation-service/conversations/${threadId}`)
      const response = await fetch(`https://api.tarum.ai/generation-service/conversations/${threadId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch chat history: ${response.status}`)
      }

      const data = await response.json()
      setChatHistory(data.generation_requests || [])
    } catch (err) {
      console.error('Error fetching chat history:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch history when threadId or refreshTrigger changes
  useEffect(() => {
    fetchChatHistory()
  }, [threadId, refreshTrigger])

  // Format timestamp
  const formatTimestamp = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Unknown time'
    }
  }

  // Group messages by generation request
  const groupMessagesByRequest = (messages) => {
    const grouped = {}
    messages.forEach(message => {
      if (!grouped[message.generation_request_id]) {
        grouped[message.generation_request_id] = []
      }
      grouped[message.generation_request_id].push(message)
    })
    return grouped
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="w-6 h-6 text-purple-500 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading chat history...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-600">Failed to load chat history</p>
          <p className="text-xs text-red-500 mt-1">{error}</p>
          <button
            onClick={fetchChatHistory}
            className="mt-2 text-xs bg-red-100 hover:bg-red-200 px-3 py-1 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (chatHistory.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-3 mx-auto">
          <Clock className="w-6 h-6 text-purple-600" />
        </div>
        <h3 className="text-sm font-medium text-gray-700 mb-1">No chat history yet</h3>
        <p className="text-xs text-gray-500">Your generated images will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {chatHistory.slice().reverse().map((request, requestIndex) => {
        const groupedMessages = groupMessagesByRequest(request.messages || [])
        const totalImages = request.total_images || 0
        const completedImages = request.messages?.filter(msg => msg.status === 'completed').length || 0

        return (
          <div
            key={request.id}
            className="bg-[#f9f3f0] rounded-2xl p-4 border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer"
            onClick={() => onSelectGeneration && onSelectGeneration(request)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm leading-relaxed mb-1">
                  {request.prompt}
                </h4>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="font-medium">{request.model_used}</span>
                  <span>•</span>
                  <span>{formatTimestamp(request.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-3">
                <div className="flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-600">{completedImages}/{totalImages}</span>
                </div>

                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  completedImages === totalImages && totalImages > 0
                    ? 'bg-green-100 text-green-700'
                    : completedImages > 0
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {completedImages === totalImages && totalImages > 0 ? 'Complete' :
                   completedImages > 0 ? 'Partial' : 'Pending'}
                </div>
              </div>
            </div>

            {/* Images Preview */}
            {request.messages && request.messages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {request.messages.slice(0, 3).map((message, msgIndex) => (
                  <div
                    key={message.id}
                    className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center border transition-colors"
                    style={{
                      background: message.image_id
                        ? 'linear-gradient(135deg, #c084fc 0%, #ec4899 100%)'
                        : message.status === 'completed'
                        ? 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)'
                        : message.status === 'processing'
                        ? 'linear-gradient(135deg, #60a5fa 0%, #a855f7 100%)'
                        : 'linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%)',
                      borderColor: message.image_id ? '#c084fc' : '#d1d5db'
                    }}
                  >
                    {message.image_id ? (
                      <ImageIcon className="w-4 h-4 text-white" />
                    ) : (
                      <div className="text-center">
                        <Sparkles className={`w-3 h-3 mx-auto ${
                          message.status === 'completed' ? 'text-white' : 'text-purple-500'
                        }`} />
                        <div className={`text-[8px] font-medium mt-0.5 ${
                          message.status === 'completed' ? 'text-white' : 'text-purple-600'
                        }`}>
                          {msgIndex + 1}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {request.messages.length > 3 && (
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
                    <span className="text-xs text-gray-600 font-medium">
                      +{request.messages.length - 3}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Status indicator for latest message */}
            {request.messages && request.messages.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                {request.messages.some(msg => msg.status === 'processing') && (
                  <span className="text-blue-600">Processing...</span>
                )}
                {request.messages.every(msg => msg.status === 'completed') && (
                  <span className="text-green-600">All images generated</span>
                )}
                {request.messages.some(msg => msg.status === 'failed') && (
                  <span className="text-red-600">Some images failed</span>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}