'use client';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, GripVertical, Mail, Phone, Calendar, Hash, MapPin, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import type { FormFieldQuestion } from '@/api/contracts';

interface FormFieldEditorProps {
  blockId: string;
  question: FormFieldQuestion;
}

function SortableField({ field, onDelete, onUpdate, canDelete }: {
  field: FormFieldQuestion['fields'][0];
  onDelete: () => void;
  onUpdate: (updates: Partial<FormFieldQuestion['fields'][0]>) => void;
  canDelete: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getContentTypeIcon = () => {
    switch (field.contentType) {
      case 'email': return <Mail className="h-3.5 w-3.5 text-blue-500" />;
      case 'phone': return <Phone className="h-3.5 w-3.5 text-green-500" />;
      case 'date': return <Calendar className="h-3.5 w-3.5 text-purple-500" />;
      case 'number': return <Hash className="h-3.5 w-3.5 text-orange-500" />;
      case 'postalCode': return <MapPin className="h-3.5 w-3.5 text-red-500" />;
      case 'url': return <LinkIcon className="h-3.5 w-3.5 text-teal-500" />;
      default: return null;
    }
  };

  const getSizeClass = () => {
    switch (field.size) {
      case 'short': return 'w-48';
      case 'medium': return 'w-80';
      case 'long': return 'w-full';
      case 'essay': return 'w-full';
      default: return 'w-80';
    }
  };

  const getRowsForSize = () => {
    return field.size === 'essay' ? 4 : 1;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-lg border bg-white p-4 transition-shadow',
        isDragging ? 'shadow-lg ring-2 ring-brand-teal' : 'border-gray-200 hover:shadow-sm'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-2 cursor-grab touch-none rounded p-1 hover:bg-gray-100 active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </button>

        <div className="flex-1 space-y-3">
          {/* Field Label with Required Badge */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              className="flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-medium hover:border-gray-200 focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
              placeholder="Field Label"
            />
            {field.required && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                Required
              </span>
            )}
            {field.contentType && (
              <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                {getContentTypeIcon()}
                {field.contentType}
              </span>
            )}
          </div>

          {/* Field Input Preview */}
          {field.size === 'essay' ? (
            <textarea
              disabled
              rows={getRowsForSize()}
              placeholder="Essay response..."
              className={cn(
                getSizeClass(),
                'resize-none rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed'
              )}
            />
          ) : (
            <input
              type="text"
              disabled
              placeholder={
                field.contentType === 'email' ? 'name@example.com' :
                field.contentType === 'phone' ? '(555) 123-4567' :
                field.contentType === 'date' ? 'MM/DD/YYYY' :
                field.contentType === 'number' ? '123' :
                field.contentType === 'postalCode' ? '12345' :
                field.contentType === 'url' ? 'https://example.com' :
                'Enter text...'
              }
              className={cn(
                getSizeClass(),
                'rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed'
              )}
            />
          )}
        </div>

        {/* Delete Button */}
        {canDelete && (
          <button
            onClick={onDelete}
            className="mt-2 rounded p-1.5 opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100"
            title="Delete field"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </button>
        )}
      </div>
    </div>
  );
}

export function FormFieldEditor({ blockId, question }: FormFieldEditorProps) {
  const { dispatch } = useSurveyBuilder();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateQuestion = (updates: Partial<FormFieldQuestion>) => {
    dispatch({
      type: 'UPDATE_QUESTION',
      payload: { blockId, question: { ...question, ...updates } },
    });
  };

  const addField = () => {
    const newField = {
      id: crypto.randomUUID(),
      label: `Field ${question.fields.length + 1}`,
      required: false,
      size: 'medium' as const,
    };
    updateQuestion({ fields: [...question.fields, newField] });
  };

  const deleteField = (fieldId: string) => {
    if (question.fields.length <= 1) return;
    updateQuestion({ fields: question.fields.filter((f) => f.id !== fieldId) });
  };

  const updateField = (fieldId: string, updates: Partial<FormFieldQuestion['fields'][0]>) => {
    updateQuestion({
      fields: question.fields.map((f) =>
        f.id === fieldId ? { ...f, ...updates } : f
      ),
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = question.fields.findIndex((f) => f.id === active.id);
      const newIndex = question.fields.findIndex((f) => f.id === over.id);

      updateQuestion({
        fields: arrayMove(question.fields, oldIndex, newIndex),
      });
    }
  };

  return (
    <div className="space-y-4">


      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={question.fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {question.fields.map((field) => (
              <SortableField
                key={field.id}
                field={field}
                onDelete={() => deleteField(field.id)}
                onUpdate={(updates) => updateField(field.id, updates)}
                canDelete={question.fields.length > 1}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Field Button */}
      <button
        onClick={addField}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-brand-teal hover:bg-brand-light hover:text-brand-teal"
      >
        <Plus className="h-4 w-4" />
        Add Field
      </button>

      {/* Helper Text */}
      <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
        <strong>Tip:</strong> Drag the grip icon to reorder fields. Configure field settings in the right panel.
      </div>
    </div>
  );
}
