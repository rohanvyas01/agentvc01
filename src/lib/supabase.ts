// Placeholder types for future Supabase integration
// These types are kept for structure but Supabase client is not initialized

// Database types
export interface Profile {
  id: string;
  user_id: string;
  founder_name: string;
  linkedin_profile?: string;
  startup_name: string;
  website?: string;
  one_liner_pitch: string;
  industry: string;
  business_model: string;
  funding_round: string;
  raise_amount: string;
  use_of_funds: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface PitchDeck {
  id: string;
  user_id: string;
  file_name: string;
  storage_path: string;
  file_size: number;
  extracted_text?: string;
  created_at: string;
}

// Placeholder for future Supabase client
export const supabase = {
  auth: {
    signUp: () => Promise.reject(new Error('Backend not implemented yet')),
    signInWithPassword: () => Promise.reject(new Error('Backend not implemented yet')),
    signOut: () => Promise.reject(new Error('Backend not implemented yet')),
    getSession: () => Promise.reject(new Error('Backend not implemented yet')),
    getUser: () => Promise.reject(new Error('Backend not implemented yet'))
  },
  from: () => ({
    select: () => Promise.reject(new Error('Backend not implemented yet')),
    insert: () => Promise.reject(new Error('Backend not implemented yet')),
    update: () => Promise.reject(new Error('Backend not implemented yet')),
    delete: () => Promise.reject(new Error('Backend not implemented yet'))
  }),
  storage: {
    from: () => ({
      upload: () => Promise.reject(new Error('Backend not implemented yet')),
      remove: () => Promise.reject(new Error('Backend not implemented yet')),
      createSignedUrl: () => Promise.reject(new Error('Backend not implemented yet'))
    })
  },
  rpc: () => Promise.reject(new Error('Backend not implemented yet'))
};