// Vercel serverless function for OpenAI Whisper transcription
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the audio file from the request
    const audioFile = req.body.file;
    
    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log('🎤 Transcribing audio with OpenAI Whisper...');

    // Call OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
      response_format: 'json',
    });

    console.log('✅ Transcription successful');

    return res.status(200).json({
      text: transcription.text,
      success: true
    });

  } catch (error) {
    console.error('❌ Transcription error:', error);
    
    return res.status(500).json({
      error: 'Transcription failed',
      message: error.message,
      success: false
    });
  }
}