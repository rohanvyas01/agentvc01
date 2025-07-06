const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');
const { validateRequest, updateProfileSchema } = require('../middleware/validation');

const router = express.Router();

// GET /api/dashboard - Get dashboard data
router.get('/', authenticateUser, async (req, res) => {
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

    // Fetch user's pitch decks
    const { data: pitchDecks, error: decksError } = await supabase
      .from('pitch_decks')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (decksError) {
      console.error('❌ Error fetching pitch decks:', decksError);
      // Don't fail the request, just return empty array
    }

    res.json({
      success: true,
      profile: profileData,
      pitch_decks: pitchDecks || [],
      stats: {
        total_decks: pitchDecks ? pitchDecks.length : 0,
        account_created: profileData.created_at
      }
    });

  } catch (error) {
    console.error('❌ Dashboard error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// PUT /api/dashboard/profile - Update user profile
router.put('/profile', authenticateUser, validateRequest(updateProfileSchema), async (req, res) => {
  try {
    const updates = req.body;
    
    // Use our database function for atomic updates
    const { data: updatedProfile, error: updateError } = await supabase
      .rpc('update_user_profile', {
        user_id_in: req.user.id,
        founder_name_in: updates.founder_name,
        startup_name_in: updates.startup_name,
        one_liner_pitch_in: updates.one_liner_pitch,
        industry_in: updates.industry,
        business_model_in: updates.business_model,
        funding_round_in: updates.funding_round,
        raise_amount_in: updates.raise_amount,
        use_of_funds_in: updates.use_of_funds,
        linkedin_profile_in: updates.linkedin_profile,
        website_in: updates.website
      });

    if (updateError) {
      console.error('❌ Profile update failed:', updateError);
      return res.status(400).json({
        error: 'Failed to update profile',
        details: updateError.message
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile
    });

  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router;