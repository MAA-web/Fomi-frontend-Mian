import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Generation Store for managing AI generation state
const useGenerationStore = create(
  persist(
    (set, get) => ({
      // State
      generations: [],
      currentGeneration: null,
      isGenerating: false,
      generationQueue: [],
      error: null,
      progress: 0,

      // Actions
      addGeneration: (generation) => {
        set((state) => ({
          generations: [generation, ...state.generations],
        }));
      },

      updateGeneration: (generationId, updates) => {
        set((state) => ({
          generations: state.generations.map((gen) =>
            gen.id === generationId ? { ...gen, ...updates } : gen
          ),
          currentGeneration: 
            state.currentGeneration?.id === generationId 
              ? { ...state.currentGeneration, ...updates }
              : state.currentGeneration,
        }));
      },

      setCurrentGeneration: (generation) => {
        set({ currentGeneration: generation });
      },

      setGenerating: (isGenerating) => {
        set({ isGenerating });
      },

      setProgress: (progress) => {
        set({ progress });
      },

      addToQueue: (generation) => {
        set((state) => ({
          generationQueue: [...state.generationQueue, generation],
        }));
      },

      removeFromQueue: (generationId) => {
        set((state) => ({
          generationQueue: state.generationQueue.filter(
            (gen) => gen.id !== generationId
          ),
        }));
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // Computed values
      getGenerationById: (generationId) => {
        const state = get();
        return state.generations.find((gen) => gen.id === generationId);
      },

      getGenerationsByStatus: (status) => {
        const state = get();
        return state.generations.filter((gen) => gen.status === status);
      },

      getQueueLength: () => {
        const state = get();
        return state.generationQueue.length;
      },

      // Batch operations
      clearCompletedGenerations: () => {
        set((state) => ({
          generations: state.generations.filter(
            (gen) => gen.status !== 'completed'
          ),
        }));
      },

      clearAllGenerations: () => {
        set({ generations: [], currentGeneration: null });
      },

      // Reset store
      reset: () => {
        set({
          generations: [],
          currentGeneration: null,
          isGenerating: false,
          generationQueue: [],
          error: null,
          progress: 0,
        });
      },
    }),
    {
      name: 'fomi-generation-store',
      partialize: (state) => ({
        generations: state.generations,
        generationQueue: state.generationQueue,
      }),
    }
  )
);

export default useGenerationStore;

