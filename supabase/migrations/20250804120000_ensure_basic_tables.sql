/*
  # Ensure Basic Tables Exist for Signup Flow

  This migration ensures all the basic tables needed for the signup flow exist
  with the correct structure, regardless of previous migration state.
*/

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Add missing columns to existing profiles table if they don't exist
DO $$
BEGIN
  -- Add user_id column if it doesn't exist (for compatibility)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    -- Copy id to user_id for existing records
    UPDATE profiles SET user_id = id WHERE user_id IS NULL;
    -- Make user_id NOT NULL and UNIQUE
    ALTER TABLE profiles ALTER COLUMN user_id SET NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_unique ON profiles(user_id);
  END IF;
  
  -- Add other missing columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN full_name text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'startup_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN startup_name text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'linkedin_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN linkedin_url text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'fundraise_stage'
  ) THEN
    ALTER TABLE profiles ADD COLUMN fundraise_stage text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'one_liner'
  ) THEN
    ALTER TABLE profiles ADD COLUMN one_liner text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'use_of_funds'
  ) THEN
    ALTER TABLE profiles ADD COLUMN use_of_funds text;
  END IF;
END $$;

-- Create companies table if it doesn't exist
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

-- Create pitch_decks table if it doesn't exist
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

-- Add missing columns to existing pitch_decks table if they don't exist
DO $$
BEGIN
  -- Add deck_name column if it doesn't exist (rename from file_name if needed)
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
    WHERE table_name = 'pitch_decks' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE pitch_decks ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pitch_decks' AND column_name = 'file_type'
  ) THEN
    ALTER TABLE pitch_decks ADD COLUMN file_type text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pitch_decks' AND column_name = 'pitch_deck_storage_path'
  ) THEN
    -- Rename storage_path to pitch_deck_storage_path if needed
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'pitch_decks' AND column_name = 'storage_path'
    ) THEN
      ALTER TABLE pitch_decks RENAME COLUMN storage_path TO pitch_deck_storage_path;
    ELSE
      ALTER TABLE pitch_decks ADD COLUMN pitch_deck_storage_path text;
    END IF;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pitch_decks' AND column_name = 'processing_status'
  ) THEN
    ALTER TABLE pitch_decks ADD COLUMN processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'processed', 'failed'));
  END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_decks ENABLE ROW LEVEL SECURITY;

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

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

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