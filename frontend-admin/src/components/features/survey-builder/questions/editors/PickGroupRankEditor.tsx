'use client';

import React, { useState } from 'react';
import { PickGroupRankQuestion } from '@/api/contracts';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PickGroupRankEditorProps {
  blockId: string;
  question: PickGroupRankQuestion;
}

interface DraggableItemProps {
  item: PickGroupRankQuestion['items'][0];
  onUpdateText: (itemId: string, text: string) => void;
  onDelete: (itemId: string) => void;
  isInGroup?: boolean;
}

function DraggableItem({ item, onUpdateText, onDelete, isInGroup }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 rounded-lg border bg-white p-2 hover:bg-gray-50",
        isDragging && "shadow-lg ring-2 ring-brand-teal",
        isInGroup ? "border-gray-200" : "border-gray-300"
      )}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        value={item.text}
        onChange={(e) => onUpdateText(item.id, e.target.value)}
        className="flex-1 border-b border-transparent bg-transparent text-sm hover:border-gray-300 focus:border-brand-teal focus:outline-none"
        placeholder="Item text"
      />
      {!isInGroup && (
        <button
          onClick={() => onDelete(item.id)}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

interface GroupContainerProps {
  group: PickGroupRankQuestion['groups'][0];
  items: PickGroupRankQuestion['items'];
  stackItemsInGroups?: boolean;
  onUpdateGroupName: (groupId: string, name: string) => void;
  onUpdateItemText: (itemId: string, text: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onDeleteItem: (itemId: string) => void;
}

function GroupContainer({ group, items, stackItemsInGroups, onUpdateGroupName, onUpdateItemText, onDeleteGroup, onDeleteItem }: GroupContainerProps) {
  const groupItems = items.filter(i => i.groupId === group.id).sort((a, b) => (a.rank || 0) - (b.rank || 0));

  return (
    <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-3">
      <div className="group mb-2 flex items-center justify-between">
        <input
          type="text"
          value={group.name}
          onChange={(e) => onUpdateGroupName(group.id, e.target.value)}
          className="flex-1 border-b border-transparent bg-transparent font-medium text-gray-700 hover:border-gray-300 focus:border-brand-teal focus:outline-none"
          placeholder="Group name"
        />
        <button
          onClick={() => onDeleteGroup(group.id)}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <SortableContext items={groupItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div className={cn(
          "min-h-[100px] space-y-1",
          stackItemsInGroups && "relative min-h-[60px]"
        )}>
          {groupItems.length === 0 ? (
            <div className="flex h-24 items-center justify-center text-xs text-gray-400">
              Drag items here
            </div>
          ) : stackItemsInGroups ? (
            <div className="relative h-16">
              {groupItems.map((item, index) => (
                <div
                  key={item.id}
                  style={{ top: `${index * 4}px`, left: `${index * 4}px` }}
                  className="absolute rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
                >
                  {item.text}
                </div>
              ))}
              <div className="absolute bottom-0 right-0 text-xs text-gray-500">
                {groupItems.length} item{groupItems.length !== 1 ? 's' : ''}
              </div>
            </div>
          ) : (
            groupItems.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-teal text-xs font-bold text-white">
                  {index + 1}
                </span>
                <DraggableItem
                  item={item}
                  onUpdateText={onUpdateItemText}
                  onDelete={onDeleteItem}
                  isInGroup
                />
              </div>
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function PickGroupRankEditor({ blockId, question }: PickGroupRankEditorProps) {
  const { dispatch } = useSurveyBuilder();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const updateQuestion = (updates: Partial<PickGroupRankQuestion>) => {
    dispatch({
      type: 'UPDATE_QUESTION',
      payload: { blockId, question: { ...question, ...updates } },
    });
  };

  const addItem = () => {
    const newItem = {
      id: crypto.randomUUID(),
      text: `Item ${question.items.length + 1}`,
    };
    updateQuestion({ items: [...question.items, newItem] });
  };

  const addGroup = () => {
    const newGroup = {
      id: crypto.randomUUID(),
      name: `Group ${question.groups.length + 1}`,
    };
    updateQuestion({ groups: [...question.groups, newGroup] });
  };

  const deleteItem = (itemId: string) => {
    const items = question.items.filter(i => i.id !== itemId);
    updateQuestion({ items });
  };

  const deleteGroup = (groupId: string) => {
    if (question.groups.length <= 1) return;
    const groups = question.groups.filter(g => g.id !== groupId);
    // Move items from deleted group back to ungrouped
    const items = question.items.map(i => i.groupId === groupId ? { ...i, groupId: undefined, rank: undefined } : i);
    updateQuestion({ groups, items });
  };

  const updateItemText = (itemId: string, text: string) => {
    const items = question.items.map(i => i.id === itemId ? { ...i, text } : i);
    updateQuestion({ items });
  };

  const updateGroupName = (groupId: string, name: string) => {
    const groups = question.groups.map(g => g.id === groupId ? { ...g, name } : g);
    updateQuestion({ groups });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeItem = question.items.find(i => i.id === active.id);
    if (!activeItem) return;

    const overId = over.id as string;

    // Check if dropped on a group
    const targetGroup = question.groups.find(g => g.id === overId);
    if (targetGroup) {
      // Move item to this group
      const groupItems = question.items.filter(i => i.groupId === targetGroup.id);
      const items = question.items.map(i => 
        i.id === activeItem.id 
          ? { ...i, groupId: targetGroup.id, rank: groupItems.length + 1 }
          : i
      );
      updateQuestion({ items });
      return;
    }

    // Check if dropped on another item
    const overItem = question.items.find(i => i.id === overId);
    if (overItem) {
      // If both in same group, reorder
      if (activeItem.groupId === overItem.groupId) {
        const groupItems = question.items
          .filter(i => i.groupId === activeItem.groupId)
          .sort((a, b) => (a.rank || 0) - (b.rank || 0));
        
        const oldIndex = groupItems.findIndex(i => i.id === activeItem.id);
        const newIndex = groupItems.findIndex(i => i.id === overItem.id);
        
        const reordered = arrayMove(groupItems, oldIndex, newIndex);
        const reranked = reordered.map((item, index) => ({ ...item, rank: index + 1 }));
        
        const items = question.items.map(i => {
          const rerankedItem = reranked.find(ri => ri.id === i.id);
          return rerankedItem || i;
        });
        
        updateQuestion({ items });
      }
    }

    // If dropped on ungrouped area
    if (overId === 'ungrouped' || !targetGroup) {
      const items = question.items.map(i =>
        i.id === activeItem.id
          ? { ...i, groupId: undefined, rank: undefined }
          : i
      );
      updateQuestion({ items });
    }
  };

  const ungroupedItems = question.items.filter(i => !i.groupId);
  const activeItem = question.items.find(i => i.id === activeId);

  const gridCols = question.columns === 2 ? 'grid-cols-2' : 'grid-cols-1';

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-4">


        {/* Ungrouped Items */}
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <h4 className="mb-2 text-sm font-medium text-gray-700">Ungrouped Items</h4>
          <SortableContext items={ungroupedItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1">
              {ungroupedItems.length === 0 ? (
                <p className="text-xs text-gray-500 py-2">All items grouped or none added yet</p>
              ) : question.stackItems ? (
                <div className="relative h-16">
                  {ungroupedItems.map((item, index) => (
                    <div
                      key={item.id}
                      style={{ top: `${index * 4}px`, left: `${index * 4}px` }}
                      className="absolute rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
                    >
                      {item.text}
                    </div>
                  ))}
                </div>
              ) : (
                ungroupedItems.map(item => (
                  <DraggableItem
                    key={item.id}
                    item={item}
                    onUpdateText={updateItemText}
                    onDelete={deleteItem}
                  />
                ))
              )}
            </div>
          </SortableContext>
          <button
            onClick={addItem}
            className="mt-2 flex w-full items-center justify-center gap-1 rounded border border-dashed border-gray-300 py-2 text-xs text-gray-600 hover:border-brand-teal hover:text-brand-teal"
          >
            <Plus className="h-3 w-3" />
            Add Item
          </button>
        </div>

        {/* Groups */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Groups</h4>
            <button
              onClick={addGroup}
              className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:border-brand-teal hover:text-brand-teal"
            >
              + Add Group
            </button>
          </div>
          <div className={cn("grid gap-3", gridCols)}>
            {question.groups.map(group => (
              <GroupContainer
                key={group.id}
                group={group}
                items={question.items}
                stackItemsInGroups={question.stackItemsInGroups}
                onUpdateGroupName={updateGroupName}
                onUpdateItemText={updateItemText}
                onDeleteGroup={deleteGroup}
                onDeleteItem={deleteItem}
              />
            ))}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeItem && (
          <div className="rounded-lg border border-brand-teal bg-white p-2 shadow-lg">
            <span className="text-sm font-medium">{activeItem.text}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
