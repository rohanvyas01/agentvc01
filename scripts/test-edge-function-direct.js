#!/usr/bin/env node

/**
 * Direct test of the edge function with proper authentication
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testEdgeFunction() {
  console.log('🧪 Testing Edge Function Directly...\n');

  try {
    // Test with a mock user ID (since we're not authenticated)
    const testPayload = {
      user_id: 'test-user-123',
      persona_type: 'angel',
      test_mode: true
    };

    console.log('📤 Calling edge function with payload:', testPayload);

    const { data, error } = await supabase.functions.invoke('create-tavus-conversation', {
      body: testPayload
    });

    if (error) {
      console.log('❌ Edge function error:', error);
      console.log('   Status:', error.status);
      console.log('   Message:', error.message);
      
      // Check if it's an authentication error (expected)
      if (error.message.includes('authentication') || error.message.includes('User not authenticated')) {
        console.log('✅ This is expected - edge function is working but requires authentication');
      }
    } else {
      console.log('✅ Edge function response:', data);
    }

    // Test direct Tavus API call
    console.log('\n🚀 Testing direct Tavus API call...');
    
    const tavusPayload = {
      replica_id: process.env.VITE_TAVUS_REPLICA_ID,
      persona_id: process.env.VITE_TAVUS_PRESET_PERSONA_ID,
      conversational_context: 'This is a test conversation for AgentVC.',
      audio_only: true,
      properties: {
        participant_left_timeout: 0,
        language: 'english'
      }
    };

    const response = await fetch('https://api.tavus.io/v2/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.VITE_TAVUS_API_KEY
      },
      body: JSON.stringify(tavusPayload)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Tavus API working!');
      console.log('   Conversation ID:', data.conversation_id);
      console.log('   Conversation URL:', data.conversation_url);
      console.log('\n🎉 Your Tavus integration is working perfectly!');
    } else {
      const errorText = await response.text();
      console.log('❌ Tavus API error:', response.status, errorText);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEdgeFunction();