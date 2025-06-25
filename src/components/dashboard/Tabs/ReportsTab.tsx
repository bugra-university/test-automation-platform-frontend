import React, { useState, useEffect } from 'react';
import { Eye, Download, Trash2, FileText, Calendar, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { reportsApi, ReportData } from '../../../api/reportsApi';

interface ReportsTabProps {
  selectedProjectId: number | null;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pass': return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'fail': return <XCircle className="h-4 w-4 text-red-600" />;
    default: return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pass': return 'text-green-600 bg-green-50';
    case 'fail': return 'text-red-600 bg-red-50';
    default: return 'text-yellow-600 bg-yellow-50';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pass': return 'Passed';
    case 'fail': return 'Failed';
    default: return 'Unknown';
  }
};

interface ReportViewerModalProps {
  reportId: string | null;
  projectId: number;
  onClose: () => void;
}

const ReportViewerModal: React.FC<ReportViewerModalProps> = ({ reportId, projectId, onClose }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReportContent = async () => {
      if (!reportId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const content = await reportsApi.getReportContent(projectId, reportId);
        setHtmlContent(content);
      } catch (err) {
        setError('Failed to load report content');
        console.error('Error loading report:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadReportContent();
  }, [reportId, projectId]);

  if (!reportId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Report Viewer</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => reportsApi.downloadReport(projectId, reportId)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
              title="Download Report"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading report...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          ) : (
            <iframe
              srcDoc={htmlContent}
              className="w-full h-full border-0"
              title="Test Report"
              sandbox="allow-scripts allow-same-origin"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const ReportsTab: React.FC<ReportsTabProps> = ({ selectedProjectId }) => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const loadReports = async (projectId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const reportsResponse = await reportsApi.getReports(projectId);
      setReports(reportsResponse.reports);
    } catch (err) {
      setError('Failed to load reports');
      console.error('Error loading reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      loadReports(selectedProjectId);
    } else {
      setReports([]);
      setError(null);
    }
  }, [selectedProjectId]);

  const handleDeleteReport = async (reportId: string) => {
    if (!selectedProjectId) return;
    
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }
    
    try {
      await reportsApi.deleteReport(selectedProjectId, reportId);
      await loadReports(selectedProjectId); // Refresh the list
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Failed to delete report');
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    if (!selectedProjectId) return;
    
    try {
      await reportsApi.downloadReport(selectedProjectId, reportId);
    } catch (err) {
      console.error('Error downloading report:', err);
      alert('Failed to download report');
    }
  };

  // Use all reports since we removed filtering
  const filteredReports = reports;

  // Show empty state if no project selected
  if (!selectedProjectId) {
    return (
      <div className="w-full bg-white h-full flex flex-col p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Test Reports</h2>
          <p className="text-gray-600 text-sm">
            View and manage your test execution reports. HTML reports are generated automatically when tests are executed.
          </p>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Project Selected</h3>
            <p className="text-gray-600 text-sm max-w-sm">
              Please select a project from the Projects tab to view test reports.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white h-full flex flex-col p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Test Reports</h2>
        <p className="text-gray-600 text-sm">
          View and manage test execution reports for project: <span className="font-medium text-blue-600">{selectedProjectId}</span>
        </p>
      </div>



      {/* Content */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Reports</h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button 
              onClick={() => selectedProjectId && loadReports(selectedProjectId)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
            <p className="text-gray-600 text-sm max-w-sm">
              Run some tests to generate reports that will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <div key={report.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                {/* Card Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm mb-1">{report.displayName}</h3>
                      <p className="text-xs text-gray-600">{report.userStory}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(report.status)}
                        <span>{getStatusText(report.status)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(report.createdDate).toLocaleString()}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {report.duration}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600">✓ {report.passCount} Passed</span>
                      <span className="text-red-600">✗ {report.failCount} Failed</span>
                      <span className="text-gray-500">{report.fileSize}</span>
                    </div>
                  </div>

                  {/* Test Cases Preview */}
                  {report.testCases.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Test Cases:</p>
                      <div className="flex flex-wrap gap-1">
                        {report.testCases.slice(0, 3).map((testCase, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {testCase.length > 20 ? `${testCase.substring(0, 20)}...` : testCase}
                          </span>
                        ))}
                        {report.testCases.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                            +{report.testCases.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedReportId(report.id)}
                      className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDownloadReport(report.id)}
                        className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Viewer Modal */}
      {selectedReportId && selectedProjectId && (
        <ReportViewerModal
          reportId={selectedReportId}
          projectId={selectedProjectId}
          onClose={() => setSelectedReportId(null)}
        />
      )}
    </div>
  );
};

export {};
