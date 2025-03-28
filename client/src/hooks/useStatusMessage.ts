import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { StatusMessage } from '@/types';

export function useStatusMessage() {
  const [messages, setMessages] = useState<StatusMessage[]>([]);

  const showMessage = useCallback((text: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = nanoid();
    const newMessage: StatusMessage = {
      id,
      text,
      type,
    };

    setMessages((prev) => [...prev, newMessage]);

    // Remove the message after 5 seconds
    setTimeout(() => {
      setMessages((prev) => prev.filter(msg => msg.id !== id));
    }, 5000);

    return id;
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter(msg => msg.id !== id));
  }, []);

  return {
    messages,
    showMessage,
    removeMessage
  };
}
