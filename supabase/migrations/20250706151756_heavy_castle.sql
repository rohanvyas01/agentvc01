-- This script fixes the profile creation process by refining RLS policies and the trigger.

-- Drop the existing trigger and function to recreate them cleanly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

-- Drop existing policies before redefining them
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

-- Drop the table to ensure it's recreated with the correct schema.
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Recreate the table with the correct schema.
-- This ensures the foreign key constraint is correctly named and configured.
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY,
  updated_at timestamptz,
  full_name text,
  avatar_url text,
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Re-enable Row Level Security on the table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- POLICY 1: Allow authenticated users to view all profiles.
-- You can restrict this further if needed, e.g., using `auth.uid() = id` for viewing only their own.
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- POLICY 2: Allow users to update their own profile.
CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- NOTE: We are intentionally NOT creating an INSERT policy.
-- The trigger below is the only way profiles should be created.

-- This is the key part: The trigger function.
-- It runs with the permissions of the definer (postgres) and securely creates a profile.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The trigger that fires after a new user is created in the auth schema.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

