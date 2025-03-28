import React from 'react';
import { Copy, Clipboard, AlertCircle } from 'lucide-react';
import { AnalysisResult } from '@/types';
import { useStatusMessage } from '@/hooks/useStatusMessage';

interface AiAnalysisResultProps {
  analysisResult: AnalysisResult;
  isAnalysisInProgress: boolean;
  hasAnalyzed: boolean;
}

const AiAnalysisResult: React.FC<AiAnalysisResultProps> = ({
  analysisResult,
  isAnalysisInProgress,
  hasAnalyzed
}) => {
  const { showMessage } = useStatusMessage();

  const handleCopyResult = async () => {
    try {
      await navigator.clipboard.writeText(analysisResult.text);
      showMessage('Резултатът е копиран в клипборда!', 'success');
    } catch (err) {
      showMessage(`Грешка при копиране: ${err instanceof Error ? err.message : String(err)}`, 'error');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('bg-BG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 shadow-lg h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-primary-500">4. Резултат от AI анализ</h2>
      
      {isAnalysisInProgress && (
        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
          <p className="text-gray-400 mt-4">Анализиране на данни с AI...</p>
        </div>
      )}
      
      {!isAnalysisInProgress && hasAnalyzed && analysisResult.text && (
        <div className="flex-grow flex flex-col">
          <div className="bg-gray-800 border border-gray-700 rounded p-4 h-full overflow-auto font-mono text-sm">
            <pre className="whitespace-pre-wrap">{analysisResult.text}</pre>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-400">
              Дата: {analysisResult.timestamp ? formatDate(analysisResult.timestamp) : ''}
            </span>
            <button 
              onClick={handleCopyResult}
              className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded flex items-center justify-center transition-colors"
            >
              <Copy className="h-5 w-5 mr-2" />
              Копирай
            </button>
          </div>
        </div>
      )}
      
      {!isAnalysisInProgress && !hasAnalyzed && (
        <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
          <Clipboard className="h-16 w-16 mb-4 text-gray-600" />
          <p className="text-center">Снимайте касова бележка и я анализирайте, за да видите резултатите тук.</p>
        </div>
      )}
    </div>
  );
};

export default AiAnalysisResult;
