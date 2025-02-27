'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProgressSteps from '@/components/ProgressSteps';
import BackButton from '@/components/BackButton';
import { Script, RefineScriptResponse, GenerateAudioResponse } from '@/types';
import api from '@/services/api';

interface EditableScriptLine {
  index: number;
  isEditing: boolean;
}

interface ScriptVersion {
  id: string;
  timestamp: Date;
  script: Script[];
  description: string;
}

interface AudioVersion {
  id: string;
  timestamp: Date;
  audioUrl: string;
  speed: number;
  pitch: number;
  description: string;
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
  // TTS related states
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [audioUrl, setAudioUrl] = useState('');
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioRetryCount, setAudioRetryCount] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(0);
  // Version history
  const [versions, setVersions] = useState<ScriptVersion[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versionDescription, setVersionDescription] = useState('');
  const [comparingVersion, setComparingVersion] = useState<ScriptVersion | null>(null);
  // Audio version history
  const [audioVersions, setAudioVersions] = useState<AudioVersion[]>([]);
  const [audioVersionDescription, setAudioVersionDescription] = useState('');
  const [showAudioVersions, setShowAudioVersions] = useState(false);

  useEffect(() => {
    // Load the script from localStorage
    const savedScript = localStorage.getItem('generatedScript');
    if (!savedScript) {
      router.push('/script');
      return;
    }
    
    const parsedScript = JSON.parse(savedScript);
    setScript(parsedScript);
    
    // Load version history if available
    const savedVersions = localStorage.getItem('scriptVersionHistory');
    if (savedVersions) {
      try {
        // Parse the versions and ensure dates are properly converted back to Date objects
        const parsedVersions = JSON.parse(savedVersions, (key, value) => {
          if (key === 'timestamp') return new Date(value);
          return value;
        });
        setVersions(parsedVersions);
      } catch (error) {
        console.error('Error loading version history:', error);
      }
    } else {
      // Create initial version if this is the first time
      const initialVersion: ScriptVersion = {
        id: generateVersionId(),
        timestamp: new Date(),
        script: parsedScript,
        description: 'Initial script generation'
      };
      setVersions([initialVersion]);
      saveVersionHistory([initialVersion]);
    }
    
    // Load audio version history if available
    const savedAudioVersions = localStorage.getItem('audioVersionHistory');
    if (savedAudioVersions) {
      try {
        const parsedAudioVersions = JSON.parse(savedAudioVersions, (key, value) => {
          if (key === 'timestamp') return new Date(value);
          return value;
        });
        setAudioVersions(parsedAudioVersions);
      } catch (error) {
        console.error('Error loading audio version history:', error);
      }
    }
    
    setIsLoading(false);
  }, [router]);

  const generateVersionId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  const saveVersionHistory = (updatedVersions: ScriptVersion[]) => {
    localStorage.setItem('scriptVersionHistory', JSON.stringify(updatedVersions));
  };

  const saveCurrentVersion = (description: string = 'Manual update') => {
    const newVersion: ScriptVersion = {
      id: generateVersionId(),
      timestamp: new Date(),
      script: [...script],
      description
    };
    
    const updatedVersions = [...versions, newVersion];
    setVersions(updatedVersions);
    saveVersionHistory(updatedVersions);
    return newVersion;
  };

  const restoreVersion = (version: ScriptVersion) => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to restore a previous version?')) {
        return;
      }
    }
    
    setScript([...version.script]);
    localStorage.setItem('generatedScript', JSON.stringify(version.script));
    setHasUnsavedChanges(false);
    setComparingVersion(null);
    
    // Save restoration as a new version
    saveCurrentVersion(`Restored version: ${version.description}`);
  };

  const handleRefine = async () => {
    if (selectedLines.length === 0 || !improvementInstruction) {
      setError('Please select the sentences to be refined and tell us what kind of change you want to make.');
      return;
    }
    setIsRefining(true);
    setError(null);

    try {
      // Get the original form data from localStorage
      const formData = JSON.parse(localStorage.getItem('scriptGenerationFormData') || '{}');
      
      // Convert script to the format expected by the backend
      const currentScript: [string, string][] = script.map(item => [item.line, item.artDirection]);
      
      const refinedScript = await api.refineScript({
        selected_sentences: selectedLines,
        improvement_instruction: improvementInstruction,
        current_script: currentScript,
        key_selling_points: formData.keySellingPoints || '',
        tone: formData.tone || '',
        ad_length: formData.adLength || ''
      });

      if (refinedScript && refinedScript.length > 0) {
        // Save current version before updating
        saveCurrentVersion(`AI refinement: ${improvementInstruction}`);
        
        setScript(refinedScript);
        // Update localStorage with the refined script
        localStorage.setItem('generatedScript', JSON.stringify(refinedScript));
        setSelectedLines([]);
        setImprovementInstruction('');
        setHasUnsavedChanges(false);
      } else {
        throw new Error('Received empty or invalid script from refinement');
      }
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

  const handleGenerateAudio = async () => {
    setIsGeneratingAudio(true);
    setAudioError(null);
    setGenerationProgress(0);

    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => Math.min(prev + 10, 90));
    }, 1000);

    try {
      const response = await axios.post<GenerateAudioResponse>('/api/generate_audio', {
        speed,
        pitch,
        script,
      });
      
      setAudioUrl(response.data.audioUrl);
      
      // Save the audio version
      saveAudioVersion(
        response.data.audioUrl, 
        `Generated with speed: ${speed.toFixed(1)}, pitch: ${pitch.toFixed(1)}`
      );
      
      setGenerationProgress(100);
    } catch (error) {
      console.error('Error generating audio:', error);
      setAudioError('Failed to generate audio. Please try again.');
      setAudioRetryCount((prev) => prev + 1);
    } finally {
      setIsGeneratingAudio(false);
      clearInterval(progressInterval);
    }
  };

  const handleAudioRetry = () => {
    setAudioError(null);
    setAudioRetryCount(0);
    handleGenerateAudio();
  };

  const handleSettingChange = (
    setting: 'speed' | 'pitch',
    value: number
  ) => {
    if (setting === 'speed') {
      setSpeed(value);
    } else {
      setPitch(value);
    }
    setHasUnsavedChanges(true);
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
      setHasUnsavedChanges(false);
      
      // Save the edited version
      saveCurrentVersion('Manual line edit');
    } else {
      setEditingLine({ index, isEditing: true });
    }
  };

  const handleBoxClick = (index: number, event: React.MouseEvent) => {
    // Don't trigger selection if clicking the edit button or if we're in edit mode
    const target = event.target as HTMLElement;
    if (
      target.closest('button') || // Ignore clicks on or within the edit button
      editingLine?.index === index || // Ignore clicks when in edit mode
      target.tagName === 'TEXTAREA' // Ignore clicks on textareas
    ) {
      return;
    }
    toggleLineSelection(index);
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getLineComparisonClass = (index: number, line: Script) => {
    if (!comparingVersion) return '';
    
    // Compare current line with the comparing version's line
    const compareLine = comparingVersion.script[index];
    if (!compareLine) return 'bg-green-900/20 border-l-4 border-green-500'; // New line
    
    if (line.line !== compareLine.line || line.artDirection !== compareLine.artDirection) {
      return 'bg-yellow-900/20 border-l-4 border-yellow-500'; // Modified line
    }
    
    return ''; // Unchanged
  };

  const saveAudioVersionHistory = (updatedVersions: AudioVersion[]) => {
    localStorage.setItem('audioVersionHistory', JSON.stringify(updatedVersions));
  };
  
  const saveAudioVersion = (audioUrl: string, description: string = 'Audio generation') => {
    const newVersion: AudioVersion = {
      id: generateVersionId(),
      timestamp: new Date(),
      audioUrl,
      speed,
      pitch,
      description
    };
    
    const updatedVersions = [...audioVersions, newVersion];
    setAudioVersions(updatedVersions);
    saveAudioVersionHistory(updatedVersions);
    return newVersion;
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
            Iterate & Produce
          </h1>
        </div>

        <ProgressSteps currentStep={2} />

        {/* Version history toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{showVersionHistory ? 'Hide Version History' : 'Show Version History'}</span>
          </button>
        </div>
        
        {/* Version history panel */}
        {showVersionHistory && (
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Version History
            </h2>
            
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4 p-1">
              {versions.map((version, i) => (
                <div 
                  key={version.id}
                  className={`p-3 rounded-lg flex items-center justify-between ${
                    comparingVersion?.id === version.id 
                      ? 'bg-purple-900/30 border border-purple-500' 
                      : 'bg-gray-700/50 hover:bg-gray-700 cursor-pointer'
                  }`}
                  onClick={() => setComparingVersion(comparingVersion?.id === version.id ? null : version)}
                >
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-400">{formatTimestamp(version.timestamp)}</span>
                      {i === versions.length - 1 && (
                        <span className="ml-2 text-xs bg-purple-900 text-purple-100 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white mt-1">{version.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    {comparingVersion?.id === version.id ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setComparingVersion(null);
                        }}
                        className="text-xs px-2 py-1 bg-gray-600 rounded hover:bg-gray-500"
                      >
                        Stop Comparing
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          restoreVersion(version);
                        }}
                        className="text-xs px-2 py-1 bg-blue-600 rounded hover:bg-blue-500"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {versions.length === 0 && (
                <p className="text-gray-400 text-center py-4">No previous versions found</p>
              )}
            </div>
            
            {comparingVersion && (
              <div className="text-sm text-gray-300 bg-gray-700/50 p-3 rounded-lg">
                <p>Comparing current version with: <span className="font-medium text-purple-400">{comparingVersion.description}</span></p>
                <p className="mt-1">
                  <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-1"></span> Modified lines
                  <span className="ml-4 inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span> New lines
                </p>
              </div>
            )}
            
            <div className="flex items-center mt-4 space-x-2">
              <input 
                type="text"
                placeholder="Add a description for the current version"
                value={versionDescription}
                onChange={(e) => setVersionDescription(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={() => {
                  if (versionDescription.trim()) {
                    saveCurrentVersion(versionDescription);
                    setVersionDescription('');
                  }
                }}
                disabled={!versionDescription.trim()}
                className={`px-4 py-2 rounded-md bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors ${
                  !versionDescription.trim() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Save Version
              </button>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-xl p-8 shadow-xl mb-8 mt-12">
          <div className="mb-8 border-b border-gray-700 pb-6">
            <h2 className="text-2xl font-semibold mb-3">Your Script</h2>
            <p className="text-gray-400">
              This is your creative workspace. Select lines to refine, edit manually, or generate audio when you're ready.
            </p>
          </div>
          <div className="space-y-6">
            {script.map((item, index) => (
              <div
                key={index}
                onClick={(e) => handleBoxClick(index, e)}
                className={`p-4 rounded-lg transition-all duration-200 ${
                  selectedLines.includes(index)
                    ? 'bg-purple-900/50 border border-purple-500 shadow-lg'
                    : 'bg-gray-700/50 hover:bg-gray-700/80 cursor-pointer'
                } ${editingLine?.index === index ? 'cursor-text' : ''} ${getLineComparisonClass(index, item)}`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`flex items-center mt-1.5 transition-colors duration-200 ${
                    selectedLines.includes(index) ? 'text-purple-400' : 'text-gray-500'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d={selectedLines.includes(index) 
                          ? "M9 12l2 2 4-4" 
                          : "M15 15l-2 2-2-2"} 
                      />
                    </svg>
                  </div>
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
                        <p className="text-white text-lg">{item.line}</p>
                        {item.artDirection && (
                          <div className="mt-2 flex items-start space-x-2">
                            <span className="text-purple-400 text-sm font-medium">Art Direction:</span>
                            <p className="text-gray-300 text-sm italic flex-1">{item.artDirection}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering box click
                      toggleEditMode(index);
                    }}
                    className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-600"
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
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-semibold">Refine with AI</h2>
            <p className="text-gray-400">
              {selectedLines.length === 0 
                ? "Select script sections above that you'd like to improve"
                : `${selectedLines.length} section${selectedLines.length > 1 ? 's' : ''} selected for refinement`}
            </p>
          </div>
          
          {/* AI Suggestion Chips */}
          {selectedLines.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-300 mb-2">Quick refinement ideas:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Make it more conversational',
                  'Add more emotion',
                  'Make it shorter and punchier',
                  'Emphasize benefits more clearly',
                  'Add a rhetorical question',
                  'Use more vivid imagery',
                  'Make it more persuasive',
                  'Add humor',
                  'Sound more authoritative'
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setImprovementInstruction(suggestion)}
                    className="px-3 py-1.5 text-sm bg-purple-900/60 hover:bg-purple-900/80 rounded-full text-purple-100 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <textarea
            placeholder="How should we improve the selected lines? (e.g., 'Make it more energetic' or 'Add a pun about coffee')"
            value={improvementInstruction}
            onChange={(e) => {
              setImprovementInstruction(e.target.value);
              setHasUnsavedChanges(true);
            }}
            className={`w-full px-4 py-3 rounded-lg bg-gray-700 border text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 min-h-[100px] mb-4 ${
              selectedLines.length === 0 ? 'border-gray-600 opacity-50' : 'border-purple-500'
            }`}
            disabled={selectedLines.length === 0}
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

        {/* Voice Settings and Audio Generation */}
        <div className="bg-gray-800 rounded-xl p-8 shadow-xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Voice Settings</h2>
            {audioVersions.length > 0 && (
              <button
                onClick={() => setShowAudioVersions(!showAudioVersions)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span>{showAudioVersions ? 'Hide' : 'Show'} Audio History</span>
              </button>
            )}
          </div>
          
          {/* Audio Versions */}
          {showAudioVersions && (
            <div className="mb-6 bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Previous Audio Versions
              </h3>
              
              <div className="space-y-3 max-h-60 overflow-y-auto p-1 mb-2">
                {audioVersions.map((version, i) => (
                  <div key={version.id} className="bg-gray-800 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-400">{formatTimestamp(version.timestamp)}</span>
                          {i === audioVersions.length - 1 && (
                            <span className="ml-2 text-xs bg-blue-900 text-blue-100 px-2 py-0.5 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white mt-1">{version.description}</p>
                        <div className="text-xs text-gray-400 mt-1">
                          Speed: {version.speed.toFixed(1)}x, Pitch: {version.pitch.toFixed(1)}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          // Apply these settings and set the audio URL
                          setSpeed(version.speed);
                          setPitch(version.pitch);
                          setAudioUrl(version.audioUrl);
                        }}
                        className="text-xs px-2 py-1 bg-blue-600 rounded hover:bg-blue-500"
                      >
                        Load
                      </button>
                    </div>
                    <div className="mt-2">
                      <audio
                        controls
                        className="w-full h-8"
                        src={version.audioUrl}
                        preload="none"
                      />
                    </div>
                  </div>
                ))}
                
                {audioVersions.length === 0 && (
                  <p className="text-gray-400 text-center py-4">No audio versions generated yet</p>
                )}
              </div>
              
              <div className="flex items-center mt-3 space-x-2">
                <input 
                  type="text"
                  placeholder="Add a description for the current audio"
                  value={audioVersionDescription}
                  onChange={(e) => setAudioVersionDescription(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={() => {
                    if (audioUrl && audioVersionDescription.trim()) {
                      saveAudioVersion(audioUrl, audioVersionDescription);
                      setAudioVersionDescription('');
                    }
                  }}
                  disabled={!audioUrl || !audioVersionDescription.trim()}
                  className={`px-3 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors ${
                    !audioUrl || !audioVersionDescription.trim() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Save Description
                </button>
              </div>
            </div>
          )}
          
          <div className="space-y-8">
            <div>
              <div className="flex justify-between mb-2">
                <label htmlFor="speed" className="text-sm font-medium text-gray-300">Speed</label>
                <span className="text-sm text-gray-400">{speed.toFixed(1)}x</span>
              </div>
              <input
                id="speed"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speed}
                onChange={(e) => handleSettingChange('speed', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label htmlFor="pitch" className="text-sm font-medium text-gray-300">Pitch</label>
                <span className="text-sm text-gray-400">{pitch.toFixed(1)}x</span>
              </div>
              <input
                id="pitch"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => handleSettingChange('pitch', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {audioError && (
            <div className="space-y-4 mt-8">
              <ErrorMessage message={audioError} />
              {audioRetryCount > 0 && (
                <button
                  type="button"
                  onClick={handleAudioRetry}
                  className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          <button
            onClick={handleGenerateAudio}
            disabled={isGeneratingAudio}
            className={`w-full mt-8 py-4 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 ${
              isGeneratingAudio ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isGeneratingAudio ? (
              <div className="space-y-2">
                <LoadingSpinner text="Generating Audio..." />
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              'Generate Audio'
            )}
          </button>
        </div>

        {/* Audio Preview & Download */}
        {audioUrl && (
          <div className="bg-gray-800 rounded-xl p-8 shadow-xl mb-8">
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

export default ResultsPage; 