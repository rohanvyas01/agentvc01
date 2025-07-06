/*
  # Atomic User Creation System for AgentVC

  1. New Tables
    - `profiles` table with user and company information
    - `pitch_decks` table for pitch deck metadata
    - Both tables linked to auth.users.id with CASCADE delete

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - SECURITY DEFINER functions for safe operations

  3. Atomic User Creation
    - Database trigger automatically creates profile when auth user is created
    - Uses metadata from signup to populate profile
    - If profile creation fails, entire transaction rolls back
    - Zero partial states possible

  4. RPC Functions
    - `create_user_profile` - Manual profile creation
    - `update_user_profile` - Profile updates
    - All functions are atomic and secure
*/

-- Drop existing objects to ensure clean migration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS create_user_profile(uuid, text, text, text, text, text, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS update_user_profile(uuid, text, text, text, text, text, text, text, text, text, text);

-- Drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can read own pitch decks" ON pitch_decks;
  DROP POLICY IF EXISTS "Users can insert own pitch decks" ON pitch_decks;
  DROP POLICY IF EXISTS "Users can delete own pitch decks" ON pitch_decks;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  founder_name text NOT NULL,
  linkedin_profile text,
  startup_name text NOT NULL,
  website text,
  one_liner_pitch text NOT NULL,
  industry text NOT NULL,
  business_model text NOT NULL,
  funding_round text NOT NULL,
  raise_amount text NOT NULL,
  use_of_funds text NOT NULL,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pitch_decks table
CREATE TABLE IF NOT EXISTS pitch_decks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  file_size bigint NOT NULL,
  extracted_text text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_decks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for pitch_decks
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

CREATE POLICY "Users can delete own pitch decks"
  ON pitch_decks
  FOR DELETE
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

-- Create trigger for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- CRITICAL: Atomic user creation trigger function
-- This ensures profile creation happens atomically with user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Automatically create profile when new user is created
  -- Uses metadata passed during signup
  
  IF NEW.raw_user_meta_data IS NOT NULL THEN
    INSERT INTO public.profiles (
      user_id,
      founder_name,
      startup_name,
      one_liner_pitch,
      industry,
      business_model,
      funding_round,
      raise_amount,
      use_of_funds,
      linkedin_profile,
      website,
      email
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'founder_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'startup_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'one_liner_pitch', ''),
      COALESCE(NEW.raw_user_meta_data->>'industry', ''),
      COALESCE(NEW.raw_user_meta_data->>'business_model', ''),
      COALESCE(NEW.raw_user_meta_data->>'funding_round', ''),
      COALESCE(NEW.raw_user_meta_data->>'raise_amount', ''),
      COALESCE(NEW.raw_user_meta_data->>'use_of_funds', ''),
      NEW.raw_user_meta_data->>'linkedin_profile',
      NEW.raw_user_meta_data->>'website',
      NEW.email
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If profile creation fails, the entire user creation transaction fails
    RAISE EXCEPTION 'Failed to create user profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the atomic trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RPC function for manual profile creation (if needed)
CREATE OR REPLACE FUNCTION create_user_profile(
  founder_name_in text,
  startup_name_in text,
  one_liner_pitch_in text,
  industry_in text,
  business_model_in text,
  funding_round_in text,
  raise_amount_in text,
  use_of_funds_in text,
  linkedin_profile_in text DEFAULT NULL,
  website_in text DEFAULT NULL,
  email_in text DEFAULT NULL
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_data json;
  current_user_id uuid;
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Insert profile
  INSERT INTO profiles (
    user_id,
    founder_name,
    startup_name,
    one_liner_pitch,
    industry,
    business_model,
    funding_round,
    raise_amount,
    use_of_funds,
    linkedin_profile,
    website,
    email
  ) VALUES (
    current_user_id,
    founder_name_in,
    startup_name_in,
    one_liner_pitch_in,
    industry_in,
    business_model_in,
    funding_round_in,
    raise_amount_in,
    use_of_funds_in,
    linkedin_profile_in,
    website_in,
    COALESCE(email_in, auth.email())
  );
  
  -- Return success
  SELECT json_build_object(
    'success', true,
    'user_id', current_user_id,
    'founder_name', founder_name_in,
    'startup_name', startup_name_in
  ) INTO profile_data;
  
  RETURN profile_data;
END;
$$;

-- RPC function for updating profiles
CREATE OR REPLACE FUNCTION update_user_profile(
  founder_name_in text,
  startup_name_in text,
  one_liner_pitch_in text,
  industry_in text,
  business_model_in text,
  funding_round_in text,
  raise_amount_in text,
  use_of_funds_in text,
  linkedin_profile_in text DEFAULT NULL,
  website_in text DEFAULT NULL
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_data json;
  current_user_id uuid;
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Update profile
  UPDATE profiles SET
    founder_name = founder_name_in,
    startup_name = startup_name_in,
    one_liner_pitch = one_liner_pitch_in,
    industry = industry_in,
    business_model = business_model_in,
    funding_round = funding_round_in,
    raise_amount = raise_amount_in,
    use_of_funds = use_of_funds_in,
    linkedin_profile = linkedin_profile_in,
    website = website_in,
    updated_at = now()
  WHERE user_id = current_user_id;
  
  -- Return success
  SELECT json_build_object(
    'success', true,
    'user_id', current_user_id,
    'founder_name', founder_name_in,
    'startup_name', startup_name_in
  ) INTO profile_data;
  
  RETURN profile_data;
END;
$$;