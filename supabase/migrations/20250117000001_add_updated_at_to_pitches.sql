/*
  # Add updated_at column to pitch_decks table
  
  This migration adds the updated_at column to the pitch_decks table
  and creates a trigger to automatically update it.
*/

-- Add updated_at column if it doesn't exist
DO $
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pitch_decks' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE pitch_decks ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $;

-- Create updated_at trigger for pitch_decks
DROP TRIGGER IF EXISTS update_pitch_decks_updated_at ON pitch_decks;
CREATE TRIGGER update_pitch_decks_updated_at
  BEFORE UPDATE ON pitch_decks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();