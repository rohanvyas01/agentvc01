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
  updated_at?: string;
  full_name?: string;
  avatar_url?: string;
  startup_name?: string;
  website?: string;
  one_liner?: string;
  industry?: string;
  business_model?: string;
  fundraise_stage?: string;
  raise_amount?: string;
  use_of_funds?: string;
  linkedin_url?: string;
  immediate_goals?: string;
  company_id?: string;
}

export interface Company {
  id: string;
  user_id: string;
  name: string;
  industry?: string;
  stage?: string;
  funding_round?: string;
  funding_amount?: string;
  one_liner?: string;
  website?: string;
  created_at: string;
  updated_at?: string;
}

export interface PitchDeck {
  id: string;
  user_id: string;
  company_id?: string;
  deck_name: string;
  file_type?: string;
  pitch_deck_url?: string;
  pitch_deck_storage_path?: string;
  financials_url?: string;
  transcript_text?: string;
  processing_status: 'pending' | 'processing' | 'processed' | 'failed';
  created_at: string;
  updated_at?: string;
}

export interface Session {
  id: string;
  user_id: string;
  company_id?: string;
  pitch_deck_id?: string;
  tavus_conversation_id?: string;
  tavus_persona_id: string;
  status: 'created' | 'active' | 'completed' | 'failed';
  duration_minutes?: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface ConversationTranscript {
  id: string;
  session_id: string;
  speaker: 'founder' | 'investor';
  content: string;
  timestamp_ms: number;
  created_at: string;
}

export interface ConversationAnalysis {
  id: string;
  session_id: string;
  gemini_analysis?: any;
  key_strengths: string[];
  improvement_areas: string[];
  follow_up_questions: string[];
  overall_score?: number;
  created_at: string;
}

export interface SessionReport {
  id: string;
  session_id: string;
  report_data: {
    summary: string;
    transcript: ConversationTranscript[];
    analysis: ConversationAnalysis;
    recommendations: string[];
    next_steps: string[];
  };
  email_sent: boolean;
  email_sent_at?: string;
  created_at: string;
}

export interface InvestorPersona {
  id: string;
  name: string;
  description: string;
  specialty: string;
  experience: string;
  conversationStyle: string;
  focusAreas: string[];
  avatarUrl: string;
}