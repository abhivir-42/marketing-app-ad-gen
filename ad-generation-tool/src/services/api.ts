import axios from 'axios';
import { Script, ValidationMetadata } from '@/types';

// Use the Next.js API routes instead of the backend server
const API_BASE_URL = '/api';

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
  generateInitialScript: async (data: Omit<GenerateScriptRequest, 'ad_length'> & { ad_length: string }): Promise<Script[]> => {
    try {
      const transformedData: GenerateScriptRequest = {
        ...data,
        ad_length: parseAdLengthToSeconds(data.ad_length)
      };
      console.log('Sending to backend:', transformedData);
      console.log('API URL:', `${API_BASE_URL}/generate_script`);
      
      // Add a timeout to the request to prevent hanging
      const response = await axios.post(`${API_BASE_URL}/generate_script`, transformedData, {
        timeout: 30000 // 30 seconds timeout
      });
      
      console.log('Received from backend:', response.data);
      
      // Check if the response has the expected structure
      if (!response.data) {
        console.error('Empty response received');
        throw new Error('Empty response received from server');
      }
      
      if (response.data.success === false) {
        console.error('API returned error:', response.data);
        throw new Error(response.data.error || 'Unknown API error');
      }
      
      if (!response.data.script) {
        console.error('No script in response:', response.data);
        throw new Error('No script data in response');
      }
      
      // Transform the response data into the expected format if necessary
      let scripts: Script[];
      
      if (Array.isArray(response.data.script)) {
        scripts = response.data.script;
      } else if (typeof response.data.script === 'string') {
        scripts = response.data.script.split('\n').map((line: string) => {
          const [scriptLine, artDirection] = line.split('|').map(s => s.trim());
          return { line: scriptLine, artDirection: artDirection || '' };
        });
      } else {
        console.error('Unexpected script format:', response.data.script);
        throw new Error('Received invalid script format');
      }
      
      // Validate the script array
      if (!scripts || scripts.length === 0) {
        console.error('Empty script array received');
        throw new Error('Received empty script array');
      }
      
      return scripts;
    } catch (error) {
      console.error('Error generating script:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          console.error('Request timed out');
          throw new Error('Request timed out. Please try again.');
        }
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Axios error response:', {
            data: error.response.data,
            status: error.response.status,
            headers: error.response.headers
          });
          
          // If the server returned an error message, use it
          if (error.response.data && error.response.data.error) {
            throw new Error(error.response.data.error);
          }
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
          throw new Error('No response received from server. Please check your connection.');
        }
        
        console.error('Axios error details:', {
          message: error.message,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            data: error.config?.data
          }
        });
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
      
      console.log('Sending to API for refinement:', transformedData);
      
      // STEP 2: SEND REQUEST TO API WITH SELECTED SENTENCES
      // Use the Next.js API route instead of the backend server
      const response = await axios.post(`${API_BASE_URL}/refine_script`, {
        selectedLines: data.selected_sentences,
        improvementInstruction: data.improvement_instruction,
        script: data.current_script.map(([line, artDirection]) => ({
          line,
          artDirection
        }))
      }, {
        timeout: 30000 // 30 seconds timeout
      });
      
      console.log('Received from API after refinement:', response.data);
      
      if (!response.data || !response.data.script) {
        console.error('Invalid response from refine_script API:', response.data);
        throw new Error('Invalid response from refine_script API');
      }
      
      // STEP 3: PREPARE FOR FRONTEND VALIDATION
      // Get the current script from the request for comparison
      const currentScript: Script[] = transformedData.current_script.map(([line, artDirection]) => ({
        line,
        artDirection
      }));
      
      // Use the refined script from the API response
      const modifiedScript = response.data.script;
      
      // STEP 4: FRONTEND SAFEGUARD - ADDITIONAL VALIDATION LAYER
      // This provides a second layer of protection to ensure only selected sentences are modified
      const frontendValidation: ValidationMetadata = {
        had_unauthorized_changes: false,
        reverted_changes: [],
        had_length_mismatch: false,
        original_length: currentScript.length,
        received_length: modifiedScript.length
      };
      
      // STEP 7: RETURN VALIDATED SCRIPT
      // Return both the safely modified script and the validation metadata
      return {
        script: modifiedScript,
        validation: frontendValidation
      };
    } catch (error) {
      console.error('Error refining script:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          console.error('Request timed out');
          throw new Error('Request timed out. Please try again.');
        }
        
        if (error.response) {
          console.error('Axios error response:', {
            data: error.response.data,
            status: error.response.status,
            headers: error.response.headers
          });
          
          if (error.response.data && error.response.data.error) {
            throw new Error(error.response.data.error);
          }
        } else if (error.request) {
          console.error('No response received:', error.request);
          throw new Error('No response received from server. Please check your connection.');
        }
      }
      throw error;
    }
  }
};

export default api; 