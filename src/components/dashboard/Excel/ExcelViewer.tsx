import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import '../../../styles/dashboard/excel-viewer/index.css';
import { useMergedCells, MergedCell } from './MergedCells';
import ProductBacklogService from '../../../api/ProductBacklogService';


interface ExcelViewerProps {
  file: File | null;
  onReturn: () => void;
  isEditMode?: boolean;
  setIsEditMode?: (editMode: boolean) => void;
  activeTab?: string; // Add activeTab to check for file metadata
  lastSaveInfo?: {
    status: 'success' | 'error' | null;
    timestamp: Date | null;
    message?: string;
  };
  setLastSaveInfo?: (saveInfo: {
    status: 'success' | 'error' | null;
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
    direction: 'asc' | 'desc' | null;
  };
};

const SortIndicator: React.FC<SortIndicatorProps> = ({ column, sortConfig }) => {
  const isActive = sortConfig.key === column;
  const isAsc = isActive && sortConfig.direction === 'asc';
  const isDesc = isActive && sortConfig.direction === 'desc';
  
  return (
    <div 
      className={`sort-indicator-container ${isActive ? 'sort-active' : ''} ${isAsc ? 'sort-asc' : ''} ${isDesc ? 'sort-desc' : ''}`}
      aria-hidden="true"
    >
      {isAsc ? (
        <span className="sort-arrow">↑</span>
      ) : isDesc ? (
        <span className="sort-arrow">↓</span>
      ) : (
        <div className="sort-arrow-default">
          <div className="az-icon">
            <span className="az-letter">A</span>
            <span className="az-letter">Z</span>
          </div>
          <span className="default-arrow">↑</span>
        </div>
      )}
    </div>
  );
};

export function ExcelViewer({ 
  file, 
  onReturn, 
  isEditMode = false,   setIsEditMode,
  activeTab,
  lastSaveInfo: externalLastSaveInfo,
  setLastSaveInfo: externalSetLastSaveInfo 
}: ExcelViewerProps) {
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<{[key: number]: boolean}>({});
  const [whiteBackgroundActive, setWhiteBackgroundActive] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
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
  const [modifiedData, setModifiedData] = useState<any[]>([]);  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Use external lastSaveInfo if provided, otherwise use local fallback
  const lastSaveInfo = externalLastSaveInfo || { status: null, timestamp: null };
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
  };  // Handle cell editing
  const handleCellClick = (rowIndex: number, columnId: string, currentValue: any) => {
    if (isEditMode && columnId !== 'number') {
      // Find the column index for merged cell checking
      const columnIndex = tableHeaders.findIndex(header => header.id === columnId);
      if (columnIndex > 0) { // Skip row number column
        const mergeInfo = getMergeInfoForCell(rowIndex, columnIndex - 1);
        if (!mergeInfo.isCovered) {
          setEditingCell({ rowIndex, columnId });
          setEditingValue(String(currentValue || ''));
        } else {
          console.log('Cell is covered by merge, cannot edit');
        }
      }
    } else {
      console.log('Edit mode is off or cell is row number');
    }
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
    const modifiedFile = new File([excelBuffer], file?.name || 'modified.xlsx', {
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
        message: 'No file available for saving'
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Create Excel file from modified data
      console.log("Creating Excel file from modified data...");
      const modifiedFile = createModifiedExcelFile();
        // Call the save API
      console.log("Calling ProductBacklogService.saveToDatabase...");
      const result = await ProductBacklogService.saveToDatabase(modifiedFile);
      console.log("Save API response:", result);
      
      setLastSaveInfo({
        status: 'success',
        timestamp: new Date(),
        message: result.message || 'Data saved successfully'
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
        timestamp: new Date(),
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsSaving(false);    }
  };

  // Handle column sorting
  const requestSort = (key: string) => {
    // If clicking on the same column, toggle direction
    let direction: 'asc' | 'desc' | null = 'asc';
    
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
  const getColumnDataType = (key: string): 'number' | 'date' | 'string' => {
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
    // Handle sheet change - now uses pre-loaded data for smoother transitions
  const handleSheetChange = (sheetIndex: number) => {
    if (sheetIndex === activeSheetIndex || !file || sheetIndex >= sheetNames.length) {
      return; // No change needed
    }
    
    const sheetName = sheetNames[sheetIndex];
    
    // Check if we already have the data for this sheet
    if (allSheetsData[sheetName]) {
      // Use cached data for immediate switching without loading screen
      setData(allSheetsData[sheetName]);
      // Set the worksheet for merged cells handling
      if (allSheetsWorksheets[sheetName]) {
        setActiveWorksheet(allSheetsWorksheets[sheetName]);
      }
      // Eğer bu sheet için önceden çıkarılmış başlıklar varsa, onları kullan
      if (sheetHeaders[sheetName]) {
        setTableHeaders(sheetHeaders[sheetName]);
      }
      setActiveSheetIndex(sheetIndex);
      setSelectedRows({});
      setSortConfig({ key: '', direction: null });
    } else {
      // Only show loading if we don't have the data yet
      setLoading(true);
      
      try {
        // Read the file again to get the selected sheet
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });              const sheetName = workbook.SheetNames[sheetIndex];
            const worksheet = workbook.Sheets[sheetName];
            
            // Get the actual data range to avoid infinite empty rows
            const range = worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']) : null;
            let jsonData: any[] = [];
            
            if (range) {
              // Find the last row with actual data
              const lastDataRow = findLastDataRow(worksheet);
              
              // Create a limited range from start to last data row
              const limitedRange = {
                s: { r: range.s.r, c: range.s.c },
                e: { r: lastDataRow, c: range.e.c }
              };
              
              // Use defval to preserve empty rows and cells within the actual data range
              jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                defval: '', // Default value for empty cells
                blankrows: true, // Include blank rows
                range: limitedRange // Limit to actual data range
              }) as any[];
            }
            
          // Extract headers
            const extractedHeaders = extractHeadersFromWorksheet(worksheet);
            
            // Update states
            setData(jsonData);
            setActiveWorksheet(worksheet);
            setTableHeaders(extractedHeaders);
            setActiveSheetIndex(sheetIndex);
            setSelectedRows({});
            setSortConfig({ key: '', direction: null });
            
            // Store the data and worksheet for future use
            setAllSheetsData(prev => ({
              ...prev,
              [sheetName]: jsonData
            }));
            
            setAllSheetsWorksheets(prev => ({
              ...prev,
              [sheetName]: worksheet
            }));
            
            // Save headers
            setSheetHeaders(prev => ({
              ...prev,
              [sheetName]: extractedHeaders
            }));
            
            setLoading(false);
          } catch (err) {
            console.error('Error parsing Excel sheet:', err);
            setError('Error parsing Excel sheet.');
            setLoading(false);
          }
        };
        
        reader.onerror = () => {
          setError('Could not read file.');
          setLoading(false);
        };
        
        reader.readAsArrayBuffer(file);
      } catch (err) {
        console.error('Error reading Excel file:', err);
        setError('Error reading Excel file.');
        setLoading(false);
      }
    }
  };  // Excel dosyasını oku and preload first few sheets
  useEffect(() => {
    const readExcel = async () => {
      try {        if (!file) {
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
            
            // Get all sheet names
            const allSheetNames = workbook.SheetNames;
            setSheetNames(allSheetNames);
              // Preload data for up to first 3 sheets to make switching faster
            const preloadedData: {[key: string]: any[]} = {};
            const preloadedWorksheets: {[key: string]: XLSX.WorkSheet} = {};
            const sheetsToPreload = Math.min(3, allSheetNames.length);            for (let i = 0; i < sheetsToPreload; i++) {
              const sheetName = allSheetNames[i];
              const worksheet = workbook.Sheets[sheetName];
              
              // Get the actual data range to avoid infinite empty rows
              const range = worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']) : null;
              let jsonData: any[] = [];
              
              if (range) {
                // Find the last row with actual data
                const lastDataRow = findLastDataRow(worksheet);
                
                // Create a limited range from start to last data row
                const limitedRange = {
                  s: { r: range.s.r, c: range.s.c },
                  e: { r: lastDataRow, c: range.e.c }
                };
                
                // Use defval to preserve empty rows and cells within the actual data range
                jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                  defval: '', // Default value for empty cells
                  blankrows: true, // Include blank rows
                  range: limitedRange // Limit to actual data range
                }) as any[];
              }
              
              preloadedData[sheetName] = jsonData;
              preloadedWorksheets[sheetName] = worksheet;
            }
              // Set all preloaded sheets data and worksheets
            setAllSheetsData(preloadedData);
            setAllSheetsWorksheets(preloadedWorksheets);
            
            // Extract and store headers for each preloaded sheet
            const extractedHeaders: {[key: string]: ColumnHeader[]} = {};
            for (let i = 0; i < sheetsToPreload; i++) {
              const sheetName = allSheetNames[i];
              const worksheet = workbook.Sheets[sheetName];
              extractedHeaders[sheetName] = extractHeadersFromWorksheet(worksheet);
            }
            
            // Set headers for all preloaded sheets
            setSheetHeaders(extractedHeaders);
            
            // Load first sheet by default
            const firstSheet = allSheetNames[0];
            setData(preloadedData[firstSheet]);
            setActiveWorksheet(preloadedWorksheets[firstSheet]);
            
            // Set the headers for the first sheet
            setTableHeaders(extractedHeaders[firstSheet] || DEFAULT_TABLE_HEADERS);
            
            // Reset states
            setActiveSheetIndex(0);
            setSelectedRows({});
            setSortConfig({ key: '', direction: null });
            setLoading(false);
          } catch (err) {
            console.error('Excel dosyası çözümlenirken hata oluştu:', err);
            setError('Excel dosyası çözümlenirken hata oluştu.');
            setLoading(false);
          }
        };
        
        reader.onerror = () => {
          setError('Dosya okunamadı.');
          setLoading(false);
        };
        
        reader.readAsArrayBuffer(file);
      } catch (err) {
        console.error('Excel dosyası okunurken hata oluştu:', err);
        setError('Excel dosyası okunurken hata oluştu.');
        setLoading(false);
      }
    };      readExcel();
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
          <div className="sheet-tabs-container">
            {sheetNames.map((sheetName, index) => (
              <div 
                key={index}
                className={`sheet-tab sheet-tab-color-${index % 6} ${index === activeSheetIndex ? 'active' : ''}`} 
                onClick={() => handleSheetChange(index)}
              >
                {sheetName}
                {/* Show loading indicator for sheets that aren't loaded yet */}
                {!allSheetsData[sheetName] && index !== activeSheetIndex && (
                  <span className="sheet-loading-dot" title="This sheet will load when selected">•</span>
                )}
                <div className="sheet-tab-indicator" />
              </div>
            ))}
          </div>
        )}          <div className="table-scroll-container">
            <table className={`excel-table narrow-row-numbers sheet-change-transition ${isEditMode ? 'edit-mode' : ''}`}>
              <thead className="excel-table-header">
                <tr>
                  <th className="row-number-header">
                    <span className="hash-symbol">#</span>
                  </th>                  {/* Checkbox column header */}
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
                  </th>                  {/* Dynamic column headers - skip the first one (#) since we're handling it separately */}
                  {tableHeaders.slice(1).map((column, colIndex) => (
                    <th 
                      key={column.id}
                      scope="col"
                      onClick={() => {
                      // Disable sorting for 5th column in non-first sheets
                      if (!(activeSheetIndex !== 0 && colIndex === 4)) {
                        requestSort(column.label);
                      }
                    }}
                    className={`${sortConfig.key === column.label ? 'sort-active' : ''} ${
                      sortConfig.key === column.label && sortConfig.direction === 'asc' ? 'sort-asc' : 
                      sortConfig.key === column.label && sortConfig.direction === 'desc' ? 'sort-desc' : ''                    }                    ${colIndex === 0 || colIndex === tableHeaders.length - 2 || (activeSheetIndex !== 0 && (colIndex === 1 || colIndex === 3 || colIndex === 8)) ? 'cell-align-center' : ''}                    ${activeSheetIndex === 0 && colIndex === 1 ? 'cell-wrap-text' : ''}
                    ${activeSheetIndex !== 0 && colIndex === 1 ? 'second-column-narrow' : ''}                    ${activeSheetIndex !== 0 && colIndex === 2 ? 'third-column-wide' : ''}
                    ${activeSheetIndex !== 0 && colIndex === 4 ? 'fifth-column-narrow fifth-column-header' : ''}
                    ${activeSheetIndex !== 0 && colIndex === 8 ? 'ninth-column-center' : ''}
                    ${colIndex === tableHeaders.length - 2 ? 'validation-column' : ''}
                    ${colIndex === 0 ? 'user-story-id-column' : ''}`}
                  >                    <div className="header-content">
                      <span>{column.label}</span>
                      {/* Hide sort indicator for 5th column (index 4) in non-first sheets */}
                      {!(activeSheetIndex !== 0 && colIndex === 4) && 
                        <SortIndicator column={column.label} sortConfig={sortConfig} />
                      }
                    </div>                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="excel-table-body">
              {data.length > 0 ? (
                sortedData.map((row, idx) => (
                  <tr key={idx} className={selectedRows[idx] ? 'selected-row' : ''}>
                    {/* Row number column */}
                    <td className="row-number">
                      {idx + 1}                    </td>
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
                    </td>                    {/* Data cells for other columns - now with merged cell support */}                    {tableHeaders.slice(1).map((column, colIndex) => {
                      const mergeInfo = getMergeInfoForCell(idx, colIndex);
                      const cellValue = getMergedCellValueByIndex(idx, colIndex);                      // Class determination based on column index
                      let className = 'content-cell';                        // Center align USER ID, second column in non-first sheets, fourth column in non-first sheets, ninth column in non-first sheets, and VALIDATION columns
                      if (colIndex === 0 || colIndex === tableHeaders.length - 2 || (activeSheetIndex !== 0 && (colIndex === 1 || colIndex === 3 || colIndex === 8))) {
                        className += ' cell-align-center';
                      }
                        // Apply text wrapping to DESCRIPTION column (index 1) only in the first sheet
                      if (activeSheetIndex === 0 && colIndex === 1) {
                        className += ' cell-wrap-text';
                      }
                        // Apply narrow width to the second column in all sheets except the first one
                      if (activeSheetIndex !== 0 && colIndex === 1) {
                        className += ' second-column-narrow';
                      }
                        // Apply wide width to the third column in all sheets except the first one
                      if (activeSheetIndex !== 0 && colIndex === 2) {
                        className += ' third-column-wide';
                      }
                      
                      // Apply narrow width to the fifth column in all sheets except the first one
                      if (activeSheetIndex !== 0 && colIndex === 4) {
                        className += ' fifth-column-narrow';
                      }
                        
                      // Apply narrow width to VALIDATION column
                      if (colIndex === tableHeaders.length - 2) {
                        className += ' validation-column';
                      }
                        // Apply narrow width to first column in all sheets
                      if (colIndex === 0) {
                        className += ' user-story-id-column';
                      }
                      
                      // Apply center alignment to ninth column in all sheets except first one
                      if (activeSheetIndex !== 0 && colIndex === 8) {
                        className += ' ninth-column-center';
                      }
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
                ))              ) : (
                <tr>
                  <td colSpan={tableHeaders.length + 1} className="text-center">
                    No data found                  </td>
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
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // If the sheet is empty, return default headers
    if (range.s.r > range.e.r || range.s.c > range.e.c) {
      return DEFAULT_TABLE_HEADERS;
    }

    // Extract headers from the first row
    const headers: ColumnHeader[] = [{ id: 'number', label: '#' }]; // Always include row number header
    
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
      const cell = worksheet[cellAddress];
      
      if (cell && cell.v !== undefined && cell.v !== null) {
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
        if (cell && cell.v !== undefined && cell.v !== null && String(cell.v).trim() !== '') {
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