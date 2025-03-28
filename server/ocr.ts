import * as Tesseract from 'tesseract.js';

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
    // Remove the data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    const imageDataUrl = `data:image/jpeg;base64,${base64Data}`;
    
    const tesseractLang = langMap[language] || 'bul';
    console.log(`Using Tesseract language: ${tesseractLang}`);
    
    console.log('Creating Tesseract worker...');
    // Using any type to bypass TypeScript errors
    // @ts-ignore
    const worker = await Tesseract.createWorker({
      // @ts-ignore
      logger: (m: any) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.floor((m.progress || 0) * 100)}%`);
        } else {
          console.log(`OCR Status: ${m.status || 'unknown'}`);
        }
      }
    });

    console.log(`Loading language: ${tesseractLang}`);
    // @ts-ignore
    await worker.loadLanguage(tesseractLang);
    
    console.log('Initializing worker...');
    // @ts-ignore
    await worker.initialize(tesseractLang);
    
    console.log('Starting text recognition...');
    // @ts-ignore
    const { data } = await worker.recognize(imageDataUrl);
    
    console.log('Text recognition completed.');
    // @ts-ignore
    await worker.terminate();
    
    // Log first 100 chars of result for debugging
    console.log(`OCR Result (first 100 chars): ${data.text.substring(0, 100)}...`);
    
    // Return extracted text from the image
    return { text: data.text };
  } catch (error) {
    console.error('Server OCR Error:', error);
    throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}