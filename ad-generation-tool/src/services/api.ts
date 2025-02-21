import axios from 'axios';
import { Script } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

// Helper function to convert ad length string to number
const convertAdLengthToSeconds = (adLength: string): number => {
  return parseInt(adLength.replace('s', ''), 10);
};

const api = {
  generateScript: async (data: Omit<GenerateScriptRequest, 'ad_length'> & { ad_length: string }): Promise<Script[]> => {
    try {
      const transformedData: GenerateScriptRequest = {
        ...data,
        ad_length: convertAdLengthToSeconds(data.ad_length)
      };
      console.log('Sending to backend:', transformedData);
      const response = await axios.post(`${API_BASE_URL}/generate_script`, transformedData);
      console.log('Received from backend:', response.data);
      
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
      throw error;
    }
  },

  refineScript: async (data: Omit<RefineScriptRequest, 'ad_length'> & { ad_length: string }): Promise<Script[]> => {
    try {
      const transformedData: RefineScriptRequest = {
        ...data,
        ad_length: convertAdLengthToSeconds(data.ad_length)
      };
      console.log('Sending to backend for refinement:', transformedData);
      const response = await axios.post(`${API_BASE_URL}/regenerate_script`, transformedData);
      console.log('Received from backend after refinement:', response.data);
      
      // Transform the response data into the expected format if necessary
      const scripts: Script[] = Array.isArray(response.data.data) 
        ? response.data.data 
        : response.data.data.split('\n').map((line: string) => {
            const [scriptLine, artDirection] = line.split('|').map(s => s.trim());
            return { line: scriptLine, artDirection: artDirection || '' };
          });
      
      return scripts;
    } catch (error) {
      console.error('Error refining script:', error);
      throw error;
    }
  }
};

export default api; 