/*
  # Add Missing Profile Columns

  This migration ensures all columns expected by the onboarding form exist in the profiles table.
*/

-- Add missing columns to profiles table
DO $$
BEGIN
  -- Add industry column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'industry'
  ) THEN
    ALTER TABLE profiles ADD COLUMN industry text;
  END IF;
  
  -- Add website column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'website'
  ) THEN
    ALTER TABLE profiles ADD COLUMN website text;
  END IF;
  
  -- Add full_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN full_name text;
  END IF;
  
  -- Add startup_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'startup_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN startup_name text;
  END IF;
  
  -- Add linkedin_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'linkedin_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN linkedin_url text;
  END IF;
  
  -- Add fundraise_stage column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'fundraise_stage'
  ) THEN
    ALTER TABLE profiles ADD COLUMN fundraise_stage text;
  END IF;
  
  -- Add one_liner column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'one_liner'
  ) THEN
    ALTER TABLE profiles ADD COLUMN one_liner text;
  END IF;
  
  -- Add use_of_funds column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'use_of_funds'
  ) THEN
    ALTER TABLE profiles ADD COLUMN use_of_funds text;
  END IF;
  
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
END $$;

-- Add comment to force schema cache refresh
COMMENT ON TABLE profiles IS 'User profile information with all required columns - schema updated';

-- Verify RLS policies exist for profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR auth.uid() = user_id)
  WITH CHECK (auth.uid() = id OR auth.uid() = user_id);