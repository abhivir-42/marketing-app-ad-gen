'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProgressSteps from '@/components/ProgressSteps';
import BackButton from '@/components/BackButton';
import { Script, RefineScriptResponse } from '@/types';

interface EditableScriptLine {
  index: number;
  isEditing: boolean;
}

const ResultsPage: React.FC = () => {
  const router = useRouter();
  const [script, setScript] = useState<Script[]>([]);
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [improvementInstruction, setImprovementInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editingLine, setEditingLine] = useState<EditableScriptLine | null>(null);

  useEffect(() => {
    // Load the script from localStorage
    const savedScript = localStorage.getItem('generatedScript');
    if (!savedScript) {
      router.push('/script');
      return;
    }
    setScript(JSON.parse(savedScript));
    setIsLoading(false);
  }, [router]);

  const handleRefine = async () => {
    if (selectedLines.length === 0 || !improvementInstruction) {
      setError('Please select the sentences to be refined and tell us what kind of change you want to make.');
      return;
    }
    setIsRefining(true);
    setError(null);

    try {
      const response = await axios.post<RefineScriptResponse>('/api/refine_script', {
        selectedLines,
        improvementInstruction,
        script,
      });
      setScript(response.data.script);
      // Update localStorage with the refined script
      localStorage.setItem('generatedScript', JSON.stringify(response.data.script));
      setSelectedLines([]);
      setImprovementInstruction('');
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error refining script:', error);
      setError('Failed to refine script. Please try again.');
      setRetryCount((prev) => prev + 1);
    } finally {
      setIsRefining(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
    handleRefine();
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
    setHasUnsavedChanges(true);
  };

  const handleManualEdit = (index: number, field: 'line' | 'artDirection', value: string) => {
    const updatedScript = [...script];
    updatedScript[index] = {
      ...updatedScript[index],
      [field]: value
    };
    setScript(updatedScript);
    setHasUnsavedChanges(true);
  };

  const toggleEditMode = (index: number) => {
    if (editingLine?.index === index) {
      // Save changes to localStorage when exiting edit mode
      localStorage.setItem('generatedScript', JSON.stringify(script));
      setEditingLine(null);
    } else {
      setEditingLine({ index, isEditing: true });
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
        <div className="flex items-center justify-between mb-8">
          <BackButton
            href="/script"
            showConfirmation={hasUnsavedChanges}
            confirmationMessage="You have unsaved changes to your script. Are you sure you want to go back?"
          />
          <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Script & Art Direction Results
          </h1>
        </div>

        <ProgressSteps currentStep={2} />

        <div className="bg-gray-800 rounded-xl p-8 shadow-xl mb-8 mt-12">
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
                  <div className="flex-1 space-y-3">
                    {editingLine?.index === index ? (
                      <>
                        <textarea
                          value={item.line}
                          onChange={(e) => handleManualEdit(index, 'line', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          rows={2}
                        />
                        <textarea
                          value={item.artDirection}
                          onChange={(e) => handleManualEdit(index, 'artDirection', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-gray-300 italic text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          rows={2}
                        />
                      </>
                    ) : (
                      <>
                        <p className="text-white">{item.line}</p>
                        <p className="text-gray-400 text-sm italic">{item.artDirection}</p>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => toggleEditMode(index)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    title={editingLine?.index === index ? "Save changes" : "Edit manually"}
                  >
                    {editingLine?.index === index ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    )}
                  </button>
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
            onChange={(e) => {
              setImprovementInstruction(e.target.value);
              setHasUnsavedChanges(true);
            }}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 min-h-[100px] mb-4"
          />

          {error && (
            <div className="space-y-4">
              <ErrorMessage message={error} />
              {retryCount > 0 && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          )}

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
              <LoadingSpinner text="Refining Script..." />
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