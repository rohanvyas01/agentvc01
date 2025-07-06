/*
  # Atomic User Creation System

  1. New Tables
    - `profiles` table with user profile information
    - `pitch_decks` table for uploaded pitch decks
    
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
    
  3. Atomic Function
    - `handle_new_user_and_profile` RPC function for atomic user creation
    - Ensures user and profile are created together or not at all
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  founder_name text NOT NULL,
  email text NOT NULL,
  linkedin_profile text,
  startup_name text NOT NULL,
  website text,
  one_liner_pitch text NOT NULL,
  industry text NOT NULL,
  business_model text NOT NULL,
  funding_round text NOT NULL,
  raise_amount text NOT NULL,
  use_of_funds text NOT NULL,
  created_at timestamptz DEFAULT now()
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

-- Profiles policies
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

-- Pitch decks policies
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

-- CRITICAL: Atomic user creation function
CREATE OR REPLACE FUNCTION handle_new_user_and_profile(
  email_in text,
  password_in text,
  founder_name_in text,
  linkedin_profile_in text DEFAULT NULL,
  startup_name_in text,
  website_in text DEFAULT NULL,
  one_liner_pitch_in text,
  industry_in text,
  business_model_in text,
  funding_round_in text,
  raise_amount_in text,
  use_of_funds_in text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  encrypted_password text;
BEGIN
  -- Generate a new UUID for the user
  new_user_id := gen_random_uuid();
  
  -- Hash the password (Supabase handles this automatically in auth.users)
  encrypted_password := crypt(password_in, gen_salt('bf'));
  
  -- Insert into auth.users (this is the critical first step)
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    aud,
    role
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000'::uuid,
    email_in,
    encrypted_password,
    now(), -- Auto-confirm email for this demo
    now(),
    now(),
    'authenticated',
    'authenticated'
  );
  
  -- Insert into profiles table (this must succeed or the whole transaction fails)
  INSERT INTO profiles (
    id,
    founder_name,
    email,
    linkedin_profile,
    startup_name,
    website,
    one_liner_pitch,
    industry,
    business_model,
    funding_round,
    raise_amount,
    use_of_funds
  ) VALUES (
    new_user_id,
    founder_name_in,
    email_in,
    linkedin_profile_in,
    startup_name_in,
    website_in,
    one_liner_pitch_in,
    industry_in,
    business_model_in,
    funding_round_in,
    raise_amount_in,
    use_of_funds_in
  );
  
  -- Return the new user ID
  RETURN new_user_id;
  
EXCEPTION
  WHEN OTHERS THEN
    -- If anything fails, the entire transaction is rolled back
    RAISE EXCEPTION 'Failed to create user and profile: %', SQLERRM;
END;
$$;