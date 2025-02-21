'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Script, GenerateAudioResponse } from '@/types';

const TTSPage: React.FC = () => {
  const router = useRouter();
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [audioUrl, setAudioUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [script, setScript] = useState<Script[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load the final script from localStorage
    const savedScript = localStorage.getItem('finalScript');
    if (!savedScript) {
      router.push('/script');
      return;
    }
    setScript(JSON.parse(savedScript));
    setIsLoading(false);
  }, [router]);

  const handleGenerateAudio = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await axios.post<GenerateAudioResponse>('/api/generate_audio', {
        speed,
        pitch,
        script,
      });
      setAudioUrl(response.data.audioUrl);
    } catch (error) {
      console.error('Error generating audio:', error);
      setError('Failed to generate audio. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <LoadingSpinner text="Loading Script..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Generate Your Audio Ad
        </h1>

        <div className="bg-gray-800 rounded-xl p-8 shadow-xl mb-8">
          <h2 className="text-2xl font-semibold mb-6">Script Preview</h2>
          <div className="space-y-4 mb-8">
            {script.map((item, index) => (
              <div key={index} className="bg-gray-700/50 p-4 rounded-lg">
                <p className="text-white mb-2">{item.line}</p>
                <p className="text-gray-400 text-sm italic">{item.artDirection}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-semibold mb-6">Voice Settings</h2>
          
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Speed
                <span className="ml-2 text-gray-500">({speed.toFixed(1)}x)</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Slower</span>
                <span>Faster</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Pitch
                <span className="ml-2 text-gray-500">({pitch.toFixed(1)})</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Lower</span>
                <span>Higher</span>
              </div>
            </div>
          </div>

          {error && <ErrorMessage message={error} />}

          <button
            onClick={handleGenerateAudio}
            disabled={isGenerating}
            className={`w-full mt-8 py-4 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 ${
              isGenerating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isGenerating ? (
              <LoadingSpinner text="Generating Audio..." />
            ) : (
              'Generate Audio'
            )}
          </button>
        </div>

        {audioUrl && (
          <div className="bg-gray-800 rounded-xl p-8 shadow-xl">
            <h2 className="text-2xl font-semibold mb-6">Preview & Download</h2>
            <div className="space-y-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <audio controls className="w-full" src={audioUrl} />
              </div>
              <a
                href={audioUrl}
                download="ad-audio.mp3"
                className="block w-full py-4 px-6 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold text-lg text-center hover:from-green-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
              >
                Download MP3
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TTSPage; 