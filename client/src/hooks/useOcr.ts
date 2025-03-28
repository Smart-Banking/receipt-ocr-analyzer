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
      console.log('Starting OCR with image URL length:', imageUrl.length);
      
      // Validate the image data
      if (!imageUrl.startsWith('data:image/')) {
        throw new Error('Невалиден формат на изображението');
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
      
      console.log('Sending OCR request to server with language:', language);
      
      // Make a POST request to the server for OCR processing
      const response = await apiRequest(
        'POST',
        '/api/ocr',
        {
          imageBase64: imageUrl,
          language,
        }
      );
      
      console.log('Received OCR response from server');
      
      // Clear the progress interval
      clearInterval(progressInterval);
      setProgress(100);
      
      // Parse the response as JSON
      const responseData = await response.json();
      
      // Check if the parsed response contains text
      if (responseData && typeof responseData.text === 'string') {
        const result: OcrResult = {
          text: responseData.text,
          language,
        };
        
        setOcrResult(result);
        setIsOcrInProgress(false);
        showMessage('OCR обработката завърши успешно!', 'success');
        
        return result;
      } else {
        throw new Error('Сървърът не върна валиден OCR резултат');
      }
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
