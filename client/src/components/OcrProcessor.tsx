import React from 'react';
import { MessageSquare } from 'lucide-react';

interface OcrProcessorProps {
  isImageLoaded: boolean;
  isOcrInProgress: boolean;
  progress: number;
  language: string;
  onLanguageChange: (language: string) => void;
  onStartOcr: () => void;
}

const OcrProcessor: React.FC<OcrProcessorProps> = ({
  isImageLoaded,
  isOcrInProgress,
  progress,
  language,
  onLanguageChange,
  onStartOcr
}) => {
  return (
    <div className="bg-gray-900 rounded-lg p-4 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-primary-500">2. Разпознаване на текст (OCR)</h2>
      
      <div className="mb-4">
        <label htmlFor="languageSelect" className="block text-sm font-medium text-gray-400 mb-2">Изберете език:</label>
        <div className="relative">
          <select 
            id="languageSelect" 
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="block w-full bg-gray-700 border border-gray-600 text-white rounded py-2 px-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="bg">Български</option>
            <option value="en">English</option>
            <option value="ru">Русский</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      <button 
        onClick={onStartOcr}
        disabled={!isImageLoaded || isOcrInProgress}
        className={`w-full bg-primary-500 hover:bg-primary-700 text-white py-2 px-4 rounded flex items-center justify-center transition-colors ${(!isImageLoaded || isOcrInProgress) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <MessageSquare className="h-5 w-5 mr-2" />
        Разпознай текст
      </button>
      
      {isOcrInProgress && (
        <div className="mt-4">
          <div className="flex items-center">
            <div className="w-full bg-gray-700 rounded-full h-2.5 mr-2">
              <div 
                className="bg-primary-500 h-2.5 rounded-full" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-gray-400 min-w-[40px]">{progress}%</span>
          </div>
          <p className="text-sm text-center text-gray-400 mt-2">Разпознаване на текст...</p>
        </div>
      )}
    </div>
  );
};

export default OcrProcessor;
