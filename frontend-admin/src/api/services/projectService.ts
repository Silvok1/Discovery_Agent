import { Project } from '../contracts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Hardcoded user email for now - will be replaced with auth later
const USER_EMAIL = 'admin@discovery.local';

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    const response = await fetch(`${API_BASE}/api/projects?user_email=${encodeURIComponent(USER_EMAIL)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    const data = await response.json();
    // Map backend response to frontend Project type
    return data.map((p: Record<string, unknown>) => ({
      id: String(p.id),
      name: p.name as string,
      description: p.description as string | undefined,
      type: 'Customer Experience' as const, // Default type
      status: mapStatus(p.status as string),
      owner: USER_EMAIL,
      createdAt: p.created_at as string,
      updatedAt: p.updated_at as string,
    }));
  },

  createProject: async (data: Pick<Project, 'name' | 'description' | 'type'>): Promise<Project> => {
    const response = await fetch(`${API_BASE}/api/projects?user_email=${encodeURIComponent(USER_EMAIL)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        description: data.description || null,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to create project');
    }
    const p = await response.json();
    return {
      id: String(p.id),
      name: p.name,
      description: p.description,
      type: data.type,
      status: mapStatus(p.status),
      owner: USER_EMAIL,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    };
  },

  getProject: async (projectId: string): Promise<Project> => {
    const response = await fetch(`${API_BASE}/api/projects/${projectId}`);
    if (!response.ok) {
      throw new Error('Project not found');
    }
    const p = await response.json();
    return {
      id: String(p.id),
      name: p.name,
      description: p.description,
      type: 'Customer Experience',
      status: mapStatus(p.status),
      owner: USER_EMAIL,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    };
  },

  updateProject: async (projectId: string, data: Partial<Project>): Promise<Project> => {
    const response = await fetch(`${API_BASE}/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        status: data.status?.toLowerCase(),
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to update project');
    }
    const p = await response.json();
    return {
      id: String(p.id),
      name: p.name,
      description: p.description,
      type: data.type || 'Customer Experience',
      status: mapStatus(p.status),
      owner: USER_EMAIL,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    };
  },
};

// Map backend status to frontend status
function mapStatus(status: string): Project['status'] {
  const statusMap: Record<string, Project['status']> = {
    'draft': 'Draft',
    'active': 'Live',
    'closed': 'Closed',
    'archived': 'Archived',
  };
  return statusMap[status] || 'Draft';
}
