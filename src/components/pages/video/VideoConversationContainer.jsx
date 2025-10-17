'use client'

import MessageItem from "./MessageItem"
import { useState, useEffect, useRef, useCallback } from "react"
import { Sparkles } from "lucide-react"
import Image from "next/image"
import generationApi from "@/lib/api/generation"

export default function ConversationContainer({ currentThreadId, selectedGeneration, onSelectGeneration, onNewGeneration, onGenerationComplete }) {
  const [currentGeneration, setCurrentGeneration] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [wsConnection, setWsConnection] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const currentGenerationRef = useRef(null)
  const messagesEndRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const clearGenerationTimeoutRef = useRef(null)
  
  // Get Firebase ID dynamically
  const [firebaseId, setFirebaseId] = useState(null)
  const [recentlyCompletedPrompts, setRecentlyCompletedPrompts] = useState(new Set())

  // Get Firebase ID on component mount
  useEffect(() => {
    const getFirebaseId = async () => {
      try {
        const id = await generationApi.getFirebaseId()
        // TEMPORARY: Use hardcoded firebaseId for testing if dynamic one fails
        const finalId = id || 'QKMRjEnFcCfCCsiuOLTKrfHXz7x1' // From your console logs
        setFirebaseId(finalId)
        console.log('🔑 Firebase ID obtained:', finalId)
      } catch (error) {
        console.error('❌ Error getting Firebase ID, using hardcoded one:', error)
        // TEMPORARY: Fallback to hardcoded firebaseId
        setFirebaseId('QKMRjEnFcCfCCsiuOLTKrfHXz7x1')
      }
    }
    getFirebaseId()
  }, [])

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    const container = messagesEndRef.current?.parentElement;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentGeneration, scrollToBottom]);


  // Clean up WebSocket connection
  const cleanupWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (clearGenerationTimeoutRef.current) {
      clearTimeout(clearGenerationTimeoutRef.current)
      clearGenerationTimeoutRef.current = null
    }

    if (wsConnection) {
      console.log('Cleaning up WebSocket connection')
      wsConnection.close()
      setWsConnection(null)
      setIsConnected(false)
      setConnectionStatus('disconnected')
    }
  }, [wsConnection])

  // WebSocket connection function with improved error handling
  const connectWebSocket = useCallback((firebaseId) => {
    if (!firebaseId) {
      console.warn('Cannot connect WebSocket: no firebaseId provided')
      return
    }

    // Prevent multiple connection attempts for the same firebaseId
    if (wsConnection && (connectionStatus === 'connecting' || connectionStatus === 'connected')) {
      console.log('🔄 WebSocket connection already in progress or connected for firebaseId:', firebaseId)
      return
    }

    // Clean up existing connection
    cleanupWebSocket()

    setConnectionStatus('connecting')
    console.log('🔌 Connecting to WebSocket for firebaseId:', firebaseId)

    try {
      const ws = new WebSocket(`wss://api.tarum.ai/generation-service/ws?firebaseId=${firebaseId}`)
      //const ws = new WebSocket(`ws://localhost:8082/ws?firebaseId=${firebaseId}`)
      ws.binaryType = 'arraybuffer'
      console.log('🔧 WebSocket binaryType set to:', ws.binaryType)

      ws.onopen = () => {
        console.log('✅ WebSocket connected successfully for firebaseId:', firebaseId)
        setIsConnected(true)
        setConnectionStatus('connected')
      }

      ws.onmessage = (event) => {
        const dataSize = event.data.byteLength || event.data.size || event.data.length
        console.log('📡 WebSocket message received, type:', typeof event.data, 'instanceof ArrayBuffer:', event.data instanceof ArrayBuffer, 'instanceof Blob:', event.data instanceof Blob, 'size:', dataSize)
        
        // Log if this might be binary data
        if (dataSize > 100000) {
          console.log('🚨 LARGE MESSAGE DETECTED - This might be binary image data!', dataSize, 'bytes')
          console.log('🔍 Message type details:', {
            type: typeof event.data,
            isArrayBuffer: event.data instanceof ArrayBuffer,
            isBlob: event.data instanceof Blob,
            constructor: event.data.constructor.name,
            size: dataSize
          })
        }
        
        // Check if this is likely binary data (large message)
        if (dataSize > 1000000) { // > 1MB
          console.log('🚨 Large message detected! This is likely binary image data')
        }
        
        try {
          if (event.data instanceof ArrayBuffer) {
            // Handle binary image data
            console.log('📦 Binary ArrayBuffer data received:', event.data.byteLength, 'bytes')
            console.log('🔍 Binary data preview:', new Uint8Array(event.data.slice(0, 50))) // First 50 bytes
            handleImageData(event.data)
          } else if (event.data instanceof Blob) {
            // Handle binary data as Blob
            console.log('📦 Blob data received:', event.data.size, 'bytes')
            event.data.arrayBuffer().then(buffer => {
              console.log('📦 Converted blob to ArrayBuffer:', buffer.byteLength, 'bytes')
              console.log('🔍 Binary data preview:', new Uint8Array(buffer.slice(0, 50)))
              handleImageData(buffer)
            }).catch(err => {
              console.error('❌ Error converting blob to ArrayBuffer:', err)
            })
          } else if (typeof event.data === 'string') {
            // Check if this might be binary data disguised as string
            if (dataSize > 100000) { // > 100KB string is suspicious
              console.log('🚨 Large string message detected! Might be binary data as string')
              console.log('🚨 First 200 chars:', event.data.substring(0, 200))
              
              // Try to parse as JSON first
              try {
                const data = JSON.parse(event.data)
                console.log('📨 Large JSON status update:', data)
                handleStatusUpdate(data)
              } catch (jsonError) {
                console.log('🚨 Not JSON, treating as potential binary string data')
                // Try to convert string to binary
                try {
                  const binaryString = event.data
                  const bytes = new Uint8Array(binaryString.length)
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i) & 0xFF
                  }
                  console.log('🔄 Converted string to binary, processing...')
                  handleImageData(bytes.buffer)
                } catch (binaryError) {
                  console.error('❌ Failed to convert string to binary:', binaryError)
                }
              }
            } else {
              // Normal JSON status update
              try {
                const data = JSON.parse(event.data)
                console.log('📨 Status update:', data)
                handleStatusUpdate(data)
              } catch (parseError) {
                console.error('❌ Error parsing JSON:', parseError)
                console.log('Raw message data:', event.data.substring(0, 200))
              }
            }
          } else {
            console.log('🤔 Unknown data type:', typeof event.data, event.data)
          }
        } catch (error) {
          console.error('❌ Error processing WebSocket message:', error)
          console.log('Raw message data (first 200 chars):', event.data.toString().substring(0, 200))
        }
      }

    ws.onclose = (event) => {
      console.log('🔌 WebSocket disconnected, code:', event.code, 'reason:', event.reason)
      setIsConnected(false)
      setConnectionStatus('disconnected')

      // For multi-image generations, don't auto-reconnect immediately
      // as the server might still be sending messages
      if (currentGenerationRef.current && currentGenerationRef.current.images.some(img => img.status === 'processing' || img.status === 'queued')) {
        console.log('🔄 Multi-image generation in progress, delaying reconnection...')
        reconnectTimeoutRef.current = setTimeout(() => {
          if (currentGenerationRef.current && currentGenerationRef.current.images.some(img => img.status === 'processing' || img.status === 'queued')) {
            console.log('🔄 Still processing images, reconnecting...')
            connectWebSocket(firebaseId)
          }
        }, 5000) // Wait 5 seconds for multi-image processing
      } else if (event.code !== 1000 && event.code !== 1001) {
        console.log('🔄 Scheduling reconnection in 3 seconds...')
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket(firebaseId)
        }, 3000)
      }
    }

      ws.onerror = (error) => {
        const errorDetails = error || {}
        console.error('❌ WebSocket error:', {
          message: errorDetails.message || 'Unknown error',
          type: errorDetails.type || 'WebSocketError',
          target: errorDetails.target ? 'WebSocket connection' : 'Unknown target',
          timestamp: new Date().toISOString()
        })
        setIsConnected(false)
        setConnectionStatus('error')

        // Don't auto-reconnect on error to prevent connection storms
        console.log('🔌 Not auto-reconnecting due to error')
      }

      setWsConnection(ws)
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error)
      setConnectionStatus('error')
    }
  }, [cleanupWebSocket])

  // Handle incoming image data with job_id
  const handleImageData = (binaryData) => {
    console.log('🖼️ handleImageData called with:', binaryData.byteLength, 'bytes')
    console.log('🎯 Current generation exists:', !!currentGenerationRef.current)
    console.log('🎯 Current generation images:', currentGenerationRef.current?.images?.map(img => ({ jobId: img.jobId, status: img.status })))

    if (!currentGenerationRef.current) {
      console.log('❌ No current generation ref, ignoring image data')
      return
    }

    // Prevent duplicate processing by checking if we're already processing this data
    if (currentGenerationRef.current._processingImage) {
      console.log('⚠️ Already processing image data, skipping duplicate')
      return
    }

    // Set processing flag to prevent duplicates
    currentGenerationRef.current._processingImage = true

    try {
      // Convert binary data to Uint8Array for easier processing
      const uint8Array = new Uint8Array(binaryData)
    let separatorIndex = -1

    // Find the separator '|' in the binary data
    // We need to look for the byte value 124 (ASCII '|')
    for (let i = 0; i < uint8Array.length && i < 100; i++) { // Check first 100 bytes for job ID
      if (uint8Array[i] === 124) { // 124 is ASCII code for '|'
        separatorIndex = i
        break
      }
    }

    if (separatorIndex === -1) {
      console.log('No separator found, treating as old format')
      // Fallback to old format - replace first placeholder
      const blob = new Blob([binaryData], { type: 'image/png' })
      const imageUrl = URL.createObjectURL(blob)
      replaceFirstPlaceholder(imageUrl)
      return
    }

    // Extract job ID (text before separator)
    const jobIdBytes = uint8Array.slice(0, separatorIndex)
    const jobId = new TextDecoder().decode(jobIdBytes)
    // Extract image data (everything after separator)
    const imageDataBytes = uint8Array.slice(separatorIndex + 1)

    console.log('✅ Extracted job_id:', jobId, 'image data size:', imageDataBytes.byteLength)

    // Validate that we have image data
    if (imageDataBytes.byteLength === 0) {
      console.error('❌ No image data found after job ID extraction')
      return
    }

    // Validate that job ID is not empty
    if (!jobId || jobId.trim() === '') {
      console.error('❌ Empty or invalid job ID extracted')
      return
    }

    console.log('🔍 Looking for jobId in current images:', jobId)
    const currentImages = currentGenerationRef.current.images
    console.log('🔍 Available jobIds in current generation:', currentImages.map(img => img.jobId))
    const imageIndex = currentImages.findIndex(img => {
      const match = img.jobId === jobId
      console.log(`🔍 Comparing "${img.jobId}" === "${jobId}" => ${match}`)
      return match
    })
    console.log('🎯 Found image at index:', imageIndex)

    console.log('🔍 Image data first 20 bytes:', Array.from(imageDataBytes.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join(' '))
    
    // Find the PNG signature (89 50 4E 47) to get the actual image start
    let pngStart = 0
    for (let i = 0; i < imageDataBytes.length - 3; i++) {
      if (imageDataBytes[i] === 0x89 && imageDataBytes[i+1] === 0x50 && 
          imageDataBytes[i+2] === 0x4E && imageDataBytes[i+3] === 0x47) {
        pngStart = i
        break
      }
    }
    
    console.log('🎯 PNG data starts at byte:', pngStart)
    const actualImageData = imageDataBytes.slice(pngStart)
    console.log('📏 Actual image data size:', actualImageData.length, 'bytes')
    console.log('🔍 First 8 bytes of PNG:', Array.from(actualImageData.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' '))
    
    const blob = new Blob([actualImageData], { type: 'image/png' })
    const imageUrl = URL.createObjectURL(blob)
    console.log('Created image URL:', imageUrl)
    console.log('📊 Blob size:', blob.size, 'bytes, type:', blob.type)
    
    setCurrentGeneration(prev => {
      if (!prev) return null
      const newImages = [...prev.images]
      console.log('Current images:', newImages.map(img => ({ jobId: img.jobId, status: img.status })))

      // Find specific image by jobId and replace it
      const imageIndex = newImages.findIndex(img => img.jobId === jobId)
      console.log('Looking for jobId:', jobId, 'found at index:', imageIndex)

      if (imageIndex !== -1) {
        // Check if this image already has a URL to prevent duplicate processing
        if (newImages[imageIndex].url && newImages[imageIndex].url !== null && newImages[imageIndex].url !== '/placeholder-loading.png') {
          console.log('⚠️ Image already has URL, skipping duplicate processing:', jobId)
          return prev // Don't process the same image twice
        }
        
        newImages[imageIndex] = {
          ...newImages[imageIndex],
          url: imageUrl,
          status: 'completed'
        }
        console.log('✅ Replaced image at index', imageIndex, 'with jobId', jobId)
        
        // Check if this was the last image needed
        const updatedGeneration = {
          ...prev,
          images: newImages
        }
        const allImagesHaveUrls = newImages.every(img => img.url && img.url !== null)
        
        if (allImagesHaveUrls) {
          console.log('🎉 All images received via WebSocket - clearing current generation after delay')
          
          // DON'T clear current generation automatically - let it stay visible
          // Only clear when a new generation starts
          console.log('🎉 All images received via WebSocket - keeping generation visible')
        }
      } else {
        console.log('❌ JobId not found in current images, available jobIds:', newImages.map(img => img.jobId))
        console.log('🔄 Replacing first available image slot as fallback')
        // Fallback: replace first image without URL (null or placeholder)
        const availableIndex = newImages.findIndex(img => img.url === null || img.url === '/placeholder-loading.png')
        if (availableIndex !== -1) {
          newImages[availableIndex] = {
            ...newImages[availableIndex],
            url: imageUrl,
            status: 'completed',
            jobId: jobId // Update the jobId as well
          }
          console.log('✅ Replaced image slot at index', availableIndex, 'with jobId', jobId)
        } else {
          console.log('❌ No available image slot found to replace')
        }
      }
      
      // Clear processing flag
      if (currentGenerationRef.current) {
        currentGenerationRef.current._processingImage = false
      }
      
      return {
        ...prev,
        images: newImages,
      }
    })
    } catch (error) {
      console.error('❌ Error processing image data:', error)
      // Clear processing flag on error
      if (currentGenerationRef.current) {
        currentGenerationRef.current._processingImage = false
      }
    }
  }

  // Helper function to replace first placeholder (fallback)
  const replaceFirstPlaceholder = (imageUrl) => {
    setCurrentGeneration(prev => {
      if (!prev) return null
      const newImages = [...prev.images]
      const availableIndex = newImages.findIndex(img => img.url === null || img.url === '/placeholder-loading.png')
      if (availableIndex !== -1) {
        newImages[availableIndex] = {
          ...newImages[availableIndex],
          url: imageUrl,
          status: 'completed'
        }
        console.log('✅ Replaced first available image slot at index', availableIndex)
      }
      return {
        ...prev,
        images: newImages
      }
    })
  }

  // Handle status updates
  const handleStatusUpdate = (data) => {
    console.log('📡 WebSocket status update:', data)

    if (!currentGenerationRef.current) return

    // Prevent duplicate processing of the same status update
    const status = data.status || data.stage || 'unknown'
    const statusKey = `${data.job_id}_${status}_${data.timestamp || Date.now()}`
    if (currentGenerationRef.current._processedStatuses?.has(statusKey)) {
      console.log('⚠️ Duplicate status update ignored:', statusKey)
      return
    }

    // Also check if we've already processed this exact status for this job recently
    const recentKey = `${data.job_id}_${status}`
    if (currentGenerationRef.current._recentStatuses?.has(recentKey)) {
      console.log('⚠️ Recent duplicate status ignored:', recentKey)
      return
    }

    // Track processed status updates
    if (!currentGenerationRef.current._processedStatuses) {
      currentGenerationRef.current._processedStatuses = new Set()
    }
    if (!currentGenerationRef.current._recentStatuses) {
      currentGenerationRef.current._recentStatuses = new Set()
    }
    
    currentGenerationRef.current._processedStatuses.add(statusKey)
    currentGenerationRef.current._recentStatuses.add(recentKey)
    
    // Clear recent statuses after 5 seconds to allow legitimate status changes
    setTimeout(() => {
      if (currentGenerationRef.current?._recentStatuses) {
        currentGenerationRef.current._recentStatuses.delete(recentKey)
      }
    }, 5000)
    
    console.log('✅ Processing new status update:', statusKey)

    // Update generation status in a single setState call to prevent duplicates
    setCurrentGeneration(prev => {
      if (!prev) return null

      const newImages = [...prev.images]
      let hasChanges = false

      // Update the specific image that this status update is for
      if (data.job_id) {
        const imageIndex = newImages.findIndex(img => img.jobId === data.job_id)
        if (imageIndex !== -1) {
          const currentImg = newImages[imageIndex]
          let newStatus = currentImg.status
          
          if (data.status === 'started' || data.stage === 'processing' || data.stage === 'started') {
            newStatus = 'processing'
          } else if (data.status === 'completed' || data.stage === 'completed' || data.completed === true) {
            newStatus = 'completed'
          } else if (data.status === 'failed' || data.error) {
            newStatus = 'failed'
          } else if (data.status === 'queued') {
            newStatus = 'queued'
          }
          
          // Only update if status actually changed
          if (newStatus !== currentImg.status) {
            newImages[imageIndex] = { ...currentImg, status: newStatus }
            hasChanges = true
            console.log('Updating image', imageIndex, 'to status:', newStatus, 'preserving URL:', currentImg.url)
          }
        }
      }

      // Determine overall status based on ALL images
      const completedCount = newImages.filter(img => img.status === 'completed').length
      const processingCount = newImages.filter(img => img.status === 'processing').length
      const failedCount = newImages.filter(img => img.status === 'failed').length
      const totalImages = newImages.length

      let overallStatus = 'queued'
      if (processingCount > 0 || (completedCount > 0 && completedCount < totalImages)) {
        overallStatus = 'processing'
      } else if (completedCount === totalImages && failedCount === 0) {
        overallStatus = 'completed'
      } else if (failedCount > 0) {
        overallStatus = 'failed'
      }

      console.log(`Status update: ${completedCount}/${totalImages} completed, ${processingCount} processing, overall: ${overallStatus}`)

      // Only update state if there are actual changes
      if (!hasChanges && prev.status === overallStatus) {
        console.log('⚠️ No changes detected, skipping state update')
        return prev
      }

      // Trigger completion callback when generation is fully done
      if (overallStatus === 'completed' && prev.status !== 'completed' && onGenerationComplete) {
        console.log('Generation completed, triggering refresh callback')

        setTimeout(() => {
          onGenerationComplete()
        }, 500) // Small delay to ensure all updates are processed
        
        // Add fallback: if no binary data received after 10 seconds, try HTTP fetch
        setTimeout(() => {
          if (currentGenerationRef.current && 
              currentGenerationRef.current.status === 'completed' &&
              currentGenerationRef.current.images.some(img => img.url === null)) {
            console.log('🔄 No binary data received, attempting HTTP fallback...')
            
            // Try to fetch image via HTTP as fallback
            const jobId = currentGenerationRef.current.jobIds[0]
            if (jobId) {
              console.log('🔄 Attempting HTTP fetch for jobId:', jobId)
              fetch(`http://localhost:8000/api/images/${jobId}`)
                .then(response => {
                  if (response.ok) {
                    return response.blob()
                  }
                  throw new Error(`HTTP ${response.status}`)
                })
                .then(blob => {
                  const imageUrl = URL.createObjectURL(blob)
                  console.log('✅ HTTP fallback successful, image URL:', imageUrl)
                  
                  // Update the current generation with the image
                  setCurrentGeneration(prev => {
                    if (!prev) return null
                    const newImages = [...prev.images]
                    newImages[0] = { ...newImages[0], url: imageUrl, status: 'completed' }
                    return { ...prev, images: newImages }
                  })
                })
                .catch(error => {
                  console.error('❌ HTTP fallback failed:', error)
                })
            }
          }
        }, 3000) // 3 second delay for HTTP fallback - improved UX
      }

      return {
        ...prev,
        images: newImages,
        status: overallStatus
      }
    })
  }

  // Fetch chat history
  const fetchChatHistory = async () => {
    if (!currentThreadId) {
      setChatHistory([])
      return
    }

    setLoadingHistory(true)
    try {
      console.log('📚 Fetching chat history for thread:', currentThreadId)
      const response = await fetch(`https://api.tarum.ai/generation-service/conversations/${currentThreadId}`)
      // const response = await fetch(`https://api.tarum.ai/generation-service/conversations/${currentThreadId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch chat history: ${response.status}`)
      }

      const data = await response.json()
      console.log('📚 Received chat history:', data.generation_requests?.length || 0, 'requests')
      console.log('the chat istory: ', data.generation_requests)
      setChatHistory(data.generation_requests || [])
    } catch (err) {
      console.error('Error fetching chat history:', err)
      setChatHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }

  // Fetch chat history when threadId or refreshTrigger changes
  useEffect(() => {
    fetchChatHistory()
    // Scroll to bottom when chat history is refreshed
    setTimeout(() => scrollToBottom(), 100)
  }, [currentThreadId, scrollToBottom])



  // Start new generation
  const startNewGeneration = (prompt, totalImages, modelUsed, jobIds, threadId) => {
    console.log('🎬 Starting new generation with jobIds:', jobIds)

    // Prevent duplicate generations with the same prompt
    if (currentGeneration && currentGeneration.prompt === prompt && (currentGeneration.status === 'processing' || currentGeneration.status === 'queued')) {
      console.log('⚠️ Generation with same prompt already in progress, ignoring duplicate request')
      return
    }

    // Clear any existing timeout
    if (clearGenerationTimeoutRef.current) {
      clearTimeout(clearGenerationTimeoutRef.current)
      clearGenerationTimeoutRef.current = null
    }

    // Log if there's an existing generation in progress
    if (currentGeneration && currentGeneration.status === 'processing') {
      console.log('⚠️ Starting new generation while another is in progress - clearing previous one')
    }

    // Clear previous generation when starting a new one (it will appear in history)
    if (currentGeneration) {
      console.log('🔄 Clearing previous generation to start new one (will appear in chat history)')
      
      // Add previous generation to recently completed prompts to prevent duplication
      const prevPrompt = currentGeneration.prompt
      setRecentlyCompletedPrompts(prev => {
        const newSet = new Set(prev)
        newSet.add(prevPrompt)
        console.log('📝 Added previous generation to recently completed prompts:', prevPrompt)
        return newSet
      })
      
      // Remove from recently completed after 2 minutes (balanced approach)
      setTimeout(() => {
        setRecentlyCompletedPrompts(prev => {
          const newSet = new Set(prev)
          newSet.delete(prevPrompt)
          console.log('🗑️ Removed from recently completed prompts:', prevPrompt)
          return newSet
        })
      }, 120000) // 2 minutes - balanced between preventing duplication and allowing history
    }

    // Clear current generation state
    setCurrentGeneration(null)
    currentGenerationRef.current = null

    // Generate job IDs if not provided (for single image requests)
    const finalJobIds = jobIds || Array(totalImages).fill(null).map((_, index) =>
      totalImages === 1 ? `job_${Date.now()}` : `job_${Date.now()}_image_${index}`
    )

    let newGeneration = {
      id: Date.now(),
      prompt,
      model: modelUsed,
      images: Array(totalImages).fill(null).map((_, index) => ({
        url: null, // Start with null, WebSocket will update with blob URL
        status: 'queued',
        jobId: finalJobIds[index] || `job_${Date.now()}_${index}`,
        index: index
      })),
      jobIds: finalJobIds,
      status: 'queued',
      state: 'current',
      _processedStatuses: new Set(), // Track processed status updates
      _recentStatuses: new Set(), // Track recent status updates to prevent duplicates
      _processingImage: false // Track image processing
    }
    
    console.log('Created generation with images:', newGeneration.images)
    
    // Set both state and ref immediately
    setCurrentGeneration(newGeneration)
    currentGenerationRef.current = newGeneration

    // Set a timeout to clear stuck generations (5 minutes)
    clearGenerationTimeoutRef.current = setTimeout(() => {
      if (currentGenerationRef.current && currentGenerationRef.current.status === 'processing') {
        console.log('⏰ Generation timeout reached, clearing stuck generation')
        setCurrentGeneration(null)
        currentGenerationRef.current = null
      }
    }, 5 * 60 * 1000) // 5 minutes

    // Update chatHistory with the new generation
    // setChatHistory(prevHistory => [newGeneration, ...prevHistory]);
    // console.log("@@@@@@@@@@@@@@@@@  updated chat history: " , chatHistory)

    // Scroll to top to show the new generation
    setTimeout(() => scrollToBottom(), 100)
    
    // Connect WebSocket immediately - no delay needed
    // Only connect if we don't already have a connection for this firebaseId
    if (!wsConnection || connectionStatus === 'disconnected' || connectionStatus === 'error') {
      console.log('🔌 Connecting new WebSocket for generation')
      connectWebSocket(firebaseId)
    } else {
      console.log('🔄 Reusing existing WebSocket connection for firebaseId:', firebaseId)
    }

  }

  // Update ref when currentGeneration changes
  useEffect(() => {
    console.log('🔄 currentGeneration changed:', currentGeneration)

    currentGenerationRef.current = currentGeneration
    
  //   {
  //   "id": 1757854919683,
  //   "prompt": "1",
  //   "model": "img2img-v1",
  //   "images": [
  //       {
  //           "url": "blob:http://localhost:3000/ac2adf1a-bd16-4017-ba56-0c9e102c8fe2",
  //           "status": "completed",
  //           "jobId": "job_3c739ff3-df2a-4324-9204-0eed754e461e",
  //           "index": 0
  //       }
  //   ],
  //   "jobIds": [
  //       "job_3c739ff3-df2a-4324-9204-0eed754e461e"
  //   ],
  //   "status": "completed"
  // }

    setChatHistory(prevHistory => {
      // If there's a current generation, ensure it's at the top of the history
      if (currentGeneration) {
        // Remove any existing instance of the current generation from history
        const filteredHistory = prevHistory.filter(item => item.id !== currentGeneration.id)
        return [...filteredHistory, currentGeneration]
      }
      return prevHistory
    })

  }, [currentGeneration])

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      cleanupWebSocket()
      // Clear any pending timeouts
      if (clearGenerationTimeoutRef.current) {
        clearTimeout(clearGenerationTimeoutRef.current)
      }
    }
  }, [cleanupWebSocket])

  // Connect WebSocket on component mount based on firebaseId
  useEffect(() => {
    if (firebaseId && connectionStatus === 'disconnected') {
      connectWebSocket(firebaseId)
    }
  }, [firebaseId, connectionStatus, connectWebSocket])

  // Expose function to parent
  useEffect(() => {
    if (onNewGeneration) {
      onNewGeneration(startNewGeneration)
    }
  }, [onNewGeneration, startNewGeneration])


  function transformData(input) {
    return input.map((item) => {
      const message = item.messages?.[0] || {};
      return {
        id: item.id, // keep backend ID
        prompt: item.prompt,
        model: item.model_used,
        images: item.messages.map((msg, idx) => ({
          url: null, // we’ll fill with blob later if needed
          status: msg.status,
          jobId: msg.job_id,
          index: idx,
        })),
        jobIds: item.messages.map(msg => msg.job_id),
        status: item.messages.every(msg => msg.status === "completed")
          ? "completed"
          : "processing",
        created_at: item.created_at,
      };
    });
  }


  return (
    <div className="flex flex-col h-[80vh]">
      
      {/* Connection Status Indicator */}
      {connectionStatus !== 'connected' && (
        <div className={`px-6 py-3 text-sm font-medium rounded-lg mx-6 mt-6 ${
          connectionStatus === 'connecting' ? 'bg-[#f9f3f0] text-purple-700 border border-purple-200' :
          connectionStatus === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-[#f9f3f0] text-gray-700 border border-gray-200'
        }`}>
          {connectionStatus === 'connecting' && '🔄 Connecting to server...'}
          {connectionStatus === 'error' && '❌ Connection error - retrying...'}
          {connectionStatus === 'disconnected' && '📡 Disconnected from server'}
        </div>
      )}

      {/* Main Content Area - Unified Chat Flow */}
      {/* <div className="flex-1 overflow-y-auto px-6 pb-6 border-t border-black"> */}
      <div className=" overflow-auto border-black">
        {/* Loading chat history */}
        {loadingHistory && chatHistory.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading chat history...</p>
            </div>
          </div>
        )}

        

        {/* Chat History - Historical Generations (reverse order so newest are at top) */}
        
        {chatHistory.slice()
          .filter((request, index) => {
            // If we have a current generation, filter out matching history items to prevent duplication
            if (currentGeneration) {
              // Method 1: Check if jobIds match
              const hasMatchingJobIds = 
                request.jobIds?.some(jobId => currentGeneration.jobIds?.includes(jobId)) ||
                request.messages?.some(msg => currentGeneration.jobIds?.includes(msg.job_id))
              
              if (hasMatchingJobIds) {
                console.log('🚫 Filtering out history item with matching jobIds:', request.prompt, 'jobIds:', request.jobIds || request.messages?.map(m => m.job_id))
                return false
              }
              
              // Method 2: Check if prompt matches AND it's very recent (within last 15 seconds)
              if (request.prompt === currentGeneration.prompt && request.created_at) {
                const createdTime = new Date(request.created_at).getTime()
                const currentTime = Date.now()
                const timeDiff = currentTime - createdTime
                
                if (timeDiff < 15000) { // Increased to 15 seconds for safety
                  console.log('🚫 Filtering out recent history item (timing protection):', request.prompt, 'age:', timeDiff + 'ms')
                  return false
                }
              }
              
              // Method 3: For new threads, filter out the most recent entry with same prompt
              if (request.prompt === currentGeneration.prompt && index === 0) {
                console.log('🚫 Filtering out most recent history item with same prompt:', request.prompt)
                return false
              }
            }
            
            // Method 4: Smart filtering for recently completed prompts
            if (recentlyCompletedPrompts.has(request.prompt)) {
              // Only filter out if this is a partial/incomplete entry or very recent duplicate
              const isPartialEntry = request.messages?.some(msg => msg.status !== 'completed') || 
                                   request.messages?.every(msg => !msg.image_url)
              
              const isVeryRecent = request.created_at && 
                                 (Date.now() - new Date(request.created_at).getTime()) < 60000 // Less than 1 minute old
              
              if (isPartialEntry || isVeryRecent) {
                console.log('🚫 Filtering out recently completed partial/recent entry:', request.prompt, 'isPartial:', isPartialEntry, 'isVeryRecent:', isVeryRecent)
                return false
              } else {
                console.log('✅ Allowing completed history entry (legitimate history):', request.prompt)
              }
            }
            
            return true
          })
          .map((request, index) => (
            request.state === 'current' ? (
              <div key={`history-${request.id}-${index}`} className="mb-8">
                <MessageItem
                  key={request.id}
                  prompt={request.prompt}
                  model={request.model}
                  status={request.status}
                  timestamp={new Date()}
                  images={request.images}
                  isGenerating={request.status === 'processing'}
                  isHistorical={true}
                />
              </div>
            ) : (
              <div key={`history-${request.id}-${index}`} className="mb-8">
                <MessageItem
                  prompt={request.prompt}
                  model={request.model_used}
                  status={request.messages?.every(msg => msg.status === 'completed') ? 'completed' : 'partial'}
                  timestamp={new Date(request.created_at)}
                  images={(request.messages || []).map((msg, msgIndex) => {
                    const imageUrl = msg.image_url || (msg.status === 'completed' ? `http://localhost:8000/api/images/${msg.job_id}` : null);
                    console.log(`🖼️ History image for ${msg.job_id}: image_url=${msg.image_url}, fallback=${imageUrl}, status=${msg.status}`);
                    return {
                      url: imageUrl,
                      status: msg.status,
                      jobId: msg.job_id,
                      index: msgIndex
                    };
                  })}
                  isGenerating={false}
                  isHistorical={true}
                />
              </div>
            )
          ))}

        {/* Current Generation - Active Generation - Show first (newest) */}
        {currentGeneration && (
          <div className="mb-8">
            <MessageItem
              key={currentGeneration.id}
              prompt={currentGeneration.prompt}
              model={currentGeneration.model}
              status={currentGeneration.status}
              timestamp={new Date()}
              images={currentGeneration.images}
              isGenerating={currentGeneration.status === 'processing'}
              isHistorical={false}
            />
          </div>
        )}

        {/* Empty state - only show when no chat history and no current generation */}
        {!loadingHistory && chatHistory.length === 0 && !currentGeneration && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#faf7f4] to-[#f9f3f0] rounded-full flex items-center justify-center mb-4 border-2 border-[#C15F3C]/20">
              <Image 
                src="/icons/video.png" 
                alt="Video" 
                width={32} 
                height={32}
                className="opacity-80 animate-pulse"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ready to Generate</h3>
            <p className="text-gray-500 max-w-sm">
              Enter a prompt on the left and click "Generate Video" to create amazing videos with AI.
            </p>
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}