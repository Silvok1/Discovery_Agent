'use client';

import { useState } from 'react';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import { cn } from '@/lib/utils';
import { Palette, Type, Layout, ImageIcon, Upload, Check, Monitor, Smartphone, Tablet, Circle, Square, Pill, Sparkles } from 'lucide-react';
import type { SelectionStyle, LookAndFeel } from '@/api/contracts';

type SettingsTab = 'theme' | 'typography' | 'layout' | 'background' | 'effects';
type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

const PRESET_THEMES: { name: string; settings: Partial<LookAndFeel> }[] = [
  { 
    name: 'Ocean', 
    settings: {
      primaryColor: '#0891B2', 
      accentColor: '#06B6D4',
      fontFamily: 'Inter',
      borderRadius: 8,
      selectionStyle: 'radio',
      buttonStyle: 'filled',
      cardShadow: 'sm',
      animation: 'fade',
      inputStyle: 'standard'
    }
  },
  { 
    name: 'Forest', 
    settings: {
      primaryColor: '#059669', 
      accentColor: '#10B981',
      fontFamily: 'Lato',
      borderRadius: 4,
      selectionStyle: 'pill',
      buttonStyle: 'outline',
      cardShadow: 'none',
      animation: 'none',
      inputStyle: 'filled'
    }
  },
  { 
    name: 'Sunset', 
    settings: {
      primaryColor: '#DC2626', 
      accentColor: '#F97316',
      fontFamily: 'Poppins',
      borderRadius: 12,
      selectionStyle: 'bubble',
      buttonStyle: 'soft',
      cardShadow: 'lg',
      animation: 'scale',
      inputStyle: 'floating'
    }
  },
  { 
    name: 'Royal', 
    settings: {
      primaryColor: '#7C3AED', 
      accentColor: '#8B5CF6',
      fontFamily: 'Source Sans Pro',
      borderRadius: 16,
      selectionStyle: 'button',
      buttonStyle: 'filled',
      cardShadow: 'md',
      animation: 'slide',
      inputStyle: 'standard'
    }
  },
  { 
    name: 'Cyberpunk', 
    settings: {
      primaryColor: '#00ff00', 
      accentColor: '#ff00ff',
      fontFamily: 'Courier New',
      borderRadius: 0,
      selectionStyle: 'button',
      buttonStyle: 'outline',
      cardShadow: 'none',
      backgroundColor: '#000000',
      backgroundType: 'color',
      borderColor: '#00ff00',
      borderWidth: 2,
      animation: 'slide',
      inputStyle: 'flushed',
      buttonTextTransform: 'uppercase'
    }
  },
  { 
    name: 'Glass', 
    settings: {
      primaryColor: '#ffffff', 
      accentColor: '#ffffff',
      fontFamily: 'Inter',
      borderRadius: 16,
      selectionStyle: 'bubble',
      buttonStyle: 'soft',
      cardShadow: 'lg',
      backgroundType: 'image',
      headerImageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop',
      glassOpacity: 0.3,
      animation: 'fade',
      inputStyle: 'standard'
    }
  },
];

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter', preview: 'Inter' },
  { value: 'Roboto', label: 'Roboto', preview: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans', preview: 'Open Sans' },
  { value: 'Lato', label: 'Lato', preview: 'Lato' },
  { value: 'Poppins', label: 'Poppins', preview: 'Poppins' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro', preview: 'Source Sans Pro' },
  { value: 'Courier New', label: 'Courier New', preview: 'Courier New' },
];

const PROGRESS_STYLES = [
  { value: 'bar', label: 'Progress Bar', icon: '▰▰▰▱▱' },
  { value: 'percentage', label: 'Percentage', icon: '60%' },
  { value: 'pageCount', label: 'Page Count', icon: '3/5' },
];

const SELECTION_STYLES: { value: SelectionStyle; label: string; description: string }[] = [
  { value: 'radio', label: 'Classic', description: 'Traditional radio buttons and checkboxes' },
  { value: 'bubble', label: 'Bubble', description: 'Outlined options that fill when selected' },
  { value: 'pill', label: 'Pill', description: 'Rounded pill-shaped clickable options' },
  { value: 'button', label: 'Button', description: 'Full-width button style options' },
];

export function LookAndFeelTab() {
  const { present, dispatch } = useSurveyBuilder();
  const [activeTab, setActiveTab] = useState<SettingsTab>('theme');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');

  if (!present) return null;

  const { lookAndFeel } = present;

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'theme', label: 'Theme & Colors', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'layout', label: 'Layout & Options', icon: Layout },
    { id: 'background', label: 'Background', icon: ImageIcon },
    { id: 'effects', label: 'Effects & Motion', icon: Sparkles },
  ];

  const updateLookAndFeel = (updates: Partial<typeof lookAndFeel>) => {
    dispatch({ type: 'UPDATE_LOOK_AND_FEEL', payload: updates });
  };

  return (
    <div className="flex h-[calc(100vh-180px)]">
      {/* Left Settings Panel */}
      <div className="w-80 flex-shrink-0 overflow-y-auto border-r bg-gray-50">
        {/* Tab Navigation */}
        <nav className="border-b bg-white">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex w-full items-center gap-3 border-l-2 px-4 py-3 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'border-brand-teal bg-brand-light/30 text-brand-teal'
                    : 'border-transparent text-gray-700 hover:bg-gray-50'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Settings Content */}
        <div className="p-4">
          {/* Theme & Colors */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Preset Themes</h4>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_THEMES.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() =>
                        updateLookAndFeel(theme.settings)
                      }
                      className={cn(
                        'rounded-lg border p-2 text-center transition-all',
                        lookAndFeel.primaryColor === theme.settings.primaryColor
                          ? 'border-brand-teal ring-2 ring-brand-teal/20'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="mb-1 flex justify-center gap-1">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: theme.settings.primaryColor }}
                        />
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: theme.settings.accentColor }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Custom Colors</h4>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={lookAndFeel.primaryColor}
                        onChange={(e) => updateLookAndFeel({ primaryColor: e.target.value })}
                        className="h-9 w-9 cursor-pointer rounded border border-gray-300"
                        title="Primary color picker"
                        aria-label="Primary color"
                      />
                      <input
                        type="text"
                        value={lookAndFeel.primaryColor}
                        onChange={(e) => updateLookAndFeel({ primaryColor: e.target.value })}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm uppercase"
                        placeholder="#000000"
                        aria-label="Primary color hex value"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Accent Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={lookAndFeel.accentColor}
                        onChange={(e) => updateLookAndFeel({ accentColor: e.target.value })}
                        className="h-9 w-9 cursor-pointer rounded border border-gray-300"
                        title="Accent color picker"
                        aria-label="Accent color"
                      />
                      <input
                        type="text"
                        value={lookAndFeel.accentColor}
                        onChange={(e) => updateLookAndFeel({ accentColor: e.target.value })}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm uppercase"
                        placeholder="#000000"
                        aria-label="Accent color hex value"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Border Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={lookAndFeel.borderColor || '#e5e7eb'}
                        onChange={(e) => updateLookAndFeel({ borderColor: e.target.value })}
                        className="h-9 w-9 cursor-pointer rounded border border-gray-300"
                        title="Border color picker"
                        aria-label="Border color"
                      />
                      <input
                        type="text"
                        value={lookAndFeel.borderColor || '#e5e7eb'}
                        onChange={(e) => updateLookAndFeel({ borderColor: e.target.value })}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm uppercase"
                        placeholder="#E5E7EB"
                        aria-label="Border color hex value"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Typography */}
          {activeTab === 'typography' && (
            <div className="space-y-6">
              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Body Font</h4>
                <select
                  value={lookAndFeel.fontFamily}
                  onChange={(e) => updateLookAndFeel({ fontFamily: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                  title="Select body font family"
                  aria-label="Body font family"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Heading Font</h4>
                <select
                  value={lookAndFeel.headingFont || lookAndFeel.fontFamily}
                  onChange={(e) => updateLookAndFeel({ headingFont: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                  title="Select heading font family"
                  aria-label="Heading font family"
                >
                  <option value="">Same as Body</option>
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Base Font Size</h4>
                <div className="flex rounded-lg border border-gray-200 p-1">
                  {(['sm', 'md', 'lg'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateLookAndFeel({ baseFontSize: size })}
                      className={cn(
                        'flex-1 rounded py-1.5 text-sm font-medium transition-colors',
                        (lookAndFeel.baseFontSize || 'md') === size
                          ? 'bg-brand-teal text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      {size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Layout & Options */}
          {activeTab === 'layout' && (
            <div className="space-y-6">
              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Progress Indicator</h4>
                <div className="space-y-2">
                  {PROGRESS_STYLES.map((style) => (
                    <button
                      key={style.value}
                      onClick={() =>
                        updateLookAndFeel({
                          progressBarStyle: style.value as typeof lookAndFeel.progressBarStyle,
                        })
                      }
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all',
                        lookAndFeel.progressBarStyle === style.value
                          ? 'border-brand-teal bg-brand-light/30'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <span className="text-sm text-gray-700">{style.label}</span>
                      <span className="font-mono text-xs text-gray-500">{style.icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Progress Bar Position</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => updateLookAndFeel({ progressBarPosition: 'top' })}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all',
                      lookAndFeel.progressBarPosition === 'top'
                        ? 'border-brand-teal bg-brand-light/30'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="text-sm text-gray-700">Top of Page</span>
                  </button>
                  <button
                    onClick={() => updateLookAndFeel({ progressBarPosition: 'bottom' })}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all',
                      lookAndFeel.progressBarPosition === 'bottom'
                        ? 'border-brand-teal bg-brand-light/30'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="text-sm text-gray-700">Bottom of Page</span>
                  </button>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Question Layout</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => updateLookAndFeel({ questionLayout: 'stacked' })}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all',
                      lookAndFeel.questionLayout === 'stacked'
                        ? 'border-brand-teal bg-brand-light/30'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="text-sm text-gray-700">Stacked (One per page)</span>
                  </button>
                  <button
                    onClick={() => updateLookAndFeel({ questionLayout: 'multi' })}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all',
                      lookAndFeel.questionLayout === 'multi'
                        ? 'border-brand-teal bg-brand-light/30'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="text-sm text-gray-700">Multiple per page</span>
                  </button>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Button Style</h4>
                <div className="grid grid-cols-3 gap-2">
                  {(['filled', 'outline', 'soft'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => updateLookAndFeel({ buttonStyle: style })}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-all',
                        (lookAndFeel.buttonStyle || 'filled') === style
                          ? 'border-brand-teal bg-brand-light/30 text-brand-teal'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Button Text</h4>
                <div className="grid grid-cols-3 gap-2">
                  {(['none', 'uppercase', 'capitalize'] as const).map((transform) => (
                    <button
                      key={transform}
                      onClick={() => updateLookAndFeel({ buttonTextTransform: transform })}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                        (lookAndFeel.buttonTextTransform || 'none') === transform
                          ? 'border-brand-teal bg-brand-light/30 text-brand-teal'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                    >
                      {transform === 'none' ? 'Normal' : transform === 'uppercase' ? 'ABC' : 'Abc'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Card Shadow</h4>
                <div className="grid grid-cols-4 gap-2">
                  {(['none', 'sm', 'md', 'lg'] as const).map((shadow) => (
                    <button
                      key={shadow}
                      onClick={() => updateLookAndFeel({ cardShadow: shadow })}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-all',
                        (lookAndFeel.cardShadow || 'sm') === shadow
                          ? 'border-brand-teal bg-brand-light/30 text-brand-teal'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                    >
                      {shadow}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Border Radius</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={lookAndFeel.borderRadius}
                    onChange={(e) => updateLookAndFeel({ borderRadius: parseInt(e.target.value) })}
                    className="w-full accent-brand-teal"
                    title={`Border radius: ${lookAndFeel.borderRadius}px`}
                    aria-label="Border radius"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Square (0px)</span>
                    <span className="font-medium text-brand-teal">{lookAndFeel.borderRadius}px</span>
                    <span>Round (24px)</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Border Width</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="8"
                    value={lookAndFeel.borderWidth ?? 0}
                    onChange={(e) => updateLookAndFeel({ borderWidth: parseInt(e.target.value) })}
                    className="w-full accent-brand-teal"
                    title={`Border width: ${lookAndFeel.borderWidth ?? 0}px`}
                    aria-label="Border width"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>None (0px)</span>
                    <span className="font-medium text-brand-teal">{lookAndFeel.borderWidth ?? 0}px</span>
                    <span>Thick (8px)</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Input Style</h4>
                <div className="grid grid-cols-2 gap-2">
                  {(['standard', 'flushed', 'filled', 'floating'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => updateLookAndFeel({ inputStyle: style })}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-all',
                        (lookAndFeel.inputStyle || 'standard') === style
                          ? 'border-brand-teal bg-brand-light/30 text-brand-teal'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Selection Style</h4>
                <p className="mb-3 text-xs text-gray-500">
                  How multiple choice and checkbox options appear
                </p>
                <div className="space-y-2">
                  {SELECTION_STYLES.map((style) => (
                    <button
                      key={style.value}
                      onClick={() =>
                        updateLookAndFeel({
                          selectionStyle: style.value,
                        })
                      }
                      className={cn(
                        'flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-all',
                        (lookAndFeel.selectionStyle || 'radio') === style.value
                          ? 'border-brand-teal bg-brand-light/30'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {/* Visual preview of style */}
                      <div className="mt-0.5 flex-shrink-0">
                        {style.value === 'radio' && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-brand-teal">
                            <div className="h-2.5 w-2.5 rounded-full bg-brand-teal" />
                          </div>
                        )}
                        {style.value === 'bubble' && (
                          <div className="flex h-5 w-10 items-center justify-center rounded-full border-2 border-brand-teal bg-brand-light/50">
                            <Check className="h-3 w-3 text-brand-teal" />
                          </div>
                        )}
                        {style.value === 'pill' && (
                          <div className="flex h-5 w-10 items-center justify-center rounded-full bg-brand-teal text-xs text-white">
                            A
                          </div>
                        )}
                        {style.value === 'button' && (
                          <div className="flex h-5 w-10 items-center justify-center rounded border-2 border-brand-teal bg-brand-teal text-xs text-white">
                            ✓
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">{style.label}</span>
                        <p className="text-xs text-gray-500">{style.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Content Width</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => updateLookAndFeel({ contentWidth: 'narrow' })}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all',
                      lookAndFeel.contentWidth === 'narrow'
                        ? 'border-brand-teal bg-brand-light/30'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="text-sm text-gray-700">Narrow (600px)</span>
                  </button>
                  <button
                    onClick={() => updateLookAndFeel({ contentWidth: 'medium' })}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all',
                      lookAndFeel.contentWidth === 'medium'
                        ? 'border-brand-teal bg-brand-light/30'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="text-sm text-gray-700">Medium (800px)</span>
                  </button>
                  <button
                    onClick={() => updateLookAndFeel({ contentWidth: 'wide' })}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all',
                      lookAndFeel.contentWidth === 'wide'
                        ? 'border-brand-teal bg-brand-light/30'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="text-sm text-gray-700">Wide (1000px)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Background */}
          {activeTab === 'background' && (
            <div className="space-y-6">
              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Background Type</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => updateLookAndFeel({ backgroundType: 'color' })}
                    className={cn(
                      'rounded-lg border-2 px-3 py-2 text-sm font-medium',
                      lookAndFeel.backgroundType === 'color'
                        ? 'border-brand-teal bg-brand-light/30 text-brand-teal'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                  >
                    Solid Color
                  </button>
                  <button 
                    onClick={() => updateLookAndFeel({ backgroundType: 'image' })}
                    className={cn(
                      'rounded-lg border-2 px-3 py-2 text-sm font-medium',
                      lookAndFeel.backgroundType === 'image'
                        ? 'border-brand-teal bg-brand-light/30 text-brand-teal'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                  >
                    Image
                  </button>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Background Color</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={lookAndFeel.backgroundColor || '#f3f4f6'}
                    onChange={(e) => updateLookAndFeel({ backgroundColor: e.target.value })}
                    className="h-9 w-9 cursor-pointer rounded border border-gray-300"
                    title="Background color picker"
                    aria-label="Background color"
                  />
                  <input
                    type="text"
                    value={lookAndFeel.backgroundColor || '#f3f4f6'}
                    onChange={(e) => updateLookAndFeel({ backgroundColor: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm uppercase"
                    placeholder="#f3f4f6"
                    aria-label="Background color hex value"
                  />
                </div>
              </div>

              {lookAndFeel.backgroundType === 'image' && (
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-gray-900">Image Opacity</h4>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={(lookAndFeel.backgroundImageOpacity ?? 1) * 100}
                      onChange={(e) => updateLookAndFeel({ backgroundImageOpacity: parseInt(e.target.value) / 100 })}
                      className="w-full accent-brand-teal"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0%</span>
                      <span className="font-medium text-brand-teal">{Math.round((lookAndFeel.backgroundImageOpacity ?? 1) * 100)}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Header Image</h4>
                {lookAndFeel.headerImageUrl ? (
                  <div className="relative rounded-lg border border-gray-200 overflow-hidden">
                    <img 
                      src={lookAndFeel.headerImageUrl} 
                      alt="Header" 
                      className="w-full h-32 object-cover"
                    />
                    <button
                      onClick={() => updateLookAndFeel({ headerImageUrl: undefined })}
                      className="absolute top-2 right-2 rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                    <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-500">Drag & drop or click to upload</p>
                    <p className="mt-1 text-xs text-gray-400">PNG, JPG up to 5MB</p>
                    <input
                      type="url"
                      placeholder="Or enter image URL"
                      onBlur={(e) => e.target.value && updateLookAndFeel({ headerImageUrl: e.target.value })}
                      className="mt-3 w-full rounded border border-gray-300 px-2 py-1 text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Effects & Motion */}
          {activeTab === 'effects' && (
            <div className="space-y-6">
              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Entrance Animation</h4>
                <div className="grid grid-cols-2 gap-2">
                  {(['none', 'fade', 'slide', 'scale'] as const).map((anim) => (
                    <button
                      key={anim}
                      onClick={() => updateLookAndFeel({ animation: anim })}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-all',
                        (lookAndFeel.animation || 'none') === anim
                          ? 'border-brand-teal bg-brand-light/30 text-brand-teal'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                    >
                      {anim}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Glassmorphism</h4>
                <p className="mb-3 text-xs text-gray-500">
                  Add a frosted glass effect to cards (works best with background images)
                </p>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={(lookAndFeel.glassOpacity ?? 0) * 100}
                    onChange={(e) => updateLookAndFeel({ glassOpacity: parseInt(e.target.value) / 100 })}
                    className="w-full accent-brand-teal"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>None</span>
                    <span className="font-medium text-brand-teal">{Math.round((lookAndFeel.glassOpacity ?? 0) * 100)}%</span>
                    <span>Full</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Preview Panel */}
      <div className="flex flex-1 flex-col bg-gray-200">
        {/* Preview Controls */}
        <div className="flex items-center justify-between border-b bg-white px-4 py-2">
          <h3 className="text-sm font-semibold text-gray-700">Live Preview</h3>
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={cn(
                'rounded p-1.5 transition-colors',
                previewDevice === 'desktop' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
              title="Desktop preview"
              aria-label="Preview on desktop"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPreviewDevice('tablet')}
              className={cn(
                'rounded p-1.5 transition-colors',
                previewDevice === 'tablet' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
              title="Tablet preview"
              aria-label="Preview on tablet"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={cn(
                'rounded p-1.5 transition-colors',
                previewDevice === 'mobile' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
              title="Mobile preview"
              aria-label="Preview on mobile"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="flex flex-1 items-center justify-center p-6 bg-gray-200/50">
          <div
            className={cn(
              'overflow-hidden shadow-2xl transition-all relative',
              previewDevice === 'desktop' && 'h-full w-full max-w-4xl',
              previewDevice === 'tablet' && 'h-[600px] w-[768px]',
              previewDevice === 'mobile' && 'h-[667px] w-[375px]'
            )}
            style={{
              borderRadius: `${lookAndFeel.borderRadius}px`,
              fontFamily: lookAndFeel.fontFamily,
            }}
          >
            {/* Background Layer */}
            <div 
              className="absolute inset-0 z-0"
              style={{
                backgroundColor: lookAndFeel.backgroundType === 'color' 
                  ? (lookAndFeel.backgroundColor || '#f3f4f6')
                  : '#f3f4f6',
                backgroundImage: lookAndFeel.backgroundType === 'image' && lookAndFeel.headerImageUrl
                  ? `url(${lookAndFeel.headerImageUrl})`
                  : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {lookAndFeel.backgroundType === 'image' && (
                <div 
                  className="absolute inset-0 bg-white"
                  style={{ opacity: 1 - (lookAndFeel.backgroundImageOpacity ?? 1) }}
                />
              )}
            </div>

            {/* Survey Preview Content */}
            <div className="relative z-10 h-full overflow-y-auto">
              {/* Header Image (if not background) */}
              {lookAndFeel.headerImageUrl && lookAndFeel.backgroundType !== 'image' && (
                <div className="h-32 w-full overflow-hidden">
                  <img 
                    src={lookAndFeel.headerImageUrl} 
                    alt="Survey Header" 
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Progress Bar */}
              <div className={cn(
                "px-6 py-3",
                lookAndFeel.cardShadow !== 'none' ? 'bg-transparent' : 'bg-white/50 backdrop-blur-sm border-b border-gray-200'
              )}>
                {lookAndFeel.progressBarStyle === 'bar' && (
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200/50">
                    <div
                      className="h-full w-1/3 transition-all"
                      style={{ backgroundColor: lookAndFeel.primaryColor }}
                    />
                  </div>
                )}
                {lookAndFeel.progressBarStyle === 'percentage' && (
                  <div className="text-center text-sm font-medium" style={{ color: lookAndFeel.primaryColor }}>
                    33% Complete
                  </div>
                )}
                {lookAndFeel.progressBarStyle === 'pageCount' && (
                  <div className="text-center text-sm font-medium" style={{ color: lookAndFeel.primaryColor }}>
                    Page 2 of 6
                  </div>
                )}
              </div>

              {/* Survey Content Container */}
              <div className={cn(
                "mx-auto p-6 transition-all",
                lookAndFeel.contentWidth === 'narrow' ? 'max-w-[600px]' : 
                lookAndFeel.contentWidth === 'wide' ? 'max-w-[1000px]' : 'max-w-[800px]'
              )}>
                <div 
                  className={cn(
                    "rounded-xl p-8 transition-all",
                    lookAndFeel.cardShadow === 'sm' && 'shadow-sm',
                    lookAndFeel.cardShadow === 'md' && 'shadow-md',
                    lookAndFeel.cardShadow === 'lg' && 'shadow-lg',
                    lookAndFeel.cardShadow === 'none' && 'shadow-none'
                  )}
                  style={{
                    backgroundColor: lookAndFeel.glassOpacity 
                      ? `rgba(255, 255, 255, ${1 - lookAndFeel.glassOpacity})` 
                      : (lookAndFeel.cardShadow === 'none' ? 'transparent' : '#ffffff'),
                    backdropFilter: lookAndFeel.glassOpacity ? 'blur(12px)' : 'none',
                    borderWidth: `${lookAndFeel.borderWidth ?? 0}px`,
                    borderColor: lookAndFeel.borderColor || 'transparent',
                    borderStyle: (lookAndFeel.borderWidth ?? 0) > 0 ? 'solid' : 'none'
                  }}
                >
                  <h2 
                    className="mb-2 font-bold text-gray-900"
                    style={{ 
                      fontFamily: lookAndFeel.headingFont || lookAndFeel.fontFamily,
                      fontSize: lookAndFeel.baseFontSize === 'lg' ? '1.5rem' : lookAndFeel.baseFontSize === 'sm' ? '1.125rem' : '1.25rem'
                    }}
                  >
                    Sample Question
                  </h2>
                  <p 
                    className="mb-6 text-gray-600"
                    style={{
                      fontSize: lookAndFeel.baseFontSize === 'lg' ? '1.125rem' : lookAndFeel.baseFontSize === 'sm' ? '0.875rem' : '1rem'
                    }}
                  >
                    How satisfied are you with our service?
                  </p>

                  {/* Radio Options */}
                  <div className={cn(
                    'space-y-3 mb-6',
                    (lookAndFeel.selectionStyle === 'pill' || lookAndFeel.selectionStyle === 'bubble') && 'flex flex-wrap gap-2 space-y-0'
                  )}>
                    {['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'].map(
                      (option, idx) => {
                        const isSelected = idx === 1;
                        const style = lookAndFeel.selectionStyle || 'radio';

                        // Pill style
                        if (style === 'pill') {
                          return (
                            <div
                              key={option}
                              className={cn(
                                'cursor-pointer rounded-full px-4 py-2 font-medium transition-all',
                                isSelected
                                  ? 'text-white'
                                  : 'border border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                              )}
                              style={{
                                backgroundColor: isSelected ? lookAndFeel.primaryColor : undefined,
                                fontSize: lookAndFeel.baseFontSize === 'lg' ? '1rem' : lookAndFeel.baseFontSize === 'sm' ? '0.75rem' : '0.875rem'
                              }}
                            >
                              {option}
                            </div>
                          );
                        }

                        // Bubble style
                        if (style === 'bubble') {
                          return (
                            <div
                              key={option}
                              className={cn(
                                'cursor-pointer rounded-full px-4 py-2 font-medium transition-all border-2',
                                isSelected
                                  ? 'text-white'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                              )}
                              style={{
                                fontSize: lookAndFeel.baseFontSize === 'lg' ? '1rem' : lookAndFeel.baseFontSize === 'sm' ? '0.75rem' : '0.875rem',
                                ...(isSelected ? { 
                                  backgroundColor: `${lookAndFeel.primaryColor}20`,
                                  borderColor: lookAndFeel.primaryColor,
                                  color: lookAndFeel.primaryColor
                                } : {})
                              }}
                            >
                              {isSelected && <Check className="mr-1 inline-block h-3 w-3" />}
                              {option}
                            </div>
                          );
                        }

                        // Button style
                        if (style === 'button') {
                          return (
                            <div
                              key={option}
                              className={cn(
                                'cursor-pointer px-4 py-3 font-medium transition-all border-2 w-full text-center',
                                isSelected
                                  ? 'text-white'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                              )}
                              style={{
                                borderRadius: `${Math.min(lookAndFeel.borderRadius, 12)}px`,
                                fontSize: lookAndFeel.baseFontSize === 'lg' ? '1rem' : lookAndFeel.baseFontSize === 'sm' ? '0.75rem' : '0.875rem',
                                ...(isSelected ? { 
                                  backgroundColor: lookAndFeel.primaryColor,
                                  borderColor: lookAndFeel.primaryColor,
                                } : {})
                              }}
                            >
                              {option}
                            </div>
                          );
                        }

                        // Classic style (default)
                        return (
                          <label
                            key={option}
                            className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:bg-gray-50"
                            style={{
                              borderRadius: `${Math.min(lookAndFeel.borderRadius, 12)}px`,
                            }}
                          >
                            <div
                              className={cn(
                                'flex h-5 w-5 items-center justify-center rounded-full border-2',
                                isSelected ? '' : 'border-gray-300'
                              )}
                              style={isSelected ? { borderColor: lookAndFeel.primaryColor } : {}}
                            >
                              {isSelected && (
                                <div
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{ backgroundColor: lookAndFeel.primaryColor }}
                                />
                              )}
                            </div>
                            <span 
                              className="text-gray-700"
                              style={{
                                fontSize: lookAndFeel.baseFontSize === 'lg' ? '1rem' : lookAndFeel.baseFontSize === 'sm' ? '0.75rem' : '0.875rem'
                              }}
                            >
                              {option}
                            </span>
                          </label>
                        );
                      }
                    )}
                  </div>

                  {/* Text Input Preview */}
                  <div className="mb-8">
                     <label className="block mb-2 text-sm font-medium text-gray-700">Additional Comments</label>
                     <input 
                       type="text" 
                       placeholder="Type here..."
                       className={cn(
                         "w-full transition-all focus:outline-none",
                         lookAndFeel.inputStyle === 'flushed' ? 'border-b-2 border-gray-200 bg-transparent px-0 py-2 focus:border-brand-teal' :
                         lookAndFeel.inputStyle === 'filled' ? 'bg-gray-100 border-0 rounded-lg px-4 py-3 focus:bg-gray-200' :
                         lookAndFeel.inputStyle === 'floating' ? 'border border-gray-200 rounded-lg px-4 py-3 shadow-sm focus:shadow-md focus:border-brand-teal' :
                         'border border-gray-200 rounded-lg px-4 py-3 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal' // standard
                       )}
                       style={{
                         borderRadius: lookAndFeel.inputStyle !== 'flushed' ? `${lookAndFeel.borderRadius}px` : '0',
                         borderColor: lookAndFeel.inputStyle === 'flushed' || lookAndFeel.inputStyle === 'standard' || lookAndFeel.inputStyle === 'floating' ? undefined : 'transparent'
                       }}
                     />
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between">
                    <button
                      className={cn(
                        "px-6 py-2.5 font-medium transition-all",
                        lookAndFeel.buttonTextTransform === 'uppercase' && 'uppercase',
                        lookAndFeel.buttonTextTransform === 'capitalize' && 'capitalize'
                      )}
                      style={{ 
                        borderRadius: `${Math.min(lookAndFeel.borderRadius, 12)}px`,
                        fontSize: lookAndFeel.baseFontSize === 'lg' ? '1rem' : lookAndFeel.baseFontSize === 'sm' ? '0.75rem' : '0.875rem',
                        ...(lookAndFeel.buttonStyle === 'outline' ? {
                          border: '1px solid #e5e7eb',
                          color: '#374151'
                        } : {
                          color: '#374151',
                          backgroundColor: '#f3f4f6'
                        })
                      }}
                    >
                      Back
                    </button>
                    <button
                      className={cn(
                        "px-6 py-2.5 font-medium transition-all",
                        lookAndFeel.buttonTextTransform === 'uppercase' && 'uppercase',
                        lookAndFeel.buttonTextTransform === 'capitalize' && 'capitalize'
                      )}
                      style={{
                        borderRadius: `${Math.min(lookAndFeel.borderRadius, 12)}px`,
                        fontSize: lookAndFeel.baseFontSize === 'lg' ? '1rem' : lookAndFeel.baseFontSize === 'sm' ? '0.75rem' : '0.875rem',
                        ...(lookAndFeel.buttonStyle === 'outline' ? {
                          border: `1px solid ${lookAndFeel.primaryColor}`,
                          color: lookAndFeel.primaryColor,
                          backgroundColor: 'transparent'
                        } : lookAndFeel.buttonStyle === 'soft' ? {
                          backgroundColor: `${lookAndFeel.primaryColor}20`,
                          color: lookAndFeel.primaryColor
                        } : {
                          backgroundColor: lookAndFeel.primaryColor,
                          color: '#ffffff'
                        })
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
