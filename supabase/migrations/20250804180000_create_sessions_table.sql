/*
  # Create Sessions Table

  This migration creates the sessions table that the application expects.
*/

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  pitch_deck_id uuid REFERENCES pitch_decks(id) ON DELETE SET NULL,
  tavus_conversation_id text,
  tavus_persona_id text,
  status text CHECK (status IN ('created', 'active', 'completed', 'failed')) DEFAULT 'created',
  duration_minutes integer,
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz
);

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sessions
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

-- Create index
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- Add comment
COMMENT ON TABLE sessions IS 'AI conversation sessions';