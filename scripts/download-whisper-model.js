#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Create models directory
const modelsDir = path.join(__dirname, '..', 'public', 'models', 'whisper-tiny-en');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

// Whisper tiny.en model files from Hugging Face
const modelFiles = [
  'config.json',
  'generation_config.json',
  'merges.txt',
  'normalizer.json',
  'preprocessor_config.json',
  'tokenizer.json',
  'tokenizer_config.json',
  'vocab.json',
  'onnx/decoder_model_merged.onnx',
  'onnx/encoder_model.onnx'
];

const baseUrl = 'https://huggingface.co/Xenova/whisper-tiny.en/resolve/main/';

function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(filePath);
    
    console.log(`📥 Downloading: ${path.basename(filePath)}`);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded: ${path.basename(filePath)}`);
          resolve();
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirects
        downloadFile(response.headers.location, filePath).then(resolve).catch(reject);
      } else {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

async function downloadAllFiles() {
  console.log('🚀 Starting Whisper model download...');
  
  for (const file of modelFiles) {
    const url = baseUrl + file;
    const filePath = path.join(modelsDir, file);
    
    try {
      await downloadFile(url, filePath);
    } catch (error) {
      console.error(`❌ Failed to download ${file}:`, error.message);
      process.exit(1);
    }
  }
  
  console.log('🎉 All model files downloaded successfully!');
  console.log(`📁 Model location: ${modelsDir}`);
}

downloadAllFiles().catch(console.error);