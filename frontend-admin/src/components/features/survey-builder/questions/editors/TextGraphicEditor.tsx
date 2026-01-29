'use client';

import { FileText, Image as ImageIcon, Download } from 'lucide-react';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import type { TextGraphicQuestion } from '@/api/contracts';

interface TextGraphicEditorProps {
  blockId: string;
  question: TextGraphicQuestion;
}

export function TextGraphicEditor({ blockId, question }: TextGraphicEditorProps) {
  const { dispatch } = useSurveyBuilder();

  const updateQuestion = (updates: Partial<TextGraphicQuestion>) => {
    dispatch({
      type: 'UPDATE_QUESTION',
      payload: { blockId, question: { ...question, ...updates } },
    });
  };

  const renderContent = () => {
    switch (question.contentType) {
      case 'text':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Text Content</span>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <RichTextEditor
                content={question.content || ''}
                onChange={(content) => updateQuestion({ content })}
                placeholder="Enter your text content here..."
              />
            </div>
            <p className="text-xs text-gray-500">
              This content will be displayed to respondents. No response is collected.
            </p>
          </div>
        );

      case 'graphic':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ImageIcon className="h-4 w-4" />
              <span className="font-medium">Graphic Display</span>
            </div>
            {question.content ? (
              <div className="space-y-2">
                <div className="relative overflow-hidden rounded-lg border border-gray-300 bg-gray-50">
                  <img
                    src={question.content}
                    alt="Graphic content"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
                {question.caption && (
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-sm text-gray-700">{question.caption}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                <ImageIcon className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-600">No image selected</p>
                <p className="text-xs text-gray-500">Configure in settings panel →</p>
              </div>
            )}
          </div>
        );

      case 'file':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Download className="h-4 w-4" />
              <span className="font-medium">File Download</span>
            </div>
            {question.content ? (
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <a
                  href={question.content}
                  download={question.fileName || 'download'}
                  className="flex items-center gap-3 text-brand-teal hover:underline"
                >
                  <Download className="h-5 w-5" />
                  <div>
                    <div className="font-medium">
                      {question.fileName || 'Download File'}
                    </div>
                    {question.caption && (
                      <div className="text-xs text-gray-600">{question.caption}</div>
                    )}
                  </div>
                </a>
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                <Download className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-600">No file selected</p>
                <p className="text-xs text-gray-500">Configure in settings panel →</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">


      {renderContent()}
      
      <div className="rounded-lg border border-blue-300 bg-blue-50 p-3">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> This is a display-only element. No response data will be collected from respondents.
        </p>
      </div>
    </div>
  );
}
