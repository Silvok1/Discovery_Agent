'use client';

import { useState } from 'react';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { cn } from '@/lib/utils';
import { FileText, Shield, UserCircle, Heart, Library, Plus, GripVertical, Trash2 } from 'lucide-react';

type PageTab = 'consent' | 'welcome' | 'demographics' | 'thankYou';

interface DemographicsItem {
  id: string;
  name: string;
  type: string;
  source: 'library' | 'custom';
}

const EMBEDDED_FIELDS = [
  { id: 'firstName', label: 'First Name', placeholder: '{{First Name}}' },
  { id: 'lastName', label: 'Last Name', placeholder: '{{Last Name}}' },
  { id: 'email', label: 'Email', placeholder: '{{Email}}' },
  { id: 'employeeId', label: 'Employee ID', placeholder: '{{Employee ID}}' },
  { id: 'department', label: 'Department', placeholder: '{{Department}}' },
  { id: 'location', label: 'Location', placeholder: '{{Location}}' },
  { id: 'manager', label: 'Manager', placeholder: '{{Manager}}' },
];

// Mock demographics library items
const DEMOGRAPHICS_LIBRARY: DemographicsItem[] = [
  { id: 'demo-1', name: 'Gender', type: 'Multiple Choice', source: 'library' },
  { id: 'demo-2', name: 'Age Range', type: 'Multiple Choice', source: 'library' },
  { id: 'demo-3', name: 'Tenure', type: 'Multiple Choice', source: 'library' },
  { id: 'demo-4', name: 'Department', type: 'Multiple Choice', source: 'library' },
  { id: 'demo-5', name: 'Location', type: 'Multiple Choice', source: 'library' },
  { id: 'demo-6', name: 'Job Level', type: 'Multiple Choice', source: 'library' },
];

export function PagesTab() {
  const { present, dispatch } = useSurveyBuilder();
  const [activeTab, setActiveTab] = useState<PageTab>('welcome');
  const [selectedDemographics, setSelectedDemographics] = useState<DemographicsItem[]>([
    DEMOGRAPHICS_LIBRARY[0],
    DEMOGRAPHICS_LIBRARY[1],
    DEMOGRAPHICS_LIBRARY[2],
  ]);
  const [showLibrary, setShowLibrary] = useState(false);

  if (!present) return null;

  const tabs: { id: PageTab; label: string; icon: React.ElementType; enabled: boolean }[] = [
    { id: 'consent', label: 'Consent', icon: Shield, enabled: present.consentPage.enabled },
    { id: 'welcome', label: 'Welcome', icon: FileText, enabled: present.welcomePage.enabled },
    { id: 'demographics', label: 'Demographics', icon: UserCircle, enabled: true },
    { id: 'thankYou', label: 'Thank You', icon: Heart, enabled: present.thankYouPage.enabled },
  ];

  const handleTogglePage = (page: PageTab, enabled: boolean) => {
    switch (page) {
      case 'consent':
        dispatch({ type: 'UPDATE_CONSENT_PAGE', payload: { enabled } });
        break;
      case 'welcome':
        dispatch({ type: 'UPDATE_WELCOME_PAGE', payload: { enabled } });
        break;
      case 'thankYou':
        dispatch({ type: 'UPDATE_THANK_YOU_PAGE', payload: { enabled } });
        break;
    }
  };

  const addDemographicsItem = (item: DemographicsItem) => {
    if (!selectedDemographics.find((d) => d.id === item.id)) {
      setSelectedDemographics([...selectedDemographics, item]);
    }
    setShowLibrary(false);
  };

  const removeDemographicsItem = (itemId: string) => {
    setSelectedDemographics(selectedDemographics.filter((d) => d.id !== itemId));
  };

  return (
    <div className="flex h-[calc(100vh-180px)]">
      {/* Left Navigation */}
      <div className="w-56 border-r bg-gray-50">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Survey Pages</h3>
        </div>
        <nav className="space-y-1 px-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-brand-teal text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{tab.label}</span>
                {tab.id !== 'demographics' && (
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full',
                      tab.enabled ? 'bg-green-400' : 'bg-gray-300'
                    )}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl">
          {/* Consent Page */}
          {activeTab === 'consent' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-brand-dark">Consent Page</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Require respondents to acknowledge consent before starting the survey
                  </p>
                </div>
                <label className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Enable</span>
                  <button
                    onClick={() => handleTogglePage('consent', !present.consentPage.enabled)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      present.consentPage.enabled ? 'bg-brand-teal' : 'bg-gray-200'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        present.consentPage.enabled ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </label>
              </div>

              {present.consentPage.enabled && (
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Consent Statement
                    </label>
                    <RichTextEditor
                      content={present.consentPage.statement}
                      onChange={(content) =>
                        dispatch({ type: 'UPDATE_CONSENT_PAGE', payload: { statement: content } })
                      }
                      placeholder="Enter the consent statement that respondents must acknowledge..."
                      embeddedFields={EMBEDDED_FIELDS}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Welcome Page */}
          {activeTab === 'welcome' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-brand-dark">Welcome Page</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Introduction page shown at the start of the survey
                  </p>
                </div>
                <label className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Enable</span>
                  <button
                    onClick={() => handleTogglePage('welcome', !present.welcomePage.enabled)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      present.welcomePage.enabled ? 'bg-brand-teal' : 'bg-gray-200'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        present.welcomePage.enabled ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </label>
              </div>

              {present.welcomePage.enabled && (
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Page Title
                    </label>
                    <input
                      type="text"
                      value={present.welcomePage.title}
                      onChange={(e) =>
                        dispatch({ type: 'UPDATE_WELCOME_PAGE', payload: { title: e.target.value } })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                      placeholder="Welcome to our survey"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Page Content
                    </label>
                    <RichTextEditor
                      content={present.welcomePage.content}
                      onChange={(content) =>
                        dispatch({ type: 'UPDATE_WELCOME_PAGE', payload: { content } })
                      }
                      placeholder="Enter your welcome message..."
                      embeddedFields={EMBEDDED_FIELDS}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Demographics Page */}
          {activeTab === 'demographics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-brand-dark">Demographics</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Collect demographic information for analysis segmentation
                  </p>
                </div>
                <button
                  onClick={() => setShowLibrary(true)}
                  className="flex items-center gap-2 rounded-lg bg-brand-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                >
                  <Library className="h-4 w-4" />
                  Add from Library
                </button>
              </div>

              <div className="rounded-xl border bg-white shadow-sm">
                {selectedDemographics.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <UserCircle className="mb-3 h-12 w-12 text-gray-300" />
                    <p className="text-sm text-gray-500">No demographics added yet</p>
                    <button
                      onClick={() => setShowLibrary(true)}
                      className="mt-3 text-sm text-brand-teal hover:underline"
                    >
                      Add from Library
                    </button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {selectedDemographics.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                      >
                        <GripVertical className="h-4 w-4 cursor-grab text-gray-300" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.type}</p>
                        </div>
                        <span className="rounded bg-brand-light px-2 py-0.5 text-xs text-brand-teal">
                          {item.source === 'library' ? 'Library' : 'Custom'}
                        </span>
                        <button
                          onClick={() => removeDemographicsItem(item.id)}
                          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          title="Remove demographic item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Library Modal */}
              {showLibrary && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                  <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b px-6 py-4">
                      <h3 className="text-lg font-semibold">Demographics Library</h3>
                      <button
                        onClick={() => setShowLibrary(false)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100"
                        title="Close library"
                        aria-label="Close"
                      >
                        ×
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto p-4">
                      <div className="space-y-2">
                        {DEMOGRAPHICS_LIBRARY.map((item) => {
                          const isSelected = selectedDemographics.some((d) => d.id === item.id);
                          return (
                            <button
                              key={item.id}
                              onClick={() => !isSelected && addDemographicsItem(item)}
                              disabled={isSelected}
                              className={cn(
                                'flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors',
                                isSelected
                                  ? 'border-gray-200 bg-gray-50 opacity-50'
                                  : 'border-gray-200 hover:border-brand-teal hover:bg-brand-light/20'
                              )}
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-500">{item.type}</p>
                              </div>
                              {isSelected ? (
                                <span className="text-xs text-gray-400">Added</span>
                              ) : (
                                <Plus className="h-4 w-4 text-brand-teal" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Thank You Page */}
          {activeTab === 'thankYou' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-brand-dark">Thank You Page</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Confirmation page shown after survey completion
                  </p>
                </div>
                <label className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Enable</span>
                  <button
                    onClick={() => handleTogglePage('thankYou', !present.thankYouPage.enabled)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      present.thankYouPage.enabled ? 'bg-brand-teal' : 'bg-gray-200'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        present.thankYouPage.enabled ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </label>
              </div>

              {present.thankYouPage.enabled && (
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Page Title
                    </label>
                    <input
                      type="text"
                      value={present.thankYouPage.title}
                      onChange={(e) =>
                        dispatch({ type: 'UPDATE_THANK_YOU_PAGE', payload: { title: e.target.value } })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                      placeholder="Thank you!"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Page Content
                    </label>
                    <RichTextEditor
                      content={present.thankYouPage.content}
                      onChange={(content) =>
                        dispatch({ type: 'UPDATE_THANK_YOU_PAGE', payload: { content } })
                      }
                      placeholder="Enter your thank you message..."
                      embeddedFields={EMBEDDED_FIELDS}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Redirect URL <span className="text-gray-400">(optional)</span>
                      </label>
                      <input
                        type="url"
                        value={present.thankYouPage.redirectUrl || ''}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_THANK_YOU_PAGE',
                            payload: { redirectUrl: e.target.value || undefined },
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Redirect Delay <span className="text-gray-400">(seconds)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={present.thankYouPage.redirectDelay || 0}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_THANK_YOU_PAGE',
                            payload: { redirectDelay: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                        placeholder="5"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
