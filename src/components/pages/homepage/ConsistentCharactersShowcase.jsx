'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ConsistentCharactersShowcase() {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const images = ['/collage/cons1.jpeg', '/collage/cons2.jpeg', '/collage/cons3.jpeg'];
  
  useEffect(() => {
    if (!isHovered) {
      setCurrentImageIndex(0);
      setOpacity(1);
      return;
    }

    let slideshowInterval;

    // Start slideshow immediately when hovered
    slideshowInterval = setInterval(() => {
      // Fade out
      setOpacity(0);
      
      // Change image in the middle of fade
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        // Fade in
        setTimeout(() => {
          setOpacity(1);
        }, 50);
      }, 300); // Change image after 300ms
    }, 2000); // Change image every 2 seconds

    return () => {
      if (slideshowInterval) clearInterval(slideshowInterval);
    };
  }, [isHovered]);

  return (
    <div 
      className="relative cursor-pointer transition-all duration-300 ease-in-out"
      style={{ 
        width: '160px', 
        height: '150px',
        zIndex: isHovered ? 100 : 15,
        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        pointerEvents: 'auto'
      }}
      onMouseEnter={() => {
        console.log('ConsistentCharactersShowcase: Mouse entered');
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        console.log('ConsistentCharactersShowcase: Mouse left');
        setIsHovered(false);
      }}
    >
      <div 
        className="relative w-full h-full rounded-lg overflow-hidden shadow-lg"
        style={{ pointerEvents: 'none' }}
      >
        <Image 
          src={images[currentImageIndex]}
          alt={`Consistent Characters ${currentImageIndex + 1}`} 
          width={160}
          height={150}
          className="object-cover"
          style={{ 
            width: '100%', 
            height: '100%',
            objectPosition: 'center',
            pointerEvents: 'none',
            opacity: opacity,
            transition: 'opacity 300ms ease-in-out'
          }}
        />
      </div>
    </div>
  );
}

