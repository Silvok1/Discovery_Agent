'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Settings,
  Users,
  Send,
  Loader2,
  Save,
  Cloud,
  CloudOff,
  Play,
  Eye,
  Rocket,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { instanceService } from '@/api/services/instanceService';
import { InterviewInstance, InterviewConfig, InstanceStatus } from '@/api/contracts';
import {
  InterviewConfigPanel,
  ParticipantsPanel,
  DistributionsPanel,
  PreviewPanel,
  MonitorPanel,
} from '@/components/features/interview-builder';

type TabId = 'configure' | 'participants' | 'distribute' | 'preview' | 'monitor';

const TABS = [
  { id: 'configure' as TabId, label: 'Configure', icon: Settings },
  { id: 'participants' as TabId, label: 'Participants', icon: Users },
  { id: 'distribute' as TabId, label: 'Distribute', icon: Send },
  { id: 'preview' as TabId, label: 'Preview', icon: Play },
  { id: 'monitor' as TabId, label: 'Monitor', icon: Eye },
];

export default function InstanceBuilderPage() {
  const params = useParams();
  const projectId = params.id as string;
  const instanceId = params.instanceId as string;

  const [instance, setInstance] = useState<InterviewInstance | null>(null);
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('configure');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showLiveConfirm, setShowLiveConfirm] = useState(false);
  const [isSettingLive, setIsSettingLive] = useState(false);

  useEffect(() => {
    loadInstance();
  }, [instanceId]);

  const loadInstance = async () => {
    setIsLoading(true);
    try {
      const data = await instanceService.getInstance(instanceId);
      setInstance(data);
      setConfig({
        id: data.id,
        name: data.name,
        agentType: data.agentType,
        objective: data.objective,
        guidingQuestions: data.guidingQuestions || [],
        timeboxMinutes: data.timeboxMinutes,
        maxTurns: data.maxTurns,
      });
    } catch (error) {
      console.error('Failed to load instance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigChange = (newConfig: InterviewConfig) => {
    setConfig(newConfig);
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    try {
      await instanceService.updateInstance(instanceId, {
        name: config.name,
        agentType: config.agentType,
        objective: config.objective,
        guidingQuestions: config.guidingQuestions,
        timeboxMinutes: config.timeboxMinutes,
        maxTurns: config.maxTurns,
      });
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetLive = async () => {
    if (!instance) return;
    setIsSettingLive(true);
    try {
      // TODO: Call API to set instance live
      // await instanceService.setInstanceStatus(instanceId, 'Live');
      setInstance({ ...instance, status: 'Live' as InstanceStatus });
      setShowLiveConfirm(false);
    } catch (error) {
      console.error('Failed to set live:', error);
    } finally {
      setIsSettingLive(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Live':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Closed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  if (!instance || !config) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-gray-500">Instance not found</p>
        <Link
          href={`/projects/${projectId}`}
          className="mt-4 text-brand-teal hover:underline"
        >
          Back to project
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/projects/${projectId}`}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-brand-dark">{instance.name}</h1>
                <span className={cn(
                  'rounded-full border px-2 py-0.5 text-xs font-medium',
                  getStatusColor(instance.status)
                )}>
                  {instance.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Interview Instance • {config.agentType.charAt(0).toUpperCase() + config.agentType.slice(1)} Agent
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Save Status */}
            <div className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1.5 text-xs">
              {isDirty ? (
                <>
                  <CloudOff className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-gray-600">Unsaved changes</span>
                </>
              ) : (
                <>
                  <Cloud className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-gray-600">Saved</span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className={cn(
                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors',
                isDirty && !isSaving
                  ? 'bg-brand-teal hover:bg-teal-700'
                  : 'bg-gray-300 cursor-not-allowed'
              )}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </button>
            {/* Set Live Button */}
            {instance.status === 'Draft' && (
              <button
                type="button"
                onClick={() => setShowLiveConfirm(true)}
                className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                <Rocket className="h-4 w-4" />
                Set Live
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 px-6 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isMonitorDisabled = tab.id === 'monitor' && instance.status === 'Draft';
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => !isMonitorDisabled && setActiveTab(tab.id)}
                disabled={isMonitorDisabled}
                className={cn(
                  'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-brand-teal text-brand-dark'
                    : isMonitorDisabled
                    ? 'border-transparent text-gray-300 cursor-not-allowed'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {activeTab === 'configure' && (
          <InterviewConfigPanel
            config={config}
            onChange={handleConfigChange}
            onSave={handleSave}
            isSaving={isSaving}
          />
        )}
        {activeTab === 'participants' && (
          <ParticipantsPanel instanceId={instanceId} />
        )}
        {activeTab === 'distribute' && (
          <DistributionsPanel instanceId={instanceId} />
        )}
        {activeTab === 'preview' && (
          <PreviewPanel instanceId={instanceId} config={config} />
        )}
        {activeTab === 'monitor' && (
          <MonitorPanel instanceId={instanceId} instanceStatus={instance.status} />
        )}
      </div>

      {/* Set Live Confirmation Modal */}
      {showLiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <Rocket className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-brand-dark">Set Instance Live?</h2>
            </div>

            <div className="rounded-lg bg-amber-50 p-3 mb-4">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div className="text-sm text-amber-700">
                  <p className="font-medium">This action will:</p>
                  <ul className="mt-1 list-disc pl-4 space-y-1">
                    <li>Send scheduled invitation emails to participants</li>
                    <li>Allow participants to access their interview links</li>
                    <li>Start the deadline countdown if one is set</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Make sure you have configured the interview settings, added participants,
              and set up email templates before going live.
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLiveConfirm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSetLive}
                disabled={isSettingLive}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white',
                  isSettingLive ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                )}
              >
                {isSettingLive ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Rocket className="h-4 w-4" />
                )}
                Set Live
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
