/*
  # Setup Storage Bucket for Pitch Decks

  This migration creates the storage bucket and sets up proper policies for file uploads.
*/

-- Create the pitchdecks storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pitchdecks',
  'pitchdecks',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the pitchdecks bucket
CREATE POLICY "Users can upload their own pitch decks"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pitchdecks' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own pitch decks"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'pitchdecks' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own pitch decks"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'pitchdecks' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own pitch decks"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'pitchdecks' AND
  (storage.foldername(name))[1] = auth.uid()::text
);