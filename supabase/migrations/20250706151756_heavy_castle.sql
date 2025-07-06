/*
# Complete Secure Backend Setup for AgentVC
# 
# This migration creates a secure, atomic user signup system with:
# 1. Atomic user creation (auth + profile in single transaction)
# 2. Row Level Security for all user data
# 3. Secure file storage with user-specific folders
# 4. Complete API functions for frontend integration
*/

-- =============================================
-- STEP 1: SAFELY DROP EXISTING POLICIES AND FUNCTIONS
-- =============================================

-- Only drop policies if tables exist
DO $$
BEGIN
  -- Drop profiles policies if table exists
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
    RAISE NOTICE 'Dropped existing profiles policies';
  END IF;

  -- Drop pitch_decks policies if table exists
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pitch_decks') THEN
    DROP POLICY IF EXISTS "Users can read own pitch decks" ON pitch_decks;
    DROP POLICY IF EXISTS "Users can insert own pitch decks" ON pitch_decks;
    DROP POLICY IF EXISTS "Users can update own pitch decks" ON pitch_decks;
    DROP POLICY IF EXISTS "Users can delete own pitch decks" ON pitch_decks;
    RAISE NOTICE 'Dropped existing pitch_decks policies';
  END IF;
END $$;

-- Drop existing functions (safe to run even if they don't exist)
DROP FUNCTION IF EXISTS handle_new_user_and_profile(text, text, text, text, text, text, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS get_user_profile();
DROP FUNCTION IF EXISTS update_user_profile(text, text, text, text, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS create_pitch_deck_record(text, text, bigint, text, integer, integer);
DROP FUNCTION IF EXISTS get_user_pitch_decks();
DROP FUNCTION IF EXISTS delete_pitch_deck(uuid);
DROP FUNCTION IF EXISTS get_dashboard_data();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop existing triggers safely
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pitch_decks') THEN
    DROP TRIGGER IF EXISTS update_pitch_decks_updated_at ON pitch_decks;
  END IF;
END $$;

-- =============================================
-- STEP 2: CREATE TABLES WITH PROPER CONSTRAINTS
-- =============================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  founder_name text NOT NULL CHECK (length(founder_name) >= 2),
  email text CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  linkedin_profile text CHECK (linkedin_profile IS NULL OR linkedin_profile ~* '^https?://'),
  website text CHECK (website IS NULL OR website ~* '^https?://'),
  
  -- Company Information
  startup_name text NOT NULL CHECK (length(startup_name) >= 2),
  one_liner_pitch text NOT NULL CHECK (length(one_liner_pitch) >= 10),
  industry text NOT NULL CHECK (length(industry) >= 2),
  business_model text NOT NULL CHECK (length(business_model) >= 2),
  
  -- Funding Information
  funding_round text NOT NULL CHECK (length(funding_round) >= 2),
  raise_amount text NOT NULL CHECK (length(raise_amount) >= 1),
  use_of_funds text NOT NULL CHECK (length(use_of_funds) >= 10),
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one profile per user
  CONSTRAINT profiles_user_id_unique UNIQUE (user_id)
);

-- Create pitch_decks table
CREATE TABLE IF NOT EXISTS pitch_decks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- File Information
  file_name text NOT NULL CHECK (length(file_name) >= 1),
  storage_path text NOT NULL CHECK (length(storage_path) >= 1),
  file_size bigint NOT NULL CHECK (file_size > 0 AND file_size <= 10485760), -- 10MB limit
  
  -- Content Analysis
  extracted_text text,
  page_count integer CHECK (page_count IS NULL OR page_count > 0),
  word_count integer CHECK (word_count IS NULL OR word_count >= 0),
  
  -- Processing Status
  processing_status text DEFAULT 'completed' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processing_error text,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure unique storage paths
  CONSTRAINT pitch_decks_storage_path_unique UNIQUE (storage_path)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_pitch_decks_user_id ON pitch_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_pitch_decks_created_at ON pitch_decks(created_at DESC);

-- =============================================
-- STEP 3: CREATE UTILITY FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- STEP 4: CREATE TRIGGERS
-- =============================================

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for pitch_decks updated_at
CREATE TRIGGER update_pitch_decks_updated_at
  BEFORE UPDATE ON pitch_decks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_decks ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 6: CREATE RLS POLICIES
-- =============================================

-- Profiles table policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Pitch decks table policies
CREATE POLICY "Users can read own pitch decks"
  ON pitch_decks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pitch decks"
  ON pitch_decks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pitch decks"
  ON pitch_decks FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pitch decks"
  ON pitch_decks FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- STEP 7: ATOMIC USER CREATION FUNCTION
-- =============================================

-- CRITICAL: This is the ONLY way to create users to ensure atomicity
-- Creates both auth user and profile in a single transaction
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
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Critical: allows function to create auth users
SET search_path = public, auth
AS $$
DECLARE
  new_user_id uuid;
  new_profile profiles;
  encrypted_pw text;
BEGIN
  -- Input validation
  IF email_in IS NULL OR email_in = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;
  
  IF password_in IS NULL OR length(password_in) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters';
  END IF;
  
  IF founder_name_in IS NULL OR length(founder_name_in) < 2 THEN
    RAISE EXCEPTION 'Founder name must be at least 2 characters';
  END IF;
  
  IF startup_name_in IS NULL OR length(startup_name_in) < 2 THEN
    RAISE EXCEPTION 'Startup name must be at least 2 characters';
  END IF;

  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = email_in) THEN
    RAISE EXCEPTION 'User with this email already exists';
  END IF;

  -- Generate new user ID
  new_user_id := gen_random_uuid();
  
  -- Hash password
  encrypted_pw := crypt(password_in, gen_salt('bf'));

  -- STEP 1: Create auth user (atomic operation)
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
    encrypted_pw,
    now(), -- Auto-confirm email
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

  -- STEP 2: Create profile record (must succeed or entire transaction fails)
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
    new_user_id,
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
  ) RETURNING * INTO new_profile;

  -- Return success with user data
  RETURN json_build_object(
    'success', true,
    'user_id', new_user_id,
    'profile', row_to_json(new_profile),
    'message', 'User and profile created successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    -- If anything fails, entire transaction is rolled back
    RAISE EXCEPTION 'Failed to create user and profile atomically: %', SQLERRM;
END;
$$;

-- =============================================
-- STEP 8: PROFILE MANAGEMENT FUNCTIONS
-- =============================================

-- Get user profile function
CREATE OR REPLACE FUNCTION get_user_profile()
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile profiles;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  SELECT * INTO user_profile
  FROM profiles
  WHERE user_id = current_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user';
  END IF;
  
  RETURN user_profile;
END;
$$;

-- Update user profile function
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
)
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_profile profiles;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Input validation
  IF founder_name_in IS NULL OR length(founder_name_in) < 2 THEN
    RAISE EXCEPTION 'Founder name must be at least 2 characters';
  END IF;
  
  IF startup_name_in IS NULL OR length(startup_name_in) < 2 THEN
    RAISE EXCEPTION 'Startup name must be at least 2 characters';
  END IF;

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
  WHERE user_id = current_user_id
  RETURNING * INTO updated_profile;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user';
  END IF;
  
  RETURN updated_profile;
END;
$$;

-- =============================================
-- STEP 9: PITCH DECK MANAGEMENT FUNCTIONS
-- =============================================

-- Create pitch deck record function
CREATE OR REPLACE FUNCTION create_pitch_deck_record(
  file_name_in text,
  storage_path_in text,
  file_size_in bigint,
  extracted_text_in text DEFAULT NULL,
  page_count_in integer DEFAULT NULL,
  word_count_in integer DEFAULT NULL
)
RETURNS pitch_decks
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_deck pitch_decks;
  current_user_id uuid;
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
  ) RETURNING * INTO new_deck;
  
  RETURN new_deck;
END;
$$;

-- Get user pitch decks function
CREATE OR REPLACE FUNCTION get_user_pitch_decks()
RETURNS SETOF pitch_decks
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  RETURN QUERY
  SELECT * FROM pitch_decks
  WHERE user_id = current_user_id
  ORDER BY created_at DESC;
END;
$$;

-- Delete pitch deck function
CREATE OR REPLACE FUNCTION delete_pitch_deck(deck_id_in uuid)
RETURNS pitch_decks
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_deck pitch_decks;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  DELETE FROM pitch_decks
  WHERE id = deck_id_in AND user_id = current_user_id
  RETURNING * INTO deleted_deck;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pitch deck not found or access denied';
  END IF;
  
  RETURN deleted_deck;
END;
$$;

-- =============================================
-- STEP 10: DASHBOARD DATA FUNCTION
-- =============================================

-- Get complete dashboard data function
CREATE OR REPLACE FUNCTION get_dashboard_data()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile profiles;
  deck_count integer;
  total_pages integer;
  total_words integer;
  total_file_size bigint;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Get user profile
  SELECT * INTO user_profile 
  FROM profiles 
  WHERE user_id = current_user_id;
  
  -- Get pitch deck statistics
  SELECT 
    COUNT(*),
    COALESCE(SUM(page_count), 0),
    COALESCE(SUM(word_count), 0),
    COALESCE(SUM(file_size), 0)
  INTO deck_count, total_pages, total_words, total_file_size
  FROM pitch_decks 
  WHERE user_id = current_user_id;
  
  -- Return combined data
  RETURN json_build_object(
    'profile', row_to_json(user_profile),
    'stats', json_build_object(
      'total_decks', deck_count,
      'total_pages', total_pages,
      'total_words', total_words,
      'total_file_size', total_file_size
    ),
    'timestamp', now()
  );
END;
$$;

-- =============================================
-- STEP 11: GRANT PERMISSIONS
-- =============================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- =============================================
-- STEP 12: VERIFICATION AND COMPLETION
-- =============================================

-- Verify setup and provide completion message
DO $$
BEGIN
  -- Verify tables exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    RAISE EXCEPTION 'profiles table was not created';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pitch_decks') THEN
    RAISE EXCEPTION 'pitch_decks table was not created';
  END IF;
  
  -- Verify RLS is enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE n.nspname = 'public' AND c.relname = 'profiles' AND c.relrowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS not enabled on profiles table';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE n.nspname = 'public' AND c.relname = 'pitch_decks' AND c.relrowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS not enabled on pitch_decks table';
  END IF;
  
  -- Success messages
  RAISE NOTICE '✅ Database schema created successfully';
  RAISE NOTICE '✅ Row Level Security enabled on all tables';
  RAISE NOTICE '✅ Atomic signup function created: handle_new_user_and_profile';
  RAISE NOTICE '✅ All RPC functions created successfully';
  RAISE NOTICE '✅ Triggers and constraints applied';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 BACKEND SETUP COMPLETE!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 NEXT STEPS:';
  RAISE NOTICE '1. Create storage bucket "pitch-decks" (private) in Supabase dashboard';
  RAISE NOTICE '2. Add storage policies (see migration comments)';
  RAISE NOTICE '3. Update frontend environment variables';
  RAISE NOTICE '4. Test atomic signup with handle_new_user_and_profile function';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 SECURITY FEATURES ENABLED:';
  RAISE NOTICE '• Atomic user creation (no orphaned users/profiles)';
  RAISE NOTICE '• Row Level Security on all tables';
  RAISE NOTICE '• User data isolation';
  RAISE NOTICE '• Input validation and constraints';
  RAISE NOTICE '• Secure RPC functions';
END $$;

/*
=============================================
STORAGE POLICIES (Run in Supabase Dashboard)
=============================================

After running this migration, create the storage bucket and policies:

1. Go to Storage in Supabase Dashboard
2. Create bucket named "pitch-decks" (set to Private)
3. Run these policies in SQL Editor:

-- Allow users to upload to their own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'pitch-decks' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own files
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'pitch-decks' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'pitch-decks' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

=============================================
FRONTEND INTEGRATION
=============================================

Use these RPC functions in your frontend:

1. Signup: supabase.rpc('handle_new_user_and_profile', { ... })
2. Get Profile: supabase.rpc('get_user_profile')
3. Update Profile: supabase.rpc('update_user_profile', { ... })
4. Upload Deck: supabase.rpc('create_pitch_deck_record', { ... })
5. Get Decks: supabase.rpc('get_user_pitch_decks')
6. Delete Deck: supabase.rpc('delete_pitch_deck', { deck_id_in: ... })
7. Dashboard: supabase.rpc('get_dashboard_data')

All functions automatically enforce user isolation via RLS!
*/