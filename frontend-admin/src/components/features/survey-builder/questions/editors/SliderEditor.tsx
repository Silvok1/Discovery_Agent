'use client';

import { Plus, Trash2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import type { SliderQuestion } from '@/api/contracts';

interface SliderEditorProps {
  blockId: string;
  question: SliderQuestion;
}

export function SliderEditor({ blockId, question }: SliderEditorProps) {
  const { dispatch } = useSurveyBuilder();

  const updateQuestion = (updates: Partial<SliderQuestion>) => {
    dispatch({
      type: 'UPDATE_QUESTION',
      payload: { blockId, question: { ...question, ...updates } },
    });
  };

  const addStatement = () => {
    const newStatement = {
      id: crypto.randomUUID(),
      text: `Statement ${question.statements.length + 1}`,
      value: question.defaultValue,
    };
    updateQuestion({ statements: [...question.statements, newStatement] });
  };

  const deleteStatement = (statementId: string) => {
    if (question.statements.length <= 1) return;
    updateQuestion({ statements: question.statements.filter((s) => s.id !== statementId) });
  };

  const updateStatementText = (statementId: string, text: string) => {
    updateQuestion({
      statements: question.statements.map((s) =>
        s.id === statementId ? { ...s, text } : s
      ),
    });
  };

  const updateStatementValue = (statementId: string, value: number) => {
    let finalValue = value;
    
    // Apply snap to increments if enabled
    if (question.snapToIncrements && question.increments) {
      const step = (question.max - question.min) / question.increments;
      finalValue = Math.round(value / step) * step;
    }
    
    // Apply decimal rounding
    finalValue = parseFloat(finalValue.toFixed(question.decimals));
    
    // Clamp to min/max
    finalValue = Math.max(question.min, Math.min(question.max, finalValue));

    updateQuestion({
      statements: question.statements.map((s) =>
        s.id === statementId ? { ...s, value: finalValue } : s
      ),
    });
  };

  const renderBars = (statement: SliderQuestion['statements'][0], index: number) => {
    const value = statement.value ?? question.defaultValue ?? question.min;
    const percentage = ((value - question.min) / (question.max - question.min)) * 100;

    return (
      <div key={statement.id} className="group relative space-y-2">
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={statement.text}
            onChange={(e) => updateStatementText(statement.id, e.target.value)}
            className="flex-1 rounded border border-transparent bg-transparent px-2 py-1 text-sm font-medium hover:border-gray-200 focus:border-brand-teal focus:outline-none"
            placeholder={`Statement ${index + 1}`}
          />
          {question.showValue && (
            <span className="ml-2 text-sm font-bold text-brand-teal">
              {value.toFixed(question.decimals)}
            </span>
          )}
          {question.statements.length > 1 && (
            <button
              onClick={() => deleteStatement(statement.id)}
              className="ml-2 rounded p-1 opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100"
              title="Delete statement"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Min Label */}
          {question.labels?.find((l) => l.value === question.min) && (
            <span className="text-xs text-gray-500">
              {question.labels.find((l) => l.value === question.min)?.text}
            </span>
          )}

          {/* Bar */}
          <div className="relative flex-1 h-10 rounded-lg bg-gray-200">
            <div
              className="h-full rounded-lg bg-brand-teal transition-all duration-200"
              style={{ width: `${percentage}%` }}
            />
            <input
              type="range"
              min={question.min}
              max={question.max}
              step={question.snapToIncrements && question.increments ? (question.max - question.min) / question.increments : 'any'}
              value={value}
              onChange={(e) => updateStatementValue(statement.id, parseFloat(e.target.value))}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>

          {/* Max Label */}
          {question.labels?.find((l) => l.value === question.max) && (
            <span className="text-xs text-gray-500">
              {question.labels.find((l) => l.value === question.max)?.text}
            </span>
          )}

          {/* N/A Checkbox */}
          {question.allowNA && (
            <label className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
              <input type="checkbox" className="rounded" disabled />
              {question.naLabel || 'N/A'}
            </label>
          )}
        </div>
      </div>
    );
  };

  const renderSliders = (statement: SliderQuestion['statements'][0], index: number) => {
    const value = statement.value ?? question.defaultValue ?? question.min;

    return (
      <div key={statement.id} className="group relative space-y-2">
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={statement.text}
            onChange={(e) => updateStatementText(statement.id, e.target.value)}
            className="flex-1 rounded border border-transparent bg-transparent px-2 py-1 text-sm font-medium hover:border-gray-200 focus:border-brand-teal focus:outline-none"
            placeholder={`Statement ${index + 1}`}
          />
          {question.statements.length > 1 && (
            <button
              onClick={() => deleteStatement(statement.id)}
              className="ml-2 rounded p-1 opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100"
              title="Delete statement"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">{question.min}</span>
          <div className="relative flex-1">
            <input
              type="range"
              min={question.min}
              max={question.max}
              step={question.snapToIncrements && question.increments ? (question.max - question.min) / question.increments : 'any'}
              value={value}
              onChange={(e) => updateStatementValue(statement.id, parseFloat(e.target.value))}
              className="w-full accent-brand-teal"
            />
          </div>
          <span className="text-xs text-gray-500">{question.max}</span>
          
          {question.showValue && (
            <div className="min-w-[60px] text-right">
              <span className="rounded-md bg-brand-light px-2 py-1 text-sm font-semibold text-brand-teal">
                {value.toFixed(question.decimals)}
              </span>
            </div>
          )}

          {question.allowNA && (
            <label className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
              <input type="checkbox" className="rounded" disabled />
              {question.naLabel || 'N/A'}
            </label>
          )}
        </div>
      </div>
    );
  };

  const renderStars = (statement: SliderQuestion['statements'][0], index: number) => {
    const maxStars = Math.min(question.max, 10); // Cap at 10 stars for display
    const value = statement.value ?? question.defaultValue ?? 0;
    const normalizedValue = (value / question.max) * maxStars;

    const handleStarClick = (starIndex: number) => {
      let newValue: number;
      
      switch (question.starsInteraction) {
        case 'discrete':
          newValue = ((starIndex + 1) / maxStars) * question.max;
          break;
        case 'halfStep':
          // Allow half stars
          const currentStar = Math.floor((value / question.max) * maxStars);
          if (currentStar === starIndex && normalizedValue > starIndex + 0.5) {
            newValue = ((starIndex + 0.5) / maxStars) * question.max;
          } else if (currentStar === starIndex) {
            newValue = ((starIndex + 1) / maxStars) * question.max;
          } else {
            newValue = ((starIndex + 1) / maxStars) * question.max;
          }
          break;
        case 'continuous':
        default:
          newValue = ((starIndex + 1) / maxStars) * question.max;
          break;
      }
      
      updateStatementValue(statement.id, newValue);
    };

    return (
      <div key={statement.id} className="group relative space-y-3">
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={statement.text}
            onChange={(e) => updateStatementText(statement.id, e.target.value)}
            className="flex-1 rounded border border-transparent bg-transparent px-2 py-1 text-sm font-medium hover:border-gray-200 focus:border-brand-teal focus:outline-none"
            placeholder={`Statement ${index + 1}`}
          />
          {question.statements.length > 1 && (
            <button
              onClick={() => deleteStatement(statement.id)}
              className="ml-2 rounded p-1 opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100"
              title="Delete statement"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {Array.from({ length: maxStars }).map((_, starIndex) => {
              const isFilled = normalizedValue > starIndex;
              const isHalfFilled = question.starsInteraction === 'halfStep' && 
                                   normalizedValue > starIndex && 
                                   normalizedValue < starIndex + 1;
              
              return (
                <button
                  key={starIndex}
                  onClick={() => handleStarClick(starIndex)}
                  className="transition-transform hover:scale-110"
                  type="button"
                >
                  <Star
                    className={cn(
                      'h-8 w-8 transition-colors',
                      isFilled
                        ? 'fill-yellow-400 text-yellow-400'
                        : isHalfFilled
                        ? 'fill-yellow-200 text-yellow-400'
                        : 'fill-gray-200 text-gray-300'
                    )}
                  />
                </button>
              );
            })}
          </div>

          {question.showValue && (
            <span className="ml-2 text-sm font-bold text-brand-teal">
              {value.toFixed(question.decimals)}
            </span>
          )}

          {question.allowNA && (
            <label className="ml-auto flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
              <input type="checkbox" className="rounded" disabled />
              {question.naLabel || 'N/A'}
            </label>
          )}
        </div>
      </div>
    );
  };

  const renderStatement = (statement: SliderQuestion['statements'][0], index: number) => {
    switch (question.displayType) {
      case 'bars':
        return renderBars(statement, index);
      case 'sliders':
        return renderSliders(statement, index);
      case 'stars':
        return renderStars(statement, index);
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">


      {/* Statements with key for display type switching */}
      <div key={question.displayType} className="space-y-4">
        {question.statements.map((statement, index) => renderStatement(statement, index))}
      </div>

      {/* Add Statement Button */}
      <button
        onClick={addStatement}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-brand-teal hover:bg-brand-light hover:text-brand-teal"
      >
        <Plus className="h-4 w-4" />
        Add Statement
      </button>

      {/* Helper Info */}
      <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
        <strong>Interactive Preview:</strong> Drag sliders or click stars to set values. 
        {question.snapToIncrements && question.increments && ' Snapping to increments is enabled.'}
      </div>
    </div>
  );
}
