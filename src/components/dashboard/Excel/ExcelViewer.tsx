import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import '../../../styles/dashboard/excel-viewer/index.css';
import { useMergedCells, MergedCell } from './MergedCells';
import ProductBacklogService from '../../../api/ProductBacklogService';

// Type aliases to replace union types
type SaveStatus = 'success' | 'error' | null;
type SortDirection = 'asc' | 'desc' | null;
type ColumnDataType = 'number' | 'date' | 'string';


interface ExcelViewerProps {
  file: File | null;
  onReturn: () => void;
  isEditMode?: boolean;
  setIsEditMode?: (editMode: boolean) => void;
  activeTab?: string; // Add activeTab to check for file metadata
  lastSaveInfo?: {
    status: SaveStatus;
    timestamp: Date | null;
    message?: string;
  };
  setLastSaveInfo?: (saveInfo: {
    status: SaveStatus;
    timestamp: Date | null;
    message?: string;
  }) => void;
}

// Arayüz tanımı - başlık bilgisi için
interface ColumnHeader {
  id: string;
  label: string;
}

// Varsayılan başlıklar (Excel'den başlık okunamazsa kullanılacak)
const DEFAULT_TABLE_HEADERS: ColumnHeader[] = [
  { id: 'number', label: '#' },
  { id: 'template', label: 'TEMPLATE' },
  { id: 'percent', label: 'PERCENT' },
  { id: 'widget', label: 'WIDGET' },
  { id: 'number_val', label: 'NUMBER' },
  { id: 'date', label: 'DATE' },
  { id: 'time', label: 'TIME' },
  { id: 'custom', label: 'CUSTOM' },
  { id: 'link', label: 'LINK' },
  { id: 'rating', label: 'RATING' },
  { id: 'notes', label: 'NOTES' },
];

// Sort indicator component
interface SortIndicatorProps {
  column: string;
  sortConfig: {
    key: string;
    direction: SortDirection;
  };
};

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

export function ExcelViewer({ 
  file, 
  onReturn, 
  isEditMode = false,
  setIsEditMode,
  activeTab,
  lastSaveInfo: externalLastSaveInfo,
  setLastSaveInfo: externalSetLastSaveInfo 
}: Readonly<ExcelViewerProps>) {
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<{[key: number]: boolean}>({});
  const [whiteBackgroundActive, setWhiteBackgroundActive] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: SortDirection }>({
    key: '',
    direction: null
  });
  
  // Add state for sheet handling
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);
  
  // Dinamik başlıklar için state
  const [tableHeaders, setTableHeaders] = useState<ColumnHeader[]>(DEFAULT_TABLE_HEADERS);
  // Her sheet için başlık bilgisini saklayacağımız state
  const [sheetHeaders, setSheetHeaders] = useState<{[key: string]: ColumnHeader[]}>({});
    // Add state for storing worksheet objects to handle merged cells
  const [allSheetsWorksheets, setAllSheetsWorksheets] = useState<{[key: string]: XLSX.WorkSheet}>({});  const [activeWorksheet, setActiveWorksheet] = useState<XLSX.WorkSheet | null>(null);
  // Add state for cell editing
  const [editingCell, setEditingCell] = useState<{rowIndex: number, columnId: string} | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');  // Add state for save functionality
  const [modifiedData, setModifiedData] = useState<any[]>([]);
  // Use external lastSaveInfo if provided, otherwise use local fallback
  const setLastSaveInfo = externalSetLastSaveInfo || (() => {});
  
  // Use merged cells hook
  const {
    getMergeInfoForCell,
    getMergedCellValueByIndex
  } = useMergedCells(activeWorksheet, data, tableHeaders.map(h => h.label));
    // Handle checkbox toggle
  const handleCheckboxToggle = (idx: number) => {    console.log('Toggling checkbox for row:', idx);
    setSelectedRows(prev => {
      const newState = {
        ...prev,
        [idx]: !prev[idx]
      };
      return newState;
    });
  };  // Handle cell editing in edit mode
  const handleCellEditClick = (rowIndex: number, columnId: string, currentValue: any) => {
    if (columnId !== 'number') {
      // Find the column index for merged cell checking
      const columnIndex = tableHeaders.findIndex(header => header.id === columnId);
      if (columnIndex > 0) { // Skip row number column
        const mergeInfo = getMergeInfoForCell(rowIndex, columnIndex - 1);
        if (!mergeInfo.isCovered) {
          setEditingCell({ rowIndex, columnId });
          setEditingValue(String(currentValue ?? ''));
        } else {
          console.log('Cell is covered by merge, cannot edit');
        }
      }
    } else {
      console.log('Cell is row number, cannot edit');
    }
  };

  // Handle cell click in view mode
  const handleCellViewClick = (rowIndex: number, columnId: string, currentValue: any) => {
    console.log('View mode - cell click disabled');
  };

  // Determine which cell click handler to use
  const handleCellClick = isEditMode ? handleCellEditClick : handleCellViewClick;

  // Get table class name based on mode
  const getTableClassName = () => {
    const baseClasses = 'excel-table narrow-row-numbers sheet-change-transition';
    return isEditMode ? `${baseClasses} edit-mode` : baseClasses;
  };
  // Helper function to get sort-related classes
  const getSortClassName = (column: any) => {
    if (sortConfig.key !== column.label) return '';
    
    const classes = ['sort-active'];
    if (sortConfig.direction === 'asc') {
      classes.push('sort-asc');
    } else if (sortConfig.direction === 'desc') {
      classes.push('sort-desc');
    }
    return classes.join(' ');
  };

  // Helper function to get column positioning classes
  const getColumnPositionClasses = (colIndex: number) => {
    const classes = [];
    
    // Center align specific columns
    if (colIndex === 0 || 
        colIndex === tableHeaders.length - 2 || 
        (activeSheetIndex !== 0 && (colIndex === 1 || colIndex === 3 || colIndex === 8))) {
      classes.push('cell-align-center');
    }
    
    return classes;
  };

  // Helper function to get sheet-specific classes
  const getSheetSpecificClasses = (colIndex: number) => {
    const classes = [];
    
    // Text wrapping for DESCRIPTION column in first sheet
    if (activeSheetIndex === 0 && colIndex === 1) {
      classes.push('cell-wrap-text');
    }
    
    // Column-specific styles for non-first sheets
    if (activeSheetIndex !== 0) {
      if (colIndex === 1) classes.push('second-column-narrow');
      if (colIndex === 2) classes.push('third-column-wide');
      if (colIndex === 4) classes.push('fifth-column-narrow', 'fifth-column-header');
      if (colIndex === 8) classes.push('ninth-column-center');
    }
    
    return classes;
  };

  // Helper function to get special column classes
  const getSpecialColumnClasses = (colIndex: number) => {
    const classes = [];
    
    if (colIndex === tableHeaders.length - 2) classes.push('validation-column');
    if (colIndex === 0) classes.push('user-story-id-column');
    
    return classes;
  };

  // Helper function to get header class names
  const getHeaderClassName = (colIndex: number, column: any) => {
    const classes = [
      getSortClassName(column),
      ...getColumnPositionClasses(colIndex),
      ...getSheetSpecificClasses(colIndex),
      ...getSpecialColumnClasses(colIndex)
    ].filter(Boolean);
    
    return classes.join(' ');
  };

  // Helper function to get cell class names
  const getCellClassName = (colIndex: number) => {
    const classes = [
      'content-cell',
      ...getColumnPositionClasses(colIndex),
      ...getSheetSpecificClasses(colIndex),
      ...getSpecialColumnClasses(colIndex)
    ].filter(Boolean);
    
    return classes.join(' ');
  };

  // Helper function to check if sorting should be disabled
  const isSortingDisabled = (colIndex: number) => {
    return activeSheetIndex !== 0 && colIndex === 4;
  };

  // Helper function to check if sort indicator should be shown
  const shouldShowSortIndicator = (colIndex: number) => {
    return !isSortingDisabled(colIndex);
  };

  const handleCellSave = () => {
    console.log("handleCellSave called - editingCell:", editingCell, "editingValue:", editingValue);
    
    if (editingCell) {
      const { rowIndex, columnId } = editingCell;
      
      // Update both data and modifiedData states
      const updateDataState = (prevData: any[]) => {
        const newData = [...prevData];
        if (newData[rowIndex]) {
          newData[rowIndex] = {
            ...newData[rowIndex],
            [columnId]: editingValue
          };
          console.log("Updated row data:", newData[rowIndex]);
        }
        return newData;
      };
      
      setData(updateDataState);
      setModifiedData(updateDataState);
      
      setEditingCell(null);
      setEditingValue('');
      console.log("Cell save completed for cell:", { rowIndex, columnId, editingValue });
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditingValue('');
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCellSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCellCancel();
    }
  };

  // Function to create modified Excel file
  const createModifiedExcelFile = (): File => {
    console.log("createModifiedExcelFile - Creating Excel file from modifiedData:", modifiedData);
    
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Convert modified data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(modifiedData);
    
    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    
    // Write workbook to array buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Create File object
    const modifiedFile = new File([excelBuffer], file?.name ?? 'modified.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    console.log("createModifiedExcelFile - Created file:", modifiedFile);
    return modifiedFile;
  };
  // Function to handle save changes
  const handleSaveChanges = async () => {
    console.log("handleSaveChanges called - Starting save process");
    console.log("Current modifiedData:", modifiedData);
    
    if (!file) {
      console.error("No file available for saving");
      setLastSaveInfo({
        status: 'error',
        timestamp: new Date(),
        message: 'No file available for saving'      });
      return;
    }

    try {// Create Excel file from modified data
      console.log("Creating Excel file from modified data...");
      const modifiedFile = createModifiedExcelFile();
      
      // Call the save API
      console.log("Calling ProductBacklogService.saveToDatabase...");
      const result = await ProductBacklogService.saveToDatabase(modifiedFile);
      console.log("Save API response:", result);
      
      setLastSaveInfo({
        status: 'success',
        timestamp: new Date(),
        message: result.message ?? 'Data saved successfully'
      });
      
      // Dispatch success event for MainLayout to reload table statistics
      window.dispatchEvent(new CustomEvent('excelSaveSuccess'));
      
      // Dispatch event to update file database status
      window.dispatchEvent(new CustomEvent('fileStatusChanged', { 
        detail: { fileName: file.name, isInDatabase: true } 
      }));
      
      console.log("Save completed successfully");
      
    } catch (error) {
      console.error("Error saving changes:", error);
      setLastSaveInfo({
        status: 'error',
        timestamp: new Date(),        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };
  // Handle column sorting
  const requestSort = (key: string) => {
    // If clicking on the same column, toggle direction
    let direction: SortDirection = 'asc';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }
    
    // Always set the key, even when direction is null,
    // so we can display the default A-Z icon
    setSortConfig({ key, direction });
  };
  
  // Function to determine data type of a column
  const getColumnDataType = (key: string): ColumnDataType => {
    // Sample first non-null value to determine type
    const sampleValue = data.find(row => row[key] !== undefined && row[key] !== null)?.[key];
    
    if (sampleValue === undefined) return 'string';
    
    if (!isNaN(Number(sampleValue))) {
      return 'number';
    }
    
    // Check if it might be a date
    const dateRegex = /^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}$/;
    if (dateRegex.test(String(sampleValue)) || !isNaN(Date.parse(String(sampleValue)))) {
      return 'date';
    }
    
    return 'string';
  };

  // Sort the data based on current sort config
  const sortedData = useMemo(() => {
    // Make a copy of the data to avoid mutating the original
    let sortableData = [...data];
    
    // If no sort configuration or direction is null, return the original data
    if (!sortConfig.key || sortConfig.direction === null) {
      return sortableData;
    }
    
    const key = sortConfig.key;
    const dataType = getColumnDataType(key);
    
    return sortableData.sort((a, b) => {
      // Handle undefined or null values (push them to the end)
      if (a[key] === undefined || a[key] === null) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      if (b[key] === undefined || b[key] === null) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      
      let comparison = 0;
      
      // Sort based on data type
      if (dataType === 'number') {
        comparison = Number(a[key]) - Number(b[key]);
      } else if (dataType === 'date') {
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        comparison = dateA.getTime() - dateB.getTime();
      } else {
        // Default string comparison
        comparison = String(a[key]).localeCompare(String(b[key]));
      }
        // Reverse if direction is descending
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig, getColumnDataType]);
  
  // Handle select all checkboxes
  const handleSelectAll = () => {
    console.log('Select all clicked');
    setWhiteBackgroundActive(prev => !prev); // Toggle white background
    
    // If the selectedRows count matches data length and all are true, then deselect all
    // Otherwise select all rows regardless of current state
    if (data.length > 0 && 
        Object.keys(selectedRows).length === data.length && 
        data.every((_, idx) => selectedRows[idx])) {
      // If all are selected, deselect all
      console.log('Deselecting all rows');
      setSelectedRows({});
    } else {
      // Select all rows by creating a new object with all indices set to true
      const newSelected: {[key: number]: boolean} = {};
      data.forEach((_, idx) => {
        newSelected[idx] = true;
      });
      console.log('Selecting all rows:', newSelected);
      setSelectedRows(newSelected);
    }
  };  // State to store all sheets data to prevent flickering during sheet changes
  const [allSheetsData, setAllSheetsData] = useState<{[key: string]: any[]}>({});
    // Handle sheet change - now uses pre-loaded data for smoother transitions  // Helper function to validate sheet change request
  const isValidSheetChange = (sheetIndex: number): boolean => {
    return sheetIndex !== activeSheetIndex && 
           file !== null && 
           sheetIndex < sheetNames.length;
  };

  // Helper function to load cached sheet data
  const loadCachedSheetData = (sheetName: string, sheetIndex: number): void => {
    setData(allSheetsData[sheetName]);
    
    if (allSheetsWorksheets[sheetName]) {
      setActiveWorksheet(allSheetsWorksheets[sheetName]);
    }
    
    if (sheetHeaders[sheetName]) {
      setTableHeaders(sheetHeaders[sheetName]);
    }
    
    updateSheetState(sheetIndex);
  };

  // Helper function to update sheet state
  const updateSheetState = (sheetIndex: number): void => {
    setActiveSheetIndex(sheetIndex);
    setSelectedRows({});
    setSortConfig({ key: '', direction: null });
  };

  // Helper function to process worksheet data
  const processWorksheetData = (worksheet: XLSX.WorkSheet): any[] => {
    const range = worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']) : null;
    
    if (!range) {
      return [];
    }

    const lastDataRow = findLastDataRow(worksheet);
    const limitedRange = {
      s: { r: range.s.r, c: range.s.c },
      e: { r: lastDataRow, c: range.e.c }
    };

    return XLSX.utils.sheet_to_json(worksheet, { 
      defval: '', 
      blankrows: true, 
      range: limitedRange 
    });
  };

  // Helper function to handle successful sheet loading
  const handleSheetLoadSuccess = (
    sheetName: string, 
    sheetIndex: number, 
    jsonData: any[], 
    worksheet: XLSX.WorkSheet, 
    extractedHeaders: ColumnHeader[]
  ): void => {
    setData(jsonData);
    setActiveWorksheet(worksheet);
    setTableHeaders(extractedHeaders);
    
    setAllSheetsData(prev => ({ ...prev, [sheetName]: jsonData }));
    setAllSheetsWorksheets(prev => ({ ...prev, [sheetName]: worksheet }));
    setSheetHeaders(prev => ({ ...prev, [sheetName]: extractedHeaders }));
    
    updateSheetState(sheetIndex);
    setLoading(false);
  };

  // Helper function to handle sheet loading errors
  const handleSheetLoadError = (error: any, message: string): void => {
    console.error(message, error);
    setError(message);
    setLoading(false);
  };

  // Helper function to load new sheet data
  const loadNewSheetData = (sheetIndex: number): void => {
    if (!file) return;
    
    setLoading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[sheetIndex];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = processWorksheetData(worksheet);
        const extractedHeaders = extractHeadersFromWorksheet(worksheet);
        
        handleSheetLoadSuccess(sheetName, sheetIndex, jsonData, worksheet, extractedHeaders);
      } catch (err) {
        handleSheetLoadError(err, 'Error parsing Excel sheet.');
      }
    };
    
    reader.onerror = () => handleSheetLoadError(null, 'Could not read file.');
    
    try {
      reader.readAsArrayBuffer(file);
    } catch (err) {
      handleSheetLoadError(err, 'Error reading Excel file.');
    }
  };

  const handleSheetChange = (sheetIndex: number) => {
    if (!isValidSheetChange(sheetIndex)) {
      return;
    }
    
    const sheetName = sheetNames[sheetIndex];
    
    if (allSheetsData[sheetName]) {
      loadCachedSheetData(sheetName, sheetIndex);
    } else {
      loadNewSheetData(sheetIndex);
    }
  };  // Helper function to preload sheet data
  const preloadSheetData = (workbook: XLSX.WorkBook, sheetName: string): { data: any[], worksheet: XLSX.WorkSheet } => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = processWorksheetData(worksheet);
    
    return { data: jsonData, worksheet };
  };

  // Helper function to preload multiple sheets
  const preloadMultipleSheets = (workbook: XLSX.WorkBook, allSheetNames: string[]): {
    preloadedData: {[key: string]: any[]},
    preloadedWorksheets: {[key: string]: XLSX.WorkSheet},
    extractedHeaders: {[key: string]: ColumnHeader[]}
  } => {
    const sheetsToPreload = Math.min(3, allSheetNames.length);
    const preloadedData: {[key: string]: any[]} = {};
    const preloadedWorksheets: {[key: string]: XLSX.WorkSheet} = {};
    const extractedHeaders: {[key: string]: ColumnHeader[]} = {};

    for (let i = 0; i < sheetsToPreload; i++) {
      const sheetName = allSheetNames[i];
      const { data, worksheet } = preloadSheetData(workbook, sheetName);
      
      preloadedData[sheetName] = data;
      preloadedWorksheets[sheetName] = worksheet;
      extractedHeaders[sheetName] = extractHeadersFromWorksheet(worksheet);
    }

    return { preloadedData, preloadedWorksheets, extractedHeaders };
  };

  // Helper function to initialize first sheet
  const initializeFirstSheet = (
    allSheetNames: string[],
    preloadedData: {[key: string]: any[]},
    preloadedWorksheets: {[key: string]: XLSX.WorkSheet},
    extractedHeaders: {[key: string]: ColumnHeader[]}
  ): void => {
    const firstSheet = allSheetNames[0];
    
    setData(preloadedData[firstSheet]);
    setActiveWorksheet(preloadedWorksheets[firstSheet]);
    setTableHeaders(extractedHeaders[firstSheet] || DEFAULT_TABLE_HEADERS);
    
    setActiveSheetIndex(0);
    setSelectedRows({});
    setSortConfig({ key: '', direction: null });
  };

  // Helper function to handle Excel reading success
  const handleExcelReadSuccess = (workbook: XLSX.WorkBook): void => {
    const allSheetNames = workbook.SheetNames;
    setSheetNames(allSheetNames);

    const { preloadedData, preloadedWorksheets, extractedHeaders } = preloadMultipleSheets(workbook, allSheetNames);    setAllSheetsData(preloadedData);
    setAllSheetsWorksheets(preloadedWorksheets);
    setSheetHeaders(extractedHeaders);

    initializeFirstSheet(allSheetNames, preloadedData, preloadedWorksheets, extractedHeaders);
    setLoading(false);
  };

  // Excel dosyasını oku and preload first few sheets
  useEffect(() => {
    const readExcel = async () => {
      if (!file) {
        setError('No file provided');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          handleExcelReadSuccess(workbook);
        } catch (err) {
          handleSheetLoadError(err, 'Excel dosyası çözümlenirken hata oluştu.');
        }
      };
      
      reader.onerror = () => handleSheetLoadError(null, 'Dosya okunamadı.');
      
      try {
        reader.readAsArrayBuffer(file);
      } catch (err) {
        handleSheetLoadError(err, 'Excel dosyası okunurken hata oluştu.');
      }
    };

    readExcel();
  }, [file, activeTab]);
  // Sync modifiedData with data when data changes
  useEffect(() => {
    setModifiedData([...data]);
  }, [data]);

  // Add custom event listener for save trigger
  useEffect(() => {
    const handleSaveTrigger = () => {
      console.log("Custom save event received");
      handleSaveChanges();
    };

    window.addEventListener('triggerExcelSave', handleSaveTrigger);    return () => {
      window.removeEventListener('triggerExcelSave', handleSaveTrigger);
    };
  }, [modifiedData, file, handleSaveChanges]); // Dependencies for handleSaveChanges

  // File validation after all hooks
  if (!file) {
    console.log('ExcelViewer: No file provided');
    return (
      <div className="w-full bg-white h-full flex flex-col p-8">
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <h2 className="text-lg font-medium text-red-600 mb-4">No file provided</h2>
            <button
              onClick={onReturn}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Return
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('ExcelViewer: File provided:', file.name);

  // We'll only show the full-page loading spinner on initial load
  // For sheet changes, we'll handle the loading state differently
  if (loading && (!data.length || !sheetNames.length)) {
    return (
      <div className="mt-10 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
    if (error) {
    return (
      <div className="mt-10 text-center text-red-500">
        <p>{error}</p>
        <button 
          onClick={onReturn}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Return
        </button>
      </div>
    );
  }  return (
    <div className="excel-container">
      <div className="table-container">
        {/* Small loading indicator that appears when switching sheets */}
        {loading && data.length > 0 && (
          <div className="sheet-loading-indicator">
            Loading sheet...
          </div>
        )}
          {/* Sheet tabs */}
        {sheetNames.length > 0 && (
          <div className="sheet-tabs-container" role="tablist" aria-label="Excel sheet tabs">            {sheetNames.map((sheetName, index) => {
              const isSelected = index === activeSheetIndex;
              return (<div 
                  key={sheetName}
                  className={`sheet-tab sheet-tab-color-${index % 6} ${isSelected ? 'active' : ''}`} 
                  role="tab"
                  tabIndex={0}
                  aria-label={`Switch to ${sheetName} sheet`}
                  onClick={() => handleSheetChange(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSheetChange(index);
                    }
                  }}
                >
                {sheetName}
                {/* Show loading indicator for sheets that aren't loaded yet */}
                {!allSheetsData[sheetName] && index !== activeSheetIndex && (
                  <span className="sheet-loading-dot" title="This sheet will load when selected">•</span>                )}
                <div className="sheet-tab-indicator" />
              </div>
              );
            })}
          </div>
        )}          <div className="table-scroll-container">
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
                      onChange={handleSelectAll}
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
                      {/* Checkbox column */}
                      <td className={`checkbox-column ${whiteBackgroundActive ? 'white-bg' : ''}`}>
                        <input 
                          type="checkbox" 
                          className="regular-checkbox"
                          id={`row-checkbox-${idx}`}
                          aria-label={`Select row ${idx + 1}`}
                          title={`Select row ${idx + 1}`}
                          checked={!!selectedRows[idx]} 
                          onChange={() => handleCheckboxToggle(idx)}
                        />
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
                            onCellClick={() => handleCellClick(idx, column.id, cellValue)}
                            onValueChange={setEditingValue}
                            onKeyDown={handleKeyDown}
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
      </div>
    </div>
  );
}

/**
 * Dynamic Headers Implementation Overview:
 * 
 * 1. We define a ColumnHeader interface with id and label properties
 * 2. Default headers are defined as a fallback when headers can't be extracted
 * 3. We maintain headers for each sheet using the sheetHeaders state
 * 4. When a sheet is loaded, we extract headers using extractHeadersFromWorksheet
 * 5. The table UI uses the dynamically extracted headers for both display and data mapping
 */

// Extract headers from Excel worksheet
const extractHeadersFromWorksheet = (worksheet: XLSX.WorkSheet): ColumnHeader[] => {
  try {
    // Get the range reference from the worksheet
    const range = XLSX.utils.decode_range(worksheet['!ref'] ?? 'A1');
    
    // If the sheet is empty, return default headers
    if (range.s.r > range.e.r || range.s.c > range.e.c) {
      return DEFAULT_TABLE_HEADERS;
    }

    // Extract headers from the first row
    const headers: ColumnHeader[] = [{ id: 'number', label: '#' }]; // Always include row number header
    
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
      const cell = worksheet[cellAddress];
      
      if (cell?.v !== undefined && cell.v !== null) {
        // Use the cell value as both id and label to make it consistent with the current implementation
        const headerText = String(cell.v).trim();
        headers.push({ id: headerText.toLowerCase().replace(/\s+/g, '_'), label: headerText });
      }
    }
    
    // If we couldn't extract any headers (beyond the # header), use default headers
    return headers.length > 1 ? headers : DEFAULT_TABLE_HEADERS;
  } catch (error) {
    console.error('Error extracting headers from worksheet:', error);
    return DEFAULT_TABLE_HEADERS;
  }
};

// Function to find the last row with actual data
const findLastDataRow = (worksheet: XLSX.WorkSheet): number => {
  try {
    const range = worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']) : null;
    if (!range) return 0;
    
    // Start from the end and work backwards to find the last row with meaningful data
    for (let row = range.e.r; row >= range.s.r; row--) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        
        // Check if cell has actual content (not just empty string)
        if (cell?.v !== undefined && cell.v !== null && String(cell.v).trim() !== '') {
          return row;
        }
      }
    }
    
    return range.s.r; // Return start row if no data found
  } catch (error) {
    console.error('Error finding last data row:', error);
    return 0;
  }
};