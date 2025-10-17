'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Download, Clock, Video as VideoIcon, Loader2, CheckCircle, Bookmark, Heart } from 'lucide-react'
import SaveToCollectionModal from '../../collections/SaveToCollectionModal'

export default function VideoContainer({ 
  currentThreadId, 
  userId,
  selectedGeneration, 
  onSelectGeneration, 
  onNewGeneration,
  onGenerationComplete,
  videoHistoryRefreshTrigger 
}) {
  const [currentGeneration, setCurrentGeneration] = useState(null)
  const [videoHistory, setVideoHistory] = useState([])
  const [wsConnection, setWsConnection] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  
  const currentGenerationRef = useRef(null)
  const isStartingGenerationRef = useRef(false)
  const reconnectTimeoutRef = useRef(null)
  const videoFallbackTimeoutRef = useRef(null)
  const maxConnectionAttempts = 5
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [showSaveToCollection, setShowSaveToCollection] = useState(false)
  const [selectedVideoForCollection, setSelectedVideoForCollection] = useState(null)

  // WebSocket connection function with improved error handling
  const connectWebSocket = useCallback((userId) => {
    if (!userId) {
      console.warn('Cannot connect WebSocket: no userId provided')
      return
    }

    // Only connect if we have an active generation
    if (!currentGenerationRef.current) {
      console.log('🚫 No active video generation, skipping WebSocket connection')
      return
    }

    // Prevent multiple connection attempts for the same userId
    if (wsConnection && connectionStatus === 'connecting') {
      console.log('🔄 WebSocket connection already in progress for userId:', userId)
      return
    }

    // Clean up existing connection
    cleanupWebSocket()

    setConnectionStatus('connecting')
    console.log('🔌 Connecting to WebSocket for video firebaseId:', userId)

    try {

      //const ws = new WebSocket(`ws://localhost:8082/ws?firebaseId=${userId}`)
      const ws = new WebSocket(`wss://api.tarum.ai/generation-service/ws?firebaseId=${userId}`)

      ws.binaryType = 'arraybuffer'

      ws.onopen = () => {
        console.log('✅ Video WebSocket connected successfully for firebaseId:', userId)
        setIsConnected(true)
        setConnectionStatus('connected')
        setConnectionAttempts(0)
      }

      ws.onmessage = (event) => {
        console.log('📡 Video WebSocket message received, type:', typeof event.data, 'instanceof ArrayBuffer:', event.data instanceof ArrayBuffer)
        console.log('📡 Video message data size:', event.data.byteLength || event.data.size || event.data.length)
        
        // Update connection status to connected when we receive messages
        if (connectionStatus !== 'connected') {
          setConnectionStatus('connected')
        }
        
        try {
          if (event.data instanceof ArrayBuffer) {
            // Handle binary video data
            console.log('📦 Video binary data received:', event.data.byteLength, 'bytes')
            handleVideoData(event.data)
          } else {
            // Handle JSON status updates
            const data = JSON.parse(event.data)
            console.log('📨 Video status update:', data)
            handleStatusUpdate(data)
          }
        } catch (error) {
          console.error('❌ Error processing video WebSocket message:', error)
        }
      }

      ws.onclose = (event) => {
        console.log('🔌 Video WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)
        setConnectionStatus('disconnected')
        
        // Reconnect if not a clean closure and we haven't exceeded max attempts
        if (event.code !== 1000 && connectionAttempts < maxConnectionAttempts) {
          const newAttempts = connectionAttempts + 1
          setConnectionAttempts(newAttempts)
          console.log(`🔄 Video reconnecting... (attempt ${newAttempts}/${maxConnectionAttempts})`)
          reconnectTimeoutRef.current = setTimeout(() => connectWebSocket(userId), 3000)
        } else if (connectionAttempts >= maxConnectionAttempts) {
          console.log('❌ Max WebSocket connection attempts reached. Videos will be available in history once complete.')
          setConnectionStatus('failed')
          
          // Mark any in-progress videos as "uploaded" after max attempts to stop loading spinner
          if (currentGenerationRef.current) {
            setChatHistory(prev => {
              const updated = prev.map(gen => ({
                ...gen,
                videos: gen.videos.map(v => 
                  v.status === 'processing' || v.status === 'queued'
                    ? { ...v, status: 'uploaded', message: 'Video queued - check history for updates' }
                    : v
                )
              }))
              return updated
            })
          }
        }
      }

      ws.onerror = (error) => {
        console.error('❌ Video WebSocket error:', error)
        setConnectionStatus('error')
      }

      setWsConnection(ws)
    } catch (error) {
      console.error('❌ Error creating video WebSocket connection:', error)
      setConnectionStatus('error')
    }
  }, [wsConnection, connectionStatus, connectionAttempts])

  const cleanupWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (wsConnection) {
      wsConnection.close(1000, 'Component cleanup')
      setWsConnection(null)
    }
    
    setIsConnected(false)
    setConnectionStatus('disconnected')
  }, [wsConnection])

  // Fetch chat history for a thread
  const fetchChatHistory = async () => {
    if (!currentThreadId) {
      setVideoHistory([])
      setCurrentGeneration(null)
      currentGenerationRef.current = null
      return
    }

    setLoadingHistory(true)
    try {
      console.log('📚 Fetching video chat history for thread:', currentThreadId)
      const response = await fetch(`https://api.tarum.ai/generation-service/conversations/${currentThreadId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chat history: ${response.status}`)
      }

      const data = await response.json()
      console.log('📚 Received video chat history:', data.generation_requests?.length || 0, 'requests')
      setVideoHistory(data.generation_requests || [])
      
      // Only clear current generation if it's not actively processing
      if (!currentGeneration || !currentGeneration.videos?.some(v => v.status === 'processing')) {
        setCurrentGeneration(null)
        currentGenerationRef.current = null
      }
    } catch (err) {
      console.error('Error fetching video chat history:', err)
      setVideoHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }

  // Fetch chat history when threadId changes
  useEffect(() => {
    // Don't fetch history if we're starting a new generation
    if (!isStartingGenerationRef.current) {
      fetchChatHistory()
    }
  }, [currentThreadId])

  // Handle incoming video data with job_id
  const handleVideoData = (binaryData) => {
    console.log('🎬 handleVideoData called with:', binaryData.byteLength, 'bytes')
    console.log('🎯 Current generation exists:', !!currentGenerationRef.current)

    if (!currentGenerationRef.current) {
      console.log('❌ No current generation ref, ignoring video data')
      return
    }

    // Convert binary data to Uint8Array for easier processing
    const uint8Array = new Uint8Array(binaryData)
    let firstSeparatorIndex = -1
    let secondSeparatorIndex = -1

    // Find the first separator '|' in the binary data (after job ID)
    for (let i = 0; i < uint8Array.length && i < 100; i++) { // Check first 100 bytes for job ID
      if (uint8Array[i] === 124) { // 124 is ASCII code for '|'
        if (firstSeparatorIndex === -1) {
          firstSeparatorIndex = i
        } else {
          secondSeparatorIndex = i
          break
        }
      }
    }

    if (firstSeparatorIndex === -1) {
      console.log('No separator found, treating as old format')
      // Fallback to old format - replace first placeholder
      const blob = new Blob([binaryData], { type: 'video/mp4' })
      const videoUrl = URL.createObjectURL(blob)
      replaceFirstPlaceholder(videoUrl)
      return
    }

    // Extract job ID (text before first separator)
    const jobIdBytes = uint8Array.slice(0, firstSeparatorIndex)
    const jobId = new TextDecoder().decode(jobIdBytes)
    
    // If there's a second separator, skip the content-type and use data after second separator
    let videoDataBytes
    if (secondSeparatorIndex !== -1) {
      console.log('🔧 Found content-type prefix, skipping to actual video data')
      videoDataBytes = uint8Array.slice(secondSeparatorIndex + 1)
    } else {
      // Extract video data (everything after first separator)
      videoDataBytes = uint8Array.slice(firstSeparatorIndex + 1)
    }

    console.log('✅ Extracted video job_id:', jobId, 'video data size:', videoDataBytes.byteLength)

    // Validate that we have video data
    if (videoDataBytes.byteLength === 0) {
      console.error('❌ No video data found after job ID extraction')
      return
    }

    // Debug: Check first few bytes to see if it's a valid MP4
    const firstBytes = Array.from(videoDataBytes.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join(' ')
    console.log('🔍 First 20 bytes of video data:', firstBytes)
    
    // Check for MP4 signature (ftyp box)
    const mp4Signature1 = [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70] // Common MP4 start
    const mp4Signature2 = [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70] // Another common MP4 start
    const hasMP4Sig1 = mp4Signature1.every((byte, i) => videoDataBytes[i] === byte)
    const hasMP4Sig2 = mp4Signature2.every((byte, i) => videoDataBytes[i] === byte)
    
    console.log('🎬 MP4 signature check:', { hasMP4Sig1, hasMP4Sig2 })
    
    // Create video blob and URL (MP4 format)
    const blob = new Blob([videoDataBytes], { type: 'video/mp4' })
    const videoUrl = URL.createObjectURL(blob)
    
    console.log('🎬 Created video URL:', videoUrl)
    console.log('🎬 Blob size:', blob.size, 'bytes')

    // Update the specific video based on jobId
    setCurrentGeneration(prev => {
      if (!prev) return null
      
      const newVideos = prev.videos.map(video => {
        if (video.jobId === jobId) {
          console.log('✅ Updating video', video.index, 'with URL:', videoUrl)
          
          // Clear fallback timeout since we received the video data
          if (videoFallbackTimeoutRef.current) {
            clearTimeout(videoFallbackTimeoutRef.current)
            videoFallbackTimeoutRef.current = null
            console.log('⏰ Cleared video fallback timeout - video data received')
          }
          
          return { 
            ...video, 
            url: videoUrl, 
            status: 'completed',
            blob: blob // Store blob for download
          }
        }
        return video
      })
      
      const updatedGeneration = {
        ...prev,
        videos: newVideos
      }

      // Check if all videos are completed
      const allCompleted = newVideos.every(video => video.status === 'completed')
      if (allCompleted && onGenerationComplete) {
        console.log('🎉 All videos completed!')
        // Use setTimeout to avoid setState during render
        setTimeout(() => onGenerationComplete(), 0)
      }

      return updatedGeneration
    })
  }

  // Fallback function for old format
  const replaceFirstPlaceholder = (videoUrl) => {
    setCurrentGeneration(prev => {
      if (!prev) return null
      
      const firstPlaceholderIndex = prev.videos.findIndex(video => video.status === 'processing')
      if (firstPlaceholderIndex === -1) return prev
      
      const newVideos = [...prev.videos]
      newVideos[firstPlaceholderIndex] = {
        ...newVideos[firstPlaceholderIndex],
        url: videoUrl,
        status: 'completed'
      }
      
      return {
        ...prev,
        videos: newVideos
      }
    })
  }

  // Fallback function to fetch video from backend
  const fetchVideoFromBackend = async (jobId) => {
    try {
      console.log('🔄 Fetching video from backend fallback for jobId:', jobId)
      const response = await fetch(`https://api.tarum.ai/generation-service/Image/${jobId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const contentType = response.headers.get('content-type')
      console.log('📦 Backend response content-type:', contentType)
      
      let videoUrl
      let blob = null
      
      // Check if response is JSON (contains URL) or binary blob
      if (contentType && contentType.includes('application/json')) {
        // Backend returned JSON with URL
        const data = await response.json()
        console.log('📄 Backend returned JSON:', data)
        
        if (data.url) {
          // Use the URL directly from the response
          videoUrl = data.url
          console.log('✅ Using video URL from backend:', videoUrl)
          
          // Optionally fetch the actual video blob for download functionality
          try {
            const videoResponse = await fetch(videoUrl)
            if (videoResponse.ok) {
              blob = await videoResponse.blob()
              console.log('📥 Fetched video blob from URL, size:', blob.size, 'bytes')
            }
          } catch (blobError) {
            console.warn('⚠️ Could not fetch blob from URL, download may not work:', blobError)
          }
        } else {
          throw new Error('Backend response missing URL field')
        }
      } else {
        // Backend returned binary blob directly
        blob = await response.blob()
        videoUrl = URL.createObjectURL(blob)
        console.log('✅ Video fallback successful, blob URL created:', videoUrl)
      }
      
      // Update the video with the fetched URL
      setCurrentGeneration(prev => {
        if (!prev) return null
        
        const newVideos = prev.videos.map(video => {
          if (video.jobId === jobId && !video.url) {
            return { ...video, url: videoUrl, blob: blob, status: 'completed' }
          }
          return video
        })
        
        return {
          ...prev,
          videos: newVideos
        }
      })
    } catch (error) {
      console.error('❌ Video fallback failed:', error)
    }
  }

  // Handle status updates
  const handleStatusUpdate = (data) => {
    console.log('📡 Video WebSocket status update:', data)
    
    if (!currentGenerationRef.current) return
    
    // Update specific video status based on job_id
    if (data.job_id) {
      console.log('Looking for video job_id:', data.job_id, 'in videos:', currentGenerationRef.current.videos.map(video => video.jobId))
      
      setCurrentGeneration(prev => {
        if (!prev) return null
        
        const newVideos = prev.videos.map(video => {
          if (video.jobId === data.job_id) {
            let newStatus = video.status
            if (data.status === 'started' || data.stage === 'processing') {
              newStatus = 'processing'
            } else if (data.status === 'completed' || data.stage === 'completed') {
              newStatus = 'completed'
              
              // Set up fallback timeout for completed videos without URLs
              if (!video.url) {
                console.log('⏰ Setting 5-second fallback timeout for video:', data.job_id)
                videoFallbackTimeoutRef.current = setTimeout(() => {
                  // Check if video still doesn't have URL after 5 seconds
                  const currentGen = currentGenerationRef.current
                  if (currentGen) {
                    const videoToCheck = currentGen.videos.find(v => v.jobId === data.job_id)
                    if (videoToCheck && !videoToCheck.url && videoToCheck.status === 'completed') {
                      console.log('🔄 5 seconds passed, no video URL received, triggering fallback')
                      fetchVideoFromBackend(data.job_id)
                    }
                  }
                }, 5000)
              }
            } else if (data.status === 'failed') {
              newStatus = 'failed'
            }
            console.log('Updating video', video.index, 'to status:', newStatus, 'preserving URL:', video.url)
            return { ...video, status: newStatus }
          }
          return video
        })
        
        return {
          ...prev,
          videos: newVideos
        }
      })
    }
  }

  // Start new video generation
  const startNewGeneration = useCallback((prompt, totalVideos, modelUsed, jobIds, threadId, videoOptions = {}) => {
    console.log('🎬 Starting new video generation:', { prompt, totalVideos, modelUsed, jobIds, threadId, videoOptions })
    
    // Set flag to prevent history fetch from clearing current generation
    isStartingGenerationRef.current = true

    // Clear current generation and move to history if exists
    if (currentGenerationRef.current && currentGenerationRef.current.videos.some(v => v.url)) {
      console.log('📚 Moving current generation to history')
      setVideoHistory(prev => [currentGenerationRef.current, ...prev])
    }

    // Create new generation with video placeholders
    const newGeneration = {
      id: Date.now(),
      prompt,
      model: modelUsed,
      threadId,
      timestamp: new Date().toISOString(),
      duration: 10, // Default duration until backend supports it
      aspectRatio: videoOptions.aspectRatio || '16:9',
      fps: videoOptions.fps || 24,
      videos: jobIds.map((jobId, index) => ({
        id: `${Date.now()}_${index}`,
        jobId,
        index,
        url: null,
        status: 'processing',
        blob: null
      }))
    }

    setCurrentGeneration(newGeneration)
    currentGenerationRef.current = newGeneration
    
    // Connect to WebSocket for this generation
    connectWebSocket(userId)
    
    // Clear the flag after generation is set up
    setTimeout(() => {
      isStartingGenerationRef.current = false
    }, 100)

  }, [wsConnection, connectionStatus, connectWebSocket, userId])

  // Update ref when currentGeneration changes
  useEffect(() => {
    console.log('🔄 currentGeneration changed:', currentGeneration ? {
      id: currentGeneration.id,
      prompt: currentGeneration.prompt,
      videos: currentGeneration.videos?.map(video => ({ url: video.url, status: video.status, jobId: video.jobId }))
    } : null)
    // Only update ref if currentGeneration is not null
    if (currentGeneration) {
      currentGenerationRef.current = currentGeneration
    }
  }, [currentGeneration])

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      cleanupWebSocket()
      // Clear video fallback timeout on cleanup
      if (videoFallbackTimeoutRef.current) {
        clearTimeout(videoFallbackTimeoutRef.current)
        videoFallbackTimeoutRef.current = null
      }
    }
  }, [cleanupWebSocket])

  // Don't auto-connect on thread ID changes - only connect when starting generation

  // Expose function to parent
  useEffect(() => {
    if (onNewGeneration) {
      onNewGeneration(startNewGeneration)
    }
  }, [onNewGeneration, startNewGeneration])

  // Download video function
  const downloadVideo = (videoBlob, filename = 'generated-video.mp4') => {
    if (!videoBlob) return
    
    const url = URL.createObjectURL(videoBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatTimestamp = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return 'Unknown time'
    }
  }

  const handleSaveToCollection = (video) => {
    setSelectedVideoForCollection({
      id: video.jobId || video.id,
      url: video.url,
      prompt: currentGeneration?.prompt || 'Generated video',
      like_count: 0
    })
    setShowSaveToCollection(true)
  }

  const handleCollectionSave = (collectionIds) => {
    console.log(`Video saved to ${collectionIds.length} collections`)
    setShowSaveToCollection(false)
    setSelectedVideoForCollection(null)
  }

  const handleLike = async (video) => {
    try {
      const response = await fetch(`https://api.tarum.ai/asset-service/images/${video.jobId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        console.log('Video liked successfully:', video.jobId)
        // TODO: Update UI to show liked state
      } else {
        console.error('Failed to like video:', response.statusText)
      }
    } catch (error) {
      console.error('Error liking video:', error)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#C15F3C]/10 to-[#F59B7B]/10 rounded-lg flex items-center justify-center">
            <VideoIcon className="w-4 h-4 text-[#C15F3C]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Video Generation</h2>
            <p className="text-sm text-gray-500">
              {connectionStatus === 'connected' ? '✅ Connected' : 
               connectionStatus === 'connecting' ? '🔄 Connecting...' : 
               connectionStatus === 'error' ? '❌ Connection Error' : '⚪ Disconnected'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Current Generation */}
        {currentGeneration && (
          <div className="mb-6 bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#C15F3C]/10 to-[#F59B7B]/10 rounded-lg flex items-center justify-center">
                  <VideoIcon className="w-4 h-4 text-[#C15F3C]" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Current Generation</h3>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimestamp(currentGeneration.timestamp)}
                    </div>
                    <span>{currentGeneration.duration}s</span>
                    <span>{currentGeneration.aspectRatio}</span>
                    <span>{currentGeneration.fps}fps</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 bg-white rounded-lg p-3 border">
                <strong>Prompt:</strong> "{currentGeneration.prompt}"
              </p>
            </div>

            {/* Videos */}
            <div className="grid grid-cols-1 gap-4">
              {currentGeneration.videos.map((video) => (
                <div key={video.id} className="bg-white rounded-lg border p-4">
                  {video.url ? (
                    <div className="space-y-3">
                      <video 
                        src={video.url} 
                        controls 
                        className="w-full max-w-md rounded-lg"
                        style={{ aspectRatio: currentGeneration.aspectRatio.replace(':', '/') }}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-600 font-medium">✅ Completed</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLike(video)}
                            className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                            title="Like"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSaveToCollection(video)}
                            className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                            title="Save to Collection"
                          >
                            <Bookmark className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => downloadVideo(video.blob, `video-${video.jobId}.mp4`)}
                            className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-[#C15F3C]/10 to-[#F59B7B]/10 hover:from-[#C15F3C]/20 hover:to-[#F59B7B]/20 border border-[#C15F3C]/30 rounded-lg transition-colors text-sm text-[#C15F3C]"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
                      <div className="text-center px-4">
                        {video.status === 'uploaded' ? (
                          <>
                            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 mb-1">Video generation in progress</p>
                            <p className="text-xs text-orange-600 bg-orange-50 rounded px-3 py-2 mt-2">
                              ⚠️ {video.message || 'Check history in a few minutes for your completed video'}
                            </p>
                          </>
                        ) : (
                          <>
                            <Loader2 className="w-8 h-8 animate-spin text-[#C15F3C] mx-auto mb-2" />
                            <p className="text-sm text-gray-600 mb-2">
                              {video.status === 'processing' ? 'Generating video...' : 'Queued'}
                            </p>
                            {connectionStatus === 'failed' && (
                              <p className="text-xs text-orange-600 bg-orange-50 rounded px-3 py-2 mt-2">
                                ⚠️ Live updates unavailable. Check history in a few minutes to see your completed video.
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video History */}
        {videoHistory.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Previous Generations</h3>
            {videoHistory.map((request, index) => {
              // Extract video URLs from messages array (API format)
              const videos = (request.messages || []).map((msg, msgIndex) => {
                const videoUrl = msg.video_url || msg.image_url || (msg.status === 'completed' ? `https://api.tarum.ai/generation-service/videos/${msg.job_id}` : null);
                return {
                  url: videoUrl,
                  status: msg.status,
                  jobId: msg.job_id,
                  index: msgIndex
                };
              });

              return (
                <div key={`history-${request.id || index}`} className="bg-white rounded-xl p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <VideoIcon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Video Generation</h4>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTimestamp(request.created_at)}
                          </div>
                          <span>{request.model_used || 'Unknown Model'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prompt */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border">
                      <strong>Prompt:</strong> "{request.prompt}"
                    </p>
                  </div>

                  {/* Videos */}
                  <div className="grid grid-cols-1 gap-4">
                    {videos.filter(video => video.url).map((video) => (
                      <div key={video.jobId} className="space-y-3">
                        <video 
                          src={video.url} 
                          controls 
                          className="w-full max-w-md rounded-lg border"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Status: {video.status === 'completed' ? '✅ Completed' : video.status}
                          </span>
                          {video.status === 'completed' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleLike(video)}
                                className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                                title="Like"
                              >
                                <Heart className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleSaveToCollection(video)}
                                className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                                title="Save to Collection"
                              >
                                <Bookmark className="w-4 h-4" />
                              </button>
                              <a
                                href={video.url}
                                download={`video-${video.jobId}.mp4`}
                                className="flex items-center space-x-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                              >
                                <Download className="w-4 h-4" />
                                <span>Download</span>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!currentGeneration && videoHistory.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#C15F3C] to-[#F59B7B] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <VideoIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Generate Video</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Enter your prompt and click "Generate Video" to create amazing videos with AI.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Save to Collection Modal */}
      <SaveToCollectionModal
        isOpen={showSaveToCollection}
        onClose={() => {
          setShowSaveToCollection(false)
          setSelectedVideoForCollection(null)
        }}
        imageData={selectedVideoForCollection}
        onSave={handleCollectionSave}
      />
    </div>
  )
}
