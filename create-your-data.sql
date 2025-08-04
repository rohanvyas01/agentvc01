-- Create user data for test1234@gmail.com
-- User ID: 2ff2c93a-478f-4de5-8e67-fcea76bc8a09

DO $$
DECLARE
    user_uuid uuid := '2ff2c93a-478f-4de5-8e67-fcea76bc8a09';
    company_uuid uuid := gen_random_uuid();
BEGIN
    -- Insert profile
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
        'Product development',
        'https://linkedin.com/in/test',
        'Launch MVP',
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
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
        'We solve problems with AI',
        'https://teststartup.com',
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        updated_at = NOW();

    -- Update profile with company_id
    UPDATE profiles 
    SET company_id = (SELECT id FROM companies WHERE user_id = user_uuid LIMIT 1)
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
        (SELECT id FROM companies WHERE user_id = user_uuid LIMIT 1),
        'Test Pitch Deck',
        'pdf',
        'processed',
        NOW(),
        NOW()
    ) ON CONFLICT DO NOTHING;

    RAISE NOTICE 'User data created successfully for user %', user_uuid;
END $$;