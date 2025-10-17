'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function EditShowcase() {
  const [isHovered, setIsHovered] = useState(false);
  const [showEdit2, setShowEdit2] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const fullPrompt = 'A dog wearing a bowler hat';

  // Typing animation
  useEffect(() => {
    if (!isHovered) {
      setDisplayedText('');
      setShowEdit2(false);
      return;
    }

    setShowEdit2(true);
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex <= fullPrompt.length) {
        setDisplayedText(fullPrompt.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setShowEdit2(false);
          setDisplayedText('');
          setTimeout(() => {
            setShowEdit2(true);
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
      className="relative cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        width: '180px',
        height: '160px',
        transform: isHovered ? 'scale(1.25)' : 'scale(1)',
        filter: isHovered ? 'brightness(1.1)' : 'brightness(1)',
        position: 'relative',
        zIndex: isHovered ? 9999 : 10, // hover-only overlap
        pointerEvents: 'auto',
        transition: 'transform 0.4s ease, filter 0.4s ease, z-index 0s linear',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Add a wrapper with visible overflow so the enlarged image doesn't clip */}
      <div
        className="relative w-full h-full rounded-lg shadow-lg"
        style={{
          overflow: isHovered ? 'visible' : 'hidden',
          pointerEvents: 'none',
        }}
      >
        {/* Base Image */}
        <Image
          src="/collage/edit1.jpeg"
          alt="Edit Showcase 1"
          width={180}
          height={160}
          className="absolute top-0 left-0 w-full h-full object-cover rounded-lg transition-opacity duration-700 ease-in-out"
          style={{ opacity: showEdit2 ? 0 : 1 }}
        />

        {/* Overlay Image */}
        <Image
          src="/collage/edit2.jpeg"
          alt="Edit Showcase 2"
          width={180}
          height={160}
          className="absolute top-0 left-0 w-full h-full object-cover rounded-lg transition-opacity duration-700 ease-in-out"
          style={{ opacity: showEdit2 ? 1 : 0 }}
        />

        {/* Typing Text Overlay */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-4 text-white text-xs font-medium transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
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
