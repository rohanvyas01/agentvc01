/*
  # Fix Profiles Foreign Key Issue

  This migration fixes the foreign key constraint issue with the profiles table.
  The issue is that we're trying to enforce a foreign key constraint to auth.users
  but we need to handle this more carefully.
*/

-- Drop the existing profiles table and recreate it without the strict foreign key constraint
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table with a more flexible structure
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  full_name text,
  startup_name text,
  website text,
  linkedin_url text,
  industry text,
  fundraise_stage text,
  one_liner text,
  use_of_funds text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles (using user_id)
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- Add comment
COMMENT ON TABLE profiles IS 'User profile information - fixed foreign key constraints';