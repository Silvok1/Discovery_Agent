'use client';

import { useState } from 'react';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import { cn } from '@/lib/utils';
import { Shield, BookOpen, Plus, Trash2, Edit2, Check, X, Layout, Shuffle, Tags, AlertTriangle, Download } from 'lucide-react';
import type { DimensionDefinition } from '@/api/contracts';

// Preset colors for dimensions
const DIMENSION_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
];

// Dimension preset templates for common use cases
const DIMENSION_PRESETS: Record<string, DimensionDefinition[]> = {
  'Customer Experience': [
    { id: 'cx-communication', name: 'Communication', color: '#3B82F6', description: 'Quality and clarity of communication' },
    { id: 'cx-service', name: 'Service Quality', color: '#10B981', description: 'Overall service delivery and support' },
    { id: 'cx-timeliness', name: 'Timeliness', color: '#F59E0B', description: 'Speed and responsiveness' },
    { id: 'cx-professionalism', name: 'Professionalism', color: '#8B5CF6', description: 'Professional conduct and expertise' },
  ],
  'Employee Experience': [
    { id: 'ex-leadership', name: 'Leadership', color: '#3B82F6', description: 'Leadership effectiveness and vision' },
    { id: 'ex-career', name: 'Career Development', color: '#10B981', description: 'Growth and advancement opportunities' },
    { id: 'ex-environment', name: 'Work Environment', color: '#F97316', description: 'Physical and cultural workplace' },
    { id: 'ex-recognition', name: 'Recognition', color: '#EC4899', description: 'Appreciation and rewards' },
    { id: 'ex-balance', name: 'Work-Life Balance', color: '#06B6D4', description: 'Flexibility and workload management' },
  ],
  '360 Assessment': [
    { id: '360-strategic', name: 'Strategic Thinking', color: '#3B82F6', description: 'Vision and long-term planning' },
    { id: '360-collaboration', name: 'Team Collaboration', color: '#10B981', description: 'Working effectively with others' },
    { id: '360-communication', name: 'Communication Skills', color: '#8B5CF6', description: 'Clarity and effectiveness in communication' },
    { id: '360-problem', name: 'Problem Solving', color: '#F59E0B', description: 'Analytical and solution-oriented thinking' },
    { id: '360-innovation', name: 'Innovation', color: '#EC4899', description: 'Creative and forward-thinking approach' },
  ],
};

export function SettingsTab() {
  const { present, dispatch } = useSurveyBuilder();
  const [newKeyword, setNewKeyword] = useState({ term: '', definition: '' });
  const [editingKeyword, setEditingKeyword] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState({ term: '', definition: '' });
  
  // Dimension management state
  const [newDimension, setNewDimension] = useState({ name: '', description: '' });
  const [editingDimension, setEditingDimension] = useState<string | null>(null);
  const [editingDimensionValues, setEditingDimensionValues] = useState<DimensionDefinition>({ id: '', name: '', color: '', description: '' });
  const [showPresetModal, setShowPresetModal] = useState(false);

  if (!present) return null;

  const handleAddKeyword = () => {
    if (!newKeyword.term.trim() || !newKeyword.definition.trim()) return;
    
    const updatedKeywords = [...(present.settings.keywords || []), newKeyword];
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { keywords: updatedKeywords },
    });
    setNewKeyword({ term: '', definition: '' });
  };

  const handleDeleteKeyword = (term: string) => {
    const updatedKeywords = (present.settings.keywords || []).filter(k => k.term !== term);
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { keywords: updatedKeywords },
    });
  };

  const handleEditKeyword = (term: string) => {
    const keyword = (present.settings.keywords || []).find(k => k.term === term);
    if (keyword) {
      setEditingKeyword(term);
      setEditingValues({ term: keyword.term, definition: keyword.definition });
    }
  };

  const handleSaveEdit = () => {
    if (!editingKeyword || !editingValues.term.trim() || !editingValues.definition.trim()) return;
    
    const updatedKeywords = (present.settings.keywords || []).map(k => 
      k.term === editingKeyword ? editingValues : k
    );
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { keywords: updatedKeywords },
    });
    setEditingKeyword(null);
    setEditingValues({ term: '', definition: '' });
  };

  const handleCancelEdit = () => {
    setEditingKeyword(null);
    setEditingValues({ term: '', definition: '' });
  };

  // Dimension handlers
  const handleAddDimension = () => {
    if (!newDimension.name.trim()) return;
    
    const existingDimensions = present.dimensionDefinitions || [];
    const usedColors = new Set(existingDimensions.map(d => d.color));
    // Find first unused color, or cycle through palette if all used
    const availableColor = DIMENSION_COLORS.find(c => !usedColors.has(c)) || DIMENSION_COLORS[existingDimensions.length % DIMENSION_COLORS.length];
    
    const newDim: DimensionDefinition = {
      id: `dim_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
      name: newDimension.name.trim(),
      color: availableColor,
      description: newDimension.description.trim() || undefined,
    };
    
    dispatch({
      type: 'UPDATE_SURVEY',
      payload: { dimensionDefinitions: [...existingDimensions, newDim] },
    });
    setNewDimension({ name: '', description: '' });
  };

  const handleDeleteDimension = (id: string) => {
    const updatedDimensions = (present.dimensionDefinitions || []).filter(d => d.id !== id);
    dispatch({
      type: 'UPDATE_SURVEY',
      payload: { dimensionDefinitions: updatedDimensions },
    });
  };

  const handleEditDimension = (id: string) => {
    const dimension = (present.dimensionDefinitions || []).find(d => d.id === id);
    if (dimension) {
      setEditingDimension(id);
      setEditingDimensionValues({ ...dimension });
    }
  };

  const handleSaveDimensionEdit = () => {
    if (!editingDimension || !editingDimensionValues.name.trim()) return;
    
    const updatedDimensions = (present.dimensionDefinitions || []).map(d =>
      d.id === editingDimension ? editingDimensionValues : d
    );
    dispatch({
      type: 'UPDATE_SURVEY',
      payload: { dimensionDefinitions: updatedDimensions },
    });
    setEditingDimension(null);
    setEditingDimensionValues({ id: '', name: '', color: '', description: '' });
  };

  const handleCancelDimensionEdit = () => {
    setEditingDimension(null);
    setEditingDimensionValues({ id: '', name: '', color: '', description: '' });
  };

  const handleImportPreset = (presetName: string) => {
    const presetDimensions = DIMENSION_PRESETS[presetName];
    if (!presetDimensions || !Array.isArray(presetDimensions) || presetDimensions.length === 0) {
      console.error(`Invalid or empty preset: ${presetName}`);
      return;
    }

    const existingDimensions = present.dimensionDefinitions || [];
    const timestamp = Date.now();
    const newDimensions = presetDimensions.map((preset, index) => ({
      ...preset,
      id: `dim_${timestamp}_${index}_${crypto.randomUUID().slice(0, 8)}`,
    }));

    dispatch({
      type: 'UPDATE_SURVEY',
      payload: { dimensionDefinitions: [...existingDimensions, ...newDimensions] },
    });
    setShowPresetModal(false);
  };

  // Check for randomization conflicts
  const hasItemsPerPage = !!present.settings.itemsPerPage && present.settings.itemsPerPage > 0;
  const hasGlobalRandomization = present.settings.globalRandomizeQuestions || present.settings.globalRandomizeOptions;
  const hasRandomizationConflict = hasItemsPerPage && hasGlobalRandomization;

  return (
    <>
      <div className="h-[calc(100vh-180px)] overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-6 p-6">
        {/* Report Settings Section */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b px-6 py-4">
            <Layout className="h-5 w-5 text-brand-teal" />
            <h3 className="text-lg font-semibold text-brand-dark">Presentation</h3>
          </div>
          <div className="space-y-6 p-6">
            {/* Items Per Page */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Questions Per Page
              </label>
              <p className="mb-2 text-xs text-gray-500">
                Automatically split questions into pages. Leave empty to show all questions in a block on one page.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  value={present.settings.itemsPerPage || ''}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_SETTINGS',
                      payload: { itemsPerPage: parseInt(e.target.value) || undefined },
                    })
                  }
                  className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                  placeholder="All"
                />
                <span className="text-sm text-gray-500">questions per page</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dimensions Management Section - MOVED UP BEFORE RANDOMIZATION */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <Tags className="h-5 w-5 text-brand-teal" />
              <div>
                <h3 className="text-lg font-semibold text-brand-dark">Dimensions</h3>
                <p className="text-xs text-gray-500">Define categories to group and filter questions</p>
              </div>
            </div>
            <button
              onClick={() => setShowPresetModal(true)}
              className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              title="Import dimension presets"
            >
              <Download className="h-4 w-4" />
              Import Presets
            </button>
          </div>
          <div className="p-6">
            {/* Existing Dimensions */}
            {(present.dimensionDefinitions || []).length > 0 && (
              <div className="mb-4 space-y-2">
                {(present.dimensionDefinitions || []).map((dimension) => (
                  <div
                    key={dimension.id}
                    className="group flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
                  >
                    {editingDimension === dimension.id ? (
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingDimensionValues.name}
                            onChange={(e) => setEditingDimensionValues({ ...editingDimensionValues, name: e.target.value })}
                            placeholder="Dimension name"
                            className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-brand-teal focus:outline-none"
                          />
                          <div className="flex items-center gap-1">
                            {DIMENSION_COLORS.map((color) => (
                              <button
                                key={color}
                                onClick={() => setEditingDimensionValues({ ...editingDimensionValues, color })}
                                className={cn(
                                  'h-6 w-6 rounded-full border-2 transition-transform hover:scale-110',
                                  editingDimensionValues.color === color ? 'border-gray-800' : 'border-transparent'
                                )}
                                style={{ backgroundColor: color }}
                                title={`Select color ${color}`}
                              />
                            ))}
                          </div>
                        </div>
                        <input
                          type="text"
                          value={editingDimensionValues.description || ''}
                          onChange={(e) => setEditingDimensionValues({ ...editingDimensionValues, description: e.target.value })}
                          placeholder="Description (optional)"
                          className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-brand-teal focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveDimensionEdit}
                            className="flex items-center gap-1 rounded-md bg-brand-teal px-2 py-1 text-xs text-white hover:bg-teal-700"
                            title="Save changes"
                          >
                            <Check className="h-3 w-3" />
                            Save
                          </button>
                          <button
                            onClick={handleCancelDimensionEdit}
                            className="flex items-center gap-1 rounded-md bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300"
                            title="Cancel editing"
                          >
                            <X className="h-3 w-3" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          className="mt-1 h-4 w-4 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: dimension.color }}
                        />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{dimension.name}</span>
                          {dimension.description && (
                            <p className="mt-0.5 text-sm text-gray-600">{dimension.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => handleEditDimension(dimension.id)}
                            className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                            title="Edit dimension"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDimension(dimension.id)}
                            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            title="Delete dimension"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add New Dimension Form */}
            <div className="space-y-3 rounded-lg border border-dashed border-gray-300 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Plus className="h-4 w-4" />
                Add New Dimension
              </div>
              <div className="grid gap-3">
                <input
                  type="text"
                  value={newDimension.name}
                  onChange={(e) => setNewDimension({ ...newDimension, name: e.target.value })}
                  placeholder="Dimension name (e.g., 'Communication', 'Leadership')"
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                />
                <input
                  type="text"
                  value={newDimension.description}
                  onChange={(e) => setNewDimension({ ...newDimension, description: e.target.value })}
                  placeholder="Description (optional)"
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                />
              </div>
              <button
                onClick={handleAddDimension}
                disabled={!newDimension.name.trim()}
                className="rounded-md bg-brand-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add Dimension
              </button>
            </div>

            {/* Empty state */}
            {(present.dimensionDefinitions || []).length === 0 && (
              <p className="mt-3 text-center text-sm text-gray-500">
                No dimensions defined. Dimensions let you group questions by category for reports and analysis.
              </p>
            )}
          </div>
        </div>

        {/* Global Randomization Section */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b px-6 py-4">
            <Shuffle className="h-5 w-5 text-brand-teal" />
            <h3 className="text-lg font-semibold text-brand-dark">Randomization</h3>
          </div>
          <div className="space-y-4 p-6">
            {/* Warning for itemsPerPage conflict */}
            {hasRandomizationConflict && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Page Break Conflict</p>
                  <p className="mt-1 text-xs text-amber-700">
                    You have &quot;Questions Per Page&quot; set to {present.settings.itemsPerPage}. When randomization is enabled,
                    questions will be auto-reordered before applying page breaks. This may result in different
                    page groupings for each respondent.
                  </p>
                </div>
              </div>
            )}

            {/* Randomize Question Order */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Randomize Question Order
                </label>
                <p className="text-xs text-gray-500">
                  Present questions in random order within each block
                </p>
              </div>
              <button
                onClick={() =>
                  dispatch({
                    type: 'UPDATE_SETTINGS',
                    payload: { globalRandomizeQuestions: !present.settings.globalRandomizeQuestions },
                  })
                }
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  present.settings.globalRandomizeQuestions ? 'bg-brand-teal' : 'bg-gray-300'
                )}
                title={present.settings.globalRandomizeQuestions ? 'Randomization enabled (click to disable)' : 'Randomization disabled (click to enable)'}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
                    present.settings.globalRandomizeQuestions ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            {/* Randomize Answer Options */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Randomize Answer Options
                </label>
                <p className="text-xs text-gray-500">
                  Present answer choices in random order for all questions
                </p>
              </div>
              <button
                onClick={() =>
                  dispatch({
                    type: 'UPDATE_SETTINGS',
                    payload: { globalRandomizeOptions: !present.settings.globalRandomizeOptions },
                  })
                }
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  present.settings.globalRandomizeOptions ? 'bg-brand-teal' : 'bg-gray-300'
                )}
                title={present.settings.globalRandomizeOptions ? 'Randomization enabled (click to disable)' : 'Randomization disabled (click to enable)'}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
                    present.settings.globalRandomizeOptions ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Note: Individual blocks and questions can override these global settings with their own randomization rules.
            </p>
          </div>
        </div>

        {/* Privacy & Anonymity Section */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b px-6 py-4">
            <Shield className="h-5 w-5 text-brand-teal" />
            <h3 className="text-lg font-semibold text-brand-dark">Privacy & Anonymity</h3>
          </div>
          <div className="space-y-6 p-6">
            {/* Anonymity Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Anonymity Threshold
              </label>
              <p className="mb-2 text-xs text-gray-500">
                Minimum number of responses required before showing results in reports.
                This protects respondent anonymity in small groups.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={present.settings.anonymityThreshold}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_SETTINGS',
                      payload: { anonymityThreshold: parseInt(e.target.value) || 5 },
                    })
                  }
                  className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                  placeholder="5"
                  aria-label="Anonymity threshold"
                />
                <span className="text-sm text-gray-500">responses minimum</span>
              </div>
            </div>

            {/* Consent Required Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Require Consent Acknowledgment
                </label>
                <p className="text-xs text-gray-500">
                  Participants must agree to the consent statement before starting
                </p>
              </div>
              <button
                onClick={() =>
                  dispatch({
                    type: 'UPDATE_SETTINGS',
                    payload: { consentRequired: !present.settings.consentRequired },
                  })
                }
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  present.settings.consentRequired ? 'bg-brand-teal' : 'bg-gray-300'
                )}
                title={present.settings.consentRequired ? 'Consent required (click to disable)' : 'Consent not required (click to enable)'}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
                    present.settings.consentRequired ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Keyword Glossary Section */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-brand-teal" />
              <div>
                <h3 className="text-lg font-semibold text-brand-dark">Keyword Glossary</h3>
                <p className="text-xs text-gray-500">Define terms that will show tooltips in the survey</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {/* Existing Keywords */}
            {(present.settings.keywords || []).length > 0 && (
              <div className="mb-4 space-y-2">
                {(present.settings.keywords || []).map((keyword) => (
                  <div
                    key={keyword.term}
                    className="group flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
                  >
                    {editingKeyword === keyword.term ? (
                      <div className="flex flex-1 flex-col gap-2">
                        <input
                          type="text"
                          value={editingValues.term}
                          onChange={(e) => setEditingValues({ ...editingValues, term: e.target.value })}
                          placeholder="Term"
                          className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-brand-teal focus:outline-none"
                        />
                        <textarea
                          value={editingValues.definition}
                          onChange={(e) => setEditingValues({ ...editingValues, definition: e.target.value })}
                          placeholder="Definition"
                          rows={2}
                          className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-brand-teal focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="flex items-center gap-1 rounded-md bg-brand-teal px-2 py-1 text-xs text-white hover:bg-teal-700"
                            title="Save changes"
                          >
                            <Check className="h-3 w-3" />
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center gap-1 rounded-md bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300"
                            title="Cancel editing"
                          >
                            <X className="h-3 w-3" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{keyword.term}</span>
                          <p className="mt-0.5 text-sm text-gray-600">{keyword.definition}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => handleEditKeyword(keyword.term)}
                            className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                            title="Edit keyword"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteKeyword(keyword.term)}
                            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            title="Delete keyword"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add New Keyword Form */}
            <div className="space-y-3 rounded-lg border border-dashed border-gray-300 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Plus className="h-4 w-4" />
                Add New Keyword
              </div>
              <div className="grid grid-cols-[1fr,2fr] gap-3">
                <input
                  type="text"
                  value={newKeyword.term}
                  onChange={(e) => setNewKeyword({ ...newKeyword, term: e.target.value })}
                  placeholder="Term (e.g., 'NPS')"
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                />
                <input
                  type="text"
                  value={newKeyword.definition}
                  onChange={(e) => setNewKeyword({ ...newKeyword, definition: e.target.value })}
                  placeholder="Definition (e.g., 'Net Promoter Score - a measure of customer loyalty')"
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                />
              </div>
              <button
                onClick={handleAddKeyword}
                disabled={!newKeyword.term.trim() || !newKeyword.definition.trim()}
                className="rounded-md bg-brand-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add Keyword
              </button>
            </div>

            {/* Empty state */}
            {(present.settings.keywords || []).length === 0 && (
              <p className="mt-3 text-center text-sm text-gray-500">
                No keywords defined yet. Keywords will appear as tooltips when used in survey questions.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Dimension Presets Import Modal */}
    {showPresetModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowPresetModal(false)}>
        <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h3 className="text-lg font-semibold text-brand-dark">Import Dimension Presets</h3>
            <button
              onClick={() => setShowPresetModal(false)}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">
            <p className="mb-4 text-sm text-gray-600">
              Select a preset template to quickly add common dimension sets for your survey type.
            </p>
            <div className="space-y-3">
              {Object.entries(DIMENSION_PRESETS).map(([name, dimensions]) => (
                <button
                  key={name}
                  onClick={() => handleImportPreset(name)}
                  className="w-full rounded-lg border border-gray-200 bg-white p-4 text-left hover:border-brand-teal hover:shadow-md transition-all"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-semibold text-brand-dark">{name}</h4>
                    <span className="text-xs text-gray-500">{dimensions.length} dimensions</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dimensions.map((dim) => (
                      <span
                        key={dim.id}
                        className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: dim.color }}
                        />
                        {dim.name}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t bg-gray-50 px-6 py-4">
            <button
              onClick={() => setShowPresetModal(false)}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}