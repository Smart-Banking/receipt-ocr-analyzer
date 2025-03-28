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

    // Започваме OCR процеса
    setIsOcrInProgress(true);
    setProgress(10); // Начален прогрес
    
    // Настройваме интервал за симулиране на прогрес
    let progressValue = 10;
    const progressInterval = setInterval(() => {
      progressValue += 5;
      if (progressValue > 90) {
        progressValue = 90; // Ограничаваме до 90% докато получим резултат
      }
      setProgress(progressValue);
    }, 300);

    try {
      console.log('Стартиране на OCR с дължина на изображението:', imageUrl.length);
      
      // Основна проверка на данните
      if (imageUrl.length < 10) {
        throw new Error('Невалидно изображение');
      }
      
      // Изпращаме заявка към сървъра
      console.log('Изпращане на OCR заявка към сървъра с език:', language);
      
      // Проверяваме изображението и го оптимизираме на клиентско ниво, ако е възможно
      console.log('Проверка на изображението и подготовка за изпращане...');
      
      // За да тестваме дали сървърът работи, изпращаме първо малка тестова заявка
      console.log('Изпращане на тестова заявка за проверка на OCR сървъра...');
      const testResponse = await fetch('/api/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: 'test',
          language,
        }),
      });
      
      if (!testResponse.ok) {
        console.error('Тест заявката не успя:', await testResponse.text());
        throw new Error(`Сървърът върна грешка: ${testResponse.status}`);
      }
      
      console.log('Тест заявката е успешна, продължаваме с обработката на истинското изображение');
      
      // Подготовка на изображението за изпращане
      let processedImageUrl = imageUrl;
      
      // Ако имаме blob URL от камерата, трябва да го конвертираме в base64
      if (imageUrl.startsWith('blob:')) {
        try {
          console.log('Конвертиране на blob URL в base64...');
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          
          const reader = new FileReader();
          processedImageUrl = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          
          console.log('Blob URL успешно конвертиран в base64');
        } catch (error) {
          console.error('Грешка при конвертиране на blob URL:', error);
          throw new Error('Не можах да обработя изображението от камерата');
        }
      }
      
      // Истинска заявка с изображението
      console.log('Изпращане на изображението за OCR обработка...');
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: processedImageUrl,
          language,
        }),
      });
      
      // Проверка за грешки
      if (!response.ok) {
        console.error('OCR заявката не успя:', await response.text());
        throw new Error(`Сървърът върна грешка: ${response.status}`);
      }
      
      console.log('Получихме отговор от OCR сървъра');
      
      // Приключваме прогреса
      clearInterval(progressInterval);
      setProgress(100);
      
      // Обработваме отговора
      const responseData = await response.json();
      console.log('Получени данни:', responseData);
      
      // Проверка на данните
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
      // Изчистваме прогрес индикатора
      clearInterval(progressInterval);
      
      // Детайлно логване на грешки
      console.error('OCR Error:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      } else {
        console.error('Non-Error object thrown:', JSON.stringify(error, null, 2));
      }
      
      // Актуализираме състоянието
      setIsOcrInProgress(false);
      setProgress(0);
      
      // Форматираме съобщение за грешка
      let errorMessage = 'Неизвестна грешка';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      showMessage(`Грешка при OCR обработката: ${errorMessage}`, 'error');
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
