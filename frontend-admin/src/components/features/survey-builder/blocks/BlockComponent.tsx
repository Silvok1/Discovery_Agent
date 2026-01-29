'use client';

import { Block, Question, MultipleChoiceQuestion } from '@/api/contracts';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import { ChevronUp, ChevronDown, Trash2, Plus, GripVertical } from 'lucide-react';
import { QuestionWrapper } from '../questions/QuestionWrapper';

interface BlockComponentProps {
  block: Block;
  blockIndex: number;
}

export function BlockComponent({ block, blockIndex }: BlockComponentProps) {
  const { present, dispatch } = useSurveyBuilder();

  const handleAddQuestion = () => {
    const newQuestion: MultipleChoiceQuestion = {
      id: `q-${crypto.randomUUID()}`,
      type: 'MultipleChoice',
      text: 'New Question',
      required: false,
      allowMultiple: false,
      displayFormat: 'vertical',
      choices: [
        { id: 'c1', text: 'Option 1' },
        { id: 'c2', text: 'Option 2' },
      ],
    };
    dispatch({ type: 'ADD_QUESTION', payload: { blockId: block.id, question: newQuestion } });
  };

  const handleDeleteBlock = () => {
    if (confirm('Delete this block and all its questions?')) {
      dispatch({ type: 'DELETE_BLOCK', payload: block.id });
    }
  };

  const totalBlocks = present?.blocks.length || 0;

  return (
    <div className="rounded-lg border bg-white shadow">
      <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
        <div className="flex items-center space-x-3">
          <GripVertical className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={block.name}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_BLOCK',
                payload: { ...block, name: e.target.value },
              })
            }
            className="border-none bg-transparent font-semibold text-brand-dark focus:outline-none"
            placeholder="Block Name"
          />
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() =>
              dispatch({ type: 'MOVE_BLOCK', payload: { blockId: block.id, direction: 'up' } })
            }
            disabled={blockIndex === 0}
            className="rounded p-1 text-gray-600 hover:bg-gray-200 disabled:text-gray-300"
            title="Move block up"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            onClick={() =>
              dispatch({ type: 'MOVE_BLOCK', payload: { blockId: block.id, direction: 'down' } })
            }
            disabled={blockIndex === totalBlocks - 1}
            className="rounded p-1 text-gray-600 hover:bg-gray-200 disabled:text-gray-300"
            title="Move block down"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            onClick={handleDeleteBlock}
            className="rounded p-1 text-red-600 hover:bg-red-50"
            title="Delete block"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {block.questions.length === 0 ? (
          <div className="rounded border-2 border-dashed border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-500">No questions in this block yet.</p>
          </div>
        ) : (
          block.questions.map((question, qIndex) => (
            <QuestionWrapper
              key={question.id}
              blockId={block.id}
              question={question}
              questionIndex={qIndex}
              totalQuestions={block.questions.length}
            />
          ))
        )}

        <button
          onClick={handleAddQuestion}
          className="flex w-full items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-3 text-sm text-gray-600 hover:border-brand-teal hover:text-brand-teal"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </button>
      </div>
    </div>
  );
}
