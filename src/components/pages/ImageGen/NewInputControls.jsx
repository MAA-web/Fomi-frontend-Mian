'use client';

import { useState } from 'react';
import CustomDropdown from '@/components/ui/CustomDropdown';

export default function NewInputControls({ 
  prompt, 
  onPromptChange, 
  onGenerate, 
  model, 
  onModelChange,
  models = [],
  imageCount = 1,
  onImageCountChange,
  aspectRatio = '1:1',
  onAspectRatioChange,
  isGenerating = false
}) {
  const [showAdvance, setShowAdvance] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div style={{
      width: '380px',
      background: '#F9EFEB99',
      borderRadius: '16px',
      padding: '24px 24px 8px 24px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: '1px solid #f0f0f0',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
             {/* Prompt Section with white background */}
             <div style={{
               background: 'white',
               borderRadius: '16px',
               padding: '20px',
               display: 'flex',
               flexDirection: 'column',
               position: 'relative'
             }}>
               <textarea
                 placeholder="Describe you imaginations to be converted to piece of art ..."
                 value={prompt}
                 onChange={(e) => onPromptChange(e.target.value)}
                 rows={8}
                 style={{
                   width: '100%',
                   border: 'none',
                   background: 'transparent',
                   fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                   fontSize: '15px',
                   color: '#333',
                   resize: 'none',
                   outline: 'none',
                   lineHeight: '1.6',
                   paddingBottom: '60px'
                 }}
               />
               <button 
                 onClick={onGenerate}
                 disabled={isGenerating}
                 style={{
                   position: 'absolute',
                   bottom: '16px',
                   right: '16px',
                   padding: '10px 20px',
                   backgroundColor: isGenerating ? '#e0e0e0' : '#f5f5f5',
                   color: isGenerating ? '#999' : '#333',
                   border: 'none',
                   borderRadius: '8px',
                   fontSize: '14px',
                   fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                   fontWeight: '500',
                   cursor: isGenerating ? 'not-allowed' : 'pointer',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '6px',
                   transition: 'all 0.2s ease',
                   boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                 }}
                 onMouseEnter={(e) => {
                   if (!isGenerating) {
                     e.target.style.backgroundColor = '#e9e9e9';
                     e.target.style.transform = 'translateY(-1px)';
                   }
                 }}
                 onMouseLeave={(e) => {
                   if (!isGenerating) {
                     e.target.style.backgroundColor = '#f5f5f5';
                     e.target.style.transform = 'translateY(0)';
                   }
                 }}
               >
                 <span style={{ fontSize: '14px', fontWeight: 'bold' }}>✦</span>
                 {isGenerating ? 'Generating...' : 'Generate'}
               </button>
             </div>

      {/* Parameter Dropdowns */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <CustomDropdown
          options={[
            { value: 1, label: '1 Image' },
            { value: 2, label: '2 Images' },
            { value: 3, label: '3 Images' },
            { value: 4, label: '4 Images' }
          ]}
          value={imageCount}
          onChange={(value) => onImageCountChange && onImageCountChange(value)}
          placeholder="Select images"
          className="flex-1"
        />

        <CustomDropdown
          options={[
            { value: '1:1', label: '1:1' },
            { value: '16:9', label: '16:9' },
            { value: '9:16', label: '9:16' },
            { value: '4:3', label: '4:3' },
            { value: '3:4', label: '3:4' }
          ]}
          value={aspectRatio}
          onChange={(value) => onAspectRatioChange && onAspectRatioChange(value)}
          placeholder="Aspect ratio"
          className="flex-1"
        />

        <CustomDropdown
          options={
            models.length > 0
              ? models.map((modelOption) => ({
                  value: modelOption.name,
                  label: modelOption.name
                }))
              : [
                  { value: 'Model', label: 'Model' },
                  { value: 'FLUX', label: 'FLUX' },
                  { value: 'Stable Diffusion', label: 'Stable Diffusion' },
                  { value: 'DALL-E', label: 'DALL-E' }
                ]
          }
          value={model}
          onChange={(value) => onModelChange(value)}
          placeholder="Select model"
          className="flex-1"
        />
      </div>

      {/* Collapsible Sections */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #e0e0e0'
      }}>
        <button 
          onClick={() => setShowAdvance(!showAdvance)}
          style={{
            width: '100%',
            padding: '16px 20px',
            background: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '15px',
            fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: '500',
            color: '#333',
            transition: 'background-color 0.2s ease',
            textAlign: 'center',
            position: 'relative'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f9f9f9'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
        >
          Advance
          <span style={{ 
            fontSize: '12px', 
            color: '#666',
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)'
          }}>
            {showAdvance ? '▲' : '▼'}
          </span>
        </button>
        {showAdvance && (
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid #e0e0e0',
            backgroundColor: '#fafafa'
          }}>
            <p style={{ margin: 0, color: '#666' }}>Advanced options will go here...</p>
          </div>
        )}
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #e0e0e0'
      }}>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          style={{
            width: '100%',
            padding: '16px 20px',
            background: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '15px',
            fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: '500',
            color: '#333',
            transition: 'background-color 0.2s ease',
            textAlign: 'center',
            position: 'relative'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f9f9f9'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
        >
          History
          <span style={{ 
            fontSize: '12px', 
            color: '#666',
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)'
          }}>
            {showHistory ? '▲' : '▼'}
          </span>
        </button>
        {showHistory && (
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid #e0e0e0',
            backgroundColor: '#fafafa'
          }}>
            <p style={{ margin: 0, color: '#666' }}>History will go here...</p>
          </div>
        )}
      </div>
    </div>
  );
}
