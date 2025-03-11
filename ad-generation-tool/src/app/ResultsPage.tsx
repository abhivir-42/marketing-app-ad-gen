'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProgressSteps from '@/components/ProgressSteps';
import BackButton from '@/components/BackButton';
import { Script, RefineScriptResponse, GenerateAudioResponse, ValidationMetadata } from '@/types';
import api from '@/services/api';
import { SCRIPT_STORAGE_KEY, SCRIPT_DATA_STORAGE_KEY, SCRIPT_VERSIONS_KEY, AUDIO_VERSIONS_KEY, VALIDATION_DATA_KEY, FORM_DATA_STORAGE_KEY, getItem, setItem, removeItem, safeJsonParse } from '@/services/storage';

/**
 * Radio Ad Script Generation & Refinement Tool
 * ============================================
 * 
 * MULTI-LAYER VALIDATION SYSTEM OVERVIEW
 * --------------------------------------
 * This application implements a sophisticated dual-layer validation system designed 
 * to protect script integrity during the AI refinement process:
 * 
 * 1. BACKEND VALIDATION LAYER:
 *    - Server-side validation of all script modifications
 *    - Automated detection and reversion of unauthorized changes
 *    - Enforcement of script structure preservation
 *    - Detailed validation metadata returned to frontend
 * 
 * 2. FRONTEND SAFEGUARDS LAYER:
 *    - Additional verification in the API service (api.refineScriptWithValidation)
 *    - Independent validation of all modifications against selected sentences
 *    - Comprehensive tracking of attempted changes for transparency
 * 
 * 3. USER FEEDBACK MECHANISMS:
 *    - ValidationFeedback component displays detailed alerts about validation issues
 *    - Side-by-side comparison of preserved content vs. attempted changes
 *    - Persistent validation notifications across page refreshes
 *    - Color-coded highlighting of modified content
 * 
 * This multi-layered approach ensures users can safely refine selected portions
 * of their scripts while maintaining the integrity of unselected content.
 */

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
  voiceId?: string;
  description: string;
}

// Add ValidationFeedback component before ResultsPage
interface ValidationFeedbackProps {
  validation: ValidationMetadata | null;
  selectedLines: number[];
}

/**
 * ValidationFeedback Component
 * ------------------------------
 * Displays feedback when the validation system detects unauthorized changes.
 * This component is critical for the multi-layer validation system, showing users:
 * 1. When changes were attempted on non-selected sentences
 * 2. Which original content was preserved
 * 3. What unauthorized changes were blocked
 */
const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({ validation, selectedLines }) => {
  // Skip rendering if no validation data is present
  if (!validation) return null;
  
  // Only show validation feedback if there are issues to report
  const hasIssues = validation.had_unauthorized_changes || validation.had_length_mismatch;
  if (!hasIssues) return null;
  
  // Visual styling based on validation status
  const bgColor = hasIssues ? 'bg-amber-50' : 'bg-green-50';
  const borderColor = hasIssues ? 'border-amber-500' : 'border-green-500';
  const textColor = hasIssues ? 'text-amber-800' : 'text-green-800';
  
  /**
   * The validation feedback panel provides:
   * 1. Clear visual indicators using warning colors
   * 2. Detailed explanation of what happened
   * 3. Side-by-side comparison of:
   *    - What changes were attempted (shown in red/strikethrough)
   *    - What content was preserved (shown in green)
   * 4. Specific information about which sentences were protected
   */
  return (
    <div className={`mt-4 p-4 ${bgColor} ${borderColor} border rounded-md ${textColor}`}>
      <h3 className="font-semibold text-lg mb-2">Validation Results</h3>
      
      {/* UNAUTHORIZED CHANGES SECTION: Display details about prevented modifications */}
      {validation.had_unauthorized_changes && (
        <div className="mb-2">
          <p className="font-medium">⚠️ Unauthorized changes detected and reverted:</p>
          <p className="text-sm mb-2">
            The system protected sentences you didn't select for modification.
            Only sentences you explicitly select can be changed.
          </p>
          <ul className="ml-6 list-disc">
            {validation.reverted_changes.map((change, idx) => (
              <li key={idx}>
                Line {change.index}: 
                {/* Show attempted change (crossed out in red) */}
                <span className="line-through text-red-600 mx-2">
                  {change.attempted.line.substring(0, 40)}
                  {change.attempted.line.length > 40 ? '...' : ''}
                </span>
                {/* Show preserved original content (in green) */}
                <span className="text-green-600">
                  → {change.original.line.substring(0, 40)}
                  {change.original.line.length > 40 ? '...' : ''}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm italic">
            Note: Only sentences at indices [{validation.selected_sentences ? validation.selected_sentences.join(', ') : selectedLines.join(', ')}] were authorized for modification.
          </p>
        </div>
      )}
      
      {validation.had_length_mismatch && (
        <div>
          <p className="font-medium">⚠️ Script length mismatch adjusted:</p>
          <p>Expected {validation.original_length} sentences, received {validation.received_length}.</p>
        </div>
      )}
      
      <p className="mt-3 text-sm">
        The script has been automatically adjusted to maintain integrity.
      </p>
    </div>
  );
};

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
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [voiceId, setVoiceId] = useState('21m00Tcm4TlvDq8ikWAM');
  const [availableVoices, setAvailableVoices] = useState([
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (Female)' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Josh (Male)' },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi (Female)' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli (Female)' },
    { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Adam (Male)' }
  ]);
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
  const [validationFeedback, setValidationFeedback] = useState<string | null>(null);
  const [validationData, setValidationData] = useState<ValidationMetadata | null>(null);

  /**
   * VALIDATION DATA PERSISTENCE SYSTEM
   * ---------------------------------
   * This useEffect hook ensures that validation data persists across page refreshes.
   * This is a critical part of the multi-layer validation system:
   * 
   * 1. When validation issues are detected (either by backend or frontend)
   *    the data is stored in localStorage
   * 
   * 2. On page load/refresh, this hook checks for stored validation data
   *    and restores it to the component state
   * 
   * 3. This ensures users don't lose important validation feedback even if
   *    they refresh the page or navigate away temporarily
   * 
   * 4. The validation data is only cleared when explicitly dismissed by the user
   *    or when a new successful refinement occurs with no validation issues
   */
  useEffect(() => {
    const loadValidationData = async () => {
      // Load validation data from storage if it exists
      const savedValidationData = await getItem(VALIDATION_DATA_KEY);
      if (savedValidationData) {
        try {
          const parsedData = safeJsonParse(savedValidationData, null);
          if (parsedData) {
            setValidationData(parsedData);
          }
        } catch (error) {
          console.error('Error parsing saved validation data:', error);
          // Clear corrupted data
          removeItem(VALIDATION_DATA_KEY);
        }
      }
    };

    loadValidationData();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      // Load the script from storage
      const savedScript = await getItem(SCRIPT_STORAGE_KEY);
      if (!savedScript) {
        router.push('/script');
        return;
      }

      try {
        let parsedScript;
        
        // Handle both object and string formats
        if (typeof savedScript === 'string') {
          parsedScript = safeJsonParse(savedScript, null);
        } else {
          // Already an object from Supabase
          parsedScript = savedScript;
        }
        
        if (!parsedScript) {
          console.error('Could not parse script data');
          router.push('/script');
          return;
        }
        
        setScript(parsedScript);
        
        // Load script version history if available
        const savedVersions = await getItem(SCRIPT_VERSIONS_KEY);
        if (savedVersions) {
          try {
            const parsedVersions = safeJsonParse(savedVersions, []);
            // Convert string dates back to Date objects
            const formattedVersions = parsedVersions.map((version: any) => ({
              ...version,
              timestamp: new Date(version.timestamp)
            }));
            setVersions(formattedVersions);
          } catch (error) {
            console.error('Error parsing script version history:', error);
          }
        }

        // Load audio version history if available
        const savedAudioVersions = await getItem(AUDIO_VERSIONS_KEY);
        if (savedAudioVersions) {
          try {
            const parsedVersions = safeJsonParse(savedAudioVersions, []);
            // Convert string dates back to Date objects
            const formattedVersions = parsedVersions.map((version: any) => ({
              ...version,
              timestamp: new Date(version.timestamp)
            }));
            setAudioVersions(formattedVersions);
          } catch (error) {
            console.error('Error parsing audio version history:', error);
          }
        }
      } catch (error) {
        console.error('Error parsing saved script:', error);
        router.push('/script');
        return;
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  const generateVersionId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  const saveVersionHistory = (updatedVersions: ScriptVersion[]) => {
    setVersions(updatedVersions);
    setItem(SCRIPT_VERSIONS_KEY, updatedVersions);
  };

  const saveScriptVersion = (description: string = 'Manual update') => {
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

  const restorePreviousVersion = (version: ScriptVersion) => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to restore a previous version?')) {
        return;
      }
    }
    
    setScript([...version.script]);
    setItem(SCRIPT_STORAGE_KEY, version.script);
    setHasUnsavedChanges(false);
    setComparingVersion(null);
    
    // Save restoration as a new version
    saveScriptVersion(`Restored version: ${version.description}`);
  };

  /**
   * executeAIRefinement - Handles the process of refining specific sentences in the script
   * -----------------------------------------------------------------------------
   * Workflow:
   * 1. Prepares data for backend including only selected sentences for refinement
   * 2. Calls API with validation safeguards (both backend and frontend protection)
   * 3. Updates the script with validated changes
   * 4. Stores validation results for user feedback
   * 5. Persists validation state even across page refreshes
   */
  const executeAIRefinement = async () => {
    // Validate user input before proceeding
    if (selectedLines.length === 0 || !improvementInstruction) {
      setError('Please select the sentences to be refined and tell us what kind of change you want to make.');
      return;
    }
    // Reset state for new refinement process
    setIsRefining(true);
    setError(null);
    setValidationFeedback(null);
    setValidationData(null);

    // Maximum number of retries
    const MAX_RETRIES = 2;
    let currentRetry = 0;
    let lastError: any = null;

    while (currentRetry <= MAX_RETRIES) {
      try {
        // STEP 1: PREPARE REQUEST DATA
        // Retrieve original form data to maintain context for AI
        const formData = safeJsonParse(await getItem(FORM_DATA_STORAGE_KEY) || '{}', {});
        
        // Format script for API request (convert to tuple format expected by backend)
        const currentScript: [string, string][] = script.map(item => [item.line, item.artDirection]);
        
        console.log(`Preparing to refine script (attempt ${currentRetry + 1}/${MAX_RETRIES + 1}):`, {
          selectedLines,
          improvementInstruction,
          scriptLength: currentScript.length
        });
        
        // STEP 2: CALL API WITH VALIDATION SAFEGUARDS
        // The refineScriptWithValidation function includes both backend and frontend validation
        const result = await api.refineScriptWithValidation({
          selected_sentences: selectedLines,       // Only these sentences should be modified
          improvement_instruction: improvementInstruction,
          current_script: currentScript,
          key_selling_points: formData.keySellingPoints || '',
          tone: formData.tone || '',
          ad_length: formData.adLength || ''
        });

        console.log('Refinement result:', result);

        if (result && result.script && result.script.length > 0) {
          // STEP 3: SAVE VERSION HISTORY
          // Save current version before applying changes to allow for comparison
          saveScriptVersion(`AI refinement: ${improvementInstruction}`);
          
          // STEP 4: UPDATE SCRIPT WITH VALIDATED CHANGES
          // The result.script already contains the safely modified content
          setScript(result.script);
          setItem(SCRIPT_STORAGE_KEY, result.script);
          
          // STEP 5: HANDLE VALIDATION FEEDBACK
          // Process and display validation results to the user
          if (result.validation) {
            // Store the selected sentences in the validation data before resetting them
            result.validation.selected_sentences = [...selectedLines];
            
            // Store validation data for UI rendering
            setValidationData(result.validation);
            
            // STEP 6: PERSIST VALIDATION STATE
            // Save validation data to localStorage for persistence across page refreshes
            setItem(VALIDATION_DATA_KEY, result.validation);
            
            // STEP 7: DETERMINE VALIDATION STATUS
            const validation = result.validation;
            if (validation.had_unauthorized_changes || validation.had_length_mismatch) {
              // Validation issues detected - will be displayed by ValidationFeedback component
              console.log('Validation issues detected:', validation);
            } else {
              // Success case - no validation issues found
              setValidationFeedback('Script successfully refined with no validation issues.');
              removeItem(VALIDATION_DATA_KEY);
            }
          }
          
          // STEP 8: RESET UI STATE
          // Clear selection and input after successful refinement
          setSelectedLines([]);
          setImprovementInstruction('');
          setHasUnsavedChanges(false);
          
          // Success! Break out of the retry loop
          break;
        } else {
          throw new Error('Received empty or invalid script from refinement');
        }
      } catch (error: any) {
        // Store the error for potential retry
        lastError = error;
        console.error(`Error refining script (attempt ${currentRetry + 1}/${MAX_RETRIES + 1}):`, lastError);
        
        // Increment retry counter
        currentRetry++;
        
        // If we have more retries, wait a bit before trying again
        if (currentRetry <= MAX_RETRIES) {
          console.log(`Retrying in 1 second... (${currentRetry}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // If we've exhausted all retries and still have an error, show it to the user
    if (lastError) {
      // STEP 9: ERROR HANDLING
      let errorMessage = 'Failed to refine script. Please try again.';
      
      // Provide more specific error messages based on the error
      if (lastError.message?.includes('timeout') || lastError.code === 'ECONNABORTED') {
        errorMessage = 'The request timed out. The server might be busy. Please try again in a moment.';
      } else if (lastError.response?.status === 500) {
        errorMessage = 'Server error. Our AI is having trouble refining your script. Please try again.';
      } else if (lastError.response?.status === 400) {
        errorMessage = 'Invalid request. Please check your inputs and try again.';
      } else if (lastError.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (lastError.message?.includes('Invalid response format') || lastError.message?.includes('empty or invalid script')) {
        errorMessage = 'The server returned an invalid response. Please try again or contact support.';
      }
      
      setError(errorMessage);
      setRetryCount((prev) => prev + 1);
    }
    
    // Always reset the refining state
    setIsRefining(false);
  };

  const handleRefinementRetry = () => {
    setError(null);
    setRetryCount(0);
    executeAIRefinement();
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
        voiceId,
        script,
      });
      
      setAudioUrl(response.data.audioUrl);
      
      // Save the audio version
      saveAudioVersion(
        response.data.audioUrl, 
        `Generated with ${availableVoices.find(v => v.id === voiceId)?.name || 'Custom voice'}, speed: ${speed.toFixed(1)}, pitch: ${pitch.toFixed(1)}`
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

  /**
   * toggleSentenceSelection - Critical function for the validation system
   * -----------------------------------------------------------------------------
   * This function manages which sentences are eligible for modification during refinement.
   * 
   * KEY POINTS:
   * 1. The validation system ONLY allows changes to sentences that have been selected
   *    through this function
   * 
   * 2. Both the backend and frontend validation layers verify that attempted
   *    modifications are limited to these selected indices
   * 
   * 3. Any attempt to modify non-selected sentences will be automatically
   *    detected and reverted by both validation layers
   * 
   * 4. This is the foundation of the targeted refinement approach - ensuring
   *    that only specific parts of the script can be modified while preserving
   *    the rest
   */
  const toggleSentenceSelection = (index: number) => {
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
      setItem(SCRIPT_STORAGE_KEY, script);
      setEditingLine(null);
      setHasUnsavedChanges(false);
      
      // Save the edited version
      saveScriptVersion('Manual line edit');
    } else {
      setEditingLine({ index, isEditing: true });
    }
  };

  const handleScriptLineClick = (index: number, event: React.MouseEvent) => {
    // Don't trigger selection if clicking the edit button or if we're in edit mode
    const target = event.target as HTMLElement;
    if (
      target.closest('button') || // Ignore clicks on or within the edit button
      editingLine?.index === index || // Ignore clicks when in edit mode
      target.tagName === 'TEXTAREA' // Ignore clicks on textareas
    ) {
      return;
    }
    toggleSentenceSelection(index);
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getVersionComparisonHighlight = (index: number, line: Script) => {
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
    setAudioVersions(updatedVersions);
    setItem(AUDIO_VERSIONS_KEY, updatedVersions);
  };
  
  const saveAudioVersion = (audioUrl: string, description: string = 'Audio generation') => {
    const newVersion: AudioVersion = {
      id: generateVersionId(),
      timestamp: new Date(),
      audioUrl,
      speed,
      pitch,
      voiceId,
      description,
    };
    
    const updatedVersions = [...audioVersions, newVersion];
    setAudioVersions(updatedVersions);
    saveAudioVersionHistory(updatedVersions);
    return newVersion;
  };

  /**
   * dismissValidationAlert - Completes the validation feedback cycle
   * -----------------------------------------------------------------------------
   * This function allows users to acknowledge and dismiss validation feedback
   * after they have reviewed the information about protected content.
   * 
   * IMPORTANT ASPECTS:
   * 1. Clears the validation data from both component state and localStorage
   * 
   * 2. This is the only way validation feedback is intentionally cleared
   *    (besides a new successful refinement with no issues)
   * 
   * 3. Ensures users have complete control over when to dismiss validation alerts
   *    after they've had time to understand which changes were prevented
   * 
   * 4. Completes the validation workflow: 
   *    Selection → Refinement → Validation → Feedback → Acknowledgment
   */
  const dismissValidationAlert = () => {
    setValidationData(null);
    removeItem(VALIDATION_DATA_KEY);
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
          <h1 className="text-4xl font-bold text-center mx-auto bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
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
                          restorePreviousVersion(version);
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
                    saveScriptVersion(versionDescription);
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
                onClick={(e) => handleScriptLineClick(index, e)}
                className={`p-4 rounded-lg transition-all duration-200 ${
                  selectedLines.includes(index)
                    ? 'bg-purple-900/50 border border-purple-500 shadow-lg'
                    : 'bg-gray-700/50 hover:bg-gray-700/80 cursor-pointer'
                } ${editingLine?.index === index ? 'cursor-text' : ''} ${getVersionComparisonHighlight(index, item)}`}
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
                  onClick={handleRefinementRetry}
                  className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          <button
            onClick={executeAIRefinement}
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

          {validationData && (
            <div className="relative">
              <ValidationFeedback validation={validationData} selectedLines={selectedLines} />
              <button 
                onClick={dismissValidationAlert}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                aria-label="Dismiss validation feedback"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}

          {validationFeedback && !validationData && (
            <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-blue-300">{validationFeedback}</p>
              </div>
            </div>
          )}
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

          <div className="mb-4">
            <label htmlFor="voice-select" className="block text-sm font-medium text-gray-300 mb-1">
              Voice
            </label>
            <select
              id="voice-select"
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableVoices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
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