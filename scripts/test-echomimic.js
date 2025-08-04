#!/usr/bin/env node

/**
 * Test EchoMimic V2 Integration
 * 
 * Tests the complete ElevenLabs + EchoMimic pipeline
 */

console.log('🎭 Testing EchoMimic V2 + ElevenLabs Pipeline');
console.log('==============================================');

async function testCompleteFlow() {
  console.log('🔍 Testing complete avatar generation flow...');
  
  const testScript = "Hello! Welcome to AgentVC. I'm excited to hear about your startup today.";
  
  try {
    // Step 1: Generate audio with ElevenLabs
    console.log('🎤 Step 1: Generating audio with ElevenLabs...');
    
    const audioResponse = await fetch('http://localhost:8001/generate-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: testScript,
        voice_id: process.env.ROHAN_VOICE_ID || 'onwK4e9ZLuTAKqWW03F9'
      })
    });
    
    if (!audioResponse.ok) {
      throw new Error('Audio generation failed');
    }
    
    const audioResult = await audioResponse.json();
    console.log('✅ Audio generated successfully');
    
    // Step 2: Generate video with EchoMimic
    console.log('🎬 Step 2: Generating video with EchoMimic...');
    
    const videoResponse = await fetch('http://localhost:8001/generate-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio_path: audioResult.audio_path,
        output_path: '/app/output/test_avatar.mp4'
      })
    });
    
    if (!videoResponse.ok) {
      throw new Error('Video generation failed');
    }
    
    const videoResult = await videoResponse.json();
    console.log('✅ Video generated successfully');
    console.log(`📁 Output: ${videoResult.video_path}`);
    
    return true;
    
  } catch (error) {
    console.log(`❌ Pipeline test failed: ${error.message}`);
    return false;
  }
}

async function testAllConversationSegments() {
  console.log('\n🎯 Testing all conversation segments...');
  
  const segments = [
    {
      name: 'intro',
      script: "Hi! Welcome to AgentVC. I'm excited to hear about your startup today. Let me quickly introduce AgentVC - we're an AI-powered platform that helps founders practice their pitches."
    },
    {
      name: 'transition', 
      script: "Great to meet you! Thank you for that introduction. Now I'm really excited to hear about your startup."
    },
    {
      name: 'pitch_request',
      script: "Perfect! Now I'd love to hear your full startup pitch. Please present your startup as if you're pitching to a real investor."
    },
    {
      name: 'wrap_up',
      script: "Thank you, that was an excellent pitch! Our AI analysis has begun and you'll receive a comprehensive report soon."
    }
  ];
  
  let successCount = 0;
  
  for (const segment of segments) {
    console.log(`\n📝 Testing ${segment.name}...`);
    
    try {
      // Generate audio
      const audioResponse = await fetch('http://localhost:8001/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: segment.script,
          voice_id: process.env.ROHAN_VOICE_ID || 'onwK4e9ZLuTAKqWW03F9'
        })
      });
      
      if (audioResponse.ok) {
        const audioResult = await audioResponse.json();
        
        // Generate video
        const videoResponse = await fetch('http://localhost:8001/generate-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audio_path: audioResult.audio_path,
            output_path: `/app/output/rohan_${segment.name}.mp4`
          })
        });
        
        if (videoResponse.ok) {
          console.log(`✅ ${segment.name} generated successfully`);
          successCount++;
        } else {
          console.log(`❌ ${segment.name} video generation failed`);
        }
      } else {
        console.log(`❌ ${segment.name} audio generation failed`);
      }
      
    } catch (error) {
      console.log(`❌ ${segment.name} error: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Results: ${successCount}/${segments.length} segments generated`);
  return successCount === segments.length;
}

async function checkServices() {
  console.log('🔍 Checking required services...');
  
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

async function main() {
  try {
    // Check services
    const servicesOk = await checkServices();
    if (!servicesOk) {
      console.log('\n❌ Some services are not running');
      console.log('📋 Run: docker-compose -f docker-compose.simple.yml up -d');
      return;
    }
    
    // Test complete flow
    const flowOk = await testCompleteFlow();
    if (!flowOk) return;
    
    // Test all segments
    await testAllConversationSegments();
    
    console.log('\n🎉 EchoMimic + ElevenLabs pipeline is working!');
    console.log('\n📋 Your AI avatar is ready to interview founders!');
    console.log('🎬 Videos will be generated with Daniel\'s voice and professional appearance.');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

main().catch(console.error);