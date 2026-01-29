import React, { createContext, useContext, useReducer, ReactNode, useEffect, useRef, useState } from 'react';
import { Survey, Block, Question, EmbeddedDataField } from '@/api/contracts';
import { DEFAULT_EMBEDDED_FIELDS } from '@/lib/logicHelpers';

type SurveyAction =
  | { type: 'SET_SURVEY'; payload: Survey }
  | { type: 'UPDATE_SURVEY'; payload: Partial<Survey> }
  | { type: 'ADD_BLOCK'; payload: Block }
  | { type: 'UPDATE_BLOCK'; payload: Block }
  | { type: 'DELETE_BLOCK'; payload: string }
  | { type: 'MOVE_BLOCK'; payload: { blockId: string; direction: 'up' | 'down' } }
  | { type: 'REORDER_BLOCK'; payload: { blockId: string; newIndex: number } }
  | { type: 'ADD_QUESTION'; payload: { blockId: string; question: Question } }
  | { type: 'UPDATE_QUESTION'; payload: { blockId: string; question: Question } }
  | { type: 'DUPLICATE_QUESTION'; payload: { blockId: string; questionId: string } }
  | { type: 'DELETE_QUESTION'; payload: { blockId: string; questionId: string } }
  | { type: 'MOVE_QUESTION'; payload: { blockId: string; questionId: string; direction: 'up' | 'down' } }
  | { type: 'REORDER_QUESTION'; payload: { sourceBlockId: string; targetBlockId: string; questionId: string; newIndex: number } }
  | { type: 'UPDATE_WELCOME_PAGE'; payload: Partial<Survey['welcomePage']> }
  | { type: 'UPDATE_CONSENT_PAGE'; payload: Partial<Survey['consentPage']> }
  | { type: 'UPDATE_THANK_YOU_PAGE'; payload: Partial<Survey['thankYouPage']> }
  | { type: 'UPDATE_LOOK_AND_FEEL'; payload: Partial<Survey['lookAndFeel']> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Survey['settings']> }
  | { type: 'ADD_EMBEDDED_FIELD'; payload: EmbeddedDataField }
  | { type: 'UPDATE_EMBEDDED_FIELD'; payload: EmbeddedDataField }
  | { type: 'DELETE_EMBEDDED_FIELD'; payload: string }
  | { type: 'UNDO' }
  | { type: 'REDO' };

interface SurveyBuilderState {
  present: Survey | null;
  past: Survey[];
  future: Survey[];
}

interface SurveyBuilderContextValue extends SurveyBuilderState {
  dispatch: React.Dispatch<SurveyAction>;
  canUndo: boolean;
  canRedo: boolean;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  lastSaved: Date | null;
}

const SurveyBuilderContext = createContext<SurveyBuilderContextValue | undefined>(undefined);

function surveyReducer(state: SurveyBuilderState, action: SurveyAction): SurveyBuilderState {
  switch (action.type) {
    case 'SET_SURVEY':
      return { present: action.payload, past: [], future: [] };

    case 'UNDO':
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      return {
        present: previous,
        past: newPast,
        future: state.present ? [state.present, ...state.future] : state.future,
      };

    case 'REDO':
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        present: next,
        past: state.present ? [...state.past, state.present] : state.past,
        future: newFuture,
      };

    default: {
      if (!state.present) return state;
      const newPresent = applyAction(state.present, action);
      if (newPresent === state.present) return state;
      return {
        present: newPresent,
        past: [...state.past, state.present].slice(-50),
        future: [],
      };
    }
  }
}

function applyAction(survey: Survey, action: SurveyAction): Survey {
  switch (action.type) {
    case 'ADD_BLOCK':
      return { ...survey, blocks: [...survey.blocks, action.payload] };

    case 'UPDATE_BLOCK': {
      const blocks = survey.blocks.map((block) =>
        block.id === action.payload.id ? action.payload : block
      );
      return { ...survey, blocks };
    }

    case 'DELETE_BLOCK':
      return { ...survey, blocks: survey.blocks.filter((block) => block.id !== action.payload) };

    case 'MOVE_BLOCK': {
      const index = survey.blocks.findIndex((b) => b.id === action.payload.blockId);
      if (index === -1) return survey;
      const newIndex = action.payload.direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= survey.blocks.length) return survey;
      const blocks = [...survey.blocks];
      [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];
      return { ...survey, blocks };
    }

    case 'REORDER_BLOCK': {
      const { blockId, newIndex } = action.payload;
      const oldIndex = survey.blocks.findIndex((b) => b.id === blockId);
      if (oldIndex === -1) return survey;
      
      const blocks = [...survey.blocks];
      const [movedBlock] = blocks.splice(oldIndex, 1);
      blocks.splice(newIndex, 0, movedBlock);
      
      return { ...survey, blocks };
    }

    case 'ADD_QUESTION': {
      const blocks = survey.blocks.map((block) =>
        block.id === action.payload.blockId
          ? { ...block, questions: [...block.questions, action.payload.question] }
          : block
      );
      return { ...survey, blocks };
    }

    case 'UPDATE_QUESTION': {
      const blocks = survey.blocks.map((block) =>
        block.id === action.payload.blockId
          ? {
              ...block,
              questions: block.questions.map((q) =>
                q.id === action.payload.question.id ? action.payload.question : q
              ),
            }
          : block
      );
      return { ...survey, blocks };
    }

    case 'DUPLICATE_QUESTION': {
      const block = survey.blocks.find((b) => b.id === action.payload.blockId);
      if (!block) return survey;
      const index = block.questions.findIndex((q) => q.id === action.payload.questionId);
      if (index === -1) return survey;
      
      const questionToDuplicate = block.questions[index];
      // Deep copy to avoid reference sharing
      const newQuestion = JSON.parse(JSON.stringify(questionToDuplicate));
      
      // Update ID and text
      newQuestion.id = crypto.randomUUID();
      newQuestion.text = `${questionToDuplicate.text} (Copy)`;
      
      // TODO: Regenerate IDs for nested items (choices, rows, etc.) to ensure uniqueness
      
      const questions = [...block.questions];
      questions.splice(index + 1, 0, newQuestion);
      
      const blocks = survey.blocks.map((b) =>
        b.id === action.payload.blockId ? { ...b, questions } : b
      );
      return { ...survey, blocks };
    }

    case 'DELETE_QUESTION': {
      const blocks = survey.blocks.map((block) =>
        block.id === action.payload.blockId
          ? { ...block, questions: block.questions.filter((q) => q.id !== action.payload.questionId) }
          : block
      );
      return { ...survey, blocks };
    }

    case 'MOVE_QUESTION': {
      const block = survey.blocks.find((b) => b.id === action.payload.blockId);
      if (!block) return survey;
      const index = block.questions.findIndex((q) => q.id === action.payload.questionId);
      if (index === -1) return survey;
      const newIndex = action.payload.direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= block.questions.length) return survey;
      const questions = [...block.questions];
      [questions[index], questions[newIndex]] = [questions[newIndex], questions[index]];
      const blocks = survey.blocks.map((b) =>
        b.id === action.payload.blockId ? { ...b, questions } : b
      );
      return { ...survey, blocks };
    }

    case 'REORDER_QUESTION': {
      const { sourceBlockId, targetBlockId, questionId, newIndex } = action.payload;
      
      // Find source block and question
      const sourceBlock = survey.blocks.find(b => b.id === sourceBlockId);
      if (!sourceBlock) return survey;
      
      const questionIndex = sourceBlock.questions.findIndex(q => q.id === questionId);
      if (questionIndex === -1) return survey;
      
      const question = sourceBlock.questions[questionIndex];
      
      // If moving within same block
      if (sourceBlockId === targetBlockId) {
        const questions = [...sourceBlock.questions];
        questions.splice(questionIndex, 1);
        questions.splice(newIndex, 0, question);
        
        const blocks = survey.blocks.map(b => 
          b.id === sourceBlockId ? { ...b, questions } : b
        );
        return { ...survey, blocks };
      }
      
      // If moving to different block
      const targetBlock = survey.blocks.find(b => b.id === targetBlockId);
      if (!targetBlock) return survey;
      
      const sourceQuestions = sourceBlock.questions.filter(q => q.id !== questionId);
      const targetQuestions = [...targetBlock.questions];
      targetQuestions.splice(newIndex, 0, question);
      
      const blocks = survey.blocks.map(b => {
        if (b.id === sourceBlockId) return { ...b, questions: sourceQuestions };
        if (b.id === targetBlockId) return { ...b, questions: targetQuestions };
        return b;
      });
      
      return { ...survey, blocks };
    }

    case 'UPDATE_WELCOME_PAGE':
      return { ...survey, welcomePage: { ...survey.welcomePage, ...action.payload } };

    case 'UPDATE_CONSENT_PAGE':
      return { ...survey, consentPage: { ...survey.consentPage, ...action.payload } };

    case 'UPDATE_THANK_YOU_PAGE':
      return { ...survey, thankYouPage: { ...survey.thankYouPage, ...action.payload } };

    case 'UPDATE_LOOK_AND_FEEL':
      return { ...survey, lookAndFeel: { ...survey.lookAndFeel, ...action.payload } };

    case 'UPDATE_SETTINGS':
      return { ...survey, settings: { ...survey.settings, ...action.payload } };

    case 'UPDATE_SURVEY':
      return { ...survey, ...action.payload };

    case 'ADD_EMBEDDED_FIELD': {
      const currentSchema = survey.embeddedDataSchema || { fields: [...DEFAULT_EMBEDDED_FIELDS], allowUndefinedFields: false };
      // Check if field already exists
      if (currentSchema.fields.some(f => f.name === action.payload.name)) {
        return survey;
      }
      return {
        ...survey,
        embeddedDataSchema: {
          ...currentSchema,
          fields: [...currentSchema.fields, action.payload],
        },
      };
    }

    case 'UPDATE_EMBEDDED_FIELD': {
      const currentSchema = survey.embeddedDataSchema || { fields: [...DEFAULT_EMBEDDED_FIELDS], allowUndefinedFields: false };
      return {
        ...survey,
        embeddedDataSchema: {
          ...currentSchema,
          fields: currentSchema.fields.map(f => 
            f.name === action.payload.name ? action.payload : f
          ),
        },
      };
    }

    case 'DELETE_EMBEDDED_FIELD': {
      const currentSchema = survey.embeddedDataSchema || { fields: [...DEFAULT_EMBEDDED_FIELDS], allowUndefinedFields: false };
      return {
        ...survey,
        embeddedDataSchema: {
          ...currentSchema,
          fields: currentSchema.fields.filter(f => f.name !== action.payload),
        },
      };
    }

    default:
      return survey;
  }
}

// Auto-save debounce delay (ms)
const AUTO_SAVE_DELAY = 2000;
const LOCAL_STORAGE_KEY = 'survey_builder_autosave';

// Get auto-saved survey from localStorage
function getAutoSavedSurvey(surveyId?: string): Survey | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = surveyId ? `${LOCAL_STORAGE_KEY}_${surveyId}` : LOCAL_STORAGE_KEY;
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.survey;
    }
  } catch (e) {
    console.error('Failed to load auto-saved survey:', e);
  }
  return null;
}

// Save survey to localStorage
function saveToLocalStorage(survey: Survey): void {
  if (typeof window === 'undefined') return;
  try {
    const key = survey.id ? `${LOCAL_STORAGE_KEY}_${survey.id}` : LOCAL_STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify({
      survey,
      savedAt: new Date().toISOString(),
    }));
  } catch (e) {
    console.error('Failed to auto-save survey:', e);
  }
}

// Clear auto-saved survey from localStorage
function clearAutoSave(surveyId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const key = surveyId ? `${LOCAL_STORAGE_KEY}_${surveyId}` : LOCAL_STORAGE_KEY;
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Failed to clear auto-save:', e);
  }
}

export function SurveyBuilderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(surveyReducer, {
    present: null,
    past: [],
    future: [],
  });

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save to localStorage when survey changes
  useEffect(() => {
    if (!state.present) return;

    setSaveStatus('unsaved');

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounced save
    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus('saving');
      saveToLocalStorage(state.present!);
      setLastSaved(new Date());
      setSaveStatus('saved');
      
      // Placeholder for API call
      // TODO: Replace with actual API call
      // surveyService.saveDraft(state.present).catch(console.error);
    }, AUTO_SAVE_DELAY);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state.present]);

  const value: SurveyBuilderContextValue = {
    ...state,
    dispatch,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    saveStatus,
    lastSaved,
  };

  return <SurveyBuilderContext.Provider value={value}>{children}</SurveyBuilderContext.Provider>;
}

export function useSurveyBuilder() {
  const context = useContext(SurveyBuilderContext);
  if (!context) {
    throw new Error('useSurveyBuilder must be used within SurveyBuilderProvider');
  }
  return context;
}
