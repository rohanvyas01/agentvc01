#!/usr/bin/env node

/**
 * ElevenLabs Setup Script
 * 
 * Helps configure ElevenLabs integration for voice cloning
 */

import fs from 'fs';
import readline from 'readline';

console.log('🎤 ElevenLabs Voice Cloning Setup');
console.log('=================================');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  try {
    console.log('\n📋 This script will help you set up ElevenLabs voice cloning.');
    console.log('You\'ll need:');
    console.log('1. ElevenLabs API key');
    console.log('2. A cloned voice ID (we\'ll help you create this)');
    console.log('');

    // Get API key
    const apiKey = await askQuestion('Enter your ElevenLabs API key: ');
    
    if (!apiKey.trim()) {
      console.log('❌ API key is required');
      process.exit(1);
    }

    // Update .env.local
    let envContent = '';
    if (fs.existsSync('.env.local')) {
      envContent = fs.readFileSync('.env.local', 'utf8');
    }

    // Remove existing ElevenLabs key if present
    envContent = envContent.replace(/ELEVENLABS_API_KEY=.*\n?/g, '');
    
    // Add new key
    envContent += `\nELEVENLABS_API_KEY=${apiKey.trim()}\n`;
    
    fs.writeFileSync('.env.local', envContent);
    console.log('✅ API key saved to .env.local');

    // Test API connection
    console.log('\n🔍 Testing API connection...');
    
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': apiKey.trim()
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API connection successful!');
        console.log(`📊 Found ${data.voices.length} voices in your account`);
        
        // Show available voices
        console.log('\n🎭 Available voices:');
        data.voices.forEach((voice, index) => {
          console.log(`${index + 1}. ${voice.name} (${voice.voice_id})`);
        });

        // Check for cloned voices
        const clonedVoices = data.voices.filter(v => v.category === 'cloned');
        
        if (clonedVoices.length > 0) {
          console.log('\n🎯 Found cloned voices:');
          clonedVoices.forEach((voice, index) => {
            console.log(`${index + 1}. ${voice.name} (${voice.voice_id})`);
          });
          
          const useExisting = await askQuestion('\nUse an existing cloned voice? (y/n): ');
          
          if (useExisting.toLowerCase() === 'y') {
            const voiceIndex = await askQuestion('Enter voice number: ');
            const selectedVoice = clonedVoices[parseInt(voiceIndex) - 1];
            
            if (selectedVoice) {
              // Update env with voice ID
              envContent = envContent.replace(/ROHAN_VOICE_ID=.*\n?/g, '');
              envContent += `ROHAN_VOICE_ID=${selectedVoice.voice_id}\n`;
              fs.writeFileSync('.env.local', envContent);
              
              console.log(`✅ Selected voice: ${selectedVoice.name}`);
              console.log(`🆔 Voice ID: ${selectedVoice.voice_id}`);
            }
          }
        } else {
          console.log('\n📝 No cloned voices found. You need to:');
          console.log('1. Go to https://elevenlabs.io/voice-lab');
          console.log('2. Click "Add Voice" → "Clone Voice"');
          console.log('3. Upload a 30-60 second audio sample of your voice');
          console.log('4. Name your voice (e.g., "Rohan Voice")');
          console.log('5. Copy the voice ID and run this script again');
        }

      } else {
        console.log('❌ API connection failed');
        console.log(`Status: ${response.status}`);
        const errorText = await response.text();
        console.log(`Error: ${errorText}`);
      }

    } catch (error) {
      console.log('❌ Error testing API:', error.message);
    }

    console.log('\n🎉 Setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Record your base video: assets/base-recordings/rohan_base.mp4');
    console.log('2. Restart Docker services: docker-compose -f docker-compose.simple.yml restart');
    console.log('3. Test voice generation: node scripts/test-elevenlabs.js');

  } catch (error) {
    console.error('❌ Setup error:', error.message);
  } finally {
    rl.close();
  }
}

main().catch(console.error);