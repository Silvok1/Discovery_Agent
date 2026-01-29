'use client';

import { Question, QuestionType, MultipleChoiceQuestion, TextEntryQuestion, RankOrderQuestion, ConstantSumQuestion, MatrixTableQuestion, SliderQuestion } from '@/api/contracts';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import { ChevronUp, ChevronDown, Trash2, Copy, ChevronDown as DropdownIcon, AlertTriangle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { MultipleChoiceEditor } from './editors/MultipleChoiceEditor';
import { TextEntryEditor } from './editors/TextEntryEditor';
import { NetPromoterEditor } from './editors/NetPromoterEditor';
import { MatrixTableEditor } from './editors/MatrixTableEditor';
import { ConstantSumEditor } from './editors/ConstantSumEditor';
import { FormFieldEditor } from './editors/FormFieldEditor';
import { HeatMapEditor } from './editors/HeatMapEditor';
import { TextGraphicEditor } from './editors/TextGraphicEditor';
import { SliderEditor } from './editors/SliderEditor';
import { HotSpotEditor } from './editors/HotSpotEditor';
import { RankOrderEditor } from './editors/RankOrderEditor';
import { PickGroupRankEditor } from './editors/PickGroupRankEditor';
import { SideBySideEditor } from './editors/SideBySideEditor';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

// Define type conversion groups - types within same group can be converted
const TYPE_LABELS: Record<QuestionType, string> = {
  MultipleChoice: 'Multiple Choice',
  TextEntry: 'Text Entry',
  FormField: 'Form Field',
  MatrixTable: 'Matrix Table',
  SideBySide: 'Side-by-Side',
  Slider: 'Slider',
  RankOrder: 'Rank Order',
  ConstantSum: 'Constant Sum',
  PickGroupRank: 'Pick/Group/Rank',
  NetPromoter: 'Net Promoter',
  TextGraphic: 'Text/Graphic',
  HotSpot: 'Hot Spot',
  Heatmap: 'Heatmap',
  PageBreak: 'Page Break',
};

// Types that can be converted to each other with some data preserved
const CONVERSION_GROUPS: { types: QuestionType[]; preserveFields: string[] }[] = [
  // Choice-based questions - can share choices
  { types: ['MultipleChoice', 'RankOrder', 'ConstantSum'], preserveFields: ['choices', 'text', 'required', 'displayLogic'] },
  // Scale-based questions
  { types: ['Slider', 'NetPromoter'], preserveFields: ['text', 'required', 'displayLogic'] },
  // Text questions
  { types: ['TextEntry', 'FormField'], preserveFields: ['text', 'required', 'displayLogic'] },
  // Visual questions
  { types: ['HotSpot', 'Heatmap'], preserveFields: ['text', 'required', 'displayLogic', 'imageUrl'] },
];

function getCompatibleTypes(currentType: QuestionType): QuestionType[] {
  const group = CONVERSION_GROUPS.find(g => g.types.includes(currentType));
  if (group) {
    return group.types.filter(t => t !== currentType);
  }
  return [];
}

function convertQuestion(question: Question, targetType: QuestionType): Question {
  const baseFields = {
    id: question.id,
    text: question.text,
    description: question.description,
    required: question.required,
    validationType: question.validationType,
    displayLogic: question.displayLogic,
    skipLogic: question.skipLogic,
    randomize: question.randomize,
    dimensions: question.dimensions,
  };

  switch (targetType) {
    case 'MultipleChoice': {
      const sourceChoices = 
        question.type === 'RankOrder' ? (question as RankOrderQuestion).items.map(i => ({ id: i.id, text: i.text })) :
        question.type === 'ConstantSum' ? (question as ConstantSumQuestion).items.map(i => ({ id: i.id, text: i.text })) :
        question.type === 'MultipleChoice' ? (question as MultipleChoiceQuestion).choices :
        [{ id: crypto.randomUUID(), text: 'Option 1' }];
      
      return {
        ...baseFields,
        type: 'MultipleChoice',
        allowMultiple: false,
        choices: sourceChoices,
        displayFormat: 'vertical',
      } as MultipleChoiceQuestion;
    }
    
    case 'RankOrder': {
      const sourceItems = 
        question.type === 'MultipleChoice' ? (question as MultipleChoiceQuestion).choices.map(c => ({ id: c.id, text: c.text })) :
        question.type === 'ConstantSum' ? (question as ConstantSumQuestion).items :
        question.type === 'RankOrder' ? (question as RankOrderQuestion).items :
        [{ id: crypto.randomUUID(), text: 'Item 1' }];
      
      return {
        ...baseFields,
        type: 'RankOrder',
        items: sourceItems,
        format: 'dragDrop',
      } as RankOrderQuestion;
    }
    
    case 'ConstantSum': {
      const sourceItems = 
        question.type === 'MultipleChoice' ? (question as MultipleChoiceQuestion).choices.map(c => ({ id: c.id, text: c.text })) :
        question.type === 'RankOrder' ? (question as RankOrderQuestion).items :
        question.type === 'ConstantSum' ? (question as ConstantSumQuestion).items :
        [{ id: crypto.randomUUID(), text: 'Item 1' }];
      
      return {
        ...baseFields,
        type: 'ConstantSum',
        items: sourceItems,
        displayFormat: 'textBoxes',
        showTotal: true,
        unitPosition: 'before',
      } as ConstantSumQuestion;
    }
    
    case 'Slider': {
      return {
        ...baseFields,
        type: 'Slider',
        statements: [{ id: crypto.randomUUID(), text: 'Statement 1' }],
        displayType: 'sliders',
        min: 0,
        max: 100,
        decimals: 0,
        snapToIncrements: false,
        showValue: true,
        allowNA: false,
      } as SliderQuestion;
    }
    
    case 'NetPromoter': {
      return {
        ...baseFields,
        type: 'NetPromoter',
      } as Question;
    }
    
    case 'TextEntry': {
      return {
        ...baseFields,
        type: 'TextEntry',
        format: 'singleLine',
        validation: [],
      } as TextEntryQuestion;
    }
    
    case 'FormField': {
      return {
        ...baseFields,
        type: 'FormField',
        fields: [{ id: crypto.randomUUID(), label: 'Field 1', required: false, size: 'medium' }],
      } as Question;
    }
    
    case 'HotSpot':
    case 'Heatmap': {
      const imageUrl = 
        (question.type === 'HotSpot' || question.type === 'Heatmap') 
          ? (question as { imageUrl?: string }).imageUrl 
          : undefined;
      
      const common = {
        ...baseFields,
        type: targetType,
        imageUrl: imageUrl || '',
        regions: [],
      };

      if (targetType === 'Heatmap') {
        return {
          ...common,
          maxClicks: 1,
          clicks: [],
        } as Question;
      } else {
        return {
          ...common,
          mode: 'onOff',
        } as Question;
      }
    }
    
    default:
      return question;
  }
}

interface QuestionWrapperProps {
  blockId: string;
  question: Question;
  questionIndex: number;
  totalQuestions: number;
}

// Type conversion confirmation dialog
function ConversionDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  fromType, 
  toType 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  fromType: QuestionType; 
  toType: QuestionType;
}) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Convert Question Type</h3>
        </div>
        
        <p className="mb-4 text-sm text-gray-600">
          Converting from <span className="font-medium">{TYPE_LABELS[fromType]}</span> to{' '}
          <span className="font-medium">{TYPE_LABELS[toType]}</span> will preserve compatible 
          settings but <span className="text-amber-600 font-medium">some configuration may be lost</span>.
        </p>
        
        <p className="mb-6 text-sm text-gray-500">
          This action can be undone using Ctrl+Z.
        </p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-brand-teal px-4 py-2 text-sm font-medium text-white hover:bg-brand-teal/90"
          >
            Convert
          </button>
        </div>
      </div>
    </div>
  );
}

export function QuestionWrapper({ blockId, question, questionIndex, totalQuestions }: QuestionWrapperProps) {
  const { dispatch } = useSurveyBuilder();
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showConversionDialog, setShowConversionDialog] = useState(false);
  const [pendingConversion, setPendingConversion] = useState<QuestionType | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const compatibleTypes = getCompatibleTypes(question.type);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = () => {
    if (confirm('Delete this question?')) {
      dispatch({ type: 'DELETE_QUESTION', payload: { blockId, questionId: question.id } });
    }
  };

  const handleTextChange = (content: string) => {
    dispatch({
      type: 'UPDATE_QUESTION',
      payload: { blockId, question: { ...question, text: content } },
    });
  };

  const handleTypeConversion = (targetType: QuestionType) => {
    setPendingConversion(targetType);
    setShowConversionDialog(true);
    setShowTypeDropdown(false);
  };

  const confirmConversion = () => {
    if (pendingConversion) {
      const convertedQuestion = convertQuestion(question, pendingConversion);
      dispatch({
        type: 'UPDATE_QUESTION',
        payload: { blockId, question: convertedQuestion },
      });
    }
    setShowConversionDialog(false);
    setPendingConversion(null);
  };

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
      case 'PageBreak':
        return <div className="text-sm text-gray-500 italic">Page Break Element</div>;
      default:
        // Type assertion for exhaustiveness - this should never be reached
        const _exhaustiveCheck: never = question;
        return <div className="text-sm text-gray-500">Editor for this question type coming soon.</div>;
    }
  };

  return (
    <>
      <div className="rounded-lg border bg-white p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Q{questionIndex + 1}</span>
            {/* Type conversion dropdown */}
            {question.type !== 'PageBreak' && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTypeDropdown(!showTypeDropdown);
                  }}
                  className="flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100"
                  title="Change question type"
                >
                  {TYPE_LABELS[question.type]}
                  {compatibleTypes.length > 0 && <DropdownIcon className="h-3 w-3" />}
                </button>
                
                {showTypeDropdown && compatibleTypes.length > 0 && (
                  <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    <div className="px-3 py-1 text-xs font-medium text-gray-400">Convert to:</div>
                    {compatibleTypes.map(type => (
                      <button
                        key={type}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTypeConversion(type);
                        }}
                        className="flex w-full items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {TYPE_LABELS[type]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() =>
                dispatch({
                  type: 'MOVE_QUESTION',
                  payload: { blockId, questionId: question.id, direction: 'up' },
                })
              }
              disabled={questionIndex === 0}
              className="rounded p-1 text-gray-600 hover:bg-gray-200 disabled:text-gray-300"
              title="Move question up"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              onClick={() =>
                dispatch({
                  type: 'MOVE_QUESTION',
                  payload: { blockId, questionId: question.id, direction: 'down' },
                })
              }
              disabled={questionIndex === totalQuestions - 1}
              className="rounded p-1 text-gray-600 hover:bg-gray-200 disabled:text-gray-300"
              title="Move question down"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              onClick={() =>
                dispatch({
                  type: 'DUPLICATE_QUESTION',
                  payload: { blockId, questionId: question.id },
                })
              }
              className="rounded p-1 text-gray-600 hover:bg-gray-200"
              title="Duplicate question"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button onClick={handleDelete} className="rounded p-1 text-red-600 hover:bg-red-50" title="Delete question">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="mb-3">
          <RichTextEditor
            content={question.text}
            onChange={handleTextChange}
            placeholder="Type your question here..."
          />
        </div>
        
        {renderEditor()}
      </div>
      
      {/* Conversion confirmation dialog */}
      {pendingConversion && (
        <ConversionDialog
          isOpen={showConversionDialog}
          onClose={() => {
            setShowConversionDialog(false);
            setPendingConversion(null);
          }}
          onConfirm={confirmConversion}
          fromType={question.type}
          toType={pendingConversion}
        />
      )}
    </>
  );
}
