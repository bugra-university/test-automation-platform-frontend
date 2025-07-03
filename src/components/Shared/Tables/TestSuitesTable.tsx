import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Square, Play, BarChart3, Edit, AlertTriangle } from 'lucide-react';
import { TestSuite } from '../../../api/testSuitesApi';
import "../../../styles/dashboard/excel-viewer/excel-viewer.css";
import "../../../styles/dashboard/excel-viewer/sheet-tabs.css";
import "../../../styles/dashboard/excel-viewer/backlog-table.css";
import "../../../styles/dashboard/excel-viewer/test-suites.css";

interface TestSuitesTableProps {
  testSuites: TestSuite[];
  onRunTestSuite: (userStoryId: string) => void;
  onRunTestCase: (testCaseId: string) => void;
  onDownloadReport: (userStoryId?: string) => void;
}

// Helper functions
const getStatusIcon = (status: string) => {
  return <span className={`test-suites-status-icon ${status}`}></span>;
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

export const TestSuitesTable = ({ testSuites, onRunTestSuite, onRunTestCase, onDownloadReport }: TestSuitesTableProps) => {
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

  const renderUserStory = (userStory: any) => {
    const isExpanded = expandedItems.has(userStory.id);
    
    return (
      <React.Fragment key={userStory.id}>
        {/* User Story Row */}
        <tr className="test-suites-row">
          <td className="test-suites-cell center">
            <div className="test-suites-cell-content center">
              <button
                onClick={() => toggleExpanded(userStory.id)}
                className="test-suites-expand-button"
              >
                {isExpanded ? (
                  <ChevronDown className="test-suites-action-icon" />
                ) : (
                  <ChevronRight className="test-suites-action-icon" />
                )}
              </button>
              <span className="test-suites-id">{userStory.id}</span>
            </div>
          </td>
          <td className="test-suites-cell">
            <div className="test-suites-cell-content">
              <div className="test-suites-name">{userStory.name}</div>
            </div>
          </td>
          <td className="test-suites-cell center">
            <div className="test-suites-status">
              {getStatusIcon(userStory.status)}
              <span className={`test-suites-status-text ${userStory.status}`}>
                {getStatusText(userStory.status)}
              </span>
            </div>
          </td>
          <td className="test-suites-cell center">
            <span className="test-suites-progress">{formatProgress(userStory.progress)}</span>
          </td>
          <td className="test-suites-cell center">
            <span className="test-suites-last-run">{formatLastRun(userStory.lastRun)}</span>
          </td>
          <td className="test-suites-cell center">
            <span className="test-suites-duration">{formatDuration(userStory.duration)}</span>
          </td>
          <td className="test-suites-cell center">
            <div className="test-suites-actions">
              {userStory.status === 'running' ? (
                <button className="test-suites-action-button" title="Stop">
                  <Square className="test-suites-action-icon stop" />
                </button>
              ) : (
                <button 
                  onClick={() => onRunTestSuite(userStory.id)}
                  className="test-suites-action-button" 
                  title="Run"
                >
                  <Play className="test-suites-action-icon run" />
                </button>
              )}
              <button 
                onClick={() => onDownloadReport(userStory.id)}
                className="test-suites-action-button" 
                title="Download Report"
              >
                <BarChart3 className="test-suites-action-icon report" />
              </button>
              <button className="test-suites-action-button" title="Edit">
                <Edit className="test-suites-action-icon edit" />
              </button>
            </div>
          </td>
        </tr>

        {/* Test Cases (when expanded) */}
        {isExpanded && userStory.testCases.map((testCase: any) => renderTestCase(testCase, userStory.id))}
      </React.Fragment>
    );
  };

  const renderTestStep = (step: any) => {
    return (
      <tr key={step.id} className="test-suites-row test-step">
        <td className="test-suites-cell center">
          <div className="test-suites-cell-content center">
            <span className="test-suites-id">Step {step.stepNumber}</span>
          </div>
        </td>
        <td className="test-suites-cell">
          <div className="test-suites-cell-content">
            <div className="test-suites-name">{step.description}</div>
          </div>
        </td>
        <td className="test-suites-cell center">
          <div className="test-suites-status">
            {getStatusIcon(step.status)}
            <span className={`test-suites-status-text ${step.status}`}>
              {getStatusText(step.status)}
            </span>
          </div>
        </td>
        <td className="test-suites-cell center">
          <span className="test-suites-progress">{formatProgress(step.progress)}</span>
        </td>
        <td className="test-suites-cell center">
          <span className="test-suites-last-run">{formatLastRun(step.lastRun)}</span>
        </td>
        <td className="test-suites-cell center">
          <span className="test-suites-duration">{formatDuration(step.duration)}</span>
        </td>
        <td className="test-suites-cell center">
          <div className="test-suites-actions">
            {/* Steps don't have actions */}
          </div>
        </td>
      </tr>
    );
  };

  const renderTestCase = (testCase: any, parentId: string) => {
    const testCaseId = `${parentId}-${testCase.id}`;
    const isExpanded = expandedItems.has(testCaseId);
    
    return (
      <React.Fragment key={testCaseId}>
        {/* Test Case Row */}
        <tr className="test-suites-row test-case">
          <td className="test-suites-cell center">
            <div className="test-suites-cell-content center">
              {testCase.steps && testCase.steps.length > 0 && (
                <button
                  onClick={() => toggleExpanded(testCaseId)}
                  className="test-suites-expand-button"
                >
                  {isExpanded ? (
                    <ChevronDown className="test-suites-action-icon" />
                  ) : (
                    <ChevronRight className="test-suites-action-icon" />
                  )}
                </button>
              )}
              <span className="test-suites-id">{testCase.id}</span>
            </div>
          </td>
          <td className="test-suites-cell">
            <div className="test-suites-cell-content">
              <div className="test-suites-name">{testCase.name}</div>
            </div>
          </td>
          <td className="test-suites-cell center">
            <div className="test-suites-status">
              {getStatusIcon(testCase.status)}
              <span className={`test-suites-status-text ${testCase.status}`}>
                {getStatusText(testCase.status)}
              </span>
            </div>
          </td>
          <td className="test-suites-cell center">
            <span className="test-suites-progress">{formatProgress(testCase.progress)}</span>
          </td>
          <td className="test-suites-cell center">
            <span className="test-suites-last-run">{formatLastRun(testCase.lastRun)}</span>
          </td>
          <td className="test-suites-cell center">
            <span className="test-suites-duration">{formatDuration(testCase.duration)}</span>
          </td>
          <td className="test-suites-cell center">
            <div className="test-suites-actions">
              {testCase.status === 'running' ? (
                <button className="test-suites-action-button" title="Stop">
                  <Square className="test-suites-action-icon stop" />
                </button>
              ) : (
                <button 
                  onClick={() => onRunTestCase(testCase.id)}
                  className="test-suites-action-button"
                  title="Run"
                >
                  <Play className="test-suites-action-icon run" />
                </button>
              )}
            </div>
          </td>
        </tr>

        {/* Test Steps (when expanded) */}
        {isExpanded && testCase.steps && testCase.steps.map(renderTestStep)}
      </React.Fragment>
    );
  };

  return (
    <div className="test-suites-wrapper">
      <div className="test-suites-container">
        <table className="test-suites-table">
          <thead className="test-suites-header">
            <tr>
              <th className="test-suites-cell center">ID</th>
              <th className="test-suites-cell">NAME</th>
              <th className="test-suites-cell center">STATUS</th>
              <th className="test-suites-cell center">PROGRESS</th>
              <th className="test-suites-cell center">LAST RUN</th>
              <th className="test-suites-cell center">DURATION</th>
              <th className="test-suites-cell center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="test-suites-body">
            {testSuites.map(renderUserStory)}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 