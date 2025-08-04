import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useUserFlow } from '../contexts/UserFlowContext.tsx';
import WelcomeSection from '../components/dashboard/WelcomeSection.tsx';
import UploadedDecksSection from '../components/dashboard/UploadedDecksSection.tsx';
import CompanyDetailsSection from '../components/dashboard/CompanyDetailsSection.tsx';
import SessionHistorySection from '../components/dashboard/SessionHistorySection.tsx';
import TalkToAISection from '../components/dashboard/TalkToAISection.tsx';
import QuickActions from '../components/dashboard/QuickActions.tsx';
import ResponsiveLayout from '../components/dashboard/ResponsiveLayout.tsx';
import MobileNavigation from '../components/dashboard/MobileNavigation.tsx';
import DesktopEnhancements from '../components/dashboard/DesktopEnhancements.tsx';
import ErrorBoundary from '../components/common/ErrorBoundary.tsx';
import DashboardErrorBoundary from '../components/common/DashboardErrorBoundary.tsx';
import { DashboardLoadingState, SectionLoading } from '../components/common/LoadingStates.tsx';
import OfflineIndicator from '../components/common/OfflineIndicator.tsx';
import RealtimeStatus from '../components/common/RealtimeStatus.tsx';
import { AlertCircle, Zap, Plus, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardState } from '../types/dashboard';
import { sessionService } from '../services/sessionService';
import { useQuickActions } from '../hooks/useQuickActions';
import { useNavigationHelpers } from '../utils/navigationHelpers';
import { useResponsive } from '../hooks/useResponsive';
import { useAsyncState } from '../hooks/useAsyncState';
import { useOfflineState, useOfflineCache } from '../hooks/useOfflineState';
import { useErrorHandler } from '../utils/errorHandling';
import { useDashboardRealtime } from '../hooks/useDashboardRealtime';


const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    refreshSteps, 
    userProgress, 
    conversationProgress,
    getRecommendedAction
  } = useUserFlow();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const { handleError } = useErrorHandler();
  
  // Real-time dashboard data with optimistic updates
  const {
    data: dashboardData,
    isLoading,
    error,
    isOptimistic,
    connectionState,
    createSession,
    updateSession,
    deleteSession,
    refresh,
    reconnect,
    connectionMonitor,
  } = useDashboardRealtime();

  const hasProcessedDecks = dashboardData.pitchDecks?.some(deck => deck.processing_status === 'processed') || false;

  // Navigation helpers
  const navigationHelpers = useNavigationHelpers({
    navigate,
    userId: user?.id || '',
    hasProcessedDecks,
    canStartConversation: userProgress.canStartConversation
  });

  // Event handlers
  const handleUploadNew = useCallback(() => {
    navigate('/upload');
  }, [navigate]);

  const handleStartConversation = useCallback(async () => {
    if (!user) return;
    
    try {
      // Check if user can start a new conversation
      const eligibility = await sessionService.canStartNewConversation(user.id);
      
      if (!eligibility.canStart) {
        // Handle cases where user can't start conversation
        if (eligibility.activeSessionId) {
          // Redirect to active session
          navigate(`/conversation/${eligibility.activeSessionId}`);
        } else {
          // Show error or redirect to prerequisites
        }
        return;
      }

      // Create session optimistically
      const sessionData = {
        user_id: user.id,
        company_id: dashboardData.company?.id || '',
        pitch_deck_id: dashboardData.pitchDecks.find(deck => deck.processing_status === 'processed')?.id,
        tavus_persona_id: 'default', // Will be determined by funding round
        status: 'created' as const,
      };

      await createSession(sessionData);
      navigate('/setup');
    } catch (error) {
      const apiError = handleError(error, { 
        component: 'Dashboard', 
        action: 'startConversation' 
      });
      console.error('Failed to start conversation:', apiError);
    }
  }, [user, navigate, handleError, createSession, dashboardData]);

  // Quick actions configuration
  const { quickActions, getContextualActions } = useQuickActions({
    userId: user?.id || '',
    isFirstTime: userProgress.isFirstTimeUser,
    hasProcessedDecks,
    canStartConversation: userProgress.canStartConversation,
    hasActiveSessions: dashboardData.sessions?.some(session => session.status === 'active') || false,
    totalSessions: dashboardData.sessions?.length || 0,
    onUploadNew: handleUploadNew,
    onStartConversation: handleStartConversation
  });
  // Refresh user flow when dashboard data changes
  useEffect(() => {
    if (dashboardData.profile && dashboardData.company) {
      refreshSteps();
    }
  }, [dashboardData.profile, dashboardData.company, refreshSteps]);

  // Additional event handlers
  const handleViewDeck = useCallback((deckId: string) => {
    // TODO: Navigate to deck view page
  }, []);

  const handleEditCompany = useCallback(() => {
    navigate('/onboarding');
  }, [navigate]);

  const handleViewSession = useCallback((sessionId: string) => {
    // TODO: Navigate to session view page
  }, []);

  const handleStartNewSession = useCallback(() => {
    navigate('/setup');
  }, [navigate]);

  const handleRetryFetch = useCallback(() => {
    refresh();
  }, [refresh]);



  // Loading state
  if (isLoading || authLoading) {
    return <DashboardLoadingState />;
  }

  // Error state with retry functionality
  if (error && !dashboardData.profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <OfflineIndicator onRetry={handleRetryFetch} />
        <div className="min-h-screen flex items-center justify-center text-center p-4">
          <motion.div
            className="glass rounded-2xl p-8 text-center max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-red-400 font-semibold text-lg mb-2">
              {connectionMonitor.isOnline ? 'Dashboard Error' : 'Connection Error'}
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              {connectionMonitor.isOnline 
                ? error.message
                : 'Unable to load dashboard while offline. Please check your connection.'
              }
            </p>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRetryFetch}
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Retrying...' : 'Try Again'}
              </button>
              <button
                onClick={() => navigate('/onboarding')}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Go to Setup
              </button>
            </div>

            {connectionMonitor.reconnectAttempts > 0 && (
              <p className="text-xs text-slate-500 mt-3">
                Reconnection attempt {connectionMonitor.reconnectAttempts} of 5
              </p>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  const { profile, company, pitchDecks, sessions } = dashboardData;

  // Adapt dashboard layout based on user progress
  const showWelcomeSection = true; // Always show welcome
  const showUploadedDecks = pitchDecks.length > 0 || userProgress.canStartConversation;
  const showTalkToAI = userProgress.canStartConversation;
  const showSessionHistory = userProgress.isReturningUser || sessions.length > 0;
  const showCompanyDetails = !!(company && profile);

  // Determine primary call-to-action based on user state
  const primaryAction = getRecommendedAction();

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Dashboard Error Boundary:', error, errorInfo);
      }}
    >

      <DesktopEnhancements>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          {/* Offline Indicator */}
          <OfflineIndicator onRetry={handleRetryFetch} />
          
          {/* Mobile Navigation */}
          {isMobile && <MobileNavigation />}
          
          <div className={`container mx-auto px-4 py-8 ${isMobile ? 'px-3 py-4 pb-20' : ''}`}>
          {/* Real-time Status Indicator */}
          <div className="mb-4 flex justify-between items-center">
            <div></div> {/* Spacer */}
            <RealtimeStatus
              isConnected={connectionState.isConnected}
              isReconnecting={connectionState.isReconnecting}
              isOptimistic={isOptimistic}
              lastSync={connectionState.lastSync}
              connectionQuality={connectionMonitor.connectionQuality}
              pendingUpdates={0} // Could be enhanced to show actual pending count
              onReconnect={reconnect}
              showDetails={!isMobile}
              className="text-xs"
            />
          </div>

        <ResponsiveLayout
          leftColumn={
            <>
              {/* Welcome Section - Always show but adapt content */}
              {showWelcomeSection && (
                <DashboardErrorBoundary 
                  section="welcome" 
                  onRetry={handleRetryFetch}
                  onFallback={() => navigate('/onboarding')}
                >
                  <WelcomeSection
                    userName={profile?.full_name || 'Founder'}
                    companyName={company?.name || 'Your Company'}
                    isFirstTime={userProgress.isFirstTimeUser}
                    hasCompletedConversation={conversationProgress.hasCompletedConversation}
                    totalConversations={conversationProgress.totalConversations}
                    nextAction={userProgress.isFirstTimeUser ? primaryAction : undefined}
                  />
                </DashboardErrorBoundary>
              )}

              {/* Uploaded Decks Section - Show when relevant */}
              {showUploadedDecks && (
                <DashboardErrorBoundary 
                  section="uploaded decks" 
                  onRetry={handleRetryFetch}
                  onFallback={() => navigate('/upload')}
                >
                  {pitchDecks ? (
                    <UploadedDecksSection
                      decks={pitchDecks}
                      onViewDeck={handleViewDeck}
                      onUploadNew={handleUploadNew}
                    />
                  ) : (
                    <SectionLoading section="Uploaded Decks" />
                  )}
                </DashboardErrorBoundary>
              )}

              {/* Talk to AI Section - Show when user can start conversations */}
              {showTalkToAI && (
                <DashboardErrorBoundary 
                  section="pitch to rohan" 
                  onRetry={handleRetryFetch}
                  onFallback={() => navigate('/setup')}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <TalkToAISection
                      isFirstTime={userProgress.isFirstTimeUser}
                      hasProcessedDeck={hasProcessedDecks}
                      onStartConversation={handleStartConversation}
                    />
                  </motion.div>
                </DashboardErrorBoundary>
              )}

              {/* First-time user guidance */}
              {userProgress.isFirstTimeUser && !userProgress.canStartConversation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="glass rounded-2xl p-6"
                >
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Almost Ready to Pitch!
                    </h3>
                    <p className="text-slate-300 mb-4">
                      Complete your setup to start practicing with AI investors.
                    </p>
                    <div className="text-sm text-slate-400">
                      {typeof primaryAction === 'string' ? primaryAction : 'Loading...'}
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          }
          rightColumn={
            <>
              {/* Quick Actions - Always show when available */}
              {quickActions.length > 0 && (
                <DashboardErrorBoundary 
                  section="quick actions" 
                  onRetry={handleRetryFetch}
                >
                  <QuickActions
                    actions={getContextualActions('sidebar')}
                    isFirstTime={userProgress.isFirstTimeUser}
                  />
                </DashboardErrorBoundary>
              )}

              {/* Company Details Section - Show when available */}
              {showCompanyDetails && (
                <DashboardErrorBoundary 
                  section="company details" 
                  onRetry={handleRetryFetch}
                  onFallback={() => navigate('/onboarding')}
                >
                  {company && profile ? (
                    <CompanyDetailsSection
                      company={company}
                      profile={profile}
                      onEdit={handleEditCompany}
                    />
                  ) : (
                    <SectionLoading section="Company Details" />
                  )}
                </DashboardErrorBoundary>
              )}

              {/* Session History Section - Adapt based on user type */}
              {showSessionHistory ? (
                <DashboardErrorBoundary 
                  section="session history" 
                  onRetry={handleRetryFetch}
                  onFallback={() => navigate('/setup')}
                >
                  {sessions ? (
                    <SessionHistorySection
                      sessions={sessions}
                      onViewSession={handleViewSession}
                      onStartNew={handleStartNewSession}
                    />
                  ) : (
                    <SectionLoading section="Session History" />
                  )}
                </DashboardErrorBoundary>
              ) : userProgress.isFirstTimeUser && userProgress.canStartConversation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="glass rounded-2xl p-6"
                >
                  <div className="text-center">
                    <Plus className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Ready for Your First Session
                    </h3>
                    <p className="text-slate-300 text-sm mb-4">
                      Your pitch deck is ready. Start your first practice session with an AI investor.
                    </p>
                    <button
                      onClick={handleStartConversation}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
                    >
                      Start First Session
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Conversation progress for returning users */}
              {userProgress.isReturningUser && conversationProgress.totalConversations > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="glass rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">Your Progress</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Total Sessions</span>
                      <span className="text-white font-medium">{conversationProgress.totalConversations}</span>
                    </div>
                    {conversationProgress.hasCompletedConversation && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Status</span>
                        <span className="text-green-400 font-medium">Experienced</span>
                      </div>
                    )}
                    {conversationProgress.lastConversationDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Last Session</span>
                        <span className="text-white font-medium">
                          {new Date(conversationProgress.lastConversationDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </>
          }
        >
          {/* Progress indicator for first-time users */}
          {userProgress.isFirstTimeUser && !conversationProgress.hasCompletedConversation && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg border border-indigo-500/30 ${
                isMobile ? 'p-3 text-sm' : ''
              }`}
            >
              <div className={`flex items-center ${isMobile ? 'flex-col space-y-2' : 'justify-between'}`}>
                <div className={isMobile ? 'text-center' : ''}>
                  <h3 className="text-white font-semibold">Next Step</h3>
                  <p className="text-slate-300 text-sm">{typeof primaryAction === 'string' ? primaryAction : 'Loading...'}</p>
                </div>
                <div className="text-indigo-400">
                  <Zap className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          )}
        </ResponsiveLayout>
        </div>
      </div>
    </DesktopEnhancements>
    </ErrorBoundary>
  );
};

export default Dashboard;
