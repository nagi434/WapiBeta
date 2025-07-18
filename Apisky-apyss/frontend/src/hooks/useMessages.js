import { useState } from 'react';
import { messagesService } from '../services/api';

export function useMessages() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (messageData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await messagesService.sendMessage(messageData);
      return result;
    } catch (err) {
      setError(err.message || 'Error al enviar mensaje');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading, error };
}

export function useWhatsApp() {
  // Implementación futura para funcionalidades específicas de WhatsApp
  return {};
}


