import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  BarChart3,
  Calendar
} from 'lucide-react';

interface ConversationSession {
  id: string;
  founder_name: string;
  status: 'start' | 'founder_intro' | 'introduction_complete' | 'mid' | 'pitch_recording' | 'analysis' | 'completed';
  current_question_index: number;
  responses: any[];
  started_at: string;
  completed_at?: string;
  created_at: string;
}

export const ConversationSessionHistory: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;

    try {
      // Try sessions table first (where sessions are actually created)
      let result = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // If sessions table doesn't work, try conversation_sessions
      if (result.error) {
        result = await supabase
          .from('conversation_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
      }

      if (result.error) throw result.error;

      // Map the data to ensure it has all required fields
      const mappedSessions = (result.data || []).map((session: any) => ({
        id: session.id,
        founder_name: session.founder_name || 'Founder',
        status: session.status || 'greeting',
        current_question_index: session.current_question_index || 0,
        responses: session.responses || [],
        started_at: session.started_at || session.created_at,
        completed_at: session.completed_at,
        created_at: session.created_at
      }));

      setSessions(mappedSessions);
    } catch (error) {
      // Error loading sessions - will show empty state
    } finally {
      setLoading(false);
    }
  };

  // Helper function to map session status to conversation status
  const mapSessionStatus = (sessionStatus: string) => {
    switch (sessionStatus) {
      case 'created':
      case 'active':
        return 'questions';
      case 'analysis':
        return 'analysis';
      case 'completed':
        return 'completed';
      case 'failed':
        return 'failed';
      default:
        return 'greeting';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'start':
      case 'founder_intro':
      case 'introduction_complete':
      case 'mid':
      case 'pitch_recording':
        return <Play className="w-4 h-4 text-blue-400" />;
      case 'analysis':
        return <BarChart3 className="w-4 h-4 text-yellow-400 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'start':
        return 'Starting...';
      case 'founder_intro':
        return 'Recording Introduction';
      case 'introduction_complete':
        return 'Introduction Complete';
      case 'mid':
        return 'Pitch Request';
      case 'pitch_recording':
        return 'Recording Pitch';
      case 'analysis':
        return 'Analysis in Progress';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'greeting':
      case 'introduction':
      case 'questions':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'analysis':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'completed':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = (startedAt: string, completedAt?: string) => {
    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return '< 1 min';
    if (diffMins < 60) return `${diffMins} min`;

    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="glass rounded-xl border border-slate-700/30 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">Recent Sessions</h2>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-700/30 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl border border-slate-700/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">Recent Sessions</h2>
        </div>
        {sessions.length > 0 && (
          <span className="text-sm text-slate-400">{sessions.length} sessions</span>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No sessions yet</h3>
          <p className="text-slate-400 mb-4">
            Start your first AI interview session to see your history here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg border border-slate-600/30 hover:border-slate-500/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(session.status)}
                  <div>
                    <h3 className="font-medium text-white">
                      Session with {session.founder_name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(session.started_at)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{getDuration(session.started_at, session.completed_at)}</span>
                      </div>
                      {session.responses.length > 0 && (
                        <span>{session.responses.length} responses</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                    {getStatusText(session.status)}
                  </span>

                  {session.status === 'completed' && (
                    <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                      View Report
                    </button>
                  )}
                </div>
              </div>

              {session.status === 'analysis' && (
                <div className="mt-3 p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                  <div className="flex items-center space-x-2 text-yellow-400">
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-sm font-medium">Analysis in progress...</span>
                  </div>
                  <p className="text-xs text-yellow-300/80 mt-1">
                    Your report will be ready in a couple of hours. Check back soon!
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};