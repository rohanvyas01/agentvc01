import { supabase, Profile, PitchDeck, isSupabaseConfigured, getSupabaseError } from '../lib/supabase';

export class SupabaseService {
  // ==========================================
  // AUTHENTICATION METHODS
  // ==========================================

  /**
   * ATOMIC USER SIGNUP - Creates both auth user and profile in single transaction
   * This is the ONLY way to create users to ensure atomicity
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
    if (!isSupabaseConfigured()) {
      throw new Error(getSupabaseError());
    }

    try {
      console.log('🚀 Starting atomic user signup...');

      // Call our atomic RPC function that creates both user and profile
      const { data, error } = await supabase!.rpc('handle_new_user_and_profile', {
        email_in: userData.email,
        password_in: userData.password,
        founder_name_in: userData.founder_name,
        startup_name_in: userData.startup_name,
        one_liner_pitch_in: userData.one_liner_pitch,
        industry_in: userData.industry,
        business_model_in: userData.business_model,
        funding_round_in: userData.funding_round,
        raise_amount_in: userData.raise_amount,
        use_of_funds_in: userData.use_of_funds,
        linkedin_profile_in: userData.linkedin_profile || null,
        website_in: userData.website || null
      });

      if (error) {
        console.error('❌ Atomic signup failed:', error);
        throw error;
      }

      console.log('✅ Atomic user creation successful:', data);

      // Now sign in the user to create a session
      const { data: authData, error: authError } = await supabase!.auth.signInWithPassword({
        email: userData.email,
        password: userData.password
      });

      if (authError) {
        console.error('❌ Auto-login after signup failed:', authError);
        throw authError;
      }

      // Get the profile data
      const profile = await this.getProfile();

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
    if (!isSupabaseConfigured()) {
      throw new Error(getSupabaseError());
    }

    try {
      console.log('🔐 Signing in user:', email);

      const { data: authData, error: authError } = await supabase!.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('❌ Login failed:', authError);
        throw authError;
      }

      // Fetch user profile
      const profile = await this.getProfile();

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
    if (!isSupabaseConfigured()) {
      throw new Error(getSupabaseError());
    }

    const { error } = await supabase!.auth.signOut();
    if (error) throw error;
  }

  /**
   * Get current session
   */
  async getSession() {
    if (!isSupabaseConfigured()) {
      throw new Error(getSupabaseError());
    }

    const { data: { session }, error } = await supabase!.auth.getSession();
    if (error) throw error;
    return session;
  }

  /**
   * Get current user with profile
   */
  async getCurrentUser() {
    if (!isSupabaseConfigured()) {
      throw new Error(getSupabaseError());
    }

    const { data: { user }, error: userError } = await supabase!.auth.getUser();
    
    if (userError) throw userError;
    if (!user) return null;

    const profile = await this.getProfile();

    return { user, profile };
  }

  // ==========================================
  // PROFILE METHODS
  // ==========================================

  /**
   * Get user profile using RPC function
   */
  async getProfile() {
    if (!isSupabaseConfigured()) {
      throw new Error(getSupabaseError());
    }

    try {
      const { data, error } = await supabase!.rpc('get_user_profile');

      if (error) throw error;
      return data as Profile;
    } catch (error) {
      console.error('❌ Get profile error:', error);
      throw error;
    }
  }

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
    if (!isSupabaseConfigured()) {
      throw new Error(getSupabaseError());
    }

    try {
      const { data, error } = await supabase!.rpc('update_user_profile', {
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
      return data as Profile;
    } catch (error) {
      console.error('❌ Profile update error:', error);
      throw error;
    }
  }

  // ==========================================
  // PITCH DECK METHODS
  // ==========================================

  /**
   * Upload pitch deck to Supabase Storage with security
   */
  async uploadPitchDeck(file: File, extractedData?: any) {
    if (!isSupabaseConfigured()) {
      throw new Error(getSupabaseError());
    }

    try {
      const { data: { user } } = await supabase!.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Validate file
      if (file.type !== 'application/pdf') {
        throw new Error('Only PDF files are allowed');
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size must be less than 10MB');
      }

      // Create secure file path (user_id/timestamp_filename)
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storagePath = `${user.id}/${fileName}`;

      console.log('📁 Uploading file to secure storage...');

      // Upload to Supabase Storage (RLS automatically enforces user folder access)
      const { data: uploadData, error: uploadError } = await supabase!.storage
        .from('pitch-decks')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Storage upload failed:', uploadError);
        throw uploadError;
      }

      console.log('✅ File uploaded to secure storage');

      // Create database record using RPC function
      const { data: deckData, error: deckError } = await supabase!.rpc('create_pitch_deck_record', {
        file_name_in: file.name,
        storage_path_in: storagePath,
        file_size_in: file.size,
        extracted_text_in: extractedData ? JSON.stringify(extractedData) : null,
        page_count_in: extractedData?.pageCount || null,
        word_count_in: extractedData?.extractionStats?.totalWords || null
      });

      if (deckError) {
        console.error('❌ Database record creation failed:', deckError);
        
        // Clean up uploaded file
        await supabase!.storage
          .from('pitch-decks')
          .remove([storagePath]);

        throw deckError;
      }

      console.log('✅ Pitch deck record created securely');

      return deckData as PitchDeck;
    } catch (error) {
      console.error('❌ Upload pitch deck error:', error);
      throw error;
    }
  }

  /**
   * Get user's pitch decks using RPC function
   */
  async getPitchDecks() {
    if (!isSupabaseConfigured()) {
      throw new Error(getSupabaseError());
    }

    try {
      const { data, error } = await supabase!.rpc('get_user_pitch_decks');

      if (error) throw error;
      return data as PitchDeck[];
    } catch (error) {
      console.error('❌ Get pitch decks error:', error);
      throw error;
    }
  }

  /**
   * Delete pitch deck using RPC function
   */
  async deletePitchDeck(deckId: string) {
    if (!isSupabaseConfigured()) {
      throw new Error(getSupabaseError());
    }

    try {
      const { data, error } = await supabase!.rpc('delete_pitch_deck', {
        deck_id_in: deckId
      });

      if (error) throw error;

      // Delete from storage (RLS ensures user can only delete their own files)
      if (data.storage_path) {
        const { error: storageError } = await supabase!.storage
          .from('pitch-decks')
          .remove([data.storage_path]);

        if (storageError) {
          console.warn('⚠️ Storage deletion failed:', storageError);
          // Don't throw error as database record is already deleted
        }
      }

      console.log('✅ Pitch deck deleted successfully');
      return data;
    } catch (error) {
      console.error('❌ Delete pitch deck error:', error);
      throw error;
    }
  }

  /**
   * Get secure download URL for pitch deck
   */
  async getDownloadUrl(storagePath: string) {
    if (!isSupabaseConfigured()) {
      throw new Error(getSupabaseError());
    }

    try {
      const { data, error } = await supabase!.storage
        .from('pitch-decks')
        .createSignedUrl(storagePath, 3600); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('❌ Get download URL error:', error);
      throw error;
    }
  }

  // ==========================================
  // DASHBOARD METHODS
  // ==========================================

  /**
   * Get complete dashboard data using RPC function
   */
  async getDashboardData() {
    if (!isSupabaseConfigured()) {
      throw new Error(getSupabaseError());
    }

    try {
      const { data, error } = await supabase!.rpc('get_dashboard_data');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Dashboard data error:', error);
      throw error;
    }
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    if (!isSupabaseConfigured()) {
      return false;
    }

    try {
      const { data: { user } } = await supabase!.auth.getUser();
      return !!user;
    } catch {
      return false;
    }
  }

  /**
   * Get current user ID
   */
  async getCurrentUserId() {
    if (!isSupabaseConfigured()) {
      throw new Error(getSupabaseError());
    }

    const { data: { user } } = await supabase!.auth.getUser();
    return user?.id || null;
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService();