import { notFound } from 'next/navigation';
import { getVideo } from '@/lib/db';
import VideoPlayer from './VideoPlayer';

interface PageProps {
  params: { id: string };
}

export default function WatchPage({ params }: PageProps) {
  const video = getVideo(params.id);
  
  if (!video) {
    notFound();
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-2xl font-bold mb-4">Screen Recording</h1>
        
        <VideoPlayer 
          videoId={video.id}
          videoUrl={`/uploads/${video.filename}`}
        />
        
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-400">
            Uploaded: {new Date(video.createdAt).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-400">
            Views: {video.views} | Completions: {video.completions}
          </p>
        </div>
      </div>
    </main>
  );
}
