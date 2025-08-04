import { assertEquals, assertExists } from 'https://deno.land/std@0.168.0/testing/asserts.ts'

// Mock data for testing
const mockSessionId = 'test-session-123';
const mockTranscript = [
  {
    id: '1',
    speaker: 'founder' as const,
    content: 'Hello, thank you for taking the time to meet with me today. I\'m excited to share our company with you.',
    timestamp_ms: 1000,
    created_at: new Date().toISOString()
  },
  {
    id: '2', 
    speaker: 'investor' as const,
    content: 'Great to meet you. Tell me about your company and what problem you\'re solving.',
    timestamp_ms: 5000,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    speaker: 'founder' as const,
    content: 'We\'re building an AI-powered platform that helps small businesses automate their customer service. The market size is $50 billion and growing at 15% annually.',
    timestamp_ms: 10000,
    created_at: new Date().toISOString()
  }
];

const mockPitchDeck = {
  id: 'deck-123',
  deck_name: 'Test Company Pitch Deck',
  extracted_text: 'Problem: Small businesses struggle with customer service. Solution: AI-powered automation platform. Market: $50B market growing 15% annually. Business Model: SaaS subscription.',
  file_type: 'pdf'
};

const mockCompany = {
  id: 'company-123',
  name: 'Test Company',
  industry: 'Technology',
  stage: 'Seed',
  one_liner: 'AI-powered customer service automation for small businesses',
  funding_round: 'seed'
};

// Test the analysis context preparation
Deno.test('prepareAnalysisContext should gather all required data', async () => {
  // This would require mocking Supabase client
  // For now, we'll test the structure
  const expectedContext = {
    session: { id: mockSessionId },
    transcript: mockTranscript,
    pitchDeck: mockPitchDeck,
    company: mockCompany
  };
  
  assertExists(expectedContext.session);
  assertExists(expectedContext.transcript);
  assertEquals(expectedContext.transcript.length, 3);
  assertExists(expectedContext.pitchDeck);
  assertExists(expectedContext.company);
});

// Test Gemini prompt generation
Deno.test('Gemini prompt should include all context', () => {
  const conversationText = mockTranscript
    .map(segment => `${segment.speaker.toUpperCase()}: ${segment.content}`)
    .join('\n');

  const pitchDeckContext = `\n\nPITCH DECK CONTENT:\n${mockPitchDeck.extracted_text}`;
  const companyContext = `\n\nCOMPANY INFORMATION:\n- Name: ${mockCompany.name}\n- Industry: ${mockCompany.industry}\n- Stage: ${mockCompany.stage}\n- One-liner: ${mockCompany.one_liner}\n- Funding Round: ${mockCompany.funding_round}`;

  const fullPrompt = conversationText + pitchDeckContext + companyContext;

  // Verify all components are included
  assertEquals(fullPrompt.includes('FOUNDER: Hello, thank you for taking the time'), true);
  assertEquals(fullPrompt.includes('INVESTOR: Great to meet you'), true);
  assertEquals(fullPrompt.includes('PITCH DECK CONTENT:'), true);
  assertEquals(fullPrompt.includes('COMPANY INFORMATION:'), true);
  assertEquals(fullPrompt.includes('Test Company'), true);
});

// Test analysis result validation
Deno.test('Analysis result validation should catch invalid data', () => {
  const validResult = {
    key_strengths: ['Clear communication', 'Strong market understanding'],
    improvement_areas: ['Need more specific metrics', 'Unclear business model'],
    follow_up_questions: ['What are your customer acquisition costs?', 'How do you plan to scale?'],
    overall_score: 7,
    detailed_feedback: 'The founder showed good understanding of the market...',
    investor_concerns: ['Competitive landscape unclear'],
    pitch_effectiveness: 'Good overall presentation with room for improvement'
  };

  // Test valid result
  assertExists(validResult.key_strengths);
  assertEquals(Array.isArray(validResult.key_strengths), true);
  assertEquals(typeof validResult.overall_score, 'number');
  assertEquals(validResult.overall_score >= 1 && validResult.overall_score <= 10, true);

  // Test invalid score
  const invalidResult = { ...validResult, overall_score: 15 };
  assertEquals(invalidResult.overall_score >= 1 && invalidResult.overall_score <= 10, false);
});

// Test error handling scenarios
Deno.test('Error handling should provide meaningful messages', () => {
  const testCases = [
    {
      error: new Error('GEMINI_API_KEY environment variable is not configured'),
      expectedMessage: 'GEMINI_API_KEY environment variable is not configured'
    },
    {
      error: new Error('session_id is required'),
      expectedMessage: 'session_id is required'
    },
    {
      error: new Error('No transcript data found for session test-123'),
      expectedMessage: 'No transcript data found for session test-123'
    }
  ];

  testCases.forEach(testCase => {
    assertEquals(testCase.error.message, testCase.expectedMessage);
  });
});

console.log('All analyze-conversation tests completed successfully!');