'use client';

import { TextEntryQuestion } from '@/api/contracts';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';

interface TextEntryEditorProps {
  blockId: string;
  question: TextEntryQuestion;
}

export function TextEntryEditor({ blockId, question }: TextEntryEditorProps) {
  const { dispatch } = useSurveyBuilder();
  const { format } = question;

  const updateQuestion = (updates: Partial<TextEntryQuestion>) => {
    dispatch({
      type: 'UPDATE_QUESTION',
      payload: { blockId, question: { ...question, ...updates } },
    });
  };

  return (
    <div className="space-y-4">


      {/* Format Preview with key for switching */}
      <div key={format}>
      {format === 'singleLine' && (
        <input
          type="text"
          disabled
          className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm cursor-not-allowed"
          placeholder="Short answer text"
        />
      )}
      {format === 'password' && (
        <input
          type="password"
          disabled
          className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm cursor-not-allowed"
          placeholder="Password"
        />
      )}
      {format === 'multiLine' && (
        <textarea
          disabled
          rows={3}
          className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm cursor-not-allowed resize-none"
          placeholder="Long answer text"
        />
      )}
      {format === 'essay' && (
        <textarea
          disabled
          rows={6}
          className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm cursor-not-allowed resize-none"
          placeholder="Essay text"
        />
      )}
      </div>
    </div>
  );
}
