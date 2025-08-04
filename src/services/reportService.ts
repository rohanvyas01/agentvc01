import { supabase } from '../lib/supabase';
import { SessionReport, Session, ConversationAnalysis, ConversationTranscript } from '../lib/supabase';

export interface ReportGenerationOptions {
  includeTranscript?: boolean;
  includeAnalysis?: boolean;
  includeRecommendations?: boolean;
  format?: 'json' | 'pdf' | 'html';
}

export interface EmailReportOptions {
  recipientEmail?: string;
  subject?: string;
  includeAttachment?: boolean;
}

export interface ReportError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Generate a comprehensive session report
 */
export async function generateSessionReport(
  sessionId: string,
  options: ReportGenerationOptions = {}
): Promise<{ data: SessionReport | null; error?: ReportError }> {
  try {
    const {
      includeTranscript = true,
      includeAnalysis = true,
      includeRecommendations = true,
      format = 'json'
    } = options;

    // Check if report already exists
    const { data: existingReport } = await supabase
      .from('session_reports')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (existingReport) {
      return { data: existingReport };
    }

    // Get session data with related information
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        *,
        companies(*),
        pitch_decks(id, deck_name, file_type),
        conversation_transcripts(*),
        conversation_analysis(*)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !sessionData) {
      return {
        data: null,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: `Session ${sessionId} not found`,
          details: sessionError
        }
      };
    }

    const analysis = sessionData.conversation_analysis?.[0];
    const transcripts = sessionData.conversation_transcripts || [];

    // Build comprehensive report data
    const reportData = {
      session_id: sessionId,
      generated_at: new Date().toISOString(),
      format,
      summary: {
        session_date: sessionData.created_at,
        duration_minutes: sessionData.duration_minutes || 0,
        overall_score: analysis?.overall_score || 0,
        status: sessionData.status,
        company_name: sessionData.companies?.name || 'Unknown Company',
        pitch_deck_name: sessionData.pitch_decks?.deck_name || 'No Deck'
      },
      ...(includeTranscript && {
        transcript: transcripts.map((t: ConversationTranscript) => ({
          speaker: t.speaker,
          content: t.content,
          timestamp_ms: t.timestamp_ms,
          formatted_time: formatTimestamp(t.timestamp_ms)
        }))
      }),
      ...(includeAnalysis && analysis && {
        analysis: {
          key_strengths: analysis.key_strengths,
          improvement_areas: analysis.improvement_areas,
          detailed_feedback: analysis.gemini_analysis?.detailed_feedback,
          investor_concerns: analysis.gemini_analysis?.investor_concerns,
          pitch_effectiveness: analysis.gemini_analysis?.pitch_effectiveness,
          overall_score: analysis.overall_score
        }
      }),
      ...(includeRecommendations && analysis && {
        recommendations: analysis.improvement_areas.map((area: string) => 
          `Focus on improving: ${area}`
        ),
        next_steps: [
          "Review the detailed feedback and focus on key improvement areas",
          "Practice addressing the investor concerns identified",
          "Consider the follow-up questions for future preparation",
          ...(analysis.follow_up_questions?.length > 0 ? 
            ["Schedule another practice session to work on specific areas"] : [])
        ],
        follow_up_questions: analysis.follow_up_questions || []
      }),
      metadata: {
        transcript_segments: transcripts.length,
        has_analysis: !!analysis,
        generation_timestamp: new Date().toISOString(),
        report_version: '1.0'
      }
    };

    // Store the report
    const { data: savedReport, error: saveError } = await supabase
      .from('session_reports')
      .insert({
        session_id: sessionId,
        report_data: reportData,
        email_sent: false
      })
      .select()
      .single();

    if (saveError) {
      return {
        data: null,
        error: {
          code: 'REPORT_SAVE_FAILED',
          message: 'Failed to save session report',
          details: saveError
        }
      };
    }

    return { data: savedReport };

  } catch (error) {
    console.error('Error generating session report:', error);
    return {
      data: null,
      error: {
        code: 'REPORT_GENERATION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      }
    };
  }
}

/**
 * Get session report with optional regeneration
 */
export async function getSessionReport(
  sessionId: string,
  forceRegenerate: boolean = false
): Promise<{ data: SessionReport | null; error?: ReportError }> {
  try {
    if (!forceRegenerate) {
      // Try to get existing report first
      const { data: existingReport, error: fetchError } = await supabase
        .from('session_reports')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (existingReport) {
        return { data: existingReport };
      }

      if (fetchError && fetchError.code !== 'PGRST116') {
        return {
          data: null,
          error: {
            code: 'REPORT_FETCH_FAILED',
            message: 'Failed to fetch existing report',
            details: fetchError
          }
        };
      }
    }

    // Generate new report if none exists or forced regeneration
    return await generateSessionReport(sessionId);

  } catch (error) {
    console.error('Error getting session report:', error);
    return {
      data: null,
      error: {
        code: 'REPORT_GET_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      }
    };
  }
}

/**
 * Email session report to user
 */
export async function emailSessionReport(
  sessionId: string,
  options: EmailReportOptions = {}
): Promise<{ success: boolean; error?: ReportError }> {
  try {
    // Get or generate report
    const { data: report, error: reportError } = await getSessionReport(sessionId);

    if (reportError || !report) {
      return {
        success: false,
        error: reportError || {
          code: 'REPORT_NOT_FOUND',
          message: 'Session report not found'
        }
      };
    }

    // Call email sending Edge Function
    const { data, error } = await supabase.functions.invoke('send-session-report', {
      body: {
        session_id: sessionId,
        report_id: report.id,
        recipient_email: options.recipientEmail,
        subject: options.subject || `Your Session Report - ${new Date(report.created_at).toLocaleDateString()}`,
        include_attachment: options.includeAttachment || false
      }
    });

    if (error) {
      return {
        success: false,
        error: {
          code: 'EMAIL_SEND_FAILED',
          message: error.message || 'Failed to send email',
          details: error
        }
      };
    }

    // Mark report as emailed
    await supabase
      .from('session_reports')
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString()
      })
      .eq('id', report.id);

    return { success: true };

  } catch (error) {
    console.error('Error emailing session report:', error);
    return {
      success: false,
      error: {
        code: 'EMAIL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      }
    };
  }
}

/**
 * Export session report as PDF
 */
export async function exportReportAsPDF(
  sessionId: string
): Promise<{ data: Blob | null; error?: ReportError }> {
  try {
    // Get report data
    const { data: report, error: reportError } = await getSessionReport(sessionId);

    if (reportError || !report) {
      return {
        data: null,
        error: reportError || {
          code: 'REPORT_NOT_FOUND',
          message: 'Session report not found'
        }
      };
    }

    // Call PDF generation Edge Function
    const { data, error } = await supabase.functions.invoke('generate-report-pdf', {
      body: {
        session_id: sessionId,
        report_data: report.report_data
      }
    });

    if (error) {
      return {
        data: null,
        error: {
          code: 'PDF_GENERATION_FAILED',
          message: error.message || 'Failed to generate PDF',
          details: error
        }
      };
    }

    // Convert response to blob
    const pdfBlob = new Blob([data], { type: 'application/pdf' });
    return { data: pdfBlob };

  } catch (error) {
    console.error('Error exporting report as PDF:', error);
    return {
      data: null,
      error: {
        code: 'PDF_EXPORT_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      }
    };
  }
}

/**
 * Get all reports for a user
 */
export async function getUserReports(
  userId: string
): Promise<{ data: SessionReport[]; error?: ReportError }> {
  try {
    const { data, error } = await supabase
      .from('session_reports')
      .select(`
        *,
        sessions!inner(
          user_id,
          created_at,
          status,
          duration_minutes,
          companies(name),
          pitch_decks(deck_name)
        )
      `)
      .eq('sessions.user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return {
        data: [],
        error: {
          code: 'USER_REPORTS_FETCH_FAILED',
          message: 'Failed to fetch user reports',
          details: error
        }
      };
    }

    return { data: data || [] };

  } catch (error) {
    console.error('Error getting user reports:', error);
    return {
      data: [],
      error: {
        code: 'USER_REPORTS_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      }
    };
  }
}

/**
 * Delete session report
 */
export async function deleteSessionReport(
  reportId: string
): Promise<{ success: boolean; error?: ReportError }> {
  try {
    const { error } = await supabase
      .from('session_reports')
      .delete()
      .eq('id', reportId);

    if (error) {
      return {
        success: false,
        error: {
          code: 'REPORT_DELETE_FAILED',
          message: 'Failed to delete report',
          details: error
        }
      };
    }

    return { success: true };

  } catch (error) {
    console.error('Error deleting session report:', error);
    return {
      success: false,
      error: {
        code: 'REPORT_DELETE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      }
    };
  }
}

/**
 * Subscribe to report updates
 */
export function subscribeToReportUpdates(
  sessionId: string,
  onReportReady: (report: SessionReport) => void,
  onError?: (error: ReportError) => void
) {
  const subscription = supabase
    .channel(`report-${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'session_reports',
        filter: `session_id=eq.${sessionId}`
      },
      (payload) => {
        onReportReady(payload.new as SessionReport);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'session_reports',
        filter: `session_id=eq.${sessionId}`
      },
      (payload) => {
        onReportReady(payload.new as SessionReport);
      }
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        console.error('Error subscribing to report updates');
        onError?.({
          code: 'SUBSCRIPTION_ERROR',
          message: 'Failed to subscribe to report updates'
        });
      }
    });

  return subscription;
}

// Helper functions
function formatTimestamp(timestampMs: number): string {
  const minutes = Math.floor(timestampMs / 60000);
  const seconds = Math.floor((timestampMs % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}