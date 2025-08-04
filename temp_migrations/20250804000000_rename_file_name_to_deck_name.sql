/*
  # Fix pitch_decks table column naming

  1. Changes
    - Rename `file_name` column to `deck_name` in pitch_decks table
    - This fixes the schema mismatch causing "Could not find the 'deck_name' column" error

  2. Safety
    - Uses ALTER TABLE RENAME COLUMN which preserves all data
    - Includes safety check to only rename if file_name exists and deck_name doesn't
*/

-- Rename file_name to deck_name in pitch_decks table
DO $
BEGIN
  -- Only rename if file_name exists and deck_name doesn't exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pitch_decks' AND column_name = 'file_name'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pitch_decks' AND column_name = 'deck_name'
  ) THEN
    ALTER TABLE pitch_decks RENAME COLUMN file_name TO deck_name;
    
    -- Add a comment to document the change
    COMMENT ON COLUMN pitch_decks.deck_name IS 'Name of the pitch deck file (renamed from file_name)';
  END IF;
END $;