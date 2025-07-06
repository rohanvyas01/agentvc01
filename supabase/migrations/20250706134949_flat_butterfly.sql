/*
  # Create pitch_decks table for deck uploads

  1. New Tables
    - `pitch_decks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `file_name` (text)
      - `storage_path` (text)
      - `file_size` (bigint)
      - `extracted_text` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `pitch_decks` table
    - Add policies for users to manage their own decks
*/

CREATE TABLE IF NOT EXISTS pitch_decks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  file_size bigint NOT NULL,
  extracted_text text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pitch_decks ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own pitch decks
CREATE POLICY "Users can read own pitch decks"
  ON pitch_decks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own pitch decks
CREATE POLICY "Users can insert own pitch decks"
  ON pitch_decks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own pitch decks
CREATE POLICY "Users can delete own pitch decks"
  ON pitch_decks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for pitch decks
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pitch-decks', 'pitch-decks', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload their own pitch decks"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'pitch-decks' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own pitch decks"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'pitch-decks' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own pitch decks"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'pitch-decks' AND auth.uid()::text = (storage.foldername(name))[1]);