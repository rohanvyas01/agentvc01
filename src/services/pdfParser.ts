import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export interface PDFParseResult {
  text: string;
  pageCount: number;
  pages: Array<{
    pageNumber: number;
    text: string;
    extractionMethod: 'text' | 'ocr';
    wordCount: number;
  }>;
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: string;
    modificationDate?: string;
  };
  extractionStats: {
    totalCharacters: number;
    totalWords: number;
    pagesWithText: number;
    pagesWithOCR: number;
    processingTimeMs: number;
  };
}

class PDFParserService {
  private ocrWorker: any = null;

  async initializeOCR() {
    if (!this.ocrWorker) {
      console.log('🔧 Initializing OCR worker...');
      this.ocrWorker = await createWorker('eng');
      console.log('✅ OCR worker initialized');
    }
    return this.ocrWorker;
  }

  async parsePDF(file: File): Promise<PDFParseResult> {
    const startTime = Date.now();
    
    try {
      console.log('📄 Starting comprehensive PDF parsing for:', file.name);
      
      // Convert file to array buffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load PDF document
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log(`📖 PDF loaded with ${pdf.numPages} pages`);
      
      // Extract metadata
      const metadata = await this.extractMetadata(pdf);
      console.log('📋 Metadata extracted:', metadata);
      
      let fullText = '';
      const pages: PDFParseResult['pages'] = [];
      let pagesWithText = 0;
      let pagesWithOCR = 0;
      
      // Process each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log(`🔍 Processing page ${pageNum}/${pdf.numPages}`);
        
        const page = await pdf.getPage(pageNum);
        
        // Try to extract text content first
        const textContent = await page.getTextContent();
        let pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .trim();
        
        let extractionMethod: 'text' | 'ocr' = 'text';
        
        if (pageText && pageText.length > 10) {
          // Good text extraction
          pagesWithText++;
          console.log(`✅ Extracted ${pageText.length} characters from page ${pageNum} via text extraction`);
        } else {
          // Try OCR if no meaningful text found
          console.log(`⚠️ Minimal text found on page ${pageNum}, trying OCR...`);
          
          try {
            const ocrText = await this.performOCROnPage(page);
            if (ocrText.trim().length > pageText.length) {
              pageText = ocrText.trim();
              extractionMethod = 'ocr';
              pagesWithOCR++;
              console.log(`✅ OCR extracted ${pageText.length} characters from page ${pageNum}`);
            }
          } catch (ocrError) {
            console.error(`❌ OCR failed for page ${pageNum}:`, ocrError);
          }
        }
        
        // Clean and process the text
        const cleanedText = this.cleanExtractedText(pageText);
        const wordCount = this.countWords(cleanedText);
        
        // Add to pages array
        pages.push({
          pageNumber: pageNum,
          text: cleanedText,
          extractionMethod,
          wordCount
        });
        
        // Add to full text with page separator
        if (cleanedText) {
          fullText += `\n--- Page ${pageNum} ---\n${cleanedText}\n`;
        }
      }
      
      // Calculate final statistics
      const processingTimeMs = Date.now() - startTime;
      const totalCharacters = fullText.length;
      const totalWords = this.countWords(fullText);
      
      const result: PDFParseResult = {
        text: fullText.trim(),
        pageCount: pdf.numPages,
        pages,
        metadata,
        extractionStats: {
          totalCharacters,
          totalWords,
          pagesWithText,
          pagesWithOCR,
          processingTimeMs
        }
      };
      
      console.log(`🎉 PDF parsing complete!`, {
        totalCharacters: result.extractionStats.totalCharacters,
        totalWords: result.extractionStats.totalWords,
        pagesWithText: result.extractionStats.pagesWithText,
        pagesWithOCR: result.extractionStats.pagesWithOCR,
        processingTime: `${result.extractionStats.processingTimeMs}ms`
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ PDF parsing failed:', error);
      throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractMetadata(pdf: any): Promise<PDFParseResult['metadata']> {
    try {
      const metadata = await pdf.getMetadata();
      const info = metadata.info;
      
      return {
        title: info.Title || undefined,
        author: info.Author || undefined,
        subject: info.Subject || undefined,
        creator: info.Creator || undefined,
        producer: info.Producer || undefined,
        creationDate: info.CreationDate || undefined,
        modificationDate: info.ModDate || undefined
      };
    } catch (error) {
      console.warn('⚠️ Could not extract PDF metadata:', error);
      return {};
    }
  }

  private async performOCROnPage(page: any): Promise<string> {
    try {
      // Initialize OCR worker if needed
      await this.initializeOCR();
      
      // Render page to canvas with high resolution for better OCR
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
      // Convert canvas to image data for OCR
      const imageData = canvas.toDataURL('image/png');
      
      // Perform OCR with better configuration
      const { data: { text } } = await this.ocrWorker.recognize(imageData, {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      
      return text;
    } catch (error) {
      console.error('OCR processing failed:', error);
      return '';
    }
  }

  private cleanExtractedText(text: string): string {
    if (!text) return '';
    
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove weird characters that sometimes come from PDFs
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
      // Fix common OCR mistakes
      .replace(/\|/g, 'I')
      .replace(/0/g, 'O')
      // Normalize quotes
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      // Clean up spacing around punctuation
      .replace(/\s+([,.!?;:])/g, '$1')
      .replace(/([,.!?;:])\s+/g, '$1 ')
      // Trim
      .trim();
  }

  private countWords(text: string): number {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  async cleanup() {
    if (this.ocrWorker) {
      console.log('🧹 Cleaning up OCR worker...');
      try {
        await this.ocrWorker.terminate();
      } catch (error) {
        console.warn('Warning during OCR cleanup:', error);
      }
      this.ocrWorker = null;
    }
  }
}

export const pdfParserService = new PDFParserService();