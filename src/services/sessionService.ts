import { supabase } from '../lib/supabase';
import { Session } from '../lib/supabase';

export interface SessionProgress {
  totalSessions: number;
  completedSessions: number;
  activeSessions: number;
  failedSessions: number;
  lastSessionDate?: string;
  hasCompletedFirstSession: boolean;
}

export interface SessionStats {
  averageDuration: number;
  successRate: number;
  mostRecentPersona?: string;
  improvementTrend: 'improving' | 'stable' | 'declining' | 'insufficient_data';
}

class SessionService {
  /**
   * Get user's session progress and statistics
   */
  async getUserSessionProgress(userId: string): Promise<SessionProgress> {
    try {
      const { data: sessions, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user sessions:', error);
        return this.getDefaultSessionProgress();
      }

      const totalSessions = sessions?.length || 0;
      const completedSessions = sessions?.filter(s => s.status === 'completed').length || 0;
      const activeSessions = sessions?.filter(s => s.status === 'active').length || 0;
      const failedSessions = sessions?.filter(s => s.status === 'failed').length || 0;
      const lastSession = sessions?.[0];
      const lastSessionDate = lastSession?.completed_at || lastSession?.created_at;
      const hasCompletedFirstSession = completedSessions > 0;

      return {
        totalSessions,
        completedSessions,
        activeSessions,
        failedSessions,
        lastSessionDate,
        hasCompletedFirstSession
      };

    } catch (error) {
      console.error('Error getting user session progress:', error);
      return this.getDefaultSessionProgress();
    }
  }

  /**
   * Get detailed session statistics for analytics
   */
  async getUserSessionStats(userId: string): Promise<SessionStats> {
    try {
      const { data: sessions, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error || !sessions || sessions.length === 0) {
        return this.getDefaultSessionStats();
      }

      // Calculate average duration
      const sessionsWithDuration = sessions.filter(s => s.duration_minutes);
      const averageDuration = sessionsWithDuration.length > 0
        ? sessionsWithDuration.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / sessionsWithDuration.length
        : 0;

      // Calculate success rate (completed vs total)
      const { data: allSessions } = await supabase
        .from('sessions')
        .select('status')
        .eq('user_id', userId);

      const totalAttempts = allSessions?.length || 0;
      const successRate = totalAttempts > 0 ? (sessions.length / totalAttempts) * 100 : 0;

      // Get most recent persona
      const mostRecentPersona = sessions[0]?.tavus_persona_id;

      // Determine improvement trend (simplified)
      let improvementTrend: SessionStats['improvementTrend'] = 'insufficient_data';
      if (sessions.length >= 3) {
        // Simple trend based on session frequency
        const recentSessions = sessions.slice(0, 3);
        const olderSessions = sessions.slice(3, 6);
        
        if (recentSessions.length > olderSessions.length) {
          improvementTrend = 'improving';
        } else if (recentSessions.length === olderSessions.length) {
          improvementTrend = 'stable';
        } else {
          improvementTrend = 'declining';
        }
      }

      return {
        averageDuration,
        successRate,
        mostRecentPersona,
        improvementTrend
      };

    } catch (error) {
      console.error('Error getting user session stats:', error);
      return this.getDefaultSessionStats();
    }
  }

  /**
   * Check if user can start a new conversation
   */
  async canStartNewConversation(userId: string): Promise<{
    canStart: boolean;
    reason?: string;
    activeSessionId?: string;
  }> {
    try {
      // Check for active sessions
      const { data: activeSessions, error } = await supabase
        .from('sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) {
        return { canStart: false, reason: 'Error checking session status' };
      }

      if (activeSessions && activeSessions.length > 0) {
        return {
          canStart: false,
          reason: 'You have an active conversation in progress',
          activeSessionId: activeSessions[0].id
        };
      }

      // Check prerequisites (company and processed deck)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { canStart: false, reason: 'User not authenticated' };
      }

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!company) {
        return { canStart: false, reason: 'Company profile not complete' };
      }

      const { data: processedDeck } = await supabase
        .from('pitch_decks')
        .select('id')
        .eq('user_id', userId)
        .eq('processing_status', 'processed')
        .limit(1)
        .single();

      if (!processedDeck) {
        return { canStart: false, reason: 'No processed pitch deck available' };
      }

      return { canStart: true };

    } catch (error) {
      console.error('Error checking conversation eligibility:', error);
      return { canStart: false, reason: 'Error checking prerequisites' };
    }
  }

  /**
   * Create a new session record
   */
  async createSession(params: {
    userId: string;
    companyId: string;
    pitchDeckId?: string;
    personaType: 'angel' | 'vc';
  }): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    try {
      const { data: session, error } = await supabase
        .from('sessions')
        .insert({
          user_id: params.userId,
          company_id: params.companyId,
          pitch_deck_id: params.pitchDeckId,
          tavus_persona_id: params.personaType,
          status: 'created'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        return { success: false, error: error.message };
      }

      return { success: true, sessionId: session.id };

    } catch (error) {
      console.error('Error creating session:', error);
      return { success: false, error: 'Failed to create session' };
    }
  }

  /**
   * Update session status and metadata
   */
  async updateSession(sessionId: string, updates: Partial<Session>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sessions')
        .update(updates)
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating session:', error);
        return false;
      }

      return true;

    } catch (error) {
      console.error('Error updating session:', error);
      return false;
    }
  }

  /**
   * Get session by ID with related data
   */
  async getSessionById(sessionId: string): Promise<Session | null> {
    try {
      const { data: session, error } = await supabase
        .from('sessions')
        .select(`
          *,
          companies(*),
          pitch_decks(*)
        `)
        .eq('id', sessionId)
        .single();

      if (error) {
        console.error('Error fetching session:', error);
        return null;
      }

      return session;

    } catch (error) {
      console.error('Error getting session by ID:', error);
      return null;
    }
  }

  /**
   * Get user's recent sessions
   */
  async getRecentSessions(userId: string, limit: number = 10): Promise<Session[]> {
    try {
      const { data: sessions, error } = await supabase
        .from('sessions')
        .select(`
          *,
          companies(*),
          pitch_decks(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent sessions:', error);
        return [];
      }

      return sessions || [];

    } catch (error) {
      console.error('Error getting recent sessions:', error);
      return [];
    }
  }

  /**
   * Mark session as started
   */
  async markSessionStarted(sessionId: string): Promise<boolean> {
    return this.updateSession(sessionId, {
      status: 'active',
      started_at: new Date().toISOString()
    });
  }

  /**
   * Mark session as completed
   */
  async markSessionCompleted(sessionId: string, durationMinutes?: number): Promise<boolean> {
    return this.updateSession(sessionId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      duration_minutes: durationMinutes
    });
  }

  /**
   * Mark session as failed
   */
  async markSessionFailed(sessionId: string, error?: string): Promise<boolean> {
    return this.updateSession(sessionId, {
      status: 'failed',
      completed_at: new Date().toISOString()
    });
  }

  private getDefaultSessionProgress(): SessionProgress {
    return {
      totalSessions: 0,
      completedSessions: 0,
      activeSessions: 0,
      failedSessions: 0,
      hasCompletedFirstSession: false
    };
  }

  private getDefaultSessionStats(): SessionStats {
    return {
      averageDuration: 0,
      successRate: 0,
      improvementTrend: 'insufficient_data'
    };
  }
}

export const sessionService = new SessionService();