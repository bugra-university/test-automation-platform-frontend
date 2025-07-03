import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { ArrowLeft, Edit, Eye } from 'lucide-react';
import { Button } from '../../ui/button';
import '../../../styles/dashboard/excel-viewer/backlog-table.css';
import '../../../styles/dashboard/excel-viewer/sheet-tabs.css';
import { useMergedCells } from './MergedCells';
import { BacklogTable } from '../../Shared/Tables/BacklogTable';
import ProductBacklogService from '../../../api/ProductBacklogService';

// Type aliases to replace union types
type SaveStatus = 'success' | 'error' | null;


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
  const setLastSaveInfo = useMemo(() => externalSetLastSaveInfo || (() => {}), [externalSetLastSaveInfo]);
  
  // Use merged cells hook
  const {
    getMergeInfoForCell
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
  const createModifiedExcelFile = useCallback((): File => {
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
  }, [modifiedData, file]);
  // Function to handle save changes
  const handleSaveChanges = useCallback(async () => {
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
  }, [file, modifiedData, setLastSaveInfo, createModifiedExcelFile]);

  



  
  // Handle select all checkboxes
  const handleSelectAll = () => {
    console.log('Select all clicked');
    
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
  };

  // Helper function to process worksheet data
  const processWorksheetData = useCallback((worksheet: XLSX.WorkSheet): any[] => {
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
  }, []);

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
  const preloadSheetData = useCallback((workbook: XLSX.WorkBook, sheetName: string): { data: any[], worksheet: XLSX.WorkSheet } => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = processWorksheetData(worksheet);
    
    return { data: jsonData, worksheet };
  }, [processWorksheetData]);

  // Helper function to preload multiple sheets
  const preloadMultipleSheets = useCallback((workbook: XLSX.WorkBook, allSheetNames: string[]): {
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
  }, [preloadSheetData]);

  // Helper function to initialize first sheet
  const initializeFirstSheet = useCallback((
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
  }, []);

  // Helper function to handle Excel reading success
  const handleExcelReadSuccess = useCallback((workbook: XLSX.WorkBook): void => {
    const allSheetNames = workbook.SheetNames;
    setSheetNames(allSheetNames);

    const { preloadedData, preloadedWorksheets, extractedHeaders } = preloadMultipleSheets(workbook, allSheetNames);    setAllSheetsData(preloadedData);
    setAllSheetsWorksheets(preloadedWorksheets);
    setSheetHeaders(extractedHeaders);

    initializeFirstSheet(allSheetNames, preloadedData, preloadedWorksheets, extractedHeaders);
    setLoading(false);
  }, [preloadMultipleSheets, initializeFirstSheet]);

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
  }, [file, activeTab, handleExcelReadSuccess]);
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
    <div className="w-full bg-white h-full flex flex-col rounded-lg overflow-hidden">
      {/* Header Section */}
      <div className="flex justify-between items-center h-[72px] px-8 rounded-t-lg">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Backlog</h1>
        </div>
        <div className="flex gap-3 items-center">
          <Button 
            variant="outline" 
            className="gap-2 rounded-lg w-[150px]"
            onClick={onReturn}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Upload
          </Button>
          <Button 
            variant="outline"
            className={isEditMode ? "" : "inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-[150px]"}
            onClick={() => setIsEditMode?.(!isEditMode)}
          >
            {isEditMode ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                View Mode
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Mode
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Divider after header */}
      <div className="border-t border-gray-200"></div>

      {/* Excel Content Container */}
      <div className="flex-1 overflow-hidden px-8 pt-8 pb-8">
        <div className="h-full">
          {/* Sheet tabs container */}
          <div className="excel-header-and-tabs-container">
            {loading && data.length > 0 && (
              <div className="sheet-loading">
                Loading sheet...
              </div>
            )}
            {sheetNames.length > 0 && (
              <div className="sheet-tabs-container" role="tablist" aria-label="Excel sheet tabs">
                {sheetNames.map((sheetName, index) => (
                  <div 
                    key={sheetName}
                    className={`sheet-tab sheet-tab-color-${index % 6} ${index === activeSheetIndex ? 'active' : ''}`} 
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
                    {!allSheetsData[sheetName] && index !== activeSheetIndex && (
                      <span className="sheet-loading-dot" title="This sheet will load when selected">•</span>
                    )}
                    <div className="sheet-tab-indicator" />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Backlog Table with separate header and data containers */}
            <BacklogTable
              data={data}
              tableHeaders={tableHeaders}
              activeWorksheet={activeWorksheet}
            activeSheetIndex={activeSheetIndex}
              isEditMode={isEditMode}
              selectedRows={selectedRows}
              onCheckboxToggle={handleCheckboxToggle}
              onSelectAll={handleSelectAll}
              editingCell={editingCell}
              editingValue={editingValue}
              onCellClick={handleCellClick}
              onValueChange={setEditingValue}
              onKeyDown={handleKeyDown}
            />
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