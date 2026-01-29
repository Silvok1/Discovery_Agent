'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderKanban, BarChart3, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Insights', href: '/insights', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const COLLAPSED_WIDTH = 'w-16';
const EXPANDED_WIDTH = 'w-64';
const STORAGE_KEY = 'sidebar-collapsed';

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Hydration-safe: load collapsed state from localStorage only on client
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div 
      className={cn(
        'flex h-screen flex-col border-r bg-white transition-all duration-300',
        isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH
      )}
    >
      {/* Header with toggle button */}
      <div className="flex h-16 items-center justify-between border-b px-3">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-brand-dark">Discovery Agent</h1>
        )}
        <button
          onClick={toggleCollapse}
          className={cn(
            'rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-dark transition-colors',
            isCollapsed && 'mx-auto'
          )}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-light text-brand-dark'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-brand-dark',
                isCollapsed && 'justify-center'
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 flex-shrink-0',
                  isActive ? 'text-brand-teal' : 'text-gray-400 group-hover:text-brand-teal',
                  !isCollapsed && 'mr-3'
                )}
              />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
