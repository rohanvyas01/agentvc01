import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MessageSquare, Building2, FileText, Zap, Plus } from 'lucide-react';
import { ConversationSessionHistory } from '../components/ConversationSessionHistory';

interface DashboardData {
  profile: any;
  company: any;
  pitchDecks: any[];
  sessions: any[];
}

const WorkingDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData>({
    profile: null,
    company: null,
    pitchDecks: [],
    sessions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Load profile (don't throw on error)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        // Profile error - will use fallback
      }

      // Load company (don't throw on error)
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (companyError) {
        // Company error - will use fallback
      }

      // Load pitch decks (don't throw on error)
      const { data: pitchDecks, error: pitchDecksError } = await supabase
        .from('pitch_decks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (pitchDecksError) {
        console.log('Pitch decks error:', pitchDecksError);
        // Pitch decks error - will use fallback
      }

      // Load sessions (don't throw on error)
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (sessionsError) {
        // Sessions error - will use fallback
      }

      setData({
        profile: profile || null,
        company: company || null,
        pitchDecks: pitchDecks || [],
        sessions: sessions || []
      });

    } catch (err: any) {
      console.error('Dashboard error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePitchToRohan = () => {
    // Navigate to the setup session page
    navigate('/setup');
  };

  const handleStartFirstSession = () => {
    // Same as Pitch to Rohan
    navigate('/setup');
  };

  const handleEditCompany = () => {
    navigate('/onboarding');
  };

  const handleViewSession = (sessionId: string) => {
    // Navigate to the conversation page to view/replay the session
    navigate(`/conversation/${sessionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto mb-4"></div>
          <p className="text-white">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md">
            <p className="text-red-400 mb-4">Error loading dashboard:</p>
            <p className="text-red-300 text-sm">{error}</p>
            <button 
              onClick={loadDashboardData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { profile, company, pitchDecks, sessions } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/30"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-lg flex items-center justify-center border border-indigo-500/30">
                  <MessageSquare className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Hello, {profile?.full_name || 'Founder'}! 👋
                  </h1>
                  <p className="text-slate-400">Welcome to {company?.name || 'your startup'}</p>
                </div>
              </div>
              

            </motion.div>

            {/* Uploaded Decks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/30"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-400" />
                  Uploaded Decks ({pitchDecks.length})
                </h2>
              </div>
              
              {pitchDecks.length > 0 ? (
                <div className="space-y-3">
                  {pitchDecks.map((deck) => (
                    <div key={deck.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">{deck.deck_name || `Pitch Deck #${deck.id.slice(-8)}`}</h3>
                          <p className="text-slate-400 text-sm">
                            Status: {sessions.some(s => s.status === 'analysis') ? (
                              <span className="text-yellow-400 animate-pulse">Analysis in Progress</span>
                            ) : (
                              <span className="text-green-400">Uploaded</span>
                            )}
                          </p>
                          <p className="text-slate-400 text-xs">
                            Uploaded: {new Date(deck.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-slate-400 text-xs">
                            Size: {(deck.file_size / 1024 / 1024).toFixed(1)} MB
                          </p>
                        </div>
                        <div className="text-green-400">
                          <FileText className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => navigate('/upload')}
                    className="w-full bg-slate-700/30 border-2 border-dashed border-slate-600 rounded-lg p-4 text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Upload Another Deck
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">No pitch decks uploaded yet</p>
                  <button
                    onClick={() => navigate('/upload')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Upload First Deck
                  </button>
                </div>
              )}
            </motion.div>

            {/* Pitch to Rohan */}
            {pitchDecks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-indigo-500/10 to-purple-600/10 rounded-2xl p-6 border border-indigo-500/30"
              >
                <div className="text-center">
                  <Zap className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-4">Ready to Pitch to Rohan?</h2>
                  <p className="text-slate-300 mb-6">
                    Your pitch deck is ready. Start practicing with our AI investor.
                  </p>
                  <button 
                    onClick={handlePitchToRohan}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 mx-auto"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Pitch to Rohan
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Company Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/30 cursor-pointer hover:bg-slate-800/70 transition-colors"
              onClick={handleEditCompany}
            >
              <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
                <Building2 className="w-5 h-5 text-blue-400" />
                Company Details
              </h2>
              
              {company ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-slate-400 text-sm">Company Name</p>
                    <p className="text-white font-medium">{company.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Industry</p>
                    <p className="text-white">{company.industry}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Stage</p>
                    <p className="text-white">{company.stage}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Funding Round</p>
                    <p className="text-white">{company.funding_round}</p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">No company information available</p>
              )}
            </motion.div>

            {/* Conversation Session History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ConversationSessionHistory />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingDashboard;