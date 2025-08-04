-- Create follow_up_questions table
CREATE TABLE IF NOT EXISTS follow_up_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  category TEXT CHECK (category IN ('business_model', 'market', 'financials', 'team', 'competition', 'growth', 'general')) NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) NOT NULL DEFAULT 'medium',
  is_selected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_follow_up_questions_session_id ON follow_up_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_questions_category ON follow_up_questions(category);
CREATE INDEX IF NOT EXISTS idx_follow_up_questions_selected ON follow_up_questions(is_selected);

-- Enable Row Level Security
ALTER TABLE follow_up_questions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own follow-up questions" ON follow_up_questions
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own follow-up questions" ON follow_up_questions
  FOR UPDATE USING (
    session_id IN (
      SELECT id FROM sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert follow-up questions" ON follow_up_questions
  FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT, UPDATE ON follow_up_questions TO authenticated;
GRANT INSERT ON follow_up_questions TO service_role;