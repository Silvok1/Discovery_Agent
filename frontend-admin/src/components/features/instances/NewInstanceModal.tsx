import { useState } from 'react';
import { X } from 'lucide-react';

interface NewInstanceModalProps {
  onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => void;
}

export function NewInstanceModal({ onClose, onSubmit }: NewInstanceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-brand-dark">New Interview Instance</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Instance Name</label>
            <input
              type="text"
              required
              placeholder="e.g., Finance Team Interviews"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
              rows={3}
              placeholder="What do you want to discover from these interviews?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-brand-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              Create Instance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
