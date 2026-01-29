'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Library,
  List,
  AlignLeft,
  Grid3x3,
  Columns,
  Star,
  Type,
  MousePointer,
  ThermometerSun,
  ArrowUpDown,
  Calculator,
  Layers,
  SlidersHorizontal,
  Plus,
  GripVertical,
  Link2,
  Unlink,
  Edit2,
  Trash2,
  Scissors,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { QuestionType, EmbeddedDataField } from '@/api/contracts';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import { DEFAULT_EMBEDDED_FIELDS, getFieldPlaceholder } from '@/lib/logicHelpers';

interface QuestionTypeItem {
  type: QuestionType;
  label: string;
  icon: React.ElementType;
  description: string;
}

const QUESTION_TYPES: QuestionTypeItem[] = [
  { type: 'MultipleChoice', label: 'Multiple Choice', icon: List, description: 'Single or multiple selection' },
  { type: 'TextEntry', label: 'Text Entry', icon: AlignLeft, description: 'Free-form text response' },
  { type: 'MatrixTable', label: 'Matrix Table', icon: Grid3x3, description: 'Grid of rows and columns' },
  { type: 'SideBySide', label: 'Side by Side', icon: Columns, description: 'Compare multiple items' },
  { type: 'Slider', label: 'Slider', icon: SlidersHorizontal, description: 'Drag to select value' },
  { type: 'RankOrder', label: 'Rank Order', icon: ArrowUpDown, description: 'Drag to rank items' },
  { type: 'ConstantSum', label: 'Constant Sum', icon: Calculator, description: 'Distribute points' },
  { type: 'PickGroupRank', label: 'Pick, Group, Rank', icon: Layers, description: 'Organize and rank' },
  { type: 'NetPromoter', label: 'Reputation Index', icon: Star, description: '0-10 scale rating' },
  { type: 'TextGraphic', label: 'Text / Graphic', icon: Type, description: 'Display text or images' },
  { type: 'PageBreak', label: 'Page Break', icon: Scissors, description: 'Split survey into pages' },
  { type: 'HotSpot', label: 'Hot Spot', icon: MousePointer, description: 'Click regions on image' },
  { type: 'Heatmap', label: 'Heat Map', icon: ThermometerSun, description: 'Click to rate regions' },
];

interface DraggableQuestionTypeProps {
  item: QuestionTypeItem;
}

function DraggableQuestionType({ item }: DraggableQuestionTypeProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `new-question-${item.type}`,
    data: { type: 'new-question', questionType: item.type },
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  const Icon = item.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'group flex cursor-grab items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 transition-all hover:border-brand-teal hover:shadow-sm',
        isDragging && 'ring-2 ring-brand-teal'
      )}
    >
      <GripVertical className="h-4 w-4 flex-shrink-0 text-gray-300 group-hover:text-gray-400" />
      <Icon className="h-4 w-4 flex-shrink-0 text-brand-teal" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-gray-900">{item.label}</div>
      </div>
    </div>
  );
}

interface EmbeddedFieldItemProps {
  field: EmbeddedDataField;
  isLinked: boolean;
  onCopyPlaceholder: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function EmbeddedFieldItem({ field, isLinked, onCopyPlaceholder, onEdit, onDelete }: EmbeddedFieldItemProps) {
  const placeholder = getFieldPlaceholder(field.name);
  
  return (
    <div className="group flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-100">
      <button
        onClick={onCopyPlaceholder}
        className="flex flex-1 items-center gap-2 text-left text-sm"
        title="Click to copy placeholder"
      >
        {/* Linked/Unlinked Status Icon */}
        <span title={isLinked ? "Linked - data file uploaded" : "Unlinked - no data yet"}>
          {isLinked ? (
            <Link2 className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <Unlink className="h-3.5 w-3.5 text-yellow-500" />
          )}
        </span>
        
        <span className={cn("text-gray-700", !isLinked && "text-gray-500")}>
          {field.label || field.name}
        </span>
        
        <code className={cn(
          "rounded px-1.5 py-0.5 text-xs",
          isLinked 
            ? "bg-green-100 text-green-700"
            : "bg-gray-200 text-gray-600"
        )}>
          {placeholder}
        </code>
      </button>
      
      {/* Actions - only show for non-system fields */}
      {!field.isSystemField && (
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit && (
            <button
              onClick={onEdit}
              className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
              title="Edit field"
            >
              <Edit2 className="h-3 w-3" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
              title="Delete field"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function BuilderLeftSidebar() {
  const { present, dispatch } = useSurveyBuilder();
  const [isContentExpanded, setIsContentExpanded] = useState(true);
  const [isFieldsExpanded, setIsFieldsExpanded] = useState(true);
  const [newFieldName, setNewFieldName] = useState('');
  const [showAddField, setShowAddField] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingFieldLabel, setEditingFieldLabel] = useState('');
  
  // Get embedded fields from context or use defaults
  const embeddedFields = present?.embeddedDataSchema?.fields || DEFAULT_EMBEDDED_FIELDS;
  
  // Check if field is linked (has data uploaded)
  const isFieldLinked = (fieldName: string): boolean => {
    // Check if field is a system field (always considered available)
    const field = embeddedFields.find(f => f.name === fieldName);
    return field?.isSystemField || false;
  };
  
  const handleCopyPlaceholder = (field: EmbeddedDataField) => {
    const placeholder = getFieldPlaceholder(field.name);
    navigator.clipboard.writeText(placeholder);
    // Could add toast notification here
  };
  
  const handleAddField = () => {
    if (!newFieldName.trim()) return;
    
    const sanitizedName = newFieldName.trim().replace(/\s+/g, '_').toLowerCase();
    const newField: EmbeddedDataField = {
      name: sanitizedName,
      label: newFieldName.trim(),
      dataType: 'text',
      isSystemField: false,
    };
    
    dispatch({ type: 'ADD_EMBEDDED_FIELD', payload: newField });
    setNewFieldName('');
    setShowAddField(false);
  };
  
  const handleDeleteField = (fieldName: string) => {
    if (confirm('Delete this embedded field? Any logic using this field will break.')) {
      dispatch({ type: 'DELETE_EMBEDDED_FIELD', payload: fieldName });
    }
  };
  
  const handleStartEdit = (field: EmbeddedDataField) => {
    setEditingField(field.name);
    setEditingFieldLabel(field.label || field.name);
  };
  
  const handleSaveEdit = () => {
    if (!editingField || !editingFieldLabel.trim()) return;
    
    const field = embeddedFields.find(f => f.name === editingField);
    if (field) {
      dispatch({
        type: 'UPDATE_EMBEDDED_FIELD',
        payload: { ...field, label: editingFieldLabel.trim() },
      });
    }
    setEditingField(null);
    setEditingFieldLabel('');
  };
  
  const handleCancelEdit = () => {
    setEditingField(null);
    setEditingFieldLabel('');
  };

  return (
    <div className="flex h-full w-72 flex-col border-r bg-gray-50">
      {/* Add Content Section */}
      <div className="border-b">
        <button
          onClick={() => setIsContentExpanded(!isContentExpanded)}
          className="flex w-full items-center justify-between px-4 py-3 hover:bg-gray-100"
        >
          <span className="text-sm font-semibold text-brand-dark">Add Content</span>
          {isContentExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </button>
        {isContentExpanded && (
          <div className="space-y-2 px-3 pb-4">
            {/* Import from Library */}
            <button className="flex w-full items-center gap-3 rounded-lg border border-dashed border-brand-teal bg-brand-light/30 px-3 py-2.5 text-left transition-all hover:bg-brand-light">
              <Library className="h-4 w-4 text-brand-teal" />
              <span className="text-sm font-medium text-brand-teal">Import from Library</span>
            </button>

            {/* Question Types */}
            {QUESTION_TYPES.map((item) => (
              <DraggableQuestionType key={item.type} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Embedded Fields Section */}
      <div className="flex-1 overflow-y-auto">
        <button
          onClick={() => setIsFieldsExpanded(!isFieldsExpanded)}
          className="flex w-full items-center justify-between px-4 py-3 hover:bg-gray-100"
        >
          <span className="text-sm font-semibold text-brand-dark">Embedded Fields</span>
          {isFieldsExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </button>
        {isFieldsExpanded && (
          <div className="space-y-1 px-3 pb-4">
            <p className="mb-2 text-xs text-gray-500">
              Click to copy placeholder into question text. 
              <span className="text-green-600"> ● Linked</span> = data uploaded.
            </p>
            
            {embeddedFields.map((field) => (
              editingField === field.name ? (
                <div key={field.name} className="flex items-center gap-2 rounded-md border border-brand-teal bg-white p-2">
                  <input
                    type="text"
                    value={editingFieldLabel}
                    onChange={(e) => setEditingFieldLabel(e.target.value)}
                    placeholder="Field label..."
                    className="flex-1 text-sm focus:outline-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                  <button
                    onClick={handleSaveEdit}
                    disabled={!editingFieldLabel.trim()}
                    className="rounded bg-brand-teal px-2 py-1 text-xs text-white hover:bg-teal-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <EmbeddedFieldItem
                  key={field.name}
                  field={field}
                  isLinked={isFieldLinked(field.name)}
                  onCopyPlaceholder={() => handleCopyPlaceholder(field)}
                  onEdit={!field.isSystemField ? () => handleStartEdit(field) : undefined}
                  onDelete={!field.isSystemField ? () => handleDeleteField(field.name) : undefined}
                />
              )
            ))}
            
            {/* Add Custom Field */}
            {showAddField ? (
              <div className="mt-2 flex items-center gap-2 rounded-md border border-gray-300 bg-white p-2">
                <input
                  type="text"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="Field name..."
                  className="flex-1 text-sm focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddField();
                    if (e.key === 'Escape') setShowAddField(false);
                  }}
                />
                <button
                  onClick={handleAddField}
                  disabled={!newFieldName.trim()}
                  className="rounded bg-brand-teal px-2 py-1 text-xs text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddField(false)}
                  className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddField(true)}
                className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-brand-teal hover:bg-brand-light/30"
              >
                <Plus className="h-4 w-4" />
                Add Custom Field
              </button>
            )}
            
            {/* Info about linking */}
            <div className="mt-3 rounded-md bg-blue-50 p-2 text-xs text-blue-700">
              <strong>Tip:</strong> Upload a participant list in Settings to link embedded fields with actual data.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
