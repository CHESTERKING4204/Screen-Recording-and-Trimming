'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface VideoTrimmerProps {
  videoBlob: Blob;
  onTrimComplete: (blob: Blob) => void;
  onCancel: () => void;
}

export default function VideoTrimmer({ videoBlob, onTrimComplete, onCancel }: VideoTrimmerProps) {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpegError, setFfmpegError] = useState('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const ffmpegRef = useRef<unknown>(null);

  // Create video URL
  useEffect(() => {
    const url = URL.createObjectURL(videoBlob);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoBlob]);

  // Load FFmpeg
  useEffect(() => {
    let mounted = true;
    
    const loadFFmpeg = async () => {
      try {
        const { FFmpeg } = await import('@ffmpeg/ffmpeg');
        const { toBlobURL } = await import('@ffmpeg/util');
        
        const ffmpeg = new FFmpeg();
        ffmpeg.on('progress', ({ progress }: { progress: number }) => {
          if (mounted) setProgress(Math.round(progress * 100));
        });
        
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        
        if (mounted) {
          ffmpegRef.current = ffmpeg;
          setFfmpegLoaded(true);
        }
      } catch (err) {
        console.error('FFmpeg load error:', err);
        if (mounted) {
          setFfmpegError('FFmpeg failed to load. You can still skip trimming.');
        }
      }
    };
    
    loadFFmpeg();
    return () => { mounted = false; };
  }, []);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setEndTime(dur);
    }
  };

  const handleTrim = useCallback(async () => {
    if (!ffmpegRef.current || !ffmpegLoaded) return;
    setIsProcessing(true);
    try {
      const { fetchFile } = await import('@ffmpeg/util');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ffmpeg = ffmpegRef.current as any;
      await ffmpeg.writeFile('input.webm', await fetchFile(videoBlob));
      
      const trimDuration = endTime - startTime;
      await ffmpeg.exec([
        '-i', 'input.webm',
        '-ss', startTime.toString(),
        '-t', trimDuration.toString(),
        '-c', 'copy',
        'output.webm'
      ]);

      const data = await ffmpeg.readFile('output.webm');
      const trimmedBlob = new Blob([data], { type: 'video/webm' });
      onTrimComplete(trimmedBlob);
    } catch (err) {
      console.error('Trim failed:', err);
      setFfmpegError('Trim failed. Try skipping trim.');
    } finally {
      setIsProcessing(false);
    }
  }, [videoBlob, startTime, endTime, ffmpegLoaded, onTrimComplete]);

  const skipTrim = () => {
    onTrimComplete(videoBlob);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const previewStart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
      videoRef.current.play();
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-gray-800 rounded-lg max-w-2xl w-full">
      <h2 className="text-xl font-semibold">Trim Video</h2>
      
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          onLoadedMetadata={handleLoadedMetadata}
          controls
          className="w-full rounded-lg bg-black"
        />
      ) : (
        <div className="w-full h-64 bg-black rounded-lg flex items-center justify-center">
          <p className="text-gray-400">Loading video...</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Start: {formatTime(startTime)}</label>
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={startTime}
            onChange={(e) => setStartTime(Math.min(Number(e.target.value), endTime - 0.1))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">End: {formatTime(endTime)}</label>
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={endTime}
            onChange={(e) => setEndTime(Math.max(Number(e.target.value), startTime + 0.1))}
            className="w-full"
          />
        </div>
        <p className="text-sm text-gray-400">
          Duration: {formatTime(endTime - startTime)} (Original: {formatTime(duration)})
        </p>
      </div>

      {!ffmpegLoaded && !ffmpegError && (
        <p className="text-yellow-400">⏳ Loading FFmpeg (this may take a moment)...</p>
      )}
      {ffmpegError && <p className="text-red-400">{ffmpegError}</p>}

      <div className="flex gap-3 flex-wrap">
        <button onClick={previewStart} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">
          Preview Start
        </button>
        <button
          onClick={handleTrim}
          disabled={isProcessing || !ffmpegLoaded}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
        >
          {isProcessing ? `Processing ${progress}%` : 'Trim & Continue'}
        </button>
        <button
          onClick={skipTrim}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
        >
          Skip Trim →
        </button>
        <button onClick={onCancel} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded">
          Cancel
        </button>
      </div>
    </div>
  );
}
