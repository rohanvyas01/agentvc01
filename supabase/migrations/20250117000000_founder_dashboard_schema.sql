/*
  # Founder Dashboard Enhanced Schema

  1. New Tables
    - `sessions` - AI conversation sessions with Tavus
    - `conversation_transcripts` - Real-time transcription data
    - `conversation_analysis` - Gemini AI analysis results
    - `session_reports` - Comprehensive session reports

  2. Enhanced Tables
    - Update `profiles` table to match current requirements
    - Update `pitch_decks` table structure
    - Add `companies` table for company information

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to access their own data
    - Implement proper data isolation

  4. Performance
    - Add indexes for optimal query performance
    - Optimize for dashboard loading and real-time updates

  Requirements: 10, 11, 12, 13, 14, 15
*/

-- Create companies table for better data organization
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  industry text NOT NULL,
  stage text NOT NULL,
  one_liner text NOT NULL,
  website text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Update profiles table structure to match current needs
DO $$
BEGIN
  -- Add missing columns to profiles if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Update pitch_decks table to match current structure
DO $$
BEGIN
  -- Rename columns if they exist with old names
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pitch_decks' AND column_name = 'file_name'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pitch_decks' AND column_name = 'deck_name'
  ) THEN
    ALTER TABLE pitch_decks RENAME COLUMN file_name TO deck_name;
  END IF;

  -- Add missing columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pitch_decks' AND column_name = 'file_type'
  ) THEN
    ALTER TABLE pitch_decks ADD COLUMN file_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pitch_decks' AND column_name = 'processing_status'
  ) THEN
    ALTER TABLE pitch_decks ADD COLUMN processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'processed', 'failed'));
  END IF;
END $$;

-- Create sessions table for AI conversations
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  pitch_deck_id uuid REFERENCES pitch_decks(id) ON DELETE SET NULL,
  tavus_conversation_id text,
  tavus_persona_id text NOT NULL,
  status text CHECK (status IN ('created', 'active', 'completed', 'failed')) DEFAULT 'created',
  duration_minutes integer,
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz
);

-- Create conversation transcripts table
CREATE TABLE IF NOT EXISTS conversation_transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  speaker text CHECK (speaker IN ('founder', 'investor')) NOT NULL,
  content text NOT NULL,
  timestamp_ms integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create conversation analysis table
CREATE TABLE IF NOT EXISTS conversation_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  gemini_analysis jsonb,
  key_strengths text[],
  improvement_areas text[],
  follow_up_questions text[],
  overall_score integer CHECK (overall_score >= 1 AND overall_score <= 10),
  created_at timestamptz DEFAULT now()
);

-- Create session reports table
CREATE TABLE IF NOT EXISTS session_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  report_data jsonb NOT NULL,
  email_sent boolean DEFAULT false,
  email_sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companies
CREATE POLICY "Users can read own companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for sessions
CREATE POLICY "Users can read own sessions"
  ON sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for conversation transcripts
CREATE POLICY "Users can read own transcripts"
  ON conversation_transcripts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = conversation_transcripts.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own transcripts"
  ON conversation_transcripts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = conversation_transcripts.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

-- Create RLS policies for conversation analysis
CREATE POLICY "Users can read own analysis"
  ON conversation_analysis
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = conversation_analysis.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own analysis"
  ON conversation_analysis
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = conversation_analysis.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

-- Create RLS policies for session reports
CREATE POLICY "Users can read own reports"
  ON session_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = session_reports.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own reports"
  ON session_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = session_reports.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

-- Create updated_at trigger for companies
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user_status ON sessions(user_id, status);

CREATE INDEX IF NOT EXISTS idx_transcripts_session_id ON conversation_transcripts(session_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_timestamp ON conversation_transcripts(session_id, timestamp_ms);

CREATE INDEX IF NOT EXISTS idx_analysis_session_id ON conversation_analysis(session_id);

CREATE INDEX IF NOT EXISTS idx_reports_session_id ON session_reports(session_id);

CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);

CREATE INDEX IF NOT EXISTS idx_pitch_decks_user_id ON pitch_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_pitch_decks_status ON pitch_decks(processing_status);

-- Add composite indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_sessions_user_completed ON sessions(user_id, completed_at DESC) WHERE status = 'completed';
CREATE INDEX IF NOT EXISTS idx_sessions_dashboard ON sessions(user_id, created_at DESC, status);