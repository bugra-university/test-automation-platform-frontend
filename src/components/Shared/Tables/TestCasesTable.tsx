import React, { useState } from 'react';
import { Play, Square, BarChart3, Edit, AlertTriangle } from 'lucide-react';
import "../../../styles/dashboard/excel-viewer/excel-viewer.css";
import "../../../styles/dashboard/excel-viewer/sheet-tabs.css";

interface TestCasesTableProps {
  testCases: any[];
  onRunTestCase: (testCaseId: string) => void;
  onDownloadReport: (testCaseId?: string) => void;
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

const formatLastRun = (lastRun: string | null) => {
  if (!lastRun) return 'Never';
  const date = new Date(lastRun);
  return date.toLocaleString('tr-TR', {
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

export const TestCasesTable = ({ testCases, onRunTestCase, onDownloadReport }: TestCasesTableProps) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const renderTestCase = (testCase: any) => {
    const isExpanded = expandedItems.has(testCase.id);
    
    return (
      <React.Fragment key={testCase.id}>
        {/* Test Case Row */}
        <tr className="bg-gray-50">
          <td className="content-cell text-center">
            <div className="cell-content">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-sm font-medium text-gray-800">{testCase.id}</span>
              </div>
            </div>
          </td>
          <td className="content-cell">
            <div className="cell-content">
              <div className="text-sm text-gray-800">{testCase.name}</div>
              <div className="text-xs text-gray-500 mt-1">{testCase.description}</div>
            </div>
          </td>
          <td className="content-cell text-center">
            <div className="cell-content flex items-center justify-center">
              <div className="flex items-center space-x-2">
                {getStatusIcon(testCase.status)}
                <span className={`text-sm ${getStatusColor(testCase.status)}`}>
                  {getStatusText(testCase.status)}
                </span>
              </div>
            </div>
          </td>
          <td className="content-cell">
            <div className="cell-content h-full flex items-center justify-center">
              <span className="text-sm text-gray-600">
                {formatProgress(testCase.progress)}
              </span>
            </div>
          </td>
          <td className="content-cell">
            <div className="cell-content h-full flex items-center justify-center">
              <span className="text-sm text-gray-600">
                {formatLastRun(testCase.lastRun)}
              </span>
            </div>
          </td>
          <td className="content-cell">
            <div className="cell-content h-full flex items-center justify-center">
              <span className="text-sm text-gray-600">
                {formatDuration(testCase.duration)}
              </span>
            </div>
          </td>
          <td className="content-cell">
            <div className="cell-content">
              <div className="flex items-center justify-center space-x-2">
                {testCase.status === 'running' ? (
                  <button className="p-1 hover:bg-gray-100 rounded" title="Stop">
                    <Square className="h-3 w-3 text-red-600" />
                  </button>
                ) : (
                  <button 
                    onClick={() => onRunTestCase(testCase.id)}
                    className="p-1 hover:bg-gray-100 rounded" 
                    title="Run"
                  >
                    <Play className="h-3 w-3 text-green-600" />
                  </button>
                )}
                <button 
                  onClick={() => onDownloadReport(testCase.id)}
                  className="p-1 hover:bg-gray-100 rounded" 
                  title="Download Report"
                >
                  <BarChart3 className="h-3 w-3 text-blue-600" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded" title="Edit">
                  <Edit className="h-3 w-3 text-gray-600" />
                </button>
                {/* Warning icon for incomplete test cases */}
                {!testCase.hasSteps && (
                  <span className="text-yellow-500" title="Test steps not defined">
                    <AlertTriangle className="h-3 w-3" />
                  </span>
                )}
              </div>
            </div>
          </td>
        </tr>
      </React.Fragment>
    );
  };

  return (
    <div className="table-container">
      <table className="excel-table">
        <tbody className="excel-table-body">
          {testCases.map(testCase => renderTestCase(testCase))}
        </tbody>
      </table>
    </div>
  );
}; 