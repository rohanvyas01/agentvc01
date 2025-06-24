import { pdfParserService, PDFParseResult } from './pdfParser';

interface PitchDeck {
  id: string;
  user_id: string;
  file_name: string;
  storage_path: string;
  extracted_text: string;
  created_at: string;
  extractedData?: any;
}

class ApiService {
  private getCurrentUser() {
    const user = localStorage.getItem('agentvc_user');
    if (!user) {
      throw new Error('User not authenticated');
    }
    return JSON.parse(user);
  }

  async uploadPitchDeck(file: File): Promise<{ 
    deckId: string; 
    fileName: string; 
    storagePath: string; 
    extractedData: PDFParseResult;
  }> {
    try {
      const user = this.getCurrentUser();

      // Validate file type
      if (file.type !== 'application/pdf') {
        throw new Error('Only PDF files are allowed');
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB');
      }

      console.log('🚀 Starting pitch deck upload and processing...');

      // Parse PDF and extract comprehensive data
      let extractedData: PDFParseResult;
      try {
        console.log('📄 Parsing PDF content with enhanced extraction...');
        extractedData = await pdfParserService.parsePDF(file);
        console.log(`✅ Successfully extracted ${extractedData.extractionStats.totalCharacters} characters from ${extractedData.pageCount} pages`);
      } catch (parseError) {
        console.error('❌ PDF parsing failed:', parseError);
        throw new Error(`Failed to parse PDF: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
      }

      // Create unique file path and ID
      const timestamp = Date.now();
      const deckId = `deck_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
      const fileName = file.name;
      const storagePath = `${user.id}/${timestamp}_${fileName}`;

      // Store file data in localStorage (as base64 for demo purposes)
      const fileReader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        fileReader.onload = () => resolve(fileReader.result as string);
        fileReader.onerror = reject;
        fileReader.readAsDataURL(file);
      });

      // Prepare extracted data for storage
      const extractedTextData = {
        fullText: extractedData.text,
        pages: extractedData.pages,
        metadata: extractedData.metadata,
        extractionStats: extractedData.extractionStats,
        extractedAt: new Date().toISOString()
      };

      // Create deck record
      const deckData: PitchDeck = {
        id: deckId,
        user_id: user.id,
        file_name: fileName,
        storage_path: storagePath,
        extracted_text: JSON.stringify(extractedTextData),
        created_at: new Date().toISOString()
      };

      // Save to localStorage
      const existingDecks = JSON.parse(localStorage.getItem('agentvc_pitch_decks') || '[]');
      existingDecks.push(deckData);
      localStorage.setItem('agentvc_pitch_decks', JSON.stringify(existingDecks));

      // Store file data separately
      const fileStorage = JSON.parse(localStorage.getItem('agentvc_files') || '{}');
      fileStorage[storagePath] = fileData;
      localStorage.setItem('agentvc_files', JSON.stringify(fileStorage));

      console.log('🎉 Pitch deck record created successfully with extracted data');

      // Clean up OCR resources
      await pdfParserService.cleanup();

      return {
        deckId: deckData.id,
        fileName: fileName,
        storagePath: storagePath,
        extractedData: extractedData
      };
    } catch (error) {
      console.error('❌ Upload pitch deck error:', error);
      // Clean up OCR resources on error
      await pdfParserService.cleanup();
      throw error;
    }
  }

  async getPitchDecks(): Promise<PitchDeck[]> {
    try {
      const user = this.getCurrentUser();
      
      const allDecks = JSON.parse(localStorage.getItem('agentvc_pitch_decks') || '[]');
      const userDecks = allDecks.filter((deck: PitchDeck) => deck.user_id === user.id);

      // Parse extracted text data for each deck
      const decksWithParsedData = userDecks.map((deck: PitchDeck) => {
        let parsedExtractedText = null;
        
        if (deck.extracted_text) {
          try {
            parsedExtractedText = JSON.parse(deck.extracted_text);
          } catch (parseError) {
            console.warn(`Failed to parse extracted text for deck ${deck.id}:`, parseError);
            parsedExtractedText = { fullText: deck.extracted_text };
          }
        }
        
        return {
          ...deck,
          extractedData: parsedExtractedText
        };
      });

      return decksWithParsedData.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('Get pitch decks error:', error);
      throw error;
    }
  }

  async getPitchDeckContent(deckId: string): Promise<{
    deck: PitchDeck;
    extractedData: any;
  }> {
    try {
      const user = this.getCurrentUser();
      
      const allDecks = JSON.parse(localStorage.getItem('agentvc_pitch_decks') || '[]');
      const deck = allDecks.find((d: PitchDeck) => d.id === deckId && d.user_id === user.id);

      if (!deck) {
        throw new Error('Pitch deck not found');
      }

      let extractedData = null;
      if (deck.extracted_text) {
        try {
          extractedData = JSON.parse(deck.extracted_text);
        } catch (parseError) {
          console.warn(`Failed to parse extracted text for deck ${deckId}:`, parseError);
          extractedData = { fullText: deck.extracted_text };
        }
      }

      return {
        deck,
        extractedData
      };
    } catch (error) {
      console.error('Get pitch deck content error:', error);
      throw error;
    }
  }

  async deletePitchDeck(deckId: string): Promise<void> {
    try {
      const user = this.getCurrentUser();
      
      const allDecks = JSON.parse(localStorage.getItem('agentvc_pitch_decks') || '[]');
      const deckIndex = allDecks.findIndex((d: PitchDeck) => d.id === deckId && d.user_id === user.id);

      if (deckIndex === -1) {
        throw new Error('Pitch deck not found');
      }

      const deck = allDecks[deckIndex];

      // Remove from decks array
      allDecks.splice(deckIndex, 1);
      localStorage.setItem('agentvc_pitch_decks', JSON.stringify(allDecks));

      // Remove file data
      const fileStorage = JSON.parse(localStorage.getItem('agentvc_files') || '{}');
      delete fileStorage[deck.storage_path];
      localStorage.setItem('agentvc_files', JSON.stringify(fileStorage));

      console.log('Pitch deck deleted successfully');
    } catch (error) {
      console.error('Delete pitch deck error:', error);
      throw error;
    }
  }

  async getDownloadUrl(storagePath: string): Promise<string> {
    try {
      const fileStorage = JSON.parse(localStorage.getItem('agentvc_files') || '{}');
      const fileData = fileStorage[storagePath];

      if (!fileData) {
        throw new Error('File not found');
      }

      return fileData; // Return the base64 data URL
    } catch (error) {
      console.error('Get download URL error:', error);
      throw error;
    }
  }

  // Placeholder methods for future backend integration
  async startPitchSession(persona: string): Promise<any> {
    throw new Error('Backend not implemented yet. Pitch session functionality will be available when backend is ready.');
  }

  async submitFounderIntroduction(sessionId: string, audioBlob: Blob, duration?: number): Promise<any> {
    throw new Error('Backend not implemented yet. Audio processing will be available when backend is ready.');
  }

  async submitPitch(sessionId: string, audioBlob: Blob, duration?: number): Promise<any> {
    throw new Error('Backend not implemented yet. Audio processing will be available when backend is ready.');
  }

  async generateQuestion(sessionId: string): Promise<any> {
    throw new Error('Backend not implemented yet. AI question generation will be available when backend is ready.');
  }

  async submitAnswer(sessionId: string, audioBlob: Blob, duration?: number): Promise<any> {
    throw new Error('Backend not implemented yet. Audio processing will be available when backend is ready.');
  }

  async endSession(sessionId: string): Promise<any> {
    throw new Error('Backend not implemented yet. Session analysis will be available when backend is ready.');
  }

  async getVideoStatus(videoId: string): Promise<any> {
    throw new Error('Backend not implemented yet. Video generation will be available when backend is ready.');
  }

  async getSessionHistory(): Promise<{ sessions: any[] }> {
    try {
      const user = this.getCurrentUser();
      
      const allSessions = JSON.parse(localStorage.getItem('agentvc_pitch_sessions') || '[]');
      const userSessions = allSessions.filter((session: any) => session.user_id === user.id);

      return { 
        sessions: userSessions.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      };
    } catch (error) {
      console.error('Get session history error:', error);
      throw error;
    }
  }

  async getStockReplicas(): Promise<{ replicas: any[] }> {
    throw new Error('Backend not implemented yet. Video replica functionality will be available when backend is ready.');
  }
}

export const apiService = new ApiService();