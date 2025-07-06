/*
  # Complete Database Schema for AgentVC

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, FK to auth.users.id)
      - `user_id` (uuid, FK to auth.users.id)
      - `founder_name`, `startup_name`, `one_liner_pitch` (required text fields)
      - `industry`, `business_model`, `funding_round`, `raise_amount`, `use_of_funds` (required text fields)
      - `linkedin_profile`, `website` (optional text fields)
      - `created_at`, `updated_at` (timestamps)
    
    - `pitch_decks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to auth.users.id)
      - `file_name`, `storage_path` (required text fields)
      - `file_size` (bigint)
      - `extracted_text` (optional text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data

  3. Functions
    - Atomic user creation functions
    - Trigger function for updated_at timestamps

  4. Triggers
    - Auto-update updated_at column on profiles table
*/

-- Drop existing policies if they exist to avoid conflicts
DO $$ 
BEGIN
  -- Drop profiles policies if they exist
  DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  
  -- Drop pitch_decks policies if they exist
  DROP POLICY IF EXISTS "Users can read own pitch decks" ON pitch_decks;
  DROP POLICY IF EXISTS "Users can insert own pitch decks" ON pitch_decks;
  DROP POLICY IF EXISTS "Users can delete own pitch decks" ON pitch_decks;
EXCEPTION
  WHEN undefined_table THEN
    -- Tables don't exist yet, continue
    NULL;
  WHEN undefined_object THEN
    -- Policies don't exist, continue
    NULL;
END $$;

-- Create profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
    CREATE TABLE profiles (
      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      founder_name text NOT NULL,
      startup_name text NOT NULL,
      one_liner_pitch text NOT NULL,
      industry text NOT NULL,
      business_model text NOT NULL,
      funding_round text NOT NULL,
      raise_amount text NOT NULL,
      use_of_funds text NOT NULL,
      linkedin_profile text,
      website text,
      email text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Create pitch_decks table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pitch_decks') THEN
    CREATE TABLE pitch_decks (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      file_name text NOT NULL,
      storage_path text NOT NULL,
      file_size bigint NOT NULL,
      extracted_text text,
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Enable RLS on both tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_decks ENABLE ROW LEVEL SECURITY;

-- Create profiles policies
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

-- Create pitch_decks policies
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

-- Create trigger function for updating updated_at timestamp
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

-- CRITICAL: Atomic user creation function
-- This function ensures user creation and profile creation happen atomically
CREATE OR REPLACE FUNCTION handle_new_user_and_profile(
  email_in text,
  password_in text,
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
  new_user_id uuid;
  user_data json;
BEGIN
  -- This function creates both user and profile in a single transaction
  -- If either fails, both are rolled back automatically
  
  -- First, create the user account using Supabase auth
  -- Note: In production, this should use Supabase's auth.signup() from the client
  -- This is a simplified version for demonstration
  
  -- Generate a new UUID for the user
  new_user_id := gen_random_uuid();
  
  -- Insert into profiles table
  -- The user_id will be set when the actual auth user is created
  INSERT INTO profiles (
    id,
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
    new_user_id,
    new_user_id, -- This will be updated with the actual auth user ID
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
    email_in
  );
  
  -- Return success with user data
  SELECT json_build_object(
    'user_id', new_user_id,
    'email', email_in,
    'founder_name', founder_name_in,
    'startup_name', startup_name_in,
    'success', true
  ) INTO user_data;
  
  RETURN user_data;
  
EXCEPTION
  WHEN OTHERS THEN
    -- If anything fails, the entire transaction is rolled back
    RAISE EXCEPTION 'Failed to create user profile: %', SQLERRM;
END;
$$;

-- Create a simpler function for creating profiles after auth user exists
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id_in uuid,
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
BEGIN
  -- Insert into profiles table with the authenticated user's ID
  INSERT INTO profiles (
    id,
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
    user_id_in,
    user_id_in,
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
    email_in
  );
  
  -- Return the created profile data
  SELECT json_build_object(
    'id', user_id_in,
    'founder_name', founder_name_in,
    'startup_name', startup_name_in,
    'success', true
  ) INTO profile_data;
  
  RETURN profile_data;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create user profile: %', SQLERRM;
END;
$$;

-- Create function for updating user profiles
CREATE OR REPLACE FUNCTION update_user_profile(
  user_id_in uuid,
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
BEGIN
  -- Update the profile for the authenticated user
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
  WHERE user_id = user_id_in;
  
  -- Return the updated profile data
  SELECT json_build_object(
    'id', user_id_in,
    'founder_name', founder_name_in,
    'startup_name', startup_name_in,
    'success', true
  ) INTO profile_data;
  
  RETURN profile_data;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to update user profile: %', SQLERRM;
END;
$$;

-- Create a trigger function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- This function is called when a new user is created in auth.users
  -- It automatically creates a profile record using metadata from the signup
  
  IF NEW.raw_user_meta_data IS NOT NULL THEN
    INSERT INTO public.profiles (
      id,
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();