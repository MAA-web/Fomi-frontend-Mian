'use client'

import { ChevronDown, Sparkles, Settings, Clock, Play, History } from "lucide-react"
import { useState, useRef, useEffect, useCallback } from "react"
import CreditValidation from "../../ui/CreditValidation"
import CustomDropdown from "../../ui/CustomDropdown"
import generationApi from "../../../lib/api/generation"; 


export default function InputControls({ onGenerate, isGenerating, onToggleHistory, isHistoryOpen = false }) {
  const [prompt, setPrompt] = useState("")
  const [totalVideos, setTotalVideos] = useState(1)
  const [modelUsed, setModelUsed] = useState("img2img-v1")
  const [params, setParams] = useState({})
  const [aspectRatio, setAspectRatio] = useState("square")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [models, setModels] = useState([]) 
  const [creditValidation, setCreditValidation] = useState(null)
  const [paramValues, setParamValues] = useState({});
  const [fps, setFps] = useState(24);
  const [quality, setQuality] = useState("standard");
  const [motion, setMotion] = useState("medium");
  const advancedSectionRef = useRef(null);

    // Current model based on selected model
  const currentModel = models.find((m) => m.name === modelUsed);
  
      // Fetch models from backend on mount
    useEffect(() => {
      async function fetchModels() {
        try {
          const data = await generationApi.getModels("video") // GET /models?page=Video
          if (data.success && data.models) {
            setModels(data.models)
            if (data.models.length > 0) {
              setModelUsed(data.models[0].name) // default model
            }
          }
        } catch (err) {
          console.error("❌ Failed to fetch models:", err)
        }
      }
      fetchModels()
    }, [])

    useEffect(() => {
        const currentModel = models.find((m) => m.name === modelUsed);
        if (currentModel?.model_params) {
          const parsed = JSON.parse(currentModel.model_params);
          setParamValues(Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, v])));
        }
      }, [modelUsed, models]);

      const handleGenerate = useCallback(async () => {
        if (isGenerating || isSubmitting) return;
        
        try {
          setIsSubmitting(true);
          
          // Create params object
          const newParams = {
            aspectRatio: aspectRatio
          };
          setParams(newParams); // Update the params state
    
          await onGenerate(prompt, totalVideos, modelUsed, aspectRatio, 30) // Pass: prompt, totalVideos, modelUsed, aspectRatio, fps
    
        } finally {
          setTimeout(() => setIsSubmitting(false), 1000)
        }
      }, [isGenerating, isSubmitting, onGenerate, prompt, totalVideos, aspectRatio, modelUsed, setParams]);

  const handleAdvancedToggle = () => {
    const newShowAdvanced = !showAdvanced;
    setShowAdvanced(newShowAdvanced);
    
    // If opening advanced options, scroll to the section
    if (newShowAdvanced && advancedSectionRef.current) {
      setTimeout(() => {
        advancedSectionRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }, 100); // Small delay to ensure the section is rendered
    }
  };
  
  return (
    <div className="w-80 flex flex-col space-y-6 mt-16">
      {/* Main Input Section */}
      <div className="bg-[#f9f3f0] rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="space-y-4">
          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your video scene
            </label>
            <textarea
              placeholder="A peaceful ocean wave crashing against rocky cliffs at sunset..."
              className="w-full h-24 p-3 text-sm border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors bg-white"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          {/* Model Selection (Custom Dropdown) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Model
            </label>
            <CustomDropdown
              options={models.length === 0 ? [{ value: '', label: 'Loading models...' }] : models.map(m => ({
                value: m.name,
                label: m.display_name || m.name
              }))}
              value={modelUsed}
              onChange={setModelUsed}
              placeholder="Select AI Model"
              disabled={models.length === 0}
            />
          </div>

          {/* Number of Videos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Videos
            </label>
            <CustomDropdown
              options={[
                { value: 1, label: '1 video' },
                { value: 2, label: '2 videos' },
                { value: 3, label: '3 videos' },
                { value: 4, label: '4 videos' }
              ]}
              value={totalVideos}
              onChange={(value) => setTotalVideos(parseInt(value))}
              placeholder="Select Number of Videos"
            />
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aspect Ratio
            </label>
            <CustomDropdown
              options={[
                { value: "16:9", label: 'Landscape (16:9)' },
                { value: "9:16", label: 'Portrait (9:16)' },
                { value: "1:1", label: 'Square (1:1)' },
                { value: "4:3", label: 'Classic (4:3)' }
              ]}
              value={aspectRatio}
              onChange={setAspectRatio}
              placeholder="Select Aspect Ratio"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || isSubmitting || !prompt.trim()}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              isGenerating || isSubmitting || !prompt.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {isGenerating || isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Generate Video</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {/* History Button */}
        <button
          onClick={onToggleHistory}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
            isHistoryOpen 
              ? 'bg-[#faf7f4] text-[#C15F3C] border-2 border-[#C15F3C]' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-[#C15F3C]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{isHistoryOpen ? 'Hide History' : 'View History'}</span>
        </button>

        {/* Advanced Options Button */}
        <button
          onClick={handleAdvancedToggle}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
            showAdvanced 
              ? 'bg-gray-100 text-gray-700 border-2 border-gray-200' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Advanced</span>
        </button>
      </div>

      {/* Advanced Options */}
      <div ref={advancedSectionRef} className="bg-[#f9f3f0] rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {showAdvanced && currentModel && (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-700 mb-3">Advanced Parameters</h4>

            {currentModel.model_params ? (
              (() => {
                const parsedParams = JSON.parse(currentModel.model_params);

                // Define sensible defaults
                const defaults = {
                  fps: [12, 24, 30, 60],
                  quality: ["standard", "high", "ultra"],
                  motion: ["low", "medium", "high", "dynamic"],
                };

                // Merge model_params with defaults (BE params overwrite if present)
                const combinedParams = {
                  ...defaults,
                  ...parsedParams,
                };

                return (
                  <>
                    {/* FPS Setting */}
                    {combinedParams.fps && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Frame Rate (FPS)
                        </label>
                        <CustomDropdown
                          options={combinedParams.fps.map(val => ({
                            value: val,
                            label: `${val} FPS`
                          }))}
                          value={fps}
                          onChange={(value) => setFps(parseInt(value))}
                          placeholder="Select FPS"
                        />
                      </div>
                    )}

                    {/* Quality Setting */}
                    {combinedParams.quality && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quality
                        </label>
                        <CustomDropdown
                          options={combinedParams.quality.map(val => ({
                            value: val,
                            label: `${val.charAt(0).toUpperCase() + val.slice(1)} Quality`
                          }))}
                          value={quality}
                          onChange={setQuality}
                          placeholder="Select Quality"
                        />
                      </div>
                    )}

                    {/* Motion Intensity */}
                    {combinedParams.motion && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Motion Intensity
                        </label>
                        <CustomDropdown
                          options={combinedParams.motion.map(val => ({
                            value: val,
                            label: `${val.charAt(0).toUpperCase() + val.slice(1)} Motion`
                          }))}
                          value={motion}
                          onChange={setMotion}
                          placeholder="Select Motion"
                        />
                      </div>
                    )}
                  </>
                );
              })()
            ) : (
              <p className="text-sm text-gray-500">No advanced parameters available.</p>
            )}
          </div>
        )}
      </div>

    </div>
  )
}