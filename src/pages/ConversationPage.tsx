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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <div className="text-gray-700 text-lg font-medium">Loading your interview session...</div>
          <div className="text-gray-500 text-sm mt-2">Please wait while we prepare your AI investor meeting</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-lg bg-white rounded-xl shadow-lg p-8">
          <div className="text-red-500 text-2xl font-bold mb-4">
            ⚠️ Session Error
          </div>
          <div className="text-gray-700 mb-6 leading-relaxed">{error}</div>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => navigate('/setup-session')}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium transition-colors"
            >
              Create New Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                AI Investor Interview
              </h1>
              <p className="text-gray-600 mt-1">
                Present your startup to our AI investor
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors"
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