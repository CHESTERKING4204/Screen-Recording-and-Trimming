
'use client';
export const dynamic = "force-dynamic";

import { useState } from 'react';
import ScreenRecorder from '@/components/ScreenRecorder';
import VideoTrimmer from '@/components/VideoTrimmer';
import VideoUploader from '@/components/VideoUploader';
import ShareResult from '@/components/ShareResult';

type Step = 'record' | 'trim' | 'upload' | 'done';

export default function Home() {
  const [step, setStep] = useState<Step>('record');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [trimmedBlob, setTrimmedBlob] = useState<Blob | null>(null);
  const [shareUrl, setShareUrl] = useState('');

  const handleRecordingComplete = (blob: Blob) => {
    setRecordedBlob(blob);
    setStep('trim');
  };

  const handleTrimComplete = (blob: Blob) => {
    setTrimmedBlob(blob);
    setStep('upload');
  };

  const handleUploadComplete = (url: string) => {
    setShareUrl(url);
    setStep('done');
  };

  const handleNewRecording = () => {
    setRecordedBlob(null);
    setTrimmedBlob(null);
    setShareUrl('');
    setStep('record');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8">🎬 Screen Recorder</h1>
      
      {step === 'record' && <ScreenRecorder onRecordingComplete={handleRecordingComplete} />}
      
      {step === 'trim' && recordedBlob && (
        <VideoTrimmer
          videoBlob={recordedBlob}
          onTrimComplete={handleTrimComplete}
          onCancel={() => setStep('record')}
        />
      )}
      
      {step === 'upload' && trimmedBlob && (
        <VideoUploader
          videoBlob={trimmedBlob}
          onUploadComplete={handleUploadComplete}
          onBack={() => setStep('trim')}
        />
      )}
      
      {step === 'done' && <ShareResult shareUrl={shareUrl} onNewRecording={handleNewRecording} />}
    </main>
  );
}


