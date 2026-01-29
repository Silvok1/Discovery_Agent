'use client';

import { useState } from 'react';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import { useTrash } from '@/contexts/TrashContext';
import { FileText, Mail, Layout, Settings as SettingsIcon, Palette, Undo, Redo, Save, Eye, Trash2, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BuildTab } from './tabs/BuildTab';
import { PagesTab } from './tabs/PagesTab';
import { DistributionsTab } from './tabs/DistributionsTab';
import { LookAndFeelTab } from './tabs/LookAndFeelTab';
import { SettingsTab } from './tabs/SettingsTab';
import { TrashPanel } from './TrashPanel';
import { SurveyPreviewModal } from './SurveyPreviewModal';
import { Block, Question } from '@/api/contracts';

type TabId = 'build' | 'pages' | 'distributions' | 'lookFeel' | 'settings';

const TABS = [
  { id: 'build' as TabId, label: 'Build', icon: FileText },
  { id: 'pages' as TabId, label: 'Pages', icon: Layout },
  { id: 'distributions' as TabId, label: 'Distributions', icon: Mail },
  { id: 'lookFeel' as TabId, label: 'Look & Feel', icon: Palette },
  { id: 'settings' as TabId, label: 'Settings', icon: SettingsIcon },
];

// Tabs that use full-width layouts (no padding wrapper)
const FULL_WIDTH_TABS: TabId[] = ['build', 'pages', 'lookFeel', 'distributions'];

export function BuilderTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('build');
  const [showTrash, setShowTrash] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { present, dispatch, canUndo, canRedo, saveStatus, lastSaved } = useSurveyBuilder();
  const { getTrashCount } = useTrash();

  const trashCount = getTrashCount();

  const handleSave = async () => {
    if (!present) return;
    console.log('Manual save triggered', present);
    // TODO: Implement API save call
  };

  const handleRestoreBlock = (block: Block) => {
    dispatch({ type: 'ADD_BLOCK', payload: block });
  };

  const handleRestoreQuestion = (question: Question, blockId: string) => {
    dispatch({ type: 'ADD_QUESTION', payload: { blockId, question } });
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    return lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isFullWidth = FULL_WIDTH_TABS.includes(activeTab);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-brand-dark">{present?.name || 'Survey Builder'}</h1>
          <div className="flex items-center space-x-2">
            {/* Save Status Indicator */}
            <div className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1.5 text-xs">
              {saveStatus === 'saved' && (
                <>
                  <Cloud className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-gray-600">Saved {formatLastSaved()}</span>
                </>
              )}
              {saveStatus === 'saving' && (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                  <span className="text-gray-600">Saving...</span>
                </>
              )}
              {saveStatus === 'unsaved' && (
                <>
                  <CloudOff className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-gray-600">Unsaved</span>
                </>
              )}
            </div>
            <div className="mx-1 h-6 w-px bg-gray-200" />
            <button
              onClick={() => dispatch({ type: 'UNDO' })}
              disabled={!canUndo}
              title="Undo"
              className={cn(
                'rounded p-2 transition-colors',
                canUndo ? 'text-gray-700 hover:bg-gray-100' : 'cursor-not-allowed text-gray-300'
              )}
            >
              <Undo className="h-5 w-5" />
            </button>
            <button
              onClick={() => dispatch({ type: 'REDO' })}
              disabled={!canRedo}
              title="Redo"
              className={cn(
                'rounded p-2 transition-colors',
                canRedo ? 'text-gray-700 hover:bg-gray-100' : 'cursor-not-allowed text-gray-300'
              )}
            >
              <Redo className="h-5 w-5" />
            </button>
            <div className="mx-2 h-6 w-px bg-gray-200" />
            <button
              onClick={() => setShowTrash(true)}
              title="Recycle Bin"
              className="relative flex items-center rounded-md border border-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-50"
            >
              <Trash2 className="h-4 w-4" />
              {trashCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-red text-xs font-medium text-white">
                  {trashCount > 9 ? '9+' : trashCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowPreview(true)}
              title="Preview Survey"
              className="flex items-center rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </button>
            <button
              onClick={handleSave}
              className="flex items-center rounded-md bg-brand-teal px-4 py-2 text-white hover:bg-teal-700"
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </button>
          </div>
        </div>
        <div className="flex space-x-1 px-6">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center space-x-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'border-brand-teal text-brand-dark'
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
      <div className={cn('flex-1 overflow-hidden', !isFullWidth && 'overflow-y-auto bg-gray-50 p-6')}>
        {activeTab === 'build' && <BuildTab />}
        {activeTab === 'pages' && <PagesTab />}
      {activeTab === 'distributions' && <DistributionsTab />}
        {activeTab === 'lookFeel' && <LookAndFeelTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>

      {/* Trash Panel */}
      <TrashPanel
        isOpen={showTrash}
        onClose={() => setShowTrash(false)}
        onRestoreBlock={handleRestoreBlock}
        onRestoreQuestion={handleRestoreQuestion}
      />

      {/* Survey Preview Modal */}
      <SurveyPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        survey={present}
      />
    </div>
  );
}
