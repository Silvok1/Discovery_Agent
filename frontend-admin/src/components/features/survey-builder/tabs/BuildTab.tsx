'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  CollisionDetection,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import { useTrash } from '@/contexts/TrashContext';
import { BuilderLeftSidebar } from '../BuilderLeftSidebar';
import { BuilderCanvas } from '../BuilderCanvas';
import { BuilderRightPanel } from '../BuilderRightPanel';
import { Block, Question, MultipleChoiceQuestion, QuestionType } from '@/api/contracts';

export function BuildTab() {
  const { present, dispatch } = useSurveyBuilder();
  const { addToTrash } = useTrash();
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Custom collision detection for nested sortables
  const collisionDetection: CollisionDetection = (args) => {
    // Use closestCenter for most reliable collision detection
    const closestCenterCollision = closestCenter(args);
    
    // Fallback to pointerWithin if closestCenter returns no results
    if (!closestCenterCollision || closestCenterCollision.length === 0) {
      return pointerWithin(args);
    }
    
    return closestCenterCollision;
  };

  // Find selected question
  const selectedQuestion = present?.blocks
    .flatMap((b) => b.questions)
    .find((q) => q.id === selectedQuestionId) || null;

  // Find block containing selected question
  const selectedBlockId = present?.blocks.find((b) =>
    b.questions.some((q) => q.id === selectedQuestionId)
  )?.id;

  const handleAddBlock = useCallback(() => {
    const newBlock: Block = {
      id: crypto.randomUUID(),
      name: 'New Block',
      questions: [],
    };
    dispatch({ type: 'ADD_BLOCK', payload: newBlock });
  }, [dispatch]);

  const handleUpdateBlock = useCallback(
    (block: Block) => {
      dispatch({ type: 'UPDATE_BLOCK', payload: block });
    },
    [dispatch]
  );

  const handleDeleteBlock = useCallback(
    (blockId: string) => {
      // Find the block to save to trash
      const blockToDelete = present?.blocks.find((b) => b.id === blockId);
      if (blockToDelete) {
        addToTrash({ type: 'block', data: blockToDelete });
      }
      dispatch({ type: 'DELETE_BLOCK', payload: blockId });
      if (selectedBlockId === blockId) {
        setSelectedQuestionId(null);
      }
    },
    [dispatch, selectedBlockId, present?.blocks, addToTrash]
  );

  const handleAddQuestion = useCallback(
    (blockId: string, type: string) => {
      const questionType = type as QuestionType;
      const newQuestion = createDefaultQuestion(questionType);
      dispatch({
        type: 'ADD_QUESTION',
        payload: { blockId, question: newQuestion },
      });
      setSelectedQuestionId(newQuestion.id);
    },
    [dispatch]
  );

  const handleUpdateQuestion = useCallback(
    (question: Question) => {
      if (!selectedBlockId) return;
      dispatch({
        type: 'UPDATE_QUESTION',
        payload: { blockId: selectedBlockId, question },
      });
    },
    [dispatch, selectedBlockId]
  );

  const handleDeleteQuestion = useCallback(
    (questionId: string) => {
      if (!selectedBlockId) return;
      // Find the question to save to trash
      const questionToDelete = present?.blocks
        .flatMap((b) => b.questions)
        .find((q) => q.id === questionId);
      if (questionToDelete) {
        addToTrash({ type: 'question', data: questionToDelete, originalBlockId: selectedBlockId });
      }
      dispatch({
        type: 'DELETE_QUESTION',
        payload: { blockId: selectedBlockId, questionId },
      });
      setSelectedQuestionId(null);
    },
    [dispatch, selectedBlockId, present?.blocks, addToTrash]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !present) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Handle new question from sidebar dropped on a block
    if (activeData?.type === 'new-question' && overData?.type === 'block') {
      const questionType = activeData.questionType as QuestionType;
      const blockId = overData.blockId;
      const newQuestion = createDefaultQuestion(questionType);
      dispatch({
        type: 'ADD_QUESTION',
        payload: { blockId, question: newQuestion },
      });
      setSelectedQuestionId(newQuestion.id);
      return;
    }

    // Handle new question from sidebar dropped on an existing question (insert before)
    if (activeData?.type === 'new-question' && overData?.type === 'question-drop') {
      const questionType = activeData.questionType as QuestionType;
      const blockId = overData.blockId;
      const targetIndex = overData.questionIndex;
      const newQuestion = createDefaultQuestion(questionType);
      
      // Get the block and insert at specific position
      const block = present?.blocks.find(b => b.id === blockId);
      if (block) {
        const questions = [...block.questions];
        questions.splice(targetIndex, 0, newQuestion); // Insert at target index
        dispatch({
          type: 'UPDATE_BLOCK',
          payload: { ...block, questions },
        });
        setSelectedQuestionId(newQuestion.id);
      }
      return;
    }

    // Handle reordering existing questions (within same block or between blocks)
    if (activeData?.type === 'question') {
      const sourceBlockId = activeData.blockId;
      const questionId = activeData.question.id;
      
      let targetBlockId: string | null = null;
      let newIndex = 0;

      if (overData?.type === 'question') {
        targetBlockId = overData.blockId;
        newIndex = overData.questionIndex;
      } else if (overData?.type === 'question-drop') {
        targetBlockId = overData.blockId;
        newIndex = overData.questionIndex;
      } else if (overData?.type === 'block' || overData?.type === 'block-drop') {
        targetBlockId = overData.blockId;
        const targetBlock = present.blocks.find(b => b.id === targetBlockId);
        newIndex = targetBlock ? targetBlock.questions.length : 0;
      }

      if (targetBlockId) {
        dispatch({
          type: 'REORDER_QUESTION',
          payload: { sourceBlockId, targetBlockId, questionId, newIndex }
        });
      }
    }

    // Handle reordering blocks
    if (activeData?.type === 'block') {
      const blockId = activeData.blockId;
      let newIndex = -1;

      if (overData?.type === 'block') {
        const overBlockId = overData.blockId;
        const overIndex = present.blocks.findIndex(b => b.id === overBlockId);
        if (overIndex !== -1) {
          newIndex = overIndex;
        }
      }

      if (newIndex !== -1) {
        dispatch({
          type: 'REORDER_BLOCK',
          payload: { blockId, newIndex }
        });
      }
    }
  };

  if (!present) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-[calc(100vh-180px)]">
        {/* Left Sidebar - Add Content */}
        <BuilderLeftSidebar />

        {/* Center - Canvas */}
        <BuilderCanvas
          blocks={present.blocks}
          selectedQuestionId={selectedQuestionId}
          onSelectQuestion={setSelectedQuestionId}
          onAddBlock={handleAddBlock}
          onUpdateBlock={handleUpdateBlock}
          onDeleteBlock={handleDeleteBlock}
          onAddQuestion={handleAddQuestion}
          onUpdateQuestion={(blockId, question) => {
            dispatch({ type: 'UPDATE_QUESTION', payload: { blockId, question } });
          }}
          onDeleteQuestion={(blockId, questionId) => {
            // Find the question to save to trash
            const questionToDelete = present.blocks
              .flatMap((b) => b.questions)
              .find((q) => q.id === questionId);
            if (questionToDelete) {
              addToTrash({ type: 'question', data: questionToDelete, originalBlockId: blockId });
            }
            dispatch({ type: 'DELETE_QUESTION', payload: { blockId, questionId } });
            if (selectedQuestionId === questionId) {
              setSelectedQuestionId(null);
            }
          }}
        />

        {/* Right Panel - Settings */}
        <BuilderRightPanel
          key={selectedQuestionId || 'no-selection'}
          selectedQuestion={selectedQuestion}
          allQuestions={present.blocks.flatMap((b) => b.questions)}
          onUpdateQuestion={handleUpdateQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onClose={() => setSelectedQuestionId(null)}
        />
      </div>

      {/* Drag Overlay */}
      <DragOverlay dropAnimation={null}>
        {activeId && activeId.startsWith('new-question-') && (
          <div className="rounded-lg border border-brand-teal bg-white px-4 py-2 shadow-lg">
            <span className="text-sm font-medium text-brand-teal">
              {getQuestionTypeLabel(activeId.replace('new-question-', '') as QuestionType)}
            </span>
          </div>
        )}
        {activeId && !activeId.startsWith('new-question-') && (
          (() => {
             const isBlock = activeId.startsWith('block-');
             const question = !isBlock ? present.blocks.flatMap(b => b.questions).find(q => q.id === activeId) : null;
             const isPageBreak = question?.type === 'PageBreak';

             if (isPageBreak) {
                return (
                  <div className="w-[600px] flex items-center justify-center py-4 opacity-90">
                    <div className="w-full border-b-2 border-dashed border-gray-400 relative flex justify-center">
                      <span className="bg-gray-100 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Page Break
                      </span>
                    </div>
                  </div>
                );
             }

             return (
              <div className="w-[600px] rounded-lg border border-brand-teal bg-white p-4 shadow-xl opacity-90">
                 <div className="flex items-center gap-2 border-b pb-2 mb-2">
                    <span className="text-xs font-medium text-gray-500">
                      {isBlock ? 'Moving Block' : 'Moving Question'}
                    </span>
                 </div>
                 <div className="text-sm text-gray-700 truncate">
                   {isBlock 
                      ? (present.blocks.find(b => b.id === activeId)?.name || 'Block')
                      : (question?.text?.replace(/<[^>]*>/g, '') || 'Question')
                   }
                 </div>
              </div>
             );
          })()
        )}
      </DragOverlay>
    </DndContext>
  );
}

// Helper to get friendly label for question type
function getQuestionTypeLabel(type: QuestionType): string {
  const labels: Record<QuestionType, string> = {
    MultipleChoice: 'Multiple Choice',
    TextEntry: 'Text Entry',
    MatrixTable: 'Matrix Table',
    SideBySide: 'Side by Side',
    Slider: 'Slider',
    RankOrder: 'Rank Order',
    ConstantSum: 'Constant Sum',
    PickGroupRank: 'Pick, Group, Rank',
    NetPromoter: 'Reputation Index',
    TextGraphic: 'Text / Graphic',
    HotSpot: 'Hot Spot',
    Heatmap: 'Heat Map',
    FormField: 'Form Field',
    PageBreak: 'Page Break',
  };
  return labels[type] || type;
}

// Helper function to create default questions
function createDefaultQuestion(type: QuestionType): Question {
  const baseQuestion = {
    id: crypto.randomUUID(),
    text: '',
    required: false,
    type,
  };

  switch (type) {
    case 'MultipleChoice':
      return {
        ...baseQuestion,
        type: 'MultipleChoice',
        allowMultiple: false,
        displayFormat: 'vertical',
        choices: [
          { id: crypto.randomUUID(), text: 'Option 1' },
          { id: crypto.randomUUID(), text: 'Option 2' },
          { id: crypto.randomUUID(), text: 'Option 3' },
        ],
      } as MultipleChoiceQuestion;

    case 'TextEntry':
      return {
        ...baseQuestion,
        type: 'TextEntry',
        format: 'singleLine',
      };

    case 'TextGraphic':
      return {
        ...baseQuestion,
        type: 'TextGraphic',
        contentType: 'text',
        content: '<p>Enter your content here...</p>',
      };

    case 'Slider':
      return {
        ...baseQuestion,
        type: 'Slider',
        displayType: 'sliders',
        statements: [
          { id: crypto.randomUUID(), text: 'Statement 1' },
        ],
        min: 0,
        max: 100,
        decimals: 0,
        snapToIncrements: false,
        showValue: true,
        allowNA: false,
      };

    case 'MatrixTable':
      return {
        ...baseQuestion,
        type: 'MatrixTable',
        variation: 'likert',
        allowMultiple: false,
        rows: [
          { id: crypto.randomUUID(), text: 'Row 1' },
          { id: crypto.randomUUID(), text: 'Row 2' },
        ],
        columns: [
          { id: crypto.randomUUID(), text: 'Strongly Disagree', value: 1 },
          { id: crypto.randomUUID(), text: 'Disagree', value: 2 },
          { id: crypto.randomUUID(), text: 'Neutral', value: 3 },
          { id: crypto.randomUUID(), text: 'Agree', value: 4 },
          { id: crypto.randomUUID(), text: 'Strongly Agree', value: 5 },
        ],
      };

    case 'HotSpot':
      return {
        ...baseQuestion,
        type: 'HotSpot',
        mode: 'onOff',
        regions: [],
        showRegionOutlines: false,
      };

    case 'RankOrder':
      return {
        ...baseQuestion,
        type: 'RankOrder',
        format: 'dragDrop',
        items: [
          { id: crypto.randomUUID(), text: 'Item 1', rank: 1 },
          { id: crypto.randomUUID(), text: 'Item 2', rank: 2 },
          { id: crypto.randomUUID(), text: 'Item 3', rank: 3 },
        ],
        mustRankAll: false,
      };

    case 'PickGroupRank':
      return {
        ...baseQuestion,
        type: 'PickGroupRank',
        items: [
          { id: crypto.randomUUID(), text: 'Item 1' },
          { id: crypto.randomUUID(), text: 'Item 2' },
          { id: crypto.randomUUID(), text: 'Item 3' },
        ],
        groups: [
          { id: crypto.randomUUID(), name: 'Group 1' },
          { id: crypto.randomUUID(), name: 'Group 2' },
        ],
        columns: 1,
        stackItems: false,
        stackItemsInGroups: false,
      };

    case 'SideBySide':
      return {
        ...baseQuestion,
        type: 'SideBySide',
        statements: [
          { id: crypto.randomUUID(), text: 'Statement 1' },
          { id: crypto.randomUUID(), text: 'Statement 2' },
          { id: crypto.randomUUID(), text: 'Statement 3' },
        ],
        columns: [
          {
            id: crypto.randomUUID(),
            header: 'Quality',
            type: 'singleAnswer',
            choices: [
              { id: crypto.randomUUID(), text: 'Poor', value: 1 },
              { id: crypto.randomUUID(), text: 'Good', value: 2 },
              { id: crypto.randomUUID(), text: 'Excellent', value: 3 },
            ],
          },
          {
            id: crypto.randomUUID(),
            header: 'Importance',
            type: 'singleAnswer',
            choices: [
              { id: crypto.randomUUID(), text: 'Low', value: 1 },
              { id: crypto.randomUUID(), text: 'Medium', value: 2 },
              { id: crypto.randomUUID(), text: 'High', value: 3 },
            ],
          },
        ],
      };

    case 'NetPromoter':
      return {
        ...baseQuestion,
        type: 'NetPromoter',
        scalePreset: 'likelihood',
        minLabel: 'Not at all likely',
        maxLabel: 'Extremely likely',
      };

    case 'ConstantSum':
      return {
        ...baseQuestion,
        type: 'ConstantSum',
        displayFormat: 'textBoxes',
        showTotal: true,
        unitPosition: 'after',
        items: [
          { id: crypto.randomUUID(), text: 'Item 1', value: 0 },
          { id: crypto.randomUUID(), text: 'Item 2', value: 0 },
          { id: crypto.randomUUID(), text: 'Item 3', value: 0 },
        ],
      };

    case 'Heatmap':
      return {
        ...baseQuestion,
        type: 'Heatmap',
        maxClicks: 5,
        clicks: [],
        regions: [],
      };

    case 'FormField':
      return {
        ...baseQuestion,
        type: 'FormField',
        fields: [
          { id: crypto.randomUUID(), label: 'Full Name', size: 'medium', required: false },
          { id: crypto.randomUUID(), label: 'Email', size: 'medium', required: false, contentType: 'email' },
        ],
      };

    case 'PageBreak':
      return {
        ...baseQuestion,
        type: 'PageBreak',
        text: 'Page Break',
      };

    default:
      // For unimplemented types, return a placeholder
      return {
        ...baseQuestion,
        type: 'MultipleChoice',
        allowMultiple: false,
        displayFormat: 'vertical',
        choices: [{ id: crypto.randomUUID(), text: 'Option 1' }],
      } as MultipleChoiceQuestion;
  }
}

