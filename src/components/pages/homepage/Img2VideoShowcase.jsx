'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function Img2VideoShowcase() {
  const [isHovered, setIsHovered] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef(null);
  const fullPrompt = 'Dreamlike scene of fish swimming in the water and air';
  
  useEffect(() => {
    if (!isHovered) {
      setDisplayedText('');
      setShowVideo(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      return;
    }

    // Start typing animation first
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullPrompt.length) {
        setDisplayedText(fullPrompt.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        // Start video after typing completes
        setShowVideo(true);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play();
          }
        }, 100);
        // Loop: reset after 3 seconds of showing video
        setTimeout(() => {
          setShowVideo(false);
          setDisplayedText('');
          setTimeout(() => {
            currentIndex = 0;
            setDisplayedText('');
          }, 100);
        }, 3100);
      }
    }, 40);

    return () => clearInterval(typingInterval);
  }, [isHovered]);

  return (
    <div 
      className="relative cursor-pointer transition-all duration-300 ease-in-out"
      style={{ 
        width: '210px', 
        height: '130px',
        zIndex: isHovered ? 100 : 15,
        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        pointerEvents: 'auto'
      }}
      onMouseEnter={() => {
        console.log('Img2VideoShowcase: Mouse entered');
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        console.log('Img2VideoShowcase: Mouse left');
        setIsHovered(false);
      }}
    >
      <div 
        className="relative w-full h-full rounded-lg overflow-hidden shadow-lg"
        style={{ pointerEvents: 'none' }}
      >
        {!showVideo ? (
          <Image 
            src="/collage/img2video.jpeg"
            alt="Image to Video Showcase" 
            width={200}
            height={100}
            className="object-cover transition-all duration-500 ease-in-out"
            style={{ 
              width: isHovered ? '120%' : '100%', 
              height: isHovered ? '120%' : '100%',
              objectPosition: 'center',
              pointerEvents: 'none'
            }}
          />
        ) : (
          <video 
            ref={videoRef}
            src="/collage/img2video.webm"
            className="w-full h-full object-cover"
            muted
            loop
            style={{ 
              pointerEvents: 'none'
            }}
          />
        )}
        
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

