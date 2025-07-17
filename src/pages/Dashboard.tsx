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
import TalkToAISection from '../components/dashboard/TalkToAISection.tsx';
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
      const { data: pitchDecksRaw, error: pitchError } = await supabase
        .from('pitches')
        .select('*')
        .eq('company_id', companyRes.data.id)
        .order('created_at', { ascending: false });

      // Map the data to match PitchDeck interface
      const pitchDecks = (pitchDecksRaw || []).map(deck => ({
        ...deck,
        deck_name: `Pitch Deck #${deck.id.slice(-8)}`,
        processing_status: deck.status,
        user_id: user.id
      }));

      if (pitchError) {
        console.error('Error fetching pitch decks:', pitchError);
      }

      // Fetch sessions (mock data for now since sessions table might not exist yet)
      const sessions: Session[] = [];

      // Check if this is a first-time user
      const isFirstTime = sessions.length === 0;

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
  const hasProcessedDecks = pitchDecks.some(deck => deck.processing_status === 'processed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

      <div className="container mx-auto px-4 py-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Welcome Section */}
            <WelcomeSection
              userName={profile?.full_name || 'Founder'}
              companyName={company?.name || 'Your Company'}
              isFirstTime={isFirstTimeUser}
            />

            {/* Uploaded Decks Section */}
            <UploadedDecksSection
              decks={pitchDecks}
              onViewDeck={handleViewDeck}
              onUploadNew={handleUploadNew}
            />

            {/* Talk to AI Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <TalkToAISection
                isFirstTime={isFirstTimeUser}
                hasProcessedDeck={hasProcessedDecks}
                onStartConversation={handleStartConversation}
              />
            </motion.div>
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

            {/* Session History Section */}
            <SessionHistorySection
              sessions={sessions}
              onViewSession={handleViewSession}
              onStartNew={handleStartNewSession}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
