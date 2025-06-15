// MergedCells.tsx - Component for handling merged cells in Excel data display
import React from 'react';
import * as XLSX from 'xlsx';
import '../../../styles/dashboard/excel-viewer/merged-cells.css';

// Interface to represent a merged cell range
export interface MergedCellInfo {
  s: { r: number, c: number }; // start row, start column  
  e: { r: number, c: number }; // end row, end column
  value?: any; // The value from the top-left cell
}

// Interface to track if a cell is covered by a merged cell
export interface CellMergeInfo {
  rowspan: number;
  colspan: number;
  isMerged: boolean;
  isMainCell: boolean; // True for the top-left cell in a merged range
  isCovered: boolean;  // True for cells that are covered by a merged range (not the top-left)
  mergeId?: string;    // Unique identifier for the merged cell group
}

// Extract merged cells information from Excel worksheet
export function getMergedCellsInfo(worksheet: XLSX.WorkSheet): MergedCellInfo[] {
  if (!worksheet['!merges']) {
    return [];
  }
  
  return worksheet['!merges'].map((merge, index) => ({
    s: merge.s,
    e: merge.e,
    value: undefined // Will be filled later with the actual cell value
  }));
}

// Create a 2D array to track merged cell info
export function createMergedCellsTracker(
  rowCount: number, 
  colCount: number,
  mergedCells: MergedCellInfo[],
  data: any[],
  headers: string[]
): CellMergeInfo[][] {
  const tracker: CellMergeInfo[][] = [];
  
  // Initialize the tracker with default values
  for (let r = 0; r < rowCount; r++) {
    tracker[r] = [];
    for (let c = 0; c < colCount; c++) {
      tracker[r][c] = {
        rowspan: 1,
        colspan: 1,
        isMerged: false,
        isMainCell: false,
        isCovered: false
      };
    }
  }
  
  // Process each merged cell range
  mergedCells.forEach((merge, mergeIndex) => {
    const startRow = merge.s.r;
    const endRow = merge.e.r;
    const startCol = merge.s.c;
    const endCol = merge.e.c;
    
    const rowspan = endRow - startRow + 1;
    const colspan = endCol - startCol + 1;
    const mergeId = `merge_${mergeIndex}`;
    
    // Mark all cells in the merge range
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        // Adjust for our table structure (skip row number and checkbox columns)
        // Excel columns map to our table columns starting from index 2 (after # and checkbox)
        const tableRow = r - 1; // Excel is 1-based, our table is 0-based for data
        const tableCol = c;      // Keep column as is since we'll handle the offset in rendering
        
        if (tableRow >= 0 && tableRow < rowCount && tableCol >= 0 && tableCol < colCount) {
          tracker[tableRow][tableCol] = {
            rowspan: rowspan,
            colspan: colspan,
            isMerged: true,
            isMainCell: r === startRow && c === startCol,
            isCovered: !(r === startRow && c === startCol),
            mergeId: mergeId
          };
        }
      }
    }
  });
  
  return tracker;
}

// Get the value for a merged cell (from the top-left cell)
export function getMergedCellValue(
  worksheet: XLSX.WorkSheet,
  merge: MergedCellInfo
): any {
  const cellAddress = XLSX.utils.encode_cell({ r: merge.s.r, c: merge.s.c });
  const cell = worksheet[cellAddress];
  return cell ? cell.v : '';
}

// Component to render a merged cell
interface MergedCellProps {
  mergeInfo: CellMergeInfo;
  value: any;
  className?: string;
  children?: React.ReactNode;
  isEditMode?: boolean;
  isEditing?: boolean;
  editValue?: string;
  onCellClick?: () => void;
  onValueChange?: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

// Memoized MergedCell for better performance with custom comparison
export const MergedCell = React.memo<MergedCellProps>(({ 
  mergeInfo, 
  value, 
  className = '',
  children,
  isEditMode = false,
  isEditing = false,
  editValue = '',
  onCellClick,
  onValueChange,
  onKeyDown
}) => {
  // Removed debug logging for performance

  // If this cell is covered by a merge, don't render it
  if (mergeInfo.isCovered) {
    return null;
  }

  // Render cell content based on edit state
  const renderCellContent = () => {
    if (children) {
      return children;
    }    if (isEditing) {
      return (
        <input
          className="cell-edit-input"
          type="text"
          value={editValue}
          onChange={(e) => onValueChange?.(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
          title="Edit cell value"
          placeholder="Enter value"
          aria-label="Edit cell value"
        />
      );
    }

    return (
      <span className="cell-content">
        {value !== undefined ? value : ''}
      </span>
    );
  };

  // Determine additional classes for edit mode
  const editClasses = isEditMode && !isEditing ? 'editable-cell' : '';
  const finalClassName = `${className} ${editClasses}`.trim();

  // If this is the main cell of a merge, render with rowspan/colspan
  if (mergeInfo.isMainCell && mergeInfo.isMerged) {
    return (
      <td 
        className={`merged-cell merged-main-cell ${finalClassName}`}
        rowSpan={mergeInfo.rowspan}
        colSpan={mergeInfo.colspan}
        onClick={onCellClick}
      >
        <div className="merged-cell-content">
          {renderCellContent()}
        </div>
      </td>
    );
  }

  // Regular cell (not merged)
  return (
    <td 
      className={`regular-cell ${finalClassName}`}
      onClick={onCellClick}
    >
      {renderCellContent()}    </td>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.value === nextProps.value &&
    prevProps.isEditMode === nextProps.isEditMode &&
    prevProps.isEditing === nextProps.isEditing &&
    prevProps.editValue === nextProps.editValue &&
    prevProps.className === nextProps.className &&
    JSON.stringify(prevProps.mergeInfo) === JSON.stringify(nextProps.mergeInfo)
  );
});

// Hook to use merged cells data
export function useMergedCells(
  worksheet: XLSX.WorkSheet | null,
  data: any[],
  headers: string[]
) {
  const mergedCells = React.useMemo(() => {
    if (!worksheet) return [];
    return getMergedCellsInfo(worksheet);
  }, [worksheet]);
  
  const mergedCellsTracker = React.useMemo(() => {
    if (!worksheet || !data.length) return [];
    
    // Calculate dimensions based on our data
    const rowCount = data.length;
    const colCount = headers.length;
    
    return createMergedCellsTracker(
      rowCount,
      colCount,
      mergedCells,
      data,
      headers
    );
  }, [worksheet, data, headers, mergedCells]);
  
  const getMergeInfoForCell = React.useCallback((rowIndex: number, colIndex: number): CellMergeInfo => {
    if (!mergedCellsTracker[rowIndex] || !mergedCellsTracker[rowIndex][colIndex]) {
      return {
        rowspan: 1,
        colspan: 1,
        isMerged: false,
        isMainCell: false,
        isCovered: false
      };
    }
    return mergedCellsTracker[rowIndex][colIndex];
  }, [mergedCellsTracker]);
  
  const getMergedCellValueByIndex = React.useCallback((rowIndex: number, colIndex: number): any => {
    if (!worksheet) return '';
    
    const mergeInfo = getMergeInfoForCell(rowIndex, colIndex);
    if (!mergeInfo.isMerged) {
      // Regular cell - get value from data
      const headerKey = headers[colIndex + 1]; // +1 because headers[0] is '#'
      return data[rowIndex] ? data[rowIndex][headerKey] : '';
    }
    
    // For merged cells, we need to find the original merge and get its value
    const merge = mergedCells.find((m, index) => 
      mergeInfo.mergeId === `merge_${index}`
    );
    
    if (merge) {
      return getMergedCellValue(worksheet, merge);
    }
    
    return '';
  }, [worksheet, data, headers, mergedCells, getMergeInfoForCell]);
  
  return {
    mergedCells,
    mergedCellsTracker,
    getMergeInfoForCell,
    getMergedCellValueByIndex
  };
}
