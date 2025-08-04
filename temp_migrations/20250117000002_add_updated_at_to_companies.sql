/*
  # Add updated_at column to companies table

  1. Changes
    - Add `updated_at` column to `companies` table since the trigger expects it

  2. Security
    - No changes to RLS policies needed
*/

-- Add updated_at column to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();