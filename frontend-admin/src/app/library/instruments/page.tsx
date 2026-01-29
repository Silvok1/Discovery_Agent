'use client';

import { useEffect, useState } from 'react';
import { Instrument } from '@/api/contracts';
import { libraryService } from '@/api/services/libraryService';
import { Search, Filter } from 'lucide-react';

export default function InstrumentLibraryPage() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('All');

  useEffect(() => {
    loadInstruments();
  }, []);

  const loadInstruments = async () => {
    setIsLoading(true);
    try {
      const data = await libraryService.getInstruments();
      setInstruments(data);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInstruments = filterType === 'All' 
    ? instruments 
    : instruments.filter(i => i.type === filterType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-dark">Instrument Library</h1>
        <button className="rounded-md bg-brand-teal px-4 py-2 text-white hover:bg-teal-700">
          New Item
        </button>
      </div>

      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            className="w-full rounded-md border border-gray-300 pl-10 p-2 focus:border-brand-blue focus:ring-brand-blue"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <select
            className="rounded-md border border-gray-300 pl-10 p-2 focus:border-brand-blue focus:ring-brand-blue"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Question">Question</option>
            <option value="Demographics">Demographics</option>
            <option value="Welcome Page">Welcome Page</option>
            <option value="Full Survey">Full Survey</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          filteredInstruments.map((item) => (
            <div key={item.id} className="rounded-lg border bg-white p-4 shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-brand-dark">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.type}</p>
                </div>
                <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                  {item.tags.join(', ')}
                </span>
              </div>
              <div className="mt-4 text-xs text-gray-400">
                Last modified: {new Date(item.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
