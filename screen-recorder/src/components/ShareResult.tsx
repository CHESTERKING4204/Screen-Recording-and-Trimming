'use client';

import { useState } from 'react';

interface ShareResultProps {
  shareUrl: string;
  onNewRecording: () => void;
}

export default function ShareResult({ shareUrl, onNewRecording }: ShareResultProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-gray-800 rounded-lg max-w-lg w-full">
      <div className="text-5xl">🎉</div>
      <h2 className="text-2xl font-semibold">Video Uploaded!</h2>
      
      <div className="w-full">
        <label className="block text-sm text-gray-400 mb-2">Share Link:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 px-3 py-2 bg-gray-700 rounded border border-gray-600 text-sm"
          />
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium"
        >
          Open Video Page
        </a>
        <button
          onClick={onNewRecording}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium"
        >
          New Recording
        </button>
      </div>
    </div>
  );
}
