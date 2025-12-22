'use client';

import { useState, useEffect, useRef } from 'react';

interface VideoUploaderProps {
  videoBlob: Blob;
  onUploadComplete: (shareUrl: string) => void;
  onBack: () => void;
}

export default function VideoUploader({ videoBlob, onUploadComplete, onBack }: VideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const videoUrl = useRef<string>('');

  useEffect(() => {
    videoUrl.current = URL.createObjectURL(videoBlob);
    return () => URL.revokeObjectURL(videoUrl.current);
  }, [videoBlob]);

  const handleUpload = async () => {
    setIsUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('video', videoBlob, 'recording.webm');

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };

      const response = await new Promise<{ id: string }>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
          else reject(new Error('Upload failed'));
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });

      onUploadComplete(`${window.location.origin}/watch/${response.id}`);
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = videoUrl.current;
    a.download = 'recording.webm';
    a.click();
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-gray-800 rounded-lg max-w-2xl w-full">
      <h2 className="text-xl font-semibold">Upload & Share</h2>
      
      <video src={videoUrl.current} controls className="w-full rounded-lg bg-black" />

      {error && <p className="text-red-400">{error}</p>}

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium disabled:opacity-50"
        >
          {isUploading ? `Uploading ${progress}%` : '☁️ Upload & Get Link'}
        </button>
        <button
          onClick={handleDownload}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
        >
          💾 Download
        </button>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium"
        >
          ← Back to Trim
        </button>
      </div>
    </div>
  );
}
