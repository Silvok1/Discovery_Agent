'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  Plus,
  Edit,
  Trash2,
  Clock,
  Send,
  Calendar,
  Save,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DistributionsPanelProps {
  instanceId: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  type: 'invitation' | 'reminder';
  subject: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  cc?: string;
  bcc?: string;
  body: string;
  isDefault?: boolean;
}

interface EmailSchedule {
  id: string;
  templateId: string;
  type: 'immediate' | 'scheduled' | 'relative';
  scheduledDate?: string;
  scheduledTime?: string;
  relativeDays?: number;
  relativeFrom?: 'instance_start' | 'deadline' | 'invitation_sent';
  status: 'draft' | 'scheduled' | 'sent';
}

const PLACEHOLDER_VARIABLES = [
  { key: '{{firstName}}', description: 'Participant first name' },
  { key: '{{lastName}}', description: 'Participant last name' },
  { key: '{{email}}', description: 'Participant email' },
  { key: '{{interviewLink}}', description: 'Unique interview link' },
  { key: '{{instanceName}}', description: 'Interview instance name' },
  { key: '{{deadline}}', description: 'Instance deadline date' },
];

const DEFAULT_INVITATION_TEMPLATE: Omit<EmailTemplate, 'id'> = {
  name: 'Default Invitation',
  type: 'invitation',
  subject: 'You\'re Invited: {{instanceName}}',
  fromName: 'Discovery Agent',
  fromEmail: 'noreply@example.com',
  body: `Hello {{firstName}},

You have been selected to participate in an interview session: {{instanceName}}.

This interview will help us understand your workflows and identify opportunities for improvement.

Click the link below to begin:
{{interviewLink}}

Please complete this interview by {{deadline}}.

Thank you for your participation!`,
};

const DEFAULT_REMINDER_TEMPLATE: Omit<EmailTemplate, 'id'> = {
  name: 'Default Reminder',
  type: 'reminder',
  subject: 'Reminder: Complete Your Interview - {{instanceName}}',
  fromName: 'Discovery Agent',
  fromEmail: 'noreply@example.com',
  body: `Hello {{firstName}},

This is a friendly reminder that you have not yet completed your interview for {{instanceName}}.

The deadline is {{deadline}}.

Click the link below to complete your interview:
{{interviewLink}}

Thank you!`,
};

export function DistributionsPanel({ instanceId }: DistributionsPanelProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [schedules, setSchedules] = useState<EmailSchedule[]>([]);
  const [instanceDeadline, setInstanceDeadline] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<EmailSchedule | null>(null);
  const [expandedSection, setExpandedSection] = useState<'templates' | 'schedules' | 'deadline' | null>('templates');

  useEffect(() => {
    loadData();
  }, [instanceId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // TODO: Load from API
      // For now, initialize with default templates
      setTemplates([
        { ...DEFAULT_INVITATION_TEMPLATE, id: 'inv-1', isDefault: true },
        { ...DEFAULT_REMINDER_TEMPLATE, id: 'rem-1', isDefault: true },
      ]);
      setSchedules([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = (template: EmailTemplate) => {
    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === template.id ? template : t));
    } else {
      setTemplates([...templates, { ...template, id: `template-${Date.now()}` }]);
    }
    setShowTemplateEditor(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const handleSaveSchedule = (schedule: EmailSchedule) => {
    if (editingSchedule) {
      setSchedules(schedules.map(s => s.id === schedule.id ? schedule : s));
    } else {
      setSchedules([...schedules, { ...schedule, id: `schedule-${Date.now()}` }]);
    }
    setShowScheduleEditor(false);
    setEditingSchedule(null);
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-brand-dark">Email Distribution</h2>
        <p className="text-sm text-gray-500">
          Configure invitation and reminder emails for participants.
        </p>
      </div>

      {/* Instance Deadline */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setExpandedSection(expandedSection === 'deadline' ? null : 'deadline')}
          className="flex w-full items-center justify-between p-4"
        >
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Instance Deadline</h3>
              <p className="text-sm text-gray-500">
                {instanceDeadline
                  ? `Deadline: ${new Date(instanceDeadline).toLocaleDateString()}`
                  : 'No deadline set'}
              </p>
            </div>
          </div>
          {expandedSection === 'deadline' ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSection === 'deadline' && (
          <div className="border-t px-4 py-4">
            <label htmlFor="instance-deadline" className="block text-sm font-medium text-gray-700 mb-2">
              Interview Completion Deadline
            </label>
            <input
              id="instance-deadline"
              type="datetime-local"
              value={instanceDeadline}
              onChange={(e) => setInstanceDeadline(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
            />
            <p className="mt-2 text-xs text-gray-500">
              Participants will see this deadline in their emails and interview interface.
            </p>
          </div>
        )}
      </div>

      {/* Email Templates */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setExpandedSection(expandedSection === 'templates' ? null : 'templates')}
          className="flex w-full items-center justify-between p-4"
        >
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gray-500" />
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Email Templates</h3>
              <p className="text-sm text-gray-500">{templates.length} template{templates.length !== 1 ? 's' : ''} configured</p>
            </div>
          </div>
          {expandedSection === 'templates' ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSection === 'templates' && (
          <div className="border-t">
            {/* Template List */}
            <div className="divide-y">
              {templates.map((template) => (
                <div key={template.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{template.name}</span>
                      <span className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        template.type === 'invitation'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      )}>
                        {template.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{template.subject}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTemplate(template);
                        setShowTemplateEditor(true);
                      }}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      title="Edit template"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {!template.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete template"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Add Template Button */}
            <div className="p-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setEditingTemplate(null);
                  setShowTemplateEditor(true);
                }}
                className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-700"
              >
                <Plus className="h-4 w-4" />
                Create New Template
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Email Schedules */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setExpandedSection(expandedSection === 'schedules' ? null : 'schedules')}
          className="flex w-full items-center justify-between p-4"
        >
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-gray-500" />
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Send Schedule</h3>
              <p className="text-sm text-gray-500">
                {schedules.length === 0
                  ? 'No emails scheduled'
                  : `${schedules.length} email${schedules.length !== 1 ? 's' : ''} scheduled`}
              </p>
            </div>
          </div>
          {expandedSection === 'schedules' ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSection === 'schedules' && (
          <div className="border-t">
            {schedules.length === 0 ? (
              <div className="p-8 text-center">
                <Clock className="mx-auto h-10 w-10 text-gray-300" />
                <h4 className="mt-3 text-sm font-medium text-gray-900">No emails scheduled</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Schedule when invitation and reminder emails should be sent.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {schedules.map((schedule) => {
                  const template = templates.find(t => t.id === schedule.templateId);
                  return (
                    <div key={schedule.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{template?.name || 'Unknown template'}</span>
                          <span className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium',
                            schedule.status === 'sent' ? 'bg-green-100 text-green-700' :
                            schedule.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'
                          )}>
                            {schedule.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {schedule.type === 'immediate' && 'Send immediately when instance goes live'}
                          {schedule.type === 'scheduled' && `Scheduled for ${schedule.scheduledDate} at ${schedule.scheduledTime}`}
                          {schedule.type === 'relative' && `${schedule.relativeDays} days after ${schedule.relativeFrom?.replace('_', ' ')}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSchedule(schedule);
                            setShowScheduleEditor(true);
                          }}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          title="Edit schedule"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete schedule"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="p-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setEditingSchedule(null);
                  setShowScheduleEditor(true);
                }}
                className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-700"
              >
                <Plus className="h-4 w-4" />
                Add Email Schedule
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-blue-50 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Emails will be sent when the instance is set to Live</p>
            <p className="mt-1">
              Scheduled emails will only be sent after you activate this instance.
              You can preview emails before going live.
            </p>
          </div>
        </div>
      </div>

      {/* Template Editor Modal */}
      {showTemplateEditor && (
        <EmailTemplateEditor
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onClose={() => {
            setShowTemplateEditor(false);
            setEditingTemplate(null);
          }}
        />
      )}

      {/* Schedule Editor Modal */}
      {showScheduleEditor && (
        <EmailScheduleEditor
          schedule={editingSchedule}
          templates={templates}
          onSave={handleSaveSchedule}
          onClose={() => {
            setShowScheduleEditor(false);
            setEditingSchedule(null);
          }}
        />
      )}
    </div>
  );
}

// Email Template Editor Modal
interface TemplateEditorProps {
  template: EmailTemplate | null;
  onSave: (template: EmailTemplate) => void;
  onClose: () => void;
}

function EmailTemplateEditor({ template, onSave, onClose }: TemplateEditorProps) {
  const [formData, setFormData] = useState<Omit<EmailTemplate, 'id'>>({
    name: template?.name || '',
    type: template?.type || 'invitation',
    subject: template?.subject || '',
    fromName: template?.fromName || 'Discovery Agent',
    fromEmail: template?.fromEmail || '',
    replyTo: template?.replyTo || '',
    cc: template?.cc || '',
    bcc: template?.bcc || '',
    body: template?.body || '',
  });
  const [showVariables, setShowVariables] = useState(false);

  const handleSave = () => {
    onSave({
      ...formData,
      id: template?.id || '',
    });
  };

  const insertVariable = (variable: string) => {
    setFormData({ ...formData, body: formData.body + variable });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-brand-dark">
            {template ? 'Edit Email Template' : 'Create Email Template'}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Template Name & Type */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                placeholder="e.g., Initial Invitation"
              />
            </div>
            <div>
              <label htmlFor="template-type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                id="template-type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'invitation' | 'reminder' })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
              >
                <option value="invitation">Invitation</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>
          </div>

          {/* From Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
              <input
                type="text"
                value={formData.fromName}
                onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                placeholder="Discovery Agent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
              <input
                type="email"
                value={formData.fromEmail}
                onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                placeholder="noreply@example.com"
              />
            </div>
          </div>

          {/* Reply-To, CC, BCC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reply-To (optional)</label>
            <input
              type="email"
              value={formData.replyTo}
              onChange={(e) => setFormData({ ...formData, replyTo: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
              placeholder="replies@example.com"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CC (optional)</label>
              <input
                type="text"
                value={formData.cc}
                onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                placeholder="manager@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">BCC (optional)</label>
              <input
                type="text"
                value={formData.bcc}
                onChange={(e) => setFormData({ ...formData, bcc: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                placeholder="archive@example.com"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
              placeholder="You're Invited: {{instanceName}}"
            />
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Email Body</label>
              <button
                type="button"
                onClick={() => setShowVariables(!showVariables)}
                className="text-xs text-brand-teal hover:underline"
              >
                {showVariables ? 'Hide' : 'Show'} Variables
              </button>
            </div>
            {showVariables && (
              <div className="mb-2 rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-600 mb-2">Click to insert:</p>
                <div className="flex flex-wrap gap-2">
                  {PLACEHOLDER_VARIABLES.map((v) => (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => insertVariable(v.key)}
                      className="rounded bg-white px-2 py-1 text-xs font-mono text-brand-teal border border-gray-200 hover:bg-gray-100"
                      title={v.description}
                    >
                      {v.key}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              rows={10}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
              placeholder="Write your email content here..."
            />
          </div>

          {/* Save to Library Option */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
            <BookOpen className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Templates are automatically saved to your email library for reuse.
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!formData.name || !formData.subject || !formData.body}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white',
                !formData.name || !formData.subject || !formData.body
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-brand-teal hover:bg-teal-700'
              )}
            >
              <Save className="h-4 w-4" />
              Save Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Email Schedule Editor Modal
interface ScheduleEditorProps {
  schedule: EmailSchedule | null;
  templates: EmailTemplate[];
  onSave: (schedule: EmailSchedule) => void;
  onClose: () => void;
}

function EmailScheduleEditor({ schedule, templates, onSave, onClose }: ScheduleEditorProps) {
  const [formData, setFormData] = useState<Omit<EmailSchedule, 'id'>>({
    templateId: schedule?.templateId || templates[0]?.id || '',
    type: schedule?.type || 'immediate',
    scheduledDate: schedule?.scheduledDate || '',
    scheduledTime: schedule?.scheduledTime || '09:00',
    relativeDays: schedule?.relativeDays || 3,
    relativeFrom: schedule?.relativeFrom || 'invitation_sent',
    status: schedule?.status || 'draft',
  });

  const handleSave = () => {
    onSave({
      ...formData,
      id: schedule?.id || '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-brand-dark">
            {schedule ? 'Edit Schedule' : 'Schedule Email'}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Template Selection */}
          <div>
            <label htmlFor="schedule-template" className="block text-sm font-medium text-gray-700 mb-1">Email Template</label>
            <select
              id="schedule-template"
              value={formData.templateId}
              onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
              ))}
            </select>
          </div>

          {/* Schedule Type */}
          <div>
            <label htmlFor="schedule-type" className="block text-sm font-medium text-gray-700 mb-1">When to Send</label>
            <select
              id="schedule-type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as EmailSchedule['type'] })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
            >
              <option value="immediate">Immediately (when instance goes live)</option>
              <option value="scheduled">On a specific date/time</option>
              <option value="relative">Days after an event</option>
            </select>
          </div>

          {/* Scheduled Date/Time */}
          {formData.type === 'scheduled' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="schedule-date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  id="schedule-date"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                />
              </div>
              <div>
                <label htmlFor="schedule-time" className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  id="schedule-time"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                />
              </div>
            </div>
          )}

          {/* Relative Schedule */}
          {formData.type === 'relative' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="schedule-days" className="block text-sm font-medium text-gray-700 mb-1">Days</label>
                <input
                  id="schedule-days"
                  type="number"
                  min="1"
                  value={formData.relativeDays}
                  onChange={(e) => setFormData({ ...formData, relativeDays: parseInt(e.target.value) || 1 })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                />
              </div>
              <div>
                <label htmlFor="schedule-relative-from" className="block text-sm font-medium text-gray-700 mb-1">After</label>
                <select
                  id="schedule-relative-from"
                  value={formData.relativeFrom}
                  onChange={(e) => setFormData({ ...formData, relativeFrom: e.target.value as EmailSchedule['relativeFrom'] })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                >
                  <option value="invitation_sent">Invitation sent</option>
                  <option value="instance_start">Instance goes live</option>
                  <option value="deadline">Before deadline</option>
                </select>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!formData.templateId}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white',
                !formData.templateId
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-brand-teal hover:bg-teal-700'
              )}
            >
              <Clock className="h-4 w-4" />
              {schedule ? 'Update Schedule' : 'Add Schedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
