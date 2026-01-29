import { Instrument, Message } from '../contracts';

const MOCK_INSTRUMENTS: Instrument[] = [
  {
    id: '1',
    name: 'NPS Question Standard',
    type: 'Question',
    content: { question: 'How likely are you to recommend us?', scale: 10 },
    tags: ['NPS', 'Standard'],
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2023-06-20T14:00:00Z',
    accessLevel: 'global',
    scope: 'system',
  },
  {
    id: '2',
    name: 'Basic Demographics',
    type: 'Demographics',
    content: { fields: ['Age', 'Gender', 'Location'] },
    tags: ['Demographics', 'Global'],
    createdAt: '2023-02-10T09:30:00Z',
    updatedAt: '2023-02-10T09:30:00Z',
    accessLevel: 'global',
    scope: 'organization',
  },
  {
    id: '3',
    name: 'Welcome Page - Corporate',
    type: 'Welcome Page',
    content: { title: 'Welcome', body: 'Thank you for participating.' },
    tags: ['Branding', 'Intro'],
    createdAt: '2023-03-05T11:00:00Z',
    updatedAt: '2023-08-12T16:20:00Z',
    accessLevel: 'campaign',
    scope: 'user',
    ownerId: 'user-123',
    campaignId: 'campaign-1',
  },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    name: 'Initial Invitation',
    subject: 'We want your feedback!',
    content: 'Hi {{name}}, please take our survey...',
    type: 'Email',
    createdAt: '2023-05-01T10:00:00Z',
    updatedAt: '2023-05-01T10:00:00Z',
    accessLevel: 'global',
    scope: 'system',
  },
  {
    id: '2',
    name: 'Reminder 1',
    subject: 'Reminder: Your feedback matters',
    content: 'Hi {{name}}, just a friendly reminder...',
    type: 'Email',
    createdAt: '2023-05-05T10:00:00Z',
    updatedAt: '2023-05-05T10:00:00Z',
    accessLevel: 'project',
    scope: 'user',
    ownerId: 'user-456',
    projectId: 'project-1',
  },
  {
    id: '3',
    name: 'SMS Invite',
    content: 'Click here to take survey: {{link}}',
    type: 'SMS',
    createdAt: '2023-06-10T14:00:00Z',
    updatedAt: '2023-06-10T14:00:00Z',
    accessLevel: 'global',
    scope: 'organization',
  },
];

export const libraryService = {
  getInstruments: async (): Promise<Instrument[]> => {
    // TODO:BACKEND - Implement GET_INSTRUMENTS
    await new Promise((resolve) => setTimeout(resolve, 600));
    return [...MOCK_INSTRUMENTS];
  },

  getMessages: async (): Promise<Message[]> => {
    // TODO:BACKEND - Implement GET_MESSAGES
    await new Promise((resolve) => setTimeout(resolve, 600));
    return [...MOCK_MESSAGES];
  },

  /**
   * Filter library items based on hierarchical access control
   * Items are accessible if:
   * - Global scope (accessible everywhere)
   * - Campaign scope and matches campaignId (accessible to all projects/instances in campaign)
   * - Project scope and matches projectId (accessible to all instances in project)
   * - Instance scope and matches instanceId (only accessible to specific instance)
   */
  filterByAccess: <T extends { accessLevel: 'global' | 'campaign' | 'project' | 'instance'; campaignId?: string; projectId?: string; instanceId?: string }>(
    items: T[],
    context: { campaignId?: string; projectId?: string; instanceId?: string }
  ): T[] => {
    if (!Array.isArray(items)) return [];
    
    return items.filter(item => {
      if (!item || typeof item !== 'object') return false;

      // Global items are always accessible
      if (item.accessLevel === 'global') return true;

      // Campaign-level items accessible if in same campaign
      if (item.accessLevel === 'campaign' && item.campaignId && item.campaignId === context.campaignId) return true;

      // Project-level items accessible if in same project
      if (item.accessLevel === 'project' && item.projectId && item.projectId === context.projectId) return true;

      // Instance-level items accessible only to that instance
      if (item.accessLevel === 'instance' && item.instanceId && item.instanceId === context.instanceId) return true;

      return false;
    });
  },
};
