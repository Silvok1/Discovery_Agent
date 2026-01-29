'use client';

import { useState } from 'react';
import { Play, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InterviewConfig } from '@/api/contracts';
import { instanceService } from '@/api/services/instanceService';

interface PreviewPanelProps {
  instanceId: string;
  config: InterviewConfig;
}

export function PreviewPanel({ instanceId, config }: PreviewPanelProps) {
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewCount, setPreviewCount] = useState(0);

  const generatePreviewLink = async () => {
    setIsGenerating(true);
    try {
      const nextCount = previewCount + 1;
      const token = await instanceService.createPreviewSession(instanceId, nextCount);
      setPreviewToken(token);
      setPreviewCount(nextCount);
    } catch (error) {
      console.error('Failed to generate preview:', error);
      alert('Failed to create preview session. Make sure the backend is running.');
    } finally {
      setIsGenerating(false);
    }
  };

  const previewUrl = previewToken
    ? `${window.location.origin}/interview/${previewToken}`
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-brand-dark">Preview Interview</h2>
        <p className="text-sm text-gray-500">
          Test the interview experience before going live. Preview sessions are marked as test data.
        </p>
      </div>

      {/* Configuration Summary */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="font-medium text-gray-900 mb-3">Current Configuration</h3>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500">Agent Type</dt>
            <dd className="text-sm font-medium text-gray-900 capitalize">{config.agentType}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Time Limit</dt>
            <dd className="text-sm font-medium text-gray-900">{config.timeboxMinutes} minutes</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Max Turns</dt>
            <dd className="text-sm font-medium text-gray-900">{config.maxTurns} turns</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Guiding Questions</dt>
            <dd className="text-sm font-medium text-gray-900">{config.guidingQuestions.length} questions</dd>
          </div>
        </dl>
        {config.objective && (
          <div className="mt-3 pt-3 border-t">
            <dt className="text-sm text-gray-500 mb-1">Objective</dt>
            <dd className="text-sm text-gray-700">{config.objective}</dd>
          </div>
        )}
      </div>

      {/* Preview Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="text-center">
          {!previewUrl ? (
            <>
              <Play className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-sm font-medium text-gray-900">Start a Preview Session</h3>
              <p className="mt-2 text-sm text-gray-500">
                Experience the interview as a participant would. This creates a test session.
              </p>
              <button
                type="button"
                onClick={generatePreviewLink}
                disabled={isGenerating}
                className={cn(
                  'mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white',
                  isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-teal hover:bg-teal-700'
                )}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Preview
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Play className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mt-4 text-sm font-medium text-gray-900">Preview Ready</h3>
              <p className="mt-2 text-sm text-gray-500">
                Your preview session is ready. Click below to open the interview.
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Preview
                </a>
                <button
                  type="button"
                  onClick={generatePreviewLink}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <RefreshCw className={cn('h-4 w-4', isGenerating && 'animate-spin')} />
                  New Preview
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-amber-50 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700">
            <p className="font-medium">Preview sessions are recorded separately</p>
            <p className="mt-1">
              All preview sessions are saved with a <code className="bg-amber-100 px-1 rounded">preview_test_#</code> identifier
              and won&apos;t be included in your actual interview results.
            </p>
          </div>
        </div>
      </div>

      {/* Previous Previews */}
      {previewCount > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="font-medium text-gray-900 mb-2">Preview History</h3>
          <p className="text-sm text-gray-500">
            You&apos;ve created {previewCount} preview session{previewCount !== 1 ? 's' : ''} for this instance.
          </p>
        </div>
      )}
    </div>
  );
}
