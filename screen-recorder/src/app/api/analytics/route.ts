import { NextRequest, NextResponse } from 'next/server';
import { getVideo, updateVideo } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { videoId, event, duration } = await request.json();
    
    const video = getVideo(videoId);
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    if (event === 'view') {
      updateVideo(videoId, { 
        views: video.views + 1,
        duration: duration || video.duration 
      });
    } else if (event === 'complete') {
      updateVideo(videoId, { completions: video.completions + 1 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
  }
}
