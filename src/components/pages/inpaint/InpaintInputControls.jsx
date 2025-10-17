import { ChevronDown, Sparkles, Plus, Image as ImageIcon } from "lucide-react"

export default function InpaintInputControls() {
  // Common styles
  const buttonStyle = "flex items-center space-x-2 text-sm text-gray-700"
  const sectionStyle = "mb-6"
  const dropdownButtonStyle = "flex items-center space-x-2 text-sm bg-white p-1 rounded-lg"
  const actionButtonStyle = "flex items-center justify-center w-full bg-white p-2 rounded-2xl relative"
  
  return (
    <div className="w-80 p-6 bg-[#f9f3f0] rounded-2xl">
      {/* New Project Button */}
      <div className={sectionStyle}>
        <button className="w-full h-16 bg-white rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors">
          <Plus className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      {/* Image Gallery/History */}
      <div className={sectionStyle}>
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {/* Sample image thumbnails */}
          {Array.from({ length: 15 }, (_, i) => (
            <div key={i} className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>
      </div>

      {/* Prompt Input Area */}
      <div className={sectionStyle}>
        <div className="border rounded-2xl bg-[#fefdfc]">
          <div className="p-4 min-h-32">
            <textarea
              placeholder="Describe what you want to inpaint..."
              className="w-full h-20 text-[13px] resize-none border-none outline-none text-gray-600 placeholder-gray-400"
            />
            <div className="flex items-center justify-end mt-32">
              <div className="flex items-center justify-end w-fit bg-[#f5f5f5] p-2 rounded-2xl font-semibold space-x-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">Inpaint</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inpaint Controls */}
      <div className={`space-y-4 ${sectionStyle}`}>
        <div className="flex items-center space-x-4">
          <button className={dropdownButtonStyle}>
            <span>Model</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <button className={dropdownButtonStyle}>
            <span>Brush Size</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Advanced Section */}
      <div className={sectionStyle}>
        <button className={actionButtonStyle}>
          <span className="font-medium">Advance</span>
          <ChevronDown className="w-4 h-4 absolute right-3" />
        </button>
      </div>

      {/* History Section */}
      <div>
        <button className={actionButtonStyle}>
          <span className="font-medium">History</span>
          <ChevronDown className="w-4 h-4 absolute right-3" />
        </button>
      </div>
    </div>
  )
}






