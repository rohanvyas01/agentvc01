#!/usr/bin/env node

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
    console.log(`✅ ${dir}`);
  } else {
    console.log(`❌ ${dir} (missing)`);
  }
});

// Check for base files
const baseVideo = 'assets/base-recordings/rohan_base.mp4';
const voiceSample = 'assets/base-recordings/rohan_voice_sample.wav';

console.log('\n📁 Base Files:');
console.log(`   Base video: ${fs.existsSync(baseVideo) ? '✅' : '❌'} ${baseVideo}`);
console.log(`   Voice sample: ${fs.existsSync(voiceSample) ? '✅' : '❌'} ${voiceSample}`);

// Check environment variables
console.log('\n🔑 Environment Variables:');
console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}`);

console.log('\n📋 Next Steps:');
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
