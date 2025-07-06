// Placeholder service for future backend integration
// This file is kept for structure but all methods will throw "not implemented" errors

export class SupabaseService {
  // ==========================================
  // AUTHENTICATION METHODS
  // ==========================================

  async signUp(userData: any) {
    throw new Error('Backend not implemented yet. Authentication will be available when backend is ready.');
  }

  async signIn(email: string, password: string) {
    throw new Error('Backend not implemented yet. Authentication will be available when backend is ready.');
  }

  async signOut() {
    throw new Error('Backend not implemented yet. Authentication will be available when backend is ready.');
  }

  async getSession() {
    throw new Error('Backend not implemented yet. Session management will be available when backend is ready.');
  }

  async getCurrentUser() {
    throw new Error('Backend not implemented yet. User management will be available when backend is ready.');
  }

  // ==========================================
  // PROFILE METHODS
  // ==========================================

  async updateProfile(profileData: any) {
    throw new Error('Backend not implemented yet. Profile management will be available when backend is ready.');
  }

  async getProfile(userId?: string) {
    throw new Error('Backend not implemented yet. Profile management will be available when backend is ready.');
  }

  // ==========================================
  // PITCH DECK METHODS
  // ==========================================

  async uploadPitchDeck(file: File) {
    throw new Error('Backend not implemented yet. File upload will be available when backend is ready.');
  }

  async getPitchDecks() {
    throw new Error('Backend not implemented yet. Pitch deck management will be available when backend is ready.');
  }

  async deletePitchDeck(deckId: string) {
    throw new Error('Backend not implemented yet. Pitch deck management will be available when backend is ready.');
  }

  async getDownloadUrl(storagePath: string) {
    throw new Error('Backend not implemented yet. File download will be available when backend is ready.');
  }

  // ==========================================
  // DASHBOARD METHODS
  // ==========================================

  async getDashboardData() {
    throw new Error('Backend not implemented yet. Dashboard data will be available when backend is ready.');
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService();