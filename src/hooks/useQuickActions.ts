import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuickAction } from '../types/dashboard';
import { sessionService } from '../services/sessionService';

interface UseQuickActionsProps {
  userId: string;
  isFirstTime: boolean;
  hasProcessedDecks: boolean;
  canStartConversation: boolean;
  hasActiveSessions: boolean;
  totalSessions: number;
  onUploadNew?: () => void;
  onStartConversation?: () => void;
}

export const useQuickActions = ({
  userId,
  isFirstTime,
  hasProcessedDecks,
  canStartConversation,
  hasActiveSessions,
  totalSessions,
  onUploadNew,
  onStartConversation
}: UseQuickActionsProps) => {
  const navigate = useNavigate();

  const quickActions = useMemo((): QuickAction[] => {
    const actions: QuickAction[] = [];

    // Primary action: Pitch to Rohan / Start Session
    if (canStartConversation && hasProcessedDecks) {
      if (isFirstTime) {
        actions.push({
          id: 'start-first-session',
          label: 'Start Your First Session',
          icon: 'message-square',
          action: () => {
            if (onStartConversation) {
              onStartConversation();
            } else {
              navigate('/setup');
            }
          },
          disabled: false,
          tooltip: 'Begin practicing with an AI investor'
        });
      } else {
        actions.push({
          id: 'pitch-to-rohan-again',
          label: 'Pitch to Rohan Again',
          icon: 'message-square',
          action: async () => {
            // Check if user can start a new conversation
            const eligibility = await sessionService.canStartNewConversation(userId);
            
            if (!eligibility.canStart) {
              if (eligibility.activeSessionId) {
                // Redirect to active session
                navigate(`/conversation/${eligibility.activeSessionId}`);
              } else {
                // Could show a modal or toast here
              }
              return;
            }

            if (onStartConversation) {
              onStartConversation();
            } else {
              navigate('/setup');
            }
          },
          disabled: hasActiveSessions,
          tooltip: hasActiveSessions 
            ? 'Complete your current session first' 
            : 'Start a new practice session'
        });
      }
    }

    // Upload New Deck action
    actions.push({
      id: 'upload-new-deck',
      label: 'Upload New Deck',
      icon: 'upload',
      action: () => {
        if (onUploadNew) {
          onUploadNew();
        } else {
          navigate('/upload');
        }
      },
      disabled: false,
      tooltip: 'Upload a new pitch deck for practice'
    });

    // Start New Session (alternative to Pitch to Rohan for returning users)
    if (!isFirstTime && canStartConversation && hasProcessedDecks && totalSessions > 0) {
      actions.push({
        id: 'start-new-session',
        label: 'Start New Session',
        icon: 'plus',
        action: async () => {
          // Check if user can start a new conversation
          const eligibility = await sessionService.canStartNewConversation(userId);
          
          if (!eligibility.canStart) {
            if (eligibility.activeSessionId) {
              // Redirect to active session
              navigate(`/conversation/${eligibility.activeSessionId}`);
            } else {
              // Cannot start conversation
            }
            return;
          }

          navigate('/setup');
        },
        disabled: hasActiveSessions,
        tooltip: hasActiveSessions 
          ? 'Complete your current session first' 
          : 'Start a fresh practice session'
      });
    }

    // View Session History (for returning users with sessions)
    if (!isFirstTime && totalSessions > 0) {
      actions.push({
        id: 'view-history',
        label: 'View Session History',
        icon: 'clock',
        action: () => {
          // Scroll to session history section or navigate to dedicated page
          const historySection = document.getElementById('session-history');
          if (historySection) {
            historySection.scrollIntoView({ behavior: 'smooth' });
          }
        },
        disabled: false,
        tooltip: 'Review your past practice sessions'
      });
    }

    return actions;
  }, [
    userId,
    isFirstTime,
    hasProcessedDecks,
    canStartConversation,
    hasActiveSessions,
    totalSessions,
    navigate,
    onUploadNew,
    onStartConversation
  ]);

  // Get the primary action (most important for the user's current state)
  const primaryAction = useMemo((): QuickAction | null => {
    if (quickActions.length === 0) return null;
    
    // For first-time users, prioritize starting their first session
    if (isFirstTime && canStartConversation) {
      return quickActions.find(action => action.id === 'start-first-session') || null;
    }
    
    // For returning users, prioritize Pitch to Rohan Again
    if (!isFirstTime && canStartConversation) {
      return quickActions.find(action => action.id === 'pitch-to-rohan-again') || null;
    }
    
    // Fallback to first available action
    return quickActions[0];
  }, [quickActions, isFirstTime, canStartConversation]);

  // Get contextual actions based on user state
  const getContextualActions = (context: 'welcome' | 'sidebar' | 'main' = 'main'): QuickAction[] => {
    switch (context) {
      case 'welcome':
        // Show only the most important action in welcome section
        return primaryAction ? [primaryAction] : [];
      
      case 'sidebar':
        // Show up to 3 most relevant actions in sidebar
        return quickActions.slice(0, 3);
      
      case 'main':
      default:
        // Show all available actions
        return quickActions;
    }
  };

  return {
    quickActions,
    primaryAction,
    getContextualActions,
    hasActions: quickActions.length > 0
  };
};