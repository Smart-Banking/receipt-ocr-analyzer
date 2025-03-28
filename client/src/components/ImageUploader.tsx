import React, { useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useCamera } from '@/hooks/useCamera';

interface ImageUploaderProps {
  imageUrl: string | null;
  isImageLoaded: boolean;
  onImageCapture: (imageUrl: string) => void;
  onImageReset: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  imageUrl,
  isImageLoaded,
  onImageCapture,
  onImageReset
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { handleFilesSelect } = useImageUpload();
  const { 
    isCameraOpen, 
    videoRef, 
    openCamera, 
    closeCamera, 
    captureImage 
  } = useCamera();

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilesSelect(e.target.files);
      onImageCapture(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) {
      handleFilesSelect(e.dataTransfer.files);
      onImageCapture(URL.createObjectURL(e.dataTransfer.files[0]));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleCameraCapture = () => {
    const capturedImage = captureImage();
    if (capturedImage) {
      onImageCapture(capturedImage);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-primary-500">1. Качете изображение</h2>
      
      {isImageLoaded && imageUrl && (
        <div className="mb-4 flex justify-center">
          <div className="relative w-full">
            <img 
              src={imageUrl} 
              className="max-h-[400px] max-w-full mx-auto border border-gray-700 rounded" 
              alt="Преглед на касова бележка" 
            />
            <button 
              onClick={onImageReset}
              className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white p-1 rounded w-8 h-8 flex items-center justify-center shadow-md"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      
      {!isImageLoaded && !isCameraOpen && (
        <div className="flex flex-col space-y-4">
          <div 
            className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 transition-colors"
            onClick={handleUploadClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-400">Преместете изображение тук или кликнете за избор на файл</p>
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*"
              onChange={handleFileInputChange}
            />
          </div>
          
          <div className="flex space-x-4">
            <button 
              onClick={openCamera}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded flex items-center justify-center transition-colors"
            >
              <Camera className="h-5 w-5 mr-2" />
              Камера
            </button>
            <button 
              onClick={handleUploadClick}
              className="flex-1 bg-primary-500 hover:bg-primary-700 text-white py-2 px-4 rounded flex items-center justify-center transition-colors"
            >
              <Upload className="h-5 w-5 mr-2" />
              Качване
            </button>
          </div>
        </div>
      )}
      
      {isCameraOpen && (
        <div className="relative">
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            className="w-full h-[300px] object-cover border border-gray-700 rounded"
          />
          <div className="flex justify-center mt-4 space-x-4">
            <button 
              onClick={handleCameraCapture}
              className="bg-primary-500 hover:bg-primary-700 text-white py-2 px-4 rounded flex items-center justify-center transition-colors"
            >
              <Camera className="h-5 w-5 mr-2" />
              Снимай
            </button>
            <button 
              onClick={closeCamera}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center justify-center transition-colors"
            >
              <X className="h-5 w-5 mr-2" />
              Отказ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
