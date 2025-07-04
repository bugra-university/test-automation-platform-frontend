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
    case 'no_data': return 'No Data';
    default: return 'Pending';
  }
};

const getStatusClass = (status: string) => {
  if (status.toLowerCase() === 'not_run') return 'pending';
  return status.toLowerCase();
};

const formatProgress = (progress: any, item: any, testSuites: any[]) => {
  if (!progress || typeof progress !== 'object') {
    // For test cases, show position out of total parent steps
    if (item?.id && typeof item.id === 'string' && item.id.startsWith('TC')) {
      // Extract TC number from id (e.g., "TC01" -> 1)
      const tcNumber = parseInt(item.id.replace('TC', ''));
      
      // Find parent user story to get total test cases
      const userStory = testSuites.find(us => 
        us.testCases && us.testCases.some((tc: any) => tc.id === item.id)
      );
      
      if (tcNumber && userStory?.testCases) {
        return `${tcNumber}/${userStory.testCases.length}`;
      }
    }
    return '-';
  }
  
  // For user stories, just show total
  return `${progress.total || 0}`;
};

const formatLastRun = (lastRun: string | null, item: any) => {
  // For user stories with some completed test cases but not all
  if (item?.id && typeof item.id === 'string' && item.id.startsWith('US_') && item.testCases) {
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

  // Check if it's a user story with no test cases data
  if (item?.id && typeof item.id === 'string' && item.id.startsWith('US_') && (!item.testCases || item.testCases.length === 0)) {
    return (
      <div className="test-suites-status">
        <div className="test-suites-status-badge no_data">
          No Data
        </div>
      </div>
    );
  }
  
  if (!lastRun) {
    return (
      <div className="test-suites-status">
        <div className="test-suites-status-badge pending">
          Pending
        </div>
      </div>
    );
  }

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
  if (item?.id && typeof item.id === 'string' && item.id.startsWith('US_') && item.testCases) {
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

  // Check if it's a user story with no test cases data
  if (item?.id && typeof item.id === 'string' && item.id.startsWith('US_') && (!item.testCases || item.testCases.length === 0)) {
    return (
      <div className="test-suites-status">
        <div className="test-suites-status-badge no_data">
          No Data
        </div>
      </div>
    );
  }

  if (!durationMs) {
    return (
      <div className="test-suites-status">
        <div className="test-suites-status-badge pending">
          Pending
        </div>
      </div>
    );
  }

  const seconds = Math.round(durationMs / 1000);
  return `${seconds}s`;
};

const calculateStatus = (item: any) => {
  // If it's a user story, check its test cases
  if (item?.testCases) {
    // Check if no test cases data
    if (item.testCases.length === 0) return 'no_data';
    
    const hasRunTests = item.testCases.some((tc: any) => tc.status && tc.status.toLowerCase() === 'passed' || tc.status && tc.status.toLowerCase() === 'failed');
    if (!hasRunTests) return 'pending';

    const allTestsComplete = item.testCases.every((tc: any) => tc.status && (tc.status.toLowerCase() === 'passed' || tc.status.toLowerCase() === 'failed'));
    if (!allTestsComplete) return 'not_finished';

    const allTestsPassed = item.testCases.every((tc: any) => tc.status && tc.status.toLowerCase() === 'passed');
    return allTestsPassed ? 'passed' : 'failed';
  }

  // If it's a test case with steps, calculate status based on steps
  if (item?.steps && item.steps.length > 0) {
    const hasRunSteps = item.steps.some((step: any) => step.status && (step.status === 'passed' || step.status === 'failed'));
    if (!hasRunSteps) return 'pending';

    const allStepsComplete = item.steps.every((step: any) => step.status && (step.status === 'passed' || step.status === 'failed'));
    if (!allStepsComplete) return 'not_finished';

    const allStepsPassed = item.steps.every((step: any) => step.status === 'passed');
    return allStepsPassed ? 'passed' : 'failed';
  }

  // For test cases and steps, convert not_run to pending
  if (item?.status) {
    return item.status.toLowerCase() === 'not_run' ? 'pending' : item.status.toLowerCase();
  }
  
  return 'pending';
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

// Add new progress calculation functions
const calculateUserStoryProgress = (userStory: any) => {
  if (!userStory.testCases || userStory.testCases.length === 0) return 0;
  
  const completedTests = userStory.testCases.filter((tc: any) => 
    tc.status && (tc.status.toLowerCase() === 'passed' || tc.status.toLowerCase() === 'failed')
  ).length;
  
  return (completedTests / userStory.testCases.length) * 100;
};

const calculateTestCaseProgress = (testCase: any) => {
  if (!testCase.status && (!testCase.steps || testCase.steps.length === 0)) return 0;
  
  // If test case has steps, calculate based on completed steps
  if (testCase.steps && testCase.steps.length > 0) {
    const completedSteps = testCase.steps.filter((step: any) => 
      step.status === 'passed' || step.status === 'failed'
    ).length;
    return (completedSteps / testCase.steps.length) * 100;
  }
  
  // If no steps, use test case status
  if (!testCase.status) return 0;
  const status = testCase.status.toLowerCase();
  return (status === 'passed' || status === 'failed') ? 100 : 0;
};

const getStatus = (item: any) => {
  // Check for no data first
  if (item?.id && typeof item.id === 'string' && item.id.startsWith('US_') && (!item.testCases || item.testCases.length === 0)) {
    return (
      <div className="test-suites-status">
        <div className="test-suites-status-badge no_data">
          No Data
        </div>
      </div>
    );
  }

  // For test cases or user stories with data
  if (item.status === 'passed') {
    return (
      <div className="test-suites-status">
        <div className="test-suites-status-badge passed">
          Passed
        </div>
      </div>
    );
  }

  if (item.status === 'not_finished') {
    return (
      <div className="test-suites-status">
        <div className="test-suites-status-badge not_finished">
          Not Finished
        </div>
      </div>
    );
  }

  return (
    <div className="test-suites-status">
      <div className="test-suites-status-badge pending">
        Pending
      </div>
    </div>
  );
};

const formatTotalCases = (item: any) => {
  if (item?.id && typeof item.id === 'string' && item.id.startsWith('US_')) {
    if (!item.testCases || item.testCases.length === 0) {
      return (
        <div className="test-suites-status">
          <div className="test-suites-status-badge no_data">
            No Data
          </div>
        </div>
      );
    }
    return item.testCases.length;
  }
  return '-';
};

// Add ProgressBar component
const ProgressBar = ({ progress, type, item }: { progress: number, type: 'passed' | 'not_finished' | 'pending' | 'no_data' | 'failed', item?: any }) => {
  // If it's a user story with no test cases data
  if (item?.id && typeof item.id === 'string' && item.id.startsWith('US_') && (!item.testCases || item.testCases.length === 0)) {
    return (
      <div className="test-suites-progress-bar-container">
        <div className="test-suites-status">
          <div className="test-suites-status-badge no_data">
            No Data
          </div>
        </div>
      </div>
    );
  }

  const roundedProgress = Math.round(progress);
  return (
    <div className="test-suites-progress-bar-container">
      <div 
        className={`test-suites-progress-bar ${type}`}
        style={{ width: type === 'pending' ? '100%' : `${roundedProgress}%` }}
      >
        <div className="test-suites-progress-text">
          {roundedProgress}% {type.charAt(0).toUpperCase() + type.slice(1)}
        </div>
      </div>
      {type !== 'pending' && roundedProgress < 100 && (
        <div 
          className="test-suites-progress-bar pending"
          style={{ width: `${100 - roundedProgress}%` }}
        >
          <div className="test-suites-progress-text">
            Pending
          </div>
        </div>
      )}
    </div>
  );
};

// New function to format test case progress (step position)
const formatTestCaseProgress = (testCase: any, parentUserStory: any) => {
  if (!testCase?.id || !parentUserStory?.testCases) return '-';
  
  // Extract TC number from id (e.g., "TC01" -> 1)
  const tcNumber = parseInt(testCase.id.replace('TC', ''));
  const totalTestCases = parentUserStory.testCases.length;
  
  if (tcNumber && totalTestCases) {
    return `${tcNumber}/${totalTestCases}`;
  }
  
  return '-';
};

// New function to format step progress (step position within test case)
const formatStepProgress = (step: any, testCase: any) => {
  if (!step?.stepNumber || !testCase?.steps) return '-';
  
  return `${step.stepNumber}/${testCase.steps.length}`;
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
    const progress = calculateUserStoryProgress(userStory);
    const progressType = progress === 100 ? 'passed' : progress > 0 ? 'not_finished' : 'pending';
    
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
            {formatTotalCases(userStory)}
          </td>
          <td className="test-suites-cell center">
            <StatusCell item={userStory} />
          </td>
          <td className="test-suites-cell center">
            <span className="test-suites-last-run">{formatLastRun(userStory.lastRun, userStory)}</span>
          </td>
          <td className="test-suites-cell center">
            <span className="test-suites-duration">{formatDuration(userStory.duration, userStory)}</span>
          </td>
          <td className="test-suites-cell center">
            <ProgressBar progress={progress} type={progressType} item={userStory} />
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

  const renderTestStep = (step: any, testCase: any) => {
    const stepProgress = step.status === 'passed' || step.status === 'failed' ? 100 : 0;
    const stepProgressType = step.status === 'passed' ? 'passed' : step.status === 'failed' ? 'failed' : 'pending';
    
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
          <span className="test-suites-progress">{formatStepProgress(step, testCase)}</span>
        </td>
        <td className="test-suites-cell center">
          <StatusCell item={step} />
        </td>
        <td className="test-suites-cell center">
          <span className="test-suites-last-run">{formatLastRun(step.lastRun, step)}</span>
        </td>
        <td className="test-suites-cell center">
          <span className="test-suites-duration">{formatDuration(step.duration, step)}</span>
        </td>
        <td className="test-suites-cell center">
          <ProgressBar progress={stepProgress} type={stepProgressType} item={step} />
        </td>
        <td className="test-suites-cell center">
          <div className="test-suites-actions">
            {step.status === 'running' ? (
              <button className="test-suites-action-button" title="Stop Step">
                <Square className="test-suites-action-icon stop" />
              </button>
            ) : (
              <button 
                onClick={() => onRunTestCase(`${testCase.id}-step-${step.stepNumber}`)}
                className="test-suites-action-button"
                title="Run Step"
              >
                <Play className="test-suites-action-icon run" />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const renderTestCase = (testCase: any, parentId: string) => {
    const testCaseId = `${parentId}-${testCase.id}`;
    const isExpanded = expandedItems.has(testCaseId);
    const progress = calculateTestCaseProgress(testCase);
    
    // Determine progress type based on test case status or steps
    let progressType: 'passed' | 'not_finished' | 'pending' | 'no_data' | 'failed' = 'pending';
    if (testCase.steps && testCase.steps.length > 0) {
      const hasFailedSteps = testCase.steps.some((step: any) => step.status === 'failed');
      const allStepsComplete = testCase.steps.every((step: any) => step.status === 'passed' || step.status === 'failed');
      const allStepsPassed = testCase.steps.every((step: any) => step.status === 'passed');
      
      if (allStepsComplete && allStepsPassed) {
        progressType = 'passed';
      } else if (hasFailedSteps) {
        progressType = 'failed';
      } else if (progress > 0) {
        progressType = 'not_finished';
      }
    } else if (testCase.status) {
      const status = testCase.status.toLowerCase();
      if (status === 'passed') progressType = 'passed';
      else if (status === 'failed') progressType = 'failed';
      else if (status === 'not_finished') progressType = 'not_finished';
    }
    
    // Find parent user story for progress calculation
    const parentUserStory = testSuites.find(us => us.id === parentId);
    
    return (
      <React.Fragment key={testCaseId}>
        {/* Test Case Row */}
        <tr className="test-suites-row test-case" data-status={testCase.status?.toLowerCase() || 'pending'}>
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
            <span className="test-suites-progress">{formatTestCaseProgress(testCase, parentUserStory)}</span>
          </td>
          <td className="test-suites-cell center">
            <StatusCell item={testCase} />
          </td>
          <td className="test-suites-cell center">
            <span className="test-suites-last-run">{formatLastRun(testCase.lastRun, testCase)}</span>
          </td>
          <td className="test-suites-cell center">
            <span className="test-suites-duration">{formatDuration(testCase.duration, testCase)}</span>
          </td>
          <td className="test-suites-cell center">
            <ProgressBar progress={progress} type={progressType} item={testCase} />
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
        {isExpanded && testCase.steps && testCase.steps.map((step: any) => renderTestStep(step, testCase))}
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
              <th className="test-suites-cell center">TOTAL CASES</th>
              <th className="test-suites-cell center">STATUS</th>
              <th className="test-suites-cell center">LAST RUN</th>
              <th className="test-suites-cell center">DURATION</th>
              <th className="test-suites-cell center">PROGRESS</th>
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