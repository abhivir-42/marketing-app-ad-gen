import axios from 'axios';
import { Script, ValidationMetadata } from '@/types';

// Determine API URL based on environment
const getApiBaseUrl = () => {
  // Check if running on Vercel
  const isVercel = process.env.VERCEL === '1' || process.env.NEXT_PUBLIC_VERCEL === '1';
  
  // Check if we're in the browser (client-side) or Node.js (server-side)
  const isBrowser = typeof window !== 'undefined';
  
  console.log('Environment variables:', {
    VERCEL: process.env.VERCEL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_VERCEL_API_URL: process.env.NEXT_PUBLIC_VERCEL_API_URL,
    isBrowser
  });
  
  if (isVercel) {
    console.log('Using Vercel API URL');
    // On Vercel deployed frontend, use the VM IP address
    return process.env.NEXT_PUBLIC_VERCEL_API_URL || 'http://172.206.3.68:8000';
  } else {
    console.log('Using local API URL');
    // For local development or server-side rendering
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
  }
};

// Set API base URL dynamically
const API_BASE_URL = getApiBaseUrl();

console.log('Using API base URL:', API_BASE_URL);

export interface GenerateScriptRequest {
  product_name: string;
  target_audience: string;
  key_selling_points: string;
  tone: string;
  ad_length: number;
  speaker_voice: string;
}

export interface RefineScriptRequest {
  selected_sentences: number[];
  improvement_instruction: string;
  current_script: [string, string][];
  key_selling_points: string;
  tone: string;
  ad_length: number;
}

export interface RefineScriptResult {
  script: Script[];
  validation?: ValidationMetadata;
}

// Helper function to convert ad length string to number
const parseAdLengthToSeconds = (adLength: string): number => {
  return parseInt(adLength.replace('s', ''), 10);
};

const api = {
  generateScript: async (data: Omit<GenerateScriptRequest, 'ad_length'> & { ad_length: string }): Promise<Script[]> => {
    try {
      const transformedData: GenerateScriptRequest = {
        ...data,
        ad_length: parseAdLengthToSeconds(data.ad_length)
      };
      console.log('Sending to backend:', transformedData);
      
      // Use the API route for script generation
      const response = await axios.post(`${API_BASE_URL}/generate_script`, transformedData);
      console.log('Received from backend:', response.data);
      
      // Check if the response has the expected structure
      if (!response.data || !response.data.script) {
        console.error('Unexpected response format:', response.data);
        throw new Error('Invalid response format from the server');
      }
      
      // Transform the response data into the expected format if necessary
      const scripts: Script[] = Array.isArray(response.data.script) 
        ? response.data.script 
        : response.data.script.split('\n').map((line: string) => {
            const [scriptLine, artDirection] = line.split('|').map(s => s.trim());
            return { line: scriptLine, artDirection: artDirection || '' };
          });
      
      return scripts;
    } catch (error) {
      console.error('Error generating script:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data || error.message);
      }
      throw error;
    }
  },

  refineScriptWithValidation: async (data: Omit<RefineScriptRequest, 'ad_length'> & { ad_length: string }): Promise<RefineScriptResult> => {
    try {
      // STEP 1: PREPARE REQUEST DATA
      // Transform the data to match backend expectations
      const transformedData: RefineScriptRequest = {
        ...data,
        ad_length: parseAdLengthToSeconds(data.ad_length),
        // Ensure current_script is in the correct tuple format
        current_script: data.current_script.map(([line, artDirection]) => [
          line.toString(),
          artDirection.toString()
        ])
      };
      
      console.log('Sending to backend for refinement:', transformedData);
      
      // STEP 2: SEND REQUEST TO BACKEND WITH SELECTED SENTENCES
      // The backend will apply its own validation to prevent unauthorized changes
      // Use the refine_script API route (which proxies to the backend's regenerate_script endpoint)
      const response = await axios.post(`${API_BASE_URL}/refine_script`, transformedData);
      console.log('Received from backend after refinement:', response.data);
      
      // Check if the response has the expected structure
      if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
        console.error('Unexpected response format:', response.data);
        throw new Error('Invalid response format from the server');
      }
      
      // STEP 3: PREPARE FOR FRONTEND VALIDATION
      // Get the current script from the request for comparison
      const currentScript: Script[] = transformedData.current_script.map(([line, artDirection]) => ({
        line,
        artDirection
      }));
      
      // Create a new script by applying modifications only to the specified indices
      const modifiedScript = [...currentScript];
      
      // STEP 4: FRONTEND SAFEGUARD - ADDITIONAL VALIDATION LAYER
      // This provides a second layer of protection to ensure only selected sentences are modified
      const frontendValidation: ValidationMetadata = {
        had_unauthorized_changes: false,
        reverted_changes: [],
        had_length_mismatch: false,
        original_length: currentScript.length,
        received_length: response.data.data ? response.data.data.length : 0,
        selected_sentences: data.selected_sentences
      };
      
      // STEP 5: APPLY MODIFICATIONS WITH FRONTEND VERIFICATION
      // Only apply changes to sentences that were explicitly selected for modification
      if (response.data.modified_indices && response.data.data) {
        // First pass: Verify all modifications are for selected sentences
        response.data.modified_indices.forEach((index: number, i: number) => {
          // Verify the index is valid and was selected for modification
          const isValidModification = index >= 0 && 
                                     index < modifiedScript.length && 
                                     i < response.data.data.length &&
                                     data.selected_sentences.includes(index); // KEY CHECK: Was this sentence selected?
          
          if (!isValidModification && index < modifiedScript.length) {
            // UNAUTHORIZED CHANGE DETECTED: Log and track for reporting to user
            frontendValidation.had_unauthorized_changes = true;
            frontendValidation.reverted_changes.push({
              index,
              original: modifiedScript[index],
              attempted: {
                line: response.data.data[i].line || response.data.data[i][0],
                artDirection: response.data.data[i].artDirection || response.data.data[i][1]
              }
            });
            
            console.warn(`Frontend safeguard: Prevented unauthorized change to sentence ${index}`);
            // IMPORTANT: We don't apply this change, keeping the original content
          } else if (isValidModification) {
            // AUTHORIZED CHANGE: Apply the modification since it's to a selected sentence
            const modifiedSentence = response.data.data[i];
            modifiedScript[index] = {
              line: modifiedSentence.line || modifiedSentence[0],
              artDirection: modifiedSentence.artDirection || modifiedSentence[1]
            };
          }
        });
      }
      
      // STEP 6: COMBINE VALIDATION RESULTS
      // Merge backend and frontend validation to provide comprehensive feedback
      const combinedValidation = response.data.validation ? {
        ...response.data.validation,
        had_unauthorized_changes: response.data.validation.had_unauthorized_changes || frontendValidation.had_unauthorized_changes,
        reverted_changes: [
          ...(response.data.validation.reverted_changes || []),
          ...frontendValidation.reverted_changes
        ]
      } : frontendValidation;
      
      // STEP 7: RETURN VALIDATED SCRIPT
      // Return both the safely modified script and the validation metadata
      return {
        script: modifiedScript,
        validation: combinedValidation
      };
    } catch (error) {
      console.error('Error refining script:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data || error.message);
      }
      throw error;
    }
  }
};

export default api; 