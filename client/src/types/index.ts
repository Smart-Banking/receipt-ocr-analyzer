export interface StatusMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface OcrResult {
  text: string;
  language: string;
}

export interface AnalysisResult {
  text: string;
  timestamp: Date | null;
}

export interface AppState {
  isImageLoaded: boolean;
  isOcrInProgress: boolean;
  isAnalysisInProgress: boolean;
  ocrResult: OcrResult;
  analysisResult: AnalysisResult;
}
