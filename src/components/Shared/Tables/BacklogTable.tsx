import React, { useState } from 'react';
import { useMergedCells, MergedCell } from '../../dashboard/Excel/MergedCells';
import '../../../styles/dashboard/excel-viewer/backlog-table.css';

interface ColumnHeader {
  id: string;
  label: string;
}

interface BacklogTableProps {
  data: any[];
  tableHeaders: ColumnHeader[];
  activeWorksheet: any; // XLSX.WorkSheet
  isEditMode?: boolean;
  selectedRows: {[key: number]: boolean};
  onCheckboxToggle: (idx: number) => void;
  onSelectAll: () => void;
  editingCell?: {rowIndex: number, columnId: string} | null;
  editingValue?: string;
  onCellClick?: (rowIndex: number, columnId: string, currentValue: any) => void;
  onValueChange?: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const BacklogTable: React.FC<BacklogTableProps> = ({
  data,
  tableHeaders,
  activeWorksheet,
  isEditMode = false,
  selectedRows,
  onCheckboxToggle,
  onSelectAll,
  editingCell = null,
  editingValue = '',
  onCellClick,
  onValueChange,
  onKeyDown
}) => {
  const [whiteBackgroundActive] = useState<boolean>(false);

  // Use merged cells hook
  const {
    getMergeInfoForCell,
    getMergedCellValueByIndex
  } = useMergedCells(activeWorksheet, data, tableHeaders.map(h => h.label));

  // Get table class name based on mode
  const getTableClassName = () => {
    const baseClasses = 'excel-table narrow-row-numbers';
    return isEditMode ? `${baseClasses} edit-mode` : baseClasses;
  };

  // Helper functions for column classes
  const getColumnPositionClasses = (colIndex: number) => {
    const classes = [];
    
    // Add fixed width classes based on column type
    if (colIndex === 0) {
      classes.push('user-story-id-column');
    } else if (colIndex === tableHeaders.length - 2) {
      classes.push('validation-column');
    } else if (colIndex === tableHeaders.length - 3) {
      classes.push('home-column');
    } else {
      // Map specific columns to their fixed widths
      const columnLabel = tableHeaders[colIndex]?.label?.toUpperCase();
      if (columnLabel === 'STATUS') {
        classes.push('status-column');
      } else if (columnLabel === 'PROGRESS') {
        classes.push('progress-column');
      } else if (columnLabel === 'LAST RUN') {
        classes.push('last-run-column');
      } else if (columnLabel === 'DURATION') {
        classes.push('duration-column');
      } else if (columnLabel === 'ACTIONS') {
        classes.push('actions-column');
      } else if (columnLabel === 'TEST OBJECTIVE') {
        classes.push('cell-wrap-text');
      }
    }
    
    // Center align specific columns
    if (colIndex === 0 || 
        colIndex === tableHeaders.length - 2 || 
        ['STATUS', 'PROGRESS', 'LAST RUN', 'DURATION', 'ACTIONS'].includes(tableHeaders[colIndex]?.label?.toUpperCase())) {
      classes.push('cell-align-center');
    }
    
    return classes;
  };

  const getHeaderClassName = (colIndex: number, column: any) => {
    const columnPositionClasses = getColumnPositionClasses(colIndex);
    return columnPositionClasses.join(' ');
  };

  const getCellClassName = (colIndex: number) => {
    const columnPositionClasses = getColumnPositionClasses(colIndex);
    return columnPositionClasses.join(' ');
  };

  return (
    <div className="backlog-table-wrapper">
      <table className={getTableClassName()}>
        <thead className="excel-table-header">
          <tr>
            <th className="row-number-column">
              #
            </th>
            <th className={`checkbox-column ${whiteBackgroundActive ? 'white-bg' : ''}`}>
              <input 
                type="checkbox" 
                className="regular-checkbox"
                id="select-all-checkbox"
                aria-label="Select all rows"
                title="Select all rows"
                checked={data.length > 0 && 
                        Object.keys(selectedRows).length === data.length && 
                        data.every((_, idx) => selectedRows[idx])}
                onChange={onSelectAll}
              />
            </th>
            {tableHeaders.slice(1).map((column, colIndex) => (
              <th 
                key={column.id}
                scope="col"
                className={getHeaderClassName(colIndex, column)}
              >
                <div className="header-content">
                  <span>{column.label.toUpperCase()}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="excel-table-body">
          {data.length > 0 ? (
          data.map((row, idx) => {
            const rowKey = `row-${idx}-${JSON.stringify(row).substring(0, 50)}`;
            return (
              <tr key={rowKey} className={selectedRows[idx] ? 'selected-row' : ''}>
                <td className="row-number-column">
                  {idx + 1}
                </td>
                <td className={`checkbox-column ${whiteBackgroundActive ? 'white-bg' : ''}`}>
                  {(() => {
                    const mergeInfo = getMergeInfoForCell(idx, 0);
                    const userIdValue = getMergedCellValueByIndex(idx, 0);
                    const hasUserIdContent = userIdValue && String(userIdValue).trim() !== '';
                    const shouldShowCheckbox = hasUserIdContent && (
                      (mergeInfo.isMerged && mergeInfo.isMainCell) || 
                      !mergeInfo.isMerged
                    );
                    
                    return shouldShowCheckbox ? (
                      <input 
                        type="checkbox" 
                        className="regular-checkbox"
                        id={`row-checkbox-${idx}`}
                        aria-label={`Select row ${idx + 1}`}
                        title={`Select row ${idx + 1}`}
                        checked={!!selectedRows[idx]} 
                        onChange={() => onCheckboxToggle(idx)}
                      />
                    ) : null;
                  })()}
                </td>
                {tableHeaders.slice(1).map((column, colIndex) => {
                  const mergeInfo = getMergeInfoForCell(idx, colIndex);
                  const cellValue = getMergedCellValueByIndex(idx, colIndex);
                  const className = getCellClassName(colIndex);

                  return (
                    <MergedCell
                      key={`${idx}-${column.id}`}
                      mergeInfo={mergeInfo}
                      value={cellValue}
                      className={className}
                      isEditMode={isEditMode}
                      isEditing={editingCell?.rowIndex === idx && editingCell?.columnId === column.id}
                      editValue={editingValue}
                      onCellClick={() => onCellClick?.(idx, column.id, cellValue)}
                      onValueChange={onValueChange}
                      onKeyDown={onKeyDown}
                    />
                  );
                })}
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan={tableHeaders.length + 1} className="text-center">
              No data found
            </td>
          </tr>
        )}
        </tbody>
      </table>
    </div>
  );
}; 