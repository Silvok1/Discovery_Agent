import { InterviewInstance, InterviewConfig, AgentType } from '../contracts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const USER_EMAIL = 'admin@discovery.local';

export const instanceService = {
  getInstances: async (projectId: string): Promise<InterviewInstance[]> => {
    const response = await fetch(`${API_BASE}/api/projects/${projectId}/instances`);
    if (!response.ok) {
      throw new Error('Failed to fetch instances');
    }
    const data = await response.json();
    return data.map(mapBackendInstance);
  },

  getInstance: async (instanceId: string): Promise<InterviewInstance> => {
    const response = await fetch(`${API_BASE}/api/instances/${instanceId}`);
    if (!response.ok) {
      throw new Error('Instance not found');
    }
    const data = await response.json();
    return mapBackendInstance(data);
  },

  createInstance: async (
    projectId: string,
    data: { name: string; description?: string; agentType?: string }
  ): Promise<InterviewInstance> => {
    const response = await fetch(`${API_BASE}/api/instances?user_email=${encodeURIComponent(USER_EMAIL)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: parseInt(projectId),
        name: data.name,
        agent_type: data.agentType || 'explorer',
        objective: data.description || null,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to create instance');
    }
    const instance = await response.json();
    return mapBackendInstance(instance);
  },

  updateInstance: async (
    instanceId: string,
    data: Partial<InterviewConfig>
  ): Promise<InterviewInstance> => {
    const response = await fetch(`${API_BASE}/api/instances/${instanceId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        agent_type: data.agentType,
        objective: data.objective,
        questions: data.guidingQuestions,
        timebox_minutes: data.timeboxMinutes,
        max_turns: data.maxTurns,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to update instance');
    }
    const instance = await response.json();
    return mapBackendInstance(instance);
  },

  activateInstance: async (instanceId: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/api/instances/${instanceId}/activate`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to activate instance');
    }
  },

  getParticipants: async (instanceId: string): Promise<Participant[]> => {
    const response = await fetch(`${API_BASE}/api/instances/${instanceId}/participants`);
    if (!response.ok) {
      throw new Error('Failed to fetch participants');
    }
    const data = await response.json();
    return data.map((p: Record<string, unknown>) => ({
      id: String(p.id),
      instanceId: String(p.instance_id),
      email: p.email as string,
      name: p.name as string | undefined,
      background: p.background as string | undefined,
      uniqueToken: p.unique_token as string,
      status: p.status as string,
      createdAt: p.created_at as string,
    }));
  },

  addParticipant: async (
    instanceId: string,
    data: { email: string; name?: string; background?: string }
  ): Promise<Participant> => {
    const response = await fetch(`${API_BASE}/api/instances/${instanceId}/participants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to add participant');
    }
    const p = await response.json();
    return {
      id: String(p.id),
      instanceId: instanceId,
      email: p.email,
      name: p.name,
      background: p.background,
      uniqueToken: p.unique_token,
      status: p.status,
      createdAt: p.created_at,
    };
  },

  // Get interview config (which is the instance details in our case)
  getInterviewConfig: async (instanceId: string): Promise<InterviewConfig> => {
    const instance = await instanceService.getInstance(instanceId);
    return {
      id: instance.id,
      name: instance.name,
      agentType: instance.agentType,
      objective: instance.objective,
      guidingQuestions: instance.guidingQuestions || [],
      timeboxMinutes: instance.timeboxMinutes,
      maxTurns: instance.maxTurns,
    };
  },

  // Create a preview session (activates instance, adds preview participant, returns token)
  createPreviewSession: async (instanceId: string, previewNumber: number): Promise<string> => {
    // First ensure the instance is active
    await instanceService.activateInstance(instanceId);

    // Use timestamp to ensure unique email even after page refresh
    const timestamp = Date.now();

    // Then add the preview participant
    const participant = await instanceService.addParticipant(instanceId, {
      email: `preview.${previewNumber}.${timestamp}@example.com`,
      name: `Preview Session ${previewNumber}`,
      background: 'Preview/Test Session',
    });
    return participant.uniqueToken;
  },
};

// Types for participant
export interface Participant {
  id: string;
  instanceId: string;
  email: string;
  name?: string;
  background?: string;
  uniqueToken: string;
  status: string;
  createdAt: string;
}

// Map backend instance to frontend InterviewInstance type
function mapBackendInstance(data: Record<string, unknown>): InterviewInstance {
  return {
    id: String(data.id),
    projectId: String(data.project_id),
    name: data.name as string,
    agentType: ((data.agent_type as string) || 'explorer') as AgentType,
    objective: data.objective as string | undefined,
    guidingQuestions: data.questions as string[] | undefined,
    timeboxMinutes: (data.timebox_minutes as number) || 30,
    maxTurns: (data.max_turns as number) || 20,
    status: mapStatus(data.status as string),
    participantCount: 0, // Will be populated separately if needed
    sessionCount: 0,
    createdBy: 'Current User',
    createdAt: data.created_at as string,
    updatedAt: data.created_at as string,
  };
}

function mapStatus(status: string): InterviewInstance['status'] {
  const statusMap: Record<string, InterviewInstance['status']> = {
    'draft': 'Draft',
    'active': 'Live',
    'closed': 'Closed',
  };
  return statusMap[status] || 'Draft';
}
