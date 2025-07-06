import { supabase } from '../lib/supabase';
import type { PitchDeck } from '../lib/supabase';
import { pdfParserService } from './pdfParser';

class PitchDeckService {
  async uploadPitchDeck(file: File, userId: string): Promise<PitchDeck> {
    try {
      // Validate file
      if (file.type !== 'application/pdf') {
        throw new Error('Only PDF files are allowed');
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB');
      }

      // Generate unique file path
      const timestamp = Date.now();
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `${timestamp}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
      const filePath = `${userId}/${uniqueFileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pitch-decks')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Extract text from PDF
      let extractedText = '';
      try {
        const parseResult = await pdfParserService.parsePDF(file);
        extractedText = JSON.stringify({
          fullText: parseResult.text,
          pages: parseResult.pages,
          metadata: parseResult.metadata,
          extractionStats: parseResult.extractionStats,
          extractedAt: new Date().toISOString()
        });
      } catch (parseError) {
        console.warn('PDF parsing failed:', parseError);
        // Continue without extracted text
      }

      // Save deck metadata to database
      const { data: deckData, error: dbError } = await supabase
        .from('pitch_decks')
        .insert([{
          user_id: userId,
          file_name: fileName,
          storage_path: uploadData.path,
          file_size: file.size,
          extracted_text: extractedText || null,
        }])
        .select()
        .single();

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('pitch-decks').remove([uploadData.path]);
        throw new Error(`Database error: ${dbError.message}`);
      }

      return deckData;
    } catch (error) {
      console.error('Upload pitch deck error:', error);
      throw error;
    }
  }

  async getPitchDecks(userId: string): Promise<PitchDeck[]> {
    try {
      const { data, error } = await supabase
        .from('pitch_decks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Get pitch decks error:', error);
      throw error;
    }
  }

  async deletePitchDeck(deckId: string, userId: string): Promise<void> {
    try {
      // Get deck info first
      const { data: deck, error: fetchError } = await supabase
        .from('pitch_decks')
        .select('storage_path')
        .eq('id', deckId)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (!deck) {
        throw new Error('Pitch deck not found');
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('pitch-decks')
        .remove([deck.storage_path]);

      if (storageError) {
        console.warn('Storage deletion failed:', storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('pitch_decks')
        .delete()
        .eq('id', deckId)
        .eq('user_id', userId);

      if (dbError) {
        throw new Error(dbError.message);
      }
    } catch (error) {
      console.error('Delete pitch deck error:', error);
      throw error;
    }
  }

  async getDownloadUrl(storagePath: string): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from('pitch-decks')
        .createSignedUrl(storagePath, 3600); // 1 hour expiry

      if (error) {
        throw new Error(error.message);
      }

      if (!data.signedUrl) {
        throw new Error('Failed to generate download URL');
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Get download URL error:', error);
      throw error;
    }
  }
}

export const pitchDeckService = new PitchDeckService();