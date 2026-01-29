'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Copy, ExternalLink, User, Mail, Upload, Download, FileSpreadsheet, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { instanceService, Participant } from '@/api/services/instanceService';

interface ParticipantsPanelProps {
  instanceId: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export function ParticipantsPanel({ instanceId }: ParticipantsPanelProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [formData, setFormData] = useState({ email: '', firstName: '', lastName: '', background: '' });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadParticipants();
  }, [instanceId]);

  const loadParticipants = async () => {
    try {
      const data = await instanceService.getParticipants(instanceId);
      setParticipants(data);
    } catch (error) {
      console.error('Failed to load participants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim()) return;

    setIsAdding(true);
    try {
      const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(' ');
      const newParticipant = await instanceService.addParticipant(instanceId, {
        email: formData.email,
        name: fullName || undefined,
        background: formData.background || undefined,
      });
      setParticipants([newParticipant, ...participants]);
      setFormData({ email: '', firstName: '', lastName: '', background: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add participant:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const copyInterviewLink = (token: string) => {
    const url = `${window.location.origin}/interview/${token}`;
    navigator.clipboard.writeText(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'started':
        return 'bg-blue-100 text-blue-700';
      case 'invited':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading participants...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-brand-dark">Participants</h2>
          <p className="text-sm text-gray-500">
            {participants.length} participant{participants.length !== 1 ? 's' : ''} invited
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Upload className="h-4 w-4" />
            Import Participants
          </button>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            Add Participant
          </button>
        </div>
      </div>

      {/* Add Participant Form */}
      {showAddForm && (
        <form onSubmit={handleAddParticipant} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="font-medium text-gray-900 mb-4">Add New Participant</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                placeholder="Doe"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
              placeholder="john.doe@company.com"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
            <textarea
              value={formData.background}
              onChange={(e) => setFormData({ ...formData, background: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
              placeholder="Role, department, or relevant context about this participant..."
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding || !formData.email.trim()}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white',
                isAdding || !formData.email.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-brand-teal hover:bg-teal-700'
              )}
            >
              {isAdding ? 'Adding...' : 'Add Participant'}
            </button>
          </div>
        </form>
      )}

      {/* Participants List */}
      {participants.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
          <User className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-sm font-medium text-gray-900">No participants yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Add participants individually or import them from a file.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {participant.name || participant.email}
                    </span>
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', getStatusColor(participant.status))}>
                      {participant.status}
                    </span>
                  </div>
                  {participant.name && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Mail className="h-3 w-3" />
                      {participant.email}
                    </div>
                  )}
                  {participant.background && (
                    <p className="text-sm text-gray-500 mt-1">{participant.background}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyInterviewLink(participant.uniqueToken)}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                  title="Copy interview link"
                >
                  <Copy className="h-3 w-3" />
                  Copy Link
                </button>
                <a
                  href={`/interview/${participant.uniqueToken}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                  title="Open interview"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportParticipantsModal
          instanceId={instanceId}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            loadParticipants();
          }}
        />
      )}
    </div>
  );
}

// Import Modal Component
interface ImportModalProps {
  instanceId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function ImportParticipantsModal({ instanceId, onClose, onSuccess }: ImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<Array<Record<string, string>>>([]);

  const downloadTemplate = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Background'];
    const exampleRows = [
      ['John', 'Doe', 'john.doe@company.com', 'Senior Engineer, IT Department'],
      ['Jane', 'Smith', 'jane.smith@company.com', 'Project Manager, Operations'],
      ['Mike', 'Johnson', 'mike.j@company.com', 'Analyst, Finance Team'],
    ];

    const csvContent = [
      headers.join(','),
      ...exampleRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'participant_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setParseError(null);
    setImportResult(null);

    // Parse file for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCSV(text);
        if (rows.length < 1) {
          setParseError('File appears to be empty or missing data rows');
          return;
        }
        setPreviewData(rows.slice(0, 6)); // Show first 5 data rows
      } catch {
        setParseError('Failed to parse file. Please ensure it is a valid CSV file.');
      }
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string): Array<Record<string, string>> => {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());

    // Map common variations to standard field names
    const fieldMap: Record<string, string> = {
      'first name': 'firstName',
      'firstname': 'firstName',
      'first_name': 'firstName',
      'last name': 'lastName',
      'lastname': 'lastName',
      'last_name': 'lastName',
      'email': 'email',
      'email address': 'email',
      'background': 'background',
      'context': 'background',
      'notes': 'background',
      'role': 'background',
    };

    const normalizedHeaders = headers.map(h => fieldMap[h] || h);

    return lines.slice(1).map(line => {
      const values = parseCSVLine(line);
      const row: Record<string, string> = {};
      normalizedHeaders.forEach((header, i) => {
        if (values[i]) row[header] = values[i];
      });
      return row;
    }).filter(row => row.email); // Only rows with email
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleImport = async () => {
    if (!selectedFile || previewData.length === 0) return;

    setIsImporting(true);
    const results: ImportResult = { success: 0, failed: 0, errors: [] };

    try {
      // Read full file
      const text = await selectedFile.text();
      const allRows = parseCSV(text);

      // Import each participant
      for (let i = 0; i < allRows.length; i++) {
        const row = allRows[i];
        try {
          const name = [row.firstName, row.lastName].filter(Boolean).join(' ');
          await instanceService.addParticipant(instanceId, {
            email: row.email,
            name: name || undefined,
            background: row.background || undefined,
          });
          results.success++;
        } catch {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Failed to import ${row.email}`);
        }
      }

      setImportResult(results);
      if (results.success > 0) {
        setTimeout(() => onSuccess(), 2000);
      }
    } catch {
      setParseError('Failed to process file');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-brand-dark">Import Participants</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close modal">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Template Download */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Download Template</h3>
                <p className="text-sm text-gray-500">
                  Use our template to ensure your data imports correctly
                </p>
              </div>
              <button
                type="button"
                onClick={downloadTemplate}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Download CSV Template
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
                selectedFile ? 'border-brand-teal bg-teal-50' : 'border-gray-300 hover:border-gray-400'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Upload participant file"
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2">
                  <FileSpreadsheet className="h-8 w-8 text-brand-teal" />
                  <span className="font-medium text-brand-dark">{selectedFile.name}</span>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm font-medium text-gray-900">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">CSV or Excel files (XLSX, XLS)</p>
                </>
              )}
            </div>
          </div>

          {/* Parse Error */}
          {parseError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-5 w-5" />
              {parseError}
            </div>
          )}

          {/* Preview */}
          {previewData.length > 0 && !importResult && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Preview ({previewData.length > 5 ? '5' : previewData.length} of {previewData.length} rows)
              </h3>
              <div className="rounded-lg border border-gray-200 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">First Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Last Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Background</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {previewData.slice(0, 5).map((row, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-sm text-gray-900">{row.firstName || '-'}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{row.lastName || '-'}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{row.email}</td>
                        <td className="px-4 py-2 text-sm text-gray-500 truncate max-w-xs">{row.background || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className={cn(
              'rounded-lg p-4',
              importResult.failed === 0 ? 'bg-green-50' : 'bg-amber-50'
            )}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className={cn(
                  'h-5 w-5',
                  importResult.failed === 0 ? 'text-green-600' : 'text-amber-600'
                )} />
                <span className="font-medium">
                  {importResult.success} participant{importResult.success !== 1 ? 's' : ''} imported successfully
                </span>
              </div>
              {importResult.failed > 0 && (
                <div className="mt-2 text-sm text-amber-700">
                  <p>{importResult.failed} row{importResult.failed !== 1 ? 's' : ''} failed to import</p>
                  {importResult.errors.length > 0 && (
                    <ul className="mt-1 list-disc pl-5">
                      {importResult.errors.slice(0, 5).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {importResult ? 'Close' : 'Cancel'}
            </button>
            {!importResult && (
              <button
                type="button"
                onClick={handleImport}
                disabled={!selectedFile || previewData.length === 0 || isImporting}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white',
                  !selectedFile || previewData.length === 0 || isImporting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-brand-teal hover:bg-teal-700'
                )}
              >
                {isImporting ? (
                  <>Importing...</>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Import {previewData.length} Participant{previewData.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
