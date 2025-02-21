'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProgressSteps from '@/components/ProgressSteps';
import Tooltip from '@/components/Tooltip';
import { Script, GenerateScriptResponse } from '@/types';

const ScriptGenerationPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    productName: '',
    targetAudience: '',
    keySellingPoints: '',
    tone: '',
    adLength: '',
    adSpeakerVoice: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.productName.trim()) {
      errors.productName = 'Product name is required';
    }
    if (!formData.targetAudience) {
      errors.targetAudience = 'Target audience is required';
    }
    if (!formData.keySellingPoints.trim()) {
      errors.keySellingPoints = 'Key selling points are required';
    } else if (formData.keySellingPoints.split(' ').length < 10) {
      errors.keySellingPoints = 'Please provide at least 10 words for key selling points';
    }
    if (!formData.tone) {
      errors.tone = 'Tone is required';
    }
    if (!formData.adLength) {
      errors.adLength = 'Ad length is required';
    }
    if (!formData.adSpeakerVoice) {
      errors.adSpeakerVoice = 'Speaker voice is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post<GenerateScriptResponse>('/api/generate_script', formData);
      localStorage.setItem('generatedScript', JSON.stringify(response.data.script));
      router.push('/results');
    } catch (error) {
      console.error('Error generating script:', error);
      setError('Failed to generate script. Please try again.');
      setRetryCount((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
    handleSubmit(new Event('submit') as any);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Create Your Ad Script
        </h1>

        <ProgressSteps currentStep={1} />
        
        <form onSubmit={handleSubmit} className="space-y-8 bg-gray-800 rounded-xl p-8 shadow-xl mt-12">
          <div className="space-y-6">
            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Product Name
                </label>
                <Tooltip text="Enter the name of your product or service">
                  <svg className="w-4 h-4 ml-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </Tooltip>
              </div>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg bg-gray-700 border text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                  formErrors.productName ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="e.g., Morning Brew Coffee"
              />
              {formErrors.productName && (
                <p className="mt-1 text-sm text-red-400">{formErrors.productName}</p>
              )}
            </div>

            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Target Audience
                </label>
                <Tooltip text="Select the primary audience for your advertisement">
                  <svg className="w-4 h-4 ml-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </Tooltip>
              </div>
              <select
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg bg-gray-700 border text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                  formErrors.targetAudience ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                <option value="">Select Audience</option>
                <option value="Teens">Teens</option>
                <option value="Young Adults">Young Adults</option>
                <option value="Parents">Parents</option>
                <option value="Small Business Owners">Small Business Owners</option>
                <option value="Professionals">Professionals</option>
              </select>
              {formErrors.targetAudience && (
                <p className="mt-1 text-sm text-red-400">{formErrors.targetAudience}</p>
              )}
            </div>

            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Key Selling Points
                </label>
                <Tooltip text="List key features and benefits of your product">
                  <svg className="w-4 h-4 ml-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </Tooltip>
              </div>
              <textarea
                name="keySellingPoints"
                value={formData.keySellingPoints}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg bg-gray-700 border text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 min-h-[120px] ${
                  formErrors.keySellingPoints ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="What makes your product special? List key features and benefits..."
              />
              {formErrors.keySellingPoints && (
                <p className="mt-1 text-sm text-red-400">{formErrors.keySellingPoints}</p>
              )}
            </div>

            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Tone
                </label>
                <Tooltip text="Select the overall tone of your advertisement">
                  <svg className="w-4 h-4 ml-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </Tooltip>
              </div>
              <select
                name="tone"
                value={formData.tone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg bg-gray-700 border text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                  formErrors.tone ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                <option value="">Select Tone</option>
                <option value="Fun">Fun</option>
                <option value="Professional">Professional</option>
                <option value="Urgent">Urgent</option>
                <option value="Casual">Casual</option>
                <option value="Luxury">Luxury</option>
              </select>
              {formErrors.tone && (
                <p className="mt-1 text-sm text-red-400">{formErrors.tone}</p>
              )}
            </div>

            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Ad Length
                </label>
                <Tooltip text="Select the duration of your advertisement">
                  <svg className="w-4 h-4 ml-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </Tooltip>
              </div>
              <select
                name="adLength"
                value={formData.adLength}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg bg-gray-700 border text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                  formErrors.adLength ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                <option value="">Select Length</option>
                <option value="15s">15 seconds</option>
                <option value="30s">30 seconds</option>
                <option value="60s">60 seconds</option>
              </select>
              {formErrors.adLength && (
                <p className="mt-1 text-sm text-red-400">{formErrors.adLength}</p>
              )}
            </div>

            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Ad Speaker Voice
                </label>
                <Tooltip text="Select the voice for your advertisement">
                  <svg className="w-4 h-4 ml-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </Tooltip>
              </div>
              <select
                name="adSpeakerVoice"
                value={formData.adSpeakerVoice}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg bg-gray-700 border text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                  formErrors.adSpeakerVoice ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                <option value="">Select Voice</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Either">Either</option>
              </select>
              {formErrors.adSpeakerVoice && (
                <p className="mt-1 text-sm text-red-400">{formErrors.adSpeakerVoice}</p>
              )}
            </div>
          </div>

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
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <LoadingSpinner text="Generating Script..." />
            ) : (
              'Generate Script'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScriptGenerationPage; 