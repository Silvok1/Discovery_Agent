'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Block, Question } from '@/api/contracts';

export interface TrashItem {
  id: string;
  type: 'block' | 'question';
  data: Block | Question;
  originalBlockId?: string; // For questions, track which block they came from
  deletedAt: string;
  expiresAt: string; // 30 days from deletion
}

interface TrashContextValue {
  trashItems: TrashItem[];
  addToTrash: (item: Omit<TrashItem, 'id' | 'deletedAt' | 'expiresAt'>) => void;
  restoreFromTrash: (itemId: string) => TrashItem | null;
  permanentDelete: (itemId: string) => void;
  emptyTrash: () => void;
  getTrashCount: () => number;
}

const TrashContext = createContext<TrashContextValue | undefined>(undefined);

const TRASH_RETENTION_DAYS = 30;
const STORAGE_KEY = 'survey-builder-trash';

export function TrashProvider({ children }: { children: ReactNode }) {
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items: TrashItem[] = JSON.parse(stored);
        // Filter out expired items
        const now = new Date();
        const validItems = items.filter((item) => new Date(item.expiresAt) > now);
        setTrashItems(validItems);
        // Update storage if we removed expired items
        if (validItems.length !== items.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(validItems));
        }
      }
    } catch (e) {
      console.error('Failed to load trash from storage:', e);
    }
  }, []);

  // Save to localStorage whenever trash changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trashItems));
    } catch (e) {
      console.error('Failed to save trash to storage:', e);
    }
  }, [trashItems]);

  const addToTrash = useCallback(
    (item: Omit<TrashItem, 'id' | 'deletedAt' | 'expiresAt'>) => {
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + TRASH_RETENTION_DAYS);

      const trashItem: TrashItem = {
        ...item,
        id: `trash-${crypto.randomUUID()}`,
        deletedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      setTrashItems((prev) => [trashItem, ...prev]);
    },
    []
  );

  const restoreFromTrash = useCallback((itemId: string): TrashItem | null => {
    let restoredItem: TrashItem | null = null;
    setTrashItems((prev) => {
      const item = prev.find((i) => i.id === itemId);
      if (item) {
        restoredItem = item;
        return prev.filter((i) => i.id !== itemId);
      }
      return prev;
    });
    return restoredItem;
  }, []);

  const permanentDelete = useCallback((itemId: string) => {
    setTrashItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const emptyTrash = useCallback(() => {
    setTrashItems([]);
  }, []);

  const getTrashCount = useCallback(() => trashItems.length, [trashItems]);

  return (
    <TrashContext.Provider
      value={{
        trashItems,
        addToTrash,
        restoreFromTrash,
        permanentDelete,
        emptyTrash,
        getTrashCount,
      }}
    >
      {children}
    </TrashContext.Provider>
  );
}

export function useTrash() {
  const context = useContext(TrashContext);
  if (!context) {
    throw new Error('useTrash must be used within TrashProvider');
  }
  return context;
}
