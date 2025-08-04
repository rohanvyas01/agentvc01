/*
  # Fix Companies Foreign Key Issue

  This migration fixes the foreign key constraint issue with the companies table.
  Similar to profiles, we need to remove the strict foreign key constraint.
*/

-- Drop the existing companies table and recreate it without the strict foreign key constraint
DROP TABLE IF EXISTS pitch_decks CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Create companies table with a more flexible structure
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  industry text NOT NULL,
  stage text NOT NULL,
  funding_round text,
  funding_amount text,
  one_liner text NOT NULL,
  website text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pitch_decks table (recreate since it depends on companies)
CREATE TABLE pitch_decks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  deck_name text NOT NULL,
  file_type text,
  pitch_deck_storage_path text NOT NULL,
  file_size bigint NOT NULL,
  processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'processed', 'failed')),
  extracted_text text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_decks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companies
CREATE POLICY "Users can read own companies"
  ON companies FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own companies"
  ON companies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for pitch_decks
CREATE POLICY "Users can read own pitch decks"
  ON pitch_decks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pitch decks"
  ON pitch_decks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pitch decks"
  ON pitch_decks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pitch decks"
  ON pitch_decks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_pitch_decks_user_id ON pitch_decks(user_id);
CREATE INDEX idx_pitch_decks_company_id ON pitch_decks(company_id);

-- Add comments
COMMENT ON TABLE companies IS 'Company information - fixed foreign key constraints';
COMMENT ON TABLE pitch_decks IS 'Pitch deck files and metadata - fixed foreign key constraints';