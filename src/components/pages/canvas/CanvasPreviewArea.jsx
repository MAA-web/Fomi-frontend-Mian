"use client";

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ChevronDown, 
  Settings, 
  Heart, 
  Download, 
  Share2, 
  MoreHorizontal,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";

export default function CanvasPreviewArea() {
  const [selectedModel, setSelectedModel] = useState('DALL-E 3');
  const [selectedStyle, setSelectedStyle] = useState('Natural');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const dropdownButtonStyle = "flex items-center space-x-2 text-sm bg-white p-2 rounded-lg border border-gray-200";
  const actionButtonStyle = "flex items-center justify-center w-full bg-white p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors";

  // Simulate live generation
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setGeneratedImages(prev => {
          const newImage = {
            id: Date.now(),
            url: `https://via.placeholder.com/400x400/${Math.floor(Math.random()*16777215).toString(16)}/FFFFFF?text=Live+${prev.length + 1}`,
            prompt: "Generated from canvas drawing",
            timestamp: new Date().toLocaleTimeString()
          };
          return [...prev, newImage];
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const startGeneration = () => {
    setIsGenerating(true);
    setGeneratedImages([]);
    setCurrentImageIndex(0);
  };

  const stopGeneration = () => {
    setIsGenerating(false);
  };

  const clearGenerated = () => {
    setGeneratedImages([]);
    setCurrentImageIndex(0);
  };

  const downloadImage = (imageUrl) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `canvas-generated-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="w-80 p-6 bg-[#f9f3f0] rounded-2xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Live Preview</h2>
        <p className="text-sm text-gray-600">Watch your canvas transform in real-time</p>
      </div>

      {/* Controls */}
      <div className="space-y-4 mb-6">
        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
          <button className={dropdownButtonStyle}>
            <span>{selectedModel}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Style Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
          <button className={dropdownButtonStyle}>
            <span>{selectedStyle}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Generation Controls */}
        <div className="flex space-x-2">
          <button 
            onClick={startGeneration}
            disabled={isGenerating}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
              isGenerating 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-[#C15F3C] text-white hover:bg-[#A54F32]'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Start</span>
          </button>
          <button 
            onClick={stopGeneration}
            disabled={!isGenerating}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
              !isGenerating 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            <Pause className="w-4 h-4" />
            <span>Stop</span>
          </button>
        </div>

        {/* Clear Button */}
        <button 
          onClick={clearGenerated}
          className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Clear All</span>
        </button>
      </div>

      {/* Live Preview Area */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Generated Images</h3>
          <span className="text-xs text-gray-500">{generatedImages.length} images</span>
        </div>

        {/* Preview Display */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {generatedImages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No images generated yet</p>
              <p className="text-xs text-gray-400 mt-1">Start generation to see live preview</p>
            </div>
          ) : (
            generatedImages.map((image, index) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                  <img
                    src={image.url}
                    alt={`Generated ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Image Info */}
                <div className="mt-2">
                  <p className="text-xs text-gray-600 truncate">{image.prompt}</p>
                  <p className="text-xs text-gray-400">{image.timestamp}</p>
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-xl">
                  <div className="flex space-x-2">
                    <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                    <button 
                      onClick={() => downloadImage(image.url)}
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <Share2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Live Indicator */}
                {index === generatedImages.length - 1 && isGenerating && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Generation Status */}
        {isGenerating && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-700">Generating live preview...</span>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Settings */}
      <div className="mt-6">
        <button className={actionButtonStyle}>
          <Settings className="w-4 h-4 mr-2" />
          <span className="font-medium">Advanced Settings</span>
          <ChevronDown className="w-4 h-4 absolute right-3" />
        </button>
      </div>
    </div>
  );
}









