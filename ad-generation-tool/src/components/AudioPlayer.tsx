'use client';

import React, { useState } from 'react';

interface AudioPlayerProps {
  title: string;
  audioUrl?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ title, audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlay = () => {
    if (!audioUrl) {
      setError('Audio not available');
      return;
    }
    setIsPlaying(true);
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={handlePlay}
          className="p-3 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!audioUrl || isPlaying}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
          </svg>
        </button>
        <div className="text-sm text-gray-300">{title}</div>
      </div>
      {error && (
        <div className="mt-2 text-sm text-red-400">{error}</div>
      )}
      {audioUrl && (
        <audio
          className="hidden"
          src={audioUrl}
          autoPlay={isPlaying}
          onEnded={() => setIsPlaying(false)}
          onError={() => {
            setError('Failed to play audio');
            setIsPlaying(false);
          }}
        />
      )}
    </div>
  );
};

export default AudioPlayer; 