import { useState, useCallback } from 'react';
import { useStatusMessage } from './useStatusMessage';
import { OcrResult } from '@/types';
// Import Tesseract dynamically to avoid type issues
import * as Tesseract from 'tesseract.js';

export function useOcr() {
  const [isOcrInProgress, setIsOcrInProgress] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResult>({ text: '', language: 'bg' });
  const [progress, setProgress] = useState(0);
  const { showMessage } = useStatusMessage();

  const performOcr = useCallback(async (imageUrl: string, language: string) => {
    if (!imageUrl) {
      showMessage('Моля, първо качете изображение.', 'warning');
      return null;
    }

    setIsOcrInProgress(true);
    setProgress(0);

    try {
      // Map UI language codes to Tesseract language codes
      const langMap: Record<string, string> = {
        'bg': 'bul',
        'en': 'eng',
        'ru': 'rus',
        'de': 'deu',
        'fr': 'fra'
      };

      const tesseractLang = langMap[language] || 'bul';
      
      // Create a new worker for each OCR process
      const worker = await Tesseract.createWorker({
        // @ts-ignore
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.floor((m.progress || 0) * 100));
          }
        }
      });
      
      // Load language and initialize
      // @ts-ignore
      await worker.loadLanguage(tesseractLang);
      // @ts-ignore
      await worker.initialize(tesseractLang);
      
      // Recognize text
      // @ts-ignore
      const { data } = await worker.recognize(imageUrl);
      
      // Release resources
      // @ts-ignore
      await worker.terminate();
      
      const result = {
        text: data.text,
        language
      };
      
      setOcrResult(result);
      setIsOcrInProgress(false);
      showMessage('OCR обработката завърши успешно!', 'success');
      
      return result;
    } catch (error) {
      console.error('OCR Error:', error);
      setIsOcrInProgress(false);
      showMessage(`Грешка при OCR обработката: ${error instanceof Error ? error.message : String(error)}`, 'error');
      return null;
    }
  }, [showMessage]);

  const updateOcrText = useCallback((text: string) => {
    setOcrResult(prev => ({ ...prev, text }));
  }, []);

  const updateOcrLanguage = useCallback((language: string) => {
    setOcrResult(prev => ({ ...prev, language }));
  }, []);

  return {
    isOcrInProgress,
    ocrResult,
    progress,
    performOcr,
    updateOcrText,
    updateOcrLanguage
  };
}
