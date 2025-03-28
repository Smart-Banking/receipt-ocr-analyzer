import * as Tesseract from 'tesseract.js';

// Map UI language codes to Tesseract language codes
const langMap: Record<string, string> = {
  'bg': 'bul',
  'en': 'eng',
  'ru': 'rus',
  'de': 'deu',
  'fr': 'fra'
};

// A simple fallback response for testing
// This is just so we can test the rest of the application flow while diagnosing OCR issues
export async function performOcr(imageBase64: string, language: string): Promise<{ text: string }> {
  console.log(`Starting OCR processing with language: ${language}`);
  
  // Simple validation
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    throw new Error('Invalid image data provided to OCR function');
  }
  
  try {
    // Simplified image processing
    const imageData = imageBase64.startsWith('data:image/') 
      ? imageBase64 
      : `data:image/jpeg;base64,${imageBase64}`;
    
    // Determine language
    const tesseractLang = langMap[language] || 'bul';
    console.log(`Using Tesseract language: ${tesseractLang}`);
    
    // Using a simpler approach with Tesseract recognize function
    console.log('Starting OCR with Tesseract...');
    const result = await Tesseract.recognize(
      imageData,
      tesseractLang,
      {
        logger: m => {
          // Only log progress at certain intervals to reduce console spam
          if (m.status === 'recognizing text' && m.progress && Math.floor(m.progress * 10) % 2 === 0) {
            console.log(`OCR progress: ${Math.floor(m.progress * 100)}%`);
          }
        }
      }
    );
    
    console.log('OCR completed successfully');
    
    // Return the extracted text
    if (result && result.data && result.data.text) {
      const textPreview = result.data.text.length > 100 
        ? `${result.data.text.substring(0, 100)}...` 
        : result.data.text;
      console.log(`OCR Result (preview): ${textPreview}`);
      
      return { text: result.data.text };
    } else {
      console.warn('OCR Result is empty');
      return { text: '' };
    }
  } catch (error) {
    console.error('OCR Error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Return a meaningful error
    throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}