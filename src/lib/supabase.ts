import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Backend features will be disabled.');
}

// Create Supabase client (will be null if env vars not provided)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

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
  mime_type: string;
  extracted_text?: string;
  page_count?: number;
  word_count?: number;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_error?: string;
  created_at: string;
  updated_at: string;
}

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabase !== null;
};

// Helper function to get error message for unconfigured Supabase
export const getSupabaseError = () => {
  return 'Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.';
};