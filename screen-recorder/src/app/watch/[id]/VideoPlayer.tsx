'use client';

import { useRef, useEffect, useState } from 'react';

interface VideoPlayerProps {
  videoId: string;
  videoUrl: string;
}

export default function VideoPlayer({ videoId, videoUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [hasTrackedComplete, setHasTrackedComplete] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const trackView = async () => {
      if (hasTrackedView) return;
      setHasTrackedView(true);
      
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          videoId, 
          event: 'view',
          duration: video.duration 
        }),
      });
    };

    const trackComplete = async () => {
      if (hasTrackedComplete) return;
      const watchedPercent = (video.currentTime / video.duration) * 100;
      
      if (watchedPercent >= 90) {
        setHasTrackedComplete(true);
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId, event: 'complete' }),
        });
      }
    };

    video.addEventListener('play', trackView);
    video.addEventListener('timeupdate', trackComplete);

    return () => {
      video.removeEventListener('play', trackView);
      video.removeEventListener('timeupdate', trackComplete);
    };
  }, [videoId, hasTrackedView, hasTrackedComplete]);

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      controls
      className="w-full rounded-lg bg-black"
      playsInline
    />
  );
}
