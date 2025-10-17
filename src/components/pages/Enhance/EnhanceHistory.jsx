'use client'

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { formatDistanceToNow } from "date-fns"
import { Clock, Image as ImageIcon, Sparkles, Loader2, RefreshCw, Eye, X } from "lucide-react"
import { Compare } from "@/components/ui/compare"
import MessageItem from "./MessageItem"

export default function EnhanceHistory({
  threadId,
  onSelectEnhancement,
  refreshTrigger,
  originalImage, // probably url
  enhancedImage, // probably url
  state,         // true false
}) {
  const [enhanceHistory, setEnhanceHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedEnhancement, setSelectedEnhancement] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Fetch enhancement history
  const fetchEnhanceHistory = async () => {
    console.log('Fetching enhance history for threadId:', threadId)
    if (!threadId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`https://api.tarum.ai/generation-service/conversations/${threadId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch enhance history: ${response.status}`)
      }

      const data = await response.json()
      setEnhanceHistory(data.generation_requests.reverse() || [])
    } catch (err) {
      console.error('Error fetching enhance history:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch history when threadId or refreshTrigger changes
  useEffect(() => {
    console.log('Enhance history fetch triggered, threadId:', threadId, 'refreshTrigger:', refreshTrigger)
    fetchEnhanceHistory()
  }, [threadId, refreshTrigger])

  // Format timestamp
  const formatTimestamp = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Unknown time'
    }
  }

  // Handle enhancement selection
  const handleEnhancementClick = (enhancement) => {
    setSelectedEnhancement(enhancement)
    setShowModal(true)
    if (onSelectEnhancement) {
      onSelectEnhancement(enhancement)
    }
  }

  // Close modal
  const closeModal = () => {
    setShowModal(false)
    setSelectedEnhancement(null)
  }

  // ESC key handler for closing modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showModal) {
        closeModal()
      }
    }

    if (showModal) {
      window.addEventListener('keydown', handleEscKey)
    }

    return () => {
      window.removeEventListener('keydown', handleEscKey)
    }
  }, [showModal])

  // Get the first completed message from a request
  const getCompletedMessage = (request) => {
    console.log('getCompletedMessage - full request:', request)
    console.log('getCompletedMessage - messages:', request.messages)
    
    // Check if messages array exists and has at least one message
    if (request.messages && Array.isArray(request.messages) && request.messages.length > 0) {
      // Try to find a completed message with image_url
      const completedWithUrl = request.messages.find(msg => msg.status === 'completed' && msg.image_url)
      if (completedWithUrl) {
        console.log('Found completed message with URL:', completedWithUrl)
        return completedWithUrl
      }
      
      // Fallback: return the first message even if no image_url (we'll use job_id to fetch it)
      const firstMessage = request.messages[0]
      console.log('Using first message:', firstMessage)
      return firstMessage
    }
    
    return null
  }

  // Get the original image from the request
  const getOriginalImage = (request) => {
    // For enhance, the original image is typically stored in the request metadata
    // or we can use the first message's original image
    return request.supplied_image_url || request.messages?.[0]?.original_image_url
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading history...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={fetchEnhanceHistory}
          className="mt-2 flex items-center text-red-600 hover:text-red-700 text-sm"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Retry
        </button>
      </div>
    )
  }

  if (enhanceHistory.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No enhancement history found</p>
        <p className="text-sm">Your enhanced images will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* History Items */}
      <div className="space-y-3">
        {enhanceHistory.map((request, index) => {
          console.log('Rendering enhancement request:', request)
          
          const completedMessage = getCompletedMessage(request)
          const originalImage = getOriginalImage(request)
          
          console.log('Completed message:', completedMessage)
          console.log('Original image:', originalImage)

          // Skip if no completed message or original image
          if (!completedMessage || !originalImage) {
            console.log('Skipping request - missing data')
            return null
          }

          return (
            <div
              key={request.id || index}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleEnhancementClick(request)}
            >
              <div className="flex items-center space-x-4">
                
                {/* Original Image Thumbnail */}
                <div className="flex-shrink-0">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={originalImage}
                      alt="Original"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Upscale Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimestamp(request.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>Click to view</span>
                    </div>
                  </div>
                </div>

                {/* Upscaled Image Thumbnail */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={completedMessage.image_url || `https://api.tarum.ai/generation-service/Image/${completedMessage.job_id}`}
                      alt="Upscaled"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal for Full Comparison - Using Portal */}
      {showModal && selectedEnhancement && createPortal(
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-8"
          style={{ top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }}
        >
          {/* Close button */}
          <button
            onClick={closeModal}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 z-10"
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* Comparer */}
          <div className="w-full max-w-5xl h-[80vh] flex flex-col items-center justify-center">
            <Compare
              firstImage={getOriginalImage(selectedEnhancement)}
              secondImage={getCompletedMessage(selectedEnhancement)?.image_url || `https://api.tarum.ai/generation-service/Image/${getCompletedMessage(selectedEnhancement)?.job_id}`}
              className="w-full h-full"
              slideMode="hover"
              showHandlebar={true}
              autoplay={false}
            />
            
            {/* Labels */}
            <div className="flex justify-between w-full mt-6 px-8">
              <span className="text-white text-lg font-medium">Original</span>
              <span className="text-white text-lg font-medium">Upscaled</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
