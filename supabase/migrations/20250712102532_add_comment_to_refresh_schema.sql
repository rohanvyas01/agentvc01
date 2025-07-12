-- This is a dummy migration to force a refresh of the Supabase schema cache.
-- It adds a comment to the 'profiles' table, which is a non-breaking change.
COMMENT ON TABLE profiles IS 'Force schema refresh to recognize user_id column.';
