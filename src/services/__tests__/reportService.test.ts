import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  generateSessionReport, 
  getSessionReport, 
  emailSessionReport, 
  exportReportAsPDF,
  getUserReports,
  deleteSessionReport
} from '../reportService';

// Create mock functions
const mockSingle = vi.fn();
const mockSelect = vi.fn(() => ({
  eq: vi.fn(() => ({
    single: mockSingle,
    order: vi.fn(() => ({
      mockResolvedValueOnce: vi.fn()
    }))
  }))
}));
const mockInsert = vi.fn(() => ({
  select: vi.fn(() => ({
    single: vi.fn()
  }))
}));
const mockUpdate = vi.fn(() => ({
  eq: vi.fn()
}));
const mockDelete = vi.fn(() => ({
  eq: vi.fn()
}));
const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete
}));
const mockInvoke = vi.fn();

// Mock Supabase
const mockSupabase = {
  from: mockFrom,
  functions: {
    invoke: mockInvoke
  }
};

vi.mock('../../lib/supabase', () => ({
  supabase: mockSupabase
}));

describe('ReportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset all mock implementations
    mockSingle.mockReset();
    mockSelect.mockReset();
    mockInsert.mockReset();
    mockUpdate.mockReset();
    mockDelete.mockReset();
    mockFrom.mockReset();
    mockInvoke.mockReset();
    
    // Set up default mock chain
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete
    });
    
    mockSelect.mockReturnValue({
      eq: vi.fn(() => ({
        single: mockSingle,
        order: vi.fn(() => ({
          mockResolvedValueOnce: vi.fn()
        }))
      }))
    });
    
    mockInsert.mockReturnValue({
      select: vi.fn(() => ({
        single: vi.fn()
      }))
    });
    
    mockUpdate.mockReturnValue({
      eq: vi.fn()
    });
    
    mockDelete.mockReturnValue({
      eq: vi.fn()
    });
  });

  describe('generateSessionReport', () => {
    it('should generate a comprehensive session report', async () => {
      const sessionId = 'test-session-id';
      const mockSessionData = {
        id: sessionId,
        created_at: '2024-01-01T00:00:00Z',
        duration_minutes: 30,
        status: 'completed',
        companies: { name: 'Test Company' },
        pitch_decks: { deck_name: 'Test Deck', file_type: 'pdf' },
        conversation_transcripts: [
          {
            speaker: 'founder',
            content: 'Hello, I am pitching my startup',
            timestamp_ms: 1000
          }
        ],
        conversation_analysis: [{
          overall_score: 8,
          key_strengths: ['Clear communication'],
          improvement_areas: ['Market analysis'],
          follow_up_questions: ['What is your TAM?']
        }]
      };

      // Mock existing report check (none exists)
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      });

      // Mock session data fetch
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: mockSessionData,
        error: null
      });

      // Mock report save
      const mockSavedReport = {
        id: 'report-id',
        session_id: sessionId,
        report_data: expect.any(Object),
        email_sent: false,
        created_at: '2024-01-01T00:00:00Z'
      };

      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: mockSavedReport,
        error: null
      });

      const result = await generateSessionReport(sessionId);

      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.data?.session_id).toBe(sessionId);
    });

    it('should return existing report if one exists', async () => {
      const sessionId = 'test-session-id';
      const existingReport = {
        id: 'existing-report-id',
        session_id: sessionId,
        report_data: { summary: 'Existing report' },
        email_sent: false,
        created_at: '2024-01-01T00:00:00Z'
      };

      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: existingReport,
        error: null
      });

      const result = await generateSessionReport(sessionId);

      expect(result.data).toEqual(existingReport);
      expect(result.error).toBeUndefined();
    });

    it('should handle session not found error', async () => {
      const sessionId = 'non-existent-session';

      // Mock no existing report
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      });

      // Mock session not found
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Session not found' }
      });

      const result = await generateSessionReport(sessionId);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('SESSION_NOT_FOUND');
    });
  });

  describe('getSessionReport', () => {
    it('should get existing report without regeneration', async () => {
      const sessionId = 'test-session-id';
      const existingReport = {
        id: 'report-id',
        session_id: sessionId,
        report_data: { summary: 'Test report' },
        email_sent: false,
        created_at: '2024-01-01T00:00:00Z'
      };

      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: existingReport,
        error: null
      });

      const result = await getSessionReport(sessionId, false);

      expect(result.data).toEqual(existingReport);
      expect(result.error).toBeUndefined();
    });

    it('should force regeneration when requested', async () => {
      const sessionId = 'test-session-id';

      // Mock session data for regeneration
      const mockSessionData = {
        id: sessionId,
        created_at: '2024-01-01T00:00:00Z',
        duration_minutes: 30,
        status: 'completed',
        companies: { name: 'Test Company' },
        pitch_decks: { deck_name: 'Test Deck' },
        conversation_transcripts: [],
        conversation_analysis: [{ overall_score: 8 }]
      };

      mockSupabase.from().select().eq().single
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } }) // No existing report
        .mockResolvedValueOnce({ data: mockSessionData, error: null }); // Session data

      const mockNewReport = {
        id: 'new-report-id',
        session_id: sessionId,
        report_data: expect.any(Object),
        email_sent: false,
        created_at: '2024-01-01T00:00:00Z'
      };

      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: mockNewReport,
        error: null
      });

      const result = await getSessionReport(sessionId, true);

      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
    });
  });

  describe('emailSessionReport', () => {
    it('should send email report successfully', async () => {
      const sessionId = 'test-session-id';
      const mockReport = {
        id: 'report-id',
        session_id: sessionId,
        report_data: { summary: 'Test report' },
        email_sent: false,
        created_at: '2024-01-01T00:00:00Z'
      };

      // Mock get report
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: mockReport,
        error: null
      });

      // Mock email function call
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: { success: true, email_id: 'email-123' },
        error: null
      });

      // Mock report update
      mockSupabase.from().update().eq.mockResolvedValueOnce({
        error: null
      });

      const result = await emailSessionReport(sessionId);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('send-session-report', {
        body: expect.objectContaining({
          session_id: sessionId,
          report_id: mockReport.id
        })
      });
    });

    it('should handle email sending failure', async () => {
      const sessionId = 'test-session-id';
      const mockReport = {
        id: 'report-id',
        session_id: sessionId,
        report_data: { summary: 'Test report' },
        email_sent: false,
        created_at: '2024-01-01T00:00:00Z'
      };

      // Mock get report
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: mockReport,
        error: null
      });

      // Mock email function failure
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Email service unavailable' }
      });

      const result = await emailSessionReport(sessionId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('EMAIL_SEND_FAILED');
    });
  });

  describe('exportReportAsPDF', () => {
    it('should export report as PDF successfully', async () => {
      const sessionId = 'test-session-id';
      const mockReport = {
        id: 'report-id',
        session_id: sessionId,
        report_data: { summary: 'Test report' },
        email_sent: false,
        created_at: '2024-01-01T00:00:00Z'
      };

      // Mock get report
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: mockReport,
        error: null
      });

      // Mock PDF generation
      const mockPdfData = new ArrayBuffer(1024);
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: mockPdfData,
        error: null
      });

      const result = await exportReportAsPDF(sessionId);

      expect(result.data).toBeInstanceOf(Blob);
      expect(result.error).toBeUndefined();
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('generate-report-pdf', {
        body: expect.objectContaining({
          session_id: sessionId,
          report_data: mockReport.report_data
        })
      });
    });

    it('should handle PDF generation failure', async () => {
      const sessionId = 'test-session-id';
      const mockReport = {
        id: 'report-id',
        session_id: sessionId,
        report_data: { summary: 'Test report' },
        email_sent: false,
        created_at: '2024-01-01T00:00:00Z'
      };

      // Mock get report
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: mockReport,
        error: null
      });

      // Mock PDF generation failure
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'PDF generation failed' }
      });

      const result = await exportReportAsPDF(sessionId);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('PDF_GENERATION_FAILED');
    });
  });

  describe('getUserReports', () => {
    it('should get all reports for a user', async () => {
      const userId = 'test-user-id';
      const mockReports = [
        {
          id: 'report-1',
          session_id: 'session-1',
          report_data: { summary: 'Report 1' },
          email_sent: true,
          created_at: '2024-01-01T00:00:00Z',
          sessions: {
            user_id: userId,
            created_at: '2024-01-01T00:00:00Z',
            status: 'completed',
            duration_minutes: 30,
            companies: { name: 'Company 1' },
            pitch_decks: { deck_name: 'Deck 1' }
          }
        }
      ];

      mockSupabase.from().select().eq().order.mockResolvedValueOnce({
        data: mockReports,
        error: null
      });

      const result = await getUserReports(userId);

      expect(result.data).toEqual(mockReports);
      expect(result.error).toBeUndefined();
    });

    it('should handle user reports fetch failure', async () => {
      const userId = 'test-user-id';

      mockSupabase.from().select().eq().order.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      });

      const result = await getUserReports(userId);

      expect(result.data).toEqual([]);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('USER_REPORTS_FETCH_FAILED');
    });
  });

  describe('deleteSessionReport', () => {
    it('should delete report successfully', async () => {
      const reportId = 'report-id';

      mockSupabase.from().delete().eq.mockResolvedValueOnce({
        error: null
      });

      const result = await deleteSessionReport(reportId);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle delete failure', async () => {
      const reportId = 'report-id';

      mockSupabase.from().delete().eq.mockResolvedValueOnce({
        error: { message: 'Delete failed' }
      });

      const result = await deleteSessionReport(reportId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('REPORT_DELETE_FAILED');
    });
  });
});