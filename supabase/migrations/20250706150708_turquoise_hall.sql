/*
  # Secure AgentVC Backend with Atomic User Creation

  1. Database Schema
    - `profiles` table with complete user and company information
    - `pitch_decks` table for pitch deck metadata and content
    - Both tables with proper foreign key constraints and cascading deletes

  2. Atomic User Creation
    - `handle_new_user_and_profile` RPC function with SECURITY DEFINER
    - Creates auth user and profile in single atomic transaction
    - If either fails, entire transaction rolls back (zero partial states)

  3. Row Level Security (RLS)
    - Strict data isolation between users
    - Users can only access their own data
    - Comprehensive policies for all operations

  4. Secure File Storage
    - Private storage bucket with user-specific folders
    - Storage policies prevent cross-user access
    - Secure file upload/download workflows

  5. Helper Functions
    - Profile management functions
    - Data validation and sanitization
    - Error handling and logging
*/

-- ==========================================
-- 1. DATABASE SCHEMA
-- ==========================================

-- Create profiles table with complete user information
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  founder_name text NOT NULL CHECK (length(founder_name) >= 1),
  email text NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  linkedin_profile text CHECK (linkedin_profile IS NULL OR linkedin_profile ~* '^https?://'),
  website text CHECK (website IS NULL OR website ~* '^https?://'),
  
  -- Company Information
  startup_name text NOT NULL CHECK (length(startup_name) >= 1),
  one_liner_pitch text NOT NULL CHECK (length(one_liner_pitch) >= 10),
  industry text NOT NULL CHECK (length(industry) >= 1),
  business_model text NOT NULL CHECK (length(business_model) >= 1),
  
  -- Funding Information
  funding_round text NOT NULL CHECK (length(funding_round) >= 1),
  raise_amount text NOT NULL CHECK (length(raise_amount) >= 1),
  use_of_funds text NOT NULL CHECK (length(use_of_funds) >= 10),
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pitch_decks table for file metadata and content
CREATE TABLE IF NOT EXISTS pitch_decks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- File Information
  file_name text NOT NULL CHECK (length(file_name) >= 1),
  storage_path text NOT NULL UNIQUE CHECK (length(storage_path) >= 1),
  file_size bigint NOT NULL CHECK (file_size > 0 AND file_size <= 10485760), -- 10MB limit
  mime_type text NOT NULL DEFAULT 'application/pdf' CHECK (mime_type = 'application/pdf'),
  
  -- Content Analysis
  extracted_text text,
  page_count integer CHECK (page_count IS NULL OR page_count > 0),
  word_count integer CHECK (word_count IS NULL OR word_count >= 0),
  
  -- Processing Status
  processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processing_error text,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_pitch_decks_user_id ON pitch_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_pitch_decks_created_at ON pitch_decks(created_at DESC);

-- ==========================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_decks ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
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

-- Pitch Decks RLS Policies
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

CREATE POLICY "Users can delete own pitch decks"
  ON pitch_decks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==========================================
-- 3. STORAGE SECURITY
-- ==========================================

-- Create storage bucket for pitch decks (run this in Supabase Dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('pitch-decks', 'pitch-decks', false);

-- Storage policies for pitch-decks bucket
CREATE POLICY "Users can upload to own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'pitch-decks' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'pitch-decks' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'pitch-decks' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'pitch-decks' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ==========================================
-- 4. UTILITY FUNCTIONS
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pitch_decks_updated_at ON pitch_decks;
CREATE TRIGGER update_pitch_decks_updated_at
  BEFORE UPDATE ON pitch_decks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 5. ATOMIC USER CREATION FUNCTION
-- ==========================================

-- CRITICAL: Atomic user creation function with SECURITY DEFINER
-- This is the ONLY way to create users - ensures atomicity
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
SECURITY DEFINER -- CRITICAL: This allows the function to create auth users
SET search_path = public, auth
AS $$
DECLARE
  new_user_id uuid;
  encrypted_password text;
  user_data json;
  profile_data json;
BEGIN
  -- Input validation
  IF email_in IS NULL OR email_in = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;
  
  IF password_in IS NULL OR length(password_in) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters';
  END IF;
  
  IF founder_name_in IS NULL OR founder_name_in = '' THEN
    RAISE EXCEPTION 'Founder name is required';
  END IF;
  
  IF startup_name_in IS NULL OR startup_name_in = '' THEN
    RAISE EXCEPTION 'Startup name is required';
  END IF;
  
  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = email_in) THEN
    RAISE EXCEPTION 'User with this email already exists';
  END IF;
  
  -- Generate new user ID
  new_user_id := gen_random_uuid();
  
  -- Hash password (using Supabase's method)
  encrypted_password := crypt(password_in, gen_salt('bf'));
  
  -- STEP 1: Create auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    email_in,
    encrypted_password,
    now(), -- Auto-confirm email for demo
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );
  
  -- STEP 2: Create profile (this MUST succeed or entire transaction fails)
  INSERT INTO profiles (
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
    new_user_id,
    founder_name_in,
    email_in,
    startup_name_in,
    one_liner_pitch_in,
    industry_in,
    business_model_in,
    funding_round_in,
    raise_amount_in,
    use_of_funds_in,
    linkedin_profile_in,
    website_in
  );
  
  -- Return success response
  SELECT json_build_object(
    'success', true,
    'user_id', new_user_id,
    'email', email_in,
    'message', 'User and profile created successfully'
  ) INTO user_data;
  
  RETURN user_data;
  
EXCEPTION
  WHEN OTHERS THEN
    -- If ANYTHING fails, the entire transaction is rolled back
    -- This ensures we never have orphaned users or profiles
    RAISE EXCEPTION 'Failed to create user and profile atomically: %', SQLERRM;
END;
$$;

-- ==========================================
-- 6. PROFILE MANAGEMENT FUNCTIONS
-- ==========================================

-- Function to get user profile
CREATE OR REPLACE FUNCTION get_user_profile()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_data json;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
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
  WHERE user_id = current_user_id;
  
  IF profile_data IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;
  
  RETURN profile_data;
END;
$$;

-- Function to update user profile
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
  current_user_id uuid;
  updated_profile json;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Input validation
  IF founder_name_in IS NULL OR founder_name_in = '' THEN
    RAISE EXCEPTION 'Founder name is required';
  END IF;
  
  IF startup_name_in IS NULL OR startup_name_in = '' THEN
    RAISE EXCEPTION 'Startup name is required';
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
  
  -- Return updated profile
  RETURN get_user_profile();
END;
$$;

-- ==========================================
-- 7. PITCH DECK MANAGEMENT FUNCTIONS
-- ==========================================

-- Function to create pitch deck record
CREATE OR REPLACE FUNCTION create_pitch_deck_record(
  file_name_in text,
  storage_path_in text,
  file_size_in bigint,
  extracted_text_in text DEFAULT NULL,
  page_count_in integer DEFAULT NULL,
  word_count_in integer DEFAULT NULL
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  deck_data json;
  new_deck_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Input validation
  IF file_name_in IS NULL OR file_name_in = '' THEN
    RAISE EXCEPTION 'File name is required';
  END IF;
  
  IF storage_path_in IS NULL OR storage_path_in = '' THEN
    RAISE EXCEPTION 'Storage path is required';
  END IF;
  
  IF file_size_in IS NULL OR file_size_in <= 0 THEN
    RAISE EXCEPTION 'Valid file size is required';
  END IF;
  
  -- Insert pitch deck record
  INSERT INTO pitch_decks (
    user_id,
    file_name,
    storage_path,
    file_size,
    extracted_text,
    page_count,
    word_count,
    processing_status
  ) VALUES (
    current_user_id,
    file_name_in,
    storage_path_in,
    file_size_in,
    extracted_text_in,
    page_count_in,
    word_count_in,
    CASE WHEN extracted_text_in IS NOT NULL THEN 'completed' ELSE 'pending' END
  ) RETURNING id INTO new_deck_id;
  
  -- Return created deck data
  SELECT json_build_object(
    'id', id,
    'user_id', user_id,
    'file_name', file_name,
    'storage_path', storage_path,
    'file_size', file_size,
    'extracted_text', extracted_text,
    'page_count', page_count,
    'word_count', word_count,
    'processing_status', processing_status,
    'created_at', created_at
  ) INTO deck_data
  FROM pitch_decks
  WHERE id = new_deck_id;
  
  RETURN deck_data;
END;
$$;

-- Function to get user's pitch decks
CREATE OR REPLACE FUNCTION get_user_pitch_decks()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  decks_data json;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  SELECT json_agg(
    json_build_object(
      'id', id,
      'user_id', user_id,
      'file_name', file_name,
      'storage_path', storage_path,
      'file_size', file_size,
      'extracted_text', extracted_text,
      'page_count', page_count,
      'word_count', word_count,
      'processing_status', processing_status,
      'created_at', created_at,
      'updated_at', updated_at
    ) ORDER BY created_at DESC
  ) INTO decks_data
  FROM pitch_decks
  WHERE user_id = current_user_id;
  
  RETURN COALESCE(decks_data, '[]'::json);
END;
$$;

-- Function to delete pitch deck
CREATE OR REPLACE FUNCTION delete_pitch_deck(deck_id_in uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  deck_storage_path text;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Get storage path for cleanup
  SELECT storage_path INTO deck_storage_path
  FROM pitch_decks
  WHERE id = deck_id_in AND user_id = current_user_id;
  
  IF deck_storage_path IS NULL THEN
    RAISE EXCEPTION 'Pitch deck not found or access denied';
  END IF;
  
  -- Delete the record (RLS ensures user can only delete their own)
  DELETE FROM pitch_decks
  WHERE id = deck_id_in AND user_id = current_user_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Pitch deck deleted successfully',
    'storage_path', deck_storage_path
  );
END;
$$;

-- ==========================================
-- 8. DASHBOARD DATA FUNCTION
-- ==========================================

-- Function to get complete dashboard data
CREATE OR REPLACE FUNCTION get_dashboard_data()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  profile_data json;
  decks_data json;
  stats_data json;
  dashboard_data json;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Get profile data
  profile_data := get_user_profile();
  
  -- Get pitch decks data
  decks_data := get_user_pitch_decks();
  
  -- Calculate stats
  SELECT json_build_object(
    'total_decks', COUNT(*),
    'total_file_size', COALESCE(SUM(file_size), 0),
    'completed_processing', COUNT(*) FILTER (WHERE processing_status = 'completed'),
    'pending_processing', COUNT(*) FILTER (WHERE processing_status = 'pending'),
    'failed_processing', COUNT(*) FILTER (WHERE processing_status = 'failed'),
    'total_pages', COALESCE(SUM(page_count), 0),
    'total_words', COALESCE(SUM(word_count), 0)
  ) INTO stats_data
  FROM pitch_decks
  WHERE user_id = current_user_id;
  
  -- Combine all data
  SELECT json_build_object(
    'profile', profile_data,
    'pitch_decks', decks_data,
    'stats', stats_data,
    'timestamp', now()
  ) INTO dashboard_data;
  
  RETURN dashboard_data;
END;
$$;

-- ==========================================
-- 9. SECURITY AND AUDIT FUNCTIONS
-- ==========================================

-- Function to log security events (for monitoring)
CREATE OR REPLACE FUNCTION log_security_event(
  event_type text,
  event_details json DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- In production, you might want to create a security_logs table
  -- For now, we'll use the built-in logging
  RAISE LOG 'Security Event - Type: %, User: %, Details: %', 
    event_type, 
    COALESCE(current_user_id::text, 'anonymous'), 
    COALESCE(event_details::text, 'none');
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant storage permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;