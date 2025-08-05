import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SimpleAIConversation } from '../components/SimpleAIConversation';
import { supabase } from '../lib/supabase';

interface ConversationSession {
  id: string;
  founder_name: string;
  status: string;
  created_at: string;
  company_name?: string;
}

export const ConversationPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<ConversationSession | null>(null);
  const [conversationUrl, setConversationUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      // Get session details
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        throw new Error(`Failed to load session: ${sessionError.message}`);
      }

      setSession(sessionData);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
      setLoading(false);
    }
  };

  const handleConversationEnd = () => {
    navigate('/dashboard');
  };

  const handleConversationError = (error: any) => {
    setError('Conversation encountered an error');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center glass rounded-xl p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-400 mx-auto mb-6"></div>
          <div className="text-white text-lg font-medium">Loading your interview session...</div>
          <div className="text-slate-300 text-sm mt-2">Please wait while we prepare your AI investor meeting</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-lg glass rounded-xl p-8">
          <div className="text-red-400 text-2xl font-bold mb-4">
            ⚠️ Session Error
          </div>
          <div className="text-white mb-6 leading-relaxed">{error}</div>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 font-medium transition-colors"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => navigate('/setup-session')}
              className="w-full px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 font-medium transition-colors"
            >
              Create New Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="glass border-b border-slate-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">
                AI Investor Interview
              </h1>
              <p className="text-slate-300 mt-1">
                Present your startup to our AI investor
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 text-slate-300 hover:text-white border border-slate-600 rounded-xl hover:bg-slate-800/50 font-medium transition-colors"
            >
              ← Return to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {session && (
          <SimpleAIConversation
            sessionId={session.id}
            founderName={session.founder_name}
            onConversationEnd={handleConversationEnd}
          />
        )}
      </div>
    </div>
  );
};