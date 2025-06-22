import React, { useState, useEffect } from 'react';
import { Project, projectsApi } from '../../../../api/projectsApi';

interface InfoPanelProps {
  currentFileName: string;
  currentFile: File | null;
  showTable: boolean;
  lastSaveInfo: {
    status: 'success' | 'error' | null;
    timestamp: Date | null;
    message?: string;
  };
  isExcelEditMode: boolean;
  isSaving: boolean;
  tableStats: any;
  loadingStats: boolean;
  activeProject: Project | null;
  onEditModeToggle: () => void;
  onSaveToDatabase: () => void;
  onProjectSelect: (project: Project | null) => void;
  formatSaveTime: (timestamp: Date | null) => string;
  onDatabaseRefresh?: () => void;
  onDeleteExcel?: (projectId: number) => void;
  onUploadNewExcel?: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  currentFileName,
  currentFile,
  showTable,
  lastSaveInfo,
  isExcelEditMode,
  isSaving,
  tableStats,
  loadingStats,
  activeProject,
  onEditModeToggle,
  onSaveToDatabase,
  onProjectSelect,
  formatSaveTime,
  onDatabaseRefresh,
  onDeleteExcel,
  onUploadNewExcel
}) => {
  return (
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
          Failed: 2
        </div>
      </div>

      {/* Divider */}
      {lastSaveInfo.status && (
        <div className="mt-4 border-t border-gray-200"></div>
      )}

      {/* Last Save Information */}
      {lastSaveInfo.status && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Last Save</h3>
          <div className="space-y-1 text-sm">
            <div className={`font-medium ${
              lastSaveInfo.status === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              Status: {lastSaveInfo.status === 'success' ? 'Success' : 'Error'}
            </div>
            {lastSaveInfo.timestamp && (
              <div className="text-gray-600">
                Time: {formatSaveTime(lastSaveInfo.timestamp)}
              </div>
            )}
            {lastSaveInfo.message && (
              <div className="text-gray-600">
                {lastSaveInfo.message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Divider */}
      {tableStats && (
        <div className="mt-4 border-t border-gray-200"></div>
      )}

      {/* Database Statistics */}
      {tableStats && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">Database Statistics</h3>
            {onDatabaseRefresh && (
              <button
                onClick={onDatabaseRefresh}
                disabled={loadingStats}
                className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                {loadingStats ? 'Refreshing...' : 'Refresh'}
              </button>
            )}
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Total Records: {tableStats.totalCount || 0}</div>
            <div>Last Updated: {tableStats.lastUpdated || 'Never'}</div>
          </div>
        </div>
      )}
    </div>
  );
};
