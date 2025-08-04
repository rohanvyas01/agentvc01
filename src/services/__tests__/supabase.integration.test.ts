import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { supabase } from '../../lib/supabase'
import { sessionService } from '../sessionService'
import { 
  generateFollowUpQuestions, 
  getFollowUpQuestions,
  toggleQuestionSelection 
} from '../followUpQuestionsService'
import { 
  generateSessionReport, 
  getSessionReport,
  emailSessionReport 
} from '../reportService'
import { createMockSupabaseClient, mockUser, mockSession, mockCompany } from '../../test/mocks/supabase'

// Mock the actual supabase client
vi.mock('../../lib/supabase', () => ({
  supabase: createMockSupabaseClient(),
}))

describe('Supabase Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Authentication Integration', () => {
    it('should handle user session retrieval', async () => {
      const { data, error } = await supabase.auth.getSession()
      
      expect(error).toBeNull()
      expect(data.session?.user).toEqual(mockUser)
    })

    it('should handle user sign up', async () => {
      const { data, error } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: { full_name: 'Test User' }
        }
      })

      expect(error).toBeNull()
      expect(data.user).toEqual(mockUser)
    })

    it('should handle user sign in', async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(error).toBeNull()
    })

    it('should handle user sign out', async () => {
      const { error } = await supabase.auth.signOut()
      
      expect(error).toBeNull()
    })
  })

  describe('Database Operations', () => {
    it('should fetch user profile', async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', mockUser.id)
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.id).toBe(mockUser.id)
    })

    it('should fetch user company', async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', mockUser.id)
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.user_id).toBe(mockUser.id)
    })

    it('should fetch user pitch decks', async () => {
      const { data, error } = await supabase
        .from('pitch_decks')
        .select('*')
        .eq('user_id', mockUser.id)
        .order('created_at', { ascending: false })

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
    })

    it('should fetch user sessions', async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', mockUser.id)
        .order('created_at', { ascending: false })

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
    })

    it('should handle database errors gracefully', async () => {
      // Mock a database error
      const mockFrom = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ 
          data: null, 
          error: { message: 'Database connection failed', code: 'CONNECTION_ERROR' }
        }))
      }))

      vi.mocked(supabase.from).mockImplementation(mockFrom)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', 'invalid-id')
        .single()

      expect(data).toBeNull()
      expect(error).toBeDefined()
      expect(error.message).toBe('Database connection failed')
    })
  })

  describe('Session Service Integration', () => {
    it('should get user session progress', async () => {
      const progress = await sessionService.getUserSessionProgress(mockUser.id)

      expect(progress).toBeDefined()
      expect(typeof progress.totalSessions).toBe('number')
      expect(typeof progress.completedSessions).toBe('number')
      expect(typeof progress.hasCompletedFirstSession).toBe('boolean')
    })

    it('should check conversation eligibility', async () => {
      const eligibility = await sessionService.canStartNewConversation(mockUser.id)

      expect(eligibility).toBeDefined()
      expect(typeof eligibility.canStart).toBe('boolean')
      if (!eligibility.canStart) {
        expect(eligibility.reason).toBeDefined()
      }
    })

    it('should create new session', async () => {
      const result = await sessionService.createSession({
        userId: mockUser.id,
        companyId: mockCompany.id,
        pitchDeckId: 'test-deck-id',
        personaType: 'angel'
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.sessionId).toBeDefined()
      }
    })

    it('should update session status', async () => {
      const success = await sessionService.updateSession(mockSession.id, {
        status: 'completed',
        duration_minutes: 30
      })

      expect(success).toBe(true)
    })

    it('should get session by ID', async () => {
      const session = await sessionService.getSessionById(mockSession.id)

      expect(session).toBeDefined()
      if (session) {
        expect(session.id).toBe(mockSession.id)
      }
    })

    it('should get recent sessions', async () => {
      const sessions = await sessionService.getRecentSessions(mockUser.id, 5)

      expect(Array.isArray(sessions)).toBe(true)
      expect(sessions.length).toBeLessThanOrEqual(5)
    })
  })

  describe('Follow-up Questions Integration', () => {
    it('should generate follow-up questions', async () => {
      const result = await generateFollowUpQuestions(mockSession.id)

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should get follow-up questions', async () => {
      const { data, error } = await getFollowUpQuestions(mockSession.id)

      expect(error).toBeUndefined()
      expect(Array.isArray(data)).toBe(true)
    })

    it('should toggle question selection', async () => {
      const result = await toggleQuestionSelection('test-question-id', true)

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  describe('Report Service Integration', () => {
    it('should generate session report', async () => {
      const { data, error } = await generateSessionReport(mockSession.id)

      expect(error).toBeUndefined()
      expect(data).toBeDefined()
      if (data) {
        expect(data.session_id).toBe(mockSession.id)
        expect(data.report_data).toBeDefined()
      }
    })

    it('should get existing session report', async () => {
      const { data, error } = await getSessionReport(mockSession.id)

      expect(error).toBeUndefined()
      expect(data).toBeDefined()
    })

    it('should handle report email sending', async () => {
      const { success, error } = await emailSessionReport(mockSession.id)

      expect(error).toBeUndefined()
      expect(success).toBe(true)
    })

    it('should handle report generation errors', async () => {
      // Mock an error in report generation
      const mockInvoke = vi.fn(() => Promise.resolve({ 
        data: null, 
        error: { message: 'Report generation failed' }
      }))

      vi.mocked(supabase.functions.invoke).mockImplementation(mockInvoke)

      const { data, error } = await generateSessionReport('invalid-session-id')

      expect(data).toBeNull()
      expect(error).toBeDefined()
    })
  })

  describe('Real-time Subscriptions', () => {
    it('should create channel subscription', () => {
      const channel = supabase.channel('test-channel')

      expect(channel).toBeDefined()
      expect(typeof channel.on).toBe('function')
      expect(typeof channel.subscribe).toBe('function')
      expect(typeof channel.unsubscribe).toBe('function')
    })

    it('should handle subscription lifecycle', () => {
      const mockSubscribe = vi.fn()
      const mockUnsubscribe = vi.fn()
      const mockOn = vi.fn().mockReturnThis()

      const channel = {
        on: mockOn,
        subscribe: mockSubscribe,
        unsubscribe: mockUnsubscribe,
      }

      vi.mocked(supabase.channel).mockReturnValue(channel as any)

      const subscription = supabase
        .channel('test-session')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'sessions'
        }, () => {})
        .subscribe()

      expect(mockOn).toHaveBeenCalled()
      expect(mockSubscribe).toHaveBeenCalled()

      subscription.unsubscribe()
      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })

  describe('Edge Functions Integration', () => {
    it('should invoke edge functions', async () => {
      const { data, error } = await supabase.functions.invoke('test-function', {
        body: { test: 'data' }
      })

      expect(error).toBeNull()
      expect(data).toBeDefined()
    })

    it('should handle edge function errors', async () => {
      const mockInvoke = vi.fn(() => Promise.resolve({ 
        data: null, 
        error: { message: 'Function execution failed' }
      }))

      vi.mocked(supabase.functions.invoke).mockImplementation(mockInvoke)

      const { data, error } = await supabase.functions.invoke('failing-function')

      expect(data).toBeNull()
      expect(error).toBeDefined()
      expect(error.message).toBe('Function execution failed')
    })
  })

  describe('Performance and Optimization', () => {
    it('should handle concurrent database operations', async () => {
      const operations = [
        supabase.from('profiles').select('*').eq('user_id', mockUser.id).single(),
        supabase.from('companies').select('*').eq('user_id', mockUser.id).single(),
        supabase.from('sessions').select('*').eq('user_id', mockUser.id),
      ]

      const results = await Promise.all(operations)

      expect(results).toHaveLength(3)
      results.forEach(result => {
        expect(result.error).toBeNull()
        expect(result.data).toBeDefined()
      })
    })

    it('should handle large dataset queries with pagination', async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', mockUser.id)
        .order('created_at', { ascending: false })
        .limit(10)

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeLessThanOrEqual(10)
    })

    it('should handle database connection timeouts', async () => {
      // Mock a timeout scenario
      const mockFrom = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Connection timeout')), 100)
        }))
      }))

      vi.mocked(supabase.from).mockImplementation(mockFrom)

      try {
        await supabase
          .from('profiles')
          .select('*')
          .eq('id', mockUser.id)
          .single()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Connection timeout')
      }
    })
  })
})