'use client';

import { useEffect, useState } from 'react';
import { Message } from '@/api/contracts';
import { libraryService } from '@/api/services/libraryService';
import { Plus } from 'lucide-react';

export default function MessageLibraryPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const data = await libraryService.getMessages();
      setMessages(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-dark">Message Library</h1>
        <button className="flex items-center rounded-md bg-brand-teal px-4 py-2 text-white hover:bg-teal-700">
          <Plus className="mr-2 h-4 w-4" />
          New Message
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Modified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr>
            ) : (
              messages.map((msg) => (
                <tr key={msg.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-brand-dark">{msg.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{msg.subject || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{msg.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(msg.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
