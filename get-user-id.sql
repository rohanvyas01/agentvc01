-- Get your current user ID
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;