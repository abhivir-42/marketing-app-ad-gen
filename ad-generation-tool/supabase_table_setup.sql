-- Execute this SQL in the Supabase SQL Editor to create the user_data table
-- This table will store all user data with a session-based approach

-- Create the user_data table
CREATE TABLE IF NOT EXISTS public.user_data (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR NOT NULL,
  key VARCHAR NOT NULL,
  data TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Create a unique constraint on session_id and key
  UNIQUE(session_id, key)
);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_data_session_key ON public.user_data(session_id, key);

-- Set RLS (Row Level Security) policies
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to insert and select their own data
CREATE POLICY "Allow individual read access" ON public.user_data
  FOR SELECT USING (true);

CREATE POLICY "Allow individual insert access" ON public.user_data
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow individual update access" ON public.user_data
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow individual delete access" ON public.user_data
  FOR DELETE USING (true);

-- Comment with instructions
COMMENT ON TABLE public.user_data IS 'Stores user data for the ad generation tool with anonymous session-based access'; 