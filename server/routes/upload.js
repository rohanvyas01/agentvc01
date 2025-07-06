const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// POST /api/upload/deck - Upload pitch deck
router.post('/deck', authenticateUser, upload.single('deck'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    const file = req.file;
    const fileId = uuidv4();
    const fileName = `${fileId}_${file.originalname}`;
    const storagePath = `pitch-decks/${req.user.id}/${fileName}`;

    console.log('📁 Uploading file:', fileName);

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pitch-decks')
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error('❌ File upload failed:', uploadError);
      return res.status(500).json({
        error: 'Failed to upload file',
        details: uploadError.message
      });
    }

    console.log('✅ File uploaded successfully');

    // Create database record
    const { data: deckData, error: deckError } = await supabase
      .from('pitch_decks')
      .insert({
        user_id: req.user.id,
        file_name: file.originalname,
        storage_path: storagePath,
        file_size: file.size,
        extracted_text: null // Will be populated later by text extraction service
      })
      .select()
      .single();

    if (deckError) {
      console.error('❌ Database record creation failed:', deckError);
      
      // Clean up uploaded file
      await supabase.storage
        .from('pitch-decks')
        .remove([storagePath]);

      return res.status(500).json({
        error: 'Failed to create database record',
        details: deckError.message
      });
    }

    console.log('✅ Database record created');

    res.status(201).json({
      success: true,
      message: 'Pitch deck uploaded successfully',
      deck: deckData
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      error: 'Internal server error during upload',
      details: error.message
    });
  }
});

// GET /api/upload/decks - Get user's pitch decks
router.get('/decks', authenticateUser, async (req, res) => {
  try {
    const { data: decks, error } = await supabase
      .from('pitch_decks')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching decks:', error);
      return res.status(500).json({
        error: 'Failed to fetch pitch decks',
        details: error.message
      });
    }

    res.json({
      success: true,
      decks: decks || []
    });

  } catch (error) {
    console.error('❌ Fetch decks error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// DELETE /api/upload/deck/:id - Delete pitch deck
router.delete('/deck/:id', authenticateUser, async (req, res) => {
  try {
    const deckId = req.params.id;

    // First, get the deck to find the storage path
    const { data: deck, error: fetchError } = await supabase
      .from('pitch_decks')
      .select('storage_path')
      .eq('id', deckId)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !deck) {
      return res.status(404).json({
        error: 'Pitch deck not found'
      });
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('pitch-decks')
      .remove([deck.storage_path]);

    if (storageError) {
      console.error('❌ Storage deletion failed:', storageError);
      // Continue with database deletion even if storage fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('pitch_decks')
      .delete()
      .eq('id', deckId)
      .eq('user_id', req.user.id);

    if (deleteError) {
      console.error('❌ Database deletion failed:', deleteError);
      return res.status(500).json({
        error: 'Failed to delete pitch deck',
        details: deleteError.message
      });
    }

    res.json({
      success: true,
      message: 'Pitch deck deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete deck error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router;