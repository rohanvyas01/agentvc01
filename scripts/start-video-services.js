#!/usr/bin/env node

/**
 * Start Video Generation Services
 * 
 * Starts Docker containers for video persona generation
 */

import { spawn } from 'child_process';
import fs from 'fs';

console.log('🚀 Starting AgentVC Video Generation Services');
console.log('============================================');

// Check if Docker is available
function checkDocker() {
  return new Promise((resolve) => {
    const docker = spawn('docker', ['--version']);
    docker.on('close', (code) => {
      resolve(code === 0);
    });
    docker.on('error', () => {
      resolve(false);
    });
  });
}

// Check if docker-compose is available
function checkDockerCompose() {
  return new Promise((resolve) => {
    const compose = spawn('docker-compose', ['--version']);
    compose.on('close', (code) => {
      resolve(code === 0);
    });
    compose.on('error', () => {
      resolve(false);
    });
  });
}

// Start services with docker-compose
function startServices() {
  return new Promise((resolve, reject) => {
    console.log('🐳 Starting Docker services...');
    
    const compose = spawn('docker-compose', ['up', '-d'], {
      stdio: 'inherit'
    });
    
    compose.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Services started successfully!');
        resolve();
      } else {
        reject(new Error(`Docker Compose exited with code ${code}`));
      }
    });
    
    compose.on('error', (error) => {
      reject(error);
    });
  });
}

// Check service health
async function checkServiceHealth() {
  console.log('🏥 Checking service health...');
  
  const services = [
    { name: 'Avatar Generator', url: 'http://localhost:8001/health' },
    { name: 'Video Processor', url: 'http://localhost:8002/health' }
  ];
  
  for (const service of services) {
    try {
      const response = await fetch(service.url);
      if (response.ok) {
        console.log(`✅ ${service.name}: Healthy`);
      } else {
        console.log(`⚠️  ${service.name}: Unhealthy (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${service.name}: Not responding`);
    }
  }
}

// Main execution
async function main() {
  try {
    // Check prerequisites
    const hasDocker = await checkDocker();
    if (!hasDocker) {
      console.error('❌ Docker is not installed or not running');
      console.log('📋 Please install Docker Desktop and try again');
      process.exit(1);
    }
    
    const hasCompose = await checkDockerCompose();
    if (!hasCompose) {
      console.error('❌ Docker Compose is not available');
      console.log('📋 Please install Docker Compose and try again');
      process.exit(1);
    }
    
    console.log('✅ Docker and Docker Compose are available');
    
    // Check if docker-compose.yml exists
    if (!fs.existsSync('docker-compose.yml')) {
      console.error('❌ docker-compose.yml not found');
      console.log('📋 Please run this script from the project root directory');
      process.exit(1);
    }
    
    // Start services
    await startServices();
    
    // Wait a bit for services to start
    console.log('⏳ Waiting for services to initialize...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Check health
    await checkServiceHealth();
    
    console.log('');
    console.log('🎉 Video generation services are ready!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Record your base video: assets/base-recordings/rohan_base.mp4');
    console.log('2. Extract voice sample: assets/base-recordings/rohan_voice_sample.wav');
    console.log('3. Generate videos: node scripts/generate-persona-videos.js');
    console.log('');
    console.log('🔗 Service URLs:');
    console.log('   Avatar Generator: http://localhost:8001');
    console.log('   Video Processor: http://localhost:8002');
    
  } catch (error) {
    console.error('❌ Error starting services:', error.message);
    process.exit(1);
  }
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\\n🛑 Stopping services...');
  const compose = spawn('docker-compose', ['down']);
  compose.on('close', () => {
    console.log('✅ Services stopped');
    process.exit(0);
  });
});

main().catch(console.error);
