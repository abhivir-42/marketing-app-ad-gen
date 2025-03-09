'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProgressSteps from '@/components/ProgressSteps';
import Tooltip from '@/components/Tooltip';
import { Script } from '@/types';
import api from '@/services/api';

const FORM_DATA_STORAGE_KEY = 'scriptGenerationFormData';

const initialFormData = {
  productName: '',
  targetAudience: '',
  keySellingPoints: '',
  tone: '',
  adLength: '',
  adSpeakerVoice: ''
};

// Industry templates to help users get started
const industryTemplates = [
  {
    name: 'Food & Beverage',
    icon: '🍔',
    templates: [
      {
        name: 'Restaurant Promotion',
        data: {
          productName: 'Downtown Bistro',
          targetAudience: 'Urban professionals, foodies, couples looking for date night spots',
          keySellingPoints: 'Farm to table ingredients, award-winning chef, intimate atmosphere, seasonal menu, craft cocktails, outdoor seating',
          tone: 'Sophisticated yet welcoming',
          adLength: '30s',
          adSpeakerVoice: 'Professional'
        }
      },
      {
        name: 'Coffee Shop',
        data: {
          productName: 'Morning Brew Coffee',
          targetAudience: 'Commuters, students, remote workers, coffee enthusiasts',
          keySellingPoints: 'Ethically sourced beans, handcrafted drinks, cozy atmosphere, free wifi, housemade pastries, loyalty program',
          tone: 'Warm and inviting',
          adLength: '15s',
          adSpeakerVoice: 'Casual'
        }
      }
    ]
  },
  {
    name: 'Retail',
    icon: '🛍️',
    templates: [
      {
        name: 'Clothing Sale',
        data: {
          productName: 'Urban Style Clothing',
          targetAudience: 'Fashion-conscious young adults between 18-35',
          keySellingPoints: 'End of season sale, up to 70% off, latest fashion trends, sustainable materials, exclusive designs, limited time offer',
          tone: 'Energetic and urgent',
          adLength: '30s',
          adSpeakerVoice: 'Upbeat'
        }
      },
      {
        name: 'Electronics Store',
        data: {
          productName: 'TechZone Electronics',
          targetAudience: 'Tech enthusiasts, professionals, families upgrading home devices',
          keySellingPoints: 'Latest gadgets, expert staff, price match guarantee, extended warranty options, free setup service, trade-in program',
          tone: 'Knowledgeable and helpful',
          adLength: '60s',
          adSpeakerVoice: 'Professional'
        }
      }
    ]
  },
  {
    name: 'Healthcare',
    icon: '⚕️',
    templates: [
      {
        name: 'Clinic Services',
        data: {
          productName: 'HealthFirst Family Clinic',
          targetAudience: 'Families, seniors, individuals seeking preventative care',
          keySellingPoints: 'Same-day appointments, caring staff, comprehensive services, modern facilities, accepts most insurance, telehealth options',
          tone: 'Compassionate and reassuring',
          adLength: '60s',
          adSpeakerVoice: 'Warm'
        }
      }
    ]
  },
  {
    name: 'Automotive',
    icon: '🚗',
    templates: [
      {
        name: 'Car Dealership',
        data: {
          productName: 'AutoPrime Dealership',
          targetAudience: 'New car buyers, families looking to upgrade, professionals',
          keySellingPoints: 'Year-end clearance, 0% financing, factory rebates, huge inventory, trusted service department, complimentary maintenance',
          tone: 'Confident and exciting',
          adLength: '30s',
          adSpeakerVoice: 'Professional'
        }
      }
    ]
  }
];

const ScriptGenerationPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [hasExistingScript, setHasExistingScript] = useState(false);
  const [adSpeakerVoice, setAdSpeakerVoice] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Load saved form data on component mount and check for existing script
  useEffect(() => {
    const savedFormData = localStorage.getItem(FORM_DATA_STORAGE_KEY);
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Error parsing saved form data:', error);
        localStorage.removeItem(FORM_DATA_STORAGE_KEY);
      }
    }

    // Check if there's an existing script in localStorage
    const existingScript = localStorage.getItem('generatedScript');
    const scriptData = localStorage.getItem('scriptData');
    
    // If either one exists, we can navigate back to results
    setHasExistingScript(!!(existingScript || scriptData));
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.productName.trim()) {
      errors.productName = 'Product name is required';
    }
    if (!formData.targetAudience.trim()) {
      errors.targetAudience = 'Target audience is required';
    }
    if (!formData.keySellingPoints.trim()) {
      errors.keySellingPoints = 'Key selling points are required';
    } else if (formData.keySellingPoints.split(' ').length < 3) {
      errors.keySellingPoints = 'Please provide at least 3 words for key selling points';
    }
    if (!formData.tone.trim()) {
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
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    // Save to localStorage on each change
    localStorage.setItem(FORM_DATA_STORAGE_KEY, JSON.stringify(updatedFormData));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const applyTemplate = (templateData: Partial<typeof initialFormData>) => {
    const updatedFormData = { ...formData, ...templateData };
    setFormData(updatedFormData);
    localStorage.setItem(FORM_DATA_STORAGE_KEY, JSON.stringify(updatedFormData));
    setShowTemplates(false);
    // Clear any form errors for fields that were filled by the template
    const updatedErrors = { ...formErrors };
    Object.keys(templateData).forEach(key => {
      if (updatedErrors[key]) {
        delete updatedErrors[key];
      }
    });
    setFormErrors(updatedErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting script generation...');
      const script = await api.generateScript({
        product_name: formData.productName,
        target_audience: formData.targetAudience,
        key_selling_points: formData.keySellingPoints,
        tone: formData.tone,
        ad_length: formData.adLength,
        speaker_voice: formData.adSpeakerVoice
      });
      
      console.log('Script generation completed successfully');
      if (script && script.length > 0) {
        // Store the generated script in localStorage
        localStorage.setItem('generatedScript', JSON.stringify(script));
        router.push('/results');
      } else {
        throw new Error('Received empty or invalid script');
      }
    } catch (error: any) {
      console.error('Error generating script:', error);
      let errorMessage = 'Failed to generate script. Try again.';
      
      // Provide more specific error messages based on the error
      if (error.message?.includes('timeout') || error.code === 'ECONNABORTED') {
        errorMessage = 'The request timed out. The server might be busy. Please try again in a moment.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Our AI is having trouble generating your script. Please try again.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid request. Please check your inputs and try again.';
      } else if (error.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMessage);
      setRetryCount((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  // Add window beforeunload event to warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const isDirty = Object.values(formData).some(value => value !== '');
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Script Creation
        </h1>

        <ProgressSteps currentStep={1} />

        <div className="mt-12 mb-6">
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {showTemplates ? 'Hide Templates' : 'Browse Templates'}
            </button>
          </div>
          
          {showTemplates && (
            <div className="bg-gray-800 rounded-xl p-6 mb-8 shadow-xl transition-all duration-300">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Get Started Faster</h2>
                <p className="text-gray-300 mb-4">
                  Browse our industry templates for inspiration or start from scratch with your own creative vision.
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {industryTemplates.map((industry) => (
                  <button
                    key={industry.name}
                    onClick={() => setSelectedIndustry(selectedIndustry === industry.name ? null : industry.name)}
                    className={`p-4 rounded-lg text-center transition-all ${
                      selectedIndustry === industry.name 
                        ? 'bg-purple-900/60 border border-purple-500 shadow-lg' 
                        : 'bg-gray-700/60 hover:bg-gray-700 border border-gray-700'
                    }`}
                  >
                    <div className="text-3xl mb-2">{industry.icon}</div>
                    <div className="font-medium">{industry.name}</div>
                  </button>
                ))}
              </div>
              
              {selectedIndustry && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium border-b border-gray-700 pb-2">
                    {selectedIndustry} Templates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {industryTemplates
                      .find(industry => industry.name === selectedIndustry)
                      ?.templates.map((template) => (
                        <div 
                          key={template.name}
                          className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 hover:border-purple-500 transition-colors cursor-pointer"
                          onClick={() => applyTemplate(template.data)}
                        >
                          <h4 className="font-medium text-purple-400 mb-1">{template.name}</h4>
                          <p className="text-sm text-gray-300 line-clamp-2">{template.data.keySellingPoints}</p>
                          <button 
                            className="mt-3 text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors"
                          >
                            Apply Template
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-8 shadow-xl">
          <h2 className="text-2xl font-semibold mb-6">Enter Your Ad Details</h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Product or Service Name
                </label>
                <Tooltip text="The name of the product, service, or business you're advertising">
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
                placeholder="e.g., Morning Brew Coffee Shop"
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
                <Tooltip text="Who is your ad aimed at? Be as specific as possible">
                  <svg className="w-4 h-4 ml-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </Tooltip>
              </div>
              <input
                type="text"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg bg-gray-700 border text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                  formErrors.targetAudience ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="e.g., Working professionals aged 25-45 who commute daily"
              />
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
                <Tooltip text="Describe the tone of your ad (e.g., Fun, Professional, Urgent, Casual, Luxury)">
                  <svg className="w-4 h-4 ml-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </Tooltip>
              </div>
              <input
                type="text"
                name="tone"
                value={formData.tone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg bg-gray-700 border text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                  formErrors.tone ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="e.g., Professional, Fun, Urgent, Casual, Luxury"
              />
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

          <div className="mb-8"></div>

          {error && (
            <div className="space-y-4 mb-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              } ${!hasExistingScript ? 'md:col-span-2' : ''}`}
            >
              {isLoading ? (
                <LoadingSpinner text="Generating Script..." />
              ) : (
                'Generate Script'
              )}
            </button>
            
            {hasExistingScript && (
              <button
                type="button"
                onClick={() => router.push('/results')}
                className="w-full py-4 px-6 rounded-lg border-2 border-purple-500 text-purple-300 font-medium hover:bg-purple-900/20 transition-all duration-200 flex items-center justify-center"
              >
                Return to Your Generated Script
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScriptGenerationPage; 