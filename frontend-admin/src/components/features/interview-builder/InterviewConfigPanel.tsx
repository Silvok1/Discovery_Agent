'use client';

import { useState } from 'react';
import {
  Plus,
  Trash2,
  Bot,
  Target,
  MessageSquare,
  Clock,
  Hash,
  Shield,
  Sparkles,
  Volume2,
  Save,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FlaskConical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentType, AGENT_TYPES, InterviewConfig } from '@/api/contracts';

interface InterviewConfigPanelProps {
  config: InterviewConfig;
  onChange: (config: InterviewConfig) => void;
  onSave: () => void;
  isSaving?: boolean;
}

// Extended config with new fields (will be synced with contracts.ts)
interface ExtendedConfig extends InterviewConfig {
  guardrails?: string[];
  enableCrossInterviewLearning?: boolean;
  enableTextToSpeech?: boolean;
}

export function InterviewConfigPanel({ config, onChange, onSave, isSaving }: InterviewConfigPanelProps) {
  const [newQuestion, setNewQuestion] = useState('');
  const [newGuardrail, setNewGuardrail] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSaveToLibrary, setShowSaveToLibrary] = useState(false);
  const [libraryName, setLibraryName] = useState('');

  // Cast config to extended type for new fields
  const extConfig = config as ExtendedConfig;

  const handleAgentTypeChange = (agentType: AgentType) => {
    onChange({ ...config, agentType });
  };

  const handleObjectiveChange = (objective: string) => {
    onChange({ ...config, objective });
  };

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    onChange({
      ...config,
      guidingQuestions: [...config.guidingQuestions, newQuestion.trim()],
    });
    setNewQuestion('');
  };

  const handleRemoveQuestion = (index: number) => {
    onChange({
      ...config,
      guidingQuestions: config.guidingQuestions.filter((_, i) => i !== index),
    });
  };

  const handleAddGuardrail = () => {
    if (!newGuardrail.trim()) return;
    const currentGuardrails = extConfig.guardrails || [];
    onChange({
      ...config,
      guardrails: [...currentGuardrails, newGuardrail.trim()],
    } as InterviewConfig);
    setNewGuardrail('');
  };

  const handleRemoveGuardrail = (index: number) => {
    const currentGuardrails = extConfig.guardrails || [];
    onChange({
      ...config,
      guardrails: currentGuardrails.filter((_, i) => i !== index),
    } as InterviewConfig);
  };

  const handleSettingChange = (field: string, value: number | boolean) => {
    onChange({ ...config, [field]: value } as InterviewConfig);
  };

  const handleSaveToLibrary = () => {
    // TODO: Save configuration to library
    console.log('Saving config to library:', libraryName, config);
    setShowSaveToLibrary(false);
    setLibraryName('');
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Agent Type Selection */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Bot className="h-5 w-5 text-brand-teal" />
          <h2 className="text-lg font-semibold text-brand-dark">Agent Type</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Select the interview style that best fits your discovery goals.
        </p>
        <div className="grid gap-3">
          {(Object.keys(AGENT_TYPES) as AgentType[]).map((type) => {
            const info = AGENT_TYPES[type];
            const isSelected = config.agentType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleAgentTypeChange(type)}
                className={cn(
                  'flex items-start gap-4 rounded-lg border-2 p-4 text-left transition-all',
                  isSelected
                    ? 'border-brand-teal bg-brand-light/30'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
                    isSelected ? 'bg-brand-teal text-white' : 'bg-gray-100 text-gray-500'
                  )}
                >
                  <Bot className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className={cn('font-semibold', isSelected ? 'text-brand-dark' : 'text-gray-900')}>
                    {info.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{info.description}</p>
                </div>
                {isSelected && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-teal">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Interview Objective */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-brand-teal" />
          <h2 className="text-lg font-semibold text-brand-dark">Interview Objective</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          What do you want to learn from this interview? This helps the agent stay focused.
        </p>
        <textarea
          value={config.objective || ''}
          onChange={(e) => handleObjectiveChange(e.target.value)}
          rows={4}
          placeholder="e.g., Understand the manual steps involved in monthly reporting and identify automation opportunities..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
        />
      </section>

      {/* Guiding Questions */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 text-brand-teal" />
          <h2 className="text-lg font-semibold text-brand-dark">Guiding Questions</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Add specific topics or questions to explore. The agent will weave these into the conversation.
        </p>

        {/* Existing Questions */}
        {config.guidingQuestions.length > 0 && (
          <ul className="space-y-2 mb-4">
            {config.guidingQuestions.map((q, index) => (
              <li
                key={index}
                className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
              >
                <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-brand-teal/10 text-xs font-medium text-brand-teal">
                  {index + 1}
                </span>
                <span className="flex-1 text-sm text-gray-700">{q}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(index)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500"
                  aria-label="Remove question"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Add New Question */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
            placeholder="Add a guiding question..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          />
          <button
            type="button"
            onClick={handleAddQuestion}
            disabled={!newQuestion.trim()}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              newQuestion.trim()
                ? 'bg-brand-teal text-white hover:bg-teal-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </section>

      {/* Guardrails */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-brand-teal" />
          <h2 className="text-lg font-semibold text-brand-dark">Guardrails</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Define topics or behaviors the agent should steer away from. Phrased as positive guidance.
        </p>
        <div className="rounded-lg bg-blue-50 p-3 mb-4">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> Frame guardrails positively. Instead of &quot;Don&apos;t discuss salaries&quot;,
              use &quot;Keep focus on process workflows rather than compensation topics&quot;.
            </p>
          </div>
        </div>

        {/* Existing Guardrails */}
        {(extConfig.guardrails || []).length > 0 && (
          <ul className="space-y-2 mb-4">
            {(extConfig.guardrails || []).map((g, index) => (
              <li
                key={index}
                className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3"
              >
                <Shield className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span className="flex-1 text-sm text-gray-700">{g}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveGuardrail(index)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500"
                  aria-label="Remove guardrail"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Add New Guardrail */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newGuardrail}
            onChange={(e) => setNewGuardrail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddGuardrail()}
            placeholder="e.g., Focus on workflows rather than individual performance..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          />
          <button
            type="button"
            onClick={handleAddGuardrail}
            disabled={!newGuardrail.trim()}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              newGuardrail.trim()
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </section>

      {/* Interview Settings */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-brand-teal" />
          <h2 className="text-lg font-semibold text-brand-dark">Interview Settings</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Set limits to keep interviews focused and respectful of participants&apos; time.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="timeboxMinutes" className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time Limit (minutes)
              </span>
            </label>
            <input
              id="timeboxMinutes"
              type="number"
              min={5}
              max={120}
              value={config.timeboxMinutes}
              onChange={(e) => handleSettingChange('timeboxMinutes', parseInt(e.target.value) || 30)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
            />
            <p className="mt-1 text-xs text-gray-500">Suggested: 15-30 minutes</p>
          </div>

          <div>
            <label htmlFor="maxTurns" className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Max Conversation Turns
              </span>
            </label>
            <input
              id="maxTurns"
              type="number"
              min={5}
              max={100}
              value={config.maxTurns}
              onChange={(e) => handleSettingChange('maxTurns', parseInt(e.target.value) || 20)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
            />
            <p className="mt-1 text-xs text-gray-500">A turn is one message exchange (user + agent)</p>
          </div>
        </div>

        {/* Text-to-Speech Toggle */}
        <div className="mt-4 flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <Volume2 className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium text-gray-900">Read Questions Aloud</p>
              <p className="text-sm text-gray-500">
                Enable text-to-speech for agent questions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSettingChange('enableTextToSpeech', !extConfig.enableTextToSpeech)}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              extConfig.enableTextToSpeech ? 'bg-brand-teal' : 'bg-gray-200'
            )}
            role="switch"
            aria-checked={extConfig.enableTextToSpeech || false}
            aria-label="Toggle text-to-speech for questions"
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                extConfig.enableTextToSpeech ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>
      </section>

      {/* Advanced/Experimental Settings */}
      <section>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex w-full items-center justify-between p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <FlaskConical className="h-5 w-5 text-purple-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Experimental Features</p>
              <p className="text-sm text-gray-500">Advanced AI capabilities</p>
            </div>
          </div>
          {showAdvanced ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>

        {showAdvanced && (
          <div className="mt-3 p-4 rounded-lg border border-purple-200 bg-purple-50">
            {/* Cross-Interview Learning */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Cross-Interview Learning</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Allow the AI to learn from patterns across all completed interviews in this instance.
                    This helps identify common themes and validate emerging patterns.
                  </p>
                  <div className="mt-2 rounded bg-purple-100 px-2 py-1 inline-block">
                    <span className="text-xs font-medium text-purple-700">Requires RAG • Experimental</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSettingChange('enableCrossInterviewLearning', !extConfig.enableCrossInterviewLearning)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ml-4',
                  extConfig.enableCrossInterviewLearning ? 'bg-purple-500' : 'bg-gray-200'
                )}
                role="switch"
                aria-checked={extConfig.enableCrossInterviewLearning || false}
                aria-label="Toggle cross-interview learning"
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    extConfig.enableCrossInterviewLearning ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            {extConfig.enableCrossInterviewLearning && (
              <div className="mt-4 p-3 rounded bg-white border border-purple-200">
                <p className="text-sm text-gray-600">
                  When enabled, the agent will use RAG (Retrieval-Augmented Generation) to:
                </p>
                <ul className="mt-2 text-sm text-gray-600 list-disc pl-5 space-y-1">
                  <li>Identify recurring patterns and themes across interviews</li>
                  <li>Validate or challenge emerging insights with new participants</li>
                  <li>Ask follow-up questions based on previous discoveries</li>
                  <li>Build a richer understanding over multiple conversations</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Save to Library */}
      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium text-gray-900">Save Configuration to Library</p>
              <p className="text-sm text-gray-500">
                Save this setup to reuse for future interview instances
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSaveToLibrary(true)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Save className="h-4 w-4" />
            Save to Library
          </button>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="pt-6 border-t">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className={cn(
            'w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-colors',
            isSaving
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-brand-teal hover:bg-teal-700'
          )}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : (
            'Save Configuration'
          )}
        </button>
      </div>

      {/* Save to Library Modal */}
      {showSaveToLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="h-6 w-6 text-brand-teal" />
              <h2 className="text-xl font-bold text-brand-dark">Save to Library</h2>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Give this configuration a name so you can easily find and reuse it later.
            </p>

            <div className="mb-6">
              <label htmlFor="library-name" className="block text-sm font-medium text-gray-700 mb-1">
                Configuration Name
              </label>
              <input
                id="library-name"
                type="text"
                value={libraryName}
                onChange={(e) => setLibraryName(e.target.value)}
                placeholder="e.g., Finance Process Discovery"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
              />
            </div>

            <div className="rounded-lg bg-gray-50 p-3 mb-4">
              <p className="text-sm text-gray-600">
                <strong>Will save:</strong> Agent type, objective, guiding questions, guardrails, and settings.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSaveToLibrary(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveToLibrary}
                disabled={!libraryName.trim()}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white',
                  !libraryName.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-brand-teal hover:bg-teal-700'
                )}
              >
                <Save className="h-4 w-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
