import { useState } from 'react';
import { X, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewProjectModalProps {
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; type: string }) => void;
}

export function NewProjectModal({ onClose, onSubmit }: NewProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit({
      name: formData.name,
      description: formData.description,
      type: 'Discovery', // Default type for interview projects
    });
  };

  const isValid = formData.name.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-white px-6 py-5">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light">
              <FolderKanban className="h-5 w-5 text-brand-teal" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-brand-dark">New Project</h2>
              <p className="text-sm text-gray-500">
                Create a project to organize your discovery interviews.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Project Name <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g., Q1 2025 Process Discovery"
              className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
              rows={3}
              placeholder="What are you trying to discover?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className={cn(
                'flex items-center rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors',
                isValid ? 'bg-brand-teal hover:bg-teal-700' : 'cursor-not-allowed bg-gray-300'
              )}
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
