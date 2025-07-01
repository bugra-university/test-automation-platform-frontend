import React, { useState, useMemo } from 'react';
import { useMergedCells, MergedCell } from '../../dashboard/Excel/MergedCells';
import '../../../styles/dashboard/excel-viewer/backlog-table.css';

// Type definitions
type SortDirection = 'asc' | 'desc' | null;
type ColumnDataType = 'number' | 'date' | 'string';

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

// Sort indicator component
interface SortIndicatorProps {
  column: string;
  sortConfig: {
    key: string;
    direction: SortDirection;
  };
}

const SortIndicator: React.FC<SortIndicatorProps> = ({ column, sortConfig }) => {
  const isActive = sortConfig.key === column;
  const isAsc = isActive && sortConfig.direction === 'asc';
  const isDesc = isActive && sortConfig.direction === 'desc';
  
  const renderSortIcon = () => {
    if (isAsc) {
      return <span className="sort-arrow">↑</span>;
    }
    if (isDesc) {
      return <span className="sort-arrow">↓</span>;
    }
    return (
      <div className="sort-arrow-default">
        <div className="az-icon">
          <span className="az-letter">A</span>
          <span className="az-letter">Z</span>
        </div>
        <span className="default-arrow">↑</span>
      </div>
    );
  };
  
  return (
    <div 
      className={`sort-indicator-container ${isActive ? 'sort-active' : ''} ${isAsc ? 'sort-asc' : ''} ${isDesc ? 'sort-desc' : ''}`}
      aria-hidden="true"
    >
      {renderSortIcon()}
    </div>
  );
};

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
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: SortDirection }>({
    key: '',
    direction: null
  });
  const [whiteBackgroundActive] = useState<boolean>(false);

  // Use merged cells hook
  const {
    getMergeInfoForCell,
    getMergedCellValueByIndex
  } = useMergedCells(activeWorksheet, data, tableHeaders.map(h => h.label));

  // Helper functions
  const getColumnDataType = (key: string): ColumnDataType => {
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('time')) return 'date';
    if (key.toLowerCase().includes('number') || key.toLowerCase().includes('percent')) return 'number';
    return 'string';
  };

  const requestSort = (key: string) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

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

  const isSortingDisabled = (colIndex: number) => {
    return colIndex === tableHeaders.length - 1; // Disable sorting for last column (usually actions)
  };

  const shouldShowSortIndicator = (colIndex: number) => {
    return !isSortingDisabled(colIndex);
  };

  // Sort the data
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      const dataType = getColumnDataType(sortConfig.key);

      if (dataType === 'date') {
        const dateA = new Date(aVal);
        const dateB = new Date(bVal);
        return sortConfig.direction === 'asc' ? 
          dateA.getTime() - dateB.getTime() : 
          dateB.getTime() - dateA.getTime();
      }

      if (dataType === 'number') {
        return sortConfig.direction === 'asc' ? 
          Number(aVal) - Number(bVal) : 
          Number(bVal) - Number(aVal);
      }

      return sortConfig.direction === 'asc' ? 
        String(aVal).localeCompare(String(bVal)) : 
        String(bVal).localeCompare(String(aVal));
    });
  }, [data, sortConfig]);

  return (
    <div className="table-scroll-container" data-tab="backlog">
      <table className={getTableClassName()}>
        <thead className="excel-table-header">
          <tr>
            <th className="row-number-header">
              <span className="hash-symbol">#</span>
            </th>
            {/* Checkbox column header */}
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
            {/* Dynamic column headers - skip the first one (#) since we're handling it separately */}
            {tableHeaders.slice(1).map((column, colIndex) => (
              <th 
                key={column.id}
                scope="col"
                onClick={() => {
                  if (!isSortingDisabled(colIndex)) {
                    requestSort(column.label);
                  }
                }}
                className={getHeaderClassName(colIndex, column)}
              >
                <div className="header-content">
                  <span>{column.label}</span>
                  {shouldShowSortIndicator(colIndex) && 
                    <SortIndicator column={column.label} sortConfig={sortConfig} />
                  }
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="excel-table-body">
          {data.length > 0 ? (
          sortedData.map((row, idx) => {
            // Create a stable key using row content
            const rowKey = `row-${idx}-${JSON.stringify(row).substring(0, 50)}`;
            return (
              <tr key={rowKey} className={selectedRows[idx] ? 'selected-row' : ''}>
                {/* Row number column */}
                <td className="row-number">
                  {idx + 1}
                </td>
                {/* Checkbox column - only show for test case rows (with USER ID) */}
                <td className={`checkbox-column ${whiteBackgroundActive ? 'white-bg' : ''}`}>
                  {(() => {
                    // Check if this row has any merged cells in the first data column (USER ID column)
                    const mergeInfo = getMergeInfoForCell(idx, 0); // Check first data column
                    
                    // Get the value from the USER ID column (first data column after #)
                    const userIdValue = getMergedCellValueByIndex(idx, 0);
                    
                    // Check if USER ID column has meaningful content
                    const hasUserIdContent = userIdValue && String(userIdValue).trim() !== '';
                    
                    // Show checkbox only if:
                    // 1. This is the main cell of a merged range AND has USER ID content, OR
                    // 2. This is a non-merged cell AND has data in USER ID column
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
                {/* Data cells for other columns - now with merged cell support */}
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