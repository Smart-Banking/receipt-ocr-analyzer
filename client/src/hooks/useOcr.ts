import { useState, useCallback } from 'react';
import { useStatusMessage } from './useStatusMessage';
import { OcrResult } from '@/types';
import { apiRequest } from '@/lib/queryClient';

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
    setProgress(10); // Start progress

    try {
      // Extract the base64 data from the image URL
      const base64Data = imageUrl.split(',')[1];
      
      if (!base64Data) {
        throw new Error('Invalid image format');
      }
      
      // Set an interval to simulate progress since we don't get real-time progress from the server
      let progressValue = 10;
      const progressInterval = setInterval(() => {
        progressValue += 5;
        if (progressValue > 90) {
          progressValue = 90; // Cap at 90% until we get the actual result
        }
        setProgress(progressValue);
      }, 300);
      
      // Make a POST request to the server for OCR processing
      const response = await apiRequest('/api/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: imageUrl,
          language,
        }),
      });
      
      // Clear the progress interval
      clearInterval(progressInterval);
      setProgress(100);
      
      const result: OcrResult = {
        text: response.text,
        language,
      };
      
      setOcrResult(result);
      setIsOcrInProgress(false);
      showMessage('OCR обработката завърши успешно!', 'success');
      
      return result;
    } catch (error) {
      console.error('OCR Error:', error);
      setIsOcrInProgress(false);
      setProgress(0);
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
