import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { ArrowLeft, Edit, Eye, Upload, X, FileDown, Plus, FolderOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../ui/button';
import '../../../styles/dashboard/excel-viewer/backlog-table.css';
import '../../../styles/dashboard/excel-viewer/sheet-tabs.css';
import { useMergedCells } from '../Excel/MergedCells';
import { BacklogTable } from '../../Shared/Tables/BacklogTable';
import ProductBacklogService from '../../../api/ProductBacklogService';
import { cn } from "../../../lib/utils";

// Type aliases to replace union types
type SaveStatus = 'success' | 'error' | null;

// Types for How It Works
type Step = {
  id: number;
  title: string;
  subtitle: string;
  description: string[];
  image: string;
  imageAlt: string;
};

// How It Works steps data
const steps: Step[] = [
  {
    id: 1,
    title: "Upload Excel",
    subtitle: "Start by uploading your Excel file containing test cases and user stories. Our platform supports .xlsx files up to 10MB in size. Make sure your Excel file follows the required template structure for seamless integration.",
    description: [
      "Choose your Excel file (.xlsx)",
      "Verify file size and format",
      "Upload and process automatically"
    ],
    image: "/placeholder.svg",
    imageAlt: "Excel upload illustration"
  },
  {
    id: 2,
    title: "Connect",
    subtitle: "After uploading, your Excel data will be automatically processed and connected to our test management system. The platform ensures proper mapping of your test cases and requirements.",
    description: [
      "Automatic data processing",
      "Test case mapping",
      "Requirements linking"
    ],
    image: "/placeholder.svg",
    imageAlt: "Connection process illustration"
  },
  {
    id: 3,
    title: "Manage",
    subtitle: "Once your data is processed, you can easily manage your test cases, track progress, and generate reports. Our intuitive interface makes test management efficient and straightforward.",
    description: [
      "Edit test cases",
      "Track test progress",
      "Generate detailed reports"
    ],
    image: "/placeholder.svg",
    imageAlt: "Management process illustration"
  }
];

interface BacklogTabProps {
  file: File | null;
  onReturn: () => void;
  isEditMode?: boolean;
  setIsEditMode?: (editMode: boolean) => void;
  activeTab?: string;
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
  tabTitle?: string;
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

export function BacklogTab({ 
  file: externalFile,
  onReturn,
  isEditMode = false,
  setIsEditMode,
  activeTab,
  lastSaveInfo,
  setLastSaveInfo,
  tabTitle = "Backlog"
}: BacklogTabProps) {
  const [dragActive, setDragActive] = useState(false);
  const [showTable, setShowTable] = useState(false);
  
  // How It Works states
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // File state
  const [file, setFile] = useState<File | null>(externalFile);
  
  // DEBUG: Log state values
  console.log('BacklogTab:', {
    showTable,
    fileExists: !!file,
    fileName: file?.name
  });

  // Auto-advance steps for How It Works
  useEffect(() => {
    // No auto-advance functionality
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // How It Works handlers
  const pauseAnimation = () => setIsPaused(true);
  const resumeAnimation = () => setIsPaused(false);

  const goToStep = (index: number) => {
    setActiveStep(index);
    pauseAnimation();
  };

  const goToPrevStep = () => {
    setActiveStep((prev) => (prev - 1 + steps.length) % steps.length);
    pauseAnimation();
  };

  const goToNextStep = () => {
    setActiveStep((prev) => (prev + 1) % steps.length);
    pauseAnimation();
  };

  const buttonStyle = {
    borderRadius: '50%',
    aspectRatio: '1 / 1',
    width: '40px',
    height: '40px'
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files?.[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      if (droppedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          droppedFile.name.endsWith('.xlsx')) {
        setFile(droppedFile);
      } else {
        alert('Please upload a valid Excel file (.xlsx)');
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
      } else {
        alert('Please upload a valid Excel file (.xlsx)');
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setShowTable(false);
  };
  
  const handleViewTable = () => {
    setShowTable(true);
  };
  
  const handleReturnToDashboard = () => {
    setShowTable(false);
    onReturn();
  };

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
  const [allSheetsWorksheets, setAllSheetsWorksheets] = useState<{[key: string]: XLSX.WorkSheet}>({});
  const [activeWorksheet, setActiveWorksheet] = useState<XLSX.WorkSheet | null>(null);
  const [editingCell, setEditingCell] = useState<{rowIndex: number, columnId: string} | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [modifiedData, setModifiedData] = useState<any[]>([]);
  
  const {
    getMergeInfoForCell
  } = useMergedCells(activeWorksheet, data, tableHeaders.map(h => h.label));

  // Handle checkbox toggle
  const handleCheckboxToggle = (idx: number) => {
    console.log('Toggling checkbox for row:', idx);
    setSelectedRows(prev => {
      const newState = {
        ...prev,
        [idx]: !prev[idx]
      };
      return newState;
    });
  };

  // Handle cell editing in edit mode
  const handleCellEditClick = (rowIndex: number, columnId: string, currentValue: any) => {
    if (columnId !== 'number') {
      const columnIndex = tableHeaders.findIndex(header => header.id === columnId);
      if (columnIndex > 0) {
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
    if (editingCell) {
      const { rowIndex, columnId } = editingCell;
      
      const updateDataState = (prevData: any[]) => {
        const newData = [...prevData];
        if (newData[rowIndex]) {
          newData[rowIndex] = {
            ...newData[rowIndex],
            [columnId]: editingValue
          };
        }
        return newData;
      };
      
      setData(updateDataState);
      setModifiedData(updateDataState);
      
      setEditingCell(null);
      setEditingValue('');
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
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(modifiedData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const modifiedFile = new File([excelBuffer], file?.name ?? 'modified.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    return modifiedFile;
  }, [modifiedData, file]);

  // Function to handle save changes
  const handleSaveChanges = useCallback(async () => {
    if (!file) {
      setLastSaveInfo?.({
        status: 'error',
        timestamp: new Date(),
        message: 'No file available for saving'
      });
      return;
    }

    try {
      // Create a new file with modified data
      const modifiedFile = new File([file], file.name, {
        type: file.type,
        lastModified: file.lastModified
      });

      // Save to database
      const result = await ProductBacklogService.saveToDatabase(modifiedFile);
      
      setLastSaveInfo?.({
        status: 'success',
        timestamp: new Date(),
        message: result.message ?? 'Data saved successfully'
      });

      // Reset modified data after successful save
      setModifiedData([]);
      
    } catch (error) {
      setLastSaveInfo?.({
        status: 'error',
        timestamp: new Date(),
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }, [file, setLastSaveInfo]);

  // Handle select all checkboxes
  const handleSelectAll = () => {
    if (data.length > 0 && 
        Object.keys(selectedRows).length === data.length && 
        data.every((_, idx) => selectedRows[idx])) {
      setSelectedRows({});
    } else {
      const newSelected: {[key: number]: boolean} = {};
      data.forEach((_, idx) => {
        newSelected[idx] = true;
      });
      setSelectedRows(newSelected);
    }
  };

  // State to store all sheets data
  const [allSheetsData, setAllSheetsData] = useState<{[key: string]: any[]}>({});

  // Helper functions for sheet handling
  const isValidSheetChange = (sheetIndex: number): boolean => {
    return sheetIndex !== activeSheetIndex && 
           file !== null && 
           sheetIndex < sheetNames.length;
  };

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

  const updateSheetState = (sheetIndex: number): void => {
    setActiveSheetIndex(sheetIndex);
    setSelectedRows({});
  };

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

  const handleSheetLoadError = (error: any, message: string): void => {
    console.error(message, error);
    setError(message);
    setLoading(false);
  };

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
  };

  const preloadSheetData = useCallback((workbook: XLSX.WorkBook, sheetName: string): { data: any[], worksheet: XLSX.WorkSheet } => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = processWorksheetData(worksheet);
    return { data: jsonData, worksheet };
  }, [processWorksheetData]);

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

  const handleExcelReadSuccess = useCallback((workbook: XLSX.WorkBook): void => {
    const allSheetNames = workbook.SheetNames;
    setSheetNames(allSheetNames);

    const { preloadedData, preloadedWorksheets, extractedHeaders } = preloadMultipleSheets(workbook, allSheetNames);
    setAllSheetsData(preloadedData);
    setAllSheetsWorksheets(preloadedWorksheets);
    setSheetHeaders(extractedHeaders);

    initializeFirstSheet(allSheetNames, preloadedData, preloadedWorksheets, extractedHeaders);
    setLoading(false);
  }, [preloadMultipleSheets, initializeFirstSheet]);

  // Excel file reading effect
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
      handleSaveChanges();
    };

    window.addEventListener('triggerExcelSave', handleSaveTrigger);
    return () => {
      window.removeEventListener('triggerExcelSave', handleSaveTrigger);
    };
  }, [handleSaveChanges]);

  if (!file) {
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
  }

  return (
    <div className="w-full bg-white h-full flex flex-col rounded-lg overflow-hidden">
      {!showTable ? (
        <>
          {/* Header Section */}
          <div className="flex justify-between items-center h-[72px] px-8 rounded-t-lg">
            <div className="flex items-center">
              <h1 className="text-2xl font-semibold text-gray-900">{tabTitle}</h1>
            </div>
            <div className="flex gap-3 items-center">
              {file && (
                <Button 
                  onClick={handleViewTable}
                  className="gap-2 rounded-lg w-[150px] bg-blue-600 hover:bg-blue-700"
                >
                  Back to Table
                </Button>
              )}
            </div>
          </div>

          {/* Divider after header */}
          <div className="border-t border-gray-200"></div>

          {/* How It Works Content */}
          <div className="px-32 py-8 max-w-7xl mx-auto w-full">
            <div className="text-center mb-10">
              <h1 className="text-[3.5rem] font-bold mb-4 tracking-tight">How It Works</h1>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Our simple three-step process makes it easy to get started and achieve results quickly.
              </p>
            </div>

            <div className="grid lg:grid-cols-[320px_1fr] gap-16 items-start">
              <nav className="relative flex flex-col gap-12 mx-auto lg:mx-0 max-w-xs" aria-label="Process steps">
                <div
                  className="absolute left-[32px] top-6 w-0.5 bg-gray-200"
                  style={{
                    height: "calc(100% - 24px)",
                    top: "12px",
                  }}
                  aria-hidden="true"
                />

                {steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => goToStep(index)}
                    className={`relative flex items-start text-left transition-all duration-300 group min-h-[120px]
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md p-2
                      ${activeStep === index ? "opacity-100" : "opacity-60 hover:opacity-80"}`}
                    aria-current={activeStep === index ? "step" : undefined}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`relative z-10 flex h-12 w-[12px] items-center justify-center rounded-[20px] border
                          transition-colors duration-300 flex-shrink-0
                          ${activeStep === index
                            ? "border-blue-500 bg-blue-500 text-white"
                            : "border-gray-300 bg-white group-hover:border-blue-400"}`}
                        aria-hidden="true"
                      >
                        <span className="text-[10px] font-medium">{step.id}</span>
                      </div>

                      <div className="pt-1.5 ml-4">
                        <h3
                          className={`text-lg font-semibold transition-colors duration-300
                            ${activeStep === index ? "text-gray-900" : "text-gray-500"}`}
                        >
                          {step.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-3">{step.subtitle}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>

              <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white px-10 py-8 shadow-sm min-h-[500px]">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`grid md:grid-cols-2 gap-8 transition-all duration-500 absolute inset-0 p-8 pb-20
                      ${activeStep === index
                        ? "translate-x-0 opacity-100"
                        : activeStep > index
                          ? "-translate-x-full opacity-0"
                          : "translate-x-full opacity-0"}`}
                    aria-hidden={activeStep !== index}
                    id={`step-content-${step.id}`}
                  >
                    <div className="flex flex-col justify-center">
                      <h4 className="text-2xl font-semibold mb-4 text-gray-800">{step.title}</h4>
                      <p className="text-gray-500 mb-6 leading-relaxed">{step.subtitle}</p>
                      <ul className="space-y-3">
                        {step.description.map((item, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mt-0.5 flex-shrink-0">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </span>
                            <span className="text-base text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center justify-center h-full">
                      {activeStep === 0 ? (
                        // Upload area for the first step
                        <div 
                          className={`relative flex flex-col items-center justify-center w-full h-[350px] border border-transparent rounded-xl p-6 transition-colors bg-gray-50
                            ${dragActive ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-200'}`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          <input
                            type="file"
                            accept=".xlsx"
                            className="hidden"
                            onChange={handleFileChange}
                            id="file-upload"
                          />
                          
                          <div className="w-24 h-24 mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                            <Upload className="w-12 h-12 text-blue-600" />
                          </div>
                          
                          <p className="mb-2 text-lg font-semibold text-gray-700">
                            {file ? file.name : "Drag & drop your Excel file here"}
                          </p>
                          {!file && (
                            <>
                              <p className="mb-4 text-sm text-gray-500">
                                or
                              </p>
                              <label
                                htmlFor="file-upload"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                Choose File
                              </label>
                            </>
                          )}
                          
                          {file && (
                            <button
                              onClick={clearFile}
                              className="mt-4 px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-full cursor-pointer hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Remove File
                            </button>
                          )}
                        </div>
                      ) : (
                        // Regular image for other steps
                        <img
                          src={step.image}
                          alt={step.imageAlt}
                          className="rounded-lg object-cover h-[80%] w-auto"
                        />
                      )}
                    </div>
                  </div>
                ))}

                <div className="absolute bottom-8 right-8 flex gap-2">
                  <button
                    onClick={goToPrevStep}
                    className="!rounded-[9999px] p-2 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center [aspect-ratio:1/1]"
                    style={buttonStyle}
                    aria-label="Previous step"
                  >
                    <ChevronUp className="h-5 w-5" />
                  </button>
                  <button
                    onClick={goToNextStep}
                    className="!rounded-[9999px] p-2 bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center justify-center [aspect-ratio:1/1]"
                    style={buttonStyle}
                    aria-label="Next step"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-6 lg:hidden">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToStep(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors
                    ${activeStep === index ? "bg-blue-500" : "bg-gray-300 hover:bg-blue-300"}`}
                  aria-label={`Go to step ${index + 1}`}
                  aria-current={activeStep === index ? "step" : undefined}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="excel-viewer">
          {/* Excel viewer content */}
          <div className="flex items-center justify-between p-4 border-b">
            <Button onClick={handleReturnToDashboard} variant="outline" className="gap-2">
              <X className="h-4 w-4" /> Close
            </Button>
            <div className="flex items-center gap-2">
              {isEditMode ? (
                <Button onClick={() => setIsEditMode && setIsEditMode(false)} variant="outline" className="gap-2">
                  <Eye className="h-4 w-4" /> View Mode
                </Button>
              ) : (
                <Button onClick={() => setIsEditMode && setIsEditMode(true)} variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" /> Edit Mode
                </Button>
              )}
            </div>
          </div>
          {/* Excel content will be rendered here */}
        </div>
      )}
    </div>
  );
}

// Helper functions
const extractHeadersFromWorksheet = (worksheet: XLSX.WorkSheet): ColumnHeader[] => {
  try {
    const range = XLSX.utils.decode_range(worksheet['!ref'] ?? 'A1');
    
    if (range.s.r > range.e.r || range.s.c > range.e.c) {
      return DEFAULT_TABLE_HEADERS;
    }

    const headers: ColumnHeader[] = [{ id: 'number', label: '#' }];
    
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
      const cell = worksheet[cellAddress];
      
      if (cell?.v !== undefined && cell.v !== null) {
        const headerText = String(cell.v).trim();
        headers.push({ id: headerText.toLowerCase().replace(/\s+/g, '_'), label: headerText });
      }
    }
    
    return headers.length > 1 ? headers : DEFAULT_TABLE_HEADERS;
  } catch (error) {
    console.error('Error extracting headers from worksheet:', error);
    return DEFAULT_TABLE_HEADERS;
  }
};

const findLastDataRow = (worksheet: XLSX.WorkSheet): number => {
  try {
    const range = worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']) : null;
    if (!range) return 0;
    
    for (let row = range.e.r; row >= range.s.r; row--) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        
        if (cell?.v !== undefined && cell.v !== null && String(cell.v).trim() !== '') {
          return row;
        }
      }
    }
    
    return range.s.r;
  } catch (error) {
    console.error('Error finding last data row:', error);
    return 0;
  }
};