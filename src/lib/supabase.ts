import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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