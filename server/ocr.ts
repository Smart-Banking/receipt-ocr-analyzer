import * as Tesseract from 'tesseract.js';
import { createWorker } from 'tesseract.js';

// Map UI language codes to Tesseract language codes
const langMap: Record<string, string> = {
  'bg': 'bul',
  'en': 'eng',
  'ru': 'rus',
  'de': 'deu',
  'fr': 'fra'
};

export async function performOcr(imageBase64: string, language: string): Promise<{ text: string }> {
  console.log(`Starting OCR processing with language: ${language}`);
  try {
    console.log('Processing image data...');
    
    // Ensure we have valid image data
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      throw new Error('Invalid image data provided to OCR function');
    }
    
    // Remove the data URL prefix if present and prepare the image data
    let imageDataUrl: string;
    if (imageBase64.startsWith('data:image/')) {
      // Already in data URL format
      imageDataUrl = imageBase64;
      console.log('Image is already in data URL format');
    } else {
      // Assume it's base64 encoded data without the prefix
      imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;
      console.log('Added data URL prefix to image');
    }
    
    // Determine language to use
    const tesseractLang = langMap[language] || 'bul';
    console.log(`Using Tesseract language: ${tesseractLang}`);
    
    console.log('Creating Tesseract worker...');
    // Use explicit import to avoid TypeScript issues
    const worker = await createWorker();

    try {
      console.log(`Loading language: ${tesseractLang}`);
      // @ts-ignore - Tesseract.js types are not fully compatible
      await worker.loadLanguage(tesseractLang);
      
      console.log('Initializing worker...');
      // @ts-ignore - Tesseract.js types are not fully compatible
      await worker.initialize(tesseractLang);
      
      console.log('Starting text recognition...');
      // @ts-ignore - Tesseract.js types are not fully compatible
      const { data } = await worker.recognize(imageDataUrl);
      
      console.log('Text recognition completed.');
      
      // Log first 100 chars of result for debugging
      if (data && data.text) {
        const textPreview = data.text.length > 100 
          ? `${data.text.substring(0, 100)}...` 
          : data.text;
        console.log(`OCR Result (preview): ${textPreview}`);
        
        // Return extracted text from the image
        return { text: data.text };
      } else {
        console.error('OCR Result is empty or invalid');
        return { text: '' };
      }
    } finally {
      // Ensure worker is terminated even if an error occurs
      console.log('Terminating Tesseract worker...');
      await worker.terminate();
    }
  } catch (error) {
    console.error('Server OCR Error:', error);
    throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}