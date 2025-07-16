/*
  # Add updated_at column to pitches table

  1. Changes
    - Add `updated_at` column to `pitches` table
    - Add trigger to automatically update `updated_at` on row updates

  2. Security
    - No changes to RLS policies needed
*/

-- Add updated_at column to pitches table
ALTER TABLE pitches ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create trigger to automatically update updated_at column
DROP TRIGGER IF EXISTS update_pitches_updated_at ON pitches;
CREATE TRIGGER update_pitches_updated_at
  BEFORE UPDATE ON pitches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();