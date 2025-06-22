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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState<boolean>(false);

  // Load projects when component mounts
  useEffect(() => {
    const loadProjects = async () => {
      setLoadingProjects(true);
      try {
        const projects = await projectsApi.getProjects();
        setProjects(projects);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

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

      {/* Project Selection */}
      {showTable && currentFile && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Select Target Project</h3>
          <div className="relative">
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              disabled={loadingProjects}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              {loadingProjects ? (
                'Loading projects...'
              ) : activeProject ? (
                <span className="flex items-center">
                  <span className="font-medium">{activeProject.name}</span>
                  <span className="ml-2 text-gray-500 text-xs">#{activeProject.id}</span>
                </span>
              ) : (
                'Choose a project...'
              )}
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </button>
            
            {showProjectDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {projects.length === 0 ? (
                  <div className="px-3 py-2 text-gray-500 text-sm">No projects found</div>
                ) : (
                  projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        onProjectSelect(project);
                        setShowProjectDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                        activeProject?.id === project.id ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{project.name}</div>
                          {project.description && (
                            <div className="text-xs text-gray-500 truncate">{project.description}</div>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">#{project.id}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          
          {activeProject && (
            <div className="mt-2 p-2 bg-white rounded border">
              <div className="text-xs text-gray-600">
                <div><strong>Selected:</strong> {activeProject.name}</div>
                <div><strong>Owner:</strong> {activeProject.owner_username || 'Unknown'}</div>
                {activeProject.description && (
                  <div><strong>Description:</strong> {activeProject.description}</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* File Information */}
      {currentFileName && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">File Information</h3>
          <div className="space-y-1 text-sm text-gray-600 mb-3">
            <div>Name: {currentFileName}</div>
            <div>Edit Mode: {isExcelEditMode ? 'Enabled' : 'Disabled'}</div>
            <div>Table View: {showTable ? 'Visible' : 'Hidden'}</div>
          </div>
          
          {/* File Actions */}
          {activeProject && showTable && (
            <div className="space-y-2">
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete the Excel file and ALL related data for project "${activeProject.name}"?\n\nThis will permanently delete:\n• Excel file\n• All test cases\n• All backlog items\n• All test steps\n\nThis action cannot be undone!`)) {
                    onDeleteExcel?.(activeProject.id);
                  }
                }}
                className="w-full px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md flex items-center justify-center"
              >
                🗑️ Delete Excel File
              </button>
              
              <button
                onClick={onUploadNewExcel}
                className="w-full px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md flex items-center justify-center"
              >
                📁 Upload New Excel
              </button>
            </div>
          )}
        </div>
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

      {/* Edit Mode Toggle */}
      {showTable && (
        <div className="mt-4">
          <button
            onClick={onEditModeToggle}
            className={`w-full px-3 py-2 text-sm font-medium rounded-md ${
              isExcelEditMode
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {isExcelEditMode ? 'Disable Edit Mode' : 'Enable Edit Mode'}
          </button>
        </div>
      )}

      {/* Save to DB Button */}
      {showTable && currentFile && (
        <div className="mt-4">
          <button
            onClick={onSaveToDatabase}
            disabled={isSaving || !currentFile || !activeProject}
            className={`w-full px-3 py-2 text-sm font-medium rounded-md flex items-center justify-center ${
              !activeProject 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : isSaving 
                  ? 'bg-green-400 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : !activeProject ? (
              'Select Project First'
            ) : (
              'Save to Database'
            )}
          </button>
        </div>
      )}
    </div>
  );
};
