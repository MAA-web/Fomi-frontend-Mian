"use client"

import { useState, useEffect } from 'react'
import { Sparkles, Upload, ChevronDown, History } from 'lucide-react'
import generationApi from '../../../lib/api/generation'
import CustomDropdown from '../../ui/CustomDropdown'

export default function EnhanceInputControls({ 
  onEnhance, 
  onImageUpload, 
  uploadedImage, 
  isProcessing = false,
  onToggleHistory,
  isHistoryOpen = false
}) {
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedAdvance, setSelectedAdvance] = useState('Standard')
  const [selectedScale, setSelectedScale] = useState(2)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        console.log('📞 Fetching Enhance models...')
        const data = await generationApi.getModels('Enhance')
        console.log('📦 Enhance models received:', data)
        if (data && data.models && data.models.length > 0) {
          setModels(data.models)
          setSelectedModel(data.models[0].name) // default model
        }
      } catch (error) {
        console.error('❌ Failed to fetch enhance models:', error)
      }
    }
    fetchModels()
  }, [])

  const handleEnhance = async () => {
    if (!uploadedImage || isProcessing || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      // Find the selected model object to get credit cost
      const currentModel = models.find(m => m.name === selectedModel)
      
      await onEnhance({
        model: selectedModel,
        modelUsed: selectedModel,
        modelParams: {
          upscale_factor: selectedScale
        },
        advance: selectedAdvance,
        scale: selectedScale,
        creditCost: currentModel?.credit_cost || 0
      })
    } finally {
      // Reset after a delay to prevent rapid clicking
      setTimeout(() => setIsSubmitting(false), 1000)
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onImageUpload(e.target.result, file)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="w-80 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full overflow-auto">
      {/* Image Upload Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Upload Image to Upscale
        </label>
        <div className="relative">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-6 h-6 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 text-center">
                {uploadedImage ? 'Image uploaded - click to change' : 'Click to upload image'}
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </label>
          {uploadedImage && (
            <div className="mt-3">
              <img 
                src={uploadedImage} 
                alt="Uploaded image preview" 
                className="w-full h-20 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      </div>

      {/* Scale/Resolution Buttons */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Upscale Factor
        </label>
        <div className="flex gap-2">
          {[2, 4].map((scale) => (
            <button
              key={scale}
              onClick={() => setSelectedScale(scale)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                selectedScale === scale
                  ? 'bg-gradient-to-br from-[#C15F3C]/10 to-[#F59B7B]/10 border-[#C15F3C] text-[#C15F3C]'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {scale}X
            </button>
          ))}
        </div>
      </div>

      {/* Model Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Upscale Model
        </label>
        <CustomDropdown
          options={models.length === 0 ? [{ value: '', label: 'Loading models...' }] : models.map(m => ({
            value: m.name,
            label: `${m.name} (${m.credit_cost} credits)`
          }))}
          value={selectedModel}
          onChange={setSelectedModel}
          placeholder="Select Upscale Model"
        />
      </div>

      {/* Advanced Settings */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Advanced Settings
        </label>
        <div className="relative">
          <select
            value={selectedAdvance}
            onChange={(e) => setSelectedAdvance(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 appearance-none cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="Standard">Standard</option>
            <option value="Enhanced">Enhanced</option>
            <option value="Professional">Professional</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* View History Button */}
        {onToggleHistory && (
          <button
            onClick={onToggleHistory}
            className={`w-full flex items-center justify-center gap-2 font-medium py-3 px-6 rounded-xl border transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
              isHistoryOpen 
                ? 'bg-[#faf7f4] text-[#C15F3C] border-[#C15F3C] hover:bg-[#f9f3f0]' 
                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-[#C15F3C]'
            }`}
          >
            <History className="w-5 h-5" />
            {isHistoryOpen ? 'Hide History' : 'View History'}
          </button>
        )}

        {/* Generate Button */}
        <button
          onClick={handleEnhance}
          disabled={!uploadedImage || isProcessing || isSubmitting}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
            !uploadedImage || isProcessing || isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#C15F3C] to-[#F59B7B] hover:from-[#A54F32] hover:to-[#E08A6A] transform hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className={`w-5 h-5 ${(isProcessing || isSubmitting) ? 'animate-spin' : ''}`} />
            {isProcessing ? 'Upscaling...' : isSubmitting ? 'Starting...' : 'Upscale Image'}
          </div>
        </button>
      </div>

      {!uploadedImage && (
        <p className="text-sm text-gray-500 text-center mt-3">
          Upload an image to start upscaling
        </p>
      )}
    </div>
  )
}


