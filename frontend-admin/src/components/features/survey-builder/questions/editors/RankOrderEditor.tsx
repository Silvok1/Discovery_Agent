'use client';

import React, { useState } from 'react';
import { RankOrderQuestion } from '@/api/contracts';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface RankOrderEditorProps {
  blockId: string;
  question: RankOrderQuestion;
}

interface SortableItemProps {
  item: RankOrderQuestion['items'][0];
  index: number;
  format: RankOrderQuestion['format'];
  totalItems: number;
  onUpdateText: (itemId: string, text: string) => void;
  onUpdateRank: (itemId: string, rank: number) => void;
  onDelete: (itemId: string) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
}

function SortableItem({ item, index, format, totalItems, onUpdateText, onUpdateRank, onDelete, onMove }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (format === 'dragDrop') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "group flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 hover:bg-gray-50",
          isDragging && "shadow-lg ring-2 ring-brand-teal"
        )}
      >
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded bg-brand-teal text-xs font-bold text-white">
          {index + 1}
        </span>
        <input
          type="text"
          value={item.text}
          onChange={(e) => onUpdateText(item.id, e.target.value)}
          className="flex-1 border-b border-transparent bg-transparent text-sm hover:border-gray-300 focus:border-brand-teal focus:outline-none"
          placeholder={`Item ${index + 1}`}
        />
        <button
          onClick={() => onDelete(item.id)}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (format === 'textBox') {
    return (
      <div className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
        <input
          type="text"
          value={item.text}
          onChange={(e) => onUpdateText(item.id, e.target.value)}
          className="flex-1 border-b border-transparent bg-transparent text-sm hover:border-gray-300 focus:border-brand-teal focus:outline-none"
          placeholder={`Item ${index + 1}`}
        />
        <input
          type="number"
          min="1"
          max={totalItems}
          value={item.rank || ''}
          onChange={(e) => onUpdateRank(item.id, parseInt(e.target.value) || 0)}
          placeholder="Rank"
          className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
        />
        <button
          onClick={() => onDelete(item.id)}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (format === 'radioButtons') {
    return (
      <div className="flex items-center gap-2 border-b border-gray-100 py-2">
        <input
          type="text"
          value={item.text}
          onChange={(e) => onUpdateText(item.id, e.target.value)}
          className="w-48 border-b border-transparent bg-transparent text-sm hover:border-gray-300 focus:border-brand-teal focus:outline-none"
          placeholder={`Item ${index + 1}`}
        />
        <div className="flex flex-1 flex-wrap gap-2">
          {Array.from({ length: totalItems }, (_, i) => (
            <button
              key={i}
              onClick={() => onUpdateRank(item.id, i + 1)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded border text-xs font-medium transition-colors",
                item.rank === i + 1
                  ? "border-brand-teal bg-brand-teal text-white"
                  : "border-gray-300 text-gray-600 hover:border-brand-teal"
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button
          onClick={() => onDelete(item.id)}
          className="p-1 text-gray-400 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // selectBox format
  return (
    <div className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
      <span className="flex h-6 w-6 items-center justify-center rounded bg-gray-200 text-xs font-bold text-gray-600">
        {index + 1}
      </span>
      <input
        type="text"
        value={item.text}
        onChange={(e) => onUpdateText(item.id, e.target.value)}
        className="flex-1 border-b border-transparent bg-transparent text-sm hover:border-gray-300 focus:border-brand-teal focus:outline-none"
        placeholder={`Item ${index + 1}`}
      />
      <div className="flex gap-1">
        <button
          onClick={() => onMove(index, 'up')}
          disabled={index === 0}
          className="rounded border border-gray-300 p-1 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move up"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          onClick={() => onMove(index, 'down')}
          disabled={index === totalItems - 1}
          className="rounded border border-gray-300 p-1 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move down"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function RankOrderEditor({ blockId, question }: RankOrderEditorProps) {
  const { dispatch } = useSurveyBuilder();

  // Use higher activation distance to avoid conflict with parent drag
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const updateQuestion = (updates: Partial<RankOrderQuestion>) => {
    dispatch({
      type: 'UPDATE_QUESTION',
      payload: { blockId, question: { ...question, ...updates } },
    });
  };

  const addItem = () => {
    const newItem = {
      id: crypto.randomUUID(),
      text: `Item ${question.items.length + 1}`,
      rank: question.items.length + 1,
    };
    updateQuestion({ items: [...question.items, newItem] });
  };

  const deleteItem = (itemId: string) => {
    if (question.items.length <= 1) return;
    const items = question.items.filter(i => i.id !== itemId);
    // Re-rank remaining items
    const reranked = items.map((item, index) => ({ ...item, rank: index + 1 }));
    updateQuestion({ items: reranked });
  };

  const updateItemText = (itemId: string, text: string) => {
    const items = question.items.map(i => i.id === itemId ? { ...i, text } : i);
    updateQuestion({ items });
  };

  const updateItemRank = (itemId: string, rank: number) => {
    const items = question.items.map(i => i.id === itemId ? { ...i, rank } : i);
    updateQuestion({ items });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === question.items.length - 1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = arrayMove(question.items, index, newIndex);
    const reranked = reordered.map((item, idx) => ({ ...item, rank: idx + 1 }));
    updateQuestion({ items: reranked });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = question.items.findIndex(i => i.id === active.id);
    const newIndex = question.items.findIndex(i => i.id === over.id);

    const reordered = arrayMove(question.items, oldIndex, newIndex);
    const reranked = reordered.map((item, index) => ({ ...item, rank: index + 1 }));
    updateQuestion({ items: reranked });
  };

  const sortedItems = [...question.items].sort((a, b) => (a.rank || 0) - (b.rank || 0));

  if (question.format === 'dragDrop') {
    return (
      <div className="space-y-4">


        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sortedItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {sortedItems.map((item, index) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  index={index}
                  format={question.format}
                  totalItems={question.items.length}
                  onUpdateText={updateItemText}
                  onUpdateRank={updateItemRank}
                  onDelete={deleteItem}
                  onMove={moveItem}
                />
              ))}
            </SortableContext>
          </DndContext>
          <button
            onClick={addItem}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-600 hover:border-brand-teal hover:text-brand-teal"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">


      <div className="space-y-2">
        {question.format === 'radioButtons' && (
          <div className="mb-2 text-xs text-gray-500">
            Click a rank number for each item to assign its position
          </div>
        )}
        {sortedItems.map((item, index) => (
          <SortableItem
            key={item.id}
            item={item}
            index={index}
            format={question.format}
            totalItems={question.items.length}
            onUpdateText={updateItemText}
            onUpdateRank={updateItemRank}
            onDelete={deleteItem}
            onMove={moveItem}
          />
        ))}
        <button
          onClick={addItem}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-600 hover:border-brand-teal hover:text-brand-teal"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>
    </div>
  );
}
