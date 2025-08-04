-- Fix Dashboard Loading Issues
-- This script creates test data for the logged-in user

-- First, let's check what user is currently logged in
-- You'll need to replace 'YOUR_USER_ID' with your actual user ID from auth.users

-- Get your user ID by running this in Supabase SQL Editor:
-- SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- Replace 'YOUR_USER_ID' with the actual UUID from the query above
DO $$
DECLARE
    user_uuid uuid := 'YOUR_USER_ID'; -- Replace this with your actual user ID
    company_uuid uuid := gen_random_uuid();
BEGIN
    -- Insert or update profile
    INSERT INTO profiles (
        id,
        full_name,
        startup_name,
        website,
        one_liner,
        industry,
        business_model,
        fundraise_stage,
        raise_amount,
        use_of_funds,
        linkedin_url,
        immediate_goals,
        updated_at
    ) VALUES (
        user_uuid,
        'Test Founder',
        'Test Startup',
        'https://teststartup.com',
        'We solve problems with AI',
        'Technology',
        'SaaS',
        'Seed',
        '$1M',
        'Product development and team expansion',
        'https://linkedin.com/in/testfounder',
        'Launch MVP and get first customers',
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        startup_name = EXCLUDED.startup_name,
        website = EXCLUDED.website,
        one_liner = EXCLUDED.one_liner,
        industry = EXCLUDED.industry,
        business_model = EXCLUDED.business_model,
        fundraise_stage = EXCLUDED.fundraise_stage,
        raise_amount = EXCLUDED.raise_amount,
        use_of_funds = EXCLUDED.use_of_funds,
        linkedin_url = EXCLUDED.linkedin_url,
        immediate_goals = EXCLUDED.immediate_goals,
        updated_at = NOW();

    -- Insert company
    INSERT INTO companies (
        id,
        user_id,
        name,
        industry,
        stage,
        funding_round,
        funding_amount,
        one_liner,
        website,
        created_at,
        updated_at
    ) VALUES (
        company_uuid,
        user_uuid,
        'Test Startup Inc',
        'Technology',
        'Seed',
        'Seed',
        '$1M',
        'We solve problems with AI technology',
        'https://teststartup.com',
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        industry = EXCLUDED.industry,
        stage = EXCLUDED.stage,
        funding_round = EXCLUDED.funding_round,
        funding_amount = EXCLUDED.funding_amount,
        one_liner = EXCLUDED.one_liner,
        website = EXCLUDED.website,
        updated_at = NOW();

    -- Update profile with company_id
    UPDATE profiles 
    SET company_id = company_uuid 
    WHERE id = user_uuid;

    -- Insert a test pitch deck
    INSERT INTO pitch_decks (
        user_id,
        company_id,
        deck_name,
        file_type,
        processing_status,
        created_at,
        updated_at
    ) VALUES (
        user_uuid,
        company_uuid,
        'Test Pitch Deck',
        'pdf',
        'processed',
        NOW(),
        NOW()
    ) ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Test data created successfully for user %', user_uuid;
END $$;