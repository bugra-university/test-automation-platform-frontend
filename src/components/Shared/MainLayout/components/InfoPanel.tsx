import React, { useState } from 'react';
import { FileTrackingInfo } from '../../../../services/FileTrackingService';
import ProductBacklogService from '../../../../api/ProductBacklogService';
import { Trash2 } from 'lucide-react';

interface InfoPanelProps {
  currentFileName: string;
  showTable: boolean;
  lastSaveInfo: {
    status: 'success' | 'error' | null;
    timestamp: Date | null;
    message?: string;
  };
  fileTrackingInfo: FileTrackingInfo | null;
  isExcelEditMode: boolean;
  isFileInDatabase: boolean;
  tableStats: any;
  loadingStats: boolean;  onEditModeToggle: () => void;
  formatSaveTime: (timestamp: Date | null) => string;  onDatabaseRefresh?: () => void;
}

interface PhysicalFile {
  fileName: string;
  size: number;
  lastModified: string;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  currentFileName,
  showTable,
  lastSaveInfo,
  fileTrackingInfo,
  isExcelEditMode,
  isFileInDatabase,
  tableStats,
  loadingStats,  onEditModeToggle,
  formatSaveTime,  onDatabaseRefresh
}) => {
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());
  const [physicalFiles, setPhysicalFiles] = useState<PhysicalFile[]>([]);
  const [loadingPhysicalFiles, setLoadingPhysicalFiles] = useState(false);
  const loadPhysicalFiles = async () => {
    try {
      setLoadingPhysicalFiles(true);
      const response = await ProductBacklogService.getPhysicalFiles();
      setPhysicalFiles(response.files || []);
    } catch (error) {
      console.error('Error loading physical files:', error);
      setPhysicalFiles([]);
    } finally {
      setLoadingPhysicalFiles(false);
    }
  };

  // Load physical files on component mount
  React.useEffect(() => {
    loadPhysicalFiles();
  }, []);

  const handleDeleteFile = async (fileName: string) => {
    try {
      setDeletingFiles(prev => new Set(prev).add(fileName));
      
      await ProductBacklogService.deletePhysicalFile(fileName);
        // Trigger refresh of database statistics and physical files
      if (onDatabaseRefresh) {
        onDatabaseRefresh();
      }
      await loadPhysicalFiles();
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('excelSaveSuccess'));
      
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    } finally {
      setDeletingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileName);
        return newSet;
      });
    }
  };

  const handleSaveClick = () => {
    if (isFileInDatabase ? fileTrackingInfo?.hasChanges : true) {
      console.log("Save/Update button clicked from Information panel!");
      window.dispatchEvent(new CustomEvent('triggerExcelSave'));
    }
  };  return (
    <div className="p-4">
      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e0;
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #a0aec0;
          }
          .custom-scrollbar::-webkit-scrollbar-button {
            display: none;
          }
        `
      }} />
      <div className="flex flex-wrap gap-y-2 gap-x-2">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-800">
          Total Tests: 7
        </div>
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-green-50 text-green-600">
          Passed: 5
        </div>
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-red-50 text-red-600">
          Failed: 1
        </div>
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-amber-50 text-amber-600">
          Skipped: 1
        </div>
        <div className="w-full"></div>
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-blue-50 text-blue-600">
          Pending: 1
        </div>
      </div>

      {/* Database sync status - always visible with file info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        {/* Excel file name - show above database sync with same style as badges */}
        {currentFileName && showTable && (
          <div className="text-xs font-semibold text-gray-600 mb-2">
            {currentFileName}
          </div>
        )}
        
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-gray-100">
          <span className="mr-1">
            {lastSaveInfo.status === 'success' ? '✅' : lastSaveInfo.status === 'error' ? '⚠️' : '🔄'}
          </span>
          <span className={
            lastSaveInfo.status === 'success' 
              ? 'text-green-600' 
              : lastSaveInfo.status === 'error'
              ? 'text-amber-600'
              : 'text-gray-600'
          }>
            Database sync: {lastSaveInfo.status && lastSaveInfo.timestamp 
              ? formatSaveTime(lastSaveInfo.timestamp)
              : 'Not synced'}
          </span>
        </div>

        {/* Show file tracking details if available */}
        {fileTrackingInfo && fileTrackingInfo.hasChanges && 
         fileTrackingInfo.changesSinceSync.length > 0 && 
         !fileTrackingInfo.changesSinceSync.some(change => change.includes('Unable to verify')) && (
          <div className="mt-2">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-amber-50 text-amber-700">
              <span className="mr-1">⚠️</span>
              Changes detected
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {fileTrackingInfo.changesSinceSync.map((change, index) => (
                <div key={index}>• {change}</div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Edit Mode and Save button */}
      {showTable && currentFileName && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-2">
            {/* Edit Mode status and Save button */}
            <div className="flex items-center gap-2">
              <button
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 cursor-pointer hover:shadow-sm ${
                  isExcelEditMode 
                    ? 'border-transparent bg-blue-50 text-blue-600 hover:bg-blue-100' 
                    : 'border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={onEditModeToggle}
                title={`Click to ${isExcelEditMode ? 'disable' : 'enable'} edit mode`}
              >
                Edit Mode: {isExcelEditMode ? 'ON' : 'OFF'}
              </button>
                
              {/* Save button - badge style like others */}
              <button
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 ${
                  (isFileInDatabase ? fileTrackingInfo?.hasChanges : true)
                    ? 'border-transparent bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer hover:shadow-sm' 
                    : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                onClick={handleSaveClick}
                disabled={isFileInDatabase ? !fileTrackingInfo?.hasChanges : false}
                title={
                  isFileInDatabase 
                    ? (fileTrackingInfo?.hasChanges ? "Update changes in database" : "No changes to update")
                    : "Save file to database"
                }
              >
                {isFileInDatabase ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}       
      {/* Database Tables Section - Always show */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs font-semibold text-gray-600 mb-2">
          Database Files {tableStats ? `(${tableStats.totalUniqueFiles || 0} files)` : ''}
        </div>
        
        {loadingStats ? (
          <div className="text-xs text-gray-500">Loading database files...</div>        ) : tableStats && tableStats.fileDetails && tableStats.fileDetails.length > 0 ? (
          <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
            {tableStats.fileDetails.map((file: any, index: number) => (
              <div key={index} className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-medium text-gray-700">{file.fileName}</div>
                    <div className="flex justify-between items-center">
                      <span>{file.testCaseCount} test cases</span>
                      {file.lastUpdated && (
                        <span>{formatSaveTime(new Date(file.lastUpdated))}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteFile(file.fileName)}
                    disabled={deletingFiles.has(file.fileName)}
                    className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={`Delete ${file.fileName}`}
                  >
                    {deletingFiles.has(file.fileName) ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-500">No Excel files in database</div>
        )}
      </div>

      {/* Physical Files Section - Always show */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs font-semibold text-gray-600 mb-2">
          Server Files ({physicalFiles.length} files)
        </div>
        
        {loadingPhysicalFiles ? (
          <div className="text-xs text-gray-500">Loading server files...</div>        ) : physicalFiles.length > 0 ? (
          <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
            {physicalFiles.map((file: PhysicalFile, index: number) => (
              <div key={index} className="text-xs text-gray-500 bg-blue-50 rounded px-2 py-1">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-medium text-blue-700">{file.fileName}</div>
                    <div className="flex justify-between items-center">
                      <span>{(file.size / 1024).toFixed(1)} KB</span>
                      <span>{formatSaveTime(new Date(file.lastModified))}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteFile(file.fileName)}
                    disabled={deletingFiles.has(file.fileName)}
                    className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={`Delete ${file.fileName} from server`}
                  >
                    {deletingFiles.has(file.fileName) ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-500">No Excel files on server</div>
        )}
      </div>
    </div>
  );
};
