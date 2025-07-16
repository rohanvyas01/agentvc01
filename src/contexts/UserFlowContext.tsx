import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';

export interface UserFlowStep {
  id: string;
  name: string;
  completed: boolean;
  required: boolean;
}

interface UserFlowContextType {
  steps: UserFlowStep[];
  currentStep: string | null;
  loading: boolean;
  refreshSteps: () => Promise<void>;
  markStepComplete: (stepId: string) => Promise<void>;
  getNextIncompleteStep: () => UserFlowStep | null;
  isFlowComplete: () => boolean;
}

const UserFlowContext = createContext<UserFlowContextType | undefined>(undefined);

const defaultSteps: UserFlowStep[] = [
    { id: 'onboarding', name: 'Complete Profile', completed: false, required: true },
    { id: 'agent_intro', name: 'Meet Your AI Investor', completed: false, required: true },
    { id: 'upload_deck', name: 'Upload Pitch Deck', completed: false, required: true },
    { id: 'deck_processed', name: 'Deck Analysis Complete', completed: false, required: true },
    { id: 'qa_session', name: 'Q&A Session Available', completed: false, required: false },
  ];

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

  const refreshSteps = useCallback(async () => {
    if (!user) {
      setSteps(defaultSteps);
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

      // Check if user has seen agent intro
      const agentIntroSeen = localStorage.getItem(`agent_intro_seen_${user.id}`) === 'true';

      // Check uploaded decks
      const { data: pitchDecks } = await supabase
        .from('pitches')
        .select('*')
        .eq('company_id', company?.id || '')
        .order('created_at', { ascending: false });

      const hasUploadedDeck = pitchDecks && pitchDecks.length > 0;
      const hasProcessedDeck = !!pitchDecks?.some((deck: any) => deck.status === 'processed');

      const updatedSteps: UserFlowStep[] = [
        {
          id: 'onboarding',
          name: 'Complete Profile',
          completed: !!(profile && company),
          required: true
        },
        {
          id: 'agent_intro',
          name: 'Meet Your AI Investor',
          completed: agentIntroSeen,
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
          id: 'qa_session',
          name: 'Q&A Session Available',
          completed: false, // This will be completed when they finish a Q&A session
          required: false
        },
      ];

      setSteps(updatedSteps);
      
      // Set current step to first incomplete required step
      const nextStep = updatedSteps.find(step => step.required && !step.completed);
      setCurrentStep(nextStep?.id || null);

    } catch (error) {
      console.error('Error refreshing user flow steps:', error);
      setSteps(defaultSteps);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markStepComplete = useCallback(async (stepId: string) => {
    if (stepId === 'agent_intro' && user) {
      localStorage.setItem(`agent_intro_seen_${user.id}`, 'true');
    }
    
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ));
    
    // Refresh to get accurate state
    await refreshSteps();
  }, [user, refreshSteps]);

  const getNextIncompleteStep = useCallback(() => {
    return steps.find(step => step.required && !step.completed) || null;
  }, [steps]);

  const isFlowComplete = useCallback(() => {
    return steps.filter(step => step.required).every(step => step.completed);
  }, [steps]);

  useEffect(() => {
    refreshSteps();
  }, [user, refreshSteps]);

  const value = {
    steps,
    currentStep,
    loading,
    refreshSteps,
    markStepComplete,
    getNextIncompleteStep,
    isFlowComplete,
  };

  return (
    <UserFlowContext.Provider value={value}>
      {children}
    </UserFlowContext.Provider>
  );
};
