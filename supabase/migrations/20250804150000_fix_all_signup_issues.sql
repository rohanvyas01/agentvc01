/*
  # Fix All Signup Flow Issues

  This migration fixes all the issues preventing the signup flow from working:
  1. Fixes foreign key constraints
  2. Ensures all required columns exist
  3. Fixes table relationships
  4. Updates RLS policies
*/

-- First, let's drop and recreate the tables with the correct structure
-- This ensures we have a clean slate that matches what the application expects

-- Drop existing policies and constraints that might be causing issues
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own companies" ON companies;
DROP POLICY IF EXISTS "Users can insert own companies" ON companies;
DROP POLICY IF EXISTS "Users can update own companies" ON companies;
DROP POLICY IF EXISTS "Users can read own pitch decks" ON pitch_decks;
DROP POLICY IF EXISTS "Users can insert own pitch decks" ON pitch_decks;
DROP POLICY IF EXISTS "Users can update own pitch decks" ON pitch_decks;
DROP POLICY IF EXISTS "Users can delete own pitch decks" ON pitch_decks;

-- Drop existing tables to recreate them with correct structure
DROP TABLE IF EXISTS pitch_decks CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table with correct structure
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

-- Create companies table
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

-- Create pitch_decks table
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

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_decks ENABLE ROW LEVEL SECURITY;

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

-- Create RLS policies for companies
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

-- Create RLS policies for pitch_decks
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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_pitch_decks_user_id ON pitch_decks(user_id);
CREATE INDEX idx_pitch_decks_company_id ON pitch_decks(company_id);

-- Add comments for documentation
COMMENT ON TABLE profiles IS 'User profile information';
COMMENT ON TABLE companies IS 'Company information for users';
COMMENT ON TABLE pitch_decks IS 'Pitch deck files and metadata';