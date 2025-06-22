import React, { useState } from "react";
import { Upload, X, FileDown } from "lucide-react";
import { cn } from "../../../lib/utils";
import { ExcelViewer } from "../Excel/ExcelViewer";
import "../../../styles/dashboard/tabs/run-tests.css";

interface RunTestsTabProps {
  showTable?: boolean;
  setShowTable?: (show: boolean) => void;
  setCurrentFileName?: (fileName: string) => void;
  currentFile?: File | null;
  setCurrentFile?: (file: File | null) => void;
  isExcelEditMode?: boolean;
  setIsExcelEditMode?: (editMode: boolean) => void;
  activeTab?: string;
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

export function RunTestsTab({ 
  showTable: externalShowTable, 
  setShowTable: externalSetShowTable,
  setCurrentFileName,
  currentFile: externalCurrentFile,
  setCurrentFile,
  isExcelEditMode,
  setIsExcelEditMode,
  activeTab,
  lastSaveInfo,
  setLastSaveInfo
}: RunTestsTabProps = {}) {
  const [dragActive, setDragActive] = useState(false);
  
  // FORCE external state usage - no local state fallback
  const showTable = externalShowTable || false;
  const setShowTable = externalSetShowTable || (() => {});
  const file = externalCurrentFile || null;
  const setFile = setCurrentFile || (() => {});
  
  // DEBUG: Log state values
  console.log('RunTestsTab:', {
    showTable,
    fileExists: !!file,
    fileName: file?.name
  });

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
        
        if (setCurrentFileName) {
          setCurrentFileName(droppedFile.name);
        }
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
        
        if (setCurrentFileName) {
          setCurrentFileName(selectedFile.name);
        }
      } else {
        alert('Please upload a valid Excel file (.xlsx)');
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setShowTable(false);
    if (setCurrentFileName) {
      setCurrentFileName('');
    }
  };
  
  const handleViewTable = () => {
    setShowTable(true);
    if (setCurrentFileName && file) {
      setCurrentFileName(file.name);
    }
  };
  
  const handleReturnToDashboard = () => {
    setShowTable(false);
  };

  return (
    <div className="w-full bg-white h-full flex flex-col p-8">
      {!showTable ? (
        <>
          {/* Platform Title and Description */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold italic text-blue-600 mb-6">
              Test Platform
            </h1>
            <div className="max-w-3xl mx-auto space-y-4 text-gray-600">
              <p>
                1. Download and upload your Excel file containing test cases and scenarios.
              </p>
              <p>
                2. After uploading, you will see your test cases displayed in a table format.
              </p>
              <p>
                3. Find the relevant test case and click the Run button to execute the specific test.
              </p>
            </div>
          </div>

          {/* File Upload Section */}          <div className="max-w-2xl mx-auto w-full">
            <section
              className={cn(
                "rounded-lg p-8 bg-slate-50/60 shadow-sm",
                dragActive ? "bg-blue-50" : ""
              )}
              aria-label="File upload area - drag and drop Excel files here"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                {file ? (
                  <div className="flex flex-col items-center w-full max-w-md">
                    <div className="flex items-center justify-between w-full bg-white p-4 rounded-lg mb-3">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                          <Upload className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{file.name}</span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={clearFile}
                        className="p-1 hover:bg-gray-100 rounded-full"
                        aria-label="Remove file"
                        title="Remove file"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                    <div className="flex justify-center">
                      <button 
                        type="button"
                        className="px-3 py-1.5 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center"
                        onClick={handleViewTable}
                        aria-label="View Excel table"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1.5">
                          <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                          <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"></path>
                          <path d="M8 10h8"></path>
                          <path d="M8 14h8"></path>
                          <path d="M8 18h8"></path>
                        </svg>
                        View Table
                      </button>
                    </div>
                  </div>
                ) : (                  <div className="flex flex-col items-center space-y-4">                    <button 
                      type="button"                      className="upload-button-round aspect-square bg-blue-50 hover:bg-blue-100 cursor-pointer flex items-center justify-center transition-colors"
                      onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                      aria-label="Upload Excel file"
                      title="Upload Excel file">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </button>
                    <div className="text-center"><p className="text-gray-600 mb-1">
                        Drag and drop your Excel file here, or{" "}                        <label className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 cursor-pointer transition-colors">
                          browse<input type="file" className="hidden" accept=".xlsx" onChange={handleFileChange} />
                        </label>
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports: .xlsx (Excel) files up to 10MB
                      </p>
                    </div>
                  </div>                )}
              </div>
            </section>
            
            {/* Download Sample Excel Button */}
            <div className="mt-4 flex justify-center">          
              <a 
                href="/test-cases.xlsx"
                download="test-cases-sample.xlsx"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                aria-label="Download sample excel file"
                title="Download sample excel file"
              >
                <FileDown className="h-4 w-4 mr-1.5" />
                Download Sample Excel
              </a>
            </div>
          </div>
        </>
      ) : (
        <ExcelViewer 
          file={file} 
          onReturn={handleReturnToDashboard}
          isEditMode={isExcelEditMode}
          setIsEditMode={setIsExcelEditMode}
          activeTab={activeTab}
          lastSaveInfo={lastSaveInfo}
          setLastSaveInfo={setLastSaveInfo}
        />
      )}
    </div>
  );
}
