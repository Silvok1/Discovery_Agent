'use client';

import { useState } from 'react';
import { useTrash, TrashItem } from '@/contexts/TrashContext';
import { Block, Question } from '@/api/contracts';

interface TrashPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreBlock?: (block: Block) => void;
  onRestoreQuestion?: (question: Question, blockId: string) => void;
}

export function TrashPanel({
  isOpen,
  onClose,
  onRestoreBlock,
  onRestoreQuestion,
}: TrashPanelProps) {
  const { trashItems, restoreFromTrash, permanentDelete, emptyTrash } = useTrash();
  const [confirmEmpty, setConfirmEmpty] = useState(false);

  if (!isOpen) return null;

  const handleRestore = (item: TrashItem) => {
    const restored = restoreFromTrash(item.id);
    if (restored) {
      if (item.type === 'block' && onRestoreBlock) {
        onRestoreBlock(item.data as Block);
      } else if (item.type === 'question' && onRestoreQuestion && item.originalBlockId) {
        onRestoreQuestion(item.data as Question, item.originalBlockId);
      }
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diffDays = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getItemTitle = (item: TrashItem) => {
    if (item.type === 'block') {
      const block = item.data as Block;
      return block.name || `Block`;
    } else {
      const question = item.data as Question;
      return question.text.substring(0, 50) + (question.text.length > 50 ? '...' : '');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <h2 className="font-semibold text-gray-900">Recycle Bin</h2>
            {trashItems.length > 0 && (
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                {trashItems.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
            title="Close"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {trashItems.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <p className="text-gray-500 font-medium">Recycle bin is empty</p>
              <p className="text-gray-400 text-sm mt-1">Deleted items will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trashItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        item.type === 'block' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}
                    >
                      {item.type === 'block' ? (
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                          />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            item.type === 'block'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {item.type === 'block' ? 'Block' : 'Question'}
                        </span>
                        <span className="text-xs text-gray-400">{formatTimeAgo(item.deletedAt)}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">{getItemTitle(item)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Expires in {getDaysUntilExpiry(item.expiresAt)} days
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleRestore(item)}
                      className="flex-1 px-3 py-1.5 text-sm font-medium text-brand-teal bg-teal-50 hover:bg-teal-100 rounded-md transition-colors"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => permanentDelete(item.id)}
                      className="flex-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                    >
                      Delete Forever
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {trashItems.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {!confirmEmpty ? (
              <button
                onClick={() => setConfirmEmpty(true)}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Empty Recycle Bin
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 text-center">
                  Permanently delete {trashItems.length} item{trashItems.length > 1 ? 's' : ''}?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmEmpty(false)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      emptyTrash();
                      setConfirmEmpty(false);
                    }}
                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete All
                  </button>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500 text-center mt-2">
              Items are automatically deleted after 30 days
            </p>
          </div>
        )}
      </div>
    </>
  );
}
