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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading your interview session...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-xl font-semibold mb-4">
            Session Error
          </div>
          <div className="text-gray-600 mb-6">{error}</div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                AI Investor Interview
              </h1>
              <p className="text-gray-600">
                AI Investor Pitch Session
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Return to Dashboard
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