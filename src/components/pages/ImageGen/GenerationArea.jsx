'use client';

import GenerationItem from './GenerationItem';

export default function GenerationArea({ generations }) {
  return (
    <div style={{
      flex: 1,
      padding: '24px',
      overflowY: 'auto',
      overflowX: 'hidden',
      background: 'white'
    }}>
      {generations.length === 0 ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#999',
          fontSize: '16px',
          fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textAlign: 'center'
        }}>
          <p>No generations yet. Start by entering a prompt and clicking Generate!</p>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          {generations.map((generation) => (
            <GenerationItem key={generation.id} generation={generation} />
          ))}
        </div>
      )}
    </div>
  );
}

