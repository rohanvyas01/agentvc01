import { supabase, Profile, PitchDeck } from '../lib/supabase';

export class SupabaseService {
  // ==========================================
  // AUTHENTICATION METHODS
  // ==========================================

  /**
   * Atomic user signup - creates both auth user and profile in single transaction
   */
  async signUp(userData: {
    email: string;
    password: string;
    founder_name: string;
    startup_name: string;
    one_liner_pitch: string;
    industry: string;
    business_model: string;
    funding_round: string;
    raise_amount: string;
    use_of_funds: string;
    linkedin_profile?: string;
    website?: string;
  }) {
    try {
      console.log('🚀 Starting atomic user signup...');

      // Create user with metadata - trigger will automatically create profile
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            founder_name: userData.founder_name,
            startup_name: userData.startup_name,
            one_liner_pitch: userData.one_liner_pitch,
            industry: userData.industry,
            business_model: userData.business_model,
            funding_round: userData.funding_round,
            raise_amount: userData.raise_amount,
            use_of_funds: userData.use_of_funds,
            linkedin_profile: userData.linkedin_profile || null,
            website: userData.website || null
          }
        }
      });

      if (authError) {
        console.error('❌ Auth signup failed:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('User creation failed - no user data returned');
      }

      console.log('✅ User created successfully:', authData.user.id);

      // Verify profile was created by the trigger
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError) {
        console.error('❌ Profile verification failed:', profileError);
        throw new Error('Profile creation failed - user account may need cleanup');
      }

      console.log('✅ Profile verified successfully');

      return {
        user: authData.user,
        profile,
        session: authData.session
      };
    } catch (error) {
      console.error('❌ Signup error:', error);
      throw error;
    }
  }

  /**
   * Standard user login
   */
  async signIn(email: string, password: string) {
    try {
      console.log('🔐 Signing in user:', email);

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('❌ Login failed:', authError);
        throw authError;
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError) {
        console.error('❌ Profile fetch failed:', profileError);
        throw new Error('Failed to fetch user profile');
      }

      console.log('✅ Login successful');

      return {
        user: authData.user,
        profile,
        session: authData.session
      };
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  /**
   * Sign out user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Get current session
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  /**
   * Get current user with profile
   */
  async getCurrentUser() {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw userError;
    if (!user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) throw profileError;

    return { user, profile };
  }

  // ==========================================
  // PROFILE METHODS
  // ==========================================

  /**
   * Update user profile using RPC function
   */
  async updateProfile(profileData: {
    founder_name: string;
    startup_name: string;
    one_liner_pitch: string;
    industry: string;
    business_model: string;
    funding_round: string;
    raise_amount: string;
    use_of_funds: string;
    linkedin_profile?: string;
    website?: string;
  }) {
    try {
      const { data, error } = await supabase.rpc('update_user_profile', {
        founder_name_in: profileData.founder_name,
        startup_name_in: profileData.startup_name,
        one_liner_pitch_in: profileData.one_liner_pitch,
        industry_in: profileData.industry,
        business_model_in: profileData.business_model,
        funding_round_in: profileData.funding_round,
        raise_amount_in: profileData.raise_amount,
        use_of_funds_in: profileData.use_of_funds,
        linkedin_profile_in: profileData.linkedin_profile || null,
        website_in: profileData.website || null
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Profile update error:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getProfile(userId?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;

    if (!targetUserId) throw new Error('No user ID provided');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    if (error) throw error;
    return data as Profile;
  }

  // ==========================================
  // PITCH DECK METHODS
  // ==========================================

  /**
   * Upload pitch deck to Supabase Storage
   */
  async uploadPitchDeck(file: File) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Validate file
      if (file.type !== 'application/pdf') {
        throw new Error('Only PDF files are allowed');
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size must be less than 10MB');
      }

      // Create unique file path
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storagePath = `${user.id}/${fileName}`;

      console.log('📁 Uploading file to storage...');

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pitch-decks')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Storage upload failed:', uploadError);
        throw uploadError;
      }

      console.log('✅ File uploaded to storage');

      // Create database record
      const { data: deckData, error: deckError } = await supabase
        .from('pitch_decks')
        .insert({
          user_id: user.id,
          file_name: file.name,
          storage_path: storagePath,
          file_size: file.size,
          extracted_text: null // Will be populated by text extraction service
        })
        .select()
        .single();

      if (deckError) {
        console.error('❌ Database record creation failed:', deckError);
        
        // Clean up uploaded file
        await supabase.storage
          .from('pitch-decks')
          .remove([storagePath]);

        throw deckError;
      }

      console.log('✅ Pitch deck record created');

      return deckData as PitchDeck;
    } catch (error) {
      console.error('❌ Upload pitch deck error:', error);
      throw error;
    }
  }

  /**
   * Get user's pitch decks
   */
  async getPitchDecks() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('pitch_decks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as PitchDeck[];
  }

  /**
   * Delete pitch deck
   */
  async deletePitchDeck(deckId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get deck info first
      const { data: deck, error: fetchError } = await supabase
        .from('pitch_decks')
        .select('storage_path')
        .eq('id', deckId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('pitch-decks')
        .remove([deck.storage_path]);

      if (storageError) {
        console.warn('⚠️ Storage deletion failed:', storageError);
        // Continue with database deletion
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('pitch_decks')
        .delete()
        .eq('id', deckId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      console.log('✅ Pitch deck deleted successfully');
    } catch (error) {
      console.error('❌ Delete pitch deck error:', error);
      throw error;
    }
  }

  /**
   * Get download URL for pitch deck
   */
  async getDownloadUrl(storagePath: string) {
    const { data, error } = await supabase.storage
      .from('pitch-decks')
      .createSignedUrl(storagePath, 3600); // 1 hour expiry

    if (error) throw error;
    return data.signedUrl;
  }

  // ==========================================
  // DASHBOARD METHODS
  // ==========================================

  /**
   * Get dashboard data (profile + pitch decks + stats)
   */
  async getDashboardData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Get pitch decks
      const { data: pitchDecks, error: decksError } = await supabase
        .from('pitch_decks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (decksError) throw decksError;

      return {
        profile: profile as Profile,
        pitchDecks: pitchDecks as PitchDeck[],
        stats: {
          totalDecks: pitchDecks.length,
          accountCreated: profile.created_at
        }
      };
    } catch (error) {
      console.error('❌ Dashboard data error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService();