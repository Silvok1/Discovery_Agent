'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import { cn } from '@/lib/utils';
import { Mail, Link2, QrCode, Globe } from 'lucide-react';
import { AnonymousLinkView, QRCodeView, EmailDistributionView } from './distributions';

type DistributionMethod = 'anonymous-link' | 'qr-code' | 'email';

interface DistributionMethodInfo {
  id: DistributionMethod;
  label: string;
  icon: React.ElementType;
  description: string;
  linkType: 'anonymous' | 'unique';
  bestFor: string[];
}

const DISTRIBUTION_METHODS: DistributionMethodInfo[] = [
  {
    id: 'anonymous-link',
    label: 'Anonymous Link',
    icon: Link2,
    description: 'Share a public URL that anyone can use to take the survey',
    linkType: 'anonymous',
    bestFor: ['Public surveys', 'Social media', 'Website embedding', 'Kiosk setups'],
  },
  {
    id: 'qr-code',
    label: 'QR Code',
    icon: QrCode,
    description: 'Generate a scannable QR code for print or digital distribution',
    linkType: 'anonymous',
    bestFor: ['Print materials', 'Posters', 'Product packaging', 'In-store displays'],
  },
  {
    id: 'email',
    label: 'Email',
    icon: Mail,
    description: 'Send personalized invitations with unique, trackable links',
    linkType: 'unique',
    bestFor: ['Customer lists', 'Employee surveys', 'Targeted outreach', 'Follow-up reminders'],
  },
];

export function DistributionsTab() {
  const { present } = useSurveyBuilder();
  const params = useParams();
  const instanceId = params.instanceId as string;
  const [activeMethod, setActiveMethod] = useState<DistributionMethod>('anonymous-link');

  if (!present || !instanceId) return null;

  const activeMethodInfo = DISTRIBUTION_METHODS.find((m) => m.id === activeMethod);

  return (
    <div className="flex h-[calc(100vh-180px)]">
      {/* Left Navigation Panel */}
      <div className="w-72 flex-shrink-0 overflow-y-auto border-r bg-gray-50">
        {/* Method Selection Header */}
        <div className="border-b bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-900">Distribution Methods</h3>
          <p className="mt-1 text-xs text-gray-500">Choose how to share your survey</p>
        </div>

        {/* Method List */}
        <nav className="p-2">
          {DISTRIBUTION_METHODS.map((method) => {
            const Icon = method.icon;
            const isActive = activeMethod === method.id;
            return (
              <button
                key={method.id}
                onClick={() => setActiveMethod(method.id)}
                className={cn(
                  'mb-1 flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors',
                  isActive
                    ? 'bg-brand-teal/10 text-brand-teal'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <div className={cn(
                  'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
                  isActive ? 'bg-brand-teal text-white' : 'bg-gray-200 text-gray-600'
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{method.label}</span>
                    <span className={cn(
                      'rounded px-1.5 py-0.5 text-[10px] font-medium uppercase',
                      method.linkType === 'unique'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600'
                    )}>
                      {method.linkType}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{method.description}</p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Link Type Legend */}
        <div className="mx-4 mt-4 rounded-lg border border-gray-200 bg-white p-3">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Link Types</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-600">Anonymous</span>
              <span className="text-gray-600">Same link for everyone. No individual tracking.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 rounded bg-purple-100 px-1.5 py-0.5 font-medium text-purple-700">Unique</span>
              <span className="text-gray-600">One link per person. Track who responded.</span>
            </div>
          </div>
        </div>

        {/* Best For Section */}
        {activeMethodInfo && (
          <div className="mx-4 mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <h4 className="mb-2 flex items-center gap-1 text-xs font-semibold text-blue-700">
              <Globe className="h-3 w-3" />
              Best For
            </h4>
            <ul className="space-y-1">
              {activeMethodInfo.bestFor.map((item) => (
                <li key={item} className="flex items-center gap-1.5 text-xs text-blue-600">
                  <span className="h-1 w-1 rounded-full bg-blue-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-white p-8">
        {activeMethod === 'anonymous-link' && (
          <AnonymousLinkView instanceId={instanceId} />
        )}
        {activeMethod === 'qr-code' && (
          <QRCodeView instanceId={instanceId} />
        )}
        {activeMethod === 'email' && (
          <EmailDistributionView instanceId={instanceId} />
        )}
      </div>
    </div>
  );
}
