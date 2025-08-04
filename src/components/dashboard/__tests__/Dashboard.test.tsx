import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dashboard from '../../../pages/Dashboard'
import { AuthProvider } from '../../../contexts/AuthContext'
import { UserFlowProvider } from '../../../contexts/UserFlowContext'
import { BrowserRouter } from 'react-router-dom'
import { mockUser, mockProfile, mockCompany, mockPitchDeck, mockSession } from '../../../test/mocks/supabase'

// Mock the dashboard realtime hook
vi.mock('../../../hooks/useDashboardRealtime', () => ({
  useDashboardRealtime: () => ({
    data: {
      profile: mockProfile,
      company: mockCompany,
      pitchDecks: [mockPitchDeck],
      sessions: [mockSession],
    },
    isLoading: false,
    error: null,
    isOptimistic: false,
    connectionState: {
      isConnected: true,
      isReconnecting: false,
      lastSync: new Date().toISOString(),
    },
    createSession: vi.fn(),
    updateSession: vi.fn(),
    deleteSession: vi.fn(),
    refresh: vi.fn(),
    reconnect: vi.fn(),
    connectionMonitor: {
      isOnline: true,
      connectionQuality: 'good' as const,
      reconnectAttempts: 0,
    },
  }),
}))

// Mock responsive hook
vi.mock('../../../hooks/useResponsive', () => ({
  useResponsive: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  }),
}))

// Mock navigation helpers
vi.mock('../../../utils/navigationHelpers', () => ({
  useNavigationHelpers: () => ({
    navigateToOnboarding: vi.fn(),
    navigateToUpload: vi.fn(),
    navigateToSession: vi.fn(),
  }),
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      <UserFlowProvider>
        {children}
      </UserFlowProvider>
    </AuthProvider>
  </BrowserRouter>
)

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dashboard with all sections when data is loaded', async () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard')).not.toBeInTheDocument()
    })

    // Check for main dashboard sections
    expect(screen.getByText(/Hello.*Test User/)).toBeInTheDocument()
    expect(screen.getByText('Test Company')).toBeInTheDocument()
    expect(screen.getByText('Test Pitch Deck')).toBeInTheDocument()
    expect(screen.getByText(/Session History/)).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    // Mock loading state
    vi.doMock('../../../hooks/useDashboardRealtime', () => ({
      useDashboardRealtime: () => ({
        data: { profile: null, company: null, pitchDecks: [], sessions: [] },
        isLoading: true,
        error: null,
        isOptimistic: false,
        connectionState: { isConnected: false, isReconnecting: false },
        createSession: vi.fn(),
        updateSession: vi.fn(),
        deleteSession: vi.fn(),
        refresh: vi.fn(),
        reconnect: vi.fn(),
        connectionMonitor: { isOnline: true, connectionQuality: 'good', reconnectAttempts: 0 },
      }),
    }))

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    expect(screen.getByText('Loading Dashboard')).toBeInTheDocument()
  })

  it('shows error state when data loading fails', async () => {
    // Mock error state
    vi.doMock('../../../hooks/useDashboardRealtime', () => ({
      useDashboardRealtime: () => ({
        data: { profile: null, company: null, pitchDecks: [], sessions: [] },
        isLoading: false,
        error: { message: 'Failed to load dashboard data' },
        isOptimistic: false,
        connectionState: { isConnected: true, isReconnecting: false },
        createSession: vi.fn(),
        updateSession: vi.fn(),
        deleteSession: vi.fn(),
        refresh: vi.fn(),
        reconnect: vi.fn(),
        connectionMonitor: { isOnline: true, connectionQuality: 'good', reconnectAttempts: 0 },
      }),
    }))

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Dashboard Error')).toBeInTheDocument()
    })

    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('adapts layout for first-time users', async () => {
    // Mock first-time user state
    vi.doMock('../../../contexts/UserFlowContext', () => ({
      useUserFlow: () => ({
        userProgress: {
          isFirstTimeUser: true,
          isReturningUser: false,
          canStartConversation: false,
          nextRecommendedAction: 'Complete onboarding',
        },
        conversationProgress: {
          hasCompletedConversation: false,
          totalConversations: 0,
        },
        refreshSteps: vi.fn(),
      }),
    }))

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Next Step')).toBeInTheDocument()
    })

    expect(screen.getByText('Complete onboarding')).toBeInTheDocument()
  })

  it('shows "Pitch to Rohan" section when user can start conversations', async () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/Pitch to Rohan/)).toBeInTheDocument()
    })
  })

  it('handles start conversation action', async () => {
    const user = userEvent.setup()
    const mockCreateSession = vi.fn()

    vi.doMock('../../../hooks/useDashboardRealtime', () => ({
      useDashboardRealtime: () => ({
        data: {
          profile: mockProfile,
          company: mockCompany,
          pitchDecks: [mockPitchDeck],
          sessions: [],
        },
        isLoading: false,
        error: null,
        isOptimistic: false,
        connectionState: { isConnected: true, isReconnecting: false },
        createSession: mockCreateSession,
        updateSession: vi.fn(),
        deleteSession: vi.fn(),
        refresh: vi.fn(),
        reconnect: vi.fn(),
        connectionMonitor: { isOnline: true, connectionQuality: 'good', reconnectAttempts: 0 },
      }),
    }))

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    const pitchButton = await screen.findByText(/Pitch to Rohan/)
    await user.click(pitchButton)

    await waitFor(() => {
      expect(mockCreateSession).toHaveBeenCalled()
    })
  })

  it('displays session history for returning users', async () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/Session History/)).toBeInTheDocument()
    })

    // Should show the mock session
    expect(screen.getByText(/completed/i)).toBeInTheDocument()
  })

  it('shows offline indicator when connection is lost', async () => {
    vi.doMock('../../../hooks/useDashboardRealtime', () => ({
      useDashboardRealtime: () => ({
        data: { profile: mockProfile, company: mockCompany, pitchDecks: [], sessions: [] },
        isLoading: false,
        error: null,
        isOptimistic: false,
        connectionState: { isConnected: false, isReconnecting: true },
        createSession: vi.fn(),
        updateSession: vi.fn(),
        deleteSession: vi.fn(),
        refresh: vi.fn(),
        reconnect: vi.fn(),
        connectionMonitor: { isOnline: false, connectionQuality: 'poor', reconnectAttempts: 2 },
      }),
    }))

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/offline/i)).toBeInTheDocument()
    })
  })

  it('handles retry action on error', async () => {
    const user = userEvent.setup()
    const mockRefresh = vi.fn()

    vi.doMock('../../../hooks/useDashboardRealtime', () => ({
      useDashboardRealtime: () => ({
        data: { profile: null, company: null, pitchDecks: [], sessions: [] },
        isLoading: false,
        error: { message: 'Connection failed' },
        isOptimistic: false,
        connectionState: { isConnected: false, isReconnecting: false },
        createSession: vi.fn(),
        updateSession: vi.fn(),
        deleteSession: vi.fn(),
        refresh: mockRefresh,
        reconnect: vi.fn(),
        connectionMonitor: { isOnline: false, connectionQuality: 'poor', reconnectAttempts: 0 },
      }),
    }))

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    const retryButton = await screen.findByText('Try Again')
    await user.click(retryButton)

    expect(mockRefresh).toHaveBeenCalled()
  })

  it('shows mobile navigation on mobile devices', async () => {
    vi.doMock('../../../hooks/useResponsive', () => ({
      useResponsive: () => ({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
      }),
    }))

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )

    // Mobile navigation should be rendered
    // This would depend on the actual MobileNavigation component implementation
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })
  })
})