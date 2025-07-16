// Database utility functions for the founder dashboard
import { supabase } from './supabase';
import { 
  Session, 
  ConversationTranscript, 
  ConversationAnalysis, 
  SessionReport, 
  Company, 
  PitchDeck,
  Profile 
} from './supabase';

// Session management functions
export const createSession = async (
  userId: string,
  companyId: string | null,
  pitchDeckId: string | null,
  tavusPersonaId: string
): Promise<Session> => {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      company_id: companyId,
      pitch_deck_id: pitchDeckId,
      tavus_persona_id: tavusPersonaId,
      status: 'created'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateSessionStatus = async (
  sessionId: string,
  status: 'created' | 'active' | 'completed' | 'failed',
  additionalData?: Partial<Session>
): Promise<Session> => {
  const updateData = {
    status,
    ...additionalData,
    ...(status === 'active' && { started_at: new Date().toISOString() }),
    ...(status === 'completed' && { completed_at: new Date().toISOString() })
  };

  const { data, error } = await supabase
    .from('sessions')
    .update(updateData)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserSessions = async (userId: string): Promise<Session[]> => {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      pitch_decks (
        id,
        deck_name,
        processing_status
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Transcript management functions
export const addTranscriptSegment = async (
  sessionId: string,
  speaker: 'founder' | 'investor',
  content: string,
  timestampMs: number
): Promise<ConversationTranscript> => {
  const { data, error } = await supabase
    .from('conversation_transcripts')
    .insert({
      session_id: sessionId,
      speaker,
      content,
      timestamp_ms: timestampMs
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getSessionTranscripts = async (sessionId: string): Promise<ConversationTranscript[]> => {
  const { data, error } = await supabase
    .from('conversation_transcripts')
    .select('*')
    .eq('session_id', sessionId)
    .order('timestamp_ms', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Analysis management functions
export const saveConversationAnalysis = async (
  sessionId: string,
  analysisData: Omit<ConversationAnalysis, 'id' | 'session_id' | 'created_at'>
): Promise<ConversationAnalysis> => {
  const { data, error } = await supabase
    .from('conversation_analysis')
    .insert({
      session_id: sessionId,
      ...analysisData
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getSessionAnalysis = async (sessionId: string): Promise<ConversationAnalysis | null> => {
  const { data, error } = await supabase
    .from('conversation_analysis')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
  return data;
};

// Report management functions
export const saveSessionReport = async (
  sessionId: string,
  reportData: any
): Promise<SessionReport> => {
  const { data, error } = await supabase
    .from('session_reports')
    .insert({
      session_id: sessionId,
      report_data: reportData
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const markReportEmailSent = async (reportId: string): Promise<void> => {
  const { error } = await supabase
    .from('session_reports')
    .update({
      email_sent: true,
      email_sent_at: new Date().toISOString()
    })
    .eq('id', reportId);

  if (error) throw error;
};

export const getSessionReport = async (sessionId: string): Promise<SessionReport | null> => {
  const { data, error } = await supabase
    .from('session_reports')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// Company management functions
export const createCompany = async (
  userId: string,
  companyData: Omit<Company, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Company> => {
  const { data, error } = await supabase
    .from('companies')
    .insert({
      user_id: userId,
      ...companyData
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserCompany = async (userId: string): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const updateCompany = async (
  companyId: string,
  updates: Partial<Omit<Company, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<Company> => {
  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', companyId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Pitch deck management functions
export const getUserPitchDecks = async (userId: string): Promise<PitchDeck[]> => {
  const { data, error } = await supabase
    .from('pitch_decks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updatePitchDeckStatus = async (
  deckId: string,
  status: 'pending' | 'processing' | 'processed' | 'failed'
): Promise<PitchDeck> => {
  const { data, error } = await supabase
    .from('pitch_decks')
    .update({ processing_status: status })
    .eq('id', deckId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Dashboard data aggregation functions
export const getDashboardData = async (userId: string) => {
  try {
    // Fetch all dashboard data in parallel
    const [
      profileResult,
      companyResult,
      pitchDecksResult,
      sessionsResult
    ] = await Promise.allSettled([
      supabase.from('profiles').select('*').eq('user_id', userId).single(),
      supabase.from('companies').select('*').eq('user_id', userId).single(),
      getUserPitchDecks(userId),
      getUserSessions(userId)
    ]);

    return {
      profile: profileResult.status === 'fulfilled' ? profileResult.value.data : null,
      company: companyResult.status === 'fulfilled' ? companyResult.value.data : null,
      pitchDecks: pitchDecksResult.status === 'fulfilled' ? pitchDecksResult.value : [],
      sessions: sessionsResult.status === 'fulfilled' ? sessionsResult.value : [],
      errors: {
        profile: profileResult.status === 'rejected' ? profileResult.reason : null,
        company: companyResult.status === 'rejected' ? companyResult.reason : null,
        pitchDecks: pitchDecksResult.status === 'rejected' ? pitchDecksResult.reason : null,
        sessions: sessionsResult.status === 'rejected' ? sessionsResult.reason : null
      }
    };
  } catch (error) {
    throw new Error(`Failed to fetch dashboard data: ${error}`);
  }
};

// Real-time subscription helpers
export const subscribeToSessionUpdates = (
  userId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel('session_updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sessions',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};

export const subscribeToTranscriptUpdates = (
  sessionId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel('transcript_updates')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversation_transcripts',
        filter: `session_id=eq.${sessionId}`
      },
      callback
    )
    .subscribe();
};