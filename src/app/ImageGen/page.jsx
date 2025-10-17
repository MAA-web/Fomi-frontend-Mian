'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import StyleSelectionBar from '@/components/pages/imagegen/StyleSelectionBar';
import NewInputControls from '@/components/pages/imagegen/NewInputControls';
import GenerationArea from '@/components/pages/imagegen/GenerationArea';
import ImageGenerationContainer from '@/components/pages/imagegen/ImageGenerationContainer';
import generationApi from '@/lib/api/generation.js';
import firebaseAuthService from '@/lib/firebaseAuth.js';
import styles from './ImageGen.module.css';

export default function ImageGen() {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [model, setModel] = useState('Model');
  const [models, setModels] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firebaseId, setFirebaseId] = useState(null);
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [imageCount, setImageCount] = useState(1);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const newGenerationRef = useRef(null);

  // Get threadId from URL params
  useEffect(() => {
    const threadId = searchParams.get('threadId');
    if (threadId) {
      setCurrentThreadId(threadId);
    }
  }, [searchParams]);

  // Get Firebase ID on mount
  useEffect(() => {
    const getFirebaseId = async () => {
      try {
        const id = await generationApi.getFirebaseId();
        if (id) {
          setFirebaseId(id);
          console.log('🔑 Firebase ID for ImageGen:', id);
        }
      } catch (error) {
        console.error('❌ Error getting Firebase ID:', error);
      }
    };

    getFirebaseId();
  }, []);

  // Fetch models on mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await generationApi.getModels('ImageGen');
        console.log('🎨 Fetched ImageGen models:', response);
        setModels(response.models || []);
        
        // Set default model if available
        if (response.models && response.models.length > 0) {
          setModel(response.models[0].name || 'Model');
        }
      } catch (error) {
        console.error('❌ Error fetching models:', error);
      }
    };
    fetchModels();
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      if (!firebaseId) {
        console.error('❌ No Firebase ID available');
        alert('Please wait for authentication to complete.');
        return;
      }
      
      console.log('🚀 Starting image generation with:', {
        prompt,
        model,
        imageCount,
        aspectRatio,
        firebaseId,
        currentThreadId
      });

      setIsGenerating(true);

      // Create image-specific parameters
      const imageParams = {
        aspectRatio,
        totalImages: imageCount
      };
      
      const result = await generationApi.generateAsync({
        prompt,
        modelUsed: model,
        firebaseId,
        params: imageParams,
        totalImages: imageCount,
        page: 'ImageGen',
        ...(currentThreadId && { threadId: currentThreadId })
      });

      console.log('🚀 Image API Response:', result);
      console.log('🚀 individualJobIds:', result.individualJobIds);
      console.log('🚀 jobId:', result.jobId);

      // Handle credits response
      if (result.creditsDeducted) {
        console.log('💳 Credits deducted:', result.creditsDeducted);
        console.log('💳 Credits remaining:', result.creditsRemaining);
      }

      if (result.threadId) {
        // Update current thread ID
        setCurrentThreadId(result.threadId);
        
        // Update URL with threadId if not present
        if (!currentThreadId) {
          const url = new URL(window.location);
          url.searchParams.set('threadId', result.threadId);
          router.replace(url.pathname + url.search, { scroll: false });
        }
      }

      // Start new generation with the container
      if (newGenerationRef.current) {
        // Create individualJobIds array from the single jobId if individualJobIds is not provided
        const jobIds = result.individualJobIds || [result.jobId];
        
        console.log('🚀 Calling newGenerationRef.current with:', {
          prompt,
          imageCount,
          model,
          jobIds,
          threadId: result.threadId,
          aspectRatio
        });
        
        newGenerationRef.current(
          prompt,
          imageCount,
          model,
          jobIds,
          result.threadId,
          { aspectRatio }
        );
      } else {
        console.log('❌ newGenerationRef.current is not available');
      }

      // Clear the prompt after successful generation
      setPrompt('');

    } catch (error) {
      console.error('❌ Error generating images:', error);
      alert('Failed to generate images. Please try again.');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setIsSubmitting(false), 1000);
    }
  }, [prompt, model, imageCount, aspectRatio, firebaseId, currentThreadId, isGenerating, isSubmitting, router]);

  const handleNewGeneration = useCallback((startNewGeneration) => {
    newGenerationRef.current = startNewGeneration;
  }, []);

  const handleGenerationComplete = useCallback((generation) => {
    console.log('✅ Image generation completed:', generation);
    setIsGenerating(false);
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <Header />
      
      <div className={styles.container}>
        {/* Style Selection Bar */}
        <StyleSelectionBar 
          selectedStyle={selectedStyle}
          onStyleSelect={setSelectedStyle}
        />

        {/* Main Content Area */}
        <div className={styles.mainContent} style={{ paddingTop: '0px' }}>
          {/* Left Side - Input Controls */}
          <div style={{ marginTop: '120px' }}>
            <NewInputControls
              prompt={prompt}
              onPromptChange={setPrompt}
              onGenerate={handleGenerate}
              model={model}
              onModelChange={setModel}
              models={models}
              imageCount={imageCount}
              onImageCountChange={setImageCount}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
              isGenerating={isGenerating || isSubmitting}
            />
          </div>

          {/* Right Side - Generation Area */}
          <ImageGenerationContainer
            currentThreadId={currentThreadId}
            userId={firebaseId}
            onNewGeneration={handleNewGeneration}
            onGenerationComplete={handleGenerationComplete}
          />
        </div>
      </div>
    </div>
  );
}

