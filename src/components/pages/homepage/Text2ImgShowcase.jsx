'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Text2ImgShowcase() {
  const [isHovered, setIsHovered] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const fullPrompt = 'Red lips being perfected by miniature workerss';

  // Typing animation
  useEffect(() => {
    if (!isHovered) {
      setDisplayedText('');
      return;
    }

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullPrompt.length) {
        setDisplayedText(fullPrompt.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setDisplayedText('');
          setTimeout(() => {
            currentIndex = 0;
            setDisplayedText('');
          }, 100);
        }, 3000);
      }
    }, 80);

    return () => clearInterval(typingInterval);
  }, [isHovered]);

  return (
    <div
      className="relative cursor-pointer"
      style={{
        width: '170px',
        height: '200px',
        position: 'relative',
        overflow: 'visible',
        zIndex: isHovered ? 9999 : 10, // ✅ ensures overlap on hover
        transform: isHovered ? 'scale(1.25)' : 'scale(1)',
        filter: isHovered ? 'brightness(1.1)' : 'brightness(1)',
        transition: 'transform 0.5s ease, filter 0.4s ease, z-index 0.1s linear',
        pointerEvents: 'auto',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div
        className="relative w-full h-full rounded-lg shadow-lg transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          pointerEvents: 'none',
          overflow: 'visible',
        }}
      >
        {/* Base Image */}
        <Image
          src="/collage/text2img.jpeg"
          alt="Text to Image Showcase"
          width={180}
          height={200}
          className="absolute top-0 left-0 w-full h-full object-cover rounded-lg transition-transform duration-500 ease-in-out"
          style={{
            transform: isHovered ? 'scale(1.01)' : 'scale(1)',
            borderRadius: '12px',
          }}
        />

        {/* Prompt Text Overlay */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-4 text-white text-xs font-medium transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            pointerEvents: 'none',
          }}
        >
          {displayedText}
          {isHovered && displayedText.length < fullPrompt.length && (
            <span className="inline-block w-0.5 h-3 bg-white ml-1 animate-pulse"></span>
          )}
        </div>
      </div>
    </div>
  );
}
