/*
  # Fix pitch_decks table schema to match application expectations

  1. Changes
    - Rename `file_name` to `deck_name` if needed
    - Add missing columns: `file_type`, `processing_status`, `company_id`
    - Ensure all columns exist that the application expects

  2. Safety
    - Uses conditional logic to only add/rename columns if they don't exist
    - Preserves all existing data
*/

DO $
BEGIN
  -- Rename file_name to deck_name if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pitch_decks' AND column_name = 'file_name'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pitch_decks' AND column_name = 'deck_name'
  ) THEN
    ALTER TABLE pitch_decks RENAME COLUMN file_name TO deck_name;
  END IF;

  -- Add file_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pitch_decks' AND column_name = 'file_type'
  ) THEN
    ALTER TABLE pitch_decks ADD COLUMN file_type text;
  END IF;

  -- Add processing_status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pitch_decks' AND column_name = 'processing_status'
  ) THEN
    ALTER TABLE pitch_decks ADD COLUMN processing_status text DEFAULT 'pending' 
    CHECK (processing_status IN ('pending', 'processing', 'processed', 'failed'));
  END IF;

  -- Add company_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pitch_decks' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE pitch_decks ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE CASCADE;
  END IF;

  -- Rename storage_path to pitch_deck_storage_path if needed (for consistency with onboarding)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pitch_decks' AND column_name = 'storage_path'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pitch_decks' AND column_name = 'pitch_deck_storage_path'
  ) THEN
    ALTER TABLE pitch_decks RENAME COLUMN storage_path TO pitch_deck_storage_path;
  END IF;

END $;

-- Add comments to document the columns
COMMENT ON COLUMN pitch_decks.deck_name IS 'Name of the pitch deck file';
COMMENT ON COLUMN pitch_decks.file_type IS 'MIME type of the uploaded file';
COMMENT ON COLUMN pitch_decks.processing_status IS 'Status of pitch deck processing (pending, processing, processed, failed)';
COMMENT ON COLUMN pitch_decks.company_id IS 'Reference to the company this pitch deck belongs to';
COMMENT ON COLUMN pitch_decks.pitch_deck_storage_path IS 'Storage path in Supabase storage bucket';