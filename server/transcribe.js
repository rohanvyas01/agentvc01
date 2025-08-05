// Express.js endpoint for OpenAI Whisper transcription
const express = require('express');
const multer = require('multer');
const { OpenAI } = require('openai');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  }
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/transcribe', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log('🎤 Transcribing audio with OpenAI Whisper...');
    console.log('📁 File info:', {
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Call OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: 'whisper-1',
      language: 'en',
      response_format: 'json',
    });

    console.log('✅ Transcription successful:', transcription.text);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    return res.json({
      text: transcription.text,
      success: true
    });

  } catch (error) {
    console.error('❌ Transcription error:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({
      error: 'Transcription failed',
      message: error.message,
      success: false
    });
  }
});

module.exports = router;