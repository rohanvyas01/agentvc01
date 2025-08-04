/*
  # Fix RLS Policies for Core Tables

  This migration adds missing RLS policies for profiles and pitch_decks tables
  that are causing the dashboard loading issues.

  1. Enable RLS on core tables if not already enabled
  2. Add missing RLS policies for profiles table
  3. Add missing RLS policies for pitch_decks table
  4. Ensure proper access control for authenticated users
*/

-- Enable RLS on core tables (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_decks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Users can read own pitch decks" ON pitch_decks;
DROP POLICY IF EXISTS "Users can insert own pitch decks" ON pitch_decks;
DROP POLICY IF EXISTS "Users can update own pitch decks" ON pitch_decks;

-- Create RLS policies for profiles table
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create RLS policies for pitch_decks table
CREATE POLICY "Users can read own pitch decks"
  ON pitch_decks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pitch decks"
  ON pitch_decks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pitch decks"
  ON pitch_decks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Also ensure the pitches table has proper RLS (if it exists and is different from pitch_decks)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pitches') THEN
    ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can read own pitches" ON pitches;
    DROP POLICY IF EXISTS "Users can insert own pitches" ON pitches;
    DROP POLICY IF EXISTS "Users can update own pitches" ON pitches;
    
    -- Check if pitches table has user_id column, if not use company_id relation
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pitches' AND column_name = 'user_id') THEN
      CREATE POLICY "Users can read own pitches"
        ON pitches
        FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert own pitches"
        ON pitches
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "Users can update own pitches"
        ON pitches
        FOR UPDATE
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pitches' AND column_name = 'company_id') THEN
      CREATE POLICY "Users can read own pitches"
        ON pitches
        FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM companies 
            WHERE companies.id = pitches.company_id 
            AND companies.user_id = auth.uid()
          )
        );

      CREATE POLICY "Users can insert own pitches"
        ON pitches
        FOR INSERT
        TO authenticated
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM companies 
            WHERE companies.id = pitches.company_id 
            AND companies.user_id = auth.uid()
          )
        );

      CREATE POLICY "Users can update own pitches"
        ON pitches
        FOR UPDATE
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM companies 
            WHERE companies.id = pitches.company_id 
            AND companies.user_id = auth.uid()
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM companies 
            WHERE companies.id = pitches.company_id 
            AND companies.user_id = auth.uid()
          )
        );
    END IF;
  END IF;
END $$;

-- Add any missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_pitch_decks_user_created ON pitch_decks(user_id, created_at DESC);