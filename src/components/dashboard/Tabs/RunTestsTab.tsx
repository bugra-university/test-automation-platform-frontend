import React, { useState } from "react";
import { Upload, X, FileDown } from "lucide-react";
import { cn } from "../../../lib/utils";
import { ExcelViewer } from "../Excel/ExcelViewer";
import { StateStorage } from "../../../utils/stateStorage";
import * as XLSX from 'xlsx';

interface RunTestsTabProps {
  showTable?: boolean;
  setShowTable?: (show: boolean) => void;
  setCurrentFileName?: (fileName: string) => void;
  currentFile?: File | null;
  setCurrentFile?: (file: File | null) => void;
  isExcelEditMode?: boolean;
  setIsExcelEditMode?: (editMode: boolean) => void;
  activeTab?: string; // Add activeTab prop
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
}: RunTestsTabProps = {}) {const [dragActive, setDragActive] = useState(false);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [localShowTable, setLocalShowTable] = useState(false);
  
  // Use external state if provided, otherwise use local state
  const showTable = externalShowTable !== undefined ? externalShowTable : localShowTable;
  const setShowTable = externalSetShowTable || setLocalShowTable;
  const file = externalCurrentFile !== undefined ? externalCurrentFile : localFile;
  const setFile = setCurrentFile || setLocalFile;
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        try {
          // Upload file to backend
          const formData = new FormData();
          formData.append('file', droppedFile);
          
          const response = await fetch('http://localhost:8080/api/product-backlog/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (response.ok) {
            const uploadResult = await response.json();
            console.log('File uploaded successfully:', uploadResult);
            
            // Set the file for local display
            setFile(droppedFile);
              // Update current file name in parent component with original name for display
            if (setCurrentFileName) {
              setCurrentFileName(droppedFile.name);
            }// Save file metadata including stored filename
            if (activeTab) {
              StateStorage.saveFileMetadata(activeTab, droppedFile.name, uploadResult.storedFileName, droppedFile.size, droppedFile.type);
            }
          } else {
            console.error('File upload failed');
            // Still set file locally for immediate display
            setFile(droppedFile);
            if (setCurrentFileName) {
              setCurrentFileName(droppedFile.name);
            }
          }
        } catch (error) {
          console.error('Error uploading file:', error);
          // Still set file locally for immediate display
          setFile(droppedFile);
          if (setCurrentFileName) {
            setCurrentFileName(droppedFile.name);
          }
        }
      }
    }
  };
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      try {
        // Upload file to backend
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const response = await fetch('http://localhost:8080/api/product-backlog/upload', {
          method: 'POST',
          body: formData,
        });
          if (response.ok) {
          const uploadResult = await response.json();
          if (process.env.NODE_ENV === 'development') {
            console.log('File uploaded successfully:', uploadResult);
          }
          
          // Set the file for local display
          setFile(selectedFile);
            // Update current file name in parent component with original name for display
          if (setCurrentFileName) {
            setCurrentFileName(selectedFile.name);
          }// Save file metadata including stored filename
          if (activeTab) {
            StateStorage.saveFileMetadata(activeTab, selectedFile.name, uploadResult.storedFileName, selectedFile.size, selectedFile.type);
          }
        } else {
          console.error('File upload failed');
          // Still set file locally for immediate display
          setFile(selectedFile);
          if (setCurrentFileName) {
            setCurrentFileName(selectedFile.name);
          }
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        // Still set file locally for immediate display
        setFile(selectedFile);
        if (setCurrentFileName) {
          setCurrentFileName(selectedFile.name);
        }
      }
    }
  };const clearFile = () => {
    setFile(null);
    setShowTable(false);
    // Clear the current file name when removing the file
    if (setCurrentFileName) {
      setCurrentFileName("");
    }
  };
  
  const handleViewTable = () => {
    setShowTable(true);
    // Make sure the file name is set when viewing the table
    if (setCurrentFileName && file) {
      setCurrentFileName(file.name);
    }
  };
  
  const handleReturnToDashboard = () => {
    setShowTable(false);
    // Keep the current fileName in parent component
    // Don't clear the file name here as we're just hiding the table, not removing the file
  };
  return (
    <div className="w-full bg-white h-full flex flex-col p-8">
      {!showTable ? (
        // Upload Interface View
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

          {/* File Upload Section */}      
          <div className="max-w-2xl mx-auto w-full">        
            <div
              className={cn(
                "rounded-lg p-8 bg-slate-50/60 shadow-sm",
                dragActive ? "bg-blue-50" : ""
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                {file ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <button 
                      type="button"
                      className="w-16 h-16 aspect-square rounded-full bg-blue-50 hover:bg-blue-100 cursor-pointer flex items-center justify-center"
                      onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                      aria-label="Upload Excel file"
                      title="Upload Excel file"
                    >
                      <Upload className="h-7 w-7 text-blue-600" />
                    </button>
                    <div className="text-center">
                      <p className="text-gray-600 mb-1">
                        Drag and drop your Excel file here, or{" "}
                        <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                          browse
                          <input
                            type="file"
                            className="hidden"
                            accept=".xlsx"
                            onChange={handleFileChange}
                          />
                        </label>
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports: .xlsx (Excel) files up to 10MB
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Download Sample Excel Button */}
            <div className="mt-4 flex justify-center">          
              <a 
                href="/test-cases.xlsx"
                download="test-cases-sample.xlsx"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                aria-label="Download sample excel file"
                title="Download sample excel file"
              >
                <FileDown className="h-4 w-4 mr-1.5" />                Download Sample Excel
              </a>
            </div>
          </div>
        </>
      ) : (
        // Excel Table View - when showTable is true, only show the table
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
