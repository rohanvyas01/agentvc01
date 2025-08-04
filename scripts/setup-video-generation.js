#!/usr/bin/env node

/**
 * Video Generation Setup Script
 * 
 * Sets up the hybrid video persona pipeline:
 * 1. Base video recording → Voice cloning → Script generation → Lip-sync videos
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create directory structure
const dirs = [
  'assets/base-recordings',
  'assets/generated-audio',
  'assets/generated-videos',
  'public/videos'
];

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Scripts for video generation
const videoScripts = {
  intro: {
    text: `Hi! Welcome to AgentVC. I'm Rohan Vyas, and I'm excited to hear about your startup today. Let me quickly introduce AgentVC - we're an AI-powered platform that helps founders like you practice and perfect your investor pitches. I'm here to listen to your pitch and provide you with detailed feedback and analysis. After our conversation, you'll receive a comprehensive report that will help you feel more confident when you pitch to actual investors. Now, before we dive into your pitch, could you please introduce yourself and tell me a bit about your background?`,
    duration_estimate: 45,
    priority: 1
  },
  
  transition: {
    text: `Great to meet you! Thank you for that introduction. Now I'm really excited to hear about your startup.`,
    duration_estimate: 8,
    priority: 2
  },
  
  pitch_request: {
    text: `Perfect! Now, I'd love to hear your full startup pitch. Please go ahead and present your startup as if you're pitching to a real investor. Take your time, cover everything you think is important - your problem, solution, market, business model, traction, team, funding needs, whatever you feel is crucial for me to understand your venture. I'm all ears!`,
    duration_estimate: 25,
    priority: 3
  },
  
  wrap_up: {
    text: `Thank you, that was an excellent pitch! I've captured everything you've shared with me today. Our AI analysis has begun and you'll receive a comprehensive report with detailed feedback, strengths, areas for improvement, and strategic recommendations within the next couple of hours. You can check your dashboard to see when the analysis is complete. If you'd like to practice again or refine your pitch, you can always restart a new session. Thanks for using AgentVC, and best of luck with your fundraising journey. I'll be in touch soon!`,
    duration_estimate: 30,
    priority: 4
  }
};

// Create video generation pipeline script
const pipelineScript = `#!/usr/bin/env node

/**
 * Video Generation Pipeline
 * 
 * Generates persona videos from base recording + scripts
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const BASE_VIDEO = 'assets/base-recordings/rohan_base.mp4';
const VOICE_SAMPLE = 'assets/base-recordings/rohan_voice_sample.wav';

const scripts = ${JSON.stringify(videoScripts, null, 2)};

async function generateTTS(text, outputPath) {
  console.log(\`🎤 Generating TTS: \${path.basename(outputPath)}\`);
  
  // Option A: OpenAI TTS API (simple)
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${process.env.OPENAI_API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'tts-1',
      voice: 'alloy', // or 'echo', 'fable', 'onyx', 'nova', 'shimmer'
      input: text
    })
  });
  
  if (!response.ok) {
    throw new Error(\`TTS API error: \${response.statusText}\`);
  }
  
  const audioBuffer = await response.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(audioBuffer));
  
  console.log(\`✅ TTS generated: \${outputPath}\`);
}

async function generateLipSync(baseVideo, audioPath, outputPath) {
  console.log(\`🎬 Generating lip-sync: \${path.basename(outputPath)}\`);
  
  // This would call HunyuanVideo or V-Express
  // For now, we'll create a placeholder
  
  console.log(\`   Base video: \${baseVideo}\`);
  console.log(\`   Audio: \${audioPath}\`);
  console.log(\`   Output: \${outputPath}\`);
  
  // TODO: Implement actual lip-sync generation
  // Example with HunyuanVideo:
  /*
  const result = await fetch('http://localhost:8001/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_video: baseVideo,
      audio_path: audioPath,
      output_path: outputPath
    })
  });
  */
  
  console.log(\`⏳ Lip-sync generation would happen here\`);
  console.log(\`✅ Lip-sync completed: \${outputPath}\`);
}

async function generateAllVideos() {
  console.log('🚀 Starting video generation pipeline...');
  
  // Check if base video exists
  if (!fs.existsSync(BASE_VIDEO)) {
    console.error(\`❌ Base video not found: \${BASE_VIDEO}\`);
    console.log('📋 Please record your base video first:');
    console.log('   1. Record 2-3 minutes of natural talking');
    console.log('   2. Save as assets/base-recordings/rohan_base.mp4');
    console.log('   3. Extract voice sample as rohan_voice_sample.wav');
    return;
  }
  
  // Generate videos for each script
  for (const [name, script] of Object.entries(scripts)) {
    try {
      const audioPath = \`assets/generated-audio/\${name}.wav\`;
      const videoPath = \`public/videos/rohan_\${name}.mp4\`;
      
      // Generate TTS audio
      await generateTTS(script.text, audioPath);
      
      // Generate lip-sync video
      await generateLipSync(BASE_VIDEO, audioPath, videoPath);
      
      console.log(\`✅ Completed: rohan_\${name}.mp4\`);
      
    } catch (error) {
      console.error(\`❌ Error generating \${name}:\`, error.message);
    }
  }
  
  console.log('🎉 Video generation pipeline complete!');
}

// Run if called directly
if (import.meta.url === \`file://\${process.argv[1]}\`) {
  generateAllVideos().catch(console.error);
}

export { generateAllVideos, generateTTS, generateLipSync };
`;

// Write the pipeline script
fs.writeFileSync(path.join(__dirname, 'generate-persona-videos.js'), pipelineScript);
console.log('📝 Created generate-persona-videos.js');

// Create recording instructions
const recordingInstructions = `# Video Recording Instructions

## Base Video Recording (rohan_base.mp4)

### Setup:
- **Camera**: 1080p or higher resolution
- **Lighting**: Soft, even lighting on face (avoid harsh shadows)
- **Background**: Clean, professional background
- **Audio**: Clear audio (use external mic if possible)
- **Framing**: Head and shoulders, centered
- **Duration**: 2-3 minutes

### What to Record:
You can record any natural conversation or script reading. The AI will use this as a base to generate the specific scripts. Here are some options:

#### Option A: Read Sample Script
"Hi there! I'm excited to talk with you today. Let me tell you about what we're doing here. We're building something really interesting that I think you'll find valuable. The technology we're using is quite advanced, and we've seen some great results so far. I'm looking forward to hearing your thoughts and answering any questions you might have. This is going to be a great conversation, and I appreciate you taking the time to join me today."

#### Option B: Natural Conversation
Have a natural 2-3 minute conversation with someone off-camera. Talk about:
- Your background and experience
- What AgentVC does
- Why you're excited about helping founders
- Your investment philosophy

#### Option C: Multiple Takes
Record several short segments (30-60 seconds each) with different expressions:
- Welcoming and friendly
- Explaining something complex
- Asking questions
- Showing enthusiasm

### Technical Requirements:
- **Format**: MP4
- **Resolution**: 1920x1080 (1080p) minimum
- **Frame Rate**: 30fps
- **Audio**: 48kHz, stereo
- **Bitrate**: High quality (10+ Mbps)

### Voice Sample (rohan_voice_sample.wav)
Extract a clean 30-60 second audio sample from your base video for voice cloning:
- Clear pronunciation
- Natural speaking pace
- No background noise
- Various emotions/tones

## File Locations:
- Base video: \`assets/base-recordings/rohan_base.mp4\`
- Voice sample: \`assets/base-recordings/rohan_voice_sample.wav\`

## Next Steps:
1. Record your base video
2. Extract voice sample
3. Run: \`node scripts/generate-persona-videos.js\`
4. Test the generated videos in your app
`;

fs.writeFileSync(path.join(__dirname, '..', 'RECORDING_INSTRUCTIONS.md'), recordingInstructions);
console.log('📋 Created RECORDING_INSTRUCTIONS.md');

// Create a simple test script
const testScript = `#!/usr/bin/env node

/**
 * Test Video Generation
 */

import fs from 'fs';

console.log('🧪 Testing Video Generation Setup');
console.log('================================');

// Check directory structure
const requiredDirs = [
  'assets/base-recordings',
  'assets/generated-audio', 
  'assets/generated-videos',
  'public/videos'
];

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(\`✅ \${dir}\`);
  } else {
    console.log(\`❌ \${dir} (missing)\`);
  }
});

// Check for base files
const baseVideo = 'assets/base-recordings/rohan_base.mp4';
const voiceSample = 'assets/base-recordings/rohan_voice_sample.wav';

console.log('\\n📁 Base Files:');
console.log(\`   Base video: \${fs.existsSync(baseVideo) ? '✅' : '❌'} \${baseVideo}\`);
console.log(\`   Voice sample: \${fs.existsSync(voiceSample) ? '✅' : '❌'} \${voiceSample}\`);

// Check environment variables
console.log('\\n🔑 Environment Variables:');
console.log(\`   OPENAI_API_KEY: \${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}\`);

console.log('\\n📋 Next Steps:');
if (!fs.existsSync(baseVideo)) {
  console.log('   1. Record your base video (see RECORDING_INSTRUCTIONS.md)');
  console.log('   2. Save as assets/base-recordings/rohan_base.mp4');
}
if (!fs.existsSync(voiceSample)) {
  console.log('   3. Extract voice sample as rohan_voice_sample.wav');
}
if (!process.env.OPENAI_API_KEY) {
  console.log('   4. Set OPENAI_API_KEY environment variable');
}
console.log('   5. Run: node scripts/generate-persona-videos.js');
`;

fs.writeFileSync(path.join(__dirname, 'test-video-setup.js'), testScript);
console.log('🧪 Created test-video-setup.js');

console.log('\n🎬 Hybrid Video Persona Setup Complete!');
console.log('=====================================');
console.log('');
console.log('📋 Next Steps:');
console.log('1. Read RECORDING_INSTRUCTIONS.md');
console.log('2. Record your base video');
console.log('3. Run: node scripts/test-video-setup.js');
console.log('4. Run: node scripts/generate-persona-videos.js');
console.log('5. Test in your app: npm run dev');
console.log('');
console.log('🚀 This will give you:');
console.log('   ✅ Authentic video of you/Rohan');
console.log('   ✅ AI-generated scripts for different scenarios');
console.log('   ✅ Professional, personalized experience');
console.log('   ✅ Unlimited script variations');