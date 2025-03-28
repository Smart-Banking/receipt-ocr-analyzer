import React, { useEffect, useState } from 'react';
import { StatusMessage as StatusMessageType } from '@/types';
import { XCircle, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface StatusMessageProps {
  message: StatusMessageType;
  onRemove: (id: string) => void;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ message, onRemove }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(message.id), 500);
    }, 4500);

    return () => clearTimeout(timer);
  }, [message.id, onRemove]);

  const getIcon = () => {
    switch (message.type) {
      case 'error':
        return <XCircle className="h-6 w-6" />;
      case 'success':
        return <CheckCircle className="h-6 w-6" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6" />;
      case 'info':
      default:
        return <Info className="h-6 w-6" />;
    }
  };

  const getBackgroundColor = () => {
    switch (message.type) {
      case 'error':
        return 'bg-red-500';
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div 
      className={`p-4 mb-2 rounded-lg shadow-lg transition-opacity duration-500 ease-in-out flex items-center ${
        getBackgroundColor()
      } ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="mr-3 text-white">
        {getIcon()}
      </div>
      <span className="flex-1 text-white">{message.text}</span>
    </div>
  );
};

interface StatusMessageContainerProps {
  messages: StatusMessageType[];
  onRemove: (id: string) => void;
}

export const StatusMessageContainer: React.FC<StatusMessageContainerProps> = ({ 
  messages, 
  onRemove 
}) => {
  return (
    <div className="fixed bottom-4 right-4 max-w-md z-50">
      {messages.map(message => (
        <StatusMessage 
          key={message.id} 
          message={message} 
          onRemove={onRemove} 
        />
      ))}
    </div>
  );
};
