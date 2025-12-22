'use client';

import { useState, useRef, useCallback } from 'react';

interface ScreenRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

export default function ScreenRecorder({ onRecordingComplete }: ScreenRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true,
      });

      let combinedStream = displayStream;

      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioTrack = audioStream.getAudioTracks()[0];
        combinedStream = new MediaStream([
          ...displayStream.getVideoTracks(),
          ...displayStream.getAudioTracks(),
          audioTrack,
        ]);
      } catch {
        console.log('Mic not available, recording without mic');
      }

      streamRef.current = combinedStream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9,opus',
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        onRecordingComplete(blob);
        streamRef.current?.getTracks().forEach((t) => t.stop());
      };

      displayStream.getVideoTracks()[0].onended = () => stopRecording();

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, [onRecordingComplete]);


  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  }, [isRecording]);

  const togglePause = useCallback(() => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  }, [isPaused]);

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-semibold">Screen Recorder</h2>
      <div className="flex gap-3">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition"
          >
            🔴 Start Recording
          </button>
        ) : (
          <>
            <button
              onClick={togglePause}
              className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-medium transition"
            >
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
            <button
              onClick={stopRecording}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition"
            >
              ⏹️ Stop
            </button>
          </>
        )}
      </div>
      {isRecording && (
        <div className="flex items-center gap-2 text-red-400">
          <span className="animate-pulse">●</span> Recording{isPaused ? ' (Paused)' : '...'}
        </div>
      )}
    </div>
  );
}
