import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useUserFlow } from '../contexts/UserFlowContext.tsx';
import TavusAgentIntro from '../components/TavusAgentIntro.tsx';
import WelcomeSection from '../components/dashboard/WelcomeSection.tsx';
import UploadedDecksSection from '../components/dashboard/UploadedDecksSection.tsx';
import CompanyDetailsSection from '../components/dashboard/CompanyDetailsSection.tsx';
import SessionHistorySection from '../components/dashboard/SessionHistorySection.tsx';
import { AlertCircle, Zap, Plus, MessageSquare } from 'lucide-react';
import { ClipLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';
import { DashboardState, Session } from '../types/dashboard';

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { refreshSteps, markStepComplete, getNextIncompleteStep } = useUserFlow();
  const navigate = useNavigate();

  const [dashboardState, setDashboardState] = useState<DashboardState>({
    user: null,
    profile: null,
    company: null,
    pitchDecks: [],
    sessions: [],
    loading: true,
    error: null,
    isFirstTimeUser: false
  });
  const [showAgentIntro, setShowAgentIntro] = useState(false);

  // Fetch all dashboard data
  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setDashboardState(prev => ({ ...prev, loading: true }));
    
    try {
      // Fetch user profile and company data
      const [companyRes, profileRes] = await Promise.all([
        supabase.from('companies').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      ]);

      if (companyRes.error) throw companyRes.error;
      if (profileRes.error) throw profileRes.error;

      if (!companyRes.data || !profileRes.data) {
        navigate('/onboarding');
        return;
      }

      // Fetch pitch decks
      const { data: pitchDecks, error: pitchError } = await supabase
        .from('pitches')
        .select('*')
        .eq('company_id', companyRes.data.id)
        .order('created_at', { ascending: false });

      if (pitchError) {
        console.error('Error fetching pitch decks:', pitchError);
      }

      // Fetch sessions (mock data for now since sessions table might not exist yet)
      const sessions: Session[] = [];

      // Check if this is a first-time user
      const justCompletedOnboarding = localStorage.getItem(`just_completed_onboarding_${user.id}`) === 'true';
      const isFirstTime = justCompletedOnboarding || sessions.length === 0;
      
      if (justCompletedOnboarding) {
        setShowAgentIntro(true);
        localStorage.removeItem(`just_completed_onboarding_${user.id}`);
      }

      setDashboardState({
        user,
        profile: profileRes.data,
        company: companyRes.data,
        pitchDecks: pitchDecks || [],
        sessions,
        loading: false,
        error: null,
        isFirstTimeUser: isFirstTime
      });
      
      await refreshSteps();
    } catch (err: any) {
      setDashboardState(prev => ({
        ...prev,
        loading: false,
        error: err.message
      }));
      console.error("Error fetching dashboard data:", err);
    }
  }, [user, navigate, refreshSteps]);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, fetchData]);

  // Event handlers
  const handleAgentIntroComplete = async () => {
    setShowAgentIntro(false);
    await markStepComplete('agent_intro');
  };

  const handleShowAgentIntro = () => {
    setShowAgentIntro(true);
  };

  const handleViewDeck = (deckId: string) => {
    console.log('View deck:', deckId);
    // TODO: Navigate to deck view page
  };

  const handleUploadNew = () => {
    navigate('/upload');
  };

  const handleEditCompany = () => {
    navigate('/onboarding');
  };

  const handleViewSession = (sessionId: string) => {
    console.log('View session:', sessionId);
    // TODO: Navigate to session view page
  };

  const handleStartNewSession = () => {
    navigate('/setup');
  };

  const handleStartConversation = () => {
    navigate('/setup');
  };

  // Loading state
  if (dashboardState.loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="glass rounded-2xl p-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <ClipLoader color="#6366f1" size={32} className="mx-auto mb-4" />
          <p className="text-white">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (dashboardState.error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <motion.div
          className="glass rounded-2xl p-8 text-center max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 font-semibold text-lg mb-2">An Error Occurred</p>
          <p className="text-slate-400 text-sm">{dashboardState.error}</p>
        </motion.div>
      </div>
    );
  }

  const { profile, company, pitchDecks, sessions, isFirstTimeUser } = dashboardState;
  const nextStep = getNextIncompleteStep();
  const shouldShowAgentIntroPrompt = nextStep?.id === 'agent_intro' && !showAgentIntro;
  const hasProcessedDecks = pitchDecks.some(deck => deck.status === 'processed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Tavus Introduction Modal */}
      {showAgentIntro && profile && (
        <TavusAgentIntro
          userName={profile.full_name || 'Founder'}
          companyName={company?.name}
          isFirstTime={isFirstTimeUser}
          onComplete={handleAgentIntroComplete}
          onSkip={() => setShowAgentIntro(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <WelcomeSection
          userName={profile?.full_name || 'Founder'}
          companyName={company?.name || 'Your Company'}
          isFirstTime={isFirstTimeUser}
        />

        {/* Agent Introduction Prompt for First-Time Users */}
        {shouldShowAgentIntroPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="glass rounded-2xl p-6 border border-indigo-500/30 bg-indigo-500/5">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-3">Meet Your AI Investor</h3>
                <p className="text-slate-300 mb-6">
                  Before we begin, let Rohan introduce himself and explain how he can help you raise capital faster.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShowAgentIntro}
                  className="btn-primary"
                >
                  Meet Rohan Vyas
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Talk to AI Section for First-Time Users */}
        {isFirstTimeUser && hasProcessedDecks && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <div className="glass rounded-2xl p-8 border border-green-500/30 bg-green-500/5 text-center">
              <Zap className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Talk to AI?</h2>
              <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                Your pitch deck has been analyzed. Now it's time to practice with Rohan and get real investor feedback.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartConversation}
                className="btn-primary text-lg px-8 py-3"
              >
                Start AI Conversation
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Uploaded Decks Section */}
            <UploadedDecksSection
              decks={pitchDecks}
              onViewDeck={handleViewDeck}
              onUploadNew={handleUploadNew}
            />

            {/* Session History Section */}
            <SessionHistorySection
              sessions={sessions}
              onViewSession={handleViewSession}
              onStartNew={handleStartNewSession}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Company Details Section */}
            {company && profile && (
              <CompanyDetailsSection
                company={company}
                profile={profile}
                onEdit={handleEditCompany}
              />
            )}

            {/* Quick Actions Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="glass rounded-2xl p-6 border border-slate-700/30"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShowAgentIntro}
                  className="w-full btn-secondary text-sm justify-start"
                >
                  Meet Rohan Again
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUploadNew}
                  className="w-full btn-secondary text-sm justify-start flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Upload New Deck
                </motion.button>
                {hasProcessedDecks && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartNewSession}
                    className="w-full btn-primary text-sm justify-start flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Start Q&A Session
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
