#!/usr/bin/env node

/**
 * Check authentication status
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkAuthStatus() {
  console.log('🔐 Checking Authentication Status...\n');

  try {
    // Check current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('❌ Auth Error:', userError.message);
      return;
    }

    if (!user) {
      console.log('❌ No authenticated user found');
      console.log('\n💡 To fix this:');
      console.log('1. Make sure you\'re logged in to your app');
      console.log('2. Check if your auth token is valid');
      console.log('3. Try refreshing your browser');
      return;
    }

    console.log('✅ User authenticated:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Created:', new Date(user.created_at).toLocaleString());

    // Test edge function with real user
    console.log('\n🧪 Testing edge function with authenticated user...');
    
    const { data, error } = await supabase.functions.invoke('create-tavus-conversation', {
      body: {
        user_id: user.id,
        persona_type: 'angel',
        test_mode: true
      }
    });

    if (error) {
      console.log('❌ Edge function failed:', error.message);
    } else {
      console.log('✅ Edge function works with authenticated user:', data);
    }

    // Test real conversation creation
    console.log('\n🚀 Testing real conversation creation...');
    
    const { data: realData, error: realError } = await supabase.functions.invoke('create-tavus-conversation', {
      body: {
        user_id: user.id,
        persona_type: 'angel'
      }
    });

    if (realError) {
      console.log('❌ Real conversation creation failed:', realError.message);
      
      // Try to get more details
      if (realError.context) {
        try {
          const errorBody = await realError.context.text();
          const errorData = JSON.parse(errorBody);
          console.log('   Detailed error:', errorData.error);
        } catch (e) {
          console.log('   Could not parse error details');
        }
      }
    } else {
      console.log('✅ Real conversation creation works:', realData);
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkAuthStatus();