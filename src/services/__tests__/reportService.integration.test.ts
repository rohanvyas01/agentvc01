import { describe, it, expect } from 'vitest';

describe('ReportService Integration', () => {
  it('should have all required functions exported', async () => {
    // Test that all required functions are available
    const reportService = await import('../reportService');
    
    expect(typeof reportService.generateSessionReport).toBe('function');
    expect(typeof reportService.getSessionReport).toBe('function');
    expect(typeof reportService.emailSessionReport).toBe('function');
    expect(typeof reportService.exportReportAsPDF).toBe('function');
    expect(typeof reportService.getUserReports).toBe('function');
    expect(typeof reportService.deleteSessionReport).toBe('function');
    expect(typeof reportService.subscribeToReportUpdates).toBe('function');
  });

  it('should handle invalid session IDs gracefully', async () => {
    const { generateSessionReport } = await import('../reportService');
    
    const result = await generateSessionReport('invalid-session-id');
    
    // Should return an error for invalid session
    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.error?.code).toBe('SESSION_NOT_FOUND');
  });

  it('should handle missing report gracefully', async () => {
    const { getSessionReport } = await import('../reportService');
    
    const result = await getSessionReport('non-existent-session');
    
    // Should return null data when no report exists
    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
  });

  it('should validate email report parameters', async () => {
    const { emailSessionReport } = await import('../reportService');
    
    const result = await emailSessionReport('invalid-session');
    
    // Should fail gracefully for invalid session
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should validate PDF export parameters', async () => {
    const { exportReportAsPDF } = await import('../reportService');
    
    const result = await exportReportAsPDF('invalid-session');
    
    // Should fail gracefully for invalid session
    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
  });

  it('should validate user reports parameters', async () => {
    const { getUserReports } = await import('../reportService');
    
    const result = await getUserReports('invalid-user');
    
    // Should return empty array for invalid user
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBe(0);
  });

  it('should validate delete report parameters', async () => {
    const { deleteSessionReport } = await import('../reportService');
    
    const result = await deleteSessionReport('invalid-report');
    
    // Should fail gracefully for invalid report
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should create subscription object', async () => {
    const { subscribeToReportUpdates } = await import('../reportService');
    
    const mockCallback = () => {};
    const mockErrorCallback = () => {};
    
    const subscription = subscribeToReportUpdates('test-session', mockCallback, mockErrorCallback);
    
    // Should return a subscription-like object
    expect(subscription).toBeDefined();
    expect(typeof subscription.unsubscribe).toBe('function');
  });
});

describe('Report Data Structure', () => {
  it('should define proper report interfaces', async () => {
    // Test that the service exports the expected interface structure
    const reportService = await import('../reportService');
    
    // These should be available as types/interfaces
    expect(reportService).toBeDefined();
  });

  it('should handle report generation options', async () => {
    const { generateSessionReport } = await import('../reportService');
    
    // Test with different options
    const options = {
      includeTranscript: false,
      includeAnalysis: true,
      includeRecommendations: true,
      format: 'json' as const
    };
    
    const result = await generateSessionReport('test-session', options);
    
    // Should handle options gracefully even if session doesn't exist
    expect(result).toBeDefined();
    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
  });

  it('should handle email options', async () => {
    const { emailSessionReport } = await import('../reportService');
    
    const options = {
      recipientEmail: 'test@example.com',
      subject: 'Test Report',
      includeAttachment: true
    };
    
    const result = await emailSessionReport('test-session', options);
    
    // Should handle options gracefully
    expect(result).toBeDefined();
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});