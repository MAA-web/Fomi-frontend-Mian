"use client";

import { Heart, Download, Share2, MoreHorizontal } from "lucide-react";

export default function ImagePromptPair({ prompt, model, images, timestamp }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      {/* Prompt and Model Info */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">{model}</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">{timestamp}</span>
          </div>
        </div>
        <p className="text-sm text-gray-700">{prompt}</p>
      </div>

      {/* Generated Images Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
              <img
                src={image}
                alt={`Generated image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Hover overlay with action buttons */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2">
                <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
                <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
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
          </div>
        ))}
      </div>
    </div>
  );
}








