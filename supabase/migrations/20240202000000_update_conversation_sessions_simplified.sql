-- Update conversation_sessions table for simplified flow
ALTER TABLE conversation_sessions 
DROP CONSTRAINT conversation_sessions_status_check;

-- Update status enum for simplified flow
ALTER TABLE conversation_sessions 
ADD CONSTRAINT conversation_sessions_status_check 
CHECK (status IN ('introduction', 'pitch', 'analysis', 'completed'));

-- Add new columns for simplified flow (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversation_sessions' AND column_name = 'founder_introduction') THEN
    ALTER TABLE conversation_sessions ADD COLUMN founder_introduction TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversation_sessions' AND column_name = 'full_pitch_transcript') THEN
    ALTER TABLE conversation_sessions ADD COLUMN full_pitch_transcript TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversation_sessions' AND column_name = 'pitch_deck_url') THEN
    ALTER TABLE conversation_sessions ADD COLUMN pitch_deck_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversation_sessions' AND column_name = 'company_name') THEN
    ALTER TABLE conversation_sessions ADD COLUMN company_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversation_sessions' AND column_name = 'company_description') THEN
    ALTER TABLE conversation_sessions ADD COLUMN company_description TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversation_sessions' AND column_name = 'funding_stage') THEN
    ALTER TABLE conversation_sessions ADD COLUMN funding_stage TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversation_sessions' AND column_name = 'industry') THEN
    ALTER TABLE conversation_sessions ADD COLUMN industry TEXT;
  END IF;
END $$;

-- Remove current_question_index as we don't need structured questions anymore (only if it exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversation_sessions' AND column_name = 'current_question_index') THEN
    ALTER TABLE conversation_sessions DROP COLUMN current_question_index;
  END IF;
END $$;

-- Update responses column to store the three main parts
-- responses will now contain: { introduction: "...", pitch: "..." }
COMMENT ON COLUMN conversation_sessions.responses IS 'JSON object containing founder introduction and pitch responses';

-- Create conversation_transcripts table for storing complete conversation
CREATE TABLE IF NOT EXISTS conversation_transcripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES conversation_sessions(id) ON DELETE CASCADE NOT NULL,
  speaker TEXT CHECK (speaker IN ('ai', 'founder')) NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for transcripts
CREATE INDEX IF NOT EXISTS idx_conversation_transcripts_session_id ON conversation_transcripts(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_transcripts_timestamp ON conversation_transcripts(timestamp);

-- Enable RLS for transcripts
ALTER TABLE conversation_transcripts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for transcripts
CREATE POLICY "Users can view transcripts of their own sessions" ON conversation_transcripts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_sessions 
      WHERE conversation_sessions.id = conversation_transcripts.session_id 
      AND conversation_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert transcripts" ON conversation_transcripts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update transcripts" ON conversation_transcripts
  FOR UPDATE USING (true);