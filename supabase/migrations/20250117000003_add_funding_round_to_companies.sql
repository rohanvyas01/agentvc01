/*
  # Add funding_round and funding_amount fields to companies table

  1. Changes
    - Add `funding_round` column to companies table for precise persona selection
    - Add `funding_amount` column to store the funding amount separately
    - This will be used to automatically select Angel vs VC investor personas

  2. Security
    - No changes to RLS policies needed as this is just adding columns

  Requirements: Support automated persona selection based on funding round
*/

-- Add funding_round column to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS funding_round text;

-- Add funding_amount column to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS funding_amount text;

-- Add comments to explain the fields
COMMENT ON COLUMN companies.funding_round IS 'Specific funding round (e.g., Pre-seed, Seed, Series A, etc.) used for automated investor persona selection';
COMMENT ON COLUMN companies.funding_amount IS 'Funding amount being raised (e.g., $500k, $2M, etc.)';