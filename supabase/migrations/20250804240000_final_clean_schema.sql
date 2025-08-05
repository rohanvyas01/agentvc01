/*
  # Final Clean Schema

  This migration sets up the complete schema for the AgentVC application
  with all necessary tables, policies, and functions.
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  startup_name text,
  website text,
  linkedin_url text,
  industry text,
  fundraise_stage text,
  one_liner text,
  use_of_funds text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  industry text NOT NULL,
  stage text NOT NULL,
  funding_round text,
  funding_amount text,
  one_liner text NOT NULL,
  website text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Note: Using existing conversation_sessions table from earlier migration

-- Create pitch_decks table
CREATE TABLE IF NOT EXISTS pitch_decks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  deck_name text NOT NULL,
  file_type text,
  pitch_deck_storage_path text NOT NULL,
  file_size bigint NOT NULL,
  processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'processed', 'failed')),
  extracted_text text,
  created_at timestamptz DEFAULT now()
);

-- Create conversation_transcripts table
CREATE TABLE IF NOT EXISTS conversation_transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES conversation_sessions(id) ON DELETE CASCADE,
  speaker text CHECK (speaker IN ('founder', 'investor', 'ai')) NOT NULL,
  message text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
-- Note: conversation_sessions RLS already enabled in earlier migration
ALTER TABLE pitch_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_transcripts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create RLS policies for companies
DROP POLICY IF EXISTS "Users can read own companies" ON companies;
CREATE POLICY "Users can read own companies"
  ON companies FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own companies" ON companies;
CREATE POLICY "Users can insert own companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own companies" ON companies;
CREATE POLICY "Users can update own companies"
  ON companies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Note: Using existing conversation_sessions table with its own RLS policies

-- Create RLS policies for pitch_decks
DROP POLICY IF EXISTS "Users can read own pitch decks" ON pitch_decks;
CREATE POLICY "Users can read own pitch decks"
  ON pitch_decks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own pitch decks" ON pitch_decks;
CREATE POLICY "Users can insert own pitch decks"
  ON pitch_decks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own pitch decks" ON pitch_decks;
CREATE POLICY "Users can update own pitch decks"
  ON pitch_decks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own pitch decks" ON pitch_decks;
CREATE POLICY "Users can delete own pitch decks"
  ON pitch_decks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for conversation_transcripts
DROP POLICY IF EXISTS "Users can read own transcripts" ON conversation_transcripts;
CREATE POLICY "Users can read own transcripts"
  ON conversation_transcripts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_sessions 
      WHERE conversation_sessions.id = conversation_transcripts.session_id 
      AND conversation_sessions.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own transcripts" ON conversation_transcripts;
CREATE POLICY "Users can insert own transcripts"
  ON conversation_transcripts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_sessions 
      WHERE conversation_sessions.id = conversation_transcripts.session_id 
      AND conversation_sessions.user_id = auth.uid()
    )
  );

-- Create auth trigger function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Note: conversation_sessions already has update trigger from earlier migration

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
-- Note: conversation_sessions already has indexes from earlier migration
CREATE INDEX IF NOT EXISTS idx_pitch_decks_user_id ON pitch_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_pitch_decks_company_id ON pitch_decks(company_id);
CREATE INDEX IF NOT EXISTS idx_conversation_transcripts_session_id ON conversation_transcripts(session_id);

-- Setup storage bucket for pitch decks
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pitchdecks',
  'pitchdecks',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the pitchdecks bucket
DROP POLICY IF EXISTS "Users can upload their own pitch decks" ON storage.objects;
CREATE POLICY "Users can upload their own pitch decks"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pitchdecks' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can view their own pitch decks" ON storage.objects;
CREATE POLICY "Users can view their own pitch decks"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'pitchdecks' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can update their own pitch decks" ON storage.objects;
CREATE POLICY "Users can update their own pitch decks"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'pitchdecks' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete their own pitch decks" ON storage.objects;
CREATE POLICY "Users can delete their own pitch decks"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'pitchdecks' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Add comments for documentation
COMMENT ON TABLE profiles IS 'User profile information';
COMMENT ON TABLE companies IS 'Company information for users';
-- Note: conversation_sessions table already has comments from earlier migration
COMMENT ON TABLE pitch_decks IS 'Pitch deck files and metadata';
COMMENT ON TABLE conversation_transcripts IS 'Transcripts of founder responses during conversations';
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile when a new user signs up';