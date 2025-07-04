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
  switch (status.toLowerCase()) {
    case 'passed': return 'Passed';
    case 'failed': return 'Failed';
    case 'running': return 'Running';
    case 'blocked': return 'Blocked';
    case 'not_finished': return 'Not Finished';
    case 'not_run': return 'Pending';
    case 'pending': return 'Pending';
    default: return 'Pending';
  }
};

const getStatusClass = (status: string) => {
  if (status.toLowerCase() === 'not_run') return 'pending';
  return status.toLowerCase();
};

const formatProgress = (progress: any, item: any, testSuites: any[]) => {
  if (!progress || typeof progress !== 'object') return '-';
  
  // For test cases, show position out of total parent cases
  if (item.id && item.id.startsWith('TC')) {
    // Extract TC number from id (e.g., "TC01" -> 1)
    const tcNumber = parseInt(item.id.replace('TC', ''));
    
    // Find parent user story to get total test cases
    const userStory = testSuites.find(us => 
      us.testCases && us.testCases.some((tc: any) => tc.id === item.id)
    );
    
    if (tcNumber && userStory?.progress?.total) {
      return `${tcNumber}/${userStory.progress.total}`;
    }
  }
  
  // For user stories, just show total
  return `${progress.total || 0}`;
};

const formatLastRun = (lastRun: string | null, item: any) => {
  // For user stories with some completed test cases but not all
  if (item.id?.startsWith('US_') && item.testCases) {
    const hasCompletedTests = item.testCases.some((tc: any) => tc.lastRun);
    const allTestsComplete = item.testCases.every((tc: any) => tc.lastRun);
    if (hasCompletedTests && !allTestsComplete) {
      return (
        <div className="test-suites-status">
          <div className="test-suites-status-badge not_finished">
            Not Finished
          </div>
        </div>
      );
    }
  }
  
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

const formatDuration = (durationMs: number | null, item: any) => {
  // For user stories with some completed test cases but not all
  if (item.id?.startsWith('US_') && item.testCases) {
    const hasCompletedTests = item.testCases.some((tc: any) => tc.duration);
    const allTestsComplete = item.testCases.every((tc: any) => tc.duration);
    if (hasCompletedTests && !allTestsComplete) {
      return (
        <div className="test-suites-status">
          <div className="test-suites-status-badge not_finished">
            Not Finished
          </div>
        </div>
      );
    }
  }

  if (!durationMs) return '-';
  const seconds = Math.round(durationMs / 1000);
  return `${seconds}s`;
};

const calculateStatus = (item: any) => {
  // If it's a user story, check its test cases
  if (item.testCases) {
    const hasRunTests = item.testCases.some((tc: any) => tc.status.toLowerCase() === 'passed' || tc.status.toLowerCase() === 'failed');
    if (!hasRunTests) return 'pending';

    const allTestsComplete = item.testCases.every((tc: any) => tc.status.toLowerCase() === 'passed' || tc.status.toLowerCase() === 'failed');
    if (!allTestsComplete) return 'not_finished';

    const allTestsPassed = item.testCases.every((tc: any) => tc.status.toLowerCase() === 'passed');
    return allTestsPassed ? 'passed' : 'failed';
  }

  // For test cases and steps, convert not_run to pending
  return item.status.toLowerCase() === 'not_run' ? 'pending' : item.status.toLowerCase();
};

const StatusCell = ({ item }: { item: any }) => {
  const status = calculateStatus(item);
  return (
    <div className="test-suites-status">
      <div className={`test-suites-status-badge ${status}`}>
        {getStatusText(status)}
      </div>
    </div>
  );
};

// Helper function to determine test case status based on steps
const calculateTestCaseStatus = (steps: any[]) => {
  if (!steps || steps.length === 0) return 'pending';
  
  const hasRunSteps = steps.some(step => step.status !== 'unknown');
  if (!hasRunSteps) return 'pending';
  
  const allStepsComplete = steps.every(step => step.status === 'passed' || step.status === 'failed');
  if (!allStepsComplete) return 'not_finished';
  
  const allStepsPassed = steps.every(step => step.status === 'passed');
  return allStepsPassed ? 'passed' : 'failed';
};

// Helper function to determine user story status based on test cases
const calculateUserStoryStatus = (testCases: any[]) => {
  if (!testCases || testCases.length === 0) return 'pending';
  
  const hasRunTests = testCases.some(tc => tc.status !== 'pending');
  if (!hasRunTests) return 'pending';
  
  const allTestsComplete = testCases.every(tc => tc.status === 'passed' || tc.status === 'failed');
  if (!allTestsComplete) return 'not_finished';
  
  const allTestsPassed = testCases.every(tc => tc.status === 'passed');
  return allTestsPassed ? 'passed' : 'failed';
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
            <StatusCell item={userStory} />
          </td>
          <td className="test-suites-cell center">
            <span className="test-suites-progress">{formatProgress(userStory.progress, userStory, testSuites)}</span>
          </td>
          <td className="test-suites-cell center">
            <span className="test-suites-last-run">{formatLastRun(userStory.lastRun, userStory)}</span>
          </td>
          <td className="test-suites-cell center">
            <span className="test-suites-duration">{formatDuration(userStory.duration, userStory)}</span>
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
          <StatusCell item={step} />
        </td>
        <td className="test-suites-cell center">
          <span className="test-suites-progress">{formatProgress(step.progress, step, testSuites)}</span>
        </td>
        <td className="test-suites-cell center">
          <span className="test-suites-last-run">{formatLastRun(step.lastRun, step)}</span>
        </td>
        <td className="test-suites-cell center">
          <span className="test-suites-duration">{formatDuration(step.duration, step)}</span>
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
        <tr className="test-suites-row test-case" data-status={testCase.status.toLowerCase()}>
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
            <StatusCell item={testCase} />
          </td>
          <td className="test-suites-cell center">
            <span className="test-suites-progress">{formatProgress(testCase.progress, testCase, testSuites)}</span>
          </td>
          <td className="test-suites-cell center">
            <span className="test-suites-last-run">{formatLastRun(testCase.lastRun, testCase)}</span>
          </td>
          <td className="test-suites-cell center">
            <span className="test-suites-duration">{formatDuration(testCase.duration, testCase)}</span>
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
              <th className="test-suites-cell center">TOTAL CASES</th>
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