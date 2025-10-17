'use client'

import { Download, Share2, Heart, Clock, CheckCircle, Loader2, Maximize2, X } from "lucide-react"
import { useState } from "react"

export default function MessageItem({
  prompt,
  model,
  status,
  timestamp,
  images = [],
  isGenerating = false,
  isHistorical = false
}) {
  const [hoveredImage, setHoveredImage] = useState(null)
  const [fullscreenImage, setFullscreenImage] = useState(null)
  const [imageErrors, setImageErrors] = useState(new Set())

  const handleImageError = (imageIndex) => {
    setImageErrors(prev => new Set([...prev, imageIndex]))
  }

  const isImageError = (imageIndex) => {
    return imageErrors.has(imageIndex)
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
      case 'queued':
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'processing':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'queued':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <>
      {/* Main Message Container */}
      <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors duration-200 ${isHistorical ? 'bg-gray-50 border-gray-300' : 'bg-[#f9f3f0] border-gray-200'}`}>
      {/* Message Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-lg leading-relaxed flex-1 pr-4">
            {prompt}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 flex-shrink-0">
            {getStatusIcon()}
            <span className="capitalize">{status}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="font-medium">{model}</span>
            <span className="text-gray-400">•</span>
            <span>{timestamp.toLocaleTimeString()}</span>
          </div>

          {images.length > 0 && (
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-[#f9f3f0] rounded-lg transition-colors">
                <Download className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-[#f9f3f0] rounded-lg transition-colors">
                <Share2 className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-[#f9f3f0] rounded-lg transition-colors">
                <Heart className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative group"
                onMouseEnter={() => setHoveredImage(index)}
                onMouseLeave={() => setHoveredImage(null)}
              >
                {image.url && !isImageError(index) ? (
                    <div className="relative overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                    <img
                      src={image.url}
                      alt={`Generated image ${index + 1}`}
                      className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                      onLoad={() => console.log('✅ Image loaded successfully:', image.url)}
                      onError={(e) => {
                        console.error('❌ Image failed to load:', image.url, e);
                        handleImageError(index);
                      }}
                    />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        image.status === 'completed' ? 'bg-green-500 text-white' :
                        image.status === 'processing' ? 'bg-blue-500 text-white' :
                        'bg-yellow-500 text-white'
                      }`}>
                        {image.status}
                      </span>
                    </div>

                    {/* Hover Overlay */}
                    {hoveredImage === index && (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 to-pink-900/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex gap-2">
                          <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                            <Download className="w-4 h-4 text-white" />
                          </button>
                          <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                            <Heart className="w-4 h-4 text-white" />
                          </button>
                          <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                            <Share2 className="w-4 h-4 text-white" />
                          </button>
                          {!isImageError(index) && (
                            <button
                              onClick={() => setFullscreenImage({ url: image.url, index: index + 1, status: image.status })}
                              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                            >
                              <Maximize2 className="w-4 h-4 text-white" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Image Number */}
                    <div className="absolute bottom-3 right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {index + 1}
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      {image.status === 'completed' ? (
                        <>
                          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-white text-xs">?</span>
                          </div>
                          <p className="text-xs text-gray-600 font-medium">No Image</p>
                          <p className="text-xs text-gray-400 mt-1">Image {index + 1}</p>
                        </>
                      ) : (
                        <>
                          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-2" />
                          <p className="text-xs text-purple-600 font-medium capitalize">{image.status}</p>
                          <p className="text-xs text-purple-400 mt-1">Image {index + 1}</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading state for new messages */}
      {isGenerating && images.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Generating your images...</h3>
            <p className="text-gray-500 max-w-sm">
              This may take a few moments. Our AI is crafting something amazing just for you.
            </p>
          </div>
        </div>
      )}
      </div>

      {/* Fullscreen Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-5xl max-h-full">
            {/* Close Button */}
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Fullscreen Image */}
            <div className="relative">
              {fullscreenImage.url && !isImageError(fullscreenImage.index - 1) ? (
                <img
                  src={fullscreenImage.url}
                  alt={`Generated image ${fullscreenImage.index}`}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                  onError={() => handleImageError(fullscreenImage.index - 1)}
                />
              ) : (
                <div className="w-full max-w-md max-h-[80vh] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center p-8">
                    <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-xl">?</span>
                    </div>
                    <p className="text-gray-600 font-medium">No Image Available</p>
                    <p className="text-gray-400 text-sm mt-1">Image {fullscreenImage.index}</p>
                  </div>
                </div>
              )}

              {/* Image Info Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    fullscreenImage.status === 'completed' ? 'bg-green-500 text-white' :
                    fullscreenImage.status === 'processing' ? 'bg-blue-500 text-white' :
                    'bg-yellow-500 text-white'
                  }`}>
                    {fullscreenImage.status}
                  </span>
                  <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Image {fullscreenImage.index}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors">
                    <Download className="w-5 h-5 text-white" />
                  </button>
                  <button className="p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors">
                    <Heart className="w-5 h-5 text-white" />
                  </button>
                  <button className="p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors">
                    <Share2 className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
