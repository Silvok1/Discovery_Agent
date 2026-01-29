'use client';

import { useState } from 'react';
import { X, Settings, Trash2, AlertCircle, Plus, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import {
  getOperatorsForQuestion,
  getOperatorsForEmbeddedData,
  getQuestionChoices,
  questionHasChoices,
  getQuestionDisplayLabel,
  operatorRequiresValue,
  getConditionSummary,
  validateCondition,
  DEFAULT_EMBEDDED_FIELDS,
  type LogicWarning,
} from '@/lib/logicHelpers';
import type { Question, MultipleChoiceQuestion, TextEntryQuestion, MatrixTableQuestion, ConstantSumQuestion, FormFieldQuestion, HeatMapQuestion, TextGraphicQuestion, SliderQuestion, HotSpotQuestion, RankOrderQuestion, PickGroupRankQuestion, SideBySideQuestion, NetPromoterQuestion, ReputationIndexPreset, DisplayLogicCondition, DisplayLogicOperator, EmbeddedDataField } from '@/api/contracts';

interface BuilderRightPanelProps {
  selectedQuestion: Question | null;
  allQuestions?: Question[];
  onUpdateQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
  onClose: () => void;
}

export function BuilderRightPanel({
  selectedQuestion,
  allQuestions = [],
  onUpdateQuestion,
  onDeleteQuestion,
  onClose,
}: BuilderRightPanelProps) {
  // Get questions that come before the selected question (for display logic)
  const previousQuestions = allQuestions.filter((q) => {
    const selectedIndex = allQuestions.findIndex((aq) => aq.id === selectedQuestion?.id);
    const qIndex = allQuestions.findIndex((aq) => aq.id === q.id);
    return qIndex < selectedIndex;
  });

  if (!selectedQuestion) {
    return (
      <div className="flex h-full w-80 flex-col border-l bg-gray-50">
        <div className="flex items-center justify-between border-b bg-white px-4 py-3">
          <h3 className="font-semibold text-brand-dark">Settings</h3>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <Settings className="mb-3 h-12 w-12 text-gray-300" />
          <p className="text-sm text-gray-500">
            Select a question to view and edit its settings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-80 flex-col border-l bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold text-brand-dark">Question Settings</h3>
        <button onClick={onClose} className="rounded p-1 hover:bg-gray-100" title="Close">
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <QuestionSettingsSection
          question={selectedQuestion}
          onUpdate={onUpdateQuestion}
        />

        {selectedQuestion.type !== 'PageBreak' && (
          <>
            <hr className="border-gray-200" />

            <CollapsibleSection title="Requirements & Validation" defaultOpen={true}>
              <RequirementsAndValidationSection
                question={selectedQuestion}
                onUpdate={onUpdateQuestion}
              />
            </CollapsibleSection>
          </>
        )}

        <hr className="border-gray-200" />

        <CollapsibleSection title="Display Logic" defaultOpen={!!selectedQuestion.displayLogic?.enabled}>
          <DisplayLogicSection
            question={selectedQuestion}
            previousQuestions={previousQuestions}
            onUpdate={onUpdateQuestion}
          />
        </CollapsibleSection>

        {selectedQuestion.type !== 'PageBreak' && (
          <>
            <hr className="border-gray-200" />

            <CollapsibleSection title="Dimensions" defaultOpen={false}>
              <DimensionsSection
                question={selectedQuestion}
                onUpdate={onUpdateQuestion}
              />
            </CollapsibleSection>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t p-4">
        <button
          onClick={() => onDeleteQuestion(selectedQuestion.id)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete Question
        </button>
      </div>
    </div>
  );
}

function CollapsibleSection({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-2 text-left text-sm font-medium text-gray-900 hover:text-brand-teal"
      >
        {title}
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  );
}

// Settings Section Component
function QuestionSettingsSection({
  question,
  onUpdate,
}: {
  question: Question;
  onUpdate: (q: Question) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Question Type Specific Settings */}
      {question.type === 'MultipleChoice' && (
        <MultipleChoiceSettings
          question={question as MultipleChoiceQuestion}
          onUpdate={onUpdate}
        />
      )}
      {question.type === 'TextEntry' && (
        <TextEntrySettings
          question={question as TextEntryQuestion}
          onUpdate={onUpdate}
        />
      )}
      {question.type === 'MatrixTable' && (
        <MatrixTableSettings
          question={question as MatrixTableQuestion}
          onUpdate={onUpdate}
        />
      )}
      {question.type === 'ConstantSum' && (
        <ConstantSumSettings
          question={question as ConstantSumQuestion}
          onUpdate={onUpdate}
        />
      )}
      {question.type === 'FormField' && (
        <FormFieldSettings
          question={question as FormFieldQuestion}
          onUpdate={onUpdate}
        />
      )}
      {question.type === 'Heatmap' && (
        <HeatMapSettings
          question={question as HeatMapQuestion}
          onUpdate={onUpdate}
        />
      )}
      {question.type === 'TextGraphic' && (
        <TextGraphicSettings
          question={question as TextGraphicQuestion}
          onUpdate={onUpdate}
        />
      )}
      {question.type === 'Slider' && (
        <SliderSettings
          question={question as SliderQuestion}
          onUpdate={onUpdate}
        />
      )}
      {question.type === 'HotSpot' && (
        <HotSpotSettings
          question={question as HotSpotQuestion}
          onUpdate={onUpdate}
        />
      )}
      {question.type === 'RankOrder' && (
        <RankOrderSettings
          question={question as RankOrderQuestion}
          onUpdate={onUpdate}
        />
      )}
      {question.type === 'PickGroupRank' && (
        <PickGroupRankSettings
          question={question as PickGroupRankQuestion}
          onUpdate={onUpdate}
        />
      )}
      {question.type === 'SideBySide' && (
        <SideBySideSettings
          question={question as SideBySideQuestion}
          onUpdate={onUpdate}
        />
      )}
      {question.type === 'NetPromoter' && (
        <ReputationIndexSettings
          question={question as NetPromoterQuestion}
          onUpdate={onUpdate}
        />
      )}
      {question.type === 'PageBreak' && (
        <PageBreakSettings
          question={question}
          onUpdate={onUpdate}
        />
      )}

      {/* Randomize Toggle */}
      {question.type !== 'PageBreak' && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Randomize Options</label>
          <button
            onClick={() => onUpdate({ ...question, randomize: !question.randomize })}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              question.randomize ? 'bg-brand-teal' : 'bg-gray-200'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                question.randomize ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>
      )}
    </div>
  );
}

// Page Break Settings
function PageBreakSettings({
  question,
  onUpdate,
}: {
  question: Question;
  onUpdate: (q: Question) => void;
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
      <p>
        Page breaks divide your survey into multiple pages. Respondents will see a "Next" button to proceed.
      </p>
      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-medium text-gray-700">Label (Internal Use)</label>
        <input
          type="text"
          value={question.text}
          onChange={(e) => onUpdate({ ...question, text: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
        />
      </div>
    </div>
  );
}

// Multiple Choice Settings
function MultipleChoiceSettings({
  question,
  onUpdate,
}: {
  question: MultipleChoiceQuestion;
  onUpdate: (q: Question) => void;
}) {
  return (
    <>
      {/* Selection Type */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Selection Type</label>
        <div className="flex gap-2">
          <button
            onClick={() => onUpdate({ ...question, allowMultiple: false })}
            className={cn(
              'flex-1 rounded-lg border px-3 py-2 text-sm transition-colors',
              !question.allowMultiple
                ? 'border-brand-teal bg-brand-light text-brand-teal'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            )}
          >
            Single Select
          </button>
          <button
            onClick={() => onUpdate({ ...question, allowMultiple: true })}
            className={cn(
              'flex-1 rounded-lg border px-3 py-2 text-sm transition-colors',
              question.allowMultiple
                ? 'border-brand-teal bg-brand-light text-brand-teal'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            )}
          >
            Multi Select
          </button>
        </div>
      </div>

      {/* Display Format */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Display Format</label>
        <select
          value={question.displayFormat}
          onChange={(e) =>
            onUpdate({ ...question, displayFormat: e.target.value as MultipleChoiceQuestion['displayFormat'] })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
        >
          <option value="vertical">Vertical List</option>
          <option value="horizontal">Horizontal</option>
          <option value="dropdown">Dropdown</option>
          <option value="columns">Multiple Columns</option>
        </select>
      </div>

      {/* Column Count (Only if columns selected) */}
      {question.displayFormat === 'columns' && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Number of Columns</label>
          <input
            type="number"
            min="1"
            max="10"
            value={question.columnCount || 2}
            onChange={(e) => onUpdate({ ...question, columnCount: parseInt(e.target.value) || 2 })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          />
        </div>
      )}
    </>
  );
}

// Text Entry Settings
function TextEntrySettings({
  question,
  onUpdate,
}: {
  question: TextEntryQuestion;
  onUpdate: (q: Question) => void;
}) {
  return (
    <>
      {/* Input Format */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Input Format</label>
        <select
          value={question.format}
          onChange={(e) =>
            onUpdate({ ...question, format: e.target.value as TextEntryQuestion['format'] })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
        >
          <option value="singleLine">Single Line</option>
          <option value="multiLine">Multi Line</option>
          <option value="essay">Essay</option>
          <option value="password">Password</option>
        </select>
      </div>

      {/* Content Type */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Content Validation</label>
        <select
          value={question.contentType || ''}
          onChange={(e) =>
            onUpdate({
              ...question,
              contentType: e.target.value as TextEntryQuestion['contentType'] || undefined,
            })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
        >
          <option value="">None</option>
          <option value="email">Email Address</option>
          <option value="phone">Phone Number</option>
          <option value="date">Date</option>
          <option value="number">Number Only</option>
          <option value="postalCode">Postal Code</option>
          <option value="url">URL</option>
        </select>
      </div>
    </>
  );
}

// Matrix Table Settings
function MatrixTableSettings({
  question,
  onUpdate,
}: {
  question: MatrixTableQuestion;
  onUpdate: (q: Question) => void;
}) {
  const [editingGroup, setEditingGroup] = useState<string | null>(null);

  const addGroup = () => {
    const newGroup = { id: `group-${crypto.randomUUID()}`, name: `Group ${(question.groups || []).length + 1}` };
    onUpdate({ ...question, groups: [...(question.groups || []), newGroup] });
  };

  const updateGroup = (groupId: string, name: string) => {
    const groups = (question.groups || []).map(g => g.id === groupId ? { ...g, name } : g);
    onUpdate({ ...question, groups });
  };

  const deleteGroup = (groupId: string) => {
    const groups = (question.groups || []).filter(g => g.id !== groupId);
    const rows = question.rows.map(r => r.groupId === groupId ? { ...r, groupId: undefined } : r);
    onUpdate({ ...question, groups, rows });
    setEditingGroup(null);
  };

  return (
    <>
      {/* Matrix Variation */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Matrix Type</label>
        <select
          value={question.variation}
          onChange={(e) =>
            onUpdate({ ...question, variation: e.target.value as MatrixTableQuestion['variation'] })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
        >
          <option value="likert">Likert Scale</option>
          <option value="bipolar">Bipolar Scale</option>
          <option value="constantSum">Constant Sum</option>
          <option value="textEntry">Text Entry</option>
          <option value="rankOrder">Rank Order</option>
          <option value="profile">Profile</option>
          <option value="maxDiff">MaxDiff</option>
        </select>
      </div>

      {/* Allow Multiple (for applicable variations) */}
      {(question.variation === 'likert' || question.variation === 'textEntry') && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Allow Multiple per Row</label>
          <button
            onClick={() => onUpdate({ ...question, allowMultiple: !question.allowMultiple })}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              question.allowMultiple ? 'bg-brand-teal' : 'bg-gray-200'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                question.allowMultiple ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>
      )}

      {/* Bipolar Labels */}
      {question.variation === 'bipolar' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Min Label</label>
            <input
              type="text"
              value={question.minLabel || ''}
              onChange={(e) => onUpdate({ ...question, minLabel: e.target.value })}
              placeholder="Too Low"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Max Label</label>
            <input
              type="text"
              value={question.maxLabel || ''}
              onChange={(e) => onUpdate({ ...question, maxLabel: e.target.value })}
              placeholder="Too High"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
            />
          </div>
        </div>
      )}

      {/* MaxDiff Note */}
      {question.variation === 'maxDiff' && (
        <div className="rounded-lg bg-yellow-50 p-3 text-xs text-yellow-800">
          <strong>MaxDiff:</strong> Should have exactly 2 columns: "Most" and "Least". Respondents select one of each per row.
        </div>
      )}

      {/* Display Options */}
      <div className="space-y-2 pt-2 border-t border-gray-200">
        <p className="text-xs font-medium text-gray-700 uppercase tracking-wider">Display Options</p>
        
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-700">Transpose Table</label>
          <button
            onClick={() => onUpdate({ ...question, transpose: !question.transpose })}
            className={cn(
              'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
              question.transpose ? 'bg-brand-teal' : 'bg-gray-300'
            )}
          >
            <span
              className={cn(
                'inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform',
                question.transpose ? 'translate-x-5' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-700">Position Text Above</label>
          <button
            onClick={() => onUpdate({ ...question, positionTextAbove: !question.positionTextAbove })}
            className={cn(
              'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
              question.positionTextAbove ? 'bg-brand-teal' : 'bg-gray-300'
            )}
          >
            <span
              className={cn(
                'inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform',
                question.positionTextAbove ? 'translate-x-5' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-700">Add Whitespace</label>
          <button
            onClick={() => onUpdate({ ...question, addWhitespace: !question.addWhitespace })}
            className={cn(
              'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
              question.addWhitespace ? 'bg-brand-teal' : 'bg-gray-300'
            )}
          >
            <span
              className={cn(
                'inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform',
                question.addWhitespace ? 'translate-x-5' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-700">Mobile Friendly</label>
          <button
            onClick={() => onUpdate({ ...question, mobileFriendly: !question.mobileFriendly })}
            className={cn(
              'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
              question.mobileFriendly ? 'bg-brand-teal' : 'bg-gray-300'
            )}
          >
            <span
              className={cn(
                'inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform',
                question.mobileFriendly ? 'translate-x-5' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-700">Table Width</label>
          <select
            value={question.tableWidth || 'auto'}
            onChange={(e) => onUpdate({ ...question, tableWidth: e.target.value as MatrixTableQuestion['tableWidth'] })}
            className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          >
            <option value="auto">Auto (fit content)</option>
            <option value="narrow">Narrow (512px)</option>
            <option value="medium">Medium (768px)</option>
            <option value="wide">Wide (1024px)</option>
            <option value="full">Full Width</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-700">Repeat Headers Every N Rows</label>
          <input
            type="number"
            min="0"
            value={question.repeatHeaders || ''}
            onChange={(e) => onUpdate({ ...question, repeatHeaders: parseInt(e.target.value) || undefined })}
            placeholder="0 = disabled"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          />
          <p className="mt-1 text-xs text-gray-500">Set to 0 or leave blank to disable</p>
        </div>
      </div>

      {/* Statement Groups */}
      <div className="pt-2 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-gray-700 uppercase tracking-wider">Statement Groups</p>
          <button
            onClick={addGroup}
            className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:border-brand-teal hover:text-brand-teal"
          >
            + Add Group
          </button>
        </div>
        
        {(question.groups || []).length > 0 ? (
          <div className="space-y-2">
            {question.groups!.map(group => (
              <div key={group.id} className="rounded-lg border border-gray-200 p-2">
                {editingGroup === group.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={group.name}
                      onChange={(e) => updateGroup(group.id, e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                      placeholder="Group name"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingGroup(null)}
                        className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                      >
                        Done
                      </button>
                      <button
                        onClick={() => deleteGroup(group.id)}
                        className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{group.name}</span>
                    <button
                      onClick={() => setEditingGroup(group.id)}
                      className="text-xs text-brand-teal hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No groups defined. Groups help organize long matrices.</p>
        )}
      </div>
    </>
  );
}

// Constant Sum Settings
function ConstantSumSettings({
  question,
  onUpdate,
}: {
  question: ConstantSumQuestion;
  onUpdate: (q: Question) => void;
}) {
  return (
    <>
      {/* Display Format */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Display Format</label>
        <select
          value={question.displayFormat}
          onChange={(e) =>
            onUpdate({ ...question, displayFormat: e.target.value as ConstantSumQuestion['displayFormat'] })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
        >
          <option value="textBoxes">Text Boxes</option>
          <option value="bars">Bars</option>
          <option value="sliders">Sliders</option>
        </select>
      </div>

      {/* Must Total */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Target Total (Optional)</label>
        <input
          type="number"
          min="0"
          value={question.mustTotal || ''}
          onChange={(e) =>
            onUpdate({ ...question, mustTotal: e.target.value ? parseInt(e.target.value) : undefined })
          }
          placeholder="e.g., 100"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
        />
        <p className="mt-1 text-xs text-gray-500">Leave blank for no validation</p>
      </div>

      {/* Show Total */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Show Total Display</label>
        <button
          onClick={() => onUpdate({ ...question, showTotal: !question.showTotal })}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            question.showTotal ? 'bg-brand-teal' : 'bg-gray-200'
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              question.showTotal ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>

      {/* Unit */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Unit (Optional)</label>
        <div className="flex gap-2">
          <input
            type="text"
            maxLength={4}
            value={question.unit || ''}
            onChange={(e) => onUpdate({ ...question, unit: e.target.value || undefined })}
            placeholder="%, $, hrs"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          />
          <select
            value={question.unitPosition}
            onChange={(e) =>
              onUpdate({ ...question, unitPosition: e.target.value as 'before' | 'after' })
            }
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
            disabled={!question.unit}
          >
            <option value="before">Before</option>
            <option value="after">After</option>
          </select>
        </div>
      </div>

      {/* Min/Max Per Item */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Min Per Item</label>
          <input
            type="number"
            min="0"
            value={question.minPerItem || 0}
            onChange={(e) =>
              onUpdate({ ...question, minPerItem: parseInt(e.target.value) || 0 })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Max Per Item</label>
          <input
            type="number"
            min="0"
            value={question.maxPerItem || ''}
            onChange={(e) =>
              onUpdate({ ...question, maxPerItem: e.target.value ? parseInt(e.target.value) : undefined })
            }
            placeholder="No limit"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          />
        </div>
      </div>
    </>
  );
}

// Form Field Settings
function FormFieldSettings({
  question,
  onUpdate,
}: {
  question: FormFieldQuestion;
  onUpdate: (q: Question) => void;
}) {
  const [selectedFieldIndex, setSelectedFieldIndex] = useState(0);
  const selectedField = question.fields[selectedFieldIndex];

  const updateSelectedField = (updates: Partial<FormFieldQuestion['fields'][0]>) => {
    const updatedFields = question.fields.map((field, index) =>
      index === selectedFieldIndex ? { ...field, ...updates } : field
    );
    onUpdate({ ...question, fields: updatedFields });
  };

  if (!selectedField) return null;

  return (
    <>
      {/* Field Selector */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Configure Field</label>
        <select
          value={selectedFieldIndex}
          onChange={(e) => setSelectedFieldIndex(parseInt(e.target.value))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
        >
          {question.fields.map((field, index) => (
            <option key={field.id} value={index}>
              {field.label || `Field ${index + 1}`}
            </option>
          ))}
        </select>
      </div>

      {/* Field Size */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Field Size</label>
        <div className="grid grid-cols-2 gap-2">
          {(['short', 'medium', 'long', 'essay'] as const).map((size) => (
            <button
              key={size}
              onClick={() => updateSelectedField({ size })}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm capitalize transition-colors',
                selectedField.size === size
                  ? 'border-brand-teal bg-brand-light text-brand-teal'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Content Type */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Content Validation</label>
        <select
          value={selectedField.contentType || ''}
          onChange={(e) =>
            updateSelectedField({
              contentType: e.target.value as FormFieldQuestion['fields'][0]['contentType'] || undefined,
            })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
        >
          <option value="">None</option>
          <option value="email">Email Address</option>
          <option value="phone">Phone Number</option>
          <option value="date">Date</option>
          <option value="number">Number Only</option>
          <option value="postalCode">Postal Code</option>
          <option value="url">URL</option>
        </select>
      </div>

      {/* Field Required */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Field Required</label>
        <button
          onClick={() => updateSelectedField({ required: !selectedField.required })}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            selectedField.required ? 'bg-brand-teal' : 'bg-gray-200'
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              selectedField.required ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>
    </>
  );
}

// Heat Map Settings
function HeatMapSettings({
  question,
  onUpdate,
}: {
  question: HeatMapQuestion;
  onUpdate: (q: Question) => void;
}) {
  const [editingRegion, setEditingRegion] = useState<string | null>(null);

  const addRegion = () => {
    const newRegion = {
      id: `region-${crypto.randomUUID()}`,
      name: `Region ${(question.regions?.length || 0) + 1}`,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
    };
    onUpdate({
      ...question,
      regions: [...(question.regions || []), newRegion],
    });
  };

  const deleteRegion = (regionId: string) => {
    onUpdate({
      ...question,
      regions: question.regions?.filter((r) => r.id !== regionId),
    });
  };

  const updateRegion = (regionId: string, updates: Partial<NonNullable<HeatMapQuestion['regions']>[number]>) => {
    onUpdate({
      ...question,
      regions: question.regions?.map((r) =>
        r.id === regionId ? { ...r, ...updates } : r
      ),
    });
  };

  return (
    <>
      {/* Max Clicks */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Maximum Clicks Allowed</label>
        <input
          type="number"
          min="1"
          max="50"
          value={question.maxClicks}
          onChange={(e) =>
            onUpdate({ ...question, maxClicks: parseInt(e.target.value) || 1 })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
        />
      </div>

      {/* Regions */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Analysis Regions</label>
        {question.regions && question.regions.length > 0 ? (
          <div className="space-y-2">
            {question.regions.map((region) => (
              <div
                key={region.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-3"
              >
                {editingRegion === region.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={region.name}
                      onChange={(e) => updateRegion(region.id, { name: e.target.value })}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                      placeholder="Region name"
                    />
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <input
                        type="number"
                        value={region.x}
                        onChange={(e) => updateRegion(region.id, { x: parseInt(e.target.value) || 0 })}
                        className="rounded border border-gray-300 px-2 py-1"
                        placeholder="X"
                      />
                      <input
                        type="number"
                        value={region.y}
                        onChange={(e) => updateRegion(region.id, { y: parseInt(e.target.value) || 0 })}
                        className="rounded border border-gray-300 px-2 py-1"
                        placeholder="Y"
                      />
                      <input
                        type="number"
                        value={region.width}
                        onChange={(e) => updateRegion(region.id, { width: parseInt(e.target.value) || 0 })}
                        className="rounded border border-gray-300 px-2 py-1"
                        placeholder="Width"
                      />
                      <input
                        type="number"
                        value={region.height}
                        onChange={(e) => updateRegion(region.id, { height: parseInt(e.target.value) || 0 })}
                        className="rounded border border-gray-300 px-2 py-1"
                        placeholder="Height"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingRegion(null)}
                        className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                      >
                        Done
                      </button>
                      <button
                        onClick={() => {
                          deleteRegion(region.id);
                          setEditingRegion(null);
                        }}
                        className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{region.name}</span>
                    <button
                      onClick={() => setEditingRegion(region.id)}
                      className="text-xs text-brand-teal hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No regions defined. Click below to add.</p>
        )}
        <button
          onClick={addRegion}
          disabled={!question.imageUrl}
          className={cn(
            'mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 text-xs font-medium',
            question.imageUrl
              ? 'border-gray-300 text-gray-600 hover:border-brand-teal hover:text-brand-teal'
              : 'cursor-not-allowed border-gray-200 text-gray-400'
          )}
        >
          <Plus className="h-3 w-3" />
          Add Region
        </button>
        {!question.imageUrl && (
          <p className="mt-1 text-xs text-gray-500">Upload an image first to add regions</p>
        )}
      </div>
    </>
  );
}

// TextGraphic Settings
function TextGraphicSettings({
  question,
  onUpdate,
}: {
  question: TextGraphicQuestion;
  onUpdate: (q: Question) => void;
}) {
  return (
    <>
      <div className="space-y-3">
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-700">Content Type</label>
          <div className="grid grid-cols-3 gap-2">
            {(['text', 'graphic', 'file'] as const).map((type) => (
              <button
                key={type}
                onClick={() => onUpdate({ ...question, contentType: type, content: '', caption: '', fileName: '' })}
                className={cn(
                  'rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-colors',
                  question.contentType === type
                    ? 'border-brand-teal bg-brand-teal/5 text-brand-teal'
                    : 'border-gray-300 text-gray-600 hover:border-brand-teal/50'
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {question.contentType === 'text' && (
          <div className="rounded-lg bg-yellow-50 p-3 text-xs text-yellow-800">
            <strong>Display Only:</strong> Edit the text content directly in the editor. This element does not collect response data.
          </div>
        )}

        {question.contentType === 'graphic' && (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Image URL</label>
              <input
                type="url"
                value={question.content || ''}
                onChange={(e) => onUpdate({ ...question, content: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Caption (optional)</label>
              <textarea
                value={question.caption || ''}
                onChange={(e) => onUpdate({ ...question, caption: e.target.value })}
                placeholder="Image description or caption"
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
              />
            </div>
            <div className="rounded-lg bg-yellow-50 p-3 text-xs text-yellow-800">
              <strong>Display Only:</strong> This element does not collect response data.
            </div>
          </>
        )}

        {question.contentType === 'file' && (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Download URL</label>
              <input
                type="url"
                value={question.content || ''}
                onChange={(e) => onUpdate({ ...question, content: e.target.value })}
                placeholder="https://example.com/document.pdf"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">File Name</label>
              <input
                type="text"
                value={question.fileName || ''}
                onChange={(e) => onUpdate({ ...question, fileName: e.target.value })}
                placeholder="document.pdf"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Caption (optional)</label>
              <textarea
                value={question.caption || ''}
                onChange={(e) => onUpdate({ ...question, caption: e.target.value })}
                placeholder="File description"
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
              />
            </div>
            <div className="rounded-lg bg-yellow-50 p-3 text-xs text-yellow-800">
              <strong>Display Only:</strong> This element does not collect response data.
            </div>
          </>
        )}
      </div>
    </>
  );
}

// Slider Settings
function SliderSettings({
  question,
  onUpdate,
}: {
  question: SliderQuestion;
  onUpdate: (q: Question) => void;
}) {
  return (
    <>
      <div className="space-y-3">
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-700">Display Type</label>
          <div className="grid grid-cols-3 gap-2">
            {(['bars', 'sliders', 'stars'] as const).map((type) => (
              <button
                key={type}
                onClick={() => onUpdate({ ...question, displayType: type })}
                className={cn(
                  'rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-colors',
                  question.displayType === type
                    ? 'border-brand-teal bg-brand-teal/5 text-brand-teal'
                    : 'border-gray-300 text-gray-600 hover:border-brand-teal/50'
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Min Value</label>
            <input
              type="number"
              value={question.min}
              onChange={(e) => onUpdate({ ...question, min: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Max Value</label>
            <input
              type="number"
              value={question.max}
              onChange={(e) => onUpdate({ ...question, max: parseFloat(e.target.value) || 100 })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Decimals</label>
            <input
              type="number"
              min="0"
              max="4"
              value={question.decimals}
              onChange={(e) => onUpdate({ ...question, decimals: parseInt(e.target.value) || 0 })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-700">Increments</label>
          <input
            type="number"
            min="0"
            value={question.increments || ''}
            onChange={(e) => onUpdate({ ...question, increments: parseInt(e.target.value) || undefined })}
            placeholder="Optional (e.g., 10 for 11 positions)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          />
          <p className="mt-1 text-xs text-gray-500">Number of steps between min and max (blank for continuous)</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700">Snap to Increments</label>
            <button
              onClick={() => onUpdate({ ...question, snapToIncrements: !question.snapToIncrements })}
              className={cn(
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                question.snapToIncrements ? 'bg-brand-teal' : 'bg-gray-300'
              )}
            >
              <span
                className={cn(
                  'inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform',
                  question.snapToIncrements ? 'translate-x-5' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700">Show Value</label>
            <button
              onClick={() => onUpdate({ ...question, showValue: !question.showValue })}
              className={cn(
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                question.showValue ? 'bg-brand-teal' : 'bg-gray-300'
              )}
            >
              <span
                className={cn(
                  'inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform',
                  question.showValue ? 'translate-x-5' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700">Allow N/A</label>
            <button
              onClick={() => onUpdate({ ...question, allowNA: !question.allowNA })}
              className={cn(
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                question.allowNA ? 'bg-brand-teal' : 'bg-gray-300'
              )}
            >
              <span
                className={cn(
                  'inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform',
                  question.allowNA ? 'translate-x-5' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        </div>

        {question.displayType === 'stars' && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Stars Interaction</label>
            <select
              value={question.starsInteraction || 'discrete'}
              onChange={(e) => onUpdate({ ...question, starsInteraction: e.target.value as 'discrete' | 'halfStep' | 'continuous' })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
            >
              <option value="discrete">Discrete (whole stars)</option>
              <option value="halfStep">Half Step (0.5 increments)</option>
              <option value="continuous">Continuous (any value)</option>
            </select>
          </div>
        )}
      </div>
    </>
  );
}

// HotSpot Settings
function HotSpotSettings({
  question,
  onUpdate,
}: {
  question: HotSpotQuestion;
  onUpdate: (q: Question) => void;
}) {
  const [editingRegion, setEditingRegion] = useState<string | null>(null);

  const updateRegion = (regionId: string, updates: Partial<HotSpotQuestion['regions'][0]>) => {
    const regions = question.regions.map(r => r.id === regionId ? { ...r, ...updates } : r);
    onUpdate({ ...question, regions });
  };

  const deleteRegion = (regionId: string) => {
    onUpdate({ ...question, regions: question.regions.filter(r => r.id !== regionId) });
    setEditingRegion(null);
  };

  return (
    <>
      <div className="space-y-3">
        {/* Interaction Mode */}
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-700">Interaction Mode</label>
          <div className="grid grid-cols-2 gap-2">
            {(['onOff', 'likeDislike'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onUpdate({ ...question, mode })}
                className={cn(
                  'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                  question.mode === mode
                    ? 'border-brand-teal bg-brand-teal/5 text-brand-teal'
                    : 'border-gray-300 text-gray-600 hover:border-brand-teal/50'
                )}
              >
                {mode === 'onOff' ? 'On/Off' : 'Like/Dislike'}
              </button>
            ))}
          </div>
        </div>

        {/* Region Visibility */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-700">Always Show Outlines</label>
          <button
            onClick={() => onUpdate({ ...question, showRegionOutlines: !question.showRegionOutlines })}
            className={cn(
              'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
              question.showRegionOutlines ? 'bg-brand-teal' : 'bg-gray-300'
            )}
          >
            <span
              className={cn(
                'inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform',
                question.showRegionOutlines ? 'translate-x-5' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        {/* Min/Max Regions */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Min Regions</label>
            <input
              type="number"
              min="0"
              value={question.minRegions || ''}
              onChange={(e) => onUpdate({ ...question, minRegions: parseInt(e.target.value) || undefined })}
              placeholder="Optional"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Max Regions</label>
            <input
              type="number"
              min="0"
              value={question.maxRegions || ''}
              onChange={(e) => onUpdate({ ...question, maxRegions: parseInt(e.target.value) || undefined })}
              placeholder="Optional"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
            />
          </div>
        </div>

        {/* Region Management */}
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-700 uppercase tracking-wider">
            Regions ({question.regions.length})
          </label>
          {question.regions.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {question.regions.map(region => (
                <div key={region.id} className="rounded-lg border border-gray-200 p-2">
                  {editingRegion === region.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={region.name}
                        onChange={(e) => updateRegion(region.id, { name: e.target.value })}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                        placeholder="Region name"
                      />
                      {region.shape === 'rectangle' && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="block text-gray-500 mb-0.5">X (%)</label>
                            <input
                              type="number"
                              value={region.x || 0}
                              onChange={(e) => updateRegion(region.id, { x: parseFloat(e.target.value) || 0 })}
                              className="w-full rounded border border-gray-300 px-2 py-1"
                              step="0.1"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-500 mb-0.5">Y (%)</label>
                            <input
                              type="number"
                              value={region.y || 0}
                              onChange={(e) => updateRegion(region.id, { y: parseFloat(e.target.value) || 0 })}
                              className="w-full rounded border border-gray-300 px-2 py-1"
                              step="0.1"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-500 mb-0.5">Width (%)</label>
                            <input
                              type="number"
                              value={region.width || 0}
                              onChange={(e) => updateRegion(region.id, { width: parseFloat(e.target.value) || 0 })}
                              className="w-full rounded border border-gray-300 px-2 py-1"
                              step="0.1"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-500 mb-0.5">Height (%)</label>
                            <input
                              type="number"
                              value={region.height || 0}
                              onChange={(e) => updateRegion(region.id, { height: parseFloat(e.target.value) || 0 })}
                              className="w-full rounded border border-gray-300 px-2 py-1"
                              step="0.1"
                            />
                          </div>
                        </div>
                      )}
                      {region.shape === 'polygon' && (
                        <p className="text-xs text-gray-500 italic">
                          Polygon with {region.points?.length || 0} points. Edit in the preview above.
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingRegion(null)}
                          className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                        >
                          Done
                        </button>
                        <button
                          onClick={() => deleteRegion(region.id)}
                          className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">{region.name}</span>
                        <span className="text-xs text-gray-400">({region.shape})</span>
                      </div>
                      <button
                        onClick={() => setEditingRegion(region.id)}
                        className="text-xs text-brand-teal hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No regions defined. Use the editor above to add regions.</p>
          )}
        </div>

        <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
          <strong>Tip:</strong> Use the editor preview to draw regions directly on the image. Rectangle regions can be edited precisely here.
        </div>
      </div>
    </>
  );
}

// Display Logic Section
function DisplayLogicSection({
  question,
  previousQuestions,
  onUpdate,
}: {
  question: Question;
  previousQuestions: Question[];
  onUpdate: (q: Question) => void;
}) {
  const { present } = useSurveyBuilder();
  const embeddedFields = present?.embeddedDataSchema?.fields || DEFAULT_EMBEDDED_FIELDS;
  
  const displayLogic = question.displayLogic || { 
    enabled: false, 
    conditions: [], 
    operator: 'AND' as const 
  };

  const toggleEnabled = () => {
    onUpdate({
      ...question,
      displayLogic: { ...displayLogic, enabled: !displayLogic.enabled },
    });
  };

  const addCondition = () => {
    const firstQuestion = previousQuestions[0];
    const newCondition: DisplayLogicCondition = {
      id: `condition-${crypto.randomUUID()}`,
      sourceType: 'question',
      questionId: firstQuestion?.id || '',
      operator: 'equals',
      value: '',
    };
    onUpdate({
      ...question,
      displayLogic: {
        ...displayLogic,
        conditions: [...displayLogic.conditions, newCondition],
      },
    });
  };

  const updateCondition = (index: number, updated: DisplayLogicCondition) => {
    const newConditions = [...displayLogic.conditions];
    newConditions[index] = updated;
    onUpdate({
      ...question,
      displayLogic: { ...displayLogic, conditions: newConditions },
    });
  };

  const deleteCondition = (index: number) => {
    const newConditions = displayLogic.conditions.filter((_, i) => i !== index);
    onUpdate({
      ...question,
      displayLogic: { ...displayLogic, conditions: newConditions },
    });
  };

  // Get source question for a condition
  const getSourceQuestion = (condition: DisplayLogicCondition): Question | undefined => {
    return previousQuestions.find(q => q.id === condition.questionId);
  };

  // Handle source type change
  const handleSourceTypeChange = (index: number, condition: DisplayLogicCondition, newSourceType: 'question' | 'embeddedData') => {
    updateCondition(index, {
      ...condition,
      sourceType: newSourceType,
      questionId: newSourceType === 'question' ? previousQuestions[0]?.id : undefined,
      embeddedFieldName: newSourceType === 'embeddedData' ? embeddedFields[0]?.name : undefined,
      operator: 'equals',
      value: '',
    });
  };

  // Handle question change
  const handleQuestionChange = (index: number, condition: DisplayLogicCondition, newQuestionId: string) => {
    const newQuestion = previousQuestions.find(q => q.id === newQuestionId);
    const operators = getOperatorsForQuestion(newQuestion);
    const defaultOperator = operators[0]?.value || 'equals';
    
    updateCondition(index, {
      ...condition,
      questionId: newQuestionId,
      operator: defaultOperator,
      value: '',
    });
  };

  // Handle embedded field change
  const handleEmbeddedFieldChange = (index: number, condition: DisplayLogicCondition, fieldName: string) => {
    updateCondition(index, {
      ...condition,
      embeddedFieldName: fieldName,
      operator: 'equals',
      value: '',
    });
  };

  // Handle operator change
  const handleOperatorChange = (index: number, condition: DisplayLogicCondition, newOperator: DisplayLogicOperator) => {
    updateCondition(index, {
      ...condition,
      operator: newOperator,
      value: operatorRequiresValue(newOperator) ? condition.value : '',
    });
  };

  // Get warnings for a condition
  const getConditionWarnings = (condition: DisplayLogicCondition): LogicWarning[] => {
    return validateCondition(condition, previousQuestions, embeddedFields);
  };

  return (
    <div className="space-y-4">
      {/* Enable Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">Enable display logic</span>
        <button
          onClick={toggleEnabled}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            displayLogic.enabled ? 'bg-brand-teal' : 'bg-gray-200'
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              displayLogic.enabled ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>

      {displayLogic.enabled && (
        <>
          <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-700">
            <AlertCircle className="mb-1 inline h-3 w-3" /> This question will only be shown if the conditions below are met.
          </div>

          {/* Operator selection if multiple conditions */}
          {displayLogic.conditions.length > 1 && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Match</label>
              <select
                value={displayLogic.operator}
                onChange={(e) =>
                  onUpdate({
                    ...question,
                    displayLogic: { ...displayLogic, operator: e.target.value as 'AND' | 'OR' },
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
              >
                <option value="AND">All conditions (AND)</option>
                <option value="OR">Any condition (OR)</option>
              </select>
            </div>
          )}

          {/* Conditions */}
          <div className="space-y-3">
            {displayLogic.conditions.map((condition, index) => {
              const sourceQuestion = getSourceQuestion(condition);
              const isQuestionSource = condition.sourceType === 'question' || !condition.sourceType;
              const availableOperators = isQuestionSource 
                ? getOperatorsForQuestion(sourceQuestion)
                : getOperatorsForEmbeddedData();
              const currentOperator = availableOperators.find(op => op.value === condition.operator);
              const showValueInput = currentOperator?.requiresValue ?? true;
              const hasChoices = isQuestionSource && questionHasChoices(sourceQuestion);
              const choices = isQuestionSource ? getQuestionChoices(sourceQuestion) : [];
              const warnings = getConditionWarnings(condition);
              const hasWarnings = warnings.length > 0;

              // Human-readable summary
              const summary = getConditionSummary(condition, previousQuestions, embeddedFields);

              return (
                <div 
                  key={condition.id} 
                  className={cn(
                    "rounded-lg border p-3 space-y-3",
                    hasWarnings 
                      ? "border-yellow-300 bg-yellow-50" 
                      : "border-gray-200 bg-gray-50"
                  )}
                >
                  {/* Header with summary */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700">Condition {index + 1}</span>
                        {hasWarnings && (
                          <AlertTriangle className="h-3 w-3 text-yellow-600" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500 italic">{summary}</p>
                    </div>
                    <button
                      onClick={() => deleteCondition(index)}
                      className="rounded p-1 hover:bg-gray-200"
                      title="Delete condition"
                    >
                      <Trash2 className="h-3 w-3 text-gray-500" />
                    </button>
                  </div>

                  {/* Warnings */}
                  {hasWarnings && (
                    <div className="rounded bg-yellow-100 px-2 py-1.5 text-xs text-yellow-800">
                      {warnings.map((w, i) => (
                        <div key={i}>⚠️ {w.message}</div>
                      ))}
                    </div>
                  )}

                  {/* Source Type Toggle */}
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Source</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSourceTypeChange(index, condition, 'question')}
                        className={cn(
                          "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                          isQuestionSource
                            ? "bg-brand-teal text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        Question
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSourceTypeChange(index, condition, 'embeddedData')}
                        className={cn(
                          "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                          !isQuestionSource
                            ? "bg-brand-teal text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        Embedded Field
                      </button>
                    </div>
                  </div>

                  {/* Question or Embedded Field Selection */}
                  {isQuestionSource ? (
                    <div>
                      <label className="mb-1 block text-xs text-gray-600">If question</label>
                      <select
                        value={condition.questionId || ''}
                        onChange={(e) => handleQuestionChange(index, condition, e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                      >
                        <option value="">Select a question</option>
                        {previousQuestions.map((q, qIdx) => (
                          <option key={q.id} value={q.id}>
                            {getQuestionDisplayLabel(q, qIdx)}
                          </option>
                        ))}
                      </select>
                      {previousQuestions.length === 0 && (
                        <p className="mt-1 text-xs text-gray-500">No previous questions available</p>
                      )}
                      {sourceQuestion && (
                        <span className="mt-1 inline-block rounded bg-gray-200 px-1.5 py-0.5 text-[10px] text-gray-600">
                          {sourceQuestion.type}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="mb-1 block text-xs text-gray-600">If embedded field</label>
                      <select
                        value={condition.embeddedFieldName || ''}
                        onChange={(e) => handleEmbeddedFieldChange(index, condition, e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                      >
                        <option value="">Select a field</option>
                        {embeddedFields.map((field) => (
                          <option key={field.name} value={field.name}>
                            {field.label || field.name} {`{{${field.name}}}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Operator Selection */}
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Operator</label>
                    <select
                      value={condition.operator}
                      onChange={(e) => handleOperatorChange(index, condition, e.target.value as DisplayLogicOperator)}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                    >
                      {availableOperators.map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Value Input */}
                  {showValueInput && (
                    <div>
                      <label className="mb-1 block text-xs text-gray-600">Value</label>
                      
                      {/* Dropdown for choice-based questions */}
                      {hasChoices && choices.length > 0 ? (
                        <select
                          value={condition.value as string || ''}
                          onChange={(e) => updateCondition(index, { ...condition, value: e.target.value })}
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                        >
                          <option value="">Select a value</option>
                          {choices.map((choice) => (
                            <option key={choice.id} value={choice.value?.toString() || choice.id}>
                              {choice.text}
                            </option>
                          ))}
                        </select>
                      ) : (
                        /* Text/number input for other types */
                        <input
                          type={sourceQuestion?.type === 'Slider' || sourceQuestion?.type === 'NetPromoter' ? 'number' : 'text'}
                          value={condition.value as string || ''}
                          onChange={(e) => updateCondition(index, { 
                            ...condition, 
                            value: sourceQuestion?.type === 'Slider' ? parseFloat(e.target.value) || '' : e.target.value 
                          })}
                          placeholder={
                            !isQuestionSource 
                              ? 'Enter value to match...'
                              : sourceQuestion?.type === 'Slider' 
                                ? 'Enter numeric value...' 
                                : 'Enter value...'
                          }
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                        />
                      )}
                      
                      {/* Helper text for slider types */}
                      {sourceQuestion?.type === 'Slider' && 'min' in sourceQuestion && (
                        <p className="mt-1 text-[10px] text-gray-500">
                          Range: {(sourceQuestion as SliderQuestion).min} - {(sourceQuestion as SliderQuestion).max}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Condition Button */}
          <button
            onClick={addCondition}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2 text-xs font-medium text-gray-600 hover:border-brand-teal hover:text-brand-teal"
          >
            <Plus className="h-3 w-3" />
            Add Condition
          </button>
        </>
      )}
    </div>
  );
}

// Validation Section
function RequirementsAndValidationSection({
  question,
  onUpdate,
}: {
  question: Question;
  onUpdate: (q: Question) => void;
}) {
  // Get validation rules array - handle questions that may not have validation
  const validationRules = ('validation' in question && Array.isArray(question.validation)) 
    ? question.validation 
    : [];
  
  const hasCustomValidation = validationRules.length > 0;
  
  // Helper to find a specific validation rule
  const findRule = (type: string) => validationRules.find(r => r.type === type);
  
  // Helper to update validation rules
  const updateValidation = (type: string, value: number | string | undefined, message?: string) => {
    if (!('validation' in question)) return;
    
    let newRules = [...validationRules];
    const existingIndex = newRules.findIndex(r => r.type === type);
    
    if (value === undefined || value === '') {
      // Remove the rule if value is empty
      if (existingIndex >= 0) {
        newRules.splice(existingIndex, 1);
      }
    } else {
      const newRule = { type: type as any, value, message };
      if (existingIndex >= 0) {
        newRules[existingIndex] = newRule;
      } else {
        newRules.push(newRule);
      }
    }
    
    onUpdate({ ...question, validation: newRules } as Question);
  };

  return (
    <div className="space-y-4">
      {/* Response Requirement */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Response Requirement</label>
        <select
          value={question.validationType || (question.required ? 'force' : 'none')}
          onChange={(e) => {
            const val = e.target.value as 'force' | 'request' | 'none';
            onUpdate({
              ...question,
              validationType: val,
              required: val === 'force'
            });
          }}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
        >
          <option value="force">Force Response</option>
          <option value="request">Request Response</option>
          <option value="none">None</option>
        </select>
      </div>

      {'validation' in question && (
        <>
          <hr className="border-gray-200" />

          <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-700">
            <AlertCircle className="mb-1 inline h-3 w-3" /> Add validation rules below.
          </div>

          {/* Min Length */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Minimum Length</label>
            <input
              type="number"
              min="0"
              value={findRule('minLength')?.value || ''}
              onChange={(e) => updateValidation('minLength', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="No minimum"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {/* Max Length */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Maximum Length</label>
            <input
              type="number"
              min="0"
              value={findRule('maxLength')?.value || ''}
              onChange={(e) => updateValidation('maxLength', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="No maximum"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </>
      )}
    </div>
  );
}
// RankOrder Settings
function RankOrderSettings({
  question,
  onUpdate,
}: {
  question: RankOrderQuestion;
  onUpdate: (q: Question) => void;
}) {
  return (
    <>
      {/* Format Type */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Ranking Format</label>
        <select
          value={question.format}
          onChange={(e) => onUpdate({ ...question, format: e.target.value as RankOrderQuestion['format'] })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
        >
          <option value="dragDrop">Drag and Drop</option>
          <option value="radioButtons">Radio Buttons</option>
          <option value="textBox">Text Box</option>
          <option value="selectBox">Select Box (Up/Down)</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          {question.format === 'dragDrop' && 'Respondents drag items to reorder them'}
          {question.format === 'radioButtons' && 'Respondents click rank numbers for each item'}
          {question.format === 'textBox' && 'Respondents type rank numbers (1, 2, 3...)'}
          {question.format === 'selectBox' && 'Respondents use up/down arrows to adjust order'}
        </p>
      </div>

      {/* Must Rank All */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">Must Rank All Items</label>
          <p className="text-xs text-gray-500">Require ranking every item</p>
        </div>
        <button
          onClick={() => onUpdate({ ...question, mustRankAll: !question.mustRankAll })}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            question.mustRankAll ? 'bg-brand-teal' : 'bg-gray-200'
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              question.mustRankAll ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>

      {/* Min/Max Rank */}
      {!question.mustRankAll && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Min Ranks Required</label>
            <input
              type="number"
              min="1"
              max={question.items.length}
              value={question.minRank || ''}
              onChange={(e) => onUpdate({ ...question, minRank: parseInt(e.target.value) || undefined })}
              placeholder="Optional"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Max Ranks Allowed</label>
            <input
              type="number"
              min="1"
              max={question.items.length}
              value={question.maxRank || ''}
              onChange={(e) => onUpdate({ ...question, maxRank: parseInt(e.target.value) || undefined })}
              placeholder="Optional"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
            />
          </div>
        </div>
      )}
    </>
  );
}

// PickGroupRank Settings
function PickGroupRankSettings({
  question,
  onUpdate,
}: {
  question: PickGroupRankQuestion;
  onUpdate: (q: Question) => void;
}) {
  const updateGroup = (groupId: string, updates: Partial<PickGroupRankQuestion['groups'][0]>) => {
    const groups = question.groups.map(g => g.id === groupId ? { ...g, ...updates } : g);
    onUpdate({ ...question, groups });
  };

  return (
    <>
      {/* Column Layout */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Group Layout</label>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2].map((cols) => (
            <button
              key={cols}
              onClick={() => onUpdate({ ...question, columns: cols })}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                question.columns === cols
                  ? 'border-brand-teal bg-brand-light text-brand-teal'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              )}
            >
              {cols} Column{cols > 1 ? 's' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Stack Items */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">Stack Ungrouped Items</label>
          <p className="text-xs text-gray-500">Display as overlapping cards</p>
        </div>
        <button
          onClick={() => onUpdate({ ...question, stackItems: !question.stackItems })}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            question.stackItems ? 'bg-brand-teal' : 'bg-gray-200'
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              question.stackItems ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>

      {/* Stack Items in Groups */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">Stack Items in Groups</label>
          <p className="text-xs text-gray-500">Compact view for grouped items</p>
        </div>
        <button
          onClick={() => onUpdate({ ...question, stackItemsInGroups: !question.stackItemsInGroups })}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            question.stackItemsInGroups ? 'bg-brand-teal' : 'bg-gray-200'
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              question.stackItemsInGroups ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>

      {/* Group Constraints */}
      <div>
        <label className="mb-2 block text-xs font-medium text-gray-700 uppercase tracking-wider">
          Group Constraints
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto rounded-lg border border-gray-200 p-2">
          {question.groups.map(group => (
            <div key={group.id} className="rounded bg-gray-50 p-2">
              <div className="mb-2 text-xs font-medium text-gray-700">{group.name}</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-600">Min Items</label>
                  <input
                    type="number"
                    min="0"
                    value={group.minItems || ''}
                    onChange={(e) => updateGroup(group.id, { minItems: parseInt(e.target.value) || undefined })}
                    placeholder="None"
                    className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-600">Max Items</label>
                  <input
                    type="number"
                    min="0"
                    value={group.maxItems || ''}
                    onChange={(e) => updateGroup(group.id, { maxItems: parseInt(e.target.value) || undefined })}
                    placeholder="None"
                    className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// SideBySide Settings
function SideBySideSettings({
  question,
  onUpdate,
}: {
  question: SideBySideQuestion;
  onUpdate: (q: Question) => void;
}) {
  const [editingColumn, setEditingColumn] = useState<string | null>(null);

  const updateColumn = (columnId: string, updates: Partial<SideBySideQuestion['columns'][0]>) => {
    const columns = question.columns.map(c => c.id === columnId ? { ...c, ...updates } : c);
    onUpdate({ ...question, columns });
  };

  const addChoice = (columnId: string) => {
    const column = question.columns.find(c => c.id === columnId);
    if (!column) return;
    
    const newChoice = {
      id: `choice-${crypto.randomUUID()}`,
      text: `Option ${(column.choices?.length || 0) + 1}`,
      value: (column.choices?.length || 0) + 1,
    };
    
    updateColumn(columnId, { choices: [...(column.choices || []), newChoice] });
  };

  const updateChoice = (columnId: string, choiceId: string, text: string) => {
    const column = question.columns.find(c => c.id === columnId);
    if (!column || !column.choices) return;
    
    const choices = column.choices.map(ch => ch.id === choiceId ? { ...ch, text } : ch);
    updateColumn(columnId, { choices });
  };

  const deleteChoice = (columnId: string, choiceId: string) => {
    const column = question.columns.find(c => c.id === columnId);
    if (!column || !column.choices) return;
    
    const choices = column.choices.filter(ch => ch.id !== choiceId);
    updateColumn(columnId, { choices });
  };

  return (
    <>
      {/* Repeat Headers */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Repeat Headers Every N Rows</label>
        <input
          type="number"
          min="0"
          value={question.repeatHeaders || ''}
          onChange={(e) => onUpdate({ ...question, repeatHeaders: parseInt(e.target.value) || undefined })}
          placeholder="Never repeat (leave empty)"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
        />
        <p className="mt-1 text-xs text-gray-500">
          Useful for long tables. Leave empty to show headers only at the top.
        </p>
      </div>

      {/* Column Configuration */}
      <div>
        <label className="mb-2 block text-xs font-medium text-gray-700 uppercase tracking-wider">
          Column Configuration ({question.columns.length})
        </label>
        <div className="space-y-3 max-h-96 overflow-y-auto rounded-lg border border-gray-200 p-3">
          {question.columns.map((column, index) => (
            <div key={column.id} className="rounded-lg border border-gray-300 bg-gray-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">Column {index + 1}: {column.header}</span>
                <button
                  onClick={() => setEditingColumn(editingColumn === column.id ? null : column.id)}
                  className="text-xs text-brand-teal hover:underline"
                >
                  {editingColumn === column.id ? 'Close' : 'Edit'}
                </button>
              </div>

              {editingColumn === column.id && (
                <div className="space-y-2">
                  {/* Column Type */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Question Type</label>
                    <select
                      value={column.type}
                      onChange={(e) => {
                        const newType = e.target.value as SideBySideQuestion['columns'][0]['type'];
                        const updates: Partial<SideBySideQuestion['columns'][0]> = { type: newType };
                        
                        // Add default choices for choice-based types
                        if (newType !== 'textEntry' && !column.choices) {
                          updates.choices = [
                            { id: `choice-${crypto.randomUUID()}-1`, text: 'Option 1', value: 1 },
                            { id: `choice-${crypto.randomUUID()}-2`, text: 'Option 2', value: 2 },
                          ];
                        }
                        
                        updateColumn(column.id, updates);
                      }}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                    >
                      <option value="singleAnswer">Single Answer (Radio)</option>
                      <option value="multipleAnswer">Multiple Answer (Checkbox)</option>
                      <option value="dropdown">Dropdown</option>
                      <option value="textEntry">Text Entry</option>
                    </select>
                  </div>

                  {/* Text Entry Options */}
                  {column.type === 'textEntry' && (
                    <>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Text Box Size</label>
                        <select
                          value={column.textSize || 'short'}
                          onChange={(e) => updateColumn(column.id, { textSize: e.target.value as 'short' | 'medium' | 'long' | 'essay' })}
                          className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                        >
                          <option value="short">Short</option>
                          <option value="medium">Medium</option>
                          <option value="long">Long</option>
                          <option value="essay">Essay</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Content Type</label>
                        <select
                          value={column.contentType || 'text'}
                          onChange={(e) => updateColumn(column.id, { contentType: e.target.value as 'email' | 'phone' | 'date' | 'number' | 'url' | undefined })}
                          className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="email">Email</option>
                          <option value="date">Date</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Choices for choice-based types */}
                  {column.type !== 'textEntry' && (
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">Choices</label>
                      <div className="space-y-1">
                        {column.choices?.map(choice => (
                          <div key={choice.id} className="flex items-center gap-1">
                            <input
                              type="text"
                              value={choice.text}
                              onChange={(e) => updateChoice(column.id, choice.id, e.target.value)}
                              className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
                            />
                            <button
                              onClick={() => deleteChoice(column.id, choice.id)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addChoice(column.id)}
                          className="text-xs text-brand-teal hover:underline"
                        >
                          + Add Choice
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Required Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-600">Required Column</label>
                    <button
                      onClick={() => updateColumn(column.id, { required: !column.required })}
                      className={cn(
                        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                        column.required ? 'bg-brand-teal' : 'bg-gray-300'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform',
                          column.required ? 'translate-x-5' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// Reputation Index Settings (formerly Net Promoter Score)
const SCALE_PRESETS: Record<ReputationIndexPreset, { minLabel: string; maxLabel: string; name: string }> = {
  likelihood: { minLabel: 'Not at all likely', maxLabel: 'Extremely likely', name: 'Likelihood' },
  probability: { minLabel: 'Very unlikely', maxLabel: 'Very likely', name: 'Probability' },
  recommendation: { minLabel: 'Would not recommend', maxLabel: 'Highly recommend', name: 'Recommendation' },
  satisfaction: { minLabel: 'Not satisfied', maxLabel: 'Extremely satisfied', name: 'Satisfaction' },
  emotional: { minLabel: 'Very disappointed', maxLabel: 'Very delighted', name: 'Emotional' },
  experience: { minLabel: 'Poor experience', maxLabel: 'Excellent experience', name: 'Experience' },
  helpfulness: { minLabel: 'Not helpful', maxLabel: 'Extremely helpful', name: 'Helpfulness' },
  expectations: { minLabel: "Didn't meet expectations", maxLabel: 'Exceeded expectations', name: 'Expectations' },
  trust: { minLabel: 'No trust', maxLabel: 'Complete trust', name: 'Trust' },
  confidence: { minLabel: 'Not confident', maxLabel: 'Completely confident', name: 'Confidence' },
  retention: { minLabel: "No chance I'd return", maxLabel: 'Absolutely will return', name: 'Retention' },
  value: { minLabel: 'No value', maxLabel: 'Exceptional value', name: 'Value' },
  absolute: { minLabel: 'Terrible', maxLabel: 'Perfect', name: 'Absolute' },
};

function ReputationIndexSettings({
  question,
  onUpdate,
}: {
  question: NetPromoterQuestion;
  onUpdate: (q: Question) => void;
}) {
  const handlePresetChange = (preset: ReputationIndexPreset | 'custom') => {
    if (preset === 'custom') {
      onUpdate({ ...question, scalePreset: undefined });
    } else {
      const { minLabel, maxLabel } = SCALE_PRESETS[preset];
      onUpdate({ ...question, scalePreset: preset, minLabel, maxLabel });
    }
  };

  return (
    <>
      {/* Scale Preset */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Scale Preset</label>
        <select
          value={question.scalePreset || 'custom'}
          onChange={(e) => handlePresetChange(e.target.value as ReputationIndexPreset | 'custom')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
        >
          <option value="custom">Custom Labels</option>
          <optgroup label="Common Presets">
            <option value="likelihood">Likelihood (Not at all likely → Extremely likely)</option>
            <option value="probability">Probability (Very unlikely → Very likely)</option>
            <option value="recommendation">Recommendation (Would not recommend → Highly recommend)</option>
            <option value="satisfaction">Satisfaction (Not satisfied → Extremely satisfied)</option>
          </optgroup>
          <optgroup label="Emotional & Experience">
            <option value="emotional">Emotional (Very disappointed → Very delighted)</option>
            <option value="experience">Experience (Poor experience → Excellent experience)</option>
            <option value="helpfulness">Helpfulness (Not helpful → Extremely helpful)</option>
            <option value="expectations">Expectations (Didn&apos;t meet → Exceeded)</option>
          </optgroup>
          <optgroup label="Trust & Value">
            <option value="trust">Trust (No trust → Complete trust)</option>
            <option value="confidence">Confidence (Not confident → Completely confident)</option>
            <option value="retention">Retention (No chance I&apos;d return → Absolutely will return)</option>
            <option value="value">Value (No value → Exceptional value)</option>
          </optgroup>
          <optgroup label="General">
            <option value="absolute">Absolute (Terrible → Perfect)</option>
          </optgroup>
        </select>
      </div>

      {/* Custom Labels (shown when custom is selected or for editing preset labels) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-700">Min Label (0)</label>
          <input
            type="text"
            value={question.minLabel || ''}
            onChange={(e) => onUpdate({ ...question, minLabel: e.target.value, scalePreset: undefined })}
            placeholder="Not at all likely"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-700">Max Label (10)</label>
          <input
            type="text"
            value={question.maxLabel || ''}
            onChange={(e) => onUpdate({ ...question, maxLabel: e.target.value, scalePreset: undefined })}
            placeholder="Extremely likely"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <p className="mb-2 text-xs font-medium text-gray-700">Preview:</p>
        <div className="flex justify-between text-xs text-gray-600">
          <span>{question.minLabel || 'Not at all likely'}</span>
          <span>0 — 1 — 2 — 3 — 4 — 5 — 6 — 7 — 8 — 9 — 10</span>
          <span>{question.maxLabel || 'Extremely likely'}</span>
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
        <strong>Note:</strong> The Reputation Index uses a 0-10 scale. Responses are typically categorized as:
        <ul className="mt-1 list-disc list-inside space-y-0.5">
          <li>0-6: Detractors</li>
          <li>7-8: Passives</li>
          <li>9-10: Promoters</li>
        </ul>
      </div>
    </>
  );
}

// Dimensions Section - for tagging questions with reporting groups
function DimensionsSection({
  question,
  onUpdate,
}: {
  question: Question;
  onUpdate: (q: Question) => void;
}) {
  const { present } = useSurveyBuilder();
  const [newDimension, setNewDimension] = useState('');
  
  const availableDimensions = present?.dimensionDefinitions || [];
  const questionDimensions = question.dimensions || [];
  
  const addDimension = (dimensionId: string) => {
    if (questionDimensions.includes(dimensionId)) return;
    onUpdate({ ...question, dimensions: [...questionDimensions, dimensionId] });
  };
  
  const removeDimension = (dimensionId: string) => {
    onUpdate({ ...question, dimensions: questionDimensions.filter(d => d !== dimensionId) });
  };
  
  const addCustomDimension = () => {
    if (!newDimension.trim()) return;
    const dimensionId = newDimension.trim().toLowerCase().replace(/\s+/g, '-');
    if (!questionDimensions.includes(dimensionId)) {
      onUpdate({ ...question, dimensions: [...questionDimensions, dimensionId] });
    }
    setNewDimension('');
  };
  
  return (
    <div className="space-y-4">
      <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-700">
        <AlertCircle className="mb-1 inline h-3 w-3" /> Dimensions help organize questions for reporting. Assign tags to group related questions.
      </div>
      
      {/* Current dimensions */}
      {questionDimensions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {questionDimensions.map(dimId => {
            const definition = availableDimensions.find(d => d.id === dimId);
            return (
              <span 
                key={dimId}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ 
                  backgroundColor: definition?.color ? `${definition.color}20` : '#e5e7eb',
                  color: definition?.color || '#374151'
                }}
              >
                {definition?.name || dimId}
                <button
                  onClick={() => removeDimension(dimId)}
                  className="hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
      
      {/* Add from existing dimensions */}
      {availableDimensions.length > 0 && (
        <div>
          <label className="mb-1 block text-xs text-gray-600">Add from survey dimensions</label>
          <select
            value=""
            onChange={(e) => e.target.value && addDimension(e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          >
            <option value="">Select a dimension...</option>
            {availableDimensions
              .filter(d => !questionDimensions.includes(d.id))
              .map(dim => (
                <option key={dim.id} value={dim.id}>{dim.name}</option>
              ))}
          </select>
        </div>
      )}
      
      {/* Add custom dimension */}
      <div>
        <label className="mb-1 block text-xs text-gray-600">Or add custom tag</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newDimension}
            onChange={(e) => setNewDimension(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomDimension()}
            placeholder="e.g., Customer Service"
            className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          />
          <button
            onClick={addCustomDimension}
            disabled={!newDimension.trim()}
            className="rounded bg-brand-teal px-3 py-1.5 text-xs text-white hover:bg-teal-700 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
      
      <p className="text-xs text-gray-500">
        Tip: Define survey-wide dimensions in Settings → Dimensions
      </p>
    </div>
  );
}