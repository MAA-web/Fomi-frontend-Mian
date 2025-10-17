"use client";

import ImagePromptPair from "./ImagePromptPair";

export default function ImagePromptContainer() {
  // Sample data - in a real app, this would come from your state management
  const displayGenerations = [
    {
      id: 1,
      prompt: "A beautiful sunset over mountains with vibrant colors",
      model: "DALL-E 3",
      images: [
        "https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Image+1",
        "https://via.placeholder.com/400x400/4ECDC4/FFFFFF?text=Image+2",
        "https://via.placeholder.com/400x400/45B7D1/FFFFFF?text=Image+3",
        "https://via.placeholder.com/400x400/96CEB4/FFFFFF?text=Image+4"
      ],
      timestamp: "2 hours ago"
    },
    {
      id: 2,
      prompt: "A futuristic cityscape with flying cars and neon lights",
      model: "DALL-E 3",
      images: [
        "https://via.placeholder.com/400x400/FFE66D/000000?text=Image+1",
        "https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Image+2",
        "https://via.placeholder.com/400x400/4ECDC4/FFFFFF?text=Image+3",
        "https://via.placeholder.com/400x400/45B7D1/FFFFFF?text=Image+4"
      ],
      timestamp: "5 hours ago"
    }
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      {displayGenerations.map((generation) => (
        <ImagePromptPair
          key={generation.id}
          prompt={generation.prompt}
          model={generation.model}
          images={generation.images}
          timestamp={generation.timestamp}
        />
      ))}
    </div>
  );
}








