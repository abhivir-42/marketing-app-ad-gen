import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dljrfjawvzmcosdvdxeb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsanJmamF3dnptY29zZHZkeGViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1NDQ3MjksImV4cCI6MjA1NzEyMDcyOX0.XMC5ndAOEN0atq8m_wiFhYh8Ng2ZvrYakJa_kVJvxG4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Session management for anonymous users
export const getOrCreateSessionId = () => {
  // Only run on client side
  if (typeof window === 'undefined') return null;
  
  let sessionId = localStorage.getItem('supabase_session_id');
  
  if (!sessionId) {
    // Generate a new random session ID if none exists
    sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('supabase_session_id', sessionId);
  }
  
  return sessionId;
}; 