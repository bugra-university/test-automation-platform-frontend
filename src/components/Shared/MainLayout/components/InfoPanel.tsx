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

interface DatabaseActivity {
  projectCreatedAt: string;
  projectUpdatedAt: string;
  lastExcelParseDate: string | null;
  excelLastModified: string | null;
  hasExcelFile: boolean;
  error?: string;
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
  const [databaseActivity, setDatabaseActivity] = useState<DatabaseActivity | null>(null);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Fetch database activity when project changes
  useEffect(() => {
    if (activeProject) {
      fetchDatabaseActivity();
    } else {
      setDatabaseActivity(null);
    }
  }, [activeProject]);

  const fetchDatabaseActivity = async () => {
    if (!activeProject) return;
    
    setLoadingActivity(true);
    try {
      const response = await projectsApi.getProjectDatabaseActivity(activeProject.id);
      if (response.success) {
        setDatabaseActivity(response.activity);
      } else {
        console.error('Failed to fetch database activity:', response.message);
      }
    } catch (error) {
      console.error('Error fetching database activity:', error);
    } finally {
      setLoadingActivity(false);
    }
  };

  const formatDatabaseDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="p-4 space-y-4" style={{ fontFamily: 'Calibri, Arial, sans-serif' }}>
      {/* Test Statistics */}
      {showTable && tableStats && (
        <>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Total Tests: {tableStats.totalTests || 0}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-green-800">
              Passed: {tableStats.passedTests || 0}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-red-800">
              Failed: {tableStats.failedTests || 0}
            </span>
          </div>
          <div className="border-t border-gray-200"></div>
        </>
      )}

      {/* Save Information */}
      {showTable && (
        <>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900">Save Status</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Status: {lastSaveInfo.status === 'success' ? 'Saved' : lastSaveInfo.status === 'error' ? 'Error' : 'Not saved'}</div>
              <div>Last Save: {formatSaveTime(lastSaveInfo.timestamp)}</div>
              {lastSaveInfo.message && <div>Message: {lastSaveInfo.message}</div>}
            </div>
          </div>
          <div className="border-t border-gray-200"></div>
        </>
      )}

      {/* Database Activity */}
      {activeProject && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Database</h3>
          {loadingActivity ? (
            <div className="text-sm text-gray-500">Loading database info...</div>
          ) : databaseActivity ? (
            <div className="space-y-1 text-sm text-gray-600">
              <div>Saved to Database: {databaseActivity.lastExcelParseDate ? formatDatabaseDate(databaseActivity.lastExcelParseDate) : 'Never'}</div>
              <div>Project Updated: {formatDatabaseDate(databaseActivity.projectUpdatedAt)}</div>
              <div>Last Excel Edit: Not tracked yet</div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No database info available</div>
          )}
        </div>
      )}
    </div>
  );
};
