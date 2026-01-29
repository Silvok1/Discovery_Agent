'use client';

import { useState, useEffect } from 'react';
import { Link2, Copy, Check, ExternalLink, Lock, Users, Calendar, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';
import { distributionService } from '@/api/services/distributionService';
import { AnonymousLinkSettings } from '@/api/contracts';
import { cn } from '@/lib/utils';

interface AnonymousLinkViewProps {
  instanceId: string;
}

export function AnonymousLinkView({ instanceId }: AnonymousLinkViewProps) {
  const [settings, setSettings] = useState<AnonymousLinkSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [instanceId]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await distributionService.getAnonymousLink(instanceId);
      setSettings(data);
    } catch (error) {
      console.error('Failed to load anonymous link settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!settings?.url) return;
    try {
      await navigator.clipboard.writeText(settings.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleToggleEnabled = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await distributionService.updateAnonymousLink(instanceId, {
        enabled: !settings.enabled,
      });
      setSettings(updated);
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMultipleResponses = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await distributionService.updateAnonymousLink(instanceId, {
        allowMultipleResponses: !settings.allowMultipleResponses,
      });
      setSettings(updated);
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMaxResponses = async (value: number | undefined) => {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await distributionService.updateAnonymousLink(instanceId, {
        maxResponses: value,
      });
      setSettings(updated);
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateExpiry = async (value: string | undefined) => {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await distributionService.updateAnonymousLink(instanceId, {
        expiresAt: value,
      });
      setSettings(updated);
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-teal border-t-transparent" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
        <p className="text-red-700">Failed to load anonymous link settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Anonymous Link</h2>
        <p className="mt-1 text-sm text-gray-500">
          Share this link publicly to collect anonymous responses. Anyone with the link can take the survey.
        </p>
      </div>

      {/* Link Status Card */}
      <div className={cn(
        'rounded-lg border p-6',
        settings.enabled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full',
              settings.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
            )}>
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {settings.enabled ? 'Link Active' : 'Link Inactive'}
              </h3>
              <p className="text-sm text-gray-500">
                {settings.enabled 
                  ? 'Anyone with the link can access the survey'
                  : 'Enable to allow anonymous access'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleEnabled}
            disabled={saving}
            className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            {settings.enabled ? (
              <ToggleRight className="h-8 w-8 text-green-600" />
            ) : (
              <ToggleLeft className="h-8 w-8" />
            )}
          </button>
        </div>
      </div>

      {/* Survey Link */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">Survey Link</label>
        <div className="flex gap-2">
          <div className="flex-1 rounded-md border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-700">
            {settings.url}
          </div>
          <button
            onClick={handleCopyLink}
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              copied
                ? 'bg-green-600 text-white'
                : 'bg-brand-teal text-white hover:bg-teal-700'
            )}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </button>
          <a
            href={settings.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ExternalLink className="h-4 w-4" />
            Preview
          </a>
        </div>
      </div>

      {/* Settings */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="font-medium text-gray-900">Link Settings</h3>
        </div>
        
        <div className="divide-y divide-gray-100">
          {/* Multiple Responses */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Allow Multiple Responses</p>
                <p className="text-sm text-gray-500">
                  Let the same person submit the survey multiple times
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleMultipleResponses}
              disabled={saving}
              className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              {settings.allowMultipleResponses ? (
                <ToggleRight className="h-6 w-6 text-brand-teal" />
              ) : (
                <ToggleLeft className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Max Responses */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Response Limit</p>
                <p className="text-sm text-gray-500">
                  Maximum number of responses allowed (leave empty for unlimited)
                </p>
              </div>
            </div>
            <input
              type="number"
              min="1"
              value={settings.maxResponses || ''}
              onChange={(e) => handleUpdateMaxResponses(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Unlimited"
              className="w-32 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
            />
          </div>

          {/* Expiry Date */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Link Expiration</p>
                <p className="text-sm text-gray-500">
                  Set a date when the link will stop accepting responses
                </p>
              </div>
            </div>
            <input
              type="datetime-local"
              value={settings.expiresAt ? settings.expiresAt.slice(0, 16) : ''}
              onChange={(e) => handleUpdateExpiry(e.target.value ? new Date(e.target.value).toISOString() : undefined)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
            />
          </div>

          {/* Password Protection (placeholder) */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Password Protection</p>
                <p className="text-sm text-gray-500">
                  Require a password to access the survey
                </p>
              </div>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
              Coming Soon
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 font-medium text-gray-900">Response Statistics</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-brand-teal">{settings.currentResponses}</p>
            <p className="text-sm text-gray-500">Total Responses</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">
              {settings.maxResponses ? `${settings.maxResponses - settings.currentResponses}` : '∞'}
            </p>
            <p className="text-sm text-gray-500">Remaining</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">
              {settings.expiresAt ? new Date(settings.expiresAt).toLocaleDateString() : 'Never'}
            </p>
            <p className="text-sm text-gray-500">Expires</p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-500" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">About Anonymous Links</p>
            <p className="mt-1">
              Anonymous links are best for public surveys, kiosk setups, or when you don&apos;t need to track 
              individual respondents. For tracked responses with unique links per person, use 
              <strong> Email Distribution</strong> instead.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
