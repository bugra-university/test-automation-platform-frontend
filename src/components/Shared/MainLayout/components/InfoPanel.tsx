import React, { useState, useEffect } from 'react';
import { Project, projectsApi } from '../../../../api/projectsApi';
import { testSuitesApi } from '../../../../api/testSuitesApi';

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

interface TestSuitesStats {
  totalStories: number;
  totalTestCases: number;
  passedCount: number;
  failedCount: number;
  pendingCount: number;
  notRunCount: number;
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
  const [testSuitesStats, setTestSuitesStats] = useState<TestSuitesStats | null>(null);
  const [loadingTestStats, setLoadingTestStats] = useState(false);

  // Fetch database activity and test suites stats when project changes
  useEffect(() => {
    if (activeProject) {
      fetchDatabaseActivity();
      fetchTestSuitesStats();
    } else {
      setDatabaseActivity(null);
      setTestSuitesStats(null);
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

  const fetchTestSuitesStats = async () => {
    if (!activeProject) return;
    
    setLoadingTestStats(true);
    try {
      const statistics = await testSuitesApi.getTestSuitesStatistics(activeProject.id);
      // Map API response to local interface
      setTestSuitesStats({
        totalStories: statistics.totalStories,
        totalTestCases: statistics.totalTestCases,
        passedCount: statistics.statusCounts.passed,
        failedCount: statistics.statusCounts.failed,
        pendingCount: statistics.statusCounts.pending,
        notRunCount: statistics.statusCounts.not_run
      });
    } catch (error) {
      console.error('Error fetching test suites statistics:', error);
    } finally {
      setLoadingTestStats(false);
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
      {activeProject && (
        <hr className="my-4 border-gray-200" />
      )}

      {/* File Information */}
      <div className="mt-4 p-3 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-3">File Information</h3>
        
        {/* File Info Badges */}
        <div className="flex flex-wrap gap-y-2 gap-x-2">
          {currentFileName ? (
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-800">
              Name: {currentFileName}
            </div>
          ) : (
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-600">
              No file selected
            </div>
          )}
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

      {/* Divider */}
      <hr className="my-4 border-gray-200" />

      {/* Database Activity */}
      {activeProject && (
        <div className="mt-4 p-3 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Database Activity</h3>
          
          {loadingActivity ? (
            <div className="flex items-center justify-center py-4">
              <div className="text-xs text-gray-500">Loading activity...</div>
            </div>
          ) : databaseActivity?.error ? (
            <div className="text-xs text-red-500">{databaseActivity.error}</div>
          ) : databaseActivity ? (
            <div className="flex flex-wrap gap-y-2 gap-x-2">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-blue-100 text-blue-800">
                Project Created: {formatDatabaseDate(databaseActivity.projectCreatedAt)}
              </div>
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700">
                Last Updated: {formatDatabaseDate(databaseActivity.projectUpdatedAt)}
              </div>
              {databaseActivity.hasExcelFile && (
                <>
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-800">
                    Excel Parsed: {formatDatabaseDate(databaseActivity.lastExcelParseDate)}
                  </div>
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-purple-100 text-purple-800">
                    File Modified: {formatDatabaseDate(databaseActivity.excelLastModified)}
                  </div>
                </>
              )}
              {!databaseActivity.hasExcelFile && (
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-yellow-100 text-yellow-800">
                  No Excel file uploaded
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-500">No activity data available</div>
          )}
        </div>
      )}

      {/* Divider */}
      {activeProject && (
        <hr className="my-4 border-gray-200" />
      )}

      {/* Test Suites Information */}
      {activeProject && (
        <div className="mt-4 p-3 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Test Suites</h3>
          
          {loadingTestStats ? (
            <div className="flex items-center justify-center py-4">
              <div className="text-xs text-gray-500">Loading statistics...</div>
            </div>
          ) : testSuitesStats ? (
            <div className="flex flex-wrap gap-y-2 gap-x-2">
              {/* Total Stories */}
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-blue-100 text-blue-800">
                Stories: {testSuitesStats.totalStories}
              </div>
              
              {/* Total Test Cases */}
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-purple-100 text-purple-800">
                Test Cases: {testSuitesStats.totalTestCases}
              </div>
              
              {/* Passed */}
              {testSuitesStats.passedCount > 0 && (
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-green-100 text-green-800">
                  Passed: {testSuitesStats.passedCount}
                </div>
              )}
              
              {/* Failed */}
              {testSuitesStats.failedCount > 0 && (
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-red-100 text-red-800">
                  Failed: {testSuitesStats.failedCount}
                </div>
              )}
              
              {/* Pending */}
              {testSuitesStats.pendingCount > 0 && (
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-yellow-100 text-yellow-800">
                  Pending: {testSuitesStats.pendingCount}
                </div>
              )}
              
              {/* Not Run */}
              {testSuitesStats.notRunCount > 0 && (
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-gray-100 text-gray-700">
                  Not Run: {testSuitesStats.notRunCount}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-500">No test data available</div>
          )}
        </div>
      )}
    </div>
  );
};
