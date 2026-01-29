'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, GripVertical, Trash2, Copy, ChevronDown, ChevronRight, ChevronUp, Filter, Settings, Scissors, Shuffle, AlertTriangle, FileText, List, Type, Hash, Grid, Sliders, MessageSquare, Image, ThumbsUp, BarChart3, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Block, Question, BlockSettings as BlockSettingsType, QuestionType } from '@/api/contracts';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';

// Question type groups for dropdown
const QUESTION_GROUPS = [
  {
    label: 'Basic',
    questions: [
      { type: 'MultipleChoice' as QuestionType, label: 'Multiple Choice', icon: List },
      { type: 'TextEntry' as QuestionType, label: 'Text Entry', icon: Type },
      { type: 'TextGraphic' as QuestionType, label: 'Text/Graphic', icon: MessageSquare },
    ],
  },
  {
    label: 'Advanced',
    questions: [
      { type: 'MatrixTable' as QuestionType, label: 'Matrix Table', icon: Grid },
      { type: 'Slider' as QuestionType, label: 'Slider', icon: Sliders },
      { type: 'RankOrder' as QuestionType, label: 'Rank Order', icon: BarChart3 },
      { type: 'ConstantSum' as QuestionType, label: 'Constant Sum', icon: Hash },
      { type: 'SideBySide' as QuestionType, label: 'Side by Side', icon: Layers },
    ],
  },
  {
    label: 'Specialized',
    questions: [
      { type: 'NetPromoter' as QuestionType, label: 'Net Promoter Score', icon: ThumbsUp },
      { type: 'HotSpot' as QuestionType, label: 'Hot Spot', icon: Image },
      { type: 'Heatmap' as QuestionType, label: 'Heat Map', icon: Grid },
      { type: 'FormField' as QuestionType, label: 'Form Field', icon: Type },
      { type: 'PickGroupRank' as QuestionType, label: 'Pick/Group/Rank', icon: Layers },
    ],
  },
];

interface AddQuestionDropdownProps {
  blockId: string;
  onAddQuestion: (blockId: string, type: string) => void;
}

function AddQuestionDropdown({ blockId, onAddQuestion }: AddQuestionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (type: QuestionType) => {
    onAddQuestion(blockId, type);
    setIsOpen(false);
  };

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm text-gray-500 transition-colors hover:border-brand-teal hover:text-brand-teal"
      >
        <Plus className="h-4 w-4" />
        Add Question
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="max-h-80 overflow-y-auto p-1">
            {QUESTION_GROUPS.map((group, groupIndex) => (
              <div key={group.label}>
                {groupIndex > 0 && <div className="my-1 border-t border-gray-100" />}
                <div className="px-2 py-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {group.label}
                  </p>
                </div>
                {group.questions.map((q) => {
                  const Icon = q.icon;
                  return (
                    <button
                      key={q.type}
                      onClick={() => handleSelect(q.type)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-brand-light hover:text-brand-teal"
                    >
                      <Icon className="h-4 w-4" />
                      {q.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { MultipleChoiceEditor } from './questions/editors/MultipleChoiceEditor';
import { TextEntryEditor } from './questions/editors/TextEntryEditor';
import { NetPromoterEditor } from './questions/editors/NetPromoterEditor';
import { MatrixTableEditor } from './questions/editors/MatrixTableEditor';
import { ConstantSumEditor } from './questions/editors/ConstantSumEditor';
import { FormFieldEditor } from './questions/editors/FormFieldEditor';
import { HeatMapEditor } from './questions/editors/HeatMapEditor';
import { TextGraphicEditor } from './questions/editors/TextGraphicEditor';
import { SliderEditor } from './questions/editors/SliderEditor';
import { HotSpotEditor } from './questions/editors/HotSpotEditor';
import { RankOrderEditor } from './questions/editors/RankOrderEditor';
import { PickGroupRankEditor } from './questions/editors/PickGroupRankEditor';
import { SideBySideEditor } from './questions/editors/SideBySideEditor';

interface BlockCanvasProps {
  block: Block;
  blockIndex: number;
  selectedQuestionId: string | null;
  onSelectQuestion: (questionId: string | null) => void;
  onUpdateBlock: (block: Block) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddQuestion: (blockId: string, type: string) => void;
  onUpdateQuestion: (blockId: string, question: Question) => void;
  onDeleteQuestion: (blockId: string, questionId: string) => void;
}

function SortableQuestion({
  question,
  questionIndex,
  totalQuestions,
  blockId,
  isSelected,
  onSelect,
  onOpenSettings,
}: {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  blockId: string;
  isSelected: boolean;
  onSelect: () => void;
  onOpenSettings: () => void;
}) {
  const { dispatch } = useSurveyBuilder();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
    data: { type: 'question', blockId, question, questionIndex },
  });

  // Droppable for top half of question (insert before)
  const { setNodeRef: setTopDropRef, isOver: isOverTop } = useDroppable({
    id: `question-top-${question.id}`,
    data: { type: 'question-drop', blockId, questionIndex: questionIndex },
  });

  // Droppable for bottom half of question (insert after)
  const { setNodeRef: setBottomDropRef, isOver: isOverBottom } = useDroppable({
    id: `question-bottom-${question.id}`,
    data: { type: 'question-drop', blockId, questionIndex: questionIndex + 1 },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleTextChange = (content: string) => {
    dispatch({
      type: 'UPDATE_QUESTION',
      payload: { blockId, question: { ...question, text: content } },
    });
  };

  const handleDelete = () => {
    if (confirm('Delete this question?')) {
      dispatch({ type: 'DELETE_QUESTION', payload: { blockId, questionId: question.id } });
    }
  };

  const handleDuplicate = () => {
    dispatch({
      type: 'DUPLICATE_QUESTION',
      payload: { blockId, questionId: question.id },
    });
  };

  const handleMoveUp = () => {
    dispatch({
      type: 'MOVE_QUESTION',
      payload: { blockId, questionId: question.id, direction: 'up' },
    });
  };

  const handleMoveDown = () => {
    dispatch({
      type: 'MOVE_QUESTION',
      payload: { blockId, questionId: question.id, direction: 'down' },
    });
  };

  // Special rendering for Page Break
  if (question.type === 'PageBreak') {
    return (
      <div
        ref={(node) => {
          setNodeRef(node);
          // Also set as combined droppable ref
        }}
        style={style}
        onClick={onSelect}
        className={cn(
          'group relative my-4 flex items-center justify-center py-2',
          isSelected ? 'ring-2 ring-brand-teal/20' : '',
          (isOverTop || isOverBottom) && 'ring-2 ring-brand-teal/50'
        )}
      >
        {/* Drop indicators */}
        {isOverTop && <div className="absolute -top-2 left-0 right-0 h-1 bg-brand-teal rounded-full z-10" />}
        {isOverBottom && <div className="absolute -bottom-2 left-0 right-0 h-1 bg-brand-teal rounded-full z-10" />}
        
        {/* Drop zones - positioned absolutely to cover full height */}
        <div ref={setTopDropRef} className="absolute top-0 left-0 right-0 h-1/2 z-[1]" />
        <div ref={setBottomDropRef} className="absolute bottom-0 left-0 right-0 h-1/2 z-[1]" />

        {/* Visual Separator - with higher z-index so drag handle is accessible */}
        <div className="relative z-[5] flex w-full items-center">
          <div className="flex-1 border-t-2 border-dashed border-gray-300" />
          <div className="mx-4 flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1 shadow-sm">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
              title="Drag to reorder"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-3 w-3" />
            </button>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Page Break</span>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              className="ml-1 text-gray-400 hover:text-red-600"
              title="Delete page break"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
          <div className="flex-1 border-t-2 border-dashed border-gray-300" />
        </div>
      </div>
    );
  }

  // Render the appropriate editor based on question type
  const renderEditor = () => {
    switch (question.type) {
      case 'MultipleChoice':
        return <MultipleChoiceEditor blockId={blockId} question={question} />;
      case 'TextEntry':
        return <TextEntryEditor blockId={blockId} question={question} />;
      case 'NetPromoter':
        return <NetPromoterEditor blockId={blockId} question={question} />;
      case 'MatrixTable':
        return <MatrixTableEditor blockId={blockId} question={question} />;
      case 'ConstantSum':
        return <ConstantSumEditor blockId={blockId} question={question} />;
      case 'FormField':
        return <FormFieldEditor blockId={blockId} question={question} />;
      case 'Heatmap':
        return <HeatMapEditor blockId={blockId} question={question} />;
      case 'TextGraphic':
        return <TextGraphicEditor blockId={blockId} question={question} />;
      case 'Slider':
        return <SliderEditor blockId={blockId} question={question} />;
      case 'HotSpot':
        return <HotSpotEditor blockId={blockId} question={question} />;
      case 'RankOrder':
        return <RankOrderEditor blockId={blockId} question={question} />;
      case 'PickGroupRank':
        return <PickGroupRankEditor blockId={blockId} question={question} />;
      case 'SideBySide':
        return <SideBySideEditor blockId={blockId} question={question} />;
      default:
        // Type assertion for exhaustiveness - this should never be reached
        const _exhaustiveCheck: never = question;
        return <div className="text-sm text-gray-500">Editor for this question type coming soon.</div>;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        'group relative rounded-lg border bg-white transition-all',
        isSelected
          ? 'border-brand-teal ring-2 ring-brand-teal/20'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm',
        (isOverTop || isOverBottom) && 'ring-2 ring-brand-teal/50'
      )}
    >
      {/* Top drop indicator */}
      {isOverTop && (
        <div className="absolute -top-2 left-0 right-0 h-1 bg-brand-teal rounded-full z-10" />
      )}
      
      {/* Bottom drop indicator */}
      {isOverBottom && (
        <div className="absolute -bottom-2 left-0 right-0 h-1 bg-brand-teal rounded-full z-10" />
      )}

      {/* Top drop zone (invisible, covers top half) */}
      <div 
        ref={setTopDropRef}
        className="absolute top-0 left-0 right-0 h-1/2 z-[1]"
      />
      
      {/* Bottom drop zone (invisible, covers bottom half) */}
      <div 
        ref={setBottomDropRef}
        className="absolute bottom-0 left-0 right-0 h-1/2 z-[1]"
      />

      {/* Header Bar with Drag Handle and Actions */}
      <div className="relative z-[2] flex items-center justify-between border-b bg-gray-50 px-3 py-2">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          
          <span className="text-xs font-medium text-gray-500">Q{questionIndex + 1}</span>
          <span className="rounded bg-brand-light px-1.5 py-0.5 text-xs text-brand-teal">
            {question.type}
          </span>
          {question.required && (
            <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600">Required</span>
          )}
          {question.displayLogic?.enabled && (
            <span className="flex items-center gap-1 rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-600" title="Has display logic">
              <Filter className="h-3 w-3" />
              Logic
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); handleMoveUp(); }}
            disabled={questionIndex === 0}
            className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 disabled:text-gray-300 disabled:hover:bg-transparent"
            title="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleMoveDown(); }}
            disabled={questionIndex === totalQuestions - 1}
            className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 disabled:text-gray-300 disabled:hover:bg-transparent"
            title="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDuplicate(); }}
            className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            title="Duplicate question"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onOpenSettings(); }}
            className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            title="Question settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
            title="Delete question"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Question Content - Editable */}
      <div className="relative z-[2] p-4">
        {/* Question Text - Rich Text Editor */}
        <div className="mb-4" onClick={(e) => { 
          e.stopPropagation(); 
          // Select question when clicking in the editor area
          onSelect();
        }}>
          <RichTextEditor
            content={question.text}
            onChange={handleTextChange}
            placeholder="Type your question here..."
            minHeight={100}
          />
        </div>
        
        {/* Question-specific Editor */}
        <div onClick={(e) => { 
          e.stopPropagation(); 
          // Select question when clicking in the editor area
          onSelect();
        }}>
          {renderEditor()}
        </div>
      </div>
    </div>
  );
}

export function BlockCanvas({
  block,
  blockIndex,
  selectedQuestionId,
  onSelectQuestion,
  onUpdateBlock,
  onDeleteBlock,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
}: BlockCanvasProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [blockName, setBlockName] = useState(block.name);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: { type: 'block', blockId: block.id },
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `block-drop-${block.id}`,
    data: { type: 'block-drop', blockId: block.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleNameSubmit = () => {
    setIsEditing(false);
    if (blockName.trim() !== block.name) {
      onUpdateBlock({ ...block, name: blockName.trim() || 'Untitled Block' });
    }
  };

  // Open the right panel settings for a question
  const handleOpenSettings = (questionId: string) => {
    onSelectQuestion(questionId);
  };

  // Update block settings
  const updateBlockSettings = (updates: Partial<BlockSettingsType>) => {
    const currentSettings = block.settings || {};
    onUpdateBlock({ ...block, settings: { ...currentSettings, ...updates } });
  };

  // Get current block settings
  const blockSettings = block.settings || {};
  const hasBlockConfig = block.settings?.randomizeQuestions || block.settings?.startOnNewPage || 
                        block.settings?.requiredQuestions === 'all';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-xl border-2 transition-colors mb-6',
        isOver ? 'border-brand-teal bg-brand-light/20' : 'border-gray-200 bg-white'
      )}
    >
      {/* Block Header */}
      <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            title="Drag to reorder block"
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded p-1 hover:bg-gray-200"
            title={isExpanded ? "Collapse block" : "Expand block"}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400">Block {blockIndex + 1}</span>
            {isEditing ? (
              <input
                type="text"
                value={blockName}
                onChange={(e) => setBlockName(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                className="rounded border border-gray-300 px-2 py-1 text-sm font-semibold focus:border-brand-teal focus:outline-none"
                autoFocus
                title="Block name"
              />
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm font-semibold text-brand-dark hover:text-brand-teal"
                title="Click to edit block name"
              >
                {block.name}
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Block indicators */}
          {blockSettings.randomizeQuestions && (
            <span className="flex items-center gap-1 rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-600" title="Questions randomized">
              <Shuffle className="h-3 w-3" />
            </span>
          )}
          {blockSettings.startOnNewPage && (
            <span className="flex items-center gap-1 rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-600" title="Starts on new page">
              <FileText className="h-3 w-3" />
            </span>
          )}
          {block.displayLogic?.enabled && (
            <span className="flex items-center gap-1 rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-600" title="Has display logic">
              <Filter className="h-3 w-3" />
            </span>
          )}
          <span className="text-xs text-gray-500">{block.questions.length} questions</span>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "rounded p-1 hover:bg-gray-200",
              showSettings ? "bg-gray-200 text-brand-teal" : "text-gray-400 hover:text-gray-600"
            )}
            title="Block settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDeleteBlock(block.id)}
            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
            title="Delete block"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Block Settings Panel (collapsible) */}
      {showSettings && (
        <div className="border-b bg-gray-50 p-4">
          <div className="space-y-4">
            {/* Randomization */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Randomize Questions</label>
                <p className="text-xs text-gray-500">Present questions in this block in random order</p>
              </div>
              <button
                onClick={() => updateBlockSettings({ randomizeQuestions: !blockSettings.randomizeQuestions })}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  blockSettings.randomizeQuestions ? 'bg-brand-teal' : 'bg-gray-300'
                )}
                title={blockSettings.randomizeQuestions ? "Disable randomization" : "Enable randomization"}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
                    blockSettings.randomizeQuestions ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            {/* Randomize Options */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Randomize Answer Options</label>
                <p className="text-xs text-gray-500">Randomize choices for all questions in this block</p>
              </div>
              <button
                onClick={() => updateBlockSettings({ randomizeOptions: !blockSettings.randomizeOptions })}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  blockSettings.randomizeOptions ? 'bg-brand-teal' : 'bg-gray-300'
                )}
                title={blockSettings.randomizeOptions ? "Disable option randomization" : "Enable option randomization"}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
                    blockSettings.randomizeOptions ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            {/* Start on New Page */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Start on New Page</label>
                <p className="text-xs text-gray-500">Begin this block on a new survey page</p>
              </div>
              <button
                onClick={() => updateBlockSettings({ startOnNewPage: !blockSettings.startOnNewPage })}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  blockSettings.startOnNewPage ? 'bg-brand-teal' : 'bg-gray-300'
                )}
                title={blockSettings.startOnNewPage ? "Disable start on new page" : "Enable start on new page"}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
                    blockSettings.startOnNewPage ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            {/* Required Questions */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Required Questions</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`required-${block.id}`}
                    checked={!blockSettings.requiredQuestions || blockSettings.requiredQuestions === 'inherit'}
                    onChange={() => updateBlockSettings({ requiredQuestions: 'inherit', minRequired: undefined })}
                    className="h-4 w-4 text-brand-teal"
                  />
                  <span className="text-sm text-gray-600">Use individual question settings</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`required-${block.id}`}
                    checked={blockSettings.requiredQuestions === 'all'}
                    onChange={() => updateBlockSettings({ requiredQuestions: 'all' })}
                    className="h-4 w-4 text-brand-teal"
                  />
                  <span className="text-sm text-gray-600">All questions required</span>
                </label>
              </div>
            </div>

            {/* Block Display Logic Info */}
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Block Display Logic</p>
                  <p className="text-xs text-gray-500">
                    To add display logic for the entire block, click the block name in the left sidebar
                    and configure conditions in the right panel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Questions */}
      {isExpanded && (
        <div ref={setDroppableRef} className="p-4">
          {block.questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-12">
              <p className="text-sm text-gray-500">Drag a question type here</p>
              <p className="text-xs text-gray-400">or click a type from the sidebar</p>
            </div>
          ) : (
            <SortableContext
              items={block.questions.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {block.questions.map((question, idx) => (
                  <SortableQuestion
                    key={question.id}
                    question={question}
                    questionIndex={idx}
                    totalQuestions={block.questions.length}
                    blockId={block.id}
                    isSelected={selectedQuestionId === question.id}
                    onSelect={() => onSelectQuestion(question.id)}
                    onOpenSettings={() => handleOpenSettings(question.id)}
                  />
                ))}
              </div>
            </SortableContext>
          )}

          {/* Add Question Button */}
          <div className="mt-4 flex gap-2">
            <AddQuestionDropdown blockId={block.id} onAddQuestion={onAddQuestion} />
            <button
              onClick={() => onAddQuestion(block.id, 'PageBreak')}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 transition-colors hover:border-brand-teal hover:text-brand-teal"
              title="Add Page Break"
            >
              <Scissors className="h-4 w-4" />
              Page Break
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface BuilderCanvasProps {
  blocks: Block[];
  selectedQuestionId: string | null;
  onSelectQuestion: (questionId: string | null) => void;
  onAddBlock: () => void;
  onUpdateBlock: (block: Block) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddQuestion: (blockId: string, type: string) => void;
  onUpdateQuestion: (blockId: string, question: Question) => void;
  onDeleteQuestion: (blockId: string, questionId: string) => void;
}

export function BuilderCanvas({
  blocks,
  selectedQuestionId,
  onSelectQuestion,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
}: BuilderCanvasProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white py-16">
            <p className="text-gray-500">No blocks yet</p>
            <button
              onClick={onAddBlock}
              className="mt-3 flex items-center gap-2 rounded-lg bg-brand-teal px-4 py-2 text-sm text-white hover:bg-teal-700"
            >
              <Plus className="h-4 w-4" />
              Add Block
            </button>
          </div>
        ) : (
          <SortableContext
            items={blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            {blocks.map((block, idx) => (
              <BlockCanvas
                key={block.id}
                block={block}
                blockIndex={idx}
                selectedQuestionId={selectedQuestionId}
                onSelectQuestion={onSelectQuestion}
                onUpdateBlock={onUpdateBlock}
                onDeleteBlock={onDeleteBlock}
                onAddQuestion={onAddQuestion}
                onUpdateQuestion={onUpdateQuestion}
                onDeleteQuestion={onDeleteQuestion}
              />
            ))}
          </SortableContext>
        )}
        {blocks.length > 0 && (
          <button
            onClick={onAddBlock}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white py-6 text-sm text-gray-500 transition-colors hover:border-brand-teal hover:text-brand-teal"
          >
            <Plus className="h-4 w-4" />
            Add Block
          </button>
        )}
      </div>
    </div>
  );
}
