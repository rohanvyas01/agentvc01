#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const MODELS_DIR = path.join(__dirname, '..', 'public', 'models');

// MIME types for different file extensions
const mimeTypes = {
  '.json': 'application/json',
  '.onnx': 'application/octet-stream',
  '.txt': 'text/plain',
  '.js': 'application/javascript',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Parse the URL
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let filePath = path.join(MODELS_DIR, url.pathname);
  
  // Security check - ensure we're serving from models directory
  if (!filePath.startsWith(MODELS_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('File not found');
    return;
  }
  
  // Get file stats
  const stats = fs.statSync(filePath);
  if (stats.isDirectory()) {
    res.writeHead(404);
    res.end('Directory listing not allowed');
    return;
  }
  
  // Determine content type
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  
  // Set headers
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', stats.size);
  
  // Stream the file
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
  
  console.log(`📁 Served: ${url.pathname} (${contentType})`);
});

server.listen(PORT, () => {
  console.log(`🚀 Model server running on http://localhost:${PORT}`);
  console.log(`📁 Serving models from: ${MODELS_DIR}`);
  console.log('');
  console.log('Available models:');
  console.log(`  - http://localhost:${PORT}/whisper-tiny-en/config.json`);
  console.log(`  - http://localhost:${PORT}/whisper-tiny-en/onnx/encoder_model.onnx`);
  console.log('');
  console.log('Press Ctrl+C to stop');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down model server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});