'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export default function CustomDropdown({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select an option",
  className = "",
  disabled = false 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const selectedOption = options.find(option => option.value === value)

  const handleSelect = (option) => {
    onChange(option.value)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-2 py-2 text-[10px] border border-gray-300 rounded-2xl bg-[#faf7f4] 
          focus:ring-2 focus:ring-[#C15F3C] focus:border-transparent 
          transition-colors flex items-center justify-between whitespace-nowrap
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#C15F3C] cursor-pointer'}
        `}
      >
        <span className="text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
          <div className="py-1">
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={`
                  w-full px-3 py-2 text-left text-[10px] transition-colors whitespace-nowrap
                  ${value === option.value 
                    ? 'bg-[#faf7f4] text-[#C15F3C] font-medium' 
                    : 'text-gray-700 hover:bg-[#faf7f4]'
                  }
                  ${index === 0 ? 'rounded-t-2xl' : ''}
                  ${index === options.length - 1 ? 'rounded-b-2xl' : ''}
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

