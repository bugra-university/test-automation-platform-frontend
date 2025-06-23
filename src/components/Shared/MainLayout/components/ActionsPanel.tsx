import React, { useState, useEffect } from 'react';
import { Project, projectsApi } from '../../../../api/projectsApi';

interface ActionsPanelProps {
  currentFileName: string;
  currentFile: File | null;
  showTable: boolean;
  isExcelEditMode: boolean;
  isSaving: boolean;
  activeProject: Project | null;
  onEditModeToggle: () => void;
  onSaveToDatabase: () => void;
  onProjectSelect: (project: Project | null) => void;
  onDeleteExcel?: (projectId: number) => void;
  onUploadNewExcel?: () => void;
  lastSaveInfo: {
    status: 'success' | 'error' | null;
    timestamp: Date | null;
    message?: string;
  };
  formatSaveTime: (timestamp: Date | null) => string;
}

export const ActionsPanel: React.FC<ActionsPanelProps> = ({
  currentFileName,
  currentFile,
  showTable,
  isExcelEditMode,
  isSaving,
  activeProject,
  onEditModeToggle,
  onSaveToDatabase,
  onProjectSelect,
  onDeleteExcel,
  onUploadNewExcel,
  lastSaveInfo,
  formatSaveTime
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
      {/* Project Selection */}
      <div className="p-3 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Select Target Project</h3>
          <div className="relative">
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              disabled={loadingProjects}
              className="w-full px-3 py-2 text-sm bg-white rounded-md shadow-sm text-left focus:outline-none disabled:bg-gray-100"
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
          
        </div>

      {/* Divider */}
      {showTable && currentFile && activeProject && (
        <div className="mt-4 border-t border-gray-200"></div>
      )}

      {/* Save Status */}
      <div className="mt-4 p-3 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Save Status</h3>
        <div className="flex flex-wrap gap-y-2 gap-x-2">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-800">
            Status: {lastSaveInfo.status === 'success' ? 'Saved' : lastSaveInfo.status === 'error' ? 'Error' : 'Not saved'}
          </div>
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-800">
            Last Save: {formatSaveTime(lastSaveInfo.timestamp)}
          </div>
        </div>
      </div>

      {/* Actions - All buttons moved to bottom */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="p-3 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Database</h3>
          <div className="flex flex-wrap gap-2">
            {/* Edit Mode Toggle */}
            <button
              onClick={onEditModeToggle}
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                isExcelEditMode
                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {isExcelEditMode ? 'Disable Edit' : 'Enable Edit'}
            </button>

            {/* Delete Excel File */}
            {activeProject && (
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete the Excel file and ALL related data for project "${activeProject.name}"?\n\nThis will permanently delete:\n• Excel file\n• All test cases\n• All backlog items\n• All test steps\n\nThis action cannot be undone!`)) {
                    onDeleteExcel?.(activeProject.id);
                  }
                }}
                className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 hover:bg-red-200"
              >
                Delete Excel
              </button>
            )}

            {/* Upload New Excel */}
            <button
              onClick={onUploadNewExcel}
              className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200"
            >
              Upload New
            </button>

            {/* Save to Database */}
            <button
              onClick={onSaveToDatabase}
              disabled={isSaving || !currentFile || !activeProject}
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                !currentFile
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : !activeProject 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : isSaving 
                      ? 'bg-green-200 text-green-700 cursor-not-allowed'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isSaving 
                ? 'Saving...' 
                : !currentFile 
                  ? 'Select File' 
                  : !activeProject 
                    ? 'Select Project' 
                    : 'Save to DB'
              }
            </button>
            </div>
          </div>
        </div>
    </div>
  );
}; 