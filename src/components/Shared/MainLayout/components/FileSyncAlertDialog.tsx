import React from 'react';
import { FileTrackingInfo } from '../../../../services/FileTrackingService';

interface FileSyncAlertDialogProps {
  show: boolean;
  fileTrackingInfo: FileTrackingInfo | null;
  onClose: () => void;
  onSync: () => void;
  formatSaveTime: (timestamp: Date | null) => string;
}

export const FileSyncAlertDialog: React.FC<FileSyncAlertDialogProps> = ({
  show,
  fileTrackingInfo,
  onClose,
  onSync,
  formatSaveTime
}) => {
  if (!show || !fileTrackingInfo) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-amber-600 text-lg">⚠️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">File Changes Detected</h3>
            <p className="text-sm text-gray-500">{fileTrackingInfo.fileName}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-700 mb-2">
            This file contains changes since the last database sync 
            {fileTrackingInfo.lastSyncDate && (
              <span className="font-medium">
                {' '}on {formatSaveTime(fileTrackingInfo.lastSyncDate)}
              </span>
            )}.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <p className="text-sm font-medium text-amber-800 mb-1">Changes detected:</p>
            <ul className="text-sm text-amber-700 space-y-1">
              {fileTrackingInfo.changesSinceSync.map((change, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Continue Anyway
          </button>
          <button
            onClick={() => {
              onClose();
              onSync();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Sync to Database
          </button>
        </div>
      </div>
    </div>
  );
};
