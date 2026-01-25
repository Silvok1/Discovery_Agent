import { useState, useCallback } from 'react';

const API_BASE = '/api';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [turnCount, setTurnCount] = useState(0);
  const [error, setError] = useState(null);

  const startSession = useCallback(async (token) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/interview/${token}/start`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to start interview');
      }

      const data = await response.json();
      setSessionId(data.session_id);
      setMessages([{
        role: 'assistant',
        content: data.opening_message,
      }]);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (content, audioInput = false) => {
    if (!sessionId) {
      throw new Error('No active session');
    }

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content }]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/sessions/${sessionId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          audio_input: audioInput,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      setTurnCount(data.turn_count);

      // Add assistant response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
      }]);

      return data.response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const endSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      await fetch(`${API_BASE}/sessions/${sessionId}/end`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Error ending session:', err);
    }
  }, [sessionId]);

  const clearSession = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setTurnCount(0);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    sessionId,
    turnCount,
    error,
    startSession,
    sendMessage,
    endSession,
    clearSession,
  };
}
