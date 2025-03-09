import { supabase, getOrCreateSessionId } from './supabase';

// Storage keys
export const FORM_DATA_STORAGE_KEY = 'scriptGenerationFormData';
export const SCRIPT_STORAGE_KEY = 'generatedScript';
export const SCRIPT_DATA_STORAGE_KEY = 'scriptData';
export const SCRIPT_VERSIONS_KEY = 'scriptVersionHistory';
export const AUDIO_VERSIONS_KEY = 'audioVersionHistory';
export const VALIDATION_DATA_KEY = 'validationData';

// Helper to determine if we're running in a browser environment
export const isBrowser = typeof window !== 'undefined';

// Determines if we should use Supabase or localStorage
// In production (Vercel), always use Supabase
// In development, use localStorage for faster development
export const shouldUseSupabase = () => {
  if (!isBrowser) return false; // During SSR, don't use either
  
  const isVercel = process.env.VERCEL === '1' || process.env.NEXT_PUBLIC_VERCEL === '1';
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Always use Supabase in production environments
  return isVercel || isProduction;
};

// Generic get item function
export async function getItem(key: string) {
  if (!isBrowser) return null;
  
  const sessionId = getOrCreateSessionId();
  if (!sessionId) return null;
  
  if (shouldUseSupabase()) {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('data')
        .eq('session_id', sessionId)
        .eq('key', key)
        .single();
      
      if (error) {
        console.error('Error fetching from Supabase:', error);
        return null;
      }
      
      return data ? data.data : null;
    } catch (error) {
      console.error('Error in getItem from Supabase:', error);
      return null;
    }
  } else {
    // Fallback to localStorage in development
    return localStorage.getItem(key);
  }
}

// Generic set item function
export async function setItem(key: string, value: any) {
  if (!isBrowser) return;
  
  const sessionId = getOrCreateSessionId();
  if (!sessionId) return;
  
  if (shouldUseSupabase()) {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      const { error } = await supabase
        .from('user_data')
        .upsert(
          { 
            session_id: sessionId,
            key: key,
            data: stringValue,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'session_id,key' }
        );
      
      if (error) {
        console.error('Error setting item in Supabase:', error);
      }
    } catch (error) {
      console.error('Error in setItem to Supabase:', error);
    }
  } else {
    // Fallback to localStorage in development
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, stringValue);
    } catch (error) {
      console.error('Error setting item in localStorage:', error);
    }
  }
}

// Generic remove item function
export async function removeItem(key: string) {
  if (!isBrowser) return;
  
  const sessionId = getOrCreateSessionId();
  if (!sessionId) return;
  
  if (shouldUseSupabase()) {
    try {
      const { error } = await supabase
        .from('user_data')
        .delete()
        .eq('session_id', sessionId)
        .eq('key', key);
      
      if (error) {
        console.error('Error removing item from Supabase:', error);
      }
    } catch (error) {
      console.error('Error in removeItem from Supabase:', error);
    }
  } else {
    // Fallback to localStorage in development
    localStorage.removeItem(key);
  }
}

// Safe JSON parse helper
export function safeJsonParse(value: string | null, defaultValue: any = {}) {
  if (!value) return defaultValue;
  
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return defaultValue;
  }
} 