'use client';

import React, { useState } from 'react';
import { MatrixTableQuestion } from '@/api/contracts';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import { Plus, Trash2, Star, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatrixTableEditorProps {
  blockId: string;
  question: MatrixTableQuestion;
}

export function MatrixTableEditor({ blockId, question }: MatrixTableEditorProps) {
  const { dispatch } = useSurveyBuilder();
  const [rankValues, setRankValues] = useState<Record<string, Record<string, number>>>({});
  const [maxDiffSelections, setMaxDiffSelections] = useState<Record<string, { most?: string; least?: string }>>({});

  const updateQuestion = (updates: Partial<MatrixTableQuestion>) => {
    dispatch({
      type: 'UPDATE_QUESTION',
      payload: {
        blockId,
        question: { ...question, ...updates },
      },
    });
  };

  const addRow = () => {
    const newRow = { id: crypto.randomUUID(), text: `Row ${question.rows.length + 1}` };
    updateQuestion({ rows: [...question.rows, newRow] });
  };

  const deleteRow = (rowId: string) => {
    if (question.rows.length <= 1) return;
    updateQuestion({ rows: question.rows.filter((r) => r.id !== rowId) });
  };

  const updateRowText = (rowId: string, text: string) => {
    updateQuestion({
      rows: question.rows.map((r) => (r.id === rowId ? { ...r, text } : r)),
    });
  };

  const addColumn = () => {
    const newCol = { id: crypto.randomUUID(), text: `Column ${question.columns.length + 1}`, value: question.columns.length + 1 };
    updateQuestion({ columns: [...question.columns, newCol] });
  };

  const deleteColumn = (colId: string) => {
    if (question.columns.length <= 1) return;
    updateQuestion({ columns: question.columns.filter((c) => c.id !== colId) });
  };

  const updateColumnText = (colId: string, text: string) => {
    updateQuestion({
      columns: question.columns.map((c) => (c.id === colId ? { ...c, text } : c)),
    });
  };

  // Group rows by groupId
  const groupedRows = question.rows.reduce((acc, row) => {
    const groupId = row.groupId || '__default__';
    if (!acc[groupId]) acc[groupId] = [];
    acc[groupId].push(row);
    return acc;
  }, {} as Record<string, typeof question.rows>);

  const groups = question.groups || [];
  const orderedGroupIds = groups.map(g => g.id);
  if (groupedRows['__default__']) orderedGroupIds.push('__default__');

  const renderCell = (rowId: string, colId: string) => {
    const { variation } = question;

    switch (variation) {
      case 'likert':
      case 'bipolar':
        // Radio buttons or checkboxes
        return (
          <div className="flex justify-center">
            <div className={cn(
              "h-4 w-4 border border-gray-300 bg-white cursor-pointer hover:border-brand-teal transition-colors",
              question.allowMultiple ? "rounded-sm" : "rounded-full"
            )} />
          </div>
        );

      case 'textEntry':
        return (
          <input
            disabled
            placeholder="Text..."
            className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-sm cursor-not-allowed text-gray-400"
          />
        );

      case 'constantSum':
        return (
          <input
            type="number"
            disabled
            placeholder="0"
            className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-sm text-center cursor-not-allowed"
          />
        );

      case 'rankOrder':
        const availableRanks = Array.from({ length: question.rows.length }, (_, i) => i + 1);
        const currentRank = rankValues[rowId]?.[colId] || '';
        return (
          <select
            value={currentRank}
            onChange={(e) => {
              const newRanks = { ...rankValues };
              if (!newRanks[rowId]) newRanks[rowId] = {};
              newRanks[rowId][colId] = parseInt(e.target.value) || 0;
              setRankValues(newRanks);
            }}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
          >
            <option value="">-</option>
            {availableRanks.map(rank => (
              <option key={rank} value={rank}>{rank}</option>
            ))}
          </select>
        );

      case 'profile':
        // Star rating for profile (each cell is a rating)
        const profileScale = question.profileScales?.[rowId] || { min: 1, max: 5, type: 'stars' };
        const starCount = profileScale.max - profileScale.min + 1;
        return (
          <div className="flex justify-center gap-0.5">
            {Array.from({ length: Math.min(starCount, 5) }, (_, i) => (
              <Star key={i} className="h-4 w-4 text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors" fill="none" />
            ))}
          </div>
        );

      case 'maxDiff':
        // MaxDiff: Most and Least columns only
        const isMostColumn = colId === question.columns[0]?.id;
        const isLeastColumn = colId === question.columns[1]?.id;
        const selections = maxDiffSelections[rowId] || {};
        const isSelected = (isMostColumn && selections.most === colId) || (isLeastColumn && selections.least === colId);

        return (
          <div className="flex justify-center">
            <div 
              onClick={() => {
                const newSelections = { ...maxDiffSelections };
                if (!newSelections[rowId]) newSelections[rowId] = {};
                
                if (isMostColumn) {
                  newSelections[rowId].most = isSelected ? undefined : colId;
                } else if (isLeastColumn) {
                  newSelections[rowId].least = isSelected ? undefined : colId;
                }
                setMaxDiffSelections(newSelections);
              }}
              className={cn(
                "h-4 w-4 rounded-full border-2 cursor-pointer transition-all",
                isSelected ? "border-brand-teal bg-brand-teal" : "border-gray-300 bg-white hover:border-brand-teal"
              )}
            >
              {isSelected && <div className="h-full w-full rounded-full bg-white m-0.5" />}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex justify-center">
            <div className="h-4 w-4 rounded-full border border-gray-300 bg-white" />
          </div>
        );
    }
  };

  const renderTable = () => {
    const { transpose, positionTextAbove } = question;
    const rows = question.rows;
    const columns = question.columns;

    // Transpose swaps rows and columns
    if (transpose) {
      return (
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th className="w-1/4 min-w-[150px] p-2"></th>
              {rows.map((row) => (
                <th key={row.id} className="min-w-[100px] max-w-[150px] p-2 text-center align-bottom">
                  <div className="group relative flex items-center justify-center">
                    <textarea
                      value={row.text}
                      onChange={(e) => updateRowText(row.id, e.target.value)}
                      rows={2}
                      className="w-full border-b border-transparent bg-transparent text-center text-sm font-medium focus:border-brand-teal focus:outline-none hover:border-gray-300 resize-none whitespace-pre-wrap"
                    />
                    <button
                      onClick={() => deleteRow(row.id)}
                      className="absolute -top-6 right-0 opacity-0 transition-opacity group-hover:opacity-100 p-1 hover:bg-red-50 rounded"
                      title="Delete Row"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </button>
                  </div>
                </th>
              ))}
              <th className="w-10 p-2 align-bottom">
                <button
                  onClick={addRow}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 text-brand-teal"
                  title="Add Row"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {columns.map((col) => (
              <tr key={col.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                <td className="p-2">
                  <div className="group relative flex items-center">
                    <input
                      type="text"
                      value={col.text}
                      onChange={(e) => updateColumnText(col.id, e.target.value)}
                      className="w-full border-b border-transparent bg-transparent text-sm focus:border-brand-teal focus:outline-none hover:border-gray-300"
                    />
                    <button
                      onClick={() => deleteColumn(col.id)}
                      className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 p-1 hover:bg-red-50 rounded"
                      title="Delete Column"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </button>
                  </div>
                </td>
                {rows.map((row) => (
                  <td key={row.id} className="p-2 text-center">
                    {renderCell(row.id, col.id)}
                  </td>
                ))}
                <td className="p-2"></td>
              </tr>
            ))}
            <tr>
              <td className="p-2 pt-4">
                <button
                  onClick={addColumn}
                  className="flex items-center gap-1 text-sm font-medium text-brand-teal hover:underline"
                >
                  <Plus className="h-4 w-4" />
                  Add Column
                </button>
              </td>
              <td colSpan={rows.length + 1}></td>
            </tr>
          </tbody>
        </table>
      );
    }

    // Normal (non-transposed) table
    if (positionTextAbove) {
      // Vertical layout: statements above, scale points as dropdowns/sliders below
      return (
        <div className="space-y-4">
          {orderedGroupIds.map(groupId => (
            <div key={groupId}>
              {groupId !== '__default__' && (
                <h4 className="text-sm font-semibold text-gray-700 mb-2 pb-1 border-b border-gray-200">
                  {groups.find(g => g.id === groupId)?.name}
                </h4>
              )}
              {groupedRows[groupId]?.map((row, idx) => (
                <div key={row.id} className={cn("border border-gray-200 rounded-lg p-3", question.addWhitespace && idx > 0 && "mt-4")}>
                  <div className="group relative flex items-center justify-between mb-2">
                    <input
                      type="text"
                      value={row.text}
                      onChange={(e) => updateRowText(row.id, e.target.value)}
                      className="flex-1 border-b border-transparent bg-transparent text-sm font-medium focus:border-brand-teal focus:outline-none hover:border-gray-300"
                    />
                    <button
                      onClick={() => deleteRow(row.id)}
                      className="opacity-0 transition-opacity group-hover:opacity-100 p-1 hover:bg-red-50 rounded"
                      title="Delete Row"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {columns.map((col) => (
                      <div key={col.id} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 min-w-[80px]">{col.text}</span>
                        <div className="flex-1">
                          {renderCell(row.id, col.id)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
          <button
            onClick={addRow}
            className="flex items-center gap-1 text-sm font-medium text-brand-teal hover:underline"
          >
            <Plus className="h-4 w-4" />
            Add Statement
          </button>
        </div>
      );
    }

    // Standard horizontal table
    return (
      <table className="w-full border-collapse min-w-[600px]">
        <thead>
          <tr>
            <th className="w-1/4 min-w-[150px] p-2"></th>
            {columns.map((col) => (
              <th key={col.id} className="min-w-[100px] max-w-[150px] p-2 text-center align-bottom">
                <div className="group relative flex items-center justify-center">
                  <textarea
                    value={col.text}
                    onChange={(e) => updateColumnText(col.id, e.target.value)}
                    rows={2}
                    className="w-full border-b border-transparent bg-transparent text-center text-sm font-medium focus:border-brand-teal focus:outline-none hover:border-gray-300 resize-none whitespace-pre-wrap"
                  />
                  <button
                    onClick={() => deleteColumn(col.id)}
                    className="absolute -top-6 right-0 opacity-0 transition-opacity group-hover:opacity-100 p-1 hover:bg-red-50 rounded"
                    title="Delete Column"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </button>
                </div>
              </th>
            ))}
            <th className="w-10 p-2 align-bottom">
              <button
                onClick={addColumn}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 text-brand-teal"
                title="Add Column"
              >
                <Plus className="h-4 w-4" />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {orderedGroupIds.map(groupId => (
            <React.Fragment key={groupId}>
              {groupId !== '__default__' && (
                <tr>
                  <td colSpan={columns.length + 2} className="pt-4 pb-2">
                    <h4 className="text-sm font-semibold text-gray-700 pb-1 border-b border-gray-200">
                      {groups.find(g => g.id === groupId)?.name}
                    </h4>
                  </td>
                </tr>
              )}
              {groupedRows[groupId]?.map((row, idx) => (
                <React.Fragment key={row.id}>
                  {question.repeatHeaders && question.repeatHeaders > 0 && idx > 0 && idx % question.repeatHeaders === 0 && (
                    <tr className="border-t-2 border-gray-300">
                      <th className="p-2 text-left text-xs font-medium text-gray-500">Statement</th>
                      {columns.map((col) => (
                        <th key={col.id} className="p-2 text-center text-xs font-medium text-gray-500">
                          {col.text}
                        </th>
                      ))}
                      <th></th>
                    </tr>
                  )}
                  <tr className={cn(
                    "border-t border-gray-100 hover:bg-gray-50/50",
                    question.addWhitespace && idx > 0 && idx % 5 === 0 && "border-t-4 border-gray-200"
                  )}>
                    <td className="p-2">
                      <div className="group relative flex items-center">
                        <input
                          type="text"
                          value={row.text}
                          onChange={(e) => updateRowText(row.id, e.target.value)}
                          className="w-full border-b border-transparent bg-transparent text-sm focus:border-brand-teal focus:outline-none hover:border-gray-300"
                        />
                        <button
                          onClick={() => deleteRow(row.id)}
                          className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 p-1 hover:bg-red-50 rounded"
                          title="Delete Row"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </button>
                      </div>
                    </td>
                    {columns.map((col) => (
                      <td key={col.id} className="p-2 text-center">
                        {renderCell(row.id, col.id)}
                      </td>
                    ))}
                    <td className="p-2"></td>
                  </tr>
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
          <tr>
            <td className="p-2 pt-4">
              <button
                onClick={addRow}
                className="flex items-center gap-1 text-sm font-medium text-brand-teal hover:underline"
              >
                <Plus className="h-4 w-4" />
                Add Statement
              </button>
            </td>
            <td colSpan={columns.length + 1}></td>
          </tr>
        </tbody>
      </table>
    );
  };

  // Mobile-friendly accordion view
  if (question.mobileFriendly) {
    return (
      <div className="mt-4 space-y-2">
        <div className="rounded-lg bg-blue-50 p-2 text-xs text-blue-700">
          📱 <strong>Mobile View:</strong> Statements displayed as expandable cards
        </div>
        {question.rows.map((row) => (
          <details key={row.id} className="group border border-gray-200 rounded-lg overflow-hidden">
            <summary className="flex items-center justify-between p-3 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <input
                type="text"
                value={row.text}
                onChange={(e) => updateRowText(row.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 border-b border-transparent bg-transparent text-sm font-medium focus:border-brand-teal focus:outline-none hover:border-gray-300 mr-2"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRow(row.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                  title="Delete Row"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <ChevronDown className="h-4 w-4 text-gray-500 transition-transform group-open:rotate-180" />
              </div>
            </summary>
            <div className="p-3 space-y-2 bg-white">
              {question.columns.map((col) => (
                <div key={col.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{col.text}</span>
                  <div className="w-24">
                    {renderCell(row.id, col.id)}
                  </div>
                </div>
              ))}
            </div>
          </details>
        ))}
        <button
          onClick={addRow}
          className="flex items-center gap-1 text-sm font-medium text-brand-teal hover:underline"
        >
          <Plus className="h-4 w-4" />
          Add Statement
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className={cn(
          question.tableWidth === 'narrow' && 'max-w-lg mx-auto',
          question.tableWidth === 'medium' && 'max-w-2xl mx-auto',
          question.tableWidth === 'wide' && 'max-w-4xl mx-auto',
          question.tableWidth === 'full' && 'w-full'
        )}>
          {renderTable()}
        </div>
      </div>
    </div>
  );
}
