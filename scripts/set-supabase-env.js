#!/usr/bin/env node

/**
 * Script to set Supabase edge function environment variables
 */

import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('🔧 Setting Supabase Edge Function Environment Variables...\n');

const envVars = {
  'TAVUS_API_KEY': process.env.VITE_TAVUS_API_KEY,
  'TAVUS_REPLICA_ID': process.env.VITE_TAVUS_REPLICA_ID,
  'TAVUS_PRESET_PERSONA_ID': process.env.VITE_TAVUS_PRESET_PERSONA_ID
};

console.log('Environment variables to set:');
for (const [key, value] of Object.entries(envVars)) {
  console.log(`${key}: ${value ? '✅ Present' : '❌ Missing'}`);
}

console.log('\n📋 Run these commands to set the environment variables in Supabase:');
console.log('');

for (const [key, value] of Object.entries(envVars)) {
  if (value) {
    console.log(`supabase secrets set ${key}="${value}"`);
  } else {
    console.log(`# ${key} is missing from .env.local`);
  }
}

console.log('\n🚀 After setting these, redeploy your edge functions:');
console.log('supabase functions deploy create-tavus-conversation');
console.log('supabase functions deploy tavus-webhook');
console.log('supabase functions deploy analyze-conversation');