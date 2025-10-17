import { RotateCcw, RotateCw, Download, Pencil, Eraser } from "lucide-react"

export default function InpaintCanvas() {
  return (
    <div className="flex-1 flex">
      {/* Main Canvas Area */}
      <div className="flex-1 bg-white rounded-2xl border relative">
        {/* Action Buttons - Top Left */}
        <div className="absolute top-4 left-4 flex space-x-2 z-10">
          <button className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
            <RotateCcw className="w-4 h-4 text-gray-600" />
          </button>
          <button className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
            <RotateCw className="w-4 h-4 text-gray-600" />
          </button>
          <button className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Canvas Content */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-gray-400 text-sm">
            Upload an image to start inpainting
          </div>
        </div>
      </div>

      {/* Right Sidebar - Tools */}
      <div className="w-16 ml-4 flex flex-col items-center space-y-4">
        {/* Tool Icons */}
        <div className="bg-white rounded-2xl p-3 flex flex-col space-y-3">
          <button className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
            <Pencil className="w-4 h-4 text-gray-600" />
          </button>
          <button className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
            <Eraser className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Opacity Slider */}
        <div className="bg-white rounded-2xl p-3 flex flex-col items-center">
          <div className="w-8 h-32 bg-gray-100 rounded-lg relative">
            {/* Slider Track */}
            <div className="absolute inset-2 bg-gray-200 rounded-full"></div>
            
            {/* Slider Thumb */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gray-600 rounded-full"></div>
          </div>
          
          {/* Percentage Label */}
          <div className="mt-2 text-xs text-gray-500 font-medium">
            25%
          </div>
        </div>
      </div>
    </div>
  )
}








