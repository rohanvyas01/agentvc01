/*
  # Fix Sessions Table Foreign Key Reference

  1. Problem
    - Sessions table references pitch_decks table
    - But actual data is in pitches table
    - This causes foreign key constraint violations

  2. Solution
    - Update sessions table to reference pitches table instead
    - Update column name from pitch_deck_id to pitch_id
    - Maintain data integrity with proper foreign key constraints

  3. Changes
    - Drop existing foreign key constraint
    - Rename column from pitch_deck_id to pitch_id  
    - Add new foreign key constraint to pitches table
*/

-- First, drop the existing foreign key constraint
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_pitch_deck_id_fkey;

-- Rename the column to match the pitches table
ALTER TABLE sessions RENAME COLUMN pitch_deck_id TO pitch_id;

-- Add new foreign key constraint to pitches table
ALTER TABLE sessions ADD CONSTRAINT sessions_pitch_id_fkey 
  FOREIGN KEY (pitch_id) REFERENCES pitches(id) ON DELETE SET NULL;

-- Update the Edge Function interface to match
-- Note: This will require updating the Edge Function code as well