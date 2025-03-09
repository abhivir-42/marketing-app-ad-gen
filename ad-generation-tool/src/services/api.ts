import axios from 'axios';
import { Script, ValidationMetadata } from '@/types';

// Create an axios instance with proper timeout and headers
const apiClient = axios.create({
  timeout: 120000, // Increased to 2 minutes
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept'
  }
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}: Status ${response.status}`);
    return response;
  },
  (error) => {
    console.error('Response error:', error.message);
    if (axios.isAxiosError(error) && error.response) {
      console.error(`Status: ${error.response.status}, Data:`, error.response.data);
    }
    return Promise.reject(error);
  }
);

// Determine API URL based on environment
const getApiBaseUrl = () => {
  // Check if running on Vercel
  const isVercel = process.env.VERCEL === '1' || process.env.NEXT_PUBLIC_VERCEL === '1';
  
  // Check if we're in the browser (client-side) or Node.js (server-side)
  const isBrowser = typeof window !== 'undefined';
  
  console.log('[DEBUG-ENV] Environment variables:', {
    VERCEL: process.env.VERCEL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_VERCEL_API_URL: process.env.NEXT_PUBLIC_VERCEL_API_URL,
    NODE_ENV: process.env.NODE_ENV,
    isBrowser
  });
  
  // Always use direct backend connection for debugging
  if (isBrowser && !isVercel && process.env.NODE_ENV !== 'production') {
    // For local development testing, try using the direct backend URL
    console.log('[DEBUG-ENV] Using direct backend URL for debugging');
    return 'http://172.206.3.68:8000';
  }
  
  if (isVercel || process.env.NODE_ENV === 'production') {
    console.log('[DEBUG-ENV] Using Vercel/Production API URL');
    // When deployed to Vercel, use the Next.js API routes
    return '/api';
  } else {
    console.log('[DEBUG-ENV] Using local API URL');
    // For local development or server-side rendering
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
  }
};

// Use the determined API base URL
const API_BASE_URL = getApiBaseUrl();
console.log('Using API base URL:', API_BASE_URL);

// Helper function to convert ad length string to seconds for the backend
const parseAdLengthToSeconds = (adLength: string): number => {
  const seconds = parseInt(adLength.replace('s', ''), 10);
  return isNaN(seconds) ? 30 : seconds; // Default to 30 seconds if parsing fails
};

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

const api = {
  // Test connection to backend
  testConnection: async (): Promise<boolean> => {
    try {
      console.log('[DEBUG] Testing connection to backend...');
      const url = `${API_BASE_URL}/test_connection`;
      console.log('[DEBUG] Testing URL:', url);
      
      const response = await apiClient.get(url);
      console.log('[DEBUG] Test connection response:', response.data);
      return true;
    } catch (error) {
      console.error('[DEBUG] Test connection failed:', error);
      return false;
    }
  },

  generateScript: async (data: Omit<GenerateScriptRequest, 'ad_length'> & { ad_length: string }): Promise<Script[]> => {
    try {
      console.log('[DEBUG] generateScript called with data:', data);
      
      const transformedData: GenerateScriptRequest = {
        ...data,
        ad_length: parseAdLengthToSeconds(data.ad_length)
      };
      console.log('[DEBUG] Transformed data:', transformedData);
      console.log('[DEBUG] API URL being used:', API_BASE_URL);
      
      // Use the API route for script generation
      console.log('[DEBUG] About to make POST request to:', `${API_BASE_URL}/generate_script`);
      console.log('[DEBUG] With headers:', apiClient.defaults.headers);
      
      const response = await apiClient.post(`${API_BASE_URL}/generate_script`, transformedData);
      
      console.log('[DEBUG] Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        hasData: !!response.data,
        hasScript: response.data && !!response.data.script
      });
      
      // Check if the response has the expected structure
      if (!response.data) {
        console.error('[DEBUG] No response data received');
        throw new Error('No response data received from the server');
      }
      
      if (!response.data.script) {
        console.error('[DEBUG] Response data does not contain script:', response.data);
        throw new Error('Invalid response format from the server: missing script');
      }
      
      console.log('[DEBUG] Script data received:', response.data.script);
      
      // Transform the response data into the expected format if necessary
      let scripts: Script[];
      
      if (Array.isArray(response.data.script)) {
        console.log('[DEBUG] Script is already an array');
        scripts = response.data.script;
      } else {
        console.log('[DEBUG] Converting script string to array format');
        scripts = response.data.script.split('\n').map((line: string) => {
          const [scriptLine, artDirection] = line.split('|').map(s => s.trim());
          return { line: scriptLine, artDirection: artDirection || '' };
        });
      }
      
      console.log('[DEBUG] Final processed script:', scripts);
      return scripts;
    } catch (error) {
      console.error('[DEBUG] Error in generateScript:', error);
      
      // Add detailed error reporting
      if (axios.isAxiosError(error)) {
        console.error('[DEBUG] This is an Axios error');
        console.error('[DEBUG] Error code:', error.code);
        console.error('[DEBUG] Error message:', error.message);
        
        if (error.response) {
          console.error('[DEBUG] Response status:', error.response.status);
          console.error('[DEBUG] Response headers:', error.response.headers);
          console.error('[DEBUG] Response data:', error.response.data);
        } else if (error.request) {
          console.error('[DEBUG] Request was made but no response received');
          console.error('[DEBUG] Request details:', error.request);
        } else {
          console.error('[DEBUG] Error in setting up the request');
        }
        
        if (error.code === 'ECONNABORTED') {
          console.error('[DEBUG] Request timed out');
        }
      } else {
        console.error('[DEBUG] This is not an Axios error');
        console.error('[DEBUG] Error type:', typeof error);
        console.error('[DEBUG] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
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
      console.log('API URL being used:', API_BASE_URL);
      
      // STEP 2: SEND REQUEST TO BACKEND WITH SELECTED SENTENCES
      // The backend will apply its own validation to prevent unauthorized changes
      // Use the refine_script API route (which proxies to the backend's regenerate_script endpoint)
      const response = await apiClient.post(`${API_BASE_URL}/refine_script`, transformedData);
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
      
      // Track which sentences were actually modified
      const frontendValidation = {
        had_unauthorized_changes: false,
        reverted_changes: [] as any[]
      };
      
      // STEP 4: APPLY BACKEND CHANGES TO SELECTED SENTENCES
      // Apply the changes from the backend response to the selected sentences
      for (let i = 0; i < response.data.data.length; i++) {
        const idx = response.data.modified_indices?.[i] ?? data.selected_sentences[i];
        if (idx !== undefined && idx < modifiedScript.length) {
          modifiedScript[idx] = {
            line: response.data.data[i].line,
            artDirection: response.data.data[i].artDirection
          };
        }
      }
      
      // STEP 5: VERIFY ONLY SELECTED SENTENCES WERE MODIFIED
      // Double-check that only the selected sentences were modified
      for (let i = 0; i < currentScript.length; i++) {
        // If this sentence wasn't selected for modification, it should remain unchanged
        if (!data.selected_sentences.includes(i)) {
          const original = currentScript[i];
          const modified = modifiedScript[i];
          
          // Check if the sentence was modified despite not being selected
          if (original.line !== modified.line || original.artDirection !== modified.artDirection) {
            console.warn(`Unauthorized change detected at index ${i}. Reverting to original.`);
            frontendValidation.had_unauthorized_changes = true;
            frontendValidation.reverted_changes.push({
              index: i,
              original: original,
              attempted: modified
            });
            
            // Revert the unauthorized change
            modifiedScript[i] = { ...original };
          }
        }
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
        if (error.code === 'ECONNABORTED') {
          console.error('Request timed out - the backend may be overloaded or unavailable');
        }
      }
      throw error;
    }
  }
};

export default api; 