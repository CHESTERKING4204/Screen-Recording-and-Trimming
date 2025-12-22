# Screen Recorder MVP

A browser-based screen recording app with trimming, upload, and analytics.

## Features

- **Screen Recording**: Record screen + mic using MediaRecorder API
- **Video Trimming**: Trim start/end using ffmpeg.wasm (client-side)
- **Upload & Share**: Upload videos and get shareable links
- **Analytics**: Track view count and watch completion (90%+)

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Tech Stack

- Next.js 14 + TypeScript
- Tailwind CSS
- ffmpeg.wasm for client-side video processing
- File-based storage (JSON db + local uploads)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── upload/      # Video upload endpoint
│   │   ├── videos/      # Video metadata endpoint
│   │   └── analytics/   # View tracking endpoint
│   ├── watch/[id]/      # Public video page
│   └── page.tsx         # Main recording UI
├── components/
│   ├── ScreenRecorder   # Recording controls
│   ├── VideoTrimmer     # Trim UI with ffmpeg
│   ├── VideoUploader    # Upload with progress
│   └── ShareResult      # Share link display
└── lib/
    └── db.ts            # File-based video storage
```

## Notes

- Videos stored in `public/uploads/`
- Metadata stored in `data/videos.json`
- ffmpeg.wasm requires COOP/COEP headers (configured in next.config.js)
