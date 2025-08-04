#!/usr/bin/env node

/**
 * Test Video Generation Pipeline
 * 
 * Tests the complete video persona generation workflow
 */

import fs from 'fs';
import path from 'path';

console.log('🧪 Testing Video Generation Pipeline');
console.log('===================================');

// Test configuration
const TEST_SCRIPT = "Hello! This is a test of the AgentVC video persona system. I'm testing the text-to-speech and lip-sync generation pipeline.";
const TEST_OUTPUT = 'test_video.mp4';

async function testServices() {
  console.log('🔍 Testing service availability...');
  
  const services = [
    { name: 'Avatar Generator', url: 'http://localhost:8001/health' },
    { name: 'Video Processor', url: 'http://localhost:8002/health' }
  ];
  
  let allHealthy = true;
  
  for (const service of services) {
    try {
      const response = await fetch(service.url);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${service.name}: ${data.status}`);
      } else {
        console.log(`❌ ${service.name}: HTTP ${response.status}`);
        allHealthy = false;
      }
    } catch (error) {
      console.log(`❌ ${service.name}: Not responding`);
      allHealthy = false;
    }
  }
  
  return allHealthy;
}

async function testTTS() {
  console.log('\\n🎤 Testing speech generation...');
  
  try {
    const response = await fetch('http://localhost:8001/generate-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: TEST_SCRIPT
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Speech generation successful');
      return result.audio_path;
    } else {
      console.log('❌ Speech generation failed');
      return null;
    }
  } catch (error) {
    console.log(`❌ Speech error: ${error.message}`);
    return null;
  }
}

async function testVideoGeneration(audioPath) {
  console.log('\\n🎬 Testing video generation...');
  
  try {
    const response = await fetch('http://localhost:8001/generate-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio_path: audioPath,
        output_path: TEST_OUTPUT
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Video generation successful');
      return result.video_path;
    } else {
      console.log('❌ Video generation failed');
      return null;
    }
  } catch (error) {
    console.log(`❌ Video error: ${error.message}`);
    return null;
  }
}

async function testFullPipeline() {
  console.log('\\n🚀 Testing complete pipeline...');
  
  try {
    const response = await fetch('http://localhost:8001/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: TEST_SCRIPT,
        output_name: TEST_OUTPUT
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Complete pipeline successful');
      console.log(`   Output: ${result.video_path}`);
      return true;
    } else {
      const error = await response.json();
      console.log(`❌ Complete pipeline failed: ${error.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Pipeline error: ${error.message}`);
    return false;
  }
}

async function checkFiles() {
  console.log('\\n📁 Checking required files...');
  
  const requiredFiles = [
    'assets/base-recordings/rohan_base.mp4'
  ];
  
  const optionalFiles = [
    'assets/base-recordings/rohan_voice_sample.wav'
  ];
  
  let allPresent = true;
  
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      console.log(`✅ ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    } else {
      console.log(`❌ ${file} (missing)`);
      allPresent = false;
    }
  }
  
  for (const file of optionalFiles) {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      console.log(`✅ ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB) - optional`);
    } else {
      console.log(`ℹ️  ${file} (not needed - using ElevenLabs Daniel voice)`);
    }
  }
  
  return allPresent;
}

async function main() {
  try {
    // Check files
    const filesOk = await checkFiles();
    
    // Test services
    const servicesOk = await testServices();
    
    if (!servicesOk) {
      console.log('\\n❌ Some services are not healthy');
      console.log('📋 Try running: node scripts/start-video-services.js');
      return;
    }
    
    if (!filesOk) {
      console.log('\\n❌ Required files are missing');
      console.log('📋 Please add your base video: assets/base-recordings/rohan_base.mp4');
      console.log('   Voice will be generated using ElevenLabs Daniel voice');
      return;
    }
    
    // Test individual components
    const audioPath = await testTTS();
    if (audioPath) {
      await testVideoGeneration(audioPath);
    }
    
    // Test full pipeline
    await testFullPipeline();
    
    console.log('\\n🎉 Pipeline testing complete!');
    console.log('\\n📋 If all tests passed, you can now run:');
    console.log('   node scripts/generate-persona-videos.js');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

main().catch(console.error);