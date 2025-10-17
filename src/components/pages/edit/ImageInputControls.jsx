"use client";

import { useState, useRef } from 'react';
import { Sparkles, ChevronDown, Upload, Image as ImageIcon, Settings, History } from "lucide-react";
import CustomDropdown from "../../ui/CustomDropdown";

export default function ImageInputControls({ onEdit, onImageUpload, uploadedImage, isProcessing, onToggleHistory, isHistoryOpen }) {
  const [selectedModel, setSelectedModel] = useState('DALL-E 3');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [selectedStyle, setSelectedStyle] = useState('Natural');
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const fileInputRef = useRef(null);

  const dropdownButtonStyle = "flex items-center space-x-2 text-sm bg-white p-1 rounded-lg";
  const actionButtonStyle = "flex items-center justify-center w-full bg-white p-2 rounded-2xl relative";

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageDataUrl = e.target.result
        onImageUpload(imageDataUrl, file)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEdit = async () => {
    if (!uploadedImage) {
      alert('Please upload an image first')
      return
    }
    
    if (!prompt.trim()) {
      alert('Please enter a prompt describing your edit')
      return
    }

    setIsSubmitting(true)
    try {
      await onEdit(prompt, {
        model: selectedModel,
        ratio: selectedRatio,
        style: selectedStyle
      })
    } catch (error) {
      console.error('Edit failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-80 space-y-6 mt-16">
      {/* Main Input Section */}
      <div className="text-gray-700 bg-[#f9f3f0] rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="space-y-4">
          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe how you want to edit your image
            </label>
            <textarea
              placeholder="Describe how you want to edit your image..."
              className="w-full h-24 p-3 text-sm border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors bg-white"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          {/* Upload Image Button */}
          <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#C15F3C] to-[#F59B7B] hover:from-[#A54F32] hover:to-[#E08A6A] text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              <Upload className="w-4 h-4" />
              <span>{uploadedImage ? 'Change Image' : 'Upload Image'}</span>
            </button>
          </div>

          {/* Show uploaded image preview */}
          {uploadedImage && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Uploaded Image:</p>
              <img 
                src={uploadedImage} 
                alt="Uploaded" 
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}

          {/* Model, Ratio, Style dropdowns */}
          <div className="grid grid-cols-3 gap-2">
            <CustomDropdown
              options={[
                { value: 'DALL-E 3', label: 'DALL-E 3' },
                { value: 'DALL-E 2', label: 'DALL-E 2' }
              ]}
              value={selectedModel}
              onChange={(value) => setSelectedModel(value)}
              placeholder="Select Model"
            />

            <CustomDropdown
              options={[
                { value: '1:1', label: '1:1' },
                { value: '16:9', label: '16:9' },
                { value: '4:3', label: '4:3' }
              ]}
              value={selectedRatio}
              onChange={(value) => setSelectedRatio(value)}
              placeholder="Select Ratio"
            />

            <CustomDropdown
              options={[
                { value: 'Natural', label: 'Natural' },
                { value: 'Artistic', label: 'Artistic' },
                { value: 'Vivid', label: 'Vivid' }
              ]}
              value={selectedStyle}
              onChange={(value) => setSelectedStyle(value)}
              placeholder="Select Style"
            />
          </div>

          {/* History Toggle Button */}
          <button
            onClick={onToggleHistory}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              isHistoryOpen 
                ? 'bg-[#faf7f4] text-[#C15F3C] border-2 border-[#C15F3C]' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-[#C15F3C]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{isHistoryOpen ? 'Hide History' : 'View History'}</span>
          </button>

          {/* Edit Button */}
          <button
            onClick={handleEdit}
            disabled={isSubmitting || isProcessing || !uploadedImage || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            <span>{isSubmitting || isProcessing ? 'Editing...' : 'Edit Image'}</span>
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Advanced Settings */}
      <div className="bg-[#f9f3f0] rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-4 hover:bg-white/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-700">Advanced Settings</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {showAdvanced && (
          <div className="px-4 pb-4 space-y-3 bg-white">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Edit Strength
              </label>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="70"
                className="w-full h-2 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}






