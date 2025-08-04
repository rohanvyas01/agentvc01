/*
  # Refresh Schema Cache

  This migration adds a simple comment to force Supabase to refresh its schema cache
  and recognize the updated table structures.
*/

-- Add comments to force schema cache refresh
COMMENT ON TABLE profiles IS 'User profile information - updated schema';
COMMENT ON TABLE companies IS 'Company information for users';
COMMENT ON TABLE pitch_decks IS 'Pitch deck files and metadata';

-- Ensure all expected columns exist in profiles table
DO $$
BEGIN
  -- Verify all expected columns exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'fundraise_stage') THEN
    ALTER TABLE profiles ADD COLUMN fundraise_stage text;
  END IF;
END $$;