import { useState, useRef, useCallback } from 'react';
import { useStatusMessage } from './useStatusMessage';

export function useCamera() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { showMessage } = useStatusMessage();

  const openCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsCameraOpen(true);
    } catch (err) {
      showMessage(`Няма достъп до камера: ${err instanceof Error ? err.message : String(err)}`, 'error');
    }
  }, [showMessage]);

  const closeCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraOpen(false);
  }, []);

  const captureImage = useCallback(() => {
    if (!videoRef.current) {
      showMessage('Камерата не е активна.', 'error');
      return null;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/png');
      closeCamera();
      return imageDataUrl;
    }
    
    return null;
  }, [closeCamera, showMessage]);

  return {
    isCameraOpen,
    videoRef,
    openCamera,
    closeCamera,
    captureImage
  };
}
