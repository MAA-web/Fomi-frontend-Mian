'use client'

import { useState, useRef, useEffect } from 'react';
import Header from "../../components/layout/Header"
import VideoInputControls from "../../components/pages/video/VideoInputControls"
import VideoContainer from "../../components/pages/video/VideoContainer"
import VideoHistory from "../../components/pages/video/VideoHistory"
import generationApi from "../../lib/api/generation"
import creditsService from "../../lib/services/creditsService"
import useFirebaseAuth from "../../lib/hooks/useFirebaseAuth"

export default function VideoPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentThreadId, setCurrentThreadId] = useState(null)
  const [selectedGeneration, setSelectedGeneration] = useState(null)
  const [videoHistoryRefreshTrigger, setVideoHistoryRefreshTrigger] = useState(0)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [firebaseId, setFirebaseId] = useState(null)
  const startNewGenerationRef = useRef(null)

  const { isAuthenticated, isLoading, isFirebaseInitialized } = useFirebaseAuth();

  // Get Firebase ID on mount
  useEffect(() => {
    const getFirebaseId = async () => {
      try {
        const id = await generationApi.getFirebaseId()
        setFirebaseId(id)
        console.log('🔑 Video page Firebase ID:', id)
      } catch (error) {
        console.error('❌ Error getting Firebase ID:', error)
      }
    }
    getFirebaseId()
  }, [])

  // Check for threadId in URL params (workaround for request/queue timing issue)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const threadId = urlParams.get('threadId')
    if (threadId) {
      console.log('🔗 Found threadId in URL for video page:', threadId)
      setCurrentThreadId(threadId)
    }
  }, [])

  const handleSelectThread = (thread) => {
    setCurrentThreadId(thread.threadId);
    
    // Update URL with threadId
    const url = new URL(window.location);
    url.searchParams.set('threadId', thread.threadId);
    window.history.pushState({}, '', url);
    
    console.log('📱 Selected video thread:', thread.threadId);
  };

  const handleNewChat = () => {
    setCurrentThreadId(null);
    
    // Remove threadId from URL
    const url = new URL(window.location);
    url.searchParams.delete('threadId');
    window.history.pushState({}, '', url);
    
    console.log('🆕 Started new video chat');
  };

  const handleGenerate = async (prompt, totalVideos, modelUsed, aspectRatio, fps) => {
    if (!prompt.trim()) return

    try {
      // Get Firebase ID
      let firebaseId = await generationApi.getFirebaseId()
      
      // TEMPORARY: Use hardcoded firebaseId for testing if dynamic one fails
      if (!firebaseId) {
        console.warn('No Firebase ID found, using hardcoded one for testing')
        firebaseId = userId
      }
      
      console.log('Using Firebase ID for video generation:', firebaseId)

      // Check if user has enough credits
      const creditCheck = await creditsService.hasEnoughCredits(modelUsed, "video")
      if (!creditCheck.hasEnough) {
        alert(`Insufficient credits! You need ${creditCheck.required} credits but only have ${creditCheck.current}.`)
        return
      }

      setIsGenerating(true)

      // Create video-specific parameters
      const videoParams = {
        aspectRatio,
        fps
      }
      
      const result = await generationApi.generateAsync({
        prompt,
        modelUsed,
        firebaseId,
        params: videoParams,
        totalImages: totalVideos,
        Page: 'video',
        ...(currentThreadId && { threadId: currentThreadId })
      })

      console.log('🚀 Video API Response:', result)
      console.log('🚀 individualJobIds:', result.individualJobIds)
      console.log('🚀 jobId:', result.jobId)

      // Handle credits response
      if (result.creditsDeducted) {
        console.log('💳 Credits deducted:', result.creditsDeducted)
        console.log('💳 Credits remaining:', result.creditsRemaining)
        
        // Update cached credits
        creditsService.updateCreditsAfterGeneration(result.creditsDeducted)
      }

      if (result.threadId) {
        // Update current thread ID
        setCurrentThreadId(result.threadId)
        
        // Update URL with threadId if not present
        if (!currentThreadId) {
          const url = new URL(window.location)
          url.searchParams.set('threadId', result.threadId)
          window.history.pushState({}, '', url)
        }
        
        // Start new video generation with WebSocket
        if (startNewGenerationRef.current) {
          // Ensure individualJobIds exists (fallback for single video requests)
          const jobIds = result.individualJobIds || [result.jobId]
          console.log('🎯 Using jobIds for video frontend:', jobIds)
          startNewGenerationRef.current(prompt, totalVideos, modelUsed, jobIds, result.threadId, {
            aspectRatio,
            fps
          })

          // Trigger video history refresh after starting generation
          setTimeout(() => {
            setVideoHistoryRefreshTrigger(prev => prev + 1)
          }, 1000) // Small delay to ensure generation has started
        }
      }
    } catch (error) {
      console.error('❌ Error generating video:', error)
      if (error.status === 402 || error.code === 'INSUFFICIENT_CREDITS') {
        alert('Insufficient credits! Please purchase more credits to continue.')
      } else {
        alert(`Failed to generate video: ${error.message || 'Please try again.'}`)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f3f0]">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6 transition-all duration-300 ease-in-out" style={{ height: 'calc(100vh - 200px)' }}>
          {/* History Panel - Slides in from left */}
          <div className={`transition-all duration-300 ease-in-out ${
            isHistoryOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden'
          }`}>
            <VideoHistory
              onSelectThread={handleSelectThread}
              currentThreadId={currentThreadId}
              refreshTrigger={videoHistoryRefreshTrigger}
              onNewChat={handleNewChat}
              isOpen={isHistoryOpen}
              onClose={() => setIsHistoryOpen(false)}
              page="video"
            />
          </div>

          {/* Main Content - Pushes to the right when history opens */}
          <div className={`flex gap-6 transition-all duration-300 ease-in-out ${
            isHistoryOpen ? 'translate-x-0' : 'translate-x-0'
          }`} style={{ width: isHistoryOpen ? 'calc(100% - 320px)' : '100%' }}>
            {/* Left Column - Input Controls */}
            <div className="flex-shrink-0">
              <VideoInputControls
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                onToggleHistory={() => setIsHistoryOpen(prev => !prev)}
                isHistoryOpen={isHistoryOpen}
              />
            </div>

            {/* Right side - Scrollable Video Generation Area */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full overflow-hidden flex flex-col">
                <VideoContainer
                  currentThreadId={currentThreadId}
                  userId={firebaseId}
                  selectedGeneration={selectedGeneration}
                  onSelectGeneration={setSelectedGeneration}
                  onNewGeneration={(fn) => { startNewGenerationRef.current = fn }}
                  onGenerationComplete={() => {
                    console.log('Video generation completed, refreshing video history')
                    setVideoHistoryRefreshTrigger(prev => prev + 1)
                  }}
                  videoHistoryRefreshTrigger={videoHistoryRefreshTrigger}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
