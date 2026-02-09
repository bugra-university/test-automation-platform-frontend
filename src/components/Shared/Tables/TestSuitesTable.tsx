import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronRight, Square, Play, FileBarChart2, FileEdit, AlertTriangle, Loader } from 'lucide-react';
import { TestSuite, testSuitesApi } from '../../../api/testSuitesApi';
import "../../../styles/dashboard/excel-viewer/excel-viewer.css";
import "../../../styles/dashboard/excel-viewer/sheet-tabs.css";
import "../../../styles/dashboard/excel-viewer/backlog-table.css";
import "../../../styles/dashboard/excel-viewer/test-suites.css";

interface TestSuitesTableProps {
  testSuites: TestSuite[];
  onRunTestSuite: (userStoryId: string) => void;
  onRunTestCase: (testCaseId: string) => void;
  onStopTestCase?: (testCaseId: string) => void;
  onStopTestSuite?: (userStoryId: string) => void;
  onDownloadReport: (userStoryId?: string) => void;
  runningTests?: Set<string>;

  currentStepByTestCaseId?: Record<string, number>;

  stepResultsLive?: Record<string, Record<number, { durationMs: number; lastRun: string }>>;
}


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


const calculateUserStorySuccess = (item: any) => {
  if (!item.testCases) return null;


  if (!item.id?.startsWith('US_')) return null;


  if (!hasUserStoryData(item)) {
    return { executed: 0, total: 0, passed: 0, failed: 0, notRun: 0, successRate: 0, executedPassRate: 0 };
  }

  const totalTestCases = item.testCases.length;
  const executedTestCases = item.testCases.filter((tc: any) =>
    tc.status === 'passed' || tc.status === 'failed'
  ).length;

  const passedTestCases = item.testCases.filter((tc: any) =>
    tc.status === 'passed'
  ).length;
  const failedTestCases = executedTestCases - passedTestCases;
  const notRunCount = totalTestCases - executedTestCases;


  const successRate = totalTestCases > 0 ? Math.round((passedTestCases / totalTestCases) * 100) : 0;

  const executedPassRate = executedTestCases > 0 ? (passedTestCases / executedTestCases) * 100 : 0;
  return {
    executed: executedTestCases,
    total: totalTestCases,
    passed: passedTestCases,
    failed: failedTestCases,
    notRun: notRunCount,
    successRate,
    executedPassRate
  };
};


const calculateUserStoryLastRun = (item: any) => {
  if (!item.testCases || item.testCases.length === 0) return null;


  const testCasesWithRuns = item.testCases
    .filter((tc: any) => tc.lastRun)
    .map((tc: any) => ({
      ...tc,
      lastRunDate: new Date(tc.lastRun)
    }));

  if (testCasesWithRuns.length === 0) return null;


  const mostRecentRun = testCasesWithRuns.reduce((latest: any, current: any) =>
    current.lastRunDate > latest.lastRunDate ? current : latest
  );

  return mostRecentRun.lastRun;
};

const formatUserStoryDuration = (totalSeconds: number) => {
  if (totalSeconds <= 0) return null;
  if (totalSeconds >= 60) {
    const min = totalSeconds / 60;
    return min % 1 === 0 ? `${min} min` : `${min.toFixed(1)} min`;
  }
  const s = parseFloat(totalSeconds.toFixed(1));
  return `${s}s`;
};

const calculateUserStoryDuration = (item: any) => {
  if (!item.testCases || item.testCases.length === 0) return null;

  const totalMs = item.testCases
    .filter((tc: any) => tc.duration != null && tc.duration !== '')
    .reduce((sum: number, tc: any) => sum + (Number(tc.duration) || 0), 0);
  const totalSeconds = totalMs / 1000;
  return totalSeconds > 0 ? formatUserStoryDuration(totalSeconds) : null;
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


const StatusCell = ({ item, isRunning: isRunningOverride }: { item: any; isRunning?: boolean }) => {
  const [showUserStoryTooltip, setShowUserStoryTooltip] = useState(false);
  const notRunStyles = 'bg-slate-100 text-slate-600 min-w-[100px] justify-center';
  const noDataStyles = 'bg-slate-50 text-slate-400 min-w-[80px] justify-center opacity-70';

  const userStorySuccess = calculateUserStorySuccess(item);
  if (userStorySuccess !== null) {

    if (!hasUserStoryData(item)) {
      return (
        <div className="test-suites-status">
          <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium ${noDataStyles}`}>
            No Data
          </div>
        </div>
      );
    }

    const { executed, passed, failed = 0, notRun = 0, successRate } = userStorySuccess;
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
      <div
        className={`test-suites-status relative inline-flex cursor-help ${showUserStoryTooltip ? 'z-[1000]' : ''}`}
        onMouseEnter={() => setShowUserStoryTooltip(true)}
        onMouseLeave={() => setShowUserStoryTooltip(false)}
      >
        <div className="relative w-full h-6 bg-slate-200 rounded-full overflow-hidden min-w-[100px]">
          <div
            className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${successRate}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
            <span className={`${successRate > 50 ? 'text-white' : 'text-slate-600'} px-2`}>
              {`${successRate}% Passed`}
            </span>
          </div>
        </div>
        {showUserStoryTooltip && (
          <div
            className="absolute left-0 top-full z-[1000] mt-1.5 min-w-[220px] rounded-lg border border-slate-200 px-3 py-2 shadow-xl text-[11px] text-slate-600"
            style={{ backgroundColor: '#ffffff' }}
          >
            <div className="font-medium text-slate-700">{successRate}% Passed</div>
            <div className="mt-0.5 whitespace-nowrap">{passed} passed · {failed} failed · {notRun} not run</div>
          </div>
        )}
      </div>
    );
  }


  const status = isRunningOverride ? 'running' : (item.status?.toLowerCase() || 'not_run');

  type StatusType = 'passed' | 'failed' | 'running' | 'not_run' | 'pending' | 'no_data';

  const statusConfig: Record<StatusType, { bg: string; text: string; textColor: string }> = {
    passed: { bg: 'bg-green-500', text: 'Passed', textColor: 'text-white' },
    failed: { bg: 'bg-red-500', text: 'Failed', textColor: 'text-white' },
    running: { bg: 'bg-blue-400', text: 'In Progress', textColor: 'text-white' },
    not_run: { bg: 'bg-slate-100', text: 'Not Run', textColor: 'text-slate-600' },
    pending: { bg: 'bg-slate-100', text: 'Not Run', textColor: 'text-slate-600' },
    no_data: { bg: 'bg-slate-200', text: 'No Data', textColor: 'text-slate-700' }
  };

  const config = statusConfig[status as StatusType] || statusConfig.no_data;

  return (
    <div className="test-suites-status">
      <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium min-w-[100px] justify-center ${config.bg} ${config.textColor}`}>
        {status === 'running' ? (
          <span className="flex items-center gap-2">
            <Loader className="h-3.5 w-3.5 animate-spin flex-shrink-0" />
            {config.text}
          </span>
        ) : (
          config.text
        )}
      </div>
    </div>
  );
};


const calculateUserStoryProgress = (item: any) => {
  if (!item.testCases) return null;


  if (!item.id?.startsWith('US_')) return null;


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


const UserStoryCellTooltip = ({ children, content, compact }: { children: React.ReactNode; content: React.ReactNode; compact?: boolean }) => {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setShow(true);
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 6,
        left: rect.left + rect.width / 2
      });
    }
  };

  const handleMouseLeave = () => setShow(false);

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex cursor-help justify-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {show && typeof document !== 'undefined' && createPortal(
        <div
          className={`fixed z-[9999] rounded-lg border border-slate-200 px-3 py-2 shadow-xl text-[11px] text-slate-600 -translate-x-1/2 ${compact ? 'w-max' : 'min-w-[220px]'}`}
          style={{
            backgroundColor: '#ffffff',
            top: position.top,
            left: position.left
          }}
        >
          {content}
        </div>,
        document.body
      )}
    </div>
  );
};


const ProgressBar = ({ item }: { item: any }) => {

  const notRunStyles = 'bg-slate-100 text-slate-600 min-w-[100px] justify-center';
  const noDataStyles = 'bg-slate-50 text-slate-400 min-w-[80px] justify-center opacity-70';


  const userStoryProgress = calculateUserStoryProgress(item);
  if (userStoryProgress !== null) {

    if (!hasUserStoryData(item)) {
      return (
        <div className="test-suites-status">
          <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium ${noDataStyles}`}>
            No Data
          </div>
        </div>
      );
    }

    return (
      <div className="test-suites-status">
        <div className="relative w-full h-6 bg-slate-200 rounded-full overflow-hidden min-w-[100px]">
          <div
            className="absolute top-0 left-0 h-full bg-blue-400 rounded-full transition-all duration-300"
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


  const isStepRow = item.stepNumber != null && !item.testCases;
  const status = item.status?.toLowerCase() || 'not_run';
  const hasData = isStepRow
    ? (status === 'passed' || status === 'failed' || status === 'running')
    : (item.steps && item.steps.length > 0);

  if (!hasData) {
    return (
      <div className="test-suites-status">
        <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium ${noDataStyles}`}>
          No Data
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


  if (hasData && (status === 'passed' || status === 'failed' || status === 'running')) {
    const progressPercentage = progress;
    const bgColor = status === 'passed' ? 'bg-green-500' : status === 'failed' ? 'bg-red-500' : 'bg-blue-400';

    return (
      <div className="test-suites-status">
        <div className="relative w-full h-6 bg-slate-200 rounded-full overflow-hidden min-w-[100px]">
          <div
            className={`absolute top-0 left-0 h-full ${bgColor} rounded-full transition-all duration-300`}
            style={{ width: `${progressPercentage}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
            <span className={`${progressPercentage > 50 ? 'text-white' : 'text-slate-600'} px-2`}>
              {config.text}
            </span>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="test-suites-status">
      <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium ${config.bg} ${config.textColor} min-w-[100px] justify-center`}>
        {config.text}
      </div>
    </div>
  );
};


const formatLastRun = (lastRun: string | null) => {
  if (!lastRun) return (
    <div className="test-suites-status">
      <div className="flex items-center h-6 px-3 rounded-full text-xs font-medium bg-slate-100 text-slate-600 min-w-[100px] justify-center">
        Not Run
      </div>
    </div>
  );

  const date = new Date(lastRun);
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', '');
};

const formatDuration = (durationMs: number | null | undefined) => {
  const ms = durationMs != null ? Number(durationMs) : null;
  if (ms == null || Number.isNaN(ms) || ms < 0) return (
    <div className="test-suites-status">
      <div className="flex items-center h-5 px-2 rounded-full text-xs font-medium bg-slate-50 text-slate-400 min-w-[50px] justify-center opacity-70">
        No Data
      </div>
    </div>
  );

  if (ms < 1000) {
    return `${ms}ms`;
  }
  const seconds = Math.floor(ms / 1000);
  const remainderMs = Math.round(ms % 1000);
  if (remainderMs === 0) return `${seconds}s`;
  const frac = (remainderMs / 1000).toFixed(1).replace(/^0\./, '.');
  return `${seconds}${frac}s`;
}

const formatProgress = (progress: any, item: any, testSuites: any[]) => {
  if (!progress || typeof progress !== 'object') {

    if (item?.id && typeof item.id === 'string' && item.id.startsWith('TC')) {

      const tcNumber = parseInt(item.id.replace('TC', ''));


      const userStory = testSuites.find(us =>
        us.testCases && us.testCases.some((tc: any) => tc.id === item.id)
      );

      if (tcNumber && userStory?.testCases) {
        return `${tcNumber}/${userStory.testCases.length}`;
      }
    }
    return '-';
  }


  return `${progress.total || 0}`;
};

const calculateStatus = (item: any, runningTests?: Set<string>) => {

  if (runningTests?.has(item.id)) {
    return 'running';
  }


  if (item?.status) {
    const status = item.status.toLowerCase();

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

        return 'pending';
    }
  }


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


  if (item?.steps && item.steps.length > 0) {

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


  return 'pending';
};


const calculateTestCaseProgress = (testCase: any) => {
  if (!testCase.status && (!testCase.steps || testCase.steps.length === 0)) return 0;


  if (testCase.steps && testCase.steps.length > 0) {
    const completedSteps = testCase.steps.filter((step: any) =>
      step.status === 'passed' || step.status === 'failed'
    ).length;
    return (completedSteps / testCase.steps.length) * 100;
  }


  if (!testCase.status) return 0;
  const status = testCase.status.toLowerCase();
  return (status === 'passed' || status === 'failed') ? 100 : 0;
};

const getStatus = (item: any) => {

  if (item?.id && typeof item.id === 'string' && item.id.startsWith('US_') && (!item.testCases || item.testCases.length === 0)) {
    return (
      <div className="test-suites-status">
        <div className="test-suites-status-badge no_data">
          No Data
        </div>
      </div>
    );
  }


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
          <div className="flex items-center h-5 px-2 rounded-full text-xs font-medium bg-slate-50 text-slate-400 min-w-[50px] justify-center opacity-70">
            No Data
          </div>
        </div>
      );
    }
    return <span className="test-suites-total-cases-circle">{item.testCases.length}</span>;
  }
  return <span className="test-suites-total-cases">-</span>;
};


const formatTestCaseProgress = (testCase: any, parentUserStory: any) => {
  if (!testCase?.id || !parentUserStory?.testCases) return '-';


  const tcNumber = parseInt(testCase.id.replace('TC', ''));
  const totalTestCases = parentUserStory.testCases.length;

  if (tcNumber && totalTestCases) {
    return `${tcNumber}/${totalTestCases}`;
  }

  return '-';
};


const formatStepProgress = (step: any, testCase: any) => {
  if (!step?.stepNumber || !testCase?.steps) return '-';

  return `${step.stepNumber}/${testCase.steps.length}`;
};

const calculateProgress = (item: any) => {

  const status = calculateStatus(item);


  if (status === 'failed') {
    return {
      type: 'failed',
      progress: 100,
      text: '100% Failed'
    };
  }


  if (status === 'passed') {
    return {
      type: 'passed',
      progress: 100,
      text: '100% Passed'
    };
  }


  if (status === 'running') {

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


  return {
    type: 'pending',
    progress: 0,
    text: 'Pending'
  };
};


const hasUserStoryData = (item: any) => {
  return item.testCases && item.testCases.length > 0;
};

export const TestSuitesTable = ({
  testSuites: initialTestSuites,
  onRunTestSuite,
  onRunTestCase,
  onStopTestCase,
  onStopTestSuite,
  onDownloadReport,
  runningTests,
  currentStepByTestCaseId = {},
  stepResultsLive = {}
}: TestSuitesTableProps) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [testSuites, setTestSuites] = useState(initialTestSuites);
  const projectId = 2;


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


  const sseBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081';
  useEffect(() => {
    const eventSource = new EventSource(`${sseBaseUrl}/api/projects/${projectId}/test-suites/events`);

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


    return () => {
      eventSource.removeEventListener('test_case_completed', handleTestComplete);
      eventSource.removeEventListener('test_suite_completed', handleTestComplete);
      eventSource.close();
    };
  }, [projectId]);


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
    const userStoryProgress = calculateUserStoryProgress(userStory);
    const userStorySuccess = calculateUserStorySuccess(userStory);

    const notRunStyles = 'bg-slate-100 text-slate-600 min-w-[100px] justify-center';
    const noDataStyles = 'bg-slate-50 text-slate-400 min-w-[80px] justify-center opacity-70';
    const notFinishedStyles = 'bg-yellow-400 text-white min-w-[100px] justify-center';

    const lastRun = calculateUserStoryLastRun(userStory);
    const duration = calculateUserStoryDuration(userStory);

    return (
      <React.Fragment key={userStory.id}>
        <tr className="test-suites-row user-story">
          <td className="test-suites-cell center">
            <div className="test-suites-cell-content center">
              <span
                className="test-suites-id-badge"
                onClick={() => toggleExpanded(userStory.id)}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                {isExpanded ? (
                  <ChevronDown className="test-suites-action-icon" />
                ) : (
                  <ChevronRight className="test-suites-action-icon" />
                )}
                {userStory.id}
              </span>
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
              <div className="test-suites-status">
                <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium ${noDataStyles}`}>
                  No Data
                </div>
              </div>
            ) : executionStatus === 'not_run' ? (
              <div className="test-suites-status">
                <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium ${notRunStyles}`}>
                  Not Run
                </div>
              </div>
            ) : executionStatus === 'not_finished' ? (
              <UserStoryCellTooltip compact content={lastRun ? new Date(lastRun).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}>
                <div className="relative w-full h-6 bg-slate-200 rounded-full overflow-hidden min-w-[100px]">
                  <div
                    className="absolute top-0 left-0 h-full bg-yellow-400 rounded-full transition-all duration-300"
                    style={{ width: `${userStoryProgress?.percentage ?? 0}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                    <span className={(userStoryProgress?.percentage ?? 0) > 50 ? 'text-white' : 'text-slate-600'}>Partial</span>
                  </div>
                </div>
              </UserStoryCellTooltip>
            ) : (
              <UserStoryCellTooltip
                compact
                content={lastRun ? new Date(lastRun).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
              >
                <div className="relative w-full h-6 bg-slate-200 rounded-full overflow-hidden min-w-[100px]">
                  <div className="absolute top-0 left-0 h-full w-full bg-green-500 rounded-full transition-all duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {lastRun ? new Date(lastRun).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '') : '—'}
                  </div>
                </div>
              </UserStoryCellTooltip>
            )}
          </td>
          <td className="test-suites-cell center">
            {executionStatus === 'no_data' ? (
              <div className="test-suites-status">
                <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium ${noDataStyles}`}>
                  No Data
                </div>
              </div>
            ) : executionStatus === 'not_run' ? (
              <div className="test-suites-status">
                <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium ${notRunStyles}`}>
                  Not Run
                </div>
              </div>
            ) : executionStatus === 'not_finished' ? (
              <UserStoryCellTooltip
                content={
                  userStorySuccess ? (
                    <>
                      <div className="font-medium text-slate-700">Not all test cases run yet</div>
                      <div className="mt-0.5 whitespace-nowrap">{userStorySuccess.passed} passed · {userStorySuccess.failed} failed · {userStorySuccess.notRun} not run</div>
                      {duration && <div className="mt-0.5">Duration so far: {duration}</div>}
                    </>
                  ) : '—'
                }
              >
                <div className="relative w-full h-6 bg-slate-200 rounded-full overflow-hidden min-w-[100px]">
                  <div
                    className="absolute top-0 left-0 h-full bg-yellow-400 rounded-full transition-all duration-300"
                    style={{ width: `${userStoryProgress?.percentage ?? 0}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                    <span className={(userStoryProgress?.percentage ?? 0) > 50 ? 'text-white' : 'text-slate-600'}>{duration || '—'}</span>
                  </div>
                </div>
              </UserStoryCellTooltip>
            ) : (
              <UserStoryCellTooltip
                content={
                  userStorySuccess ? (
                    <>
                      <div className="font-medium text-slate-700">Total duration: {duration || '—'}</div>
                      <div className="mt-0.5 whitespace-nowrap">{userStorySuccess.passed} passed · {userStorySuccess.failed} failed · {userStorySuccess.notRun} not run</div>
                    </>
                  ) : (duration ? `Total duration: ${duration}` : '—')
                }
              >
                <div className="relative w-full h-6 bg-slate-200 rounded-full overflow-hidden min-w-[100px]">
                  <div className="absolute top-0 left-0 h-full w-full bg-green-500 rounded-full transition-all duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {duration || '—'}
                  </div>
                </div>
              </UserStoryCellTooltip>
            )}
          </td>
          <td className="test-suites-cell center">
            <UserStoryCellTooltip
              content={userStoryProgress && userStorySuccess ? (
                <>
                  <div className="font-medium text-slate-700">{userStoryProgress.percentage}% Executed</div>
                  <div className="mt-0.5 whitespace-nowrap">{userStorySuccess.passed} passed · {userStorySuccess.failed} failed · {userStorySuccess.notRun} not run</div>
                </>
              ) : '—'}
            >
              <ProgressBar item={userStory} />
            </UserStoryCellTooltip>
          </td>
          <td className="test-suites-cell center">
            <div className="test-suites-actions">
              {userStory.status === 'running' ? (
                <button
                  onClick={() => onStopTestSuite?.(userStory.id)}
                  className="test-suites-action-button"
                  title="Stop"
                >
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
            </div>
          </td>
        </tr>
        {isExpanded && userStory.testCases && userStory.testCases.map((testCase: any) =>
          renderTestCase(testCase, userStory.id)
        )}
      </React.Fragment>
    );
  };

  const renderTestStep = (step: any, testCase: any, parentId?: string) => {
    const compositeId = parentId ? `${parentId}-${testCase.id}` : testCase.id;
    const testCaseRunning = runningTests?.has(compositeId);
    const currentStep = currentStepByTestCaseId[compositeId];
    const isStepRunning = testCaseRunning && currentStep === step.stepNumber;
    const isStepCompletedThisRun = testCaseRunning && (currentStep ?? 0) > step.stepNumber;
    const liveResult = stepResultsLive[compositeId]?.[step.stepNumber];

    const stepForStatus = !testCaseRunning && (step.status || '').toLowerCase() === 'running'
      ? { ...step, status: 'passed' }
      : step;

    const runningIndicator = (
      <div className="flex items-center justify-center gap-2">
        <Loader className="h-4 w-4 animate-spin text-blue-500 flex-shrink-0" />
        <span className="text-xs font-medium text-blue-600">In progress</span>
      </div>
    );

    return (
      <tr key={step.id} className={`test-suites-row test-step ${isStepRunning ? 'running' : ''}`}>
        <td className="test-suites-cell">
          <div className="test-suites-cell-content">
            <span className="test-suites-id-badge">
              STEP {step.stepNumber || ''}
            </span>
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
          {isStepRunning ? (
            <div className="test-suites-status flex items-center justify-center gap-2 min-w-[100px]">
              <Loader className="h-3.5 w-3.5 animate-spin text-blue-500 flex-shrink-0" />
              <span className="text-xs font-medium text-blue-600">In progress</span>
            </div>
          ) : isStepCompletedThisRun ? (
            <div className="test-suites-status">
              <div className="flex items-center h-6 px-3 rounded-full text-xs font-medium bg-green-500 text-white min-w-[100px] justify-center">Passed</div>
            </div>
          ) : (
            <StatusCell item={stepForStatus} />
          )}
        </td>
        <td className="test-suites-cell center">
          {isStepRunning ? runningIndicator : isStepCompletedThisRun ? (
            <span className="test-suites-last-run text-[0.75rem] font-medium text-gray-600">
              {liveResult?.lastRun ?? '—'}
            </span>
          ) : (
            <span className="test-suites-last-run">{formatLastRun(stepForStatus.lastRun)}</span>
          )}
        </td>
        <td className="test-suites-cell center">
          {isStepRunning ? runningIndicator : isStepCompletedThisRun ? (
            <span className="test-suites-duration text-[0.75rem] font-medium text-gray-600">
              {liveResult != null ? formatDuration(liveResult.durationMs) : '—'}
            </span>
          ) : (
            <span className="test-suites-duration">{formatDuration(stepForStatus.durationMs ?? (typeof stepForStatus.duration === 'number' ? stepForStatus.duration : null))}</span>
          )}
        </td>
        <td className="test-suites-cell center">
          {isStepRunning ? runningIndicator : isStepCompletedThisRun ? (
            <div className="test-suites-status">
              <div className="flex items-center h-6 px-3 rounded-full text-xs font-medium bg-green-500 text-white min-w-[100px] justify-center">100% Done</div>
            </div>
          ) : (
            <ProgressBar item={stepForStatus} />
          )}
        </td>
        <td className="test-suites-cell center">
          <div className="test-suites-actions">
            {isStepRunning ? (
              <button className="test-suites-action-button" title="Step running">
                <Loader className="test-suites-action-icon animate-spin text-blue-500" />
              </button>
            ) : (
              <button
                onClick={() => onRunTestCase(`${compositeId}-step-${step.stepNumber}`)}
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
    const isRunning = runningTests?.has(testCaseId);
    const status = testCase.status?.toLowerCase() || 'not_run';
    const hasData = testCase.steps && testCase.steps.length > 0;


    const notRunStyles = 'bg-slate-100 text-slate-600 min-w-[100px] justify-center';
    const noDataStyles = 'bg-slate-50 text-slate-400 min-w-[80px] justify-center opacity-70';


    const parentUserStory = testSuites.find(us => us.id === parentId);

    return (
      <React.Fragment key={testCaseId}>
        <tr className={`test-suites-row test-case ${isRunning ? 'running' : ''}`}>
          <td className="test-suites-cell center">
            <div className="test-suites-cell-content center">
              <span
                className="test-suites-id-badge"
                onClick={() => toggleExpanded(testCaseId)}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                {testCase.steps && testCase.steps.length > 0 && (
                  isExpanded ? (
                    <ChevronDown className="test-suites-action-icon" />
                  ) : (
                    <ChevronRight className="test-suites-action-icon" />
                  )
                )}
                {testCase.id}
              </span>
            </div>
          </td>
          <td className="test-suites-cell">
            <div className="test-suites-cell-content">
              <div className="test-suites-name text-[0.75rem] font-medium text-gray-400">{testCase.name}</div>
            </div>
          </td>
          <td className="test-suites-cell center">
            <span className="test-suites-progress text-[0.75rem] font-medium text-gray-400">
              {formatTestCaseProgress(testCase, parentUserStory)}
            </span>
          </td>
          <td className="test-suites-cell center">
            <StatusCell item={testCase} isRunning={isRunning} />
          </td>
          <td className="test-suites-cell center">
            {isRunning ? (
              <div className="test-suites-status flex items-center justify-center gap-2">
                <Loader className="h-4 w-4 animate-spin text-blue-500 flex-shrink-0" />
                <span className="text-xs font-medium text-blue-600">In progress</span>
              </div>
            ) : !hasData ? (
              <div className="test-suites-status">
                <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium ${noDataStyles}`}>
                  No Data
                </div>
              </div>
            ) : status === 'not_run' ? (
              <div className="test-suites-status">
                <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium ${notRunStyles}`}>
                  Not Run
                </div>
              </div>
            ) : (
              <span className="test-suites-last-run text-[0.75rem] font-medium text-gray-400 min-w-[100px] flex justify-center">
                {formatLastRun(testCase.lastRun)}
              </span>
            )}
          </td>
          <td className="test-suites-cell center">
            {isRunning ? (
              <div className="test-suites-status flex items-center justify-center gap-2">
                <Loader className="h-4 w-4 animate-spin text-blue-500 flex-shrink-0" />
                <span className="text-xs font-medium text-blue-600">In progress</span>
              </div>
            ) : !hasData ? (
              <div className="test-suites-status">
                <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium ${noDataStyles}`}>
                  No Data
                </div>
              </div>
            ) : status === 'not_run' ? (
              <div className="test-suites-status">
                <div className={`flex items-center h-6 px-3 rounded-full text-xs font-medium ${notRunStyles}`}>
                  Not Run
                </div>
              </div>
            ) : (
              <span className="test-suites-duration text-[0.75rem] font-medium text-gray-400 min-w-[100px] flex justify-center">
                {formatDuration(testCase.duration)}
              </span>
            )}
          </td>
          <td className="test-suites-cell center">
            {isRunning ? (
              <div className="test-suites-status flex items-center justify-center gap-2 min-w-[100px]">
                <Loader className="h-4 w-4 animate-spin text-blue-500 flex-shrink-0" />
                <span className="text-xs font-medium text-blue-600">In progress</span>
              </div>
            ) : (
              <ProgressBar item={testCase} />
            )}
          </td>
          <td className="test-suites-cell center">
            <div className="test-suites-actions">
              {isRunning ? (
                <button
                  onClick={() => onStopTestCase?.(testCaseId)}
                  className="test-suites-action-button"
                  title="Stop Test Case"
                >
                  <Square className="test-suites-action-icon stop" />
                </button>
              ) : (
                <button
                  onClick={() => onRunTestCase(`${parentId}-${testCase.id}`)}
                  className="test-suites-action-button"
                  title="Run Test Case"
                >
                  <Play className="test-suites-action-icon run" />
                </button>
              )}
              <button
                onClick={() => onDownloadReport(testCase.id)}
                className="test-suites-action-button"
                title="Download Report"
              >
                <FileBarChart2 className="test-suites-action-icon report" />
              </button>
            </div>
          </td>
        </tr>
        {isExpanded && testCase.steps && testCase.steps.map((step: any) => renderTestStep(step, testCase, parentId))}
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