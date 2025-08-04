/*
  # Create Conversation Transcripts Table

  This migration creates the conversation_transcripts table for storing
  the founder's responses during the conversation.
*/

-- Create conversation_transcripts table
CREATE TABLE IF NOT EXISTS conversation_transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  speaker text CHECK (speaker IN ('founder', 'investor', 'ai')) NOT NULL,
  message text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE conversation_transcripts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Create index
CREATE INDEX IF NOT EXISTS idx_conversation_transcripts_session_id ON conversation_transcripts(session_id);

-- Add comment
COMMENT ON TABLE conversation_transcripts IS 'Transcripts of founder responses during conversations';