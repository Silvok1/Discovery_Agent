'use client';

import { MultipleChoiceQuestion } from '@/api/contracts';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultipleChoiceEditorProps {
  blockId: string;
  question: MultipleChoiceQuestion;
}

export function MultipleChoiceEditor({ blockId, question }: MultipleChoiceEditorProps) {
  const { dispatch } = useSurveyBuilder();

  const updateQuestion = (updates: Partial<MultipleChoiceQuestion>) => {
    dispatch({
      type: 'UPDATE_QUESTION',
      payload: { blockId, question: { ...question, ...updates } },
    });
  };

  const addChoice = () => {
    const newChoice = {
      id: crypto.randomUUID(),
      text: `Option ${question.choices.length + 1}`,
    };
    updateQuestion({ choices: [...question.choices, newChoice] });
  };

  const updateChoice = (choiceId: string, text: string) => {
    const choices = question.choices.map((c) => (c.id === choiceId ? { ...c, text } : c));
    updateQuestion({ choices });
  };

  const deleteChoice = (choiceId: string) => {
    if (question.choices.length <= 1) return;
    const choices = question.choices.filter((c) => c.id !== choiceId);
    updateQuestion({ choices });
  };

  const isHorizontal = question.displayFormat === 'horizontal';
  const isColumns = question.displayFormat === 'columns';
  const isDropdown = question.displayFormat === 'dropdown';

  const gridStyle = isColumns
    ? {
        display: 'grid',
        gridTemplateColumns: `repeat(${question.columnCount || 2}, minmax(0, 1fr))`,
        gap: '0.5rem',
      }
    : undefined;

  if (isDropdown) {
    return (
      <div className="mt-4">
        <div className="relative">
          <select disabled className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-500 shadow-sm">
            <option>Select an option...</option>
          </select>
          <div className="mt-4 space-y-2 border-t pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dropdown Options</p>
            {question.choices.map((choice, index) => (
              <div key={choice.id} className="group flex items-center gap-2">
                <span className="text-xs text-gray-400 w-4">{index + 1}.</span>
                <input
                  type="text"
                  value={choice.text}
                  onChange={(e) => updateChoice(choice.id, e.target.value)}
                  className="flex-1 rounded border-transparent bg-transparent px-2 py-1 text-sm hover:bg-gray-100 focus:border-brand-teal focus:bg-white focus:ring-1 focus:ring-brand-teal"
                  placeholder={`Option ${index + 1}`}
                />
                <button onClick={() => deleteChoice(choice.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button onClick={addChoice} className="flex items-center gap-2 px-2 py-1 text-sm text-brand-teal hover:bg-brand-light/20 rounded">
              <Plus className="h-4 w-4" />
              Add Option
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div key={question.displayFormat} className={cn('mt-4', isHorizontal && 'flex flex-wrap gap-4', !isHorizontal && !isColumns && 'space-y-2')} style={gridStyle}>
      {question.choices.map((choice) => (
        <div key={choice.id} className={cn("group flex items-center gap-2 rounded-md border border-transparent p-1 hover:border-gray-200 hover:bg-gray-50", isHorizontal && "min-w-[200px]")}>
          <div className={cn("flex h-4 w-4 items-center justify-center border border-gray-400", question.allowMultiple ? "rounded-sm" : "rounded-full")} />
          <input
            type="text"
            value={choice.text}
            onChange={(e) => updateChoice(choice.id, e.target.value)}
            className="flex-1 bg-transparent px-2 py-1 text-sm focus:rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-teal"
            placeholder="Option text"
          />
          <button onClick={() => deleteChoice(choice.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity" title="Delete choice">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button onClick={addChoice} className={cn("flex items-center gap-2 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-brand-teal hover:text-brand-teal hover:bg-brand-light/10", isHorizontal && "min-w-[200px]")}>
        <Plus className="h-4 w-4" />
        <span className="font-medium">Add Choice</span>
      </button>
    </div>
  );
}
