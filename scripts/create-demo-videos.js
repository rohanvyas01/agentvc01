#!/usr/bin/env node

/**
 * Demo Video Creation Script
 * 
 * This script creates placeholder videos for the AgentVC video persona.
 * In production, these would be replaced with actual TTS + lip-sync generated videos.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create videos directory if it doesn't exist
const videosDir = path.join(__dirname, '..', 'public', 'videos');
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

// Video scripts for each segment
const videoScripts = {
  rohan_intro: {
    duration: 45, // seconds
    script: `Hi! Welcome to AgentVC. I'm Rohan Vyas, and I'm excited to hear about your startup today. Let me quickly introduce AgentVC - we're an AI-powered platform that helps founders like you practice and perfect your investor pitches. I'm here to listen to your pitch and provide you with detailed feedback and analysis. After our conversation, you'll receive a comprehensive report that will help you feel more confident when you pitch to actual investors. Now, before we dive into your pitch, could you please introduce yourself and tell me a bit about your background?`
  },
  
  rohan_transition: {
    duration: 8,
    script: `Great to meet you! Thank you for that introduction. Now I'm really excited to hear about your startup.`
  },
  
  rohan_pitch_request: {
    duration: 25,
    script: `Perfect! Now, I'd love to hear your full startup pitch. Please go ahead and present your startup as if you're pitching to a real investor. Take your time, cover everything you think is important - your problem, solution, market, business model, traction, team, funding needs, whatever you feel is crucial for me to understand your venture. I'm all ears!`
  },
  
  rohan_wrap_up: {
    duration: 30,
    script: `Thank you, that was an excellent pitch! I've captured everything you've shared with me today. Our AI analysis has begun and you'll receive a comprehensive report with detailed feedback, strengths, areas for improvement, and strategic recommendations within the next couple of hours. You can check your dashboard to see when the analysis is complete. If you'd like to practice again or refine your pitch, you can always restart a new session. Thanks for using AgentVC, and best of luck with your fundraising journey. I'll be in touch soon!`
  }
};

console.log('🎬 AgentVC Video Persona Setup');
console.log('================================');

// Create placeholder video files (these would be replaced with actual videos)
Object.entries(videoScripts).forEach(([filename, data]) => {
  const videoPath = path.join(videosDir, `${filename}.mp4`);
  const infoPath = path.join(videosDir, `${filename}.json`);
  
  // Create info file with script and metadata
  const videoInfo = {
    filename: `${filename}.mp4`,
    duration: data.duration,
    script: data.script,
    created: new Date().toISOString(),
    type: 'placeholder',
    notes: 'This is a placeholder. Replace with actual TTS + lip-sync generated video.'
  };
  
  fs.writeFileSync(infoPath, JSON.stringify(videoInfo, null, 2));
  
  console.log(`📝 Created info file: ${filename}.json`);
  console.log(`   Duration: ${data.duration}s`);
  console.log(`   Script: "${data.script.substring(0, 50)}..."`);
  console.log('');
});

console.log('📋 Next Steps:');
console.log('');
console.log('1. OPTION A - Pre-record Videos (Fastest):');
console.log('   - Record Rohan saying each script segment');
console.log('   - Save as MP4 files in public/videos/');
console.log('   - Replace the placeholder files');
console.log('');
console.log('2. OPTION B - TTS + Lip-Sync (Automated):');
console.log('   - Set up Resemble AI Chatterbox for TTS');
console.log('   - Set up HunyuanVideo-Avatar for lip-sync');
console.log('   - Generate videos automatically');
console.log('');
console.log('3. OPTION C - Simple TTS + Static Image:');
console.log('   - Generate audio with TTS');
console.log('   - Show static image of Rohan');
console.log('   - Overlay audio (simplest approach)');
console.log('');
console.log('🚀 For immediate testing, you can:');
console.log('   - Use any MP4 video files as placeholders');
console.log('   - The component will show fallback UI if videos are missing');
console.log('   - Focus on the conversation flow first');

// Create a simple HTML file to test video playback
const testHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>AgentVC Video Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        video { width: 100%; max-width: 600px; border-radius: 8px; }
        .script { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 8px; }
    </style>
</head>
<body>
    <h1>AgentVC Video Persona Test</h1>
    
    ${Object.entries(videoScripts).map(([filename, data]) => `
    <h2>${filename.replace('rohan_', '').replace('_', ' ').toUpperCase()}</h2>
    <video controls>
        <source src="/videos/${filename}.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>
    <div class="script">
        <strong>Script (${data.duration}s):</strong><br>
        ${data.script}
    </div>
    `).join('')}
    
    <h2>Implementation Notes</h2>
    <ul>
        <li>Replace placeholder videos with actual recordings</li>
        <li>Videos should be MP4 format, 16:9 aspect ratio</li>
        <li>Recommended resolution: 1280x720 or 1920x1080</li>
        <li>Keep file sizes reasonable for web delivery</li>
    </ul>
</body>
</html>
`;

fs.writeFileSync(path.join(videosDir, 'test.html'), testHtml);
console.log('📄 Created test.html for video testing');
console.log(`   Open: ${path.join(videosDir, 'test.html')}`);