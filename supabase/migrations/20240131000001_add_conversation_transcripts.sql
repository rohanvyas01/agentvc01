-- Create conversation_transcripts table for storing individual messages
CREATE TABLE conversation_transcripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES conversation_sessions(id) ON DELETE CASCADE NOT NULL,
  speaker TEXT CHECK (speaker IN ('ai_investor', 'founder')) NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_conversation_transcripts_session_id ON conversation_transcripts(session_id);
CREATE INDEX idx_conversation_transcripts_timestamp ON conversation_transcripts(timestamp);

-- Enable RLS
ALTER TABLE conversation_transcripts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view transcripts for their own sessions" ON conversation_transcripts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_sessions 
      WHERE conversation_sessions.id = conversation_transcripts.session_id 
      AND conversation_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert transcripts for their own sessions" ON conversation_transcripts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_sessions 
      WHERE conversation_sessions.id = conversation_transcripts.session_id 
      AND conversation_sessions.user_id = auth.uid()
    )
  );

-- Add new columns to conversation_sessions for your simplified flow
ALTER TABLE conversation_sessions 
ADD COLUMN founder_introduction TEXT,
ADD COLUMN full_pitch_transcript TEXT,
ADD COLUMN company_name TEXT,
ADD COLUMN company_description TEXT,
ADD COLUMN funding_stage TEXT,
ADD COLUMN industry TEXT,
ADD COLUMN pitch_deck_url TEXT;

-- Update status enum to match your flow
ALTER TABLE conversation_sessions 
DROP CONSTRAINT IF EXISTS conversation_sessions_status_check;

ALTER TABLE conversation_sessions 
ADD CONSTRAINT conversation_sessions_status_check 
CHECK (status IN ('intro', 'founder_intro', 'pitch', 'analysis', 'completed'));