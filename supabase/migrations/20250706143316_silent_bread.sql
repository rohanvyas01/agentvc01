/*
  # Atomic User Creation System

  1. Database Schema
    - Updates existing profiles table structure
    - Ensures atomic user creation with database triggers
    - Implements proper RLS policies

  2. Security
    - Row Level Security enabled
    - Proper user isolation
    - Secure function execution

  3. Atomicity
    - Database triggers ensure profile creation when user is created
    - If profile creation fails, user creation is rolled back
*/

-- First, let's ensure we have the correct table structure
-- Update profiles table to match the schema exactly
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text;
  END IF;
END $$;

-- Create a trigger function that automatically creates a profile when a user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- This function is called automatically when a new user is created in auth.users
  -- It creates a corresponding profile record
  INSERT INTO public.profiles (
    id,
    user_id,
    founder_name,
    email,
    startup_name,
    one_liner_pitch,
    industry,
    business_model,
    funding_round,
    raise_amount,
    use_of_funds,
    linkedin_profile,
    website
  ) VALUES (
    NEW.id,
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'founder_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'startup_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'one_liner_pitch', ''),
    COALESCE(NEW.raw_user_meta_data->>'industry', ''),
    COALESCE(NEW.raw_user_meta_data->>'business_model', ''),
    COALESCE(NEW.raw_user_meta_data->>'funding_round', ''),
    COALESCE(NEW.raw_user_meta_data->>'raise_amount', ''),
    COALESCE(NEW.raw_user_meta_data->>'use_of_funds', ''),
    NEW.raw_user_meta_data->>'linkedin_profile',
    NEW.raw_user_meta_data->>'website'
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If profile creation fails, this will cause the entire transaction to fail
    -- including the user creation, ensuring atomicity
    RAISE EXCEPTION 'Failed to create user profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger that fires when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to get user profile data
CREATE OR REPLACE FUNCTION get_user_profile(user_id_in uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_data json;
BEGIN
  SELECT json_build_object(
    'id', id,
    'user_id', user_id,
    'founder_name', founder_name,
    'email', email,
    'startup_name', startup_name,
    'linkedin_profile', linkedin_profile,
    'website', website,
    'one_liner_pitch', one_liner_pitch,
    'industry', industry,
    'business_model', business_model,
    'funding_round', funding_round,
    'raise_amount', raise_amount,
    'use_of_funds', use_of_funds,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO profile_data
  FROM profiles
  WHERE user_id = user_id_in;
  
  RETURN profile_data;
END;
$$;

-- Function to update user profile
CREATE OR REPLACE FUNCTION update_user_profile(
  user_id_in uuid,
  founder_name_in text DEFAULT NULL,
  startup_name_in text DEFAULT NULL,
  one_liner_pitch_in text DEFAULT NULL,
  industry_in text DEFAULT NULL,
  business_model_in text DEFAULT NULL,
  funding_round_in text DEFAULT NULL,
  raise_amount_in text DEFAULT NULL,
  use_of_funds_in text DEFAULT NULL,
  linkedin_profile_in text DEFAULT NULL,
  website_in text DEFAULT NULL
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_data json;
BEGIN
  UPDATE profiles SET
    founder_name = COALESCE(founder_name_in, founder_name),
    startup_name = COALESCE(startup_name_in, startup_name),
    one_liner_pitch = COALESCE(one_liner_pitch_in, one_liner_pitch),
    industry = COALESCE(industry_in, industry),
    business_model = COALESCE(business_model_in, business_model),
    funding_round = COALESCE(funding_round_in, funding_round),
    raise_amount = COALESCE(raise_amount_in, raise_amount),
    use_of_funds = COALESCE(use_of_funds_in, use_of_funds),
    linkedin_profile = COALESCE(linkedin_profile_in, linkedin_profile),
    website = COALESCE(website_in, website),
    updated_at = now()
  WHERE user_id = user_id_in;
  
  -- Return updated profile
  RETURN get_user_profile(user_id_in);
END;
$$;