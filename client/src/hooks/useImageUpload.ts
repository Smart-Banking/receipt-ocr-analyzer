import { useState, useCallback } from 'react';
import { useStatusMessage } from './useStatusMessage';

export function useImageUpload() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { showMessage } = useStatusMessage();

  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.match('image.*')) {
      showMessage('Моля, изберете валиден файл с изображение.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setImageUrl(result);
        setIsImageLoaded(true);
      }
    };
    reader.onerror = () => {
      showMessage('Грешка при четене на файла.', 'error');
    };
    reader.readAsDataURL(file);
  }, [showMessage]);

  const handleFilesSelect = useCallback((files: FileList) => {
    if (files.length) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const resetImage = useCallback(() => {
    setImageUrl(null);
    setIsImageLoaded(false);
  }, []);

  return {
    imageUrl,
    isImageLoaded,
    handleFileUpload,
    handleFilesSelect,
    resetImage
  };
}
