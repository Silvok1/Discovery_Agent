import {
  Distribution,
  AnonymousLinkSettings,
  QRCodeSettings,
  ContactList,
  Contact,
  EmailMessageTemplate,
  EmailSchedule,
} from '../contracts';

export type { AnonymousLinkSettings } from '../contracts';

// ============================================
// MOCK DATA
// ============================================

const generateMockAnonymousLink = (instanceId: string): AnonymousLinkSettings => ({
  enabled: true,
  url: `https://survey.example.com/s/${instanceId}`,
  allowMultipleResponses: false,
  currentResponses: 0,
  createdAt: new Date().toISOString(),
});

const generateMockQRCode = (instanceId: string): QRCodeSettings => ({
  enabled: true,
  linkType: 'anonymous',
  url: `https://survey.example.com/s/${instanceId}`,
  size: 256,
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  downloadCount: 0,
  createdAt: new Date().toISOString(),
});

const MOCK_EMAIL_TEMPLATES: EmailMessageTemplate[] = [
  {
    id: 'template-1',
    type: 'invitation',
    name: 'Initial Invitation',
    subject: 'We\'d love your feedback',
    fromName: 'Survey Team',
    fromEmail: 'surveys@example.com',
    htmlContent: `
      <h1>Hello {{firstName}},</h1>
      <p>We value your opinion and would like to invite you to participate in our survey.</p>
      <p>This survey will take approximately 5 minutes to complete.</p>
      <p><a href="{{surveyLink}}">Click here to start the survey</a></p>
      <p>Thank you for your time!</p>
    `,
    enabled: true,
  },
  {
    id: 'template-2',
    type: 'reminder',
    name: 'First Reminder',
    subject: 'Reminder: We still want to hear from you',
    fromName: 'Survey Team',
    fromEmail: 'surveys@example.com',
    htmlContent: `
      <h1>Hello {{firstName}},</h1>
      <p>We noticed you haven't completed our survey yet. Your feedback is important to us.</p>
      <p><a href="{{surveyLink}}">Click here to complete the survey</a></p>
      <p>Thank you!</p>
    `,
    enabled: true,
  },
  {
    id: 'template-3',
    type: 'thankYou',
    name: 'Thank You Email',
    subject: 'Thank you for your feedback!',
    fromName: 'Survey Team',
    fromEmail: 'surveys@example.com',
    htmlContent: `
      <h1>Thank you, {{firstName}}!</h1>
      <p>We appreciate you taking the time to complete our survey.</p>
      <p>Your feedback helps us improve our services.</p>
    `,
    enabled: true,
  },
];

const MOCK_CONTACT_LIST: ContactList = {
  id: 'list-1',
  name: 'Sample Contact List',
  description: 'A sample list for demonstration',
  contacts: [
    {
      id: 'contact-1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'contact-2',
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ============================================
// SERVICE IMPLEMENTATION
// ============================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const distributionService = {
  // ==========================================
  // Anonymous Link APIs
  // ==========================================

  /**
   * GET /api/instances/:instanceId/anonymous-link
   * Retrieves the anonymous link settings for an interview instance.
   */
  getAnonymousLink: async (instanceId: string): Promise<AnonymousLinkSettings> => {
    const response = await fetch(`${API_BASE}/api/instances/${instanceId}/anonymous-link`);
    if (!response.ok) {
      throw new Error('Failed to fetch anonymous link settings');
    }
    const data = await response.json();
    return {
      enabled: data.enabled,
      url: data.url,
      allowMultipleResponses: data.allow_multiple,
      maxResponses: data.max_responses,
      currentResponses: data.current_responses,
      expiresAt: data.expires_at,
      createdAt: data.created_at,
    };
  },

  /**
   * PATCH /api/instances/:instanceId/anonymous-link
   * Updates the anonymous link settings.
   */
  updateAnonymousLink: async (
    instanceId: string,
    updates: Partial<AnonymousLinkSettings>
  ): Promise<AnonymousLinkSettings> => {
    const response = await fetch(`${API_BASE}/api/instances/${instanceId}/anonymous-link`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        enabled: updates.enabled,
        allow_multiple: updates.allowMultipleResponses,
        max_responses: updates.maxResponses,
        expires_at: updates.expiresAt,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to update anonymous link settings');
    }
    const data = await response.json();
    return {
      enabled: data.enabled,
      url: data.url,
      allowMultipleResponses: data.allow_multiple,
      maxResponses: data.max_responses,
      currentResponses: data.current_responses,
      expiresAt: data.expires_at,
      createdAt: data.created_at,
    };
  },

  // ==========================================
  // QR Code APIs
  // ==========================================

  /**
   * GET /api/instances/:instanceId/qr-code
   * Retrieves the QR code settings for a survey instance.
   */
  getQRCodeSettings: async (instanceId: string): Promise<QRCodeSettings> => {
    // TODO:BACKEND - Implement GET_QR_CODE_SETTINGS
    await new Promise((resolve) => setTimeout(resolve, 300));
    return generateMockQRCode(instanceId);
  },

  /**
   * PATCH /api/instances/:instanceId/qr-code
   * Updates the QR code settings.
   */
  updateQRCodeSettings: async (
    instanceId: string,
    updates: Partial<QRCodeSettings>
  ): Promise<QRCodeSettings> => {
    // TODO:BACKEND - Implement UPDATE_QR_CODE_SETTINGS
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { ...generateMockQRCode(instanceId), ...updates };
  },

  /**
   * POST /api/instances/:instanceId/qr-code/download
   * Logs a QR code download and returns the updated settings.
   * Note: Actual download is handled client-side; this just tracks analytics.
   */
  logQRCodeDownload: async (instanceId: string): Promise<QRCodeSettings> => {
    // TODO:BACKEND - Implement QR_CODE_DOWNLOAD tracking
    await new Promise((resolve) => setTimeout(resolve, 100));
    const settings = generateMockQRCode(instanceId);
    return { ...settings, downloadCount: settings.downloadCount + 1 };
  },

  // ==========================================
  // Contact List APIs
  // ==========================================

  /**
   * GET /api/contact-lists
   * Retrieves all contact lists for the organization.
   */
  getContactLists: async (): Promise<ContactList[]> => {
    // TODO:BACKEND - Implement GET_CONTACT_LISTS
    await new Promise((resolve) => setTimeout(resolve, 400));
    return [MOCK_CONTACT_LIST];
  },

  /**
   * POST /api/contact-lists
   * Creates a new contact list.
   */
  createContactList: async (
    data: Pick<ContactList, 'name' | 'description' | 'contacts'>
  ): Promise<ContactList> => {
    // TODO:BACKEND - Implement CREATE_CONTACT_LIST
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      ...data,
      id: `list-${Date.now()}`,
      contacts: data.contacts || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * POST /api/contact-lists/:listId/import
   * Imports contacts from a CSV file into an existing list.
   */
  importContacts: async (
    listId: string,
    file: File,
    mappings: Record<string, string>
  ): Promise<{ imported: number; failed: number; errors: string[] }> => {
    // TODO:BACKEND - Implement IMPORT_CONTACTS
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Mock result
    return {
      imported: 100,
      failed: 2,
      errors: ['Row 45: Invalid email format', 'Row 67: Missing required field'],
    };
  },

  // ==========================================
  // Email Template APIs
  // ==========================================

  /**
   * GET /api/instances/:instanceId/email-templates
   * Retrieves all email templates for a survey instance.
   */
  getEmailTemplates: async (instanceId: string): Promise<EmailMessageTemplate[]> => {
    // TODO:BACKEND - Implement GET_EMAIL_TEMPLATES
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_EMAIL_TEMPLATES;
  },

  /**
   * POST /api/instances/:instanceId/email-templates
   * Creates a new email template.
   */
  createEmailTemplate: async (
    instanceId: string,
    data: Omit<EmailMessageTemplate, 'id'>
  ): Promise<EmailMessageTemplate> => {
    // TODO:BACKEND - Implement CREATE_EMAIL_TEMPLATE
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      ...data,
      id: `template-${Date.now()}`,
    };
  },

  /**
   * PATCH /api/email-templates/:templateId
   * Updates an existing email template.
   */
  updateEmailTemplate: async (
    templateId: string,
    updates: Partial<EmailMessageTemplate>
  ): Promise<EmailMessageTemplate> => {
    // TODO:BACKEND - Implement UPDATE_EMAIL_TEMPLATE
    await new Promise((resolve) => setTimeout(resolve, 300));
    const existing = MOCK_EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (!existing) throw new Error('Template not found');
    return { ...existing, ...updates };
  },

  // ==========================================
  // Email Schedule APIs
  // ==========================================

  /**
   * GET /api/instances/:instanceId/email-schedules
   * Retrieves all email schedules for a survey instance.
   */
  getEmailSchedules: async (instanceId: string): Promise<EmailSchedule[]> => {
    // TODO:BACKEND - Implement GET_EMAIL_SCHEDULES
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [
      {
        id: 'schedule-1',
        templateId: 'template-1',
        type: 'immediate',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'schedule-2',
        templateId: 'template-2',
        type: 'triggered',
        triggerType: 'daysAfterInvite',
        triggerValue: 3,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  },

  /**
   * POST /api/instances/:instanceId/email-schedules
   * Creates a new email schedule.
   */
  createEmailSchedule: async (
    instanceId: string,
    data: Omit<EmailSchedule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<EmailSchedule> => {
    // TODO:BACKEND - Implement CREATE_EMAIL_SCHEDULE
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      ...data,
      id: `schedule-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * PATCH /api/email-schedules/:scheduleId
   * Updates an existing email schedule.
   */
  updateEmailSchedule: async (
    scheduleId: string,
    updates: Partial<EmailSchedule>
  ): Promise<EmailSchedule> => {
    // TODO:BACKEND - Implement UPDATE_EMAIL_SCHEDULE
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      id: scheduleId,
      templateId: 'template-1',
      type: 'immediate',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...updates,
    };
  },

  // ==========================================
  // Distribution Send APIs
  // ==========================================

  /**
   * POST /api/distributions/:distributionId/send
   * Triggers sending the email distribution to contacts.
   */
  sendEmailDistribution: async (
    distributionId: string,
    contactListId: string,
    scheduleId?: string
  ): Promise<{ queued: number; estimatedDelivery: string }> => {
    // TODO:BACKEND - Implement SEND_EMAIL_DISTRIBUTION
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      queued: 100,
      estimatedDelivery: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };
  },

  /**
   * POST /api/distributions/:distributionId/test
   * Sends a test email to verify the template.
   */
  sendTestEmail: async (
    distributionId: string,
    templateId: string,
    recipientEmail: string
  ): Promise<{ success: boolean; message: string }> => {
    // TODO:BACKEND - Implement SEND_TEST_EMAIL
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      message: `Test email sent to ${recipientEmail}`,
    };
  },
};
