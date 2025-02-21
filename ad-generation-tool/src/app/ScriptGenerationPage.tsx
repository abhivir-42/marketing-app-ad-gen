'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Script, GenerateScriptResponse } from '@/types';

const ScriptGenerationPage: React.FC = () => {
  const router = useRouter();
  const [productName, setProductName] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [keySellingPoints, setKeySellingPoints] = useState('');
  const [tone, setTone] = useState('');
  const [adLength, setAdLength] = useState('');
  const [adSpeakerVoice, setAdSpeakerVoice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post<GenerateScriptResponse>('/api/generate_script', {
        productName,
        targetAudience,
        keySellingPoints,
        tone,
        adLength,
        adSpeakerVoice,
      });

      // Store the generated script in localStorage for the results page
      localStorage.setItem('generatedScript', JSON.stringify(response.data.script));
      
      // Navigate to the results page
      router.push('/results');
    } catch (error) {
      console.error('Error generating script:', error);
      setError('Failed to generate script. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Create Your Ad Script
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-8 bg-gray-800 rounded-xl p-8 shadow-xl">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., Morning Brew Coffee"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Audience
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="">Select Audience</option>
                <option value="Teens">Teens</option>
                <option value="Young Adults">Young Adults</option>
                <option value="Parents">Parents</option>
                <option value="Small Business Owners">Small Business Owners</option>
                <option value="Professionals">Professionals</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Key Selling Points
              </label>
              <textarea
                value={keySellingPoints}
                onChange={(e) => setKeySellingPoints(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 min-h-[120px]"
                placeholder="What makes your product special? List key features and benefits..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="">Select Tone</option>
                <option value="Fun">Fun</option>
                <option value="Professional">Professional</option>
                <option value="Urgent">Urgent</option>
                <option value="Casual">Casual</option>
                <option value="Luxury">Luxury</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ad Length
              </label>
              <select
                value={adLength}
                onChange={(e) => setAdLength(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="">Select Length</option>
                <option value="15s">15 seconds</option>
                <option value="30s">30 seconds</option>
                <option value="60s">60 seconds</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ad Speaker Voice
              </label>
              <select
                value={adSpeakerVoice}
                onChange={(e) => setAdSpeakerVoice(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="">Select Voice</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Either">Either</option>
              </select>
            </div>
          </div>

          {error && <ErrorMessage message={error} />}

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