import { useState, useEffect, useCallback } from 'react';
import useGenerationStore from '../store/generationStore';
import imageApiService from '../api/images';

// Custom hook for image generation with API integration
export const useGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  
  const {
    generations,
    currentGeneration,
    isGenerating,
    generationQueue,
    error,
    progress,
    addGeneration,
    updateGeneration,
    setCurrentGeneration,
    setGenerating,
    setProgress,
    addToQueue,
    removeFromQueue,
    setError,
    clearError,
    getGenerationById,
  } = useGenerationStore();

  // Generate image
  const generateImage = useCallback(async (params) => {
    try {
      setIsLoading(true);
      setError(null);
      setGenerating(true);

      // Call API
      const generation = await imageApiService.generateImage(params);
      
      // Add to store
      addGeneration(generation);
      setCurrentGeneration(generation);
      
      // Start polling for progress
      startProgressPolling(generation.id);
      
      return generation;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addGeneration, setCurrentGeneration, setError, setGenerating]);

  // Poll for generation progress
  const startProgressPolling = useCallback(async (generationId) => {
    setIsPolling(true);
    
    const pollInterval = setInterval(async () => {
      try {
        const progressData = await imageApiService.getGenerationProgress(generationId);
        
        // Update progress
        setProgress(progressData.progress);
        
        // Update generation status
        updateGeneration(generationId, {
          status: progressData.status,
          progress: progressData.progress,
        });

        // Stop polling if completed or failed
        if (progressData.status === 'completed' || progressData.status === 'failed') {
          clearInterval(pollInterval);
          setIsPolling(false);
          setGenerating(false);
          
          // Get final generation data
          const finalGeneration = await imageApiService.getGeneration(generationId);
          updateGeneration(generationId, finalGeneration);
        }
      } catch (error) {
        console.error('Progress polling error:', error);
        clearInterval(pollInterval);
        setIsPolling(false);
        setGenerating(false);
      }
    }, 2000); // Poll every 2 seconds

    // Cleanup on unmount
    return () => clearInterval(pollInterval);
  }, [setProgress, updateGeneration, setGenerating]);

  // Generate variations
  const generateVariations = useCallback(async (params) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const generation = await imageApiService.generateVariations(params);
      addGeneration(generation);
      setCurrentGeneration(generation);
      
      startProgressPolling(generation.id);
      
      return generation;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addGeneration, setCurrentGeneration, setError, startProgressPolling]);

  // Edit image
  const editImage = useCallback(async (params) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const generation = await imageApiService.editImage(params);
      addGeneration(generation);
      setCurrentGeneration(generation);
      
      startProgressPolling(generation.id);
      
      return generation;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addGeneration, setCurrentGeneration, setError, startProgressPolling]);

  // Load generation history
  const loadHistory = useCallback(async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const history = await imageApiService.getGenerationHistory(params);
      
      // Replace generations with history data
      useGenerationStore.setState({ generations: history.generations });
      
      return history;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setError]);

  // Delete generation
  const deleteGeneration = useCallback(async (generationId) => {
    try {
      await imageApiService.deleteGeneration(generationId);
      
      // Remove from store
      useGenerationStore.setState((state) => ({
        generations: state.generations.filter((gen) => gen.id !== generationId),
        currentGeneration: 
          state.currentGeneration?.id === generationId 
            ? null 
            : state.currentGeneration,
      }));
      
      return { success: true };
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [setError]);

  // Get generation by ID
  const getGeneration = useCallback((generationId) => {
    return getGenerationById(generationId);
  }, [getGenerationById]);

  // Clear error
  const clearErrorHandler = useCallback(() => {
    clearError();
  }, [clearError]);

  // Reset store
  const reset = useCallback(() => {
    useGenerationStore.getState().reset();
  }, []);

  return {
    // State
    generations,
    currentGeneration,
    isGenerating,
    generationQueue,
    error,
    progress,
    isLoading,
    isPolling,
    
    // Actions
    generateImage,
    generateVariations,
    editImage,
    loadHistory,
    deleteGeneration,
    getGeneration,
    clearError: clearErrorHandler,
    reset,
    
    // Computed
    hasGenerations: generations.length > 0,
    completedGenerations: generations.filter(gen => gen.status === 'completed'),
    failedGenerations: generations.filter(gen => gen.status === 'failed'),
    pendingGenerations: generations.filter(gen => gen.status === 'pending'),
  };
};

export default useGeneration;

