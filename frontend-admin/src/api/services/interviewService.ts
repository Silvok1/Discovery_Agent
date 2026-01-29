import { InterviewMessage, InterviewSession } from '../contracts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface StartSessionResponse {
  sessionId: number;
  openingMessage: string;
  agentType: string;
}

export interface ChatResponse {
  response: string;
  turnCount: number;
  sessionId: number;
}

export interface InterviewDetails {
  participant: {
    id: number;
    instanceId: number;
    email: string;
    name?: string;
    background?: string;
    uniqueToken: string;
    status: string;
    createdAt: string;
  };
  instance: {
    id: number;
    projectId?: number;
    name: string;
    agentType: string;
    objective?: string;
    questions?: string[];
    timeboxMinutes: number;
    maxTurns: number;
    status: string;
    createdAt: string;
  };
}

export const interviewService = {
  /**
   * Get interview details by participant token
   */
  getInterviewByToken: async (token: string): Promise<InterviewDetails> => {
    const response = await fetch(`${API_BASE}/api/interview/${token}`);
    if (!response.ok) {
      throw new Error('Invalid interview token');
    }
    return response.json();
  },

  /**
   * Start an interview session
   */
  startSession: async (token: string): Promise<StartSessionResponse> => {
    const response = await fetch(`${API_BASE}/api/interview/${token}/start`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to start interview');
    }
    const data = await response.json();
    return {
      sessionId: data.session_id,
      openingMessage: data.opening_message,
      agentType: data.agent_type,
    };
  },

  /**
   * Send a message in an interview session
   */
  sendMessage: async (
    sessionId: number,
    message: string,
    audioInput: boolean = false
  ): Promise<ChatResponse> => {
    const response = await fetch(`${API_BASE}/api/sessions/${sessionId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        audio_input: audioInput,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send message');
    }
    return response.json();
  },

  /**
   * End an interview session
   */
  endSession: async (sessionId: number): Promise<{ status: string; turnCount: number }> => {
    const response = await fetch(`${API_BASE}/api/sessions/${sessionId}/end`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to end session');
    }
    const data = await response.json();
    return {
      status: data.status,
      turnCount: data.turn_count,
    };
  },

  /**
   * Get all messages for a session
   */
  getSessionMessages: async (sessionId: number): Promise<InterviewMessage[]> => {
    const response = await fetch(`${API_BASE}/api/sessions/${sessionId}/messages`);
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    const data = await response.json();
    return data.map((m: Record<string, unknown>) => ({
      id: String(m.id),
      sessionId: String(m.session_id),
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content as string,
      audioInput: m.audio_input as boolean,
      timestamp: m.timestamp as string,
    }));
  },

  /**
   * Get insights for a session
   */
  getSessionInsights: async (sessionId: number): Promise<unknown[]> => {
    const response = await fetch(`${API_BASE}/api/sessions/${sessionId}/insights`);
    if (!response.ok) {
      throw new Error('Failed to fetch insights');
    }
    return response.json();
  },
};
