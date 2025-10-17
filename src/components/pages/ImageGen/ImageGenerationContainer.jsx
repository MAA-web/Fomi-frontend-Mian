'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Download, Loader2, CheckCircle, Bookmark, Heart } from 'lucide-react'
import SaveToCollectionModal from '../../collections/SaveToCollectionModal'
import generationApi from '../../../lib/api/generation.js'

export default function ImageGenerationContainer({ 
  currentThreadId, 
  userId,
  selectedGeneration, 
  onSelectGeneration, 
  onNewGeneration,
  onGenerationComplete,
  imageHistoryRefreshTrigger 
}) {
  const [currentGeneration, setCurrentGeneration] = useState(null)
  const [imageHistory, setImageHistory] = useState([])
  const [wsConnection, setWsConnection] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  
  const currentGenerationRef = useRef(null)
  const isStartingGenerationRef = useRef(false)
  const reconnectTimeoutRef = useRef(null)
  const imageFallbackTimeoutRef = useRef(null)
  const maxConnectionAttempts = 5
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [showSaveToCollection, setShowSaveToCollection] = useState(false)
  const [selectedImageForCollection, setSelectedImageForCollection] = useState(null)
  const containerRef = useRef(null)

  // WebSocket connection function with improved error handling
  const connectWebSocket = useCallback((userId) => {
    if (!userId) {
      console.warn('Cannot connect WebSocket: no userId provided')
      return
    }

    // Only connect if we have an active generation
    if (!currentGenerationRef.current) {
      console.log('🚫 No active image generation, skipping WebSocket connection')
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
    console.log('🔌 Connecting to WebSocket for image firebaseId:', userId)

    try {
      const ws = new WebSocket(`wss://api.tarum.ai/generation-service/ws?firebaseId=${userId}`)
      ws.binaryType = 'arraybuffer'

      ws.onopen = () => {
        console.log('✅ Image WebSocket connected successfully for firebaseId:', userId)
        setIsConnected(true)
        setConnectionStatus('connected')
        setConnectionAttempts(0)
      }

      ws.onmessage = (event) => {
        console.log('📨 Image WebSocket message received:', event.data.byteLength, 'bytes')
        
        if (event.data instanceof ArrayBuffer) {
          handleImageData(event.data)
        } else {
          try {
            const message = JSON.parse(event.data)
            console.log('📨 Image WebSocket JSON message:', message)
            
            if (message.type === 'status_update') {
              handleStatusUpdate(message)
            }
          } catch (e) {
            console.log('📨 Non-JSON WebSocket message:', event.data)
          }
        }
      }

      ws.onclose = (event) => {
        console.log('🔌 Image WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)
        setConnectionStatus('disconnected')
        
        // Reconnect if not a clean closure and we haven't exceeded max attempts
        if (event.code !== 1000 && connectionAttempts < maxConnectionAttempts) {
          const newAttempts = connectionAttempts + 1
          setConnectionAttempts(newAttempts)
          console.log(`🔄 Image reconnecting... (attempt ${newAttempts}/${maxConnectionAttempts})`)
          reconnectTimeoutRef.current = setTimeout(() => connectWebSocket(userId), 3000)
        } else if (connectionAttempts >= maxConnectionAttempts) {
          console.log('❌ Max WebSocket connection attempts reached. Images will be available in history once complete.')
          setConnectionStatus('failed')
          
          // Mark any in-progress images as "completed" after max attempts to stop loading spinner
          if (currentGenerationRef.current) {
            setImageHistory(prev => {
              const updated = prev.map(gen => ({
                ...gen,
                images: gen.images.map(img => 
                  img.status === 'processing' || img.status === 'queued'
                    ? { ...img, status: 'completed', message: 'Image queued - check history for updates' }
                    : img
                )
              }))
              return updated
            })
          }
        }
      }

      ws.onerror = (error) => {
        console.error('❌ Image WebSocket error:', error)
        setConnectionStatus('error')
      }

      setWsConnection(ws)
    } catch (error) {
      console.error('❌ Error creating image WebSocket connection:', error)
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
      setImageHistory([])
      setCurrentGeneration(null)
      currentGenerationRef.current = null
      return
    }

    setLoadingHistory(true)
    try {
      console.log('📚 Fetching image chat history for thread:', currentThreadId)
      const response = await fetch(`https://api.tarum.ai/generation-service/conversations/${currentThreadId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chat history: ${response.status}`)
      }

      const data = await response.json()
      console.log('📚 Received image chat history:', data.generation_requests?.length || 0, 'requests')
      console.log('📚 Full chat history data:', data)
      
      // Process the generation requests and convert them to our format
      // Keep chronological order (oldest first, newest last)
      const processedHistory = (data.generation_requests || []).map((req, index) => ({
        id: req.id || `history_${index}`,
        prompt: req.prompt || 'No prompt',
        model: req.model_used || 'Unknown model',
        threadId: currentThreadId,
        timestamp: req.created_at || new Date().toISOString(),
        aspectRatio: req.aspect_ratio || '1:1',
        images: (req.messages || []).filter(msg => msg.image_url && msg.status === 'uploaded').map((msg, imgIndex) => ({
          id: msg.id || `img_${index}_${imgIndex}`,
          jobId: msg.job_id || `job_${index}_${imgIndex}`,
          index: imgIndex,
          url: msg.image_url || null,
          status: msg.status || 'completed',
          blob: null
        }))
      }))
      
      console.log('📚 Processed history:', processedHistory)
      setImageHistory(processedHistory)
      
      // Only clear current generation if it's not actively processing
      if (!currentGeneration || !currentGeneration.images?.some(img => img.status === 'processing')) {
        setCurrentGeneration(null)
        currentGenerationRef.current = null
      }
    } catch (err) {
      console.error('Error fetching image chat history:', err)
      setImageHistory([])
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

  // Fetch chat history on mount if threadId exists
  useEffect(() => {
    if (currentThreadId && !isStartingGenerationRef.current) {
      fetchChatHistory()
    }
  }, [])

  // Handle incoming image data with job_id
  const handleImageData = (binaryData) => {
    try {
      console.log('🖼️ Raw binary data received:', binaryData.byteLength, 'bytes')
      
      // Parse the binary message: jobID + "|" + contentType + "|" + binaryData
      const decoder = new TextDecoder()
      const messageStr = decoder.decode(binaryData.slice(0, Math.min(1024, binaryData.byteLength))) // Read first 1KB to find separators
      console.log('🖼️ Message header:', messageStr.substring(0, 200))
      
      // Find the separators
      const firstPipe = messageStr.indexOf('|')
      const secondPipe = messageStr.indexOf('|', firstPipe + 1)
      
      if (firstPipe === -1 || secondPipe === -1) {
        console.error('❌ Invalid message format - missing separators')
        return
      }
      
      const jobId = messageStr.substring(0, firstPipe)
      const contentType = messageStr.substring(firstPipe + 1, secondPipe)
      const binaryStart = secondPipe + 1
      
      console.log('🖼️ Parsed jobId:', jobId)
      console.log('🖼️ Parsed contentType:', contentType)
      console.log('🖼️ Binary data starts at byte:', binaryStart)
      
      // Extract just the binary image data (skip the text header)
      const imageDataStart = firstPipe + 1 + contentType.length + 1 // +1 for each pipe
      const imageBinaryData = binaryData.slice(imageDataStart)
      
      console.log('🖼️ Extracted image binary data:', imageBinaryData.byteLength, 'bytes')
      
      // Create blob from just the binary image data
      const blob = new Blob([imageBinaryData], { type: contentType })
      const imageUrl = URL.createObjectURL(blob)
      
      console.log('🖼️ Created blob:', blob.size, 'bytes, type:', blob.type)
      console.log('🖼️ Created blob URL:', imageUrl)
      
      // Test if the blob URL works by creating a test image
      const testImg = new Image()
      testImg.onload = () => console.log('✅ Test image loaded successfully from blob URL')
      testImg.onerror = () => console.error('❌ Test image failed to load from blob URL')
      testImg.src = imageUrl
      
      // Assign image to the correct jobId
      if (currentGenerationRef.current) {
        setCurrentGeneration(prev => {
          if (!prev) return prev
          
          // Find the image with matching jobId
          const updatedImages = prev.images.map(img => {
            if (img.jobId === jobId) {
              console.log('🖼️ Assigning image to jobId:', img.jobId, 'Current status:', img.status, 'URL:', imageUrl)
              return {
                ...img,
                url: imageUrl,
                status: 'completed',
                blob: blob
              }
            }
            return img
          })
          
          console.log('🖼️ Updated images:', updatedImages.map(img => ({ jobId: img.jobId, hasUrl: !!img.url, status: img.status })))
          
          const updatedGeneration = {
            ...prev,
            images: updatedImages
          }
          
          console.log('🖼️ Setting new generation state:', updatedGeneration.images.map(img => ({ jobId: img.jobId, hasUrl: !!img.url, status: img.status })))
          currentGenerationRef.current = updatedGeneration
          return updatedGeneration
        })
        
        // Check if all images are completed
        const allCompleted = currentGenerationRef.current?.images.every(img => img.status === 'completed')
        if (allCompleted && onGenerationComplete) {
          onGenerationComplete(currentGenerationRef.current)
        }
      }
    } catch (error) {
      console.error('❌ Error processing image data:', error)
    }
  }

  // Helper function to extract job_id from binary data (adjust based on your backend implementation)
  const extractJobIdFromData = (binaryData) => {
    // This is a placeholder - you'll need to implement this based on how your backend sends job_id
    // It could be in a header, as a prefix, or sent separately
    return `job_${Date.now()}` // Temporary fallback
  }

  // Handle status updates from WebSocket
  const handleStatusUpdate = (message) => {
    console.log('📊 Image status update:', message)
    
    if (currentGenerationRef.current && message.jobId) {
      setCurrentGeneration(prev => {
        if (!prev) return prev
        
        const updatedImages = prev.images.map(img => {
          if (img.jobId === message.jobId) {
            const updatedImg = {
              ...img,
              status: message.status || img.status // Keep existing status if no new status provided
            }
            
            console.log('📊 Status update for jobId:', message.jobId, 'Previous:', { status: img.status, hasUrl: !!img.url }, 'New:', { status: updatedImg.status, hasUrl: !!updatedImg.url })
            
            // If status is completed and no URL yet, set up fallback timer
            if (message.status === 'completed' && !img.url) {
              console.log('⏰ Setting up fallback timer for jobId:', message.jobId, 'Current image status:', img.status, 'Has URL:', !!img.url)
              setTimeout(() => {
                // Double check if image still doesn't have URL before fallback
                const currentImg = currentGenerationRef.current?.images.find(i => i.jobId === message.jobId)
                console.log('⏰ Fallback timer triggered for jobId:', message.jobId, 'Current image:', currentImg ? { hasUrl: !!currentImg.url, status: currentImg.status } : 'not found')
                
                if (currentImg && !currentImg.url) {
                  console.log('🔄 Image still missing, triggering fallback for jobId:', message.jobId)
                  fetchImageFallback(message.jobId)
                } else {
                  console.log('✅ Image already received via WebSocket, skipping fallback for jobId:', message.jobId)
                }
              }, 4000) // 4 seconds delay
            }
            
            return updatedImg
          }
          return img
        })
        
        return {
          ...prev,
          images: updatedImages
        }
      })
    }
  }

  // Fallback function to fetch image from API endpoint
  const fetchImageFallback = async (jobId) => {
    console.log('🔄 Fetching image fallback for jobId:', jobId)
    
    try {
      const response = await fetch(`https://api.tarum.ai/generation-service/Image/${jobId}`)
      
      if (!response.ok) {
        throw new Error(`Fallback fetch failed: ${response.status}`)
      }
      
      const blob = await response.blob()
      const imageUrl = URL.createObjectURL(blob)
      
      console.log('✅ Fallback image fetched successfully for jobId:', jobId)
      
      // Update the image in current generation
      if (currentGenerationRef.current) {
        setCurrentGeneration(prev => {
          if (!prev) return prev
          
          const updatedImages = prev.images.map(img => {
            if (img.jobId === jobId && !img.url) {
              return {
                ...img,
                url: imageUrl,
                status: 'completed',
                blob: blob
              }
            }
            return img
          })
          
          return {
            ...prev,
            images: updatedImages
          }
        })
      }
      
      // Check if all images are completed
      const allCompleted = currentGenerationRef.current?.images.every(img => img.status === 'completed')
      if (allCompleted && onGenerationComplete) {
        onGenerationComplete(currentGenerationRef.current)
      }
      
    } catch (error) {
      console.error('❌ Fallback image fetch failed for jobId:', jobId, error)
    }
  }

  // Start new image generation
  const startNewGeneration = useCallback((prompt, totalImages, modelUsed, jobIds, threadId, imageOptions = {}) => {
    console.log('🖼️ Starting new image generation:', { prompt, totalImages, modelUsed, jobIds, threadId, imageOptions })
    console.log('🖼️ JobIds received:', jobIds)
    console.log('🖼️ Total images:', totalImages)
    
    // Set flag to prevent history fetch from clearing current generation
    isStartingGenerationRef.current = true

    // Clear current generation and move to history if exists
    if (currentGenerationRef.current && currentGenerationRef.current.images.some(img => img.url)) {
      console.log('📚 Moving current generation to history')
      setImageHistory(prev => [currentGenerationRef.current, ...prev])
    }

    // Create new generation with image placeholders
    // Use totalImages if jobIds not provided yet
    const imageCount = jobIds ? jobIds.length : totalImages
    const newGeneration = {
      id: Date.now(),
      prompt,
      model: modelUsed,
      threadId,
      timestamp: new Date().toISOString(),
      aspectRatio: imageOptions.aspectRatio || '1:1',
      images: Array.from({ length: imageCount }, (_, index) => ({
        id: `${Date.now()}_${index}`,
        jobId: jobIds ? jobIds[index] : `placeholder_${Date.now()}_${index}`,
        index,
        url: null,
        status: 'processing',
        blob: null
      }))
    }

    setCurrentGeneration(newGeneration)
    currentGenerationRef.current = newGeneration
    
    // Connect to WebSocket for this generation
    console.log('🔌 Attempting to connect WebSocket for userId:', userId)
    connectWebSocket(userId)
    
    // Clear the flag after generation is set up
    setTimeout(() => {
      isStartingGenerationRef.current = false
    }, 100)

  }, [wsConnection, connectionStatus, connectWebSocket, userId])

  // Update ref when currentGeneration changes
  useEffect(() => {
    console.log('🔄 currentGeneration changed:', currentGeneration ? {
      prompt: currentGeneration.prompt,
      images: currentGeneration.images?.map(img => ({ url: img.url, status: img.status, jobId: img.jobId }))
    } : null)
    // Only update ref if currentGeneration is not null
    if (currentGeneration) {
      currentGenerationRef.current = currentGeneration
      
      // Auto-scroll to bottom when new generation is added
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight
        }
      }, 100)
    }
  }, [currentGeneration])

  // Auto-scroll to bottom when generations change
  useEffect(() => {
    const allGens = [
      ...imageHistory,
      ...(currentGeneration ? [currentGeneration] : [])
    ]
    
    if (containerRef.current && allGens.length > 0) {
      // Use multiple timing approaches to ensure scroll works
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight
        }
      }, 50)
      
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight
        }
      })
    }
  }, [imageHistory, currentGeneration])

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      cleanupWebSocket()
      // Clear image fallback timeout on cleanup
      if (imageFallbackTimeoutRef.current) {
        clearTimeout(imageFallbackTimeoutRef.current)
        imageFallbackTimeoutRef.current = null
      }
    }
  }, [cleanupWebSocket])

  // Expose function to parent
  useEffect(() => {
    if (onNewGeneration) {
      onNewGeneration(startNewGeneration)
    }
  }, [onNewGeneration, startNewGeneration])

  // Download image function
  const downloadImage = (imageBlob, filename = 'generated-image.jpg') => {
    if (!imageBlob) return
    
    const url = URL.createObjectURL(imageBlob)
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

  const handleSaveToCollection = (image) => {
    setSelectedImageForCollection({
      id: image.jobId || image.id,
      url: image.url,
      prompt: currentGeneration?.prompt || 'Generated image',
      like_count: 0
    })
    setShowSaveToCollection(true)
  }

  const handleCollectionSave = (collectionIds) => {
    console.log('💾 Image saved to collections:', collectionIds)
    setShowSaveToCollection(false)
    setSelectedImageForCollection(null)
  }

  // Combine current generation and history for display - oldest at top, newest at bottom
  const allGenerations = [
    ...imageHistory,  // API returns oldest first, so display in that order
    ...(currentGeneration ? [currentGeneration] : [])  // Current generation at bottom
  ];

  return (
    <div ref={containerRef} style={{ 
      flex: 1, 
      padding: '24px', 
      overflowY: 'auto', 
      overflowX: 'hidden', 
      background: 'transparent', 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%'
    }}>
      {loadingHistory ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#999',
          fontSize: '16px',
          fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textAlign: 'center'
        }}>
          <p>Loading chat history...</p>
        </div>
      ) : allGenerations.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#999',
          fontSize: '16px',
          fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textAlign: 'center',
          gap: '16px'
        }}>
          <p>No generations yet. Start by entering a prompt and clicking Generate!</p>
          {currentThreadId && (
            <button
              onClick={() => fetchChatHistory()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f5f5f5',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e9e9e9'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f5f5f5'}
            >
              Refresh History
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%'
        }}>
          {/* Spacer to push content to bottom when there's not enough content */}
          <div style={{ flex: 1 }}></div>
          {allGenerations.map((generation) => (
            <div key={generation.id} style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '32px'
            }}>
              {/* Prompt Section - Left */}
              <div style={{
                width: '320px',
                flexShrink: 0
              }}>
                <div style={{
                  background: '#F9EFEB99',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <p style={{
                    fontSize: '13px',
                    lineHeight: '1.5',
                    color: '#333',
                    margin: 0,
                    fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}>
                    {generation.prompt}
                  </p>
                  <div style={{
                    background: '#F9EFEB99',
                    padding: '6px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#666',
                    border: '1px solid #e0e0e0',
                    alignSelf: 'flex-start',
                    fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}>
                    <span>{generation.model}</span>
                  </div>
                </div>
              </div>

              {/* Images Grid - Right */}
              <div style={{
                flex: 1,
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                {generation.images?.map((img, idx) => {
                  console.log('🖼️ Rendering image:', idx, { jobId: img.jobId, hasUrl: !!img.url, status: img.status })
                  return (
                  <div key={img.id || idx} style={{
                    width: '200px',
                    height: '240px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'white',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    flexShrink: 0,
                    position: 'relative',
                    border: img.status === 'processing' || !img.url ? '2px dashed #e0e0e0' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (img.url) {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (img.url) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                    }
                  }}
                  >
                    {img.url ? (
                      <>
                        {console.log('🖼️ Rendering actual image with URL:', img.url)}
                        <img
                          src={img.url}
                          alt={`Generated ${idx + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'block',
                            objectFit: 'cover'
                          }}
                          onLoad={() => console.log('✅ Image loaded successfully:', img.url)}
                          onError={(e) => console.error('❌ Image failed to load:', img.url, e)}
                        />
                      </>
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f9f9f9',
                        border: '2px dashed #d0d0d0',
                        color: '#666'
                      }}>
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-2" />
                        <span style={{
                          fontSize: '12px',
                          fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}>
                          Generating...
                        </span>
                      </div>
                    )}
                    
                    {img.url && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                        e.currentTarget.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0)';
                        e.currentTarget.style.opacity = '0';
                      }}
                      >
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => downloadImage(img.blob, `image-${idx + 1}.jpg`)}
                            style={{
                              padding: '8px',
                              background: 'white',
                              borderRadius: '50%',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSaveToCollection(img)}
                            style={{
                              padding: '8px',
                              background: 'white',
                              borderRadius: '50%',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                          >
                            <Bookmark className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save to Collection Modal */}
      {showSaveToCollection && selectedImageForCollection && (
        <SaveToCollectionModal
          item={selectedImageForCollection}
          onSave={handleCollectionSave}
          onClose={() => setShowSaveToCollection(false)}
        />
      )}
    </div>
  )
}
