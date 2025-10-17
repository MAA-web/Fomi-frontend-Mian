'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function UpscaleShowcase() {
  const [isHovered, setIsHovered] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);

  useEffect(() => {
    if (!isHovered) {
      setSliderPosition(50);
      return;
    }

    let position = 50;
    let direction = 1;

    const animateSlider = setInterval(() => {
      position += direction * 2;
      if (position >= 80) direction = -1;
      else if (position <= 20) direction = 1;
      setSliderPosition(position);
    }, 50);

    return () => clearInterval(animateSlider);
  }, [isHovered]);

  return (
    <div
      className="relative cursor-pointer"
      style={{
        width: '210px',
        height: '160px',
        transform: isHovered ? 'scale(1.12) translateY(-4px)' : 'scale(1) translateY(0)',
        filter: isHovered ? 'brightness(1.12)' : 'brightness(1)',
        zIndex: isHovered ? 99999 : 'auto',
        pointerEvents: 'auto',
        transition: `
          transform 0.55s cubic-bezier(0.25, 1, 0.3, 1),
          filter 0.55s ease,
          box-shadow 0.55s ease,
          z-index 0s linear
        `,
        boxShadow: isHovered
          ? '0 14px 30px rgba(0, 0, 0, 0.3)'
          : '0 4px 10px rgba(0, 0, 0, 0.2)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative w-full h-full rounded-lg overflow-visible shadow-lg"
        style={{
          pointerEvents: 'none',
          height: '100%',
        }}
      >
        {/* After image (background) */}
        <div className="absolute top-0 left-0 w-full h-full">
          <Image
            src="/collage/upscale2.jpeg"
            alt="After Upscale"
            width={210}
            height={160}
            className="object-cover"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              pointerEvents: 'none',
              borderRadius: '8px',
            }}
          />
        </div>

        {/* Before image (foreground) */}
        <div
          className="absolute top-0 left-0 h-full overflow-hidden"
          style={{
            width: `${sliderPosition}%`,
            transition: isHovered ? 'none' : 'width 0.35s ease-out',
          }}
        >
          <div style={{ width: '210px', height: '160px', position: 'relative' }}>
            <Image
              src="/collage/upscale1.jpeg"
              alt="Before Upscale"
              width={210}
              height={160}
              className="object-cover"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
                borderRadius: '8px',
              }}
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
            boxShadow: '0 0 3px rgba(0, 0, 0, 0.4)',
            transition: isHovered ? 'none' : 'left 0.35s ease-out',
          }}
        />

        {/* Slider handle */}
        <div
          className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full border border-gray-400"
          style={{
            left: `${sliderPosition}%`,
            width: '14px',
            height: '14px',
            pointerEvents: 'none',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
            transition: isHovered ? 'none' : 'left 0.35s ease-out',
          }}
        />

        {/* Labels */}
        {isHovered && (
          <>
            <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded pointer-events-none">
              Before
            </div>
            <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded pointer-events-none">
              After
            </div>
          </>
        )}
      </div>
    </div>
  );
}
