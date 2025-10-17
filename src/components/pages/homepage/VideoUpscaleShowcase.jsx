'use client';

import { useState, useEffect, useRef } from 'react';

export default function VideoUpscaleShowcase() {
  const [isHovered, setIsHovered] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50); // percentage
  const lowQualityVideoRef = useRef(null);
  const highQualityVideoRef = useRef(null);

  useEffect(() => {
    if (!isHovered) {
      setSliderPosition(50);
      if (lowQualityVideoRef.current) {
        lowQualityVideoRef.current.pause();
        lowQualityVideoRef.current.currentTime = 0;
      }
      if (highQualityVideoRef.current) {
        highQualityVideoRef.current.pause();
        highQualityVideoRef.current.currentTime = 0;
      }
      return;
    }

    // Play both videos on hover
    lowQualityVideoRef.current?.play();
    highQualityVideoRef.current?.play();

    // Animate slider left and right smoothly
    let position = 50;
    let direction = 1;

    const animateSlider = setInterval(() => {
      position += direction * 1.5; // slower for smoother motion
      if (position >= 80) direction = -1;
      else if (position <= 20) direction = 1;
      setSliderPosition(position);
    }, 40); // faster updates = smoother

    return () => clearInterval(animateSlider);
  }, [isHovered]);

  return (
    <div
      className="relative cursor-pointer transition-all duration-300 ease-in-out"
      style={{
        width: '200px',
        height: '160px',
        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        zIndex: isHovered ? 9999 : 1, // overlaps everything on hover
        pointerEvents: 'auto',
        overflow: 'visible', // prevents clipping
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative w-full h-full rounded-lg overflow-visible shadow-lg"
        style={{ pointerEvents: 'none' }}
      >
        {/* Low quality video */}
        <div className="absolute top-0 left-0 w-full h-full">
          <video
            ref={lowQualityVideoRef}
            src="/collage/v2vlow.webm"
            className="w-full h-full object-cover rounded-lg"
            muted
            loop
            style={{ pointerEvents: 'none' }}
          />
        </div>

        {/* High quality video clipped by slider */}
        <div
          className="absolute top-0 left-0 h-full overflow-hidden"
          style={{
            width: `${sliderPosition}%`,
            transition: isHovered ? 'none' : 'width 0.3s ease-out',
          }}
        >
          <div style={{ width: '200px', height: '160px', position: 'relative' }}>
            <video
              ref={highQualityVideoRef}
              src="/collage/v2vhigh.webm"
              className="w-full h-full object-cover rounded-lg"
              muted
              loop
              style={{ pointerEvents: 'none' }}
            />
          </div>
        </div>

        {/* Comparison line */}
        <div
          className="absolute top-0 h-full bg-white"
          style={{
            left: `${sliderPosition}%`,
            width: '1px',
            pointerEvents: 'none',
            boxShadow: '0 0 2px rgba(0,0,0,0.5)',
            transition: isHovered ? 'none' : 'left 0.3s ease-out',
          }}
        />

        {/* Slider handle */}
        <div
          className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full border-2 border-gray-300"
          style={{
            left: `${sliderPosition}%`,
            width: '16px',
            height: '16px',
            pointerEvents: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            transition: isHovered ? 'none' : 'left 0.3s ease-out',
          }}
        />
      </div>
    </div>
  );
}