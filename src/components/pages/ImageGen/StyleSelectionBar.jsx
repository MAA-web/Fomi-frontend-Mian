'use client';

import { useState } from 'react';
import Image from 'next/image';

const STYLE_IMAGES = [
  '/gallery/_rx8N2dN.jpg',
  '/gallery/09u0j5ik.jpg',
  '/gallery/3Yz3qNGE.jpg',
  '/gallery/4FkYmwFJ.jpg',
  '/gallery/8_eCINXe.jpg',
  '/gallery/8cUpeDq0.jpg',
  '/gallery/9Hjritoh.jpg',
  '/gallery/AU32Y9Nh.jpg',
  '/gallery/B_EPaqQC.jpg',
  '/gallery/CC0O4H52.jpg',
  '/gallery/cTlRiZql.jpg',
  '/gallery/feathers.jpg',
  '/gallery/FiR8mCO5.jpg',
  '/gallery/G9WmA6Gh.jpg',
  '/gallery/gallery__a_cyber_ninja_in_a_cyberpunk_style_standing_in_a_post-apocalyptic_desert_at_night_her_back_turned__knz1ivrhz1sefcedt3z1_0.png',
  '/gallery/gallery_carbon-footprint-technology-collage.jpg',
  '/gallery/gallery_freshness-beauty-nature-wet-drops-generated-by-ai.jpg',
  '/gallery/gallery_neon-geometric-background.jpg',
  '/gallery/gallery_view-3d-rasta-bird.jpg',
  '/gallery/hKTQ3Ws-.jpg',
  '/gallery/JKDvUPO9.jpg',
  '/gallery/kHxtWMIF.jpg',
  '/gallery/nNjdgAtp.jpg',
  '/gallery/nPW13t4_.jpg',
  '/gallery/PTn42AAw.jpg',
  '/gallery/q7vxtk7t.jpg',
  '/gallery/RQMQ8fIG.jpg',
  '/gallery/sjsQOADO.jpg',
  '/gallery/U22vERYg.jpg',
  '/gallery/UISYSj4M.jpg',
  '/gallery/UveKUVQz.jpg',
  '/gallery/Yy0a9H1v.jpg',
  '/gallery/zp_DdXvt.jpg'
];

export default function StyleSelectionBar({ selectedStyle, onStyleSelect }) {
  const [showAll, setShowAll] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      top: '100px',
      left: '0',
      right: '0',
      background: '#F9EFEB99',
      borderBottom: '1px solid #e0e0e0',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      zIndex: 999,
      backdropFilter: 'blur(10px)'
    }}>
      {/* Main Row */}
      <div style={{
        display: 'flex',
        gap: '12px',
        padding: '20px',
        alignItems: 'center'
      }}>
        {/* + Button for showing more styles */}
        <button 
          onClick={() => setShowAll(!showAll)}
          style={{
            minWidth: '80px',
            height: '80px',
            border: '2px solid #e0e0e0',
            background: 'white',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = '#999';
            e.target.style.backgroundColor = '#f9f9f9';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = '#e0e0e0';
            e.target.style.backgroundColor = 'white';
          }}
        >
          <span style={{
            fontSize: '32px',
            color: '#666',
            fontWeight: '300'
          }}>+</span>
        </button>

        {/* Style Images - stretch to fill available space */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flex: 1,
          paddingRight: '12px',
          justifyContent: 'space-between'
        }}>
          {STYLE_IMAGES.slice(0, 12).map((img, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                height: '80px',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: selectedStyle === index ? '2px solid #000' : '2px solid transparent',
                transition: 'all 0.2s ease',
                boxShadow: selectedStyle === index ? '0 0 0 2px rgba(0, 0, 0, 0.1)' : 'none'
              }}
              onClick={() => onStyleSelect(index)}
              onMouseEnter={(e) => {
                if (selectedStyle !== index) {
                  e.currentTarget.style.borderColor = '#666';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedStyle !== index) {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              <Image
                src={img}
                alt={`Style ${index + 1}`}
                width={80}
                height={80}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dropdown Row */}
      {showAll && (
        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '0 20px 20px 20px',
          flexWrap: 'wrap'
        }}>
          {STYLE_IMAGES.slice(12).map((img, index) => (
            <div
              key={index + 8}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: selectedStyle === (index + 12) ? '2px solid #000' : '2px solid transparent',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                boxShadow: selectedStyle === (index + 12) ? '0 0 0 2px rgba(0, 0, 0, 0.1)' : 'none',
                marginBottom: '12px'
              }}
              onClick={() => onStyleSelect(index + 12)}
              onMouseEnter={(e) => {
                if (selectedStyle !== (index + 12)) {
                  e.currentTarget.style.borderColor = '#666';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedStyle !== (index + 12)) {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              <Image
                src={img}
                alt={`Style ${index + 13}`}
                width={80}
                height={80}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

