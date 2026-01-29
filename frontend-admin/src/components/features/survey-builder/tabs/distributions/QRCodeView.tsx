'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Check, Palette, Link2, AlertCircle, RefreshCw } from 'lucide-react';
import { distributionService } from '@/api/services/distributionService';
import { QRCodeSettings } from '@/api/contracts';
import { cn } from '@/lib/utils';

interface QRCodeViewProps {
  instanceId: string;
}

const SIZE_OPTIONS = [
  { value: 128, label: 'Small (128px)' },
  { value: 256, label: 'Medium (256px)' },
  { value: 512, label: 'Large (512px)' },
  { value: 1024, label: 'Extra Large (1024px)' },
];

const PRESET_COLORS = [
  { fg: '#000000', bg: '#ffffff', name: 'Classic' },
  { fg: '#1ca08f', bg: '#ffffff', name: 'Brand Teal' },
  { fg: '#1e3a5f', bg: '#ffffff', name: 'Navy' },
  { fg: '#7c3aed', bg: '#ffffff', name: 'Purple' },
  { fg: '#dc2626', bg: '#ffffff', name: 'Red' },
  { fg: '#ffffff', bg: '#1e3a5f', name: 'Inverted Navy' },
];

export function QRCodeView({ instanceId }: QRCodeViewProps) {
  const [settings, setSettings] = useState<QRCodeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSettings();
  }, [instanceId]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await distributionService.getQRCodeSettings(instanceId);
      setSettings(data);
    } catch (error) {
      console.error('Failed to load QR code settings:', error);
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

  const handleUpdateSettings = async (updates: Partial<QRCodeSettings>) => {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await distributionService.updateQRCodeSettings(instanceId, updates);
      setSettings(updated);
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async (format: 'png' | 'svg') => {
    if (!qrRef.current || !settings) return;

    // Log download for analytics
    await distributionService.logQRCodeDownload(instanceId);

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    if (format === 'svg') {
      // Download as SVG
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      downloadFile(url, `survey-qr-${instanceId}.svg`);
      URL.revokeObjectURL(url);
    } else {
      // Download as PNG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const downloadSize = settings.size * 2; // Higher resolution for download
      canvas.width = downloadSize;
      canvas.height = downloadSize;

      const img = new Image();
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.fillStyle = settings.backgroundColor;
        ctx.fillRect(0, 0, downloadSize, downloadSize);
        ctx.drawImage(img, 0, 0, downloadSize, downloadSize);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const pngUrl = URL.createObjectURL(blob);
            downloadFile(pngUrl, `survey-qr-${instanceId}.png`);
            URL.revokeObjectURL(pngUrl);
          }
        }, 'image/png');
        
        URL.revokeObjectURL(url);
      };

      img.src = url;
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
        <p className="text-red-700">Failed to load QR code settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">QR Code</h2>
        <p className="mt-1 text-sm text-gray-500">
          Generate and customize a QR code for your survey. Perfect for print materials, posters, or in-person distribution.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Code Preview */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Preview</h3>
            <button
              onClick={loadSettings}
              disabled={loading}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
              Refresh
            </button>
          </div>
          
          <div 
            ref={qrRef}
            className="flex items-center justify-center rounded-lg p-8"
            style={{ backgroundColor: settings.backgroundColor }}
          >
            <QRCodeSVG
              value={settings.url}
              size={Math.min(settings.size, 300)}
              fgColor={settings.foregroundColor}
              bgColor={settings.backgroundColor}
              level="M"
              includeMargin
              imageSettings={settings.logoUrl ? {
                src: settings.logoUrl,
                height: Math.min(settings.size, 300) * 0.2,
                width: Math.min(settings.size, 300) * 0.2,
                excavate: true,
              } : undefined}
            />
          </div>

          {/* Download Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => handleDownload('png')}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-brand-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              <Download className="h-4 w-4" />
              Download PNG
            </button>
            <button
              onClick={() => handleDownload('svg')}
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Download SVG
            </button>
          </div>

          {/* Link Display */}
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-gray-500">Survey URL</label>
            <div className="flex gap-2">
              <div className="flex-1 truncate rounded-md border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs text-gray-600">
                {settings.url}
              </div>
              <button
                onClick={handleCopyLink}
                className={cn(
                  'flex items-center gap-1 rounded-md px-3 py-2 text-xs font-medium',
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Customization Options */}
        <div className="space-y-4">
          {/* Size Selection */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 font-medium text-gray-900">Size</h3>
            <div className="grid grid-cols-2 gap-2">
              {SIZE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleUpdateSettings({ size: option.value })}
                  disabled={saving}
                  className={cn(
                    'rounded-md border px-4 py-2 text-sm font-medium transition-colors',
                    settings.size === option.value
                      ? 'border-brand-teal bg-brand-light/30 text-brand-teal'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Presets */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <Palette className="h-4 w-4 text-gray-500" />
              <h3 className="font-medium text-gray-900">Color Presets</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleUpdateSettings({ 
                    foregroundColor: preset.fg, 
                    backgroundColor: preset.bg 
                  })}
                  disabled={saving}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-md border p-3 transition-colors',
                    settings.foregroundColor === preset.fg && settings.backgroundColor === preset.bg
                      ? 'border-brand-teal ring-2 ring-brand-teal/20'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div 
                    className="h-8 w-8 rounded border"
                    style={{ 
                      background: `linear-gradient(135deg, ${preset.fg} 50%, ${preset.bg} 50%)` 
                    }}
                  />
                  <span className="text-xs text-gray-600">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 font-medium text-gray-900">Custom Colors</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-gray-600">Foreground</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.foregroundColor}
                    onChange={(e) => handleUpdateSettings({ foregroundColor: e.target.value })}
                    className="h-10 w-14 cursor-pointer rounded border border-gray-200"
                  />
                  <input
                    type="text"
                    value={settings.foregroundColor}
                    onChange={(e) => handleUpdateSettings({ foregroundColor: e.target.value })}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-1 font-mono text-sm uppercase"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">Background</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) => handleUpdateSettings({ backgroundColor: e.target.value })}
                    className="h-10 w-14 cursor-pointer rounded border border-gray-200"
                  />
                  <input
                    type="text"
                    value={settings.backgroundColor}
                    onChange={(e) => handleUpdateSettings({ backgroundColor: e.target.value })}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-1 font-mono text-sm uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Download Stats */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Downloads</span>
              <span className="text-lg font-semibold text-gray-900">{settings.downloadCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex gap-3">
          <Link2 className="h-5 w-5 flex-shrink-0 text-blue-500" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">About QR Code Distribution</p>
            <p className="mt-1">
              This QR code links to your <strong>anonymous survey link</strong>. Anyone who scans it can 
              complete the survey without identification. Great for print materials, event signage, 
              product packaging, or in-store displays.
            </p>
            <p className="mt-2">
              <strong>Tip:</strong> For best scanning results, ensure adequate contrast between foreground 
              and background colors, and print at a size of at least 1 inch (2.5 cm).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
