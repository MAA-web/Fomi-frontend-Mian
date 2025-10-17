"use client"

import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Compare } from '@/components/ui/compare'
import { Code, Download, Eye, EyeOff, Clock, Image as ImageIcon } from 'lucide-react'
import EditHistory from './EditHistory'

const EditContainer = forwardRef(function EditContainer({
  originalImage,
  currentThreadId,
  userId,
  onEditComplete,
  historyRefreshTrigger,
  onRefreshHistory
}, ref) {
  const [editedImage, setEditedImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [currentEdit, setCurrentEdit] = useState(null)
  const [editHistory, setEditHistory] = useState([])
  const [showOriginal, setShowOriginal] = useState(false)
  
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const connectionAttemptsRef = useRef(0)
  const maxConnectionAttempts = 5

  // WebSocket connection management
  const connectWebSocket = useCallback((userId) => {
    if (!userId) {
      console.error('❌ No userId provided for WebSocket connection')
      return
    }
    
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      console.log('🔌 Connecting to edit WebSocket with userId:', userId)
      wsRef.current = new WebSocket(`ws://https://api.tarum.ai/generation-service/ws?userId=${userId}`)
      wsRef.current.binaryType = 'arraybuffer'

      wsRef.current.onopen = () => {
        console.log('✅ Edit WebSocket connected')
        setConnectionStatus('connected')
        connectionAttemptsRef.current = 0
      }

      wsRef.current.onmessage = async (event) => {
        console.log('📡 Edit WebSocket message received, type:', typeof event.data, 'instanceof ArrayBuffer:', event.data instanceof ArrayBuffer)
        console.log('📡 Message data size:', event.data.byteLength || event.data.size || event.data.length)
        
        // Update connection status to connected when we receive messages
        if (connectionStatus !== 'connected') {
          console.log('🔄 Updating connection status to connected')
          setConnectionStatus('connected')
        }
        
        // Check if this might be binary data disguised as string
        const messageSize = event.data.byteLength || event.data.size || event.data.length
        if (messageSize > 1000000) { // If message is > 1MB, it's probably binary data
          console.log('🚨 Large message detected! Size:', messageSize, 'Type:', typeof event.data)
          console.log('🚨 This might be binary data that we need to handle differently')
        }
        
        if (event.data instanceof ArrayBuffer) {
          // Binary data - edited image
          console.log('📦 Binary data received:', event.data.byteLength, 'bytes')
          handleEditedImageData(event.data)
        } else if (event.data instanceof Blob) {
          // Binary data as Blob - convert to ArrayBuffer
          console.log('📦 Blob data received:', event.data.size, 'bytes')
          const arrayBuffer = await event.data.arrayBuffer()
          handleEditedImageData(arrayBuffer)
        } else {
          // Text data - status updates
          try {
            const data = JSON.parse(event.data)
            handleStatusUpdate(data)
          } catch (error) {
            // If JSON parsing fails and message is large, might be binary data as string
            if (messageSize > 100000) {
              console.log('🚨 Large non-JSON message - might be binary data as string')
              console.log('🚨 First 100 chars:', event.data.substring(0, 100))
              // Try to convert string to binary
              try {
                const binaryString = event.data
                const bytes = new Uint8Array(binaryString.length)
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i) & 0xFF
                }
                console.log('🔄 Attempting to process as binary data...')
                handleEditedImageData(bytes.buffer)
                return
              } catch (binaryError) {
                console.error('❌ Failed to convert to binary:', binaryError)
              }
            }
            console.error('❌ Error parsing WebSocket message:', error)
            console.log('Raw message data (first 200 chars):', event.data.substring(0, 200))
          }
        }
      }

      wsRef.current.onclose = (event) => {
        console.log('🔌 Edit WebSocket disconnected:', event.code, event.reason)
        console.log('🔍 WebSocket was actually open before close:', wsRef.current?.readyState)
        setConnectionStatus('disconnected')
        
        // Reconnect if not a clean closure and we haven't exceeded max attempts
        if (event.code !== 1000 && connectionAttemptsRef.current < maxConnectionAttempts) {
          connectionAttemptsRef.current++
          console.log(`🔄 Reconnecting... (attempt ${connectionAttemptsRef.current}/${maxConnectionAttempts})`)
          reconnectTimeoutRef.current = setTimeout(() => connectWebSocket(userId), 3000)
        }
      }

      wsRef.current.onerror = (error) => {
        console.error('❌ Edit WebSocket error:', error)
        setConnectionStatus('error')
      }

    } catch (error) {
      console.error('❌ Error creating edit WebSocket connection:', error)
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
    
    setConnectionStatus('disconnected')
  }, [])

  // Main edit function
  const startEdit = useCallback(async (imageFile, prompt, options) => {
    if (!imageFile) {
      throw new Error('No image file provided')
    }

    if (!prompt || prompt.trim() === '') {
      throw new Error('No prompt provided')
    }

    console.log('🚀 Starting edit process...')
    setIsProcessing(true)
    setEditedImage(null)

    try {
      // Convert image to base64
      const imageBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = reader.result.split(',')[1] // Remove data:image/jpeg;base64, prefix
          resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(imageFile)
      })

      console.log('📤 Sending edit request to backend...')
      
      // Send request to Go backend
      const response = await fetch('https://api.tarum.ai/generation-service/generate/async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseId: '98340b12-0589-4281-8891-b67b1b4e296f',
          prompt: prompt,
          jobType: 'image_to_image',
          modelUsed: 'image2image', // Use same stream as enhance
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
      console.log('✅ Edit request submitted:', result)
      console.log('🔗 ThreadId from response:', result.threadId)

      // Store current edit info and connect WebSocket
      const editData = {
        id: Date.now(),
        jobId: result.jobId,
        individualJobIds: result.individualJobIds || [result.jobId],
        threadId: result.threadId,
        originalImage: originalImage, // Make sure original image is stored
        prompt: prompt,
        options: options,
        status: 'processing'
      }
      
      console.log('💾 Storing edit data:', {
        jobId: editData.jobId,
        hasOriginalImage: !!editData.originalImage,
        prompt: editData.prompt
      })
      
      setCurrentEdit(editData)
      
      // Connect WebSocket with userId (only if not already connected)
      if (wsRef.current?.readyState !== WebSocket.OPEN) {
        console.log('🔌 About to connect WebSocket with userId:', userId)
        connectWebSocket(userId)
      } else {
        console.log('🔌 WebSocket already connected, reusing connection')
      }

      return result

    } catch (error) {
      console.error('❌ Error starting edit:', error)
      setIsProcessing(false)
      throw error
    }
  }, [originalImage, currentEdit, connectWebSocket, userId])

  // Connect to WebSocket on component mount based on userId
  useEffect(() => {
    if (userId && connectionStatus === 'disconnected') {
      console.log('🔗 Auto-connecting to WebSocket with userId:', userId)
      connectWebSocket(userId)
    }
  }, [userId, connectionStatus, connectWebSocket])

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return cleanupWebSocket
  }, [cleanupWebSocket])

  // Handle edit selection from history
  const handleSelectEdit = (edit) => {
    console.log('Edit selected from history:', edit)
    // You can implement logic to load the selected edit here
  }

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    startEdit
  }), [startEdit])

  const handleEditedImageData = useCallback((arrayBuffer) => {
    console.log('🖼️ Processing edited image data:', arrayBuffer.byteLength, 'bytes')
    
    try {
      const uint8Array = new Uint8Array(arrayBuffer)
      console.log('🔍 Binary data preview:', uint8Array.slice(0, 50))

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
      
      console.log('✅ Extracted job_id:', jobId, 'image data size:', imageDataBytes.length)

      // Find PNG signature and create blob
      let pngStart = 0
      for (let i = 0; i < imageDataBytes.length - 3; i++) {
        if (imageDataBytes[i] === 0x89 && imageDataBytes[i+1] === 0x50 && 
            imageDataBytes[i+2] === 0x4E && imageDataBytes[i+3] === 0x47) {
          pngStart = i
          break
        }
      }

      const pngData = imageDataBytes.slice(pngStart)
      console.log('🖼️ Creating edited image blob, PNG data size:', pngData.length)
      
      const blob = new Blob([pngData], { type: 'image/png' })
      const imageUrl = URL.createObjectURL(blob)
      
      console.log('✅ Edit completed, image URL created:', imageUrl)
      
      // Add to edit history
      const editResult = {
        id: Date.now(),
        jobId: jobId,
        originalImage: currentEdit?.originalImage || originalImage, // Use from currentEdit if available
        editedImage: imageUrl,
        prompt: currentEdit?.prompt || 'Edit request',
        timestamp: new Date().toISOString(),
        status: 'completed'
      }
      
      console.log('📝 Adding to edit history:', {
        jobId: editResult.jobId,
        hasOriginalImage: !!editResult.originalImage,
        hasEditedImage: !!editResult.editedImage,
        prompt: editResult.prompt
      })
      
      setEditHistory(prev => [editResult, ...prev])
      setEditedImage(imageUrl)
      setIsProcessing(false)
      
      // Notify parent component
      if (onEditComplete) {
        onEditComplete(imageUrl)
      }
      
      // Refresh history
      if (onRefreshHistory) {
        onRefreshHistory()
      }

    } catch (error) {
      console.error('❌ Error processing edited image data:', error)
      setIsProcessing(false)
    }
  }, [onEditComplete])

  const handleStatusUpdate = useCallback((data) => {
    console.log('📨 Edit status update:', data)
    
    if (data.status === 'completed' || data.completed === true) {
      console.log('🎉 Edit job completed:', data.job_id || data.jobId)
      console.log('🔍 WebSocket state:', wsRef.current?.readyState, '(1=OPEN)')
      console.log('🔍 Connection status:', connectionStatus)
      
      // Note: Binary image data should come separately via binary message
      // If no binary data comes within 10 seconds, something went wrong
      setTimeout(() => {
        if (isProcessing) {
          console.warn('⚠️ Job completed but no binary image data received within 10 seconds')
          console.warn('⚠️ WebSocket state at timeout:', wsRef.current?.readyState)
          setIsProcessing(false)
        }
      }, 10000)
    } else if (data.status === 'failed') {
      console.error('❌ Edit job failed:', data.error || 'Unknown error')
      setIsProcessing(false)
    }
  }, [isProcessing])

  return (
    <div className="h-full overflow-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Code className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Image Edit</h2>
            <p className="text-sm text-gray-500">
              {connectionStatus === 'connected' ? 'Connected' : 
               connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </p>
          </div>
        </div>
        
        {editedImage && (
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Download</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Current Edit Display */}
        {isProcessing ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500 hover:bg-blue-400 transition ease-in-out duration-150 cursor-not-allowed">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Editing your image...
              </div>
              <p className="text-gray-500 mt-2">This may take a few moments</p>
            </div>
          </div>
        ) : editHistory.length > 0 ? (
          <div className="flex-1 overflow-y-auto p-6">
            {/* Edit History */}
            <div className="space-y-6">
              {editHistory.map((edit, index) => (
                <div key={edit.id} className="bg-gray-50 rounded-xl p-6">
                  {/* Edit Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Edit #{editHistory.length - index}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(edit.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Show Original Toggle */}
                    <button
                      onClick={() => setShowOriginal(!showOriginal)}
                      className="flex items-center space-x-2 px-3 py-1 bg-white rounded-lg border hover:bg-gray-50 transition-colors text-sm"
                    >
                      {showOriginal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span>{showOriginal ? 'Hide Original' : 'Show Original'}</span>
                    </button>
                  </div>

                  {/* Prompt */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 bg-white rounded-lg p-3 border">
                      <strong>Prompt:</strong> "{edit.prompt}"
                    </p>
                  </div>

                  {/* Images */}
                  <div className="grid grid-cols-1 gap-4">
                    {showOriginal && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Original Image:</p>
                        <img 
                          src={edit.originalImage} 
                          alt="Original" 
                          className="w-full max-w-md rounded-lg border shadow-sm"
                        />
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Edited Image:</p>
                      <img 
                        src={edit.editedImage} 
                        alt="Edited" 
                        className="w-full max-w-md rounded-lg border shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => {
                          // Optional: Add fullscreen view
                          window.open(edit.editedImage, '_blank')
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : originalImage ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <img 
                src={originalImage} 
                alt="Original" 
                className="max-w-md max-h-96 object-contain rounded-lg border mx-auto"
              />
              <p className="text-gray-500 mt-4">Enter a prompt and click "Edit Image" to start</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Code className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-lg font-medium">Upload an image to get started</p>
              <p className="text-sm">Select an image and describe how you want to edit it</p>
            </div>
          </div>
        )}
      </div>

      <EditHistory
        threadId={currentThreadId}
        onSelectEdit={handleSelectEdit}
        refreshTrigger={historyRefreshTrigger}
        originalImage={originalImage}
        editedImage={editedImage}
        state={isProcessing}
      />
    </div>
  )
})

EditContainer.displayName = 'EditContainer'

export default EditContainer
