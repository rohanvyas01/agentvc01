import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PitchDeck {
  id: string;
  user_id: string;
  deck_name: string;
  storage_path: string;
  extracted_text?: string;
  file_size?: number;
  file_type?: string;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  deck_id: string;
  tavus_conversation_id?: string;
  tavus_persona_id: string;
  status: 'created' | 'active' | 'completed' | 'failed';
  full_transcript?: any;
  final_report?: any;
  duration_minutes?: number;
  created_at: string;
  completed_at?: string;
  pitch_decks?: PitchDeck;
}