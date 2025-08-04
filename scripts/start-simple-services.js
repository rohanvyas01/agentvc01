#!/usr/bin/env node

/**
 * Start Simple Mock Services (No Docker Required)
 * 
 * For testing the conversation flow without video generation
 */

import http from 'http';
import url from 'url';

console.log('🚀 Starting AgentVC Mock Services (No Docker)');
console.log('===============================================');

// Create mock avatar generator server
function createMockAvatarGenerator() {
  return http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    res.setHeader('Content-Type', 'application/json');

    if (path === '/health' && method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'healthy', service: 'mock-avatar-generator' }));
    } else if (path === '/generate-speech' && method === 'POST') {
      // Mock TTS generation
      setTimeout(() => {
        res.writeHead(200);
        res.end(JSON.stringify({ 
          success: true, 
          audio_url: '/mock/audio.wav',
          message: 'Mock TTS generated successfully' 
        }));
      }, 1000);
    } else if (path === '/generate-video' && method === 'POST') {
      // Mock video generation
      setTimeout(() => {
        res.writeHead(200);
        res.end(JSON.stringify({ 
          success: true, 
          video_url: '/mock/video.mp4',
          message: 'Mock video generated successfully' 
        }));
      }, 2000);
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });
}

// Create mock video processor server
function createMockVideoProcessor() {
  return http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    res.setHeader('Content-Type', 'application/json');

    if (path === '/health' && method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'healthy', service: 'mock-video-processor' }));
    } else if (path === '/process-video' && method === 'POST') {
      // Mock video processing
      setTimeout(() => {
        res.writeHead(200);
        res.end(JSON.stringify({ 
          success: true, 
          processed_url: '/mock/processed.mp4',
          message: 'Mock video processed successfully' 
        }));
      }, 1500);
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });
}

// Start services
async function startMockServices() {
  try {
    const avatarServer = createMockAvatarGenerator();
    const videoServer = createMockVideoProcessor();
    
    // Start avatar generator on port 8001
    avatarServer.listen(8001, () => {
      console.log('✅ Mock Avatar Generator running on http://localhost:8001');
    });
    
    // Start video processor on port 8002
    videoServer.listen(8002, () => {
      console.log('✅ Mock Video Processor running on http://localhost:8002');
    });
    
    console.log('');
    console.log('🎉 Mock services are ready for testing!');
    console.log('');
    console.log('📋 These services will:');
    console.log('• Return mock responses for TTS and video generation');
    console.log('• Allow you to test the conversation flow');
    console.log('• Skip the heavy Docker/AI processing');
    console.log('');
    console.log('🔗 Service URLs:');
    console.log('   Mock Avatar Generator: http://localhost:8001/health');
    console.log('   Mock Video Processor: http://localhost:8002/health');
    console.log('');
    console.log('Press Ctrl+C to stop services');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping mock services...');
      avatarServer.close();
      videoServer.close();
      console.log('✅ Mock services stopped');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Error starting mock services:', error.message);
    process.exit(1);
  }
}

startMockServices().catch(console.error);