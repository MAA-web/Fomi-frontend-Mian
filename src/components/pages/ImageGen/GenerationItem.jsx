'use client';

import Image from 'next/image';

export default function GenerationItem({ generation }) {
  return (
    <div style={{
      display: 'flex',
      gap: '20px',
      marginBottom: '32px'
    }}>
      {/* Prompt Section - Left */}
      <div style={{
        width: '320px',
        flexShrink: 0
      }}>
        <div style={{
          background: '#F9EFEB99',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <p style={{
            fontSize: '13px',
            lineHeight: '1.5',
            color: '#333',
            margin: 0,
            fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            {generation.prompt}
          </p>
          <div style={{
            background: 'white',
            padding: '6px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#666',
            border: '1px solid #e0e0e0',
            alignSelf: 'flex-start',
            fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            <span>{generation.model}</span>
          </div>
        </div>
      </div>

      {/* Images Grid - Right */}
      <div style={{
        flex: 1,
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {generation.images.map((img, idx) => (
          <div key={idx} style={{
            width: '200px',
            height: '240px',
            borderRadius: '12px',
            overflow: 'hidden',
            background: 'white',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
          }}
          >
            <Image
              src={img}
              alt={`Generated ${idx + 1}`}
              width={200}
              height={240}
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                objectFit: 'cover'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

