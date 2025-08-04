#!/usr/bin/env node

/**
 * Create a test user for testing the conversation flow
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function createTestUser() {
  console.log('👤 Creating Test User...\n');

  const testEmail = 'test@agentvc.com';
  const testPassword = 'testpassword123';

  try {
    // Try to sign up
    console.log('📝 Signing up test user...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (signUpError && !signUpError.message.includes('already registered')) {
      throw signUpError;
    }

    // Sign in
    console.log('🔐 Signing in test user...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) {
      throw signInError;
    }

    const user = signInData.user;
    console.log('✅ Test user authenticated:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);

    // Test the edge function
    console.log('\n🧪 Testing edge function with test user...');
    
    const { data, error } = await supabase.functions.invoke('create-tavus-conversation', {
      body: {
        user_id: user.id,
        persona_type: 'angel'
      }
    });

    if (error) {
      console.log('❌ Edge function failed:', error.message);
      
      // Try to get error details
      if (error.context) {
        try {
          const errorBody = await error.context.text();
          const errorData = JSON.parse(errorBody);
          console.log('   Error details:', errorData.error);
        } catch (e) {
          console.log('   Could not parse error details');
        }
      }
    } else {
      console.log('✅ Edge function works!');
      console.log('   Session ID:', data.session_id);
      console.log('   Conversation URL:', data.conversation_url);
      console.log('\n🎉 Your conversation flow is working perfectly!');
    }

    // Clean up - sign out
    await supabase.auth.signOut();

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

createTestUser();