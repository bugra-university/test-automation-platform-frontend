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
    <div className="p-4">
      {/* Save Status */}
      {showTable && (
        <div className="p-3 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Save Status</h3>
          <div className="flex flex-wrap gap-y-2 gap-x-2">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-800">
              Status: {lastSaveInfo.status === 'success' ? 'Saved' : lastSaveInfo.status === 'error' ? 'Error' : 'Not saved'}
            </div>
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-800">
              Last Save: {formatSaveTime(lastSaveInfo.timestamp)}
            </div>
          </div>
        </div>
      )}

      {/* Divider */}
      {showTable && activeProject && (
        <div className="mt-4 border-t border-gray-200"></div>
      )}

      {/* Database Activity */}
      {activeProject && (
        <div className="mt-4 p-3 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Database</h3>
          {loadingActivity ? (
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-500">
              Loading database info...
            </div>
          ) : databaseActivity ? (
            <div className="flex flex-wrap gap-y-2 gap-x-2">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-800">
                Saved to Database: {databaseActivity.lastExcelParseDate ? formatDatabaseDate(databaseActivity.lastExcelParseDate) : 'Never'}
              </div>
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-800">
                Project Updated: {formatDatabaseDate(databaseActivity.projectUpdatedAt)}
              </div>
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-800">
                Last Excel Edit: Not tracked yet
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-500">
              No database info available
            </div>
          )}
        </div>
      )}
    </div>
  );
};
