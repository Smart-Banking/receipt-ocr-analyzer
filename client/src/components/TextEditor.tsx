import React from 'react';
import { ClipboardCopy } from 'lucide-react';

interface TextEditorProps {
  text: string;
  isOcrInProgress: boolean;
  isAnalysisInProgress: boolean;
  onTextChange: (text: string) => void;
  onAnalyzeClick: () => void;
}

const TextEditor: React.FC<TextEditorProps> = ({
  text,
  isOcrInProgress,
  isAnalysisInProgress,
  onTextChange,
  onAnalyzeClick
}) => {
  return (
    <div className="bg-gray-900 rounded-lg p-4 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-primary-500">3. Редактиране на текст</h2>
      
      <div className="mb-4">
        <textarea 
          rows={10} 
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          disabled={isOcrInProgress}
          className={`w-full bg-gray-700 border border-gray-600 text-white rounded p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 ${isOcrInProgress ? 'opacity-70 cursor-not-allowed' : ''}`}
          placeholder="Текстът от OCR ще се появи тук. Можете да правите корекции преди анализ."
        />
      </div>
      
      <button 
        onClick={onAnalyzeClick}
        disabled={!text || isOcrInProgress || isAnalysisInProgress}
        className={`w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded flex items-center justify-center transition-colors ${(!text || isOcrInProgress || isAnalysisInProgress) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <ClipboardCopy className="h-5 w-5 mr-2" />
        Анализирай с AI
      </button>
    </div>
  );
};

export default TextEditor;
