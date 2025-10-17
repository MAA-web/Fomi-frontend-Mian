"use client";

import { useState, useRef, useEffect } from 'react';
import Header from "../../components/layout/Header";
import ImageInputControls from "../../components/pages/edit/ImageInputControls";
import EditContainer from "../../components/pages/edit/EditContainer";
import EditThreadHistory from "../../components/pages/edit/EditThreadHistory";
import generationApi from '../../lib/api/generation';

export default function EditPage() {
  const [originalImage, setOriginalImage] = useState(null);
  const [originalImageFile, setOriginalImageFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [firebaseId, setFirebaseId] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  
  const editContainerRef = useRef(null);

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
      console.log('🔗 Found threadId in URL for edit page:', threadId)
      setCurrentThreadId(threadId)
    }
  }, [])

  const handleImageUpload = (imageDataUrl, imageFile) => {
    console.log('📤 Image uploaded for editing')
    setOriginalImage(imageDataUrl)
    setOriginalImageFile(imageFile)
  }

  const handleEdit = async (prompt, options) => {
    if (!originalImageFile || !editContainerRef.current) {
      console.error('❌ No image file or container reference')
      return
    }

    if (!prompt || prompt.trim() === '') {
      console.error('❌ No prompt provided')
      return
    }

    try {
      setIsProcessing(true)
      console.log('🚀 Starting edit with prompt:', prompt, 'options:', options)
      
      // Call the edit function from the container
      const result = await editContainerRef.current.startEdit(originalImageFile, prompt, options)
      console.log('✅ Edit started:', result)
      
    } catch (error) {
      console.error('❌ Edit failed:', error)
      setIsProcessing(false)
    }
  }

  const handleEditComplete = (editedImageUrl) => {
    console.log('🎉 Edit completed:', editedImageUrl)
    setIsProcessing(false)
    // Refresh history when edit completes
    setHistoryRefreshTrigger(prev => prev + 1)
  }

  const handleSelectThread = (threadId) => {
    console.log('Selected thread:', threadId)
    setCurrentThreadId(threadId)
    // Update URL with threadId
    const newUrl = new URL(window.location)
    newUrl.searchParams.set('threadId', threadId)
    window.history.pushState({}, '', newUrl.toString())
    // Close history
    setIsHistoryOpen(false)
    // Refresh the edit history to load this thread's edits
    setHistoryRefreshTrigger(prev => prev + 1)
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
    // Close history
    setIsHistoryOpen(false)
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
            <EditThreadHistory
              firebaseId={firebaseId}
              currentThreadId={currentThreadId}
              onSelectThread={handleSelectThread}
              onNewThread={() => {}}
              onNewChat={handleNewChat}
              isOpen={isHistoryOpen}
              onClose={() => setIsHistoryOpen(false)}
            />
          </div>

          {/* Main Content - Pushes to the right when history opens */}
          <div className={`flex gap-6 transition-all duration-300 ease-in-out ${
            isHistoryOpen ? 'translate-x-0' : 'translate-x-0'
          }`} style={{ width: isHistoryOpen ? 'calc(100% - 320px)' : '100%' }}>
            {/* Left Column - Input Controls */}
            <div className="flex-shrink-0">
              <ImageInputControls
                onEdit={handleEdit}
                onImageUpload={handleImageUpload}
                uploadedImage={originalImage}
                isProcessing={isProcessing}
                onToggleHistory={() => setIsHistoryOpen(prev => !prev)}
                isHistoryOpen={isHistoryOpen}
              />
            </div>

            {/* Right Column - Edit Display */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full overflow-hidden flex flex-col">
                <EditContainer
                  ref={editContainerRef}
                  originalImage={originalImage}
                  currentThreadId={currentThreadId}
                  userId={firebaseId}
                  onEditComplete={handleEditComplete}
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






