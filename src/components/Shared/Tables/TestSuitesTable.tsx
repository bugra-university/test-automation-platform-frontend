import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Square, Play, BarChart3, Edit, AlertTriangle, Loader } from 'lucide-react';
import { TestSuite, testSuitesApi } from '../../../api/testSuitesApi';
import "../../../styles/dashboard/excel-viewer/excel-viewer.css";
import "../../../styles/dashboard/excel-viewer/sheet-tabs.css";
import "../../../styles/dashboard/excel-viewer/backlog-table.css";
import "../../../styles/dashboard/excel-viewer/test-suites.css";

interface TestSuitesTableProps {
  testSuites: TestSuite[];
  onRunTestSuite: (userStoryId: string) => void;
  onRunTestCase: (testCaseId: string) => void;
  onDownloadReport: (userStoryId?: string) => void;
  runningTests?: Set<string>;
}

// Simple status helpers
const getStatusIcon = (status: string) => {
  return <span className={`test-suites-status-icon ${status.toLowerCase()}`}></span>;
};

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'passed': 'Passed',
    'failed': 'Failed',
    'running': 'Running',
    'pending': 'Pending'
  };
  return statusMap[status] || 'Pending';
};

const getStatusClass = (status: string) => {
  return status.toLowerCase();
};

// Calculate success rate for User Story
const calculateUserStorySuccess = (item: any) => {
  if (!item.testCases) return null;
  
  // Check if this is a user story
  if (!item.id?.startsWith('US_')) return null;
  
  // Check if user story has any data
  if (!hasUserStoryData(item)) {
    return { executed: 0, successRate: 0 };
  }

  const totalTestCases = item.testCases.length;
  const executedTestCases = item.testCases.filter((tc: any) => 
    tc.status === 'passed' || tc.status === 'failed'
  ).length;
  
  const passedTestCases = item.testCases.filter((tc: any) => 
    tc.status === 'passed'
  ).length;

  return {
    executed: executedTestCases,
    successRate: executedTestCases > 0 ? Math.round((passedTestCases / executedTestCases) * 100) : 0
  };
};

// Add helper functions for user story calculations
const calculateUserStoryLastRun = (item: any) => {
  if (!item.testCases || item.testCases.length === 0) return null;
  
  // Get all test cases with last run dates
  const testCasesWithRuns = item.testCases
    .filter((tc: any) => tc.lastRun)
    .map((tc: any) => ({
      ...tc,
      lastRunDate: new Date(tc.lastRun)
    }));

  if (testCasesWithRuns.length === 0) return null;

  // Find the most recent run
  const mostRecentRun = testCasesWithRuns.reduce((latest: any, current: any) => 
    current.lastRunDate > latest.lastRunDate ? current : latest
  );

  return mostRecentRun.lastRun;
};

const calculateUserStoryDuration = (item: any) => {
  if (!item.testCases || item.testCases.length === 0) return null;
  
  // Sum up durations of all executed test cases
  const totalDuration = item.testCases
    .filter((tc: any) => tc.duration)
    .reduce((sum: number, tc: any) => sum + (parseInt(tc.duration) || 0), 0);

  return totalDuration > 0 ? `${totalDuration}s` : null;
};

const calculateUserStoryExecutionStatus = (item: any) => {
  if (!item.testCases || item.testCases.length === 0) return 'no_data';
  
  const totalTests = item.testCases.length;
  const executedTests = item.testCases.filter((tc: any) => 
    tc.status === 'passed' || tc.status === 'failed'
  ).length;

  if (executedTests === 0) return 'not_run';
  if (executedTests < totalTests) return 'not_finished';
  return 'completed';
};

// Simple status cell component
const StatusCell = ({ item }: { item: any }) => {
  // Common styles
  const notRunStyles = 'bg-slate-100 text-slate-600 min-w-[100px] justify-center';
  const noDataStyles = 'bg-slate-200 text-slate-700 min-w-[100px] justify-center';
  
  // For User Stories, show success rate
  const userStorySuccess = calculateUserStorySuccess(item);
  if (userStorySuccess !== null) {
    // Check if user story has any data
    if (!hasUserStoryData(item)) {
      return (
        <div className="test-suites-status">
          <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium ${noDataStyles}`}>
            No Data
          </div>
        </div>
      );
    }

    const { executed, successRate } = userStorySuccess;
    if (executed === 0) {
      return (
        <div className="test-suites-status">
          <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium ${notRunStyles}`}>
            Not Run
          </div>
        </div>
      );
    }

    return (
      <div className="test-suites-status">
        <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium min-w-[100px] justify-center
          ${successRate === 100 ? 'bg-green-500 text-white' : 
            successRate === 0 ? 'bg-red-500 text-white' : 
            'bg-yellow-400 text-white'}`}
        >
          {`${successRate}% Success`}
        </div>
      </div>
    );
  }

  // For individual test cases
  const status = item.status?.toLowerCase() || 'not_run';
  
  type StatusType = 'passed' | 'failed' | 'running' | 'not_run' | 'pending' | 'no_data';
  
  const statusConfig: Record<StatusType, { bg: string; text: string; textColor: string }> = {
    passed: { bg: 'bg-green-500', text: 'Passed', textColor: 'text-white' },
    failed: { bg: 'bg-red-500', text: 'Failed', textColor: 'text-white' },
    running: { bg: 'bg-blue-400', text: 'Running', textColor: 'text-white' },
    not_run: { bg: 'bg-slate-100', text: 'Not Run', textColor: 'text-slate-600' },
    pending: { bg: 'bg-slate-100', text: 'Not Run', textColor: 'text-slate-600' },
    no_data: { bg: 'bg-slate-200', text: 'No Data', textColor: 'text-slate-700' }
  };

  const config = statusConfig[status as StatusType] || statusConfig.no_data;

  return (
    <div className="test-suites-status">
      <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium min-w-[100px] justify-center ${config.bg} ${config.textColor}`}>
        {status === 'running' ? (
          <span className="flex items-center">
            <span className="loading loading-spinner loading-xs mr-2"></span>
            {config.text}
          </span>
        ) : (
          config.text
        )}
      </div>
    </div>
  );
};

// Calculate progress for User Story
const calculateUserStoryProgress = (item: any) => {
  if (!item.testCases) return null;
  
  // Check if this is a user story
  if (!item.id?.startsWith('US_')) return null;
  
  // Check if user story has any data
  if (!hasUserStoryData(item)) {
    return { percentage: 0, total: 0, completed: 0 };
  }

  const totalTestCases = item.testCases.length;
  const executedTestCases = item.testCases.filter((tc: any) => 
    tc.status === 'passed' || tc.status === 'failed'
  ).length;

  return {
    percentage: totalTestCases > 0 ? Math.round((executedTestCases / totalTestCases) * 100) : 0,
    total: totalTestCases,
    completed: executedTestCases
  };
};

// Simple progress component
const ProgressBar = ({ item }: { item: any }) => {
  // Common styles
  const notRunStyles = 'bg-slate-100 text-slate-600 min-w-[100px] justify-center';
  const noDataStyles = 'bg-slate-200 text-slate-700 min-w-[100px] justify-center';
  
  // For User Stories, show execution progress
  const userStoryProgress = calculateUserStoryProgress(item);
  if (userStoryProgress !== null) {
    // Check if user story has any data
    if (!hasUserStoryData(item)) {
      return (
        <div className="progress-container">
          <div className="relative w-full h-6 bg-slate-50 rounded-full overflow-hidden">
            <div className={`flex items-center h-full text-xs font-medium ${noDataStyles}`}>
              No Data
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="progress-container">
        <div className="relative w-full h-6 bg-slate-50 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full transition-all duration-300 rounded-full bg-blue-400"
            style={{ width: `${userStoryProgress.percentage}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
            <span className={`${userStoryProgress.percentage > 50 ? 'text-white' : 'text-slate-600'} px-2`}>
              {`${userStoryProgress.percentage}% Executed`}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // For individual test cases
  const status = item.status?.toLowerCase() || 'not_run';
  const hasData = item.steps && item.steps.length > 0;
  
  if (!hasData) {
    return (
      <div className="progress-container">
        <div className="relative w-full h-6 bg-slate-50 rounded-full overflow-hidden">
          <div className={`flex items-center h-full text-xs font-medium ${noDataStyles}`}>
            No Data
          </div>
        </div>
      </div>
    );
  }

  const progress = status === 'running' ? 50 : (status === 'passed' || status === 'failed') ? 100 : 0;
  
  type ProgressStatusType = 'passed' | 'failed' | 'running' | 'not_run' | 'pending' | 'no_data';
  
  const progressConfig: Record<ProgressStatusType, { bg: string; text: string; textColor: string }> = {
    passed: { bg: 'bg-green-500', text: '100% Done', textColor: 'text-white' },
    failed: { bg: 'bg-red-500', text: '100% Done', textColor: 'text-white' },
    running: { bg: 'bg-blue-400', text: 'In Progress', textColor: 'text-white' },
    not_run: { bg: notRunStyles, text: 'Not Run', textColor: 'text-slate-600' },
    pending: { bg: notRunStyles, text: 'Not Run', textColor: 'text-slate-600' },
    no_data: { bg: noDataStyles, text: 'No Data', textColor: 'text-slate-700' }
  };

  const config = progressConfig[hasData ? (status as ProgressStatusType) : 'no_data'] || progressConfig.no_data;
  
  return (
    <div className="progress-container">
      <div className="relative w-full h-6 bg-slate-50 rounded-full overflow-hidden">
        {!hasData || status === 'no_data' ? (
          <div className={`flex items-center h-full text-xs font-medium ${config.bg} ${config.textColor}`}>
            {config.text}
          </div>
        ) : (
          <>
            <div 
              className={`absolute top-0 left-0 h-full transition-all duration-300 rounded-full ${config.bg}`}
              style={{ width: `${progress}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
              <span className={`${progress > 50 ? 'text-white' : config.textColor} px-2 min-w-[100px] text-center`}>
                {config.text}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Simple formatters
const formatLastRun = (lastRun: string | null) => {
  if (!lastRun) return (
    <div className="test-suites-status">
      <div className="test-suites-status-badge pending">
        Not Run
      </div>
    </div>
  );

  const date = new Date(lastRun);
  return date.toLocaleString();
};

const formatDuration = (durationMs: number | null) => {
  if (!durationMs) return (
    <div className="test-suites-status">
      <div className="test-suites-status-badge pending">
        No Data
      </div>
    </div>
  );

  const seconds = Math.round(durationMs / 1000);
  return `${seconds}s`;
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

const calculateStatus = (item: any, runningTests?: Set<string>) => {
  // 1. Önce test çalışıyor mu kontrol et
  if (runningTests?.has(item.id)) {
    return 'running';
  }

  // 2. Backend'den gelen test durumunu kontrol et
  if (item?.status) {
    const status = item.status.toLowerCase();
    // Backend'den gelen durumu frontend'in anladığı formata çevir
    switch (status) {
      case 'completed':
      case 'pass':
      case 'passed':
        return 'passed';
      case 'failed':
      case 'fail':
        return 'failed';
      case 'running':
        return 'running';
      case 'not_run':
      case 'pending':
        return 'pending';
      default:
        // Bilinmeyen durumlar için pending
        return 'pending';
    }
  }

  // 3. User Story ise test case'lerin durumlarına bak
  if (item?.testCases && item.testCases.length > 0) {
    const hasRunningTests = item.testCases.some((tc: any) => runningTests?.has(tc.id));
    if (hasRunningTests) return 'running';

    const hasCompletedTests = item.testCases.some((tc: any) => 
      tc.status && (tc.status.toLowerCase() === 'passed' || tc.status.toLowerCase() === 'failed' || 
                   tc.status.toLowerCase() === 'completed' || tc.status.toLowerCase() === 'pass' ||
                   tc.status.toLowerCase() === 'fail'));

    if (!hasCompletedTests) return 'pending';

    const allTestsComplete = item.testCases.every((tc: any) => 
      tc.status && (tc.status.toLowerCase() === 'passed' || tc.status.toLowerCase() === 'failed' ||
                   tc.status.toLowerCase() === 'completed' || tc.status.toLowerCase() === 'pass' ||
                   tc.status.toLowerCase() === 'fail'));

    if (!allTestsComplete) return 'not_finished';

    const allTestsPassed = item.testCases.every((tc: any) => 
      tc.status && (tc.status.toLowerCase() === 'passed' || tc.status.toLowerCase() === 'completed' || 
                   tc.status.toLowerCase() === 'pass'));

    return allTestsPassed ? 'passed' : 'failed';
  }

  // 4. Test Case ise ve step'leri varsa
  if (item?.steps && item.steps.length > 0) {
    // Step'lerin durumunu sadece test case'in kendi durumu yoksa kontrol et
    const hasRunSteps = item.steps.some((step: any) => 
      step.status && (step.status.toLowerCase() === 'passed' || step.status.toLowerCase() === 'failed'));
    
    if (!hasRunSteps) return 'pending';

    const allStepsComplete = item.steps.every((step: any) => 
      step.status && (step.status.toLowerCase() === 'passed' || step.status.toLowerCase() === 'failed'));
    
    if (!allStepsComplete) return 'not_finished';

    const allStepsPassed = item.steps.every((step: any) => 
      step.status && step.status.toLowerCase() === 'passed');
    
    return allStepsPassed ? 'passed' : 'failed';
  }

  // 5. Hiçbir durum belirtilmemişse pending
  return 'pending';
};

// Add new progress calculation functions
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

const calculateProgress = (item: any) => {
  // Önce status'u al
  const status = calculateStatus(item);
  
  // Eğer test failed ise, progress da failed olmalı
  if (status === 'failed') {
    return {
      type: 'failed',
      progress: 100,
      text: '100% Failed'
    };
  }
  
  // Eğer test passed ise
  if (status === 'passed') {
    return {
      type: 'passed',
      progress: 100,
      text: '100% Passed'
    };
  }
  
  // Eğer test running ise
  if (status === 'running') {
    // Step'lere göre ilerleme hesapla
    if (item?.steps) {
      const totalSteps = item.steps.length;
      const completedSteps = item.steps.filter((step: any) => 
        step.status === 'passed' || step.status === 'failed'
      ).length;
      
      const progress = Math.round((completedSteps / totalSteps) * 100);
      return {
        type: 'running',
        progress: progress,
        text: `${progress}% Complete`
      };
    }
  }
  
  // Diğer durumlar için (pending, not_finished)
  return {
    type: 'pending',
    progress: 0,
    text: 'Pending'
  };
};

// Add helper function to check if user story has data
const hasUserStoryData = (item: any) => {
  return item.testCases && item.testCases.length > 0;
};

export const TestSuitesTable = ({ 
  testSuites: initialTestSuites, 
  onRunTestSuite, 
  onRunTestCase, 
  onDownloadReport,
  runningTests 
}: TestSuitesTableProps) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [testSuites, setTestSuites] = useState(initialTestSuites);
  const projectId = 2; // TODO: Get from context or props

  // Function to refresh table data
  const refreshTableData = async () => {
    try {
      const response = await testSuitesApi.getTestSuites(projectId);
      if (response.success && response.testSuites) {
        setTestSuites(response.testSuites);
        console.log('Table data refreshed successfully');
      }
    } catch (error) {
      console.error('Error refreshing table data:', error);
    }
  };

  // Set up SSE connection for real-time updates
  useEffect(() => {
    const eventSource = new EventSource(`/api/projects/${projectId}/events`);
    
    const handleTestComplete = async (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received test completion event:', data);
        await refreshTableData();
      } catch (error) {
        console.error('Error handling test completion event:', error);
      }
    };

    eventSource.addEventListener('test_case_completed', handleTestComplete);
    eventSource.addEventListener('test_suite_completed', handleTestComplete);

    // Cleanup function
    return () => {
      eventSource.removeEventListener('test_case_completed', handleTestComplete);
      eventSource.removeEventListener('test_suite_completed', handleTestComplete);
      eventSource.close();
    };
  }, [projectId]);

  // Update local state when props change
  useEffect(() => {
    setTestSuites(initialTestSuites);
  }, [initialTestSuites]);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const renderUserStory = (userStory: any) => {
    const isExpanded = expandedIds.has(userStory.id);
    const executionStatus = calculateUserStoryExecutionStatus(userStory);
    
    // Common styles
    const notRunStyles = 'bg-slate-100 text-slate-600 min-w-[100px] justify-center';
    const noDataStyles = 'bg-slate-200 text-slate-700 min-w-[100px] justify-center';
    const notFinishedStyles = 'bg-yellow-400 text-white min-w-[100px] justify-center';
    
    // Get last run and duration
    const lastRun = calculateUserStoryLastRun(userStory);
    const duration = calculateUserStoryDuration(userStory);

    return (
      <React.Fragment key={userStory.id}>
        <tr className="test-suites-row user-story">
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
            {executionStatus === 'no_data' ? (
              <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium ${noDataStyles}`}>
                No Data
              </div>
            ) : executionStatus === 'not_run' ? (
              <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium ${notRunStyles}`}>
                Not Run
              </div>
            ) : executionStatus === 'not_finished' ? (
              <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium ${notFinishedStyles}`}>
                Not Finished
              </div>
            ) : (
              <span className="test-suites-last-run text-gray-600 min-w-[100px] flex justify-center">
                {formatLastRun(lastRun)}
              </span>
            )}
          </td>
          <td className="test-suites-cell center">
            {executionStatus === 'no_data' ? (
              <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium ${noDataStyles}`}>
                No Data
              </div>
            ) : executionStatus === 'not_run' ? (
              <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium ${notRunStyles}`}>
                Not Run
              </div>
            ) : executionStatus === 'not_finished' ? (
              <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium ${notFinishedStyles}`}>
                Not Finished
              </div>
            ) : (
              <span className="test-suites-duration text-gray-600 min-w-[100px] flex justify-center">
                {duration}
              </span>
            )}
          </td>
          <td className="test-suites-cell center">
            <ProgressBar item={userStory} />
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
        {isExpanded && userStory.testCases && userStory.testCases.map((testCase: any) => 
          renderTestCase(testCase, userStory.id)
        )}
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
          <span className="test-suites-last-run">{formatLastRun(step.lastRun)}</span>
        </td>
        <td className="test-suites-cell center">
          <span className="test-suites-duration">{formatDuration(step.duration)}</span>
        </td>
        <td className="test-suites-cell center">
          <ProgressBar item={step} />
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
    const isExpanded = expandedIds.has(testCaseId);
    const isRunning = runningTests?.has(testCase.id);
    const status = testCase.status?.toLowerCase() || 'not_run';
    const hasData = testCase.steps && testCase.steps.length > 0;
    
    // Common styles
    const notRunStyles = 'bg-slate-100 text-slate-600 min-w-[100px] justify-center';
    const noDataStyles = 'bg-slate-200 text-slate-700 min-w-[100px] justify-center';
    
    // Find parent user story for progress calculation
    const parentUserStory = testSuites.find(us => us.id === parentId);
    
    return (
      <React.Fragment key={testCaseId}>
        <tr className={`test-suites-row test-case ${isRunning ? 'running' : ''}`}>
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
            <span className="test-suites-progress">
              {formatTestCaseProgress(testCase, parentUserStory)}
            </span>
          </td>
          <td className="test-suites-cell center">
            <StatusCell item={testCase} />
          </td>
          <td className="test-suites-cell center">
            {!hasData ? (
              <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium ${noDataStyles}`}>
                No Data
              </div>
            ) : status === 'not_run' ? (
              <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium ${notRunStyles}`}>
                Not Run
              </div>
            ) : (
              <span className="test-suites-last-run text-gray-600 min-w-[100px] flex justify-center">
                {isRunning ? 'Running...' : formatLastRun(testCase.lastRun)}
              </span>
            )}
          </td>
          <td className="test-suites-cell center">
            {!hasData ? (
              <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium ${noDataStyles}`}>
                No Data
              </div>
            ) : status === 'not_run' ? (
              <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium ${notRunStyles}`}>
                Not Run
              </div>
            ) : (
              <span className="test-suites-duration text-gray-600 min-w-[100px] flex justify-center">
                {isRunning ? 'In Progress' : formatDuration(testCase.duration)}
              </span>
            )}
          </td>
          <td className="test-suites-cell center">
            <ProgressBar item={testCase} />
          </td>
          <td className="test-suites-cell center">
            <div className="test-suites-actions">
              {isRunning ? (
                <button className="test-suites-action-button" title="Stop Test Case">
                  <Square className="test-suites-action-icon stop" />
                </button>
              ) : (
                <button 
                  onClick={() => onRunTestCase(testCase.id)}
                  className="test-suites-action-button"
                  title="Run Test Case"
                >
                  <Play className="test-suites-action-icon run" />
                </button>
              )}
            </div>
          </td>
        </tr>
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