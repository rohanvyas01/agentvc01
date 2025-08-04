import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  generateFollowUpQuestions, 
  getFollowUpQuestions, 
  getQuestionsByCategory,
  toggleQuestionSelection,
  getSelectedQuestions,
  createPracticeSession,
  getQuestionCategories
} from '../followUpQuestionsService';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          order: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [], error: null }))
          })),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        })),
        order: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        in: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        in: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }
}));

describe('followUpQuestionsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateFollowUpQuestions', () => {
    it('should generate questions for a session', async () => {
      const result = await generateFollowUpQuestions('test-session-id');
      expect(result.success).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      // Mock error
      const mockSupabase = await import('../../lib/supabase');
      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Database error' } }))
          }))
        })),
        insert: vi.fn(() => Promise.resolve({ data: [], error: null }))
      } as any);

      const result = await generateFollowUpQuestions('test-session-id');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getFollowUpQuestions', () => {
    it('should fetch questions for a session', async () => {
      const result = await getFollowUpQuestions('test-session-id');
      expect(result.data).toEqual([]);
    });
  });

  describe('getQuestionsByCategory', () => {
    it('should group questions by category', async () => {
      const result = await getQuestionsByCategory('test-session-id');
      expect(result.data).toEqual({});
    });
  });

  describe('toggleQuestionSelection', () => {
    it('should toggle question selection', async () => {
      const result = await toggleQuestionSelection('test-question-id', true);
      expect(result.success).toBe(true);
    });
  });

  describe('getSelectedQuestions', () => {
    it('should fetch selected questions', async () => {
      const result = await getSelectedQuestions('test-session-id');
      expect(result.data).toEqual([]);
    });
  });

  describe('createPracticeSession', () => {
    it('should create a practice session', async () => {
      const result = await createPracticeSession('test-session-id', ['q1', 'q2']);
      expect(result.success).toBe(true);
      expect(result.practiceSessionId).toBe('test-session-id');
    });
  });

  describe('getQuestionCategories', () => {
    it('should return question categories', () => {
      const categories = getQuestionCategories();
      expect(categories).toHaveLength(6);
      expect(categories[0].id).toBe('business_model');
      expect(categories[0].questions).toHaveLength(5);
    });
  });
});