import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQuickActions } from '../../../hooks/useQuickActions';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

// Mock sessionService
vi.mock('../../../services/sessionService', () => ({
  sessionService: {
    canStartNewConversation: vi.fn().mockResolvedValue({
      canStart: true,
      reason: null,
      activeSessionId: null
    })
  }
}));

describe('useQuickActions', () => {
  const defaultProps = {
    userId: 'test-user-id',
    isFirstTime: false,
    hasProcessedDecks: true,
    canStartConversation: true,
    hasActiveSessions: false,
    totalSessions: 5,
    onUploadNew: vi.fn(),
    onStartConversation: vi.fn()
  };

  it('returns quick actions for returning users', () => {
    const { result } = renderHook(() => useQuickActions(defaultProps));

    expect(result.current.quickActions).toHaveLength(3);
    expect(result.current.quickActions[0].id).toBe('pitch-to-rohan-again');
    expect(result.current.quickActions[1].id).toBe('upload-new-deck');
    expect(result.current.quickActions[2].id).toBe('start-new-session');
  });

  it('returns different actions for first-time users', () => {
    const { result } = renderHook(() => 
      useQuickActions({ ...defaultProps, isFirstTime: true, totalSessions: 0 })
    );

    expect(result.current.quickActions).toHaveLength(2);
    expect(result.current.quickActions[0].id).toBe('start-first-session');
    expect(result.current.quickActions[1].id).toBe('upload-new-deck');
  });

  it('disables actions when user has active sessions', () => {
    const { result } = renderHook(() => 
      useQuickActions({ ...defaultProps, hasActiveSessions: true })
    );

    const pitchAction = result.current.quickActions.find(a => a.id === 'pitch-to-rohan-again');
    expect(pitchAction?.disabled).toBe(true);
  });

  it('returns primary action for first-time users', () => {
    const { result } = renderHook(() => 
      useQuickActions({ ...defaultProps, isFirstTime: true, totalSessions: 0 })
    );

    expect(result.current.primaryAction?.id).toBe('start-first-session');
  });

  it('returns contextual actions for different contexts', () => {
    const { result } = renderHook(() => useQuickActions(defaultProps));

    const welcomeActions = result.current.getContextualActions('welcome');
    const sidebarActions = result.current.getContextualActions('sidebar');
    const mainActions = result.current.getContextualActions('main');

    expect(welcomeActions).toHaveLength(1);
    expect(sidebarActions).toHaveLength(3);
    expect(mainActions).toHaveLength(3);
  });

  it('handles users without processed decks', () => {
    const { result } = renderHook(() => 
      useQuickActions({ ...defaultProps, hasProcessedDecks: false, canStartConversation: false })
    );

    // Should only have upload action when no processed decks
    expect(result.current.quickActions).toHaveLength(1);
    expect(result.current.quickActions[0].id).toBe('upload-new-deck');
  });
});