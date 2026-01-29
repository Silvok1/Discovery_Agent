'use client';

import { useMemo } from 'react';
import { Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import type { ConstantSumQuestion } from '@/api/contracts';

interface ConstantSumEditorProps {
  blockId: string;
  question: ConstantSumQuestion;
}

export function ConstantSumEditor({ blockId, question }: ConstantSumEditorProps) {
  const { dispatch } = useSurveyBuilder();

  const updateQuestion = (updates: Partial<ConstantSumQuestion>) => {
    dispatch({
      type: 'UPDATE_QUESTION',
      payload: { blockId, question: { ...question, ...updates } },
    });
  };

  // Calculate current total
  const currentTotal = useMemo(() => {
    return question.items.reduce((sum, item) => sum + (item.value || 0), 0);
  }, [question.items]);

  const isValidTotal = useMemo(() => {
    if (!question.mustTotal) return true;
    return currentTotal === question.mustTotal;
  }, [currentTotal, question.mustTotal]);

  const addItem = () => {
    const newItem = {
      id: `item-${crypto.randomUUID()}`,
      text: `Item ${question.items.length + 1}`,
      value: 0,
    };
    updateQuestion({ items: [...question.items, newItem] });
  };

  const deleteItem = (itemId: string) => {
    if (question.items.length <= 1) return;
    updateQuestion({ items: question.items.filter((item) => item.id !== itemId) });
  };

  const updateItemText = (itemId: string, text: string) => {
    updateQuestion({
      items: question.items.map((item) =>
        item.id === itemId ? { ...item, text } : item
      ),
    });
  };

  const updateItemValue = (itemId: string, value: number) => {
    const clampedValue = Math.max(
      question.minPerItem || 0,
      Math.min(question.maxPerItem || Infinity, value)
    );
    updateQuestion({
      items: question.items.map((item) =>
        item.id === itemId ? { ...item, value: clampedValue } : item
      ),
    });
  };

  const renderUnit = (value: number | undefined) => {
    if (!question.unit) return null;
    const displayValue = value !== undefined ? value : 0;
    if (question.unitPosition === 'before') {
      return `${question.unit}${displayValue}`;
    }
    return `${displayValue}${question.unit}`;
  };

  const renderTextBoxes = () => (
    <div className="space-y-3">
      {question.items.map((item, index) => (
        <div key={item.id} className="group relative">
          <div className="flex items-center gap-3">
            {/* Item Label */}
            <div className="flex-1">
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateItemText(item.id, e.target.value)}
                className="w-full rounded-lg border border-transparent bg-transparent px-3 py-2 text-sm hover:border-gray-200 focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                placeholder={`Item ${index + 1}`}
              />
            </div>

            {/* Value Input */}
            <div className="relative w-24">
              {question.unit && question.unitPosition === 'before' && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  {question.unit}
                </span>
              )}
              <input
                type="number"
                value={item.value || 0}
                onChange={(e) => updateItemValue(item.id, parseInt(e.target.value) || 0)}
                min={question.minPerItem}
                max={question.maxPerItem}
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm text-center focus:outline-none focus:ring-1',
                  question.unit && question.unitPosition === 'before' ? 'pl-8' : '',
                  question.unit && question.unitPosition === 'after' ? 'pr-8' : '',
                  'border-gray-300 focus:border-brand-teal focus:ring-brand-teal'
                )}
              />
              {question.unit && question.unitPosition === 'after' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  {question.unit}
                </span>
              )}
            </div>

            {/* Delete Button */}
            {question.items.length > 1 && (
              <button
                onClick={() => deleteItem(item.id)}
                className="rounded p-1.5 opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100"
                title="Delete item"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Total Row */}
      {question.showTotal && (
        <div className="flex items-center gap-3 border-t pt-3">
          <div className="flex-1 text-sm font-semibold text-gray-700">Total</div>
          <div className={cn(
            'w-24 rounded-lg border-2 px-3 py-2 text-center text-sm font-bold',
            isValidTotal ? 'border-green-500 bg-green-50 text-green-700' : 'border-yellow-500 bg-yellow-50 text-yellow-700'
          )}>
            {question.unit && question.unitPosition === 'before' ? question.unit : ''}
            {currentTotal}
            {question.unit && question.unitPosition === 'after' ? question.unit : ''}
          </div>
          <div className="w-[42px]" /> {/* Spacer for alignment */}
        </div>
      )}
    </div>
  );

  const renderBars = () => {
    const maxValue = question.mustTotal || 100;
    
    return (
      <div className="space-y-4">
        {question.items.map((item, index) => (
          <div key={item.id} className="group relative">
            <div className="mb-2 flex items-center justify-between">
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateItemText(item.id, e.target.value)}
                className="flex-1 rounded border border-transparent bg-transparent px-2 py-1 text-sm hover:border-gray-200 focus:border-brand-teal focus:outline-none"
                placeholder={`Item ${index + 1}`}
              />
              <span className="ml-2 text-sm font-semibold text-brand-teal">
                {renderUnit(item.value)}
              </span>
              {question.items.length > 1 && (
                <button
                  onClick={() => deleteItem(item.id)}
                  className="ml-2 rounded p-1 opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100"
                  title="Delete item"
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </button>
              )}
            </div>
            
            {/* Bar */}
            <div className="relative h-8 w-full rounded-lg bg-gray-200">
              <div
                className="h-full rounded-lg bg-brand-teal transition-all duration-200"
                style={{ width: `${Math.min(((item.value || 0) / maxValue) * 100, 100)}%` }}
              />
              <input
                type="range"
                min={question.minPerItem || 0}
                max={question.maxPerItem || maxValue}
                value={item.value || 0}
                onChange={(e) => updateItemValue(item.id, parseInt(e.target.value))}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>
          </div>
        ))}

        {/* Total Progress */}
        {question.showTotal && question.mustTotal && (
          <div className="mt-4 rounded-lg border bg-gray-50 p-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Total Progress</span>
              <span className={cn(
                'font-bold',
                isValidTotal ? 'text-green-600' : currentTotal > question.mustTotal ? 'text-red-600' : 'text-yellow-600'
              )}>
                {currentTotal} / {question.mustTotal}
              </span>
            </div>
            <div className="relative h-3 w-full rounded-full bg-gray-200">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  isValidTotal ? 'bg-green-500' : currentTotal > question.mustTotal ? 'bg-red-500' : 'bg-yellow-500'
                )}
                style={{ width: `${Math.min((currentTotal / question.mustTotal) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSliders = () => {
    const maxValue = question.mustTotal || 100;
    
    return (
      <div className="space-y-5">
        {question.items.map((item, index) => (
          <div key={item.id} className="group relative">
            <div className="mb-3 flex items-center justify-between">
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateItemText(item.id, e.target.value)}
                className="flex-1 rounded border border-transparent bg-transparent px-2 py-1 text-sm font-medium hover:border-gray-200 focus:border-brand-teal focus:outline-none"
                placeholder={`Item ${index + 1}`}
              />
              {question.items.length > 1 && (
                <button
                  onClick={() => deleteItem(item.id)}
                  className="ml-2 rounded p-1 opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100"
                  title="Delete item"
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">{question.minPerItem || 0}</span>
              <div className="relative flex-1">
                <input
                  type="range"
                  min={question.minPerItem || 0}
                  max={question.maxPerItem || maxValue}
                  value={item.value || 0}
                  onChange={(e) => updateItemValue(item.id, parseInt(e.target.value))}
                  className="w-full accent-brand-teal"
                  style={{ height: '6px' }}
                />
              </div>
              <span className="text-xs text-gray-500">{question.maxPerItem || maxValue}</span>
              <div className="min-w-[60px] text-right">
                <span className="rounded-md bg-brand-light px-2 py-1 text-sm font-semibold text-brand-teal">
                  {renderUnit(item.value)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Total Display */}
        {question.showTotal && (
          <div className={cn(
            'flex items-center justify-between rounded-lg border-2 p-4',
            isValidTotal ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'
          )}>
            <div className="flex items-center gap-2">
              {isValidTotal ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              <span className="text-sm font-medium text-gray-700">Total</span>
            </div>
            <div className="text-right">
              <div className={cn(
                'text-2xl font-bold',
                isValidTotal ? 'text-green-700' : 'text-yellow-700'
              )}>
                {renderUnit(currentTotal)}
              </div>
              {question.mustTotal && (
                <div className="text-xs text-gray-600">
                  {isValidTotal ? 'Target met!' : `Target: ${renderUnit(question.mustTotal)}`}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">


      {/* Render based on display format with key to force re-render */}
      <div key={question.displayFormat}>
        {question.displayFormat === 'textBoxes' && renderTextBoxes()}
        {question.displayFormat === 'bars' && renderBars()}
        {question.displayFormat === 'sliders' && renderSliders()}
      </div>

      {/* Validation Message */}
      {question.mustTotal && !isValidTotal && (
        <div className="flex items-start gap-2 rounded-lg border border-yellow-300 bg-yellow-50 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600" />
          <div className="text-xs text-yellow-800">
            <strong>Validation:</strong> Total must equal {renderUnit(question.mustTotal)}.
            {currentTotal > question.mustTotal && ` Currently ${currentTotal - question.mustTotal} over.`}
            {currentTotal < question.mustTotal && ` Currently ${question.mustTotal - currentTotal} under.`}
          </div>
        </div>
      )}

      {/* Add Item Button */}
      <button
        onClick={addItem}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-brand-teal hover:bg-brand-light hover:text-brand-teal"
      >
        <Plus className="h-4 w-4" />
        Add Item
      </button>
    </div>
  );
}
