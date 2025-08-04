import { vi } from 'vitest'

// Mock data for testing
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

export const mockProfile = {
  id: 'test-user-id',
  full_name: 'Test User',
  avatar_url: null,
  startup_name: 'Test Startup',
  website: 'https://test.com',
  one_liner: 'Test startup description',
  industry: 'Technology',
  business_model: 'SaaS',
  fundraise_stage: 'Seed',
  raise_amount: '$1M',
  use_of_funds: 'Product development',
  linkedin_url: 'https://linkedin.com/in/test',
  immediate_goals: 'Launch MVP',
  company_id: 'test-company-id',
  updated_at: '2024-01-01T00:00:00Z',
}

export const mockCompany = {
  id: 'test-company-id',
  user_id: 'test-user-id',
  name: 'Test Company',
  industry: 'Technology',
  stage: 'Seed',
  funding_round: 'Seed',
  funding_amount: '$1M',
  one_liner: 'Test company description',
  website: 'https://testcompany.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

export const mockPitchDeck = {
  id: 'test-pitch-deck-id',
  user_id: 'test-user-id',
  company_id: 'test-company-id',
  deck_name: 'Test Pitch Deck',
  file_type: 'pdf',
  pitch_deck_url: 'https://example.com/deck.pdf',
  pitch_deck_storage_path: 'decks/test-deck.pdf',
  financials_url: null,
  transcript_text: 'Test transcript',
  processing_status: 'processed' as const,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

export const mockSession = {
  id: 'test-session-id',
  user_id: 'test-user-id',
  company_id: 'test-company-id',
  pitch_deck_id: 'test-pitch-deck-id',
  tavus_conversation_id: 'test-tavus-id',
  tavus_persona_id: 'angel',
  status: 'completed' as const,
  duration_minutes: 25,
  created_at: '2024-01-01T00:00:00Z',
  started_at: '2024-01-01T00:05:00Z',
  completed_at: '2024-01-01T00:30:00Z',
}

export const mockTranscript = {
  id: 'test-transcript-id',
  session_id: 'test-session-id',
  speaker: 'founder' as const,
  content: 'Hello, I would like to present my startup...',
  timestamp_ms: 5000,
  created_at: '2024-01-01T00:05:00Z',
}

export const mockAnalysis = {
  id: 'test-analysis-id',
  session_id: 'test-session-id',
  gemini_analysis: {
    detailed_feedback: 'Great presentation with clear value proposition',
    investor_concerns: ['Market size validation needed'],
    pitch_effectiveness: 8.5,
  },
  key_strengths: ['Clear problem statement', 'Strong team background'],
  improvement_areas: ['Market size validation', 'Financial projections'],
  follow_up_questions: ['What is your customer acquisition cost?'],
  overall_score: 8,
  created_at: '2024-01-01T00:30:00Z',
}

export const mockReport = {
  id: 'test-report-id',
  session_id: 'test-session-id',
  report_data: {
    summary: {
      session_date: '2024-01-01T00:00:00Z',
      duration_minutes: 25,
      overall_score: 8,
      status: 'completed',
      company_name: 'Test Company',
      pitch_deck_name: 'Test Pitch Deck',
    },
    transcript: [mockTranscript],
    analysis: mockAnalysis,
    recommendations: ['Focus on market validation', 'Strengthen financial projections'],
    next_steps: ['Schedule follow-up session', 'Prepare market research'],
  },
  email_sent: false,
  email_sent_at: null,
  created_at: '2024-01-01T00:35:00Z',
}

// Create mock Supabase client
export const createMockSupabaseClient = () => {
  const mockSelect = vi.fn().mockReturnThis()
  const mockInsert = vi.fn().mockReturnThis()
  const mockUpdate = vi.fn().mockReturnThis()
  const mockDelete = vi.fn().mockReturnThis()
  const mockEq = vi.fn().mockReturnThis()
  const mockOrder = vi.fn().mockReturnThis()
  const mockLimit = vi.fn().mockReturnThis()
  const mockSingle = vi.fn()
  const mockMaybeSingle = vi.fn()

  const mockFrom = vi.fn((table: string) => {
    // Configure different responses based on table
    switch (table) {
      case 'profiles':
        mockSingle.mockResolvedValue({ data: mockProfile, error: null })
        mockMaybeSingle.mockResolvedValue({ data: mockProfile, error: null })
        break
      case 'companies':
        mockSingle.mockResolvedValue({ data: mockCompany, error: null })
        mockMaybeSingle.mockResolvedValue({ data: mockCompany, error: null })
        break
      case 'pitch_decks':
        mockSingle.mockResolvedValue({ data: [mockPitchDeck], error: null })
        mockMaybeSingle.mockResolvedValue({ data: [mockPitchDeck], error: null })
        break
      case 'sessions':
        mockSingle.mockResolvedValue({ data: [mockSession], error: null })
        mockMaybeSingle.mockResolvedValue({ data: [mockSession], error: null })
        break
      default:
        mockSingle.mockResolvedValue({ data: null, error: null })
        mockMaybeSingle.mockResolvedValue({ data: null, error: null })
    }

    return {
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
      single: mockSingle,
      maybeSingle: mockMaybeSingle,
    }
  })

  return {
    auth: {
      getSession: vi.fn(() => 
        Promise.resolve({ 
          data: { session: { user: mockUser } }, 
          error: null 
        })
      ),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      signUp: vi.fn(() => 
        Promise.resolve({ 
          data: { user: mockUser }, 
          error: null 
        })
      ),
      signInWithPassword: vi.fn(() => 
        Promise.resolve({ 
          data: { user: mockUser }, 
          error: null 
        })
      ),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      getUser: vi.fn(() => 
        Promise.resolve({ 
          data: { user: mockUser }, 
          error: null 
        })
      ),
    },
    from: mockFrom,
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: null, error: null })),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    })),
  }
}