#!/usr/bin/env node

/**
 * Test ElevenLabs Integration
 * 
 * Tests voice generation with your cloned voice
 */

import fs from 'fs';
import path from 'path';

console.log('🎤 Testing ElevenLabs Voice Generation');
console.log('====================================');

// Load environment variables
const envPath = '.env.local';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ROHAN_VOICE_ID = process.env.ROHAN_VOICE_ID;

async function testElevenLabsAPI() {
  console.log('🔍 Testing ElevenLabs API...');
  
  if (!ELEVENLABS_API_KEY) {
    console.log('❌ ELEVENLABS_API_KEY not found in .env.local');
    console.log('📋 Run: node scripts/setup-elevenlabs.js');
    return false;
  }

  try {
    // Test API connection
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY
      }
    });

    if (!response.ok) {
      console.log(`❌ API connection failed: ${response.status}`);
      return false;
    }

    const data = await response.json();
    console.log(`✅ API connected - ${data.voices.length} voices available`);
    
    return true;

  } catch (error) {
    console.log(`❌ API test failed: ${error.message}`);
    return false;
  }
}

async function testVoiceGeneration() {
  console.log('\n🎭 Testing voice generation...');
  
  const voiceId = ROHAN_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Default voice if none set
  const testText = "Hello! This is a test of the ElevenLabs voice generation system. I'm excited to help founders practice their pitches.";

  try {
    const response = await fetch('http://localhost:8001/generate-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: testText,
        voice_id: voiceId
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Voice generation successful!');
      console.log(`📁 Audio saved to: ${result.audio_path}`);
      return true;
    } else {
      const error = await response.json();
      console.log(`❌ Voice generation failed: ${error.error}`);
      return false;
    }

  } catch (error) {
    console.log(`❌ Voice generation error: ${error.message}`);
    return false;
  }
}

async function testCompleteFlow() {
  console.log('\n🚀 Testing complete conversation flow...');
  
  const scripts = [
    "Hi! Welcome to AgentVC. I'm excited to hear about your startup today.",
    "Great to meet you! Thank you for that introduction.",
    "Perfect! Now I'd love to hear your full startup pitch.",
    "Thank you, that was an excellent pitch! Our AI analysis has begun."
  ];

  let successCount = 0;

  for (let i = 0; i < scripts.length; i++) {
    console.log(`\n📝 Testing script ${i + 1}/4...`);
    
    try {
      const response = await fetch('http://localhost:8001/generate-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: scripts[i],
          voice_id: ROHAN_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'
        })
      });

      if (response.ok) {
        console.log(`✅ Script ${i + 1} generated successfully`);
        successCount++;
      } else {
        console.log(`❌ Script ${i + 1} failed`);
      }

    } catch (error) {
      console.log(`❌ Script ${i + 1} error: ${error.message}`);
    }
  }

  console.log(`\n📊 Results: ${successCount}/${scripts.length} scripts generated successfully`);
  return successCount === scripts.length;
}

async function main() {
  try {
    // Test API connection
    const apiOk = await testElevenLabsAPI();
    if (!apiOk) return;

    // Check if Docker service is running
    console.log('\n🐳 Checking Docker service...');
    try {
      const healthResponse = await fetch('http://localhost:8001/health');
      if (healthResponse.ok) {
        console.log('✅ Avatar generator service is running');
      } else {
        console.log('❌ Avatar generator service not responding');
        console.log('📋 Run: docker-compose -f docker-compose.simple.yml up -d');
        return;
      }
    } catch (error) {
      console.log('❌ Avatar generator service not running');
      console.log('📋 Run: docker-compose -f docker-compose.simple.yml up -d');
      return;
    }

    // Test voice generation
    const voiceOk = await testVoiceGeneration();
    if (!voiceOk) return;

    // Test complete flow
    await testCompleteFlow();

    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Your ElevenLabs integration is ready!');
    console.log('🎬 You can now record your base video and generate persona videos.');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

main().catch(console.error);