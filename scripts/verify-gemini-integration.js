#!/usr/bin/env node

/**
 * Verification script for Gemini AI analysis integration
 * 
 * This script tests the analyze-conversation Edge Function by:
 * 1. Creating a test session with mock data
 * 2. Calling the analyze-conversation function
 * 3. Verifying the analysis results are stored correctly
 * 4. Cleaning up test data
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test data
const testData = {
  userId: '00000000-0000-0000-0000-000000000001', // Test user ID
  companyData: {
    name: 'TestCorp AI',
    industry: 'Artificial Intelligence',
    stage: 'Seed',
    one_liner: 'AI-powered customer service automation for small businesses',
    funding_round: 'seed'
  },
  pitchDeckData: {
    deck_name: 'TestCorp Pitch Deck',
    extracted_text: `
Problem: Small businesses struggle with customer service, spending 40% of their time on repetitive inquiries.

Solution: AI-powered automation platform that handles 80% of customer inquiries automatically.

Market: $50B customer service market growing at 15% annually. 30M small businesses in our target market.

Business Model: SaaS subscription - $99/month per business. Projected $10M ARR by year 3.

Traction: 100 beta customers, 95% satisfaction rate, $50K MRR.

Team: Experienced founders with previous exits in SaaS and AI.

Funding: Raising $2M seed round for product development and customer acquisition.
    `.trim(),
    file_type: 'pdf',
    processing_status: 'processed'
  },
  transcriptData: [
    {
      speaker: 'founder',
      content: 'Hello, thank you for taking the time to meet with me today. I\'m excited to share TestCorp AI with you.',
      timestamp_ms: 1000
    },
    {
      speaker: 'investor',
      content: 'Great to meet you. Tell me about your company and what problem you\'re solving.',
      timestamp_ms: 5000
    },
    {
      speaker: 'founder',
      content: 'We\'re building an AI-powered platform that helps small businesses automate their customer service. Small businesses currently spend 40% of their time handling repetitive customer inquiries, which is incredibly inefficient.',
      timestamp_ms: 10000
    },
    {
      speaker: 'investor',
      content: 'Interesting. What\'s your solution and how does it work?',
      timestamp_ms: 20000
    },
    {
      speaker: 'founder',
      content: 'Our platform uses advanced AI to automatically handle 80% of customer inquiries. We integrate with existing systems and learn from each business\'s specific needs. The market size is $50 billion and growing at 15% annually.',
      timestamp_ms: 25000
    },
    {
      speaker: 'investor',
      content: 'What\'s your business model and current traction?',
      timestamp_ms: 35000
    },
    {
      speaker: 'founder',
      content: 'We use a SaaS subscription model at $99 per month per business. We currently have 100 beta customers with a 95% satisfaction rate and $50K in monthly recurring revenue. We\'re projecting $10M ARR by year 3.',
      timestamp_ms: 40000
    },
    {
      speaker: 'investor',
      content: 'That\'s impressive traction. What are you raising and what will you use the funds for?',
      timestamp_ms: 50000
    },
    {
      speaker: 'founder',
      content: 'We\'re raising a $2M seed round. The funds will be used primarily for product development and customer acquisition. We have a strong team with previous exits in SaaS and AI.',
      timestamp_ms: 55000
    },
    {
      speaker: 'investor',
      content: 'Thank you for the presentation. I\'ll follow up with you soon.',
      timestamp_ms: 65000
    }
  ]
};

async function createTestData() {
  console.log('📝 Creating test data...');

  try {
    // Create test company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        user_id: testData.userId,
        ...testData.companyData
      })
      .select()
      .single();

    if (companyError) throw companyError;
    console.log('✅ Test company created:', company.id);

    // Create test pitch deck
    const { data: pitchDeck, error: deckError } = await supabase
      .from('pitch_decks')
      .insert({
        user_id: testData.userId,
        ...testData.pitchDeckData
      })
      .select()
      .single();

    if (deckError) throw deckError;
    console.log('✅ Test pitch deck created:', pitchDeck.id);

    // Create test session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: testData.userId,
        company_id: company.id,
        pitch_deck_id: pitchDeck.id,
        tavus_conversation_id: 'test-conversation-123',
        tavus_persona_id: 'vc-persona-1',
        status: 'completed',
        duration_minutes: 10,
        started_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (sessionError) throw sessionError;
    console.log('✅ Test session created:', session.id);

    // Create test transcript
    const transcriptInserts = testData.transcriptData.map(segment => ({
      session_id: session.id,
      ...segment
    }));

    const { error: transcriptError } = await supabase
      .from('conversation_transcripts')
      .insert(transcriptInserts);

    if (transcriptError) throw transcriptError;
    console.log('✅ Test transcript created with', testData.transcriptData.length, 'segments');

    return {
      companyId: company.id,
      pitchDeckId: pitchDeck.id,
      sessionId: session.id
    };

  } catch (error) {
    console.error('❌ Error creating test data:', error);
    throw error;
  }
}

async function testAnalysisFunction(sessionId) {
  console.log('🧠 Testing Gemini analysis function...');

  try {
    const { data, error } = await supabase.functions.invoke('analyze-conversation', {
      body: { session_id: sessionId }
    });

    if (error) {
      console.error('❌ Analysis function error:', error);
      return false;
    }

    console.log('✅ Analysis function response:', data);

    // Verify analysis was stored
    const { data: analysis, error: analysisError } = await supabase
      .from('conversation_analysis')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (analysisError) {
      console.error('❌ Error fetching stored analysis:', analysisError);
      return false;
    }

    console.log('✅ Analysis stored successfully:');
    console.log('   - Overall Score:', analysis.overall_score);
    console.log('   - Key Strengths:', analysis.key_strengths?.length || 0, 'items');
    console.log('   - Improvement Areas:', analysis.improvement_areas?.length || 0, 'items');
    console.log('   - Follow-up Questions:', analysis.follow_up_questions?.length || 0, 'items');

    // Verify report was generated
    const { data: report, error: reportError } = await supabase
      .from('session_reports')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (reportError) {
      console.error('❌ Error fetching generated report:', reportError);
      return false;
    }

    console.log('✅ Session report generated successfully');
    console.log('   - Report contains transcript:', !!report.report_data?.transcript);
    console.log('   - Report contains analysis:', !!report.report_data?.analysis);
    console.log('   - Report contains recommendations:', report.report_data?.recommendations?.length || 0, 'items');

    return true;

  } catch (error) {
    console.error('❌ Error testing analysis function:', error);
    return false;
  }
}

async function cleanupTestData(testIds) {
  console.log('🧹 Cleaning up test data...');

  try {
    // Delete in reverse order due to foreign key constraints
    await supabase.from('session_reports').delete().eq('session_id', testIds.sessionId);
    await supabase.from('conversation_analysis').delete().eq('session_id', testIds.sessionId);
    await supabase.from('conversation_transcripts').delete().eq('session_id', testIds.sessionId);
    await supabase.from('sessions').delete().eq('id', testIds.sessionId);
    await supabase.from('pitch_decks').delete().eq('id', testIds.pitchDeckId);
    await supabase.from('companies').delete().eq('id', testIds.companyId);

    console.log('✅ Test data cleaned up successfully');

  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
  }
}

async function main() {
  console.log('🚀 Starting Gemini AI integration verification...\n');

  let testIds = null;

  try {
    // Create test data
    testIds = await createTestData();
    console.log('');

    // Test analysis function
    const success = await testAnalysisFunction(testIds.sessionId);
    console.log('');

    if (success) {
      console.log('🎉 Gemini AI integration verification completed successfully!');
      console.log('');
      console.log('✅ All tests passed:');
      console.log('   - Test data creation');
      console.log('   - Analysis function execution');
      console.log('   - Analysis result storage');
      console.log('   - Report generation');
    } else {
      console.log('❌ Gemini AI integration verification failed');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);

  } finally {
    // Always cleanup test data
    if (testIds) {
      console.log('');
      await cleanupTestData(testIds);
    }
  }
}

// Run the verification
main().catch(console.error);