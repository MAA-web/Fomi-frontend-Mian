"use client";

import { useState, useRef, useEffect } from 'react';
import Header from '../../components/layout/Header';
import EnhanceInputControls from '../../components/pages/Enhance/EnhanceInputControls';
import EnhanceContainer from '../../components/pages/Enhance/EnhanceContainer';
import EnhanceHistory from '../../components/pages/Enhance/EnhanceHistory';
import EnhanceThreadHistory from '../../components/pages/Enhance/EnhanceThreadHistory';
import generationApi from '../../lib/api/generation';

export default function Enhance() {
  const [originalImage, setOriginalImage] = useState(null);
  const [originalImageFile, setOriginalImageFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [firebaseId, setFirebaseId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showThreadHistory, setShowThreadHistory] = useState(false);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  
  const enhanceContainerRef = useRef(null);

  // Get Firebase ID and check for threadId in URL params
  useEffect(() => {
    const getFirebaseId = async () => {
      try {
        const id = await generationApi.getFirebaseId()
        const finalId = id || 'bscUhhSwrbPitTU4DOjoCk3mhiL2' // Fallback
        setFirebaseId(finalId)
      } catch (error) {
        console.error('❌ Error getting Firebase ID, using hardcoded one:', error)
        setFirebaseId('bscUhhSwrbPitTU4DOjoCk3mhiL2')
      }
    }
    
    getFirebaseId()
    
    const urlParams = new URLSearchParams(window.location.search)
    const threadId = urlParams.get('threadId')
    if (threadId) {
      setCurrentThreadId(threadId)
    }
  }, [])

  const handleImageUpload = (imageDataUrl, imageFile) => {
    setOriginalImage(imageDataUrl)
    setOriginalImageFile(imageFile)
  }

  const handleEnhance = async (options) => {
    if (!originalImageFile || !enhanceContainerRef.current) {
      console.error('❌ No image file or container reference')
      return
    }

    try {
      setIsProcessing(true)
      
      // Refresh history when starting new enhancement
      setHistoryRefreshTrigger(prev => prev + 1)
      
      // Call the enhancement function from the container
      const result = await enhanceContainerRef.current.startEnhancement(originalImageFile, options)
      console.log('✅ Enhancement started:', result)
      // Update URL with threadId if we got a new one
      if (result.threadId && result.threadId !== currentThreadId) {
        setCurrentThreadId(result.threadId)
        // Update URL to include threadId
        const newUrl = new URL(window.location)
        newUrl.searchParams.set('threadId', result.threadId)
        window.history.pushState({}, '', newUrl.toString())
      }
      
    } catch (error) {
      console.error('❌ Enhancement failed:', error)
      setIsProcessing(false)
    }
  }

  const handleEnhanceComplete = (enhancedImageUrl) => {
    setIsProcessing(false)
    // Refresh history when enhancement completes
    setHistoryRefreshTrigger(prev => prev + 1)
  }

  const handleSelectEnhancement = (enhancement) => {
    // Handle selection of a historical enhancement
    console.log('Selected enhancement:', enhancement)
  }

  const handleSelectThread = (threadId) => {
    console.log('Selected thread:', threadId)
    setCurrentThreadId(threadId)
    // Update URL with threadId
    const newUrl = new URL(window.location)
    newUrl.searchParams.set('threadId', threadId)
    window.history.pushState({}, '', newUrl.toString())
    // Close thread history
    setShowThreadHistory(false)
    // Refresh the enhancement history to load this thread's enhancements
    setHistoryRefreshTrigger(prev => prev + 1)
  }

  const handleNewThread = () => {
    console.log('Creating new thread')
    setCurrentThreadId(null)
    setOriginalImage(null)
    setOriginalImageFile(null)
    // Clear threadId from URL
    const newUrl = new URL(window.location)
    newUrl.searchParams.delete('threadId')
    window.history.pushState({}, '', newUrl.toString())
    // Close thread history
    setShowThreadHistory(false)
  }

  const handleNewChat = () => {
    console.log('Creating new chat')
    setCurrentThreadId(null)
    setOriginalImage(null)
    setOriginalImageFile(null)
    // Clear threadId from URL
    const newUrl = new URL(window.location)
    newUrl.searchParams.delete('threadId')
    window.history.pushState({}, '', newUrl.toString())
    // Close thread history
    setShowThreadHistory(false)
  }

  const toggleThreadHistory = () => {
    setShowThreadHistory(prev => !prev)
  }

  return (
    <div className="min-h-screen bg-[#f9f3f0]">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6 transition-all duration-300 ease-in-out" style={{ height: 'calc(100vh - 200px)' }}>
          {/* History Panel - Slides in from left */}
          <div className={`transition-all duration-300 ease-in-out ${
            showThreadHistory ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden'
          }`}>
            <EnhanceThreadHistory
              firebaseId={firebaseId}
              currentThreadId={currentThreadId}
              onSelectThread={handleSelectThread}
              onNewThread={handleNewThread}
              onNewChat={handleNewChat}
              isOpen={showThreadHistory}
              onClose={() => setShowThreadHistory(false)}
            />
          </div>

          {/* Main Content - Pushes to the right when history opens */}
          <div className={`flex gap-6 transition-all duration-300 ease-in-out ${
            showThreadHistory ? 'translate-x-0' : 'translate-x-0'
          }`} style={{ width: showThreadHistory ? 'calc(100% - 320px)' : '100%' }}>
            {/* Left Column - Controls */}
            <div className="flex-shrink-0">
              <EnhanceInputControls
                onEnhance={handleEnhance}
                onImageUpload={handleImageUpload}
                uploadedImage={originalImage}
                isProcessing={isProcessing}
                onToggleHistory={toggleThreadHistory}
                isHistoryOpen={showThreadHistory}
              />
            </div>

            {/* Right Column - Enhancement Display */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full overflow-hidden flex flex-col">
                <EnhanceContainer
                  ref={enhanceContainerRef}
                  originalImage={originalImage}
                  currentThreadId={currentThreadId}
                  userId={firebaseId}
                  onEnhanceComplete={handleEnhanceComplete}
                  historyRefreshTrigger={historyRefreshTrigger}
                  onRefreshHistory={() => setHistoryRefreshTrigger(prev => prev + 1)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
