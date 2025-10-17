import VideoPromptPair from "./VideoPromptPair"

export default function VideoPromptContainer({ generations = [] }) {
  // Sample data - only used when no generations are passed
  const sampleGenerations = [
    {
      id: 1,
      prompt: "A serene mountain landscape with flowing clouds and gentle sunlight",
      video: "/video-thumbnails/mountain-landscape-1.jpg",
      model: "Video Model 1",
      duration: "15s",
      timestamp: "2 minutes ago"
    },
    {
      id: 2,
      prompt: "A bustling city street with people walking and cars moving",
      video: "/video-thumbnails/city-street-1.jpg",
      model: "Video Model 2",
      duration: "20s",
      timestamp: "5 minutes ago"
    },
    {
      id: 3,
      prompt: "A peaceful ocean wave crashing against rocky cliffs at sunset",
      video: "/video-thumbnails/ocean-waves-1.jpg",
      model: "Video Model 1",
      duration: "12s",
      timestamp: "10 minutes ago"
    },
    {
      id: 4,
      prompt: "A magical forest with glowing fireflies and mystical creatures",
      video: "/video-thumbnails/magical-forest-1.jpg",
      model: "Video Model 3",
      duration: "18s",
      timestamp: "15 minutes ago"
    }
  ]

  // Use provided generations or fall back to sample data
  const displayGenerations = generations.length > 0 ? generations : sampleGenerations

  return (
    <div className="flex-1 flex flex-col gap-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      {displayGenerations.map((generation) => (
        <VideoPromptPair
          key={generation.id}
          prompt={generation.prompt}
          video={generation.video}
          model={generation.model}
          duration={generation.duration}
          timestamp={generation.timestamp}
        />
      ))}
    </div>
  )
}
