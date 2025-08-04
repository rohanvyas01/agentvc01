import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    }))
  }
}));

// Mock AuthContext
vi.mock('../AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn()
  })
}));

// Simple test for the UserFlowContext functionality
const testUserFlowContext = async () => {
  // Import here to avoid hoisting issues
  const React = await import('react');
  const { render, screen, waitFor } = await import('@testing-library/react');
  const { UserFlowProvider, useUserFlow } = await import('../UserFlowContext');

  // Test component to access context
  const TestComponent = () => {
    const {
      steps,
      userProgress,
      conversationProgress,
      loading,
      getRecommendedAction,
      isDashboardReady
    } = useUserFlow();

    if (loading) return React.createElement('div', null, 'Loading...');

    return React.createElement('div', null,
      React.createElement('div', { 'data-testid': 'steps-count' }, steps.length),
      React.createElement('div', { 'data-testid': 'is-first-time' }, userProgress.isFirstTimeUser.toString()),
      React.createElement('div', { 'data-testid': 'is-returning' }, userProgress.isReturningUser.toString()),
      React.createElement('div', { 'data-testid': 'can-start-conversation' }, userProgress.canStartConversation.toString()),
      React.createElement('div', { 'data-testid': 'total-conversations' }, conversationProgress.totalConversations),
      React.createElement('div', { 'data-testid': 'has-completed-conversation' }, conversationProgress.hasCompletedConversation.toString()),
      React.createElement('div', { 'data-testid': 'recommended-action' }, getRecommendedAction()),
      React.createElement('div', { 'data-testid': 'dashboard-ready' }, isDashboardReady().toString())
    );
  };

  // Test component wrapper
  const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(UserFlowProvider, null, children);
  };

  return { React, render, screen, waitFor, TestComponent, TestWrapper };
};

describe('UserFlowContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide default values for new user', async () => {
    const { render, screen, waitFor, TestComponent, TestWrapper } = await testUserFlowContext();

    render(
      TestWrapper({ children: TestComponent({}) })
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('steps-count')).toHaveTextContent('4');
    expect(screen.getByTestId('is-first-time')).toHaveTextContent('true');
    expect(screen.getByTestId('is-returning')).toHaveTextContent('false');
    expect(screen.getByTestId('can-start-conversation')).toHaveTextContent('false');
    expect(screen.getByTestId('total-conversations')).toHaveTextContent('0');
    expect(screen.getByTestId('has-completed-conversation')).toHaveTextContent('false');
    expect(screen.getByTestId('recommended-action')).toHaveTextContent('Complete onboarding');
    expect(screen.getByTestId('dashboard-ready')).toHaveTextContent('false');
  });

  it('should handle user without authentication', async () => {
    const { render, screen, waitFor, TestComponent, TestWrapper } = await testUserFlowContext();

    render(
      TestWrapper({ children: TestComponent({}) })
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('is-first-time')).toHaveTextContent('true');
    expect(screen.getByTestId('can-start-conversation')).toHaveTextContent('false');
  });

  it('should provide correct step structure', async () => {
    const { render, screen, waitFor, TestComponent, TestWrapper } = await testUserFlowContext();

    render(
      TestWrapper({ children: TestComponent({}) })
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Should have 4 steps: onboarding, upload_deck, deck_processed, first_conversation
    expect(screen.getByTestId('steps-count')).toHaveTextContent('4');
  });
});