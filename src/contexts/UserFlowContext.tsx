import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';

export interface UserFlowStep {
  id: string;
  name: string;
  completed: boolean;
  required: boolean;
}

export interface ConversationProgress {
  hasCompletedConversation: boolean;
  totalConversations: number;
  lastConversationDate?: string;
  conversationStatus?: 'none' | 'in_progress' | 'completed' | 'failed';
}

export interface UserProgress {
  isFirstTimeUser: boolean;
  isReturningUser: boolean;
  conversationProgress: ConversationProgress;
  canStartConversation: boolean;
  nextRecommendedAction: string;
}

interface UserFlowContextType {
  steps: UserFlowStep[];
  currentStep: string | null;
  loading: boolean;
  userProgress: UserProgress;
  conversationProgress: ConversationProgress;
  refreshSteps: () => Promise<void>;
  markStepComplete: (stepId: string) => Promise<void>;
  getNextIncompleteStep: () => UserFlowStep | null;
  isFlowComplete: () => boolean;
  updateConversationProgress: (sessionId: string, status: 'started' | 'completed' | 'failed') => Promise<void>;
  getRecommendedAction: () => string;
  isDashboardReady: () => boolean;
}

const UserFlowContext = createContext<UserFlowContextType | undefined>(undefined);

const defaultSteps: UserFlowStep[] = [
    { id: 'onboarding', name: 'Complete Profile', completed: false, required: true },
    { id: 'upload_deck', name: 'Upload Pitch Deck', completed: false, required: true },
    { id: 'deck_processed', name: 'Deck Analysis Complete', completed: false, required: true },
    { id: 'first_conversation', name: 'Complete First Pitch Session', completed: false, required: false },
  ];

const defaultUserProgress: UserProgress = {
  isFirstTimeUser: true,
  isReturningUser: false,
  conversationProgress: {
    hasCompletedConversation: false,
    totalConversations: 0,
    conversationStatus: 'none'
  },
  canStartConversation: false,
  nextRecommendedAction: 'Complete onboarding'
};

const defaultConversationProgress: ConversationProgress = {
  hasCompletedConversation: false,
  totalConversations: 0,
  conversationStatus: 'none'
};

export const useUserFlow = () => {
  const context = useContext(UserFlowContext);
  if (context === undefined) {
    throw new Error('useUserFlow must be used within a UserFlowProvider');
  }
  return context;
};

export const UserFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [steps, setSteps] = useState<UserFlowStep[]>(defaultSteps);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<UserProgress>(defaultUserProgress);
  const [conversationProgress, setConversationProgress] = useState<ConversationProgress>(defaultConversationProgress);

  const refreshSteps = useCallback(async () => {
    if (!user) {
      setSteps(defaultSteps);
      setUserProgress(defaultUserProgress);
      setConversationProgress(defaultConversationProgress);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Check onboarding completion
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Check uploaded decks
      const { data: pitchDecks } = await supabase
        .from('pitch_decks')
        .select('*')
        .eq(company?.id ? 'company_id' : 'user_id', company?.id || user.id)
        .order('created_at', { ascending: false });

      const hasUploadedDeck = pitchDecks && pitchDecks.length > 0;
      const hasProcessedDeck = !!pitchDecks?.some((deck: any) => deck.status === 'processed');

      // Check conversation/session history
      const { data: sessions } = await supabase
        .from('conversation_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const totalConversations = sessions?.length || 0;
      const completedConversations = sessions?.filter(s => s.status === 'completed') || [];
      const hasCompletedConversation = completedConversations.length > 0;
      const lastSession = sessions?.[0];
      const lastConversationDate = lastSession?.completed_at || lastSession?.created_at;

      // Determine conversation status
      let conversationStatus: ConversationProgress['conversationStatus'] = 'none';
      if (lastSession) {
        if (lastSession.status === 'active') {
          conversationStatus = 'in_progress';
        } else if (lastSession.status === 'completed') {
          conversationStatus = 'completed';
        } else if (lastSession.status === 'failed') {
          conversationStatus = 'failed';
        }
      }

      // Update conversation progress
      const newConversationProgress: ConversationProgress = {
        hasCompletedConversation,
        totalConversations,
        lastConversationDate,
        conversationStatus
      };
      setConversationProgress(newConversationProgress);

      // Determine user type and progress
      const isFirstTimeUser = totalConversations === 0;
      const isReturningUser = totalConversations > 0;
      const canStartConversation = !!(profile && company && hasProcessedDeck);

      // Determine next recommended action
      let nextRecommendedAction = 'Complete onboarding';
      if (!profile || !company) {
        nextRecommendedAction = 'Complete onboarding';
      } else if (!hasUploadedDeck) {
        nextRecommendedAction = 'Upload pitch deck';
      } else if (!hasProcessedDeck) {
        nextRecommendedAction = 'Wait for deck processing';
      } else if (isFirstTimeUser) {
        nextRecommendedAction = 'Start your first pitch session';
      } else {
        nextRecommendedAction = 'Start new pitch session';
      }

      // Update user progress
      const newUserProgress: UserProgress = {
        isFirstTimeUser,
        isReturningUser,
        conversationProgress: newConversationProgress,
        canStartConversation,
        nextRecommendedAction
      };
      setUserProgress(newUserProgress);

      const updatedSteps: UserFlowStep[] = [
        {
          id: 'onboarding',
          name: 'Complete Profile',
          completed: !!(profile && company),
          required: true
        },
        {
          id: 'upload_deck',
          name: 'Upload Pitch Deck',
          completed: hasUploadedDeck,
          required: true
        },
        {
          id: 'deck_processed',
          name: 'Deck Analysis Complete',
          completed: hasProcessedDeck,
          required: true
        },
        {
          id: 'first_conversation',
          name: 'Complete First Pitch Session',
          completed: hasCompletedConversation,
          required: false
        },
      ];

      setSteps(updatedSteps);
      
      // Set current step to first incomplete required step
      const nextStep = updatedSteps.find(step => step.required && !step.completed);
      setCurrentStep(nextStep?.id || null);

    } catch (error) {
      setSteps(defaultSteps);
      setUserProgress(defaultUserProgress);
      setConversationProgress(defaultConversationProgress);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markStepComplete = useCallback(async (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ));
    
    // Refresh to get accurate state
    await refreshSteps();
  }, [refreshSteps]);

  const getNextIncompleteStep = useCallback(() => {
    return steps.find(step => step.required && !step.completed) || null;
  }, [steps]);

  const isFlowComplete = useCallback(() => {
    return steps.filter(step => step.required).every(step => step.completed);
  }, [steps]);

  const updateConversationProgress = useCallback(async (sessionId: string, status: 'started' | 'completed' | 'failed') => {
    try {
      // Update the session status in the database
      const updateData: any = { status };
      
      if (status === 'started') {
        updateData.status = 'active';
        updateData.started_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.status = 'completed';
        updateData.completed_at = new Date().toISOString();
      } else if (status === 'failed') {
        updateData.status = 'failed';
        updateData.completed_at = new Date().toISOString();
      }

      await supabase
        .from('conversation_sessions')
        .update(updateData)
        .eq('id', sessionId);

      // Refresh steps to update progress
      await refreshSteps();
    } catch (error) {
      // Error updating conversation progress
    }
  }, [refreshSteps]);

  const getRecommendedAction = useCallback(() => {
    return userProgress.nextRecommendedAction;
  }, [userProgress.nextRecommendedAction]);

  const isDashboardReady = useCallback(() => {
    // Dashboard is ready when basic onboarding is complete
    return steps.find(step => step.id === 'onboarding')?.completed || false;
  }, [steps]);

  useEffect(() => {
    refreshSteps();
  }, [user, refreshSteps]);

  const value = {
    steps,
    currentStep,
    loading,
    userProgress,
    conversationProgress,
    refreshSteps,
    markStepComplete,
    getNextIncompleteStep,
    isFlowComplete,
    updateConversationProgress,
    getRecommendedAction,
    isDashboardReady,
  };

  return (
    <UserFlowContext.Provider value={value}>
      {children}
    </UserFlowContext.Provider>
  );
};
