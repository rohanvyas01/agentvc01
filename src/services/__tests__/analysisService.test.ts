import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  triggerConversationAnalysis,
  getSessionAnalysis,
  getSessionReport,
  getUserSessionAnalyses,
  isAnalysisAvailable,
  getAnalysisStatus
} from '../analysisService';

// Mock Supabase
const mockSupabase = {
  functions: {
    invoke: vi.fn()
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
        order: vi.fn(() => ({}))
      }))
    }))
  })),
  channel: vi.fn(() => ({
    on: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn()
      }))
    }))
  }))
};

vi.mock('../lib/supabase', () => ({
  supabase: mockSupabase
}));

describe('analysisService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('triggerConversationAnalysis', () => {
    it('should successfully trigger analysis', async () => {
      mockSupabase.functions.invoke.mockResolvedValue({
        data: { success: true, message: 'Analysis triggered' },
        error: null
      });

      const result = await triggerConversationAnalysis('test-session-123');

      expect(result.success).toBe(true);
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('analyze-conversation', {
        body: { session_id: 'test-session-123' }
      });
    });

    it('should handle analysis trigger errors', async () => {
      mockSupabase.functions.invoke.mockResolvedValue({
        data: null,
        error: { message: 'Analysis failed' }
      });

      const result = await triggerConversationAnalysis('test-session-123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ANALYSIS_TRIGGER_FAILED');
      expect(result.error?.message).toBe('Analysis failed');
    });

    it('should handle network errors', async () => {
      mockSupabase.functions.invoke.mockRejectedValue(new Error('Network error'));

      const result = await triggerConversationAnalysis('test-session-123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ANALYSIS_TRIGGER_ERROR');
      expect(result.error?.message).toBe('Network error');
    });
  });

  describe('getSessionAnalysis', () => {
    it('should successfully fetch analysis', async () => {
      const mockAnalysis = {
        id: 'analysis-123',
        session_id: 'session-123',
        key_strengths: ['Clear communication'],
        improvement_areas: ['Need more metrics'],
        follow_up_questions: ['What are your costs?'],
        overall_score: 7,
        created_at: '2024-01-01T00:00:00Z'
      };

      const mockQuery = {
        single: vi.fn().mockResolvedValue({
          data: mockAnalysis,
          error: null
        })
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(mockQuery)
        })
      });

      const result = await getSessionAnalysis('session-123');

      expect(result.data).toEqual(mockAnalysis);
      expect(result.error).toBeUndefined();
    });

    it('should handle no analysis found', async () => {
      const mockQuery = {
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        })
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(mockQuery)
        })
      });

      const result = await getSessionAnalysis('session-123');

      expect(result.data).toBeNull();
      expect(result.error).toBeUndefined();
    });

    it('should handle database errors', async () => {
      const mockQuery = {
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(mockQuery)
        })
      });

      const result = await getSessionAnalysis('session-123');

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('ANALYSIS_FETCH_FAILED');
    });
  });

  describe('getSessionReport', () => {
    it('should successfully fetch report', async () => {
      const mockReport = {
        id: 'report-123',
        session_id: 'session-123',
        report_data: {
          summary: { overall_score: 8 },
          analysis: { key_strengths: ['Good presentation'] }
        },
        email_sent: false,
        created_at: '2024-01-01T00:00:00Z'
      };

      const mockQuery = {
        single: vi.fn().mockResolvedValue({
          data: mockReport,
          error: null
        })
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(mockQuery)
        })
      });

      const result = await getSessionReport('session-123');

      expect(result.data).toEqual(mockReport);
      expect(result.error).toBeUndefined();
    });
  });

  describe('isAnalysisAvailable', () => {
    it('should return true when analysis exists', async () => {
      const mockQuery = {
        single: vi.fn().mockResolvedValue({
          data: { id: 'analysis-123' },
          error: null
        })
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(mockQuery)
        })
      });

      const result = await isAnalysisAvailable('session-123');

      expect(result).toBe(true);
    });

    it('should return false when analysis does not exist', async () => {
      const mockQuery = {
        single: vi.fn().mockRejectedValue(new Error('Not found'))
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(mockQuery)
        })
      });

      const result = await isAnalysisAvailable('session-123');

      expect(result).toBe(false);
    });
  });

  describe('getAnalysisStatus', () => {
    it('should return completed status when analysis exists', async () => {
      const mockAnalysis = {
        id: 'analysis-123',
        session_id: 'session-123',
        overall_score: 7
      };

      // Mock getSessionAnalysis to return analysis
      const mockQuery = {
        single: vi.fn().mockResolvedValue({
          data: mockAnalysis,
          error: null
        })
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(mockQuery)
        })
      });

      const result = await getAnalysisStatus('session-123');

      expect(result.status).toBe('completed');
      expect(result.analysis).toEqual(mockAnalysis);
    });

    it('should return not_started status for incomplete session', async () => {
      // Mock no analysis found
      const mockAnalysisQuery = {
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        })
      };

      // Mock session with incomplete status
      const mockSessionQuery = {
        single: vi.fn().mockResolvedValue({
          data: { status: 'active', completed_at: null },
          error: null
        })
      };

      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue(mockAnalysisQuery)
          })
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue(mockSessionQuery)
          })
        });

      const result = await getAnalysisStatus('session-123');

      expect(result.status).toBe('not_started');
    });

    it('should return in_progress status for completed session without analysis', async () => {
      // Mock no analysis found
      const mockAnalysisQuery = {
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        })
      };

      // Mock session with completed status
      const mockSessionQuery = {
        single: vi.fn().mockResolvedValue({
          data: { status: 'completed', completed_at: '2024-01-01T00:00:00Z' },
          error: null
        })
      };

      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue(mockAnalysisQuery)
          })
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue(mockSessionQuery)
          })
        });

      const result = await getAnalysisStatus('session-123');

      expect(result.status).toBe('in_progress');
    });
  });
});

console.log('All analysisService tests completed successfully!');