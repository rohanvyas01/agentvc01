import { NavigateFunction } from 'react-router-dom';
import { sessionService } from '../services/sessionService';

export interface NavigationContext {
  navigate: NavigateFunction;
  userId: string;
  hasProcessedDecks: boolean;
  canStartConversation: boolean;
}

export class NavigationHelpers {
  private context: NavigationContext;

  constructor(context: NavigationContext) {
    this.context = context;
  }

  /**
   * Navigate to start a new conversation with proper eligibility checks
   */
  async startConversation(): Promise<void> {
    const { navigate, userId } = this.context;

    try {
      // Check if user can start a new conversation
      const eligibility = await sessionService.canStartNewConversation(userId);
      
      if (!eligibility.canStart) {
        if (eligibility.activeSessionId) {
          // Redirect to active session
          navigate(`/conversation/${eligibility.activeSessionId}`);
          return;
        } else {
          // Handle other reasons (e.g., no processed deck, rate limiting)
          this.handleConversationBlocker(eligibility.reason);
          return;
        }
      }

      // Navigate to conversation setup
      navigate('/setup');
    } catch (error) {
      // Fallback to setup page
      navigate('/setup');
    }
  }

  /**
   * Navigate to upload a new deck
   */
  uploadNewDeck(): void {
    this.context.navigate('/upload');
  }

  /**
   * Navigate to edit company/profile information
   */
  editProfile(): void {
    this.context.navigate('/onboarding');
  }

  /**
   * Navigate to view a specific session
   */
  viewSession(sessionId: string): void {
    this.context.navigate(`/session/${sessionId}`);
  }

  /**
   * Navigate to view session history (if dedicated page exists)
   */
  viewSessionHistory(): void {
    // For now, scroll to session history section
    // In the future, this could navigate to a dedicated page
    this.scrollToSection('session-history');
  }

  /**
   * Navigate to view a specific deck
   */
  viewDeck(deckId: string): void {
    this.context.navigate(`/deck/${deckId}`);
  }

  /**
   * Navigate to conversation with specific session ID
   */
  joinConversation(sessionId: string): void {
    this.context.navigate(`/conversation/${sessionId}`);
  }

  /**
   * Navigate back to dashboard
   */
  goToDashboard(): void {
    this.context.navigate('/dashboard');
  }

  /**
   * Handle cases where conversation is blocked
   */
  private handleConversationBlocker(reason: string): void {
    const { navigate, hasProcessedDecks } = this.context;

    switch (reason) {
      case 'no_processed_deck':
        if (!hasProcessedDecks) {
          // Navigate to upload if no decks at all
          navigate('/upload');
        } else {
          // Show message that deck is still processing
        }
        break;
      
      case 'rate_limited':
        // Show rate limiting message
        break;
      
      case 'incomplete_profile':
        // Navigate to complete profile
        navigate('/onboarding');
        break;
      
      default:
        // Unknown blocker
    }
  }

  /**
   * Scroll to a specific section on the current page
   */
  private scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  /**
   * Get the appropriate next action based on user state
   */
  getRecommendedNavigation(): {
    action: string;
    label: string;
    handler: () => void;
  } {
    const { hasProcessedDecks, canStartConversation } = this.context;

    if (!hasProcessedDecks) {
      return {
        action: 'upload',
        label: 'Upload your pitch deck to get started',
        handler: () => this.uploadNewDeck()
      };
    }

    if (!canStartConversation) {
      return {
        action: 'wait',
        label: 'Your deck is being processed...',
        handler: () => {} // No action needed
      };
    }

    return {
      action: 'start_conversation',
      label: 'Start practicing with AI investors',
      handler: () => this.startConversation()
    };
  }
}

/**
 * Hook to create navigation helpers with current context
 */
export const useNavigationHelpers = (context: NavigationContext): NavigationHelpers => {
  return new NavigationHelpers(context);
};