'use client';

import { useState, useEffect, useRef } from 'react';

export default function VideoShowcase() {
  const [isHovered, setIsHovered] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const videoRef = useRef(null);
  const fullPrompt = 'anime style korean guy happily riding a bike';
  
  useEffect(() => {
    if (!isHovered) {
      setDisplayedText('');
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      return;
    }

    if (videoRef.current) {
      videoRef.current.play();
    }

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullPrompt.length) {
        setDisplayedText(fullPrompt.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          currentIndex = 0;
          setDisplayedText('');
        }, 3100);
      }
    }, 80);

    return () => clearInterval(typingInterval);
  }, [isHovered]);

  return (
    <div 
      className="relative cursor-pointer transition-all duration-300 ease-in-out"
      style={{ 
        width: '210px', 
        height: '160px',
        zIndex: isHovered ? 9999 : 15,
        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        pointerEvents: 'auto'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="relative w-full h-full rounded-lg overflow-visible shadow-lg" // ✅ overflow-visible ensures it isn’t clipped
        style={{ pointerEvents: 'none' }}
      >
        <video 
          ref={videoRef}
          src="/collage/vidshow.mp4"
          className="w-full h-full object-cover rounded-lg"
          muted
          loop
          style={{ pointerEvents: 'none' }}
        />
        
        {isHovered && (
          <div className="absolute bottom-0 left-0 right-0 p-2 pointer-events-none">
            <p className="text-white text-xs font-medium drop-shadow-lg">
              {displayedText}
              {displayedText.length < fullPrompt.length && (
                <span className="inline-block w-0.5 h-3 bg-white ml-1 animate-pulse"></span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
