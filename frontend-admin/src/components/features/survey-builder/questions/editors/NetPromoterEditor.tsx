'use client';

import { NetPromoterQuestion } from '@/api/contracts';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';

interface NetPromoterEditorProps {
  blockId: string;
  question: NetPromoterQuestion;
}

export function NetPromoterEditor({ blockId, question }: NetPromoterEditorProps) {
  const { dispatch } = useSurveyBuilder();

  const updateQuestion = (updates: Partial<NetPromoterQuestion>) => {
    dispatch({
      type: 'UPDATE_QUESTION',
      payload: { blockId, question: { ...question, ...updates } },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex w-full items-center justify-between gap-2 overflow-x-auto py-4">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <div key={value} className="flex flex-col items-center gap-2 min-w-[40px]">
              <div className="flex h-10 w-10 items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                <span className="text-sm font-medium text-gray-700">{value}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between px-1 text-sm text-gray-500 font-medium">
          <span>{question.minLabel || 'Not at all likely'}</span>
          <span>{question.maxLabel || 'Extremely likely'}</span>
        </div>
      </div>
    </div>
  );
}