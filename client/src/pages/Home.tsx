import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ImageUploader from '@/components/ImageUploader';
import OcrProcessor from '@/components/OcrProcessor';
import TextEditor from '@/components/TextEditor';
import AiAnalysisResult from '@/components/AiAnalysisResult';
import { StatusMessageContainer } from '@/components/StatusMessage';
import { useStatusMessage } from '@/hooks/useStatusMessage';
import { useOcr } from '@/hooks/useOcr';
import { apiRequest } from '@/lib/queryClient';
import { AnalysisResult } from '@/types';

const Home: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { messages, showMessage, removeMessage } = useStatusMessage();
  const { 
    isOcrInProgress, 
    ocrResult, 
    progress, 
    performOcr, 
    updateOcrText, 
    updateOcrLanguage 
  } = useOcr();
  const [isAnalysisInProgress, setIsAnalysisInProgress] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>({ text: '', timestamp: null });
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleImageCapture = (capturedImage: string) => {
    setImageUrl(capturedImage);
    setIsImageLoaded(true);
  };

  const handleImageReset = () => {
    setImageUrl(null);
    setIsImageLoaded(false);
    updateOcrText('');
  };

  const handleStartOcr = async () => {
    if (!imageUrl) {
      showMessage('Моля, първо качете изображение.', 'warning');
      return;
    }

    const result = await performOcr(imageUrl, ocrResult.language);
    if (result) {
      updateOcrText(result.text);
    }
  };

  const handleLanguageChange = (language: string) => {
    updateOcrLanguage(language);
  };

  const handleTextChange = (text: string) => {
    updateOcrText(text);
  };

  const handleAnalyzeClick = async () => {
    if (!ocrResult.text.trim()) {
      showMessage('Моля, първо извършете OCR или въведете текст.', 'warning');
      return;
    }

    setIsAnalysisInProgress(true);

    try {
      const response = await apiRequest('POST', '/api/analyze-receipt', {
        text: ocrResult.text,
        language: ocrResult.language
      });

      const result = await response.json();
      
      setAnalysisResult({
        text: result.text,
        timestamp: new Date()
      });
      
      setHasAnalyzed(true);
      showMessage('AI анализът завърши успешно!', 'success');
    } catch (error) {
      showMessage(`Грешка при анализа: ${error instanceof Error ? error.message : String(error)}`, 'error');
    } finally {
      setIsAnalysisInProgress(false);
    }
  };

  return (
    <div className="bg-gray-800 text-gray-100 min-h-screen font-sans">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Header />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <ImageUploader 
              imageUrl={imageUrl}
              isImageLoaded={isImageLoaded}
              onImageCapture={handleImageCapture}
              onImageReset={handleImageReset}
            />
            
            <OcrProcessor 
              isImageLoaded={isImageLoaded}
              isOcrInProgress={isOcrInProgress}
              progress={progress}
              language={ocrResult.language}
              onLanguageChange={handleLanguageChange}
              onStartOcr={handleStartOcr}
            />
            
            <TextEditor 
              text={ocrResult.text}
              isOcrInProgress={isOcrInProgress}
              isAnalysisInProgress={isAnalysisInProgress}
              onTextChange={handleTextChange}
              onAnalyzeClick={handleAnalyzeClick}
            />
          </div>
          
          <AiAnalysisResult 
            analysisResult={analysisResult}
            isAnalysisInProgress={isAnalysisInProgress}
            hasAnalyzed={hasAnalyzed}
          />
        </div>
        
        <StatusMessageContainer 
          messages={messages} 
          onRemove={removeMessage} 
        />
      </div>
    </div>
  );
};

export default Home;
