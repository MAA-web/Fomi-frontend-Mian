"use client"

import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Compare } from '@/components/ui/compare'
import { Code, Download, RefreshCw } from 'lucide-react'
import EnhanceHistory from './EnhanceHistory'

const EnhanceContainer = forwardRef(function EnhanceContainer({
  originalImage,
  currentThreadId,
  userId,
  onEnhanceComplete,
  historyRefreshTrigger,
  onRefreshHistory
}, ref) {
  const [enhancedImage, setEnhancedImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState('') // Track status updates
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [currentEnhancement, setCurrentEnhancement] = useState(null)
  
  const wsRef = useRef(null)
  const binaryDataReceivedRef = useRef(false)
  const httpFallbackTimeoutRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const connectionAttemptsRef = useRef(0)
  const maxConnectionAttempts = 5
  // historyRefreshTrigger is now passed as prop from parent


  // Reset enhanced image when original image changes
  useEffect(() => {
    if (originalImage) {
      setEnhancedImage(null)
      setIsProcessing(false)
      setProcessingStatus('')
      setCurrentEnhancement(null)
      
      // Reset binary data flag and clear any existing timeout
      binaryDataReceivedRef.current = false
      if (httpFallbackTimeoutRef.current) {
        clearTimeout(httpFallbackTimeoutRef.current)
        httpFallbackTimeoutRef.current = null
      }
    }
  }, [originalImage])

  // WebSocket connection management
  const connectWebSocket = useCallback((firebaseId) => {
    if (!firebaseId) {
      console.error('❌ No firebaseId provided for WebSocket connection')
      return
    }
    
    // If WebSocket is already open, don't create a new one
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('🔌 WebSocket already connected, reusing existing connection')
      return
    }
    
    // If WebSocket is connecting, don't create a new one
    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log('🔌 WebSocket already connecting, waiting for connection')
      return
    }

    try {
      console.log('🔌 Creating new WebSocket connection for firebaseId:', firebaseId)
      wsRef.current = new WebSocket(`wss://api.tarum.ai/generation-service/ws?firebaseId=${firebaseId}`)
      wsRef.current.binaryType = 'arraybuffer'

      wsRef.current.onopen = () => {
        console.log('✅ Enhance WebSocket connected successfully')
        setConnectionStatus('connected')
        connectionAttemptsRef.current = 0
      }

      wsRef.current.onmessage = async (event) => {
        console.log('📡 Enhance WebSocket message received:', typeof event.data, event.data instanceof ArrayBuffer ? 'ArrayBuffer' : event.data instanceof Blob ? 'Blob' : 'String')
        
        if (event.data instanceof ArrayBuffer) {
          // Binary data - enhanced image
          handleEnhancedImageData(event.data)
        } else if (event.data instanceof Blob) {
          // Binary data as Blob - convert to ArrayBuffer
          const arrayBuffer = await event.data.arrayBuffer()
          handleEnhancedImageData(arrayBuffer)
        } else if (typeof event.data === 'string') {
          // Check if this might be binary data disguised as string
          if (event.data.length > 100000) { // > 100KB string is suspicious
            // Try to parse as JSON first
            try {
              const data = JSON.parse(event.data)
              handleStatusUpdate(data)
            } catch (jsonError) {
              // Try to convert string to binary
              try {
                const binaryString = event.data
                const bytes = new Uint8Array(binaryString.length)
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i) & 0xFF
                }
                handleEnhancedImageData(bytes.buffer)
              } catch (binaryError) {
                console.error('❌ Failed to convert string to binary:', binaryError)
              }
            }
          } else {
            // Normal JSON status update
            try {
              const data = JSON.parse(event.data)
              handleStatusUpdate(data)
            } catch (parseError) {
              console.error('❌ Error parsing JSON:', parseError)
            }
          }
        }
      }

      wsRef.current.onclose = (event) => {
        console.log('🔌 Enhance WebSocket closed:', event.code, event.reason)
        setConnectionStatus('disconnected')
        
        // Reconnect if not a clean closure and we haven't exceeded max attempts
        if (event.code !== 1000 && connectionAttemptsRef.current < maxConnectionAttempts) {
          connectionAttemptsRef.current++
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000)
        }
      }

      wsRef.current.onerror = (error) => {
        console.error('❌ Enhance WebSocket error:', error)
        setConnectionStatus('error')
      }

    } catch (error) {
      console.error('❌ Error creating enhance WebSocket connection:', error)
      setConnectionStatus('error')
    }
  }, [])

  const cleanupWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Component cleanup')
      wsRef.current = null
    }
  }, [])

  const handleSelectEnhancement = (enhancement) => {
    console.log('Selected enhancement from history:', enhancement)
  }

  const startEnhancement = useCallback(async (imageFile, options = {}) => {
    try {
      setIsProcessing(true)
      setProcessingStatus('Uploading image...')
      setEnhancedImage(null)
      
      // Reset binary data flag and clear any existing timeout
      binaryDataReceivedRef.current = false
      if (httpFallbackTimeoutRef.current) {
        clearTimeout(httpFallbackTimeoutRef.current)
        httpFallbackTimeoutRef.current = null
      }

      // Convert image file to base64
      const imageBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          // Remove the data:image/...;base64, prefix
          const base64 = reader.result.split(',')[1]
          resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(imageFile)
      })

      // Make API call to Go backend
      const response = await fetch('https://api.tarum.ai/generation-service/generate/async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: options.prompt || 'upscale image', // Use provided prompt or default
          modelUsed: options.modelUsed || 'image2image', // Use selected model from options
          page: 'Enhance', // Page parameter for backend tracking
          firebaseId: userId, // Use dynamic firebaseId from props
          jobType: 'image_to_image',
          ...(options.modelParams && { modelParams: options.modelParams }), // Include modelParams if provided
          ...(currentThreadId && { threadId: currentThreadId }), // Use threadId from URL if available
          uploadedImage: {
            data: imageBase64
          }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // Store current enhancement info and connect WebSocket
      const enhancementData = {
        id: Date.now(),
        jobId: result.jobId,
        individualJobIds: result.individualJobIds || [result.jobId],
        threadId: result.threadId,
        originalImage,
        options,
        status: 'processing'
      }
      
      setCurrentEnhancement(enhancementData)
      
      // Connect WebSocket with firebaseId
      console.log('🔌 Connecting WebSocket for enhancement with userId:', userId)
      connectWebSocket(userId)

      return result

    } catch (error) {
      console.error('❌ Error starting enhancement:', error)
      setIsProcessing(false)
      throw error
    }
  }, [originalImage, currentEnhancement, connectWebSocket, userId])

  // Note: WebSocket connection is now only established when startEnhancement is called
  // This prevents multiple connections and ensures binary data is not missed

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return cleanupWebSocket
  }, [cleanupWebSocket])

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    startEnhancement
  }), [startEnhancement])

  const handleEnhancedImageData = useCallback((arrayBuffer) => {
    try {
      const uint8Array = new Uint8Array(arrayBuffer)

      // Find job_id separator (|)
      let separatorIndex = -1
      for (let i = 0; i < uint8Array.length; i++) {
        if (uint8Array[i] === 124) { // 124 = '|'
          separatorIndex = i
          break
        }
      }

      if (separatorIndex === -1) {
        console.error('❌ No separator found in binary data')
        return
      }

      // Extract job_id and image data
      const jobIdBytes = uint8Array.slice(0, separatorIndex)
      const imageDataBytes = uint8Array.slice(separatorIndex + 1)
      const jobId = new TextDecoder().decode(jobIdBytes)

      // Find PNG signature and create blob
      let pngStart = 0
      for (let i = 0; i < imageDataBytes.length - 3; i++) {
        if (imageDataBytes[i] === 0x89 && imageDataBytes[i+1] === 0x50 && 
            imageDataBytes[i+2] === 0x4E && imageDataBytes[i+3] === 0x47) {
          pngStart = i
          break
        }
      }

      const actualImageData = imageDataBytes.slice(pngStart)
      const blob = new Blob([actualImageData], { type: 'image/png' })
      const imageUrl = URL.createObjectURL(blob)
      setEnhancedImage(imageUrl)
      setIsProcessing(false)
      setProcessingStatus('') // Clear status
      
      // Mark that binary data was received and clear HTTP fallback timeout
      binaryDataReceivedRef.current = true
      if (httpFallbackTimeoutRef.current) {
        clearTimeout(httpFallbackTimeoutRef.current)
        httpFallbackTimeoutRef.current = null
      }
      
      // Refresh history after enhancement completes
      console.log('🔄 Triggering history refresh after enhancement completion')
      onRefreshHistory && onRefreshHistory()
      
      if (onEnhanceComplete) {
        onEnhanceComplete(imageUrl)
      }

    } catch (error) {
      console.error('❌ Error processing enhanced image data:', error)
      setIsProcessing(false)
    }
  }, [onEnhanceComplete])

  const handleStatusUpdate = useCallback((data) => {
    console.log('📨 Enhance status update received:', data)
    
    // Handle different status types
    if (data.status === 'processing' || data.stage) {
      setIsProcessing(true)
      
      // Use stage if available, otherwise use a generic message
      if (data.stage) {
        setProcessingStatus(data.stage)
      } else if (data.message) {
        setProcessingStatus(data.message)
      } else {
        setProcessingStatus('Processing your image...')
      }
    } else if (data.status === 'completed' || data.completed === true) {
      setProcessingStatus('Finalizing upscale...')
      
      // Clear any existing timeout
      if (httpFallbackTimeoutRef.current) {
        clearTimeout(httpFallbackTimeoutRef.current)
      }
      
      // Add HTTP fallback: if no binary data received after 1 second, try HTTP fetch
      httpFallbackTimeoutRef.current = setTimeout(() => {
        if (!binaryDataReceivedRef.current) {
          // Try to fetch image via HTTP as fallback
          const jobId = currentEnhancement?.jobId
          if (jobId) {
            fetch(`http://localhost:8000/api/images/${jobId}`)
              .then(response => {
                if (response.ok) {
                  return response.blob()
                }
                throw new Error(`HTTP ${response.status}`)
              })
              .then(blob => {
                // Double-check that binary data wasn't received in the meantime
                if (!binaryDataReceivedRef.current) {
                  const imageUrl = URL.createObjectURL(blob)
                  setEnhancedImage(imageUrl)
                  setIsProcessing(false)
                  setProcessingStatus('') // Clear status
                  
                  // Refresh history after HTTP fallback completion
                  console.log('🔄 Triggering history refresh after HTTP fallback')
                  onRefreshHistory && onRefreshHistory()
                  
                  // Notify parent component
                  if (onEnhanceComplete) {
                    onEnhanceComplete(imageUrl)
                  }
                }
              })
              .catch(error => {
                console.error('❌ HTTP fallback failed:', error)
                setIsProcessing(false)
              })
          }
        }
      }, 1000) // 1 second delay for HTTP fallback
    } else if (data.status === 'error') {
      console.error('❌ Enhancement error:', data.message)
      setIsProcessing(false)
    }
  }, [isProcessing, enhancedImage, currentEnhancement, onEnhanceComplete])

  const downloadImage = useCallback((imageUrl, filename = 'enhanced-image.png') => {
    if (!imageUrl) return
    
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  const EnhanceHistoryTrigger = useCallback(() => {
    sethistoryRefreshTrigger(prev => prev + 1)
    console.log('Enhance history refresh triggered')
  }, [])

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-auto flex flex-col">
      {/* Connection Status - Only show when processing or when there's an actual connection issue */}
      {(connectionStatus !== 'connected' && connectionStatus !== 'disconnected') && (
        <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200">
          <div className="text-sm text-yellow-800">
            {connectionStatus === 'connecting' && '🔄 Connecting to enhancement service...'}
            {connectionStatus === 'error' && '❌ Connection error - retrying...'}
          </div>
        </div>
      )}

      {/* Header with action buttons */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Image Enhancement</h2>
        <div className="flex gap-2">
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Code className="w-5 h-5" />
          </button>
          {enhancedImage && (
            <button 
              onClick={() => downloadImage(enhancedImage)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
            </button>
          )}

          {/* History Header */}
            <button
              onClick={EnhanceHistoryTrigger}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Refresh history"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
        
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 p-6">
        {originalImage && enhancedImage ? (
          // Dynamic comparison view based on image aspect ratio
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="relative max-w-5xl max-h-[80vh] w-full">
              <Compare
                firstImage={originalImage}
                secondImage={enhancedImage}
                className="w-full rounded-lg"
                slideMode="hover"
                showHandlebar={true}
                autoplay={false}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-4 w-full max-w-5xl">
              <span>Original</span>
              <span>Upscaled</span>
            </div>
          </div>
        ) : originalImage && isProcessing ? (
          // Processing view
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative mb-6">
              <img 
                src={originalImage} 
                alt="Original image" 
                className="max-w-md max-h-64 object-contain rounded-lg shadow-md"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#C15F3C]/20 to-[#F59B7B]/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <div className="bg-white rounded-full p-4 shadow-lg">
                  <div className="w-8 h-8 border-4 border-[#C15F3C] border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            </div>
            
            {/* Status Display */}
            <div className="text-center max-w-md">
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C15F3C]/10 to-[#F59B7B]/10 border border-[#C15F3C]/30 rounded-full mb-3">
                <div className="w-2 h-2 bg-[#C15F3C] rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-[#C15F3C]">
                  {processingStatus || 'Upscaling your image...'}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm">
                Our AI is upscaling your image. This may take a few moments.
              </p>
            </div>
          </div>
        ) : originalImage ? (
          // Original image only view
          <div className="flex flex-col items-center justify-center h-full">
            <img 
              src={originalImage} 
              alt="Original image" 
              className="max-w-md max-h-64 object-contain rounded-lg shadow-md mb-4"
            />
            <p className="text-gray-600 text-center">
              Click "Enhance Image" to start the enhancement process
            </p>
          </div>
        ) : (
          // Empty state
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Code className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to enhance</h3>
              <p className="text-gray-600">
                Upload an image to get started with AI-powered enhancement
              </p>
            </div>
          </div>
        )}
      </div>

      <EnhanceHistory
                threadId={currentThreadId}
                onSelectEnhancement={handleSelectEnhancement}
                refreshTrigger={historyRefreshTrigger}
                originalImage={originalImage}
                enhancedImage={enhancedImage}
                state={isProcessing}
      />

    </div>
  )
})

// Expose methods to parent component
EnhanceContainer.displayName = 'EnhanceContainer'

export default EnhanceContainer

