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
      {/* Project Information */}
      {activeProject && (
        <div className="p-3 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Project</h3>
          <div className="flex flex-wrap gap-y-2 gap-x-2">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-blue-100 text-blue-800">
              Selected: {activeProject.name}
            </div>
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700">
              Owner: {activeProject.ownerUsername || 'Unknown'}
            </div>
            {activeProject.description && (
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700">
                Description: {activeProject.description}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Divider */}
      {activeProject && showTable && (
        <div className="mt-4 border-t border-gray-200"></div>
      )}

      {/* File Information */}
      {currentFileName && (
        <div className="mt-4 p-3 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3">File Information</h3>
          
          {/* File Info Badges */}
          <div className="flex flex-wrap gap-y-2 gap-x-2">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-800">
              Name: {currentFileName}
            </div>
            <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent ${
              isExcelEditMode ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              Edit Mode: {isExcelEditMode ? 'Enabled' : 'Disabled'}
            </div>
            <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent ${
              showTable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              Table View: {showTable ? 'Visible' : 'Hidden'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
