import { Play, Clock, Settings, Download, Share, Heart, MoreHorizontal } from "lucide-react"

export default function VideoPromptPair({ prompt, video, model, duration, timestamp }) {
  return (
    <div className="flex gap-4">
      {/* Left Side - Prompt and Model Info */}
      <div className="w-64 flex-shrink-0 bg-[#f9f3f0] rounded-2xl p-4 border">
        <div className="mb-3">
          <p className="text-sm text-gray-700 leading-relaxed">{prompt}</p>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded-lg">{model}</span>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">{duration}</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-400">{timestamp}</div>
      </div>

      {/* Right Side - Video */}
      <div className="flex-1">
        <div className="bg-white rounded-2xl p-4 border">
          <div className="relative group">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {/* Placeholder for video thumbnail */}
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <div className="text-gray-400 text-xs">Generated Video</div>
              </div>
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black bg-opacity-50 rounded-full p-3">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
              </div>
              
              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {duration}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-1 text-xs text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50">
                <Play className="w-3 h-3" />
                <span>Play</span>
              </button>
              <button className="flex items-center space-x-1 text-xs text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50">
                <Heart className="w-3 h-3" />
                <span>Like</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-1">
              <button className="text-xs text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-50">
                <Download className="w-3 h-3" />
              </button>
              <button className="text-xs text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-50">
                <Share className="w-3 h-3" />
              </button>
              <button className="text-xs text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-50">
                <MoreHorizontal className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
