import React from 'react';
import { Play, Square, BarChart3, Edit, AlertTriangle, Download } from 'lucide-react';
import "../../../styles/dashboard/excel-viewer/excel-viewer.css";
import "../../../styles/dashboard/excel-viewer/sheet-tabs.css";

interface TestRunsTableProps {
  testRuns: any[];
  onDownloadReport: (testRunId: string) => void;
  onViewDetails: (testRunId: string) => void;
}

// Helper functions
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'passed': return <span className="w-2 h-2 rounded-full bg-green-500"></span>;
    case 'failed': return <span className="w-2 h-2 rounded-full bg-red-500"></span>;
    case 'running': return <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>;
    case 'blocked': return <span className="w-2 h-2 rounded-full bg-yellow-500"></span>;
    case 'pending': return <span className="w-2 h-2 rounded-full bg-gray-400"></span>;
    default: return <span className="w-2 h-2 rounded-full bg-gray-300"></span>;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'passed': return 'text-green-600';
    case 'failed': return 'text-red-600';
    case 'running': return 'text-blue-600';
    case 'blocked': return 'text-yellow-600';
    case 'pending': return 'text-gray-600';
    default: return 'text-gray-500';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'passed': return 'Passed';
    case 'failed': return 'Failed';
    case 'running': return 'Running';
    case 'blocked': return 'Blocked';
    case 'pending': return 'Pending';
    default: return 'Unknown';
  }
};

const formatProgress = (progress: any) => {
  if (!progress || typeof progress !== 'object') return '-';
  return `${progress.completed || 0}/${progress.total || 0}`;
};

const formatDate = (date: string | null) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDuration = (durationMs: number | null) => {
  if (!durationMs) return '-';
  const seconds = Math.round(durationMs / 1000);
  return `${seconds}s`;
};

export const TestRunsTable = ({ testRuns, onDownloadReport, onViewDetails }: TestRunsTableProps) => {
  const renderTestRun = (testRun: any) => {
    return (
      <tr key={testRun.id} className="bg-gray-50">
        <td className="content-cell text-center">
          <div className="cell-content">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-sm font-medium text-gray-800">{testRun.id}</span>
            </div>
          </div>
        </td>
        <td className="content-cell">
          <div className="cell-content">
            <div className="text-sm text-gray-800">{testRun.name}</div>
            <div className="text-xs text-gray-500 mt-1">{testRun.description}</div>
          </div>
        </td>
        <td className="content-cell text-center">
          <div className="cell-content flex items-center justify-center">
            <div className="flex items-center space-x-2">
              {getStatusIcon(testRun.status)}
              <span className={`text-sm ${getStatusColor(testRun.status)}`}>
                {getStatusText(testRun.status)}
              </span>
            </div>
          </div>
        </td>
        <td className="content-cell">
          <div className="cell-content h-full flex items-center justify-center">
            <span className="text-sm text-gray-600">
              {formatProgress(testRun.progress)}
            </span>
          </div>
        </td>
        <td className="content-cell">
          <div className="cell-content h-full flex items-center justify-center">
            <span className="text-sm text-gray-600">
              {formatDate(testRun.startTime)}
            </span>
          </div>
        </td>
        <td className="content-cell">
          <div className="cell-content h-full flex items-center justify-center">
            <span className="text-sm text-gray-600">
              {formatDuration(testRun.duration)}
            </span>
          </div>
        </td>
        <td className="content-cell">
          <div className="cell-content">
            <div className="flex items-center justify-center space-x-2">
              <button 
                onClick={() => onViewDetails(testRun.id)}
                className="p-1 hover:bg-gray-100 rounded" 
                title="View Details"
              >
                <BarChart3 className="h-3 w-3 text-blue-600" />
              </button>
              <button 
                onClick={() => onDownloadReport(testRun.id)}
                className="p-1 hover:bg-gray-100 rounded" 
                title="Download Report"
              >
                <Download className="h-3 w-3 text-gray-600" />
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="table-container">
      <div className="table-scroll-container">
        <table className="excel-table">
          <thead className="excel-table-header">
            <tr>
              <th className="text-center w-[120px]">
                <div className="header-content">
                  <span>ID</span>
                </div>
              </th>
              <th className="w-[600px]">
                <div className="header-content">
                  <span>TEST RUN</span>
                </div>
              </th>
              <th className="w-[120px]">
                <div className="header-content">
                  <span>STATUS</span>
                </div>
              </th>
              <th className="w-[120px]">
                <div className="header-content">
                  <span>PROGRESS</span>
                </div>
              </th>
              <th className="w-[140px]">
                <div className="header-content">
                  <span>START TIME</span>
                </div>
              </th>
              <th className="w-[120px]">
                <div className="header-content">
                  <span>DURATION</span>
                </div>
              </th>
              <th className="text-center w-[120px]">
                <div className="header-content">
                  <span>ACTIONS</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="excel-table-body">
            {testRuns.map(testRun => renderTestRun(testRun))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 