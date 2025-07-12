-- supabase/migrations/20250711120000_add_pitch_deck_trigger.sql

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS handle_pitch_deck_upload ON pitches;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS on_pitch_deck_upload();
