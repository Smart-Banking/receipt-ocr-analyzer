import { useState, useCallback } from 'react';
import { useStatusMessage } from './useStatusMessage';
import { createWorker } from 'tesseract.js';
import { OcrResult } from '@/types';

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
      const worker = await createWorker({
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.floor(m.progress * 100));
          }
        }
      });

      // Map UI language codes to Tesseract language codes
      const langMap: Record<string, string> = {
        'bg': 'bul',
        'en': 'eng',
        'ru': 'rus',
        'de': 'deu',
        'fr': 'fra'
      };

      const tesseractLang = langMap[language] || 'bul';
      
      await worker.loadLanguage(tesseractLang);
      await worker.initialize(tesseractLang);
      
      const { data } = await worker.recognize(imageUrl);
      
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
