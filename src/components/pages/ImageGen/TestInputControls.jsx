'use client';

export default function TestInputControls({ prompt, onPromptChange, onGenerate }) {
  return (
    <div style={{ padding: '20px', background: '#F9EFEB99', borderRadius: '16px', width: '380px' }}>
      <h3>Test Input Controls</h3>
      <textarea
        placeholder="Enter prompt..."
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        style={{ width: '100%', height: '100px', marginBottom: '10px' }}
      />
      <button onClick={onGenerate}>Generate</button>
    </div>
  );
}
