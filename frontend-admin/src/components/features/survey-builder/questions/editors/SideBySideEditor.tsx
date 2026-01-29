'use client';

import React, { useState } from 'react';
import { SideBySideQuestion } from '@/api/contracts';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import { Plus, Trash2, ChevronLeft, ChevronRight, ChevronDown, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SideBySideEditorProps {
  blockId: string;
  question: SideBySideQuestion;
}

const COLUMN_TYPE_LABELS: Record<string, string> = {
  singleAnswer: 'Single Answer',
  multipleAnswer: 'Multiple Answer', 
  dropdown: 'Dropdown',
  textEntry: 'Text Entry',
};

export function SideBySideEditor({ blockId, question }: SideBySideEditorProps) {
  const { dispatch } = useSurveyBuilder();
  const [isExpanded, setIsExpanded] = useState(question.columns.length <= 3);

  const updateQuestion = (updates: Partial<SideBySideQuestion>) => {
    dispatch({
      type: 'UPDATE_QUESTION',
      payload: { blockId, question: { ...question, ...updates } },
    });
  };

  const addStatement = () => {
    const newStatement = {
      id: crypto.randomUUID(),
      text: '',
    };
    updateQuestion({ statements: [...question.statements, newStatement] });
  };

  const deleteStatement = (stmtId: string) => {
    if (question.statements.length <= 1) return;
    updateQuestion({ statements: question.statements.filter(s => s.id !== stmtId) });
  };

  const updateStatementText = (stmtId: string, text: string) => {
    const statements = question.statements.map(s => s.id === stmtId ? { ...s, text } : s);
    updateQuestion({ statements });
  };

  const addColumn = () => {
    const newColumn = {
      id: crypto.randomUUID(),
      header: `Column ${question.columns.length + 1}`,
      type: 'singleAnswer' as const,
      choices: [
        { id: crypto.randomUUID(), text: 'Option 1', value: 1 },
        { id: crypto.randomUUID(), text: 'Option 2', value: 2 },
      ],
    };
    updateQuestion({ columns: [...question.columns, newColumn] });
  };

  const deleteColumn = (colId: string) => {
    if (question.columns.length <= 1) return;
    updateQuestion({ columns: question.columns.filter(c => c.id !== colId) });
  };

  const updateColumnHeader = (colId: string, header: string) => {
    const columns = question.columns.map(c => c.id === colId ? { ...c, header } : c);
    updateQuestion({ columns });
  };

  const moveColumn = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === question.columns.length - 1) return;

    const newColumns = [...question.columns];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    [newColumns[index], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[index]];
    updateQuestion({ columns: newColumns });
  };

  // Determine which columns to show in preview
  const visibleColumns = isExpanded ? question.columns : question.columns.slice(0, 3);
  const hiddenColumnCount = question.columns.length - 3;

  const renderCell = (statement: SideBySideQuestion['statements'][0], column: SideBySideQuestion['columns'][0]) => {
    if (column.type === 'textEntry') {
      const placeholder = column.textSize === 'essay' ? 'Essay response...' : 
                         column.textSize === 'long' ? 'Long text...' :
                         column.textSize === 'medium' ? 'Medium text...' : 'Short text...';
      
      return (
        <div className="p-2">
          {column.textSize === 'essay' ? (
            <div className="w-full rounded border border-gray-200 bg-gray-50 px-2 py-2 text-xs text-gray-400 italic">
              {placeholder}
            </div>
          ) : (
            <div className={cn(
              "w-full rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-400 italic",
              column.textSize === 'long' && "py-2",
              column.textSize === 'medium' && "py-1.5"
            )}>
              {placeholder}
            </div>
          )}
        </div>
      );
    }

    if (column.type === 'dropdown') {
      return (
        <div className="p-2">
          <div className="flex items-center justify-between w-full rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-400 italic">
            <span>Select...</span>
            <ChevronDown className="h-3 w-3" />
          </div>
        </div>
      );
    }

    if (column.type === 'multipleAnswer') {
      return (
        <div className="space-y-1 p-2">
          {column.choices?.slice(0, 3).map(choice => (
            <label key={choice.id} className="flex items-center gap-2 text-xs">
              <div className="h-3 w-3 rounded-sm border border-gray-300 bg-white" />
              <span className="text-gray-600">{choice.text}</span>
            </label>
          ))}
          {column.choices && column.choices.length > 3 && (
            <span className="text-xs text-gray-400 italic">+{column.choices.length - 3} more</span>
          )}
        </div>
      );
    }

    // singleAnswer (default)
    return (
      <div className="space-y-1 p-2">
        {column.choices?.slice(0, 3).map(choice => (
          <label key={choice.id} className="flex items-center gap-2 text-xs">
            <div className="h-3 w-3 rounded-full border border-gray-300 bg-white" />
            <span className="text-gray-600">{choice.text}</span>
          </label>
        ))}
        {column.choices && column.choices.length > 3 && (
          <span className="text-xs text-gray-400 italic">+{column.choices.length - 3} more</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Collapsed column summary when many columns */}
      {question.columns.length > 3 && !isExpanded && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            {question.columns.map((col, idx) => (
              <span 
                key={col.id} 
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  idx < 3 ? "bg-brand-teal/10 text-brand-teal" : "bg-gray-200 text-gray-600"
                )}
              >
                {col.header}
                <span className="ml-1 text-gray-400">({COLUMN_TYPE_LABELS[col.type] || col.type})</span>
              </span>
            ))}
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="text-xs text-brand-teal hover:underline flex items-center gap-1"
          >
            <Settings className="h-3 w-3" />
            Expand table
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-gray-300 bg-gray-50 p-2 text-left">
              <span className="text-xs font-medium text-gray-500">Statements</span>
            </th>
            {visibleColumns.map((col, index) => (
              <th key={col.id} className="border border-gray-300 bg-gray-50 p-2 min-w-[120px]">
                <div className="group relative space-y-1">
                  <input
                    type="text"
                    value={col.header}
                    onChange={(e) => updateColumnHeader(col.id, e.target.value)}
                    className="w-full border-b border-transparent bg-transparent text-center text-xs font-medium text-gray-700 hover:border-gray-300 focus:border-brand-teal focus:outline-none"
                    placeholder="Column header"
                  />
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => moveColumn(index, 'left')}
                      disabled={index === 0}
                      className="rounded p-0.5 hover:bg-gray-200 disabled:opacity-30"
                      title="Move left"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => deleteColumn(col.id)}
                      className="rounded p-0.5 text-red-500 hover:bg-red-50"
                      title="Delete column"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => moveColumn(index, 'right')}
                      disabled={index === question.columns.length - 1}
                      className="rounded p-0.5 hover:bg-gray-200 disabled:opacity-30"
                      title="Move right"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-400">
                    {COLUMN_TYPE_LABELS[col.type] || col.type}
                  </div>
                </div>
              </th>
            ))}
            {!isExpanded && hiddenColumnCount > 0 && (
              <th className="border border-gray-300 bg-gray-100 p-2 min-w-[80px]">
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-xs text-brand-teal hover:underline"
                >
                  +{hiddenColumnCount} more
                </button>
              </th>
            )}
            <th className="border border-gray-300 bg-gray-50 p-2">
              <button
                onClick={addColumn}
                className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-200 text-brand-teal"
                title="Add column"
              >
                <Plus className="h-4 w-4" />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {question.statements.map((stmt, rowIndex) => (
            <React.Fragment key={stmt.id}>
              {question.repeatHeaders && question.repeatHeaders > 0 && rowIndex > 0 && rowIndex % question.repeatHeaders === 0 && (
                <tr>
                  <th className="border border-gray-300 bg-gray-100 p-2 text-left">
                    <span className="text-xs font-medium text-gray-500">Statements</span>
                  </th>
                  {visibleColumns.map(col => (
                    <th key={col.id} className="border border-gray-300 bg-gray-100 p-2">
                      <div className="text-xs font-medium text-gray-700">{col.header}</div>
                      <div className="text-xs text-gray-400">
                        {COLUMN_TYPE_LABELS[col.type] || col.type}
                      </div>
                    </th>
                  ))}
                  {!isExpanded && hiddenColumnCount > 0 && (
                    <th className="border border-gray-300 bg-gray-100"></th>
                  )}
                  <th className="border border-gray-300 bg-gray-100"></th>
                </tr>
              )}
              <tr>
                <td className="border border-gray-300 bg-white p-2">
                  <div className="group relative flex items-center">
                    <input
                      type="text"
                      value={stmt.text}
                      onChange={(e) => updateStatementText(stmt.id, e.target.value)}
                      className="flex-1 border-b border-transparent bg-transparent text-sm text-gray-700 placeholder-gray-400 placeholder-italic hover:border-gray-300 focus:border-brand-teal focus:outline-none"
                      placeholder={`Enter statement ${rowIndex + 1}...`}
                    />
                    <button
                      onClick={() => deleteStatement(stmt.id)}
                      className="absolute -left-6 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </td>
                {visibleColumns.map(col => (
                  <td key={col.id} className="border border-gray-300 bg-white">
                    {renderCell(stmt, col)}
                  </td>
                ))}
                {!isExpanded && hiddenColumnCount > 0 && (
                  <td className="border border-gray-300 bg-gray-50 text-center">
                    <span className="text-xs text-gray-400">...</span>
                  </td>
                )}
                <td className="border border-gray-300 bg-white"></td>
              </tr>
            </React.Fragment>
          ))}
          <tr>
            <td className="border border-gray-300 bg-white p-2">
              <button
                onClick={addStatement}
                className="flex items-center gap-1 text-xs font-medium text-brand-teal hover:underline"
              >
                <Plus className="h-3 w-3" />
                Add Statement
              </button>
            </td>
            {visibleColumns.map(col => (
              <td key={col.id} className="border border-gray-300 bg-white"></td>
            ))}
            {!isExpanded && hiddenColumnCount > 0 && (
              <td className="border border-gray-300 bg-white"></td>
            )}
            <td className="border border-gray-300 bg-white"></td>
          </tr>
        </tbody>
      </table>
      
      {isExpanded && question.columns.length > 3 && (
        <button
          onClick={() => setIsExpanded(false)}
          className="mt-2 text-xs text-gray-500 hover:text-brand-teal"
        >
          Collapse table view
        </button>
      )}
      
      <div className="mt-2 rounded-lg bg-blue-50 p-2 text-xs text-blue-700">
        <strong>Tip:</strong> Configure column types and logic in the settings panel →
      </div>
      </div>
    </div>
  );
}
