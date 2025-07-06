const express = require('express');
const { supabase } = require('../config/supabase');
const { validateRequest, signupSchema, loginSchema } = require('../middleware/validation');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/signup - Atomic user creation
router.post('/signup', validateRequest(signupSchema), async (req, res) => {
  try {
    const {
      email,
      password,
      founder_name,
      startup_name,
      one_liner_pitch,
      industry,
      business_model,
      funding_round,
      raise_amount,
      use_of_funds,
      linkedin_profile,
      website
    } = req.body;

    console.log('🚀 Starting atomic user creation for:', email);

    // Create user with metadata - this will trigger the database function
    // that creates the profile atomically
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          founder_name,
          startup_name,
          one_liner_pitch,
          industry,
          business_model,
          funding_round,
          raise_amount,
          use_of_funds,
          linkedin_profile: linkedin_profile || null,
          website: website || null
        }
      }
    });

    if (authError) {
      console.error('❌ Auth signup failed:', authError);
      return res.status(400).json({
        error: 'Failed to create user account',
        details: authError.message
      });
    }

    if (!authData.user) {
      return res.status(400).json({
        error: 'User creation failed - no user data returned'
      });
    }

    console.log('✅ User created successfully:', authData.user.id);

    // The database trigger automatically created the profile
    // Let's verify it was created by fetching it
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile verification failed:', profileError);
      // This shouldn't happen due to our atomic trigger, but if it does,
      // we need to clean up the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return res.status(500).json({
        error: 'Profile creation failed - user account rolled back',
        details: profileError.message
      });
    }

    console.log('✅ Profile verified successfully');

    res.status(201).json({
      success: true,
      message: 'User and profile created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        email_confirmed_at: authData.user.email_confirmed_at
      },
      profile: profileData,
      session: authData.session
    });

  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({
      error: 'Internal server error during signup',
      details: error.message
    });
  }
});

// POST /api/auth/login - Standard login
router.post('/login', validateRequest(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for:', email);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('❌ Login failed:', authError);
      return res.status(401).json({
        error: 'Invalid credentials',
        details: authError.message
      });
    }

    // Fetch user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile fetch failed:', profileError);
      return res.status(500).json({
        error: 'Failed to fetch user profile',
        details: profileError.message
      });
    }

    console.log('✅ Login successful');

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        email_confirmed_at: authData.user.email_confirmed_at
      },
      profile: profileData,
      session: authData.session
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      error: 'Internal server error during login',
      details: error.message
    });
  }
});

// POST /api/auth/logout - Logout user
router.post('/logout', authenticateUser, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(400).json({
        error: 'Logout failed',
        details: error.message
      });
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      error: 'Internal server error during logout',
      details: error.message
    });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', authenticateUser, async (req, res) => {
  try {
    // Fetch user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (profileError) {
      return res.status(404).json({
        error: 'Profile not found',
        details: profileError.message
      });
    }

    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        email_confirmed_at: req.user.email_confirmed_at
      },
      profile: profileData
    });

  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router;