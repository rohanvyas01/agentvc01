import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tavusService } from '../tavusService';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    functions: {
      invoke: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              single: vi.fn()
            }))
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn()
      }))
    }))
  }
}));

describe('TavusService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('autoSelectPersona', () => {
    it('should select angel for early stage funding rounds', () => {
      expect(tavusService.autoSelectPersona('pre-seed')).toBe('angel');
      expect(tavusService.autoSelectPersona('seed')).toBe('angel');
      expect(tavusService.autoSelectPersona('angel')).toBe('angel');
      expect(tavusService.autoSelectPersona('friends and family')).toBe('angel');
    });

    it('should select vc for later stage funding rounds', () => {
      expect(tavusService.autoSelectPersona('Series A')).toBe('vc');
      expect(tavusService.autoSelectPersona('Series B')).toBe('vc');
      expect(tavusService.autoSelectPersona('Growth')).toBe('vc');
    });

    it('should default to vc when funding round is undefined', () => {
      expect(tavusService.autoSelectPersona()).toBe('vc');
      expect(tavusService.autoSelectPersona('')).toBe('vc');
    });
  });

  describe('createConversation', () => {
    it('should handle successful conversation creation', async () => {
      const mockUser = { id: 'test-user-id' };
      const mockResponse = {
        success: true,
        session_id: 'test-session-id',
        conversation_id: 'test-conversation-id',
        conversation_url: 'https://test-conversation-url.com'
      };

      // Mock successful auth
      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock successful function call
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockResponse,
        error: null
      });

      const result = await tavusService.createConversation({
        companyId: 'test-company-id',
        pitchDeckId: 'test-deck-id',
        fundingRound: 'seed'
      });

      expect(result.success).toBe(true);
      expect(result.session_id).toBe('test-session-id');
      expect(result.conversation_url).toBe('https://test-conversation-url.com');
    });

    it('should handle authentication errors', async () => {
      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      });

      const result = await tavusService.createConversation({
        companyId: 'test-company-id'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('User not authenticated');
    });

    it('should handle function invocation errors', async () => {
      const mockUser = { id: 'test-user-id' };
      const { supabase } = await import('../../lib/supabase');
      
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: { message: 'Function error' }
      });

      const result = await tavusService.createConversation({
        companyId: 'test-company-id'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to create conversation');
    });
  });

  describe('redirectToConversation', () => {
    it('should open conversation URL in new window', () => {
      const mockOpen = vi.fn();
      vi.stubGlobal('window', { open: mockOpen });

      const testUrl = 'https://test-conversation.com';
      tavusService.redirectToConversation(testUrl);

      expect(mockOpen).toHaveBeenCalledWith(
        testUrl,
        '_blank',
        'noopener,noreferrer'
      );
    });
  });

  describe('retryConversationCreation', () => {
    it('should retry failed conversation creation', async () => {
      const mockUser = { id: 'test-user-id' };
      const { supabase } = await import('../../lib/supabase');
      
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // First two calls fail, third succeeds
      vi.mocked(supabase.functions.invoke)
        .mockResolvedValueOnce({
          data: { success: false, error: 'network error' },
          error: null
        })
        .mockResolvedValueOnce({
          data: { success: false, error: 'timeout' },
          error: null
        })
        .mockResolvedValueOnce({
          data: { success: true, session_id: 'test-session' },
          error: null
        });

      const result = await tavusService.retryConversationCreation({
        companyId: 'test-company-id'
      }, 3);

      expect(result.success).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledTimes(3);
    }, 10000); // Increase timeout for retry delays

    it('should fail after max retries', async () => {
      const mockUser = { id: 'test-user-id' };
      const { supabase } = await import('../../lib/supabase');
      
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // All calls fail with retryable errors
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: false, error: 'network error' },
        error: null
      });

      const result = await tavusService.retryConversationCreation({
        companyId: 'test-company-id'
      }, 2);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed after 2 attempts');
      expect(supabase.functions.invoke).toHaveBeenCalledTimes(2);
    }, 10000); // Increase timeout for retry delays
  });
});