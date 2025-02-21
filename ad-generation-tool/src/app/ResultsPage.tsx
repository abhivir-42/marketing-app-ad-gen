'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Script {
  line: string;
  artDirection: string;
}

const ResultsPage: React.FC = () => {
  const router = useRouter();
  const [script, setScript] = useState<Script[]>([]);
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [improvementInstruction, setImprovementInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load the script from localStorage
    const savedScript = localStorage.getItem('generatedScript');
    if (!savedScript) {
      router.push('/script');
      return;
    }
    setScript(JSON.parse(savedScript));
  }, [router]);

  const handleRefine = async () => {
    if (selectedLines.length === 0 || !improvementInstruction) {
      setError('Please select the sentences to be refined and tell us what kind of change you want to make.');
      return;
    }
    setIsRefining(true);
    setError(null);

    try {
      const response = await axios.post<{ script: Script[] }>('/api/refine_script', {
        selectedLines,
        improvementInstruction,
        script,
      });
      setScript(response.data.script);
      // Update localStorage with the refined script
      localStorage.setItem('generatedScript', JSON.stringify(response.data.script));
      setSelectedLines([]);
      setImprovementInstruction('');
    } catch (error) {
      console.error('Error refining script:', error);
      setError('Failed to refine script. Please try again.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerateAudio = () => {
    // Store the final script for the TTS page
    localStorage.setItem('finalScript', JSON.stringify(script));
    router.push('/tts');
  };

  const toggleLineSelection = (index: number) => {
    setSelectedLines((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Script & Art Direction Results
        </h1>

        <div className="bg-gray-800 rounded-xl p-8 shadow-xl mb-8">
          <h2 className="text-2xl font-semibold mb-6">Generated Script</h2>
          <div className="space-y-6">
            {script.map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg transition-all duration-200 ${
                  selectedLines.includes(index)
                    ? 'bg-purple-900/50 border border-purple-500'
                    : 'bg-gray-700/50 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedLines.includes(index)}
                    onChange={() => toggleLineSelection(index)}
                    className="mt-1.5 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <p className="text-white mb-2">{item.line}</p>
                    <p className="text-gray-400 text-sm italic">{item.artDirection}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-8 shadow-xl mb-8">
          <h2 className="text-2xl font-semibold mb-6">Refine Script</h2>
          <textarea
            placeholder="How should we improve the selected lines? (e.g., 'Make it more energetic' or 'Add a pun about coffee')"
            value={improvementInstruction}
            onChange={(e) => setImprovementInstruction(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 min-h-[100px] mb-4"
          />
          <button
            onClick={handleRefine}
            disabled={isRefining || selectedLines.length === 0 || !improvementInstruction}
            className={`w-full py-4 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 ${
              (isRefining || selectedLines.length === 0 || !improvementInstruction)
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {isRefining ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refining Script...
              </span>
            ) : (
              'Refine with AI'
            )}
          </button>
        </div>

        <button
          onClick={handleGenerateAudio}
          className="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold text-lg hover:from-green-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
        >
          Generate Final Audio →
        </button>
      </div>
    </div>
  );
};

export default ResultsPage; 