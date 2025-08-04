#!/usr/bin/env node

/**
 * Generate All Persona Videos
 * 
 * Creates the 4 conversation segment videos using ElevenLabs + base video
 */

console.log('🎬 Generating AgentVC Persona Videos');
console.log('===================================');

// Load environment variables
import fs from 'fs';
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

const ROHAN_VOICE_ID = process.env.ROHAN_VOICE_ID || 'onwK4e9ZLuTAKqWW03F9';

// Conversation scripts
const conversationScripts = {
  intro: `Hi! Welcome to AgentVC. I'm excited to hear about your startup today. Let me quickly introduce AgentVC and myself - we're an AI-powered platform that helps founders like you practice and perfect your investor pitches. I'm here to listen to your pitch and provide you with detailed feedback and analysis. After our conversation, you'll receive a comprehensive report that will help you feel more confident when you pitch to actual investors. Now, could you please introduce yourself and tell me a bit about your background?`,
  
  transition: `Great to meet you! Thank you for that introduction. Now I'm really excited to hear about your startup.`,
  
  pitch_request: `Perfect! Now, I'd love to hear your full startup pitch. Please go ahead and present your startup as if you're pitching to a real investor. Take your time, cover everything you think is important - your problem, solution, market, business model, traction, team, funding needs, whatever you feel is crucial for me to understand your venture. I'm all ears! Remember, you can restart anytime if you want to try again.`,
  
  wrap_up: `Thank you, that was an excellent pitch! I've captured everything you've shared with me today. Our AI analysis has begun and you'll receive a comprehensive report with detailed feedback, strengths, areas for improvement, and strategic recommendations within the next couple of hours. You can check your dashboard to see when the analysis is complete. We'll get in touch soon with your results. Thanks for using AgentVC, and best of luck with your fundraising journey!`
};

async function generateVideo(segmentName, script) {
  console.log(`\n🎤 Generating ${segmentName}...`);
  
  try {
    // Step 1: Generate audio with ElevenLabs
    console.log(`   📢 Creating audio for ${segmentName}...`);
    
    const audioResponse = await fetch('http://localhost:8001/generate-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: script,
        voice_id: ROHAN_VOICE_ID
      })
    });
    
    if (!audioResponse.ok) {
      throw new Error(`Audio generation failed: ${audioResponse.status}`);
    }
    
    const audioResult = await audioResponse.json();
    console.log(`   ✅ Audio generated: ${audioResult.audio_path}`);
    
    // Step 2: Generate video with lip-sync
    console.log(`   🎬 Creating video for ${segmentName}...`);
    
    const videoResponse = await fetch('http://localhost:8001/generate-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio_path: audioResult.audio_path,
        output_path: `/app/output/rohan_${segmentName}.mp4`,
        reference_video: '/app/input/rohan_base.mp4'
      })
    });
    
    if (!videoResponse.ok) {
      throw new Error(`Video generation failed: ${videoResponse.status}`);
    }
    
    const videoResult = await videoResponse.json();
    console.log(`   ✅ Video generated: ${videoResult.video_path}`);
    
    return {
      success: true,
      segment: segmentName,
      audio_path: audioResult.audio_path,
      video_path: videoResult.video_path
    };
    
  } catch (error) {
    console.log(`   ❌ Failed to generate ${segmentName}: ${error.message}`);
    return {
      success: false,
      segment: segmentName,
      error: error.message
    };
  }
}

async function copyVideosToPublic() {
  console.log('\n📁 Copying videos to React app...');
  
  try {
    // Copy videos from Docker container to public directory
    const segments = ['intro', 'transition', 'pitch_request', 'wrap_up'];
    
    for (const segment of segments) {
      const containerPath = `agentvc01-avatar-generator-1:/app/output/rohan_${segment}.mp4`;
      const localPath = `public/videos/rohan_${segment}.mp4`;
      
      try {
        const { execSync } = await import('child_process');
        execSync(`docker cp ${containerPath} ${localPath}`, { stdio: 'inherit' });
        console.log(`   ✅ Copied rohan_${segment}.mp4`);
      } catch (error) {
        console.log(`   ⚠️  Could not copy rohan_${segment}.mp4 - may not exist yet`);
      }
    }
    
    console.log('\n🎉 Videos copied to public/videos/ directory!');
    
  } catch (error) {
    console.log(`❌ Error copying videos: ${error.message}`);
  }
}

async function main() {
  try {
    console.log('🔍 Checking services...');
    
    // Check if services are running
    try {
      const healthResponse = await fetch('http://localhost:8001/health');
      if (!healthResponse.ok) {
        throw new Error('Avatar generator not responding');
      }
      console.log('✅ Avatar generator service is running');
    } catch (error) {
      console.log('❌ Avatar generator service not running');
      console.log('📋 Run: docker-compose -f docker-compose.simple.yml up -d');
      return;
    }
    
    console.log(`🎭 Using voice: ${ROHAN_VOICE_ID} (Daniel from ElevenLabs)`);
    console.log('📹 Using base video: assets/base-recordings/rohan_base.mp4');
    
    // Generate all videos
    const results = [];
    
    for (const [segmentName, script] of Object.entries(conversationScripts)) {
      const result = await generateVideo(segmentName, script);
      results.push(result);
      
      // Small delay between generations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Copy videos to React app
    await copyVideosToPublic();
    
    // Summary
    console.log('\n📊 Generation Summary:');
    console.log('=====================');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successful: ${successful.length}/${results.length}`);
    
    if (successful.length > 0) {
      console.log('\n🎬 Generated videos:');
      successful.forEach(result => {
        console.log(`   • rohan_${result.segment}.mp4`);
      });
    }
    
    if (failed.length > 0) {
      console.log('\n❌ Failed videos:');
      failed.forEach(result => {
        console.log(`   • rohan_${result.segment}.mp4 - ${result.error}`);
      });
    }
    
    if (successful.length === results.length) {
      console.log('\n🎉 All persona videos generated successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Refresh your React app: http://127.0.0.1:5173/');
      console.log('2. Start a new conversation session');
      console.log('3. See your AI avatar in action!');
    } else {
      console.log('\n⚠️  Some videos failed to generate. Check the errors above.');
    }
    
  } catch (error) {
    console.error('❌ Generation error:', error.message);
  }
}

main().catch(console.error);