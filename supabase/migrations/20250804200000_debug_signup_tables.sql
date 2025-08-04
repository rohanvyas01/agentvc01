/*
  # Debug Signup Tables

  This migration checks and ensures the signup flow tables are properly configured.
*/

-- Check if profiles table exists and has correct structure
DO $$
BEGIN
  -- Ensure profiles table exists with correct primary key
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    CREATE TABLE profiles (
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
  END IF;

  -- Ensure companies table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') THEN
    CREATE TABLE companies (
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
  END IF;

  -- Ensure pitch_decks table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pitch_decks') THEN
    CREATE TABLE pitch_decks (
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
  END IF;

  -- Ensure sessions table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions') THEN
    CREATE TABLE sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      session_name text NOT NULL,
      session_type text DEFAULT 'practice' CHECK (session_type IN ('practice', 'real')),
      status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;

  -- Ensure conversation_transcripts table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_transcripts') THEN
    CREATE TABLE conversation_transcripts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      speaker text CHECK (speaker IN ('founder', 'investor', 'ai')) NOT NULL,
      message text NOT NULL,
      timestamp timestamptz DEFAULT now(),
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_transcripts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create RLS policies for profiles (using id since it references auth.users(id))
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Drop and recreate company policies
DROP POLICY IF EXISTS "Users can read own companies" ON companies;
DROP POLICY IF EXISTS "Users can insert own companies" ON companies;
DROP POLICY IF EXISTS "Users can update own companies" ON companies;

CREATE POLICY "Users can read own companies"
  ON companies FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own companies"
  ON companies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Drop and recreate pitch_decks policies
DROP POLICY IF EXISTS "Users can read own pitch decks" ON pitch_decks;
DROP POLICY IF EXISTS "Users can insert own pitch decks" ON pitch_decks;
DROP POLICY IF EXISTS "Users can update own pitch decks" ON pitch_decks;
DROP POLICY IF EXISTS "Users can delete own pitch decks" ON pitch_decks;

CREATE POLICY "Users can read own pitch decks"
  ON pitch_decks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pitch decks"
  ON pitch_decks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pitch decks"
  ON pitch_decks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pitch decks"
  ON pitch_decks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Drop and recreate sessions policies
DROP POLICY IF EXISTS "Users can read own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON sessions;

CREATE POLICY "Users can read own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Drop and recreate conversation_transcripts policies
DROP POLICY IF EXISTS "Users can read own transcripts" ON conversation_transcripts;
DROP POLICY IF EXISTS "Users can insert own transcripts" ON conversation_transcripts;

CREATE POLICY "Users can read own transcripts"
  ON conversation_transcripts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = conversation_transcripts.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own transcripts"
  ON conversation_transcripts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = conversation_transcripts.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_pitch_decks_user_id ON pitch_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_pitch_decks_company_id ON pitch_decks(company_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_transcripts_session_id ON conversation_transcripts(session_id);

-- Add comments for documentation
COMMENT ON TABLE profiles IS 'User profile information';
COMMENT ON TABLE companies IS 'Company information for users';
COMMENT ON TABLE pitch_decks IS 'Pitch deck files and metadata';
COMMENT ON TABLE sessions IS 'User conversation sessions';
COMMENT ON TABLE conversation_transcripts IS 'Transcripts of founder responses during conversations';