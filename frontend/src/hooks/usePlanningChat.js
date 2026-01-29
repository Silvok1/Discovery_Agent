import { useState, useCallback } from 'react';

const API_BASE = '/api';

export function usePlanningChat() {
  const [planningSessionId, setPlanningSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [planReady, setPlanReady] = useState(false);
  const [draftPlan, setDraftPlan] = useState(null);
  const [isFinalized, setIsFinalized] = useState(false);

  const startPlanningSession = useCallback(async (userEmail) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/planning/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: userEmail }),
      });

      if (!res.ok) {
        throw new Error('Failed to start planning session');
      }

      const data = await res.json();
      setPlanningSessionId(data.planning_session_id);
      setMessages([{ role: 'assistant', content: data.opening_message }]);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (message) => {
    if (!planningSessionId) {
      throw new Error('No active planning session');
    }

    setIsLoading(true);
    setError(null);

    // Optimistically add user message
    setMessages((prev) => [...prev, { role: 'user', content: message }]);

    try {
      const res = await fetch(`${API_BASE}/planning/${planningSessionId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      const data = await res.json();

      // Add assistant response
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);

      // Update plan state
      if (data.plan_ready) {
        setPlanReady(true);
        setDraftPlan(data.draft_plan);
      }

      return data;
    } catch (err) {
      // Remove optimistic message on error
      setMessages((prev) => prev.slice(0, -1));
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [planningSessionId]);

  const finalizePlan = useCallback(async (name, overrides = {}) => {
    if (!planningSessionId) {
      throw new Error('No active planning session');
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/planning/${planningSessionId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          objective: overrides.objective,
          questions: overrides.questions,
          participant_profile: overrides.participant_profile,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to finalize plan');
      }

      const data = await res.json();
      setIsFinalized(true);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [planningSessionId]);

  const resumePlanningSession = useCallback(async (sessionId) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/planning/${sessionId}/resume`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Failed to resume planning session');
      }

      const data = await res.json();
      setPlanningSessionId(sessionId);
      setMessages(data.messages.map((m) => ({ role: m.role, content: m.content })));
      setPlanReady(data.plan_ready || false);
      setDraftPlan(data.draft_plan || null);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setPlanningSessionId(null);
    setMessages([]);
    setIsLoading(false);
    setError(null);
    setPlanReady(false);
    setDraftPlan(null);
    setIsFinalized(false);
  }, []);

  return {
    planningSessionId,
    messages,
    isLoading,
    error,
    planReady,
    draftPlan,
    isFinalized,
    startPlanningSession,
    sendMessage,
    finalizePlan,
    resumePlanningSession,
    reset,
    setDraftPlan,
  };
}
