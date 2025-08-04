/*
  # Add Test Pitch Deck for Development

  1. Purpose
    - Add a test pitch deck for development and testing
    - Allows testing of session creation functionality
    - Can be removed in production

  2. Test Data
    - Creates a sample pitch deck for the authenticated user
    - Uses placeholder data for testing
*/

-- Function to create a test pitch deck for the current user
CREATE OR REPLACE FUNCTION create_test_pitch_deck()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  pitch_deck_data json;
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Check if user already has a test pitch deck
  IF EXISTS (
    SELECT 1 FROM pitch_decks 
    WHERE user_id = current_user_id 
    AND deck_name = 'Test Pitch Deck'
  ) THEN
    -- Return existing test deck
    SELECT json_build_object(
      'success', true,
      'message', 'Test pitch deck already exists',
      'deck_id', id
    ) INTO pitch_deck_data
    FROM pitch_decks 
    WHERE user_id = current_user_id 
    AND deck_name = 'Test Pitch Deck'
    LIMIT 1;
    
    RETURN pitch_deck_data;
  END IF;
  
  -- Insert test pitch deck
  INSERT INTO pitch_decks (
    user_id,
    deck_name,
    storage_path,
    file_size,
    extracted_text
  ) VALUES (
    current_user_id,
    'Test Pitch Deck',
    'test/pitch-deck.pdf',
    1024000, -- 1MB
    'This is a test pitch deck for development purposes. It contains sample content for testing the AI conversation functionality.'
  );
  
  -- Return success with deck info
  SELECT json_build_object(
    'success', true,
    'message', 'Test pitch deck created successfully',
    'deck_id', id
  ) INTO pitch_deck_data
  FROM pitch_decks 
  WHERE user_id = current_user_id 
  AND deck_name = 'Test Pitch Deck'
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN pitch_deck_data;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_test_pitch_deck() TO authenticated;