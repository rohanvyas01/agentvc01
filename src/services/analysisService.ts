import { supabase } from '../lib/supabase';

export interface ConversationAnalysis {
  id: string;
  session_id: string;
  gemini_analysis: {
    detailed_feedback: string;
    investor_concerns: string[];
    pitch_effectiveness: string;
    analysis_id: string;
    generated_at: string;
  };
  key_strengths: string[];
  improvement_areas: string[];
  follow_up_questions: string[];
  overall_score: number;
  created_at: string;
}

export interface SessionReport {
  id: string;
  session_id: string;
  report_data: {
    session_id: string;
    generated_at: string;
    summary: {
      session_date: string;
      duration_minutes: number;
      overall_score: number;
      status: string;
    };
    transcript: Array<{
      speaker: 'founder' | 'investor';
      content: string;
      timestamp_ms: number;
    }>;
    analysis: {
      key_strengths: string[];
      improvement_areas: string[];
      detailed_feedback: string;
      investor_concerns: string[];
      pitch_effectiveness: string;
    };
    recommendations: string[];
    next_steps: string[];
    follow_up_questions: string[];
  };
  email_sent: boolean;
  email_sent_at?: string;
  created_at: string;
}

export interface AnalysisError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Trigger analysis for a completed conversation session
 */
export async function triggerConversationAnalysis(sessionId: string): Promise<{ success: boolean; error?: AnalysisError }> {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-conversation', {
      body: { session_id: sessionId }
    });

    if (error) {
      return {
        success: false,
        error: {
          code: 'ANALYSIS_TRIGGER_FAILED',
          message: error.message || 'Failed to trigger conversation analysis',
          details: error
        }
      };
    }

    return { success: true };

  } catch (error) {
    return {
      success: false,
      error: {
        code: 'ANALYSIS_TRIGGER_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      }
    };
  }
}

/**
 * Get analysis results for a session
 */
export async function getSessionAnalysis(sessionId: string): Promise<{ data: ConversationAnalysis | null; error?: AnalysisError }> {
  try {
    const { data, error } = await supabase
      .from('conversation_analysis')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No analysis found - this is expected for sessions that haven't been analyzed yet
        return { data: null };
      }

      return {
        data: null,
        error: {
          code: 'ANALYSIS_FETCH_FAILED',
          message: error.message || 'Failed to fetch session analysis',
          details: error
        }
      };
    }

    return { data };

  } catch (error) {
    return {
      data: null,
      error: {
        code: 'ANALYSIS_FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      }
    };
  }
}

/**
 * Get session report with full details
 */
export async function getSessionReport(sessionId: string): Promise<{ data: SessionReport | null; error?: AnalysisError }> {
  try {
    const { data, error } = await supabase
      .from('session_reports')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No report found - this is expected for sessions that haven't been analyzed yet
        return { data: null };
      }

      return {
        data: null,
        error: {
          code: 'REPORT_FETCH_FAILED',
          message: error.message || 'Failed to fetch session report',
          details: error
        }
      };
    }

    return { data };

  } catch (error) {
    return {
      data: null,
      error: {
        code: 'REPORT_FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      }
    };
  }
}

/**
 * Get all analyses for a user's sessions
 */
export async function getUserSessionAnalyses(userId: string): Promise<{ data: ConversationAnalysis[]; error?: AnalysisError }> {
  try {
    const { data, error } = await supabase
      .from('conversation_analysis')
      .select(`
        *,
        sessions!inner(user_id)
      `)
      .eq('sessions.user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return {
        data: [],
        error: {
          code: 'USER_ANALYSES_FETCH_FAILED',
          message: error.message || 'Failed to fetch user session analyses',
          details: error
        }
      };
    }

    return { data: data || [] };

  } catch (error) {
    return {
      data: [],
      error: {
        code: 'USER_ANALYSES_FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      }
    };
  }
}

/**
 * Check if analysis is available for a session
 */
export async function isAnalysisAvailable(sessionId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('conversation_analysis')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    return !!data;

  } catch (error) {
    return false;
  }
}

/**
 * Subscribe to analysis updates for a session
 */
export function subscribeToAnalysisUpdates(
  sessionId: string,
  onAnalysisComplete: (analysis: ConversationAnalysis) => void,
  onError?: (error: AnalysisError) => void
) {
  const subscription = supabase
    .channel(`analysis-${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversation_analysis',
        filter: `session_id=eq.${sessionId}`
      },
      (payload) => {
        onAnalysisComplete(payload.new as ConversationAnalysis);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversation_analysis',
        filter: `session_id=eq.${sessionId}`
      },
      (payload) => {
        onAnalysisComplete(payload.new as ConversationAnalysis);
      }
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        onError?.({
          code: 'SUBSCRIPTION_ERROR',
          message: 'Failed to subscribe to analysis updates'
        });
      }
    });

  return subscription;
}

/**
 * Get analysis progress/status for a session
 */
export async function getAnalysisStatus(sessionId: string): Promise<{
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  analysis?: ConversationAnalysis;
  error?: AnalysisError;
}> {
  try {
    // Check if analysis exists
    const { data: analysis, error } = await getSessionAnalysis(sessionId);

    if (error) {
      return {
        status: 'failed',
        error
      };
    }

    if (analysis) {
      return {
        status: 'completed',
        analysis
      };
    }

    // Check if session is completed (prerequisite for analysis)
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('status, completed_at')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      return {
        status: 'failed',
        error: {
          code: 'SESSION_FETCH_FAILED',
          message: 'Failed to check session status',
          details: sessionError
        }
      };
    }

    if (session.status !== 'completed') {
      return { status: 'not_started' };
    }

    // Session is completed but no analysis yet - assume in progress
    return { status: 'in_progress' };

  } catch (error) {
    return {
      status: 'failed',
      error: {
        code: 'STATUS_CHECK_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      }
    };
  }
}