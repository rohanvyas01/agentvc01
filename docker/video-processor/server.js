#!/usr/bin/env node

/**
 * Video Processing Service
 * Orchestrates TTS + Lip-sync pipeline
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8002;

// Middleware
app.use(cors());
app.use(express.json());

// Service URLs
const AVATAR_GENERATOR_URL = 'http://avatar-generator:8001';

// Directories
const ASSETS_DIR = '/app/assets';
const OUTPUT_DIR = '/app/output';

// Ensure directories exist
[ASSETS_DIR, OUTPUT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'video-processor',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Generate persona video from script
app.post('/generate-persona-video', async (req, res) => {
  try {
    const { script, output_name, voice_id = 'rohan_voice' } = req.body;
    
    if (!script || !output_name) {
      return res.status(400).json({
        error: 'Missing required fields: script, output_name'
      });
    }
    
    console.log(`🎬 Generating persona video: ${output_name}`);
    console.log(`📝 Script: ${script.substring(0, 100)}...`);
    
    // Step 1: Generate TTS audio
    console.log('🎤 Step 1: Generating TTS audio...');
    const audioResponse = await generateTTS(script, voice_id);
    
    if (!audioResponse.success) {
      throw new Error(`TTS generation failed: ${audioResponse.error}`);
    }
    
    const audioPath = audioResponse.audio_path;
    console.log(`✅ TTS generated: ${audioPath}`);
    
    // Step 2: Generate lip-sync video
    console.log('🎭 Step 2: Generating lip-sync video...');
    const videoResponse = await generateLipSync(audioPath, output_name);
    
    if (!videoResponse.success) {
      throw new Error(`Lip-sync generation failed: ${videoResponse.error}`);
    }
    
    console.log(`✅ Video generated: ${output_name}`);
    
    res.json({
      success: true,
      output_name,
      audio_path: audioPath,
      video_path: videoResponse.output_path,
      message: 'Persona video generated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error generating persona video:', error.message);
    res.status(500).json({
      error: error.message
    });
  }
});

// Generate all persona videos from scripts
app.post('/generate-all-videos', async (req, res) => {
  try {
    const scripts = {
      intro: `Hi! Welcome to AgentVC. I'm Rohan Vyas, and I'm excited to hear about your startup today. Let me quickly introduce AgentVC - we're an AI-powered platform that helps founders like you practice and perfect your investor pitches. I'm here to listen to your pitch and provide you with detailed feedback and analysis. After our conversation, you'll receive a comprehensive report that will help you feel more confident when you pitch to actual investors. Now, before we dive into your pitch, could you please introduce yourself and tell me a bit about your background?`,
      
      transition: `Great to meet you! Thank you for that introduction. Now I'm really excited to hear about your startup.`,
      
      pitch_request: `Perfect! Now, I'd love to hear your full startup pitch. Please go ahead and present your startup as if you're pitching to a real investor. Take your time, cover everything you think is important - your problem, solution, market, business model, traction, team, funding needs, whatever you feel is crucial for me to understand your venture. I'm all ears!`,
      
      wrap_up: `Thank you, that was an excellent pitch! I've captured everything you've shared with me today. Our AI analysis has begun and you'll receive a comprehensive report with detailed feedback, strengths, areas for improvement, and strategic recommendations within the next couple of hours. You can check your dashboard to see when the analysis is complete. If you'd like to practice again or refine your pitch, you can always restart a new session. Thanks for using AgentVC, and best of luck with your fundraising journey. I'll be in touch soon!`
    };
    
    console.log('🚀 Generating all persona videos...');
    
    const results = {};
    
    for (const [name, script] of Object.entries(scripts)) {
      try {
        console.log(`\n📹 Processing: ${name}`);
        
        const response = await axios.post(`http://localhost:${PORT}/generate-persona-video`, {
          script,
          output_name: `rohan_${name}.mp4`,
          voice_id: 'rohan_voice'
        });
        
        results[name] = {
          success: true,
          ...response.data
        };
        
        console.log(`✅ Completed: ${name}`);
        
      } catch (error) {
        console.error(`❌ Failed: ${name} - ${error.message}`);
        results[name] = {
          success: false,
          error: error.message
        };
      }
    }
    
    const successCount = Object.values(results).filter(r => r.success).length;
    
    res.json({
      success: successCount > 0,
      results,
      summary: {
        total: Object.keys(scripts).length,
        successful: successCount,
        failed: Object.keys(scripts).length - successCount
      }
    });
    
  } catch (error) {
    console.error('❌ Error in batch generation:', error.message);
    res.status(500).json({
      error: error.message
    });
  }
});

// Helper function: Generate TTS audio
async function generateTTS(text, voiceId) {
  try {
    const response = await axios.post(`${AVATAR_GENERATOR_URL}/generate-speech`, {
      text,
      speaker_wav: '/app/input/rohan_voice_sample.wav'
    });
    
    return {
      success: true,
      audio_path: response.data.audio_path
    };
    
  } catch (error) {
    console.error('TTS Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Helper function: Generate lip-sync video
async function generateLipSync(audioPath, outputName) {
  try {
    const response = await axios.post(`${AVATAR_GENERATOR_URL}/generate-video`, {
      audio_path: audioPath,
      face_video: '/app/input/rohan_base.mp4',
      output_path: `/app/output/${outputName}`
    });
    
    return {
      success: true,
      output_path: response.data.video_path
    };
    
  } catch (error) {
    console.error('Lip-sync Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// List generated videos
app.get('/videos', async (req, res) => {
  try {
    const files = fs.readdirSync(OUTPUT_DIR).filter(file => file.endsWith('.mp4'));
    res.json({
      success: true,
      videos: files.map(file => ({
        name: file,
        path: path.join(OUTPUT_DIR, file)
      }))
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🎬 Video Processing Service running on port ${PORT}`);
  console.log(`🤖 Avatar Generator URL: ${AVATAR_GENERATOR_URL}`);
});