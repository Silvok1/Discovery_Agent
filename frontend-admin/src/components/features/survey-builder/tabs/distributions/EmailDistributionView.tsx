'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  Plus,
  Upload,
  Users,
  Clock,
  Settings,
  Calendar,
  Send,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  FileText,
  Eye,
  Copy,
  ToggleLeft,
  ToggleRight,
  Play,
  Pause,
} from 'lucide-react';
import { distributionService } from '@/api/services/distributionService';
import { EmailMessageTemplate, EmailSchedule, ContactList } from '@/api/contracts';
import { cn } from '@/lib/utils';

interface EmailDistributionViewProps {
  instanceId: string;
}

type EmailSubTab = 'overview' | 'contacts' | 'templates' | 'schedules';

export function EmailDistributionView({ instanceId }: EmailDistributionViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<EmailSubTab>('overview');
  const [templates, setTemplates] = useState<EmailMessageTemplate[]>([]);
  const [schedules, setSchedules] = useState<EmailSchedule[]>([]);
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailMessageTemplate | null>(null);
  const [expandedSchedule, setExpandedSchedule] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [instanceId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesData, schedulesData, contactListsData] = await Promise.all([
        distributionService.getEmailTemplates(instanceId),
        distributionService.getEmailSchedules(instanceId),
        distributionService.getContactLists(),
      ]);
      setTemplates(templatesData);
      setSchedules(schedulesData);
      setContactLists(contactListsData);
    } catch (error) {
      console.error('Failed to load email distribution data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalContacts = () => {
    return contactLists.reduce((sum, list) => sum + list.contacts.length, 0);
  };

  const getTemplateById = (id: string) => {
    return templates.find((t) => t.id === id);
  };

  const getScheduleStatusBadge = (status: EmailSchedule['status']) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      scheduled: 'bg-blue-100 text-blue-700',
      sending: 'bg-yellow-100 text-yellow-700',
      sent: 'bg-green-100 text-green-700',
      paused: 'bg-orange-100 text-orange-700',
      failed: 'bg-red-100 text-red-700',
    };
    return (
      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', styles[status])}>
        {status}
      </span>
    );
  };

  const subTabs: { id: EmailSubTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Mail },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'schedules', label: 'Schedules', icon: Calendar },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-teal border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Email Distribution</h2>
        <p className="mt-1 text-sm text-gray-500">
          Send personalized survey invitations with unique, trackable links to your contacts.
        </p>
      </div>

      {/* Info Banner */}
      <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
        <div className="flex gap-3">
          <Mail className="h-5 w-5 flex-shrink-0 text-teal-600" />
          <div className="text-sm text-teal-700">
            <p className="font-medium">Unique Links per Recipient</p>
            <p className="mt-1">
              Each contact receives a unique survey link, allowing you to track who has responded, 
              send targeted reminders to non-responders, and prevent duplicate submissions.
            </p>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex border-b border-gray-200">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={cn(
                'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                activeSubTab === tab.id
                  ? 'border-brand-teal text-brand-teal'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sub Tab Content */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{getTotalContacts()}</p>
                  <p className="text-xs text-gray-500">Total Contacts</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <Send className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-xs text-gray-500">Emails Sent</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <Eye className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">0%</p>
                  <p className="text-xs text-gray-500">Open Rate</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
                  <CheckCircle className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">0%</p>
                  <p className="text-xs text-gray-500">Response Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 font-medium text-gray-900">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setActiveSubTab('contacts')}
                className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 hover:border-brand-teal hover:bg-brand-light/10"
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Import Contacts</span>
              </button>
              <button
                onClick={() => setActiveSubTab('templates')}
                className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 hover:border-brand-teal hover:bg-brand-light/10"
              >
                <Edit3 className="h-8 w-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Edit Templates</span>
              </button>
              <button
                onClick={() => setActiveSubTab('schedules')}
                className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 hover:border-brand-teal hover:bg-brand-light/10"
              >
                <Calendar className="h-8 w-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Schedule Emails</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 font-medium text-gray-900">Email Schedule Summary</h3>
            {schedules.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-500">No email schedules configured yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {schedules.map((schedule) => {
                  const template = getTemplateById(schedule.templateId);
                  return (
                    <div key={schedule.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{template?.name || 'Unknown Template'}</p>
                          <p className="text-xs text-gray-500">
                            {schedule.type === 'immediate' && 'Immediate'}
                            {schedule.type === 'scheduled' && `Scheduled: ${schedule.scheduledDate}`}
                            {schedule.type === 'triggered' && `${schedule.triggerValue} days after invite`}
                          </p>
                        </div>
                      </div>
                      {getScheduleStatusBadge(schedule.status)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'contacts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Manage your contact lists and import recipients for email distribution.
            </p>
            <button className="flex items-center gap-2 rounded-md bg-brand-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
              <Plus className="h-4 w-4" />
              New Contact List
            </button>
          </div>

          {contactLists.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">No Contact Lists</h3>
              <p className="mb-6 text-gray-500">
                Upload a CSV file or create a list manually to start sending surveys.
              </p>
              <div className="flex justify-center gap-4">
                <button className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Upload className="h-4 w-4" />
                  Import CSV
                </button>
                <button className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Plus className="h-4 w-4" />
                  Add Manually
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {contactLists.map((list) => (
                <div key={list.id} className="rounded-lg border border-gray-200 bg-white">
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium text-gray-900">{list.name}</h4>
                        <p className="text-xs text-gray-500">{list.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                        {list.contacts.length} contacts
                      </span>
                      <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500">
                          <th className="pb-2 font-medium">Email</th>
                          <th className="pb-2 font-medium">Name</th>
                          <th className="pb-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {list.contacts.slice(0, 5).map((contact) => (
                          <tr key={contact.id}>
                            <td className="py-2 font-mono text-gray-900">{contact.email}</td>
                            <td className="py-2 text-gray-700">
                              {contact.firstName} {contact.lastName}
                            </td>
                            <td className="py-2">
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600">
                                {contact.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {list.contacts.length > 5 && (
                      <p className="mt-2 text-center text-xs text-gray-500">
                        + {list.contacts.length - 5} more contacts
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Customize email templates for invitations, reminders, and thank you messages.
            </p>
            <button className="flex items-center gap-2 rounded-md bg-brand-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
              <Plus className="h-4 w-4" />
              New Template
            </button>
          </div>

          <div className="grid gap-4">
            {templates.map((template) => (
              <div key={template.id} className="rounded-lg border border-gray-200 bg-white">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      template.type === 'invitation' && 'bg-blue-100 text-blue-600',
                      template.type === 'reminder' && 'bg-purple-100 text-purple-600',
                      template.type === 'thankYou' && 'bg-green-100 text-green-600',
                    )}>
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <p className="text-xs text-gray-500 capitalize">{template.type.replace(/([A-Z])/g, ' $1').trim()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {template.enabled ? (
                      <ToggleRight className="h-6 w-6 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-gray-400" />
                    )}
                    <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Subject:</span>
                      <p className="font-medium text-gray-900">{template.subject}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">From:</span>
                      <p className="font-medium text-gray-900">
                        {template.fromName} &lt;{template.fromEmail}&gt;
                      </p>
                    </div>
                  </div>
                  <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                    <div 
                      className="prose prose-sm max-h-24 overflow-hidden text-gray-600"
                      dangerouslySetInnerHTML={{ __html: template.htmlContent.slice(0, 300) + '...' }}
                    />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="flex items-center gap-1 rounded border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50">
                      <Eye className="h-3 w-3" />
                      Preview
                    </button>
                    <button className="flex items-center gap-1 rounded border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50">
                      <Send className="h-3 w-3" />
                      Send Test
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Merge Tags Info */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="mb-2 text-sm font-medium text-gray-700">Available Merge Tags</h4>
            <div className="flex flex-wrap gap-2">
              {['{{firstName}}', '{{lastName}}', '{{email}}', '{{surveyLink}}', '{{surveyName}}', '{{companyName}}'].map((tag) => (
                <code
                  key={tag}
                  className="cursor-pointer rounded bg-white px-2 py-1 font-mono text-xs text-gray-600 hover:bg-gray-100"
                  onClick={() => navigator.clipboard.writeText(tag)}
                >
                  {tag}
                </code>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'schedules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Configure when emails are sent and set up automated reminder sequences.
            </p>
            <button className="flex items-center gap-2 rounded-md bg-brand-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
              <Plus className="h-4 w-4" />
              Add Schedule
            </button>
          </div>

          {schedules.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">No Schedules Configured</h3>
              <p className="mb-6 text-gray-500">
                Set up email schedules to automate your survey distribution.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Timeline View */}
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 font-medium text-gray-900">Email Sequence Timeline</h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200" />
                  {schedules.map((schedule, index) => {
                    const template = getTemplateById(schedule.templateId);
                    return (
                      <div key={schedule.id} className="relative mb-6 ml-10 last:mb-0">
                        <div className={cn(
                          'absolute -left-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white',
                          schedule.status === 'sent' ? 'bg-green-500' : 'bg-gray-300'
                        )}>
                          {schedule.status === 'sent' ? (
                            <CheckCircle className="h-4 w-4 text-white" />
                          ) : (
                            <span className="text-xs font-bold text-white">{index + 1}</span>
                          )}
                        </div>
                        <div
                          className={cn(
                            'rounded-lg border p-4 transition-colors',
                            expandedSchedule === schedule.id ? 'border-brand-teal bg-brand-light/10' : 'border-gray-200 bg-white'
                          )}
                        >
                          <div
                            className="flex cursor-pointer items-center justify-between"
                            onClick={() => setExpandedSchedule(expandedSchedule === schedule.id ? null : schedule.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div>
                                <h4 className="font-medium text-gray-900">{template?.name || 'Unknown Template'}</h4>
                                <p className="text-sm text-gray-500">
                                  {schedule.type === 'immediate' && 'Send immediately when campaign starts'}
                                  {schedule.type === 'scheduled' && `Scheduled for ${new Date(schedule.scheduledDate!).toLocaleString()}`}
                                  {schedule.type === 'triggered' && schedule.triggerType === 'daysAfterInvite' && `${schedule.triggerValue} days after initial invite`}
                                  {schedule.type === 'triggered' && schedule.triggerType === 'nonResponders' && 'Send to non-responders only'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {getScheduleStatusBadge(schedule.status)}
                              {expandedSchedule === schedule.id ? (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                          
                          {expandedSchedule === schedule.id && (
                            <div className="mt-4 border-t border-gray-100 pt-4">
                              <div className="mb-4 grid grid-cols-4 gap-4 text-center text-sm">
                                <div>
                                  <p className="text-lg font-bold text-gray-900">{schedule.sentCount || 0}</p>
                                  <p className="text-xs text-gray-500">Sent</p>
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-gray-900">{schedule.deliveredCount || 0}</p>
                                  <p className="text-xs text-gray-500">Delivered</p>
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-gray-900">{schedule.openedCount || 0}</p>
                                  <p className="text-xs text-gray-500">Opened</p>
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-gray-900">{schedule.clickedCount || 0}</p>
                                  <p className="text-xs text-gray-500">Clicked</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {schedule.status === 'draft' && (
                                  <button className="flex items-center gap-1 rounded bg-brand-teal px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700">
                                    <Play className="h-3 w-3" />
                                    Activate
                                  </button>
                                )}
                                {schedule.status === 'scheduled' && (
                                  <button className="flex items-center gap-1 rounded bg-orange-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-600">
                                    <Pause className="h-3 w-3" />
                                    Pause
                                  </button>
                                )}
                                <button className="flex items-center gap-1 rounded border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                                  <Edit3 className="h-3 w-3" />
                                  Edit
                                </button>
                                <button className="flex items-center gap-1 rounded border border-gray-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">
                                  <Trash2 className="h-3 w-3" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Schedule Types Info */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-500" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Schedule Types</p>
                <ul className="mt-2 space-y-1">
                  <li><strong>Immediate:</strong> Sends as soon as the distribution is activated.</li>
                  <li><strong>Scheduled:</strong> Sends at a specific date and time.</li>
                  <li><strong>Triggered:</strong> Sends based on conditions (e.g., X days after invite, only to non-responders).</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
