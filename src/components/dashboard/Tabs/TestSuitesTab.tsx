import React, { useState, useEffect, useCallback, useRef } from "react";
import { Play, Square, BarChart3, Edit, ChevronDown, ChevronRight, AlertTriangle, Download, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';
import { testSuitesApi, TestSuite, ExecutionStatus, TestExecutionEvent, SSEConnectionManager } from '../../../api/testSuitesApi';
import { stepTrackingApi, StepExecutionEvent, StepSSEConnectionManager } from '../../../api/stepTrackingApi';

// Test Suites API integration complete - using real data from database

// Utility functions for formatting
const formatDuration = (durationMs: number | null) => {
  if (!durationMs) return '-';
  const seconds = Math.round(durationMs / 1000);
  return `${seconds}s`;
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

const formatProgress = (progress: any) => {
  if (!progress || typeof progress !== 'object') return '-';
  return `${progress.completed || 0}/${progress.total || 0}`;
};

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

// Removed ExecutionTracker interface - no longer needed

interface TestSuitesTableProps {
  testSuites: TestSuite[];
  onRunTestSuite: (userStoryId: string) => void;
  onRunTestCase: (testCaseId: string) => void;
  onDownloadReport: (userStoryId?: string) => void;
}

const TestSuitesTable = ({ testSuites, onRunTestSuite, onRunTestCase, onDownloadReport }: TestSuitesTableProps) => {
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
        <tr className="border-b border-gray-200 hover:bg-gray-50">
          <td className="px-6 py-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleExpanded(userStory.id)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                )}
              </button>
              <span className="font-medium text-gray-900">{userStory.id}</span>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="text-sm text-gray-900 font-medium">{userStory.name}</div>
            <div className="text-xs text-gray-500 mt-1 line-clamp-2">{userStory.description}</div>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center space-x-2">
              {getStatusIcon(userStory.status)}
              <span className={`text-sm font-medium ${getStatusColor(userStory.status)}`}>
                {getStatusText(userStory.status)}
              </span>
            </div>
          </td>
          <td className="px-6 py-4">
            <span className="text-sm text-gray-600">
              {formatProgress(userStory.progress)}
            </span>
          </td>
          <td className="px-6 py-4">
            <span className="text-sm text-gray-600">
              {formatLastRun(userStory.lastRun)}
            </span>
          </td>
          <td className="px-6 py-4">
            <span className="text-sm text-gray-600">
              {formatDuration(userStory.duration)}
            </span>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center space-x-2">
              {userStory.status === 'running' ? (
                <button className="p-1 hover:bg-gray-100 rounded" title="Stop">
                  <Square className="h-4 w-4 text-red-600" />
                </button>
              ) : (
                <button 
                  onClick={() => onRunTestSuite(userStory.id)}
                  className="p-1 hover:bg-gray-100 rounded" 
                  title="Run"
                >
                  <Play className="h-4 w-4 text-green-600" />
                </button>
              )}
              <button 
                onClick={() => onDownloadReport(userStory.id)}
                className="p-1 hover:bg-gray-100 rounded" 
                title="Download Report"
              >
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded" title="Edit">
                <Edit className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </td>
        </tr>

        {/* Test Cases (when expanded) */}
        {isExpanded && userStory.testCases.map((testCase: any) => renderTestCase(testCase, userStory.id))}
      </React.Fragment>
    );
  };

  const renderTestCase = (testCase: any, parentId: string) => {
    const testCaseId = `${parentId}-${testCase.id}`;
    const isExpanded = expandedItems.has(testCaseId);
    
    return (
      <React.Fragment key={testCaseId}>
        {/* Test Case Row */}
        <tr className="border-b border-gray-100 bg-gray-50 hover:bg-gray-100">
          <td className="px-6 py-3">
            <div className="flex items-center space-x-2 pl-6">
              {testCase.steps && testCase.steps.length > 0 && (
                <button
                  onClick={() => toggleExpanded(testCaseId)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-gray-600" />
                  )}
                </button>
              )}
              <span className="text-sm font-medium text-gray-800">{testCase.id}</span>
            </div>
          </td>
          <td className="px-6 py-3">
            <div className="text-sm text-gray-800">{testCase.name}</div>
            <div className="text-xs text-gray-500 mt-1">{testCase.description}</div>
          </td>
          <td className="px-6 py-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon(testCase.status)}
              <span className={`text-sm ${getStatusColor(testCase.status)}`}>
                {getStatusText(testCase.status)}
              </span>
            </div>
          </td>
          <td className="px-6 py-3">
            <span className="text-sm text-gray-600">
              {formatProgress(testCase.progress)}
            </span>
          </td>
          <td className="px-6 py-3">
            <span className="text-sm text-gray-600">
              {formatLastRun(testCase.lastRun)}
            </span>
          </td>
          <td className="px-6 py-3">
            <span className="text-sm text-gray-600">
              {formatDuration(testCase.duration)}
            </span>
          </td>
          <td className="px-6 py-3">
            <div className="flex items-center space-x-2">
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
                onClick={() => onDownloadReport()}
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
          </td>
        </tr>

        {/* Test Steps (when test case is expanded) */}
        {isExpanded && testCase.steps && testCase.steps.map((step: any) => (
          <tr key={`${testCaseId}-step-${step.id}`} className="border-b border-gray-100 bg-blue-50 hover:bg-blue-100">
            <td className="px-6 py-2">
              <div className="flex items-center space-x-2 pl-12">
                <span className="text-xs font-medium text-gray-700">{step.id}</span>
              </div>
            </td>
            <td className="px-6 py-2">
              <div className="text-xs text-gray-700">{step.description}</div>
            </td>
            <td className="px-6 py-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(step.status)}
                <span className={`text-xs ${getStatusColor(step.status)}`}>
                  {getStatusText(step.status)}
                </span>
              </div>
            </td>
            <td className="px-6 py-2">
              <span className="text-xs text-gray-500">
                {step.progress || '-'}
              </span>
            </td>
            <td className="px-6 py-2">
              <span className="text-xs text-gray-500">
                {formatLastRun(step.lastRun)}
              </span>
            </td>
            <td className="px-6 py-2">
              <span className="text-xs text-gray-500">
                {formatDuration(step.duration)}
              </span>
            </td>
            <td className="px-6 py-2">
              <div className="flex items-center space-x-1">
                <button className="p-1 hover:bg-gray-100 rounded" title="Run Step">
                  <Play className="h-3 w-3 text-green-600" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded" title="Edit Step">
                  <Edit className="h-3 w-3 text-gray-600" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </React.Fragment>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Test Objective
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Run
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {testSuites.map(userStory => renderUserStory(userStory))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface TestSuitesTabProps {
  selectedProjectId: number | null;
  testConfig: {
    isHeadless: boolean;
    browser: string;
  };
}

export function TestSuitesTab({ selectedProjectId, testConfig }: TestSuitesTabProps) {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Removed running executions tracking
  // Removed polling interval - no longer needed

  // SSE Connection Management
  const sseManagerRef = useRef<SSEConnectionManager | null>(null);
  const stepSSEManagerRef = useRef<StepSSEConnectionManager | null>(null);

  const loadTestSuites = async (projectId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await testSuitesApi.getTestSuites(projectId);
      if (response.success) {
        setTestSuites(response.testSuites);
      } else {
        setError('Failed to load test suites');
      }
    } catch (err) {
      setError('Failed to load test suites');
      console.error('Error loading test suites:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle real-time step execution events
  const handleStepExecutionEvent = useCallback((event: StepExecutionEvent) => {
    console.log('[TestSuitesTab] Received Step SSE event:', event.eventType, event.data);

    switch (event.eventType) {
      case 'step_connected':
        console.log('[TestSuitesTab] Step tracking connected successfully');
        break;

      case 'step_started':
        if (event.data.testCaseId && event.data.stepNumber) {
          setTestSuites(prev => prev.map(suite => ({
            ...suite,
            testCases: suite.testCases.map(tc =>
              tc.id === String(event.data.testCaseId)
                ? {
                    ...tc,
                    steps: tc.steps?.map(step =>
                      step.stepNumber === event.data.stepNumber
                        ? { ...step, status: 'running' as const }
                        : step
                    ) || tc.steps
                  }
                : tc
            )
          })));
        }
        break;

      case 'step_completed':
        if (event.data.testCaseId && event.data.stepNumber) {
          setTestSuites(prev => prev.map(suite => ({
            ...suite,
            testCases: suite.testCases.map(tc =>
              tc.id === String(event.data.testCaseId)
                ? {
                    ...tc,
                    steps: tc.steps?.map(step =>
                      step.stepNumber === event.data.stepNumber
                        ? { ...step, status: 'passed' as const }
                        : step
                    ) || tc.steps
                  }
                : tc
            )
          })));
        }
        break;

      case 'step_failed':
        if (event.data.testCaseId && event.data.stepNumber) {
          setTestSuites(prev => prev.map(suite => ({
            ...suite,
            testCases: suite.testCases.map(tc =>
              tc.id === String(event.data.testCaseId)
                ? {
                    ...tc,
                    steps: tc.steps?.map(step =>
                      step.stepNumber === event.data.stepNumber
                        ? { ...step, status: 'failed' as const }
                        : step
                    ) || tc.steps
                  }
                : tc
            )
          })));
        }
        break;

      default:
        console.log('[TestSuitesTab] Unknown step event type:', event.eventType);
    }
  }, []);

  // Handle real-time test execution events
  const handleTestExecutionEvent = useCallback((event: TestExecutionEvent) => {
    console.log('[TestSuitesTab] Received SSE event:', event.eventType, event.data);

    switch (event.eventType) {
      case 'connected':
        console.log('[TestSuitesTab] SSE Connected successfully');
        break;

      case 'test_suite_started':
        if (event.data.userStoryId) {
          setTestSuites(prev => prev.map(suite => 
            suite.id === event.data.userStoryId 
              ? { ...suite, status: 'running' as const }
              : suite
          ));
        }
        break;

      case 'test_case_started':
        if (event.data.testCaseId) {
          setTestSuites(prev => prev.map(suite => ({
            ...suite,
            testCases: suite.testCases.map(tc =>
              tc.id === event.data.testCaseId
                ? { ...tc, status: 'running' as const }
                : tc
            )
          })));
        }
        break;

      case 'test_suite_completed':
        if (event.data.userStoryId && selectedProjectId) {
          // Refresh data to get updated test results
          loadTestSuites(selectedProjectId);
        }
        break;

      case 'test_case_completed':
        if (event.data.testCaseId && selectedProjectId) {
          // Refresh data to get updated test results
          loadTestSuites(selectedProjectId);
        }
        break;

      default:
        console.log('[TestSuitesTab] Unknown event type:', event.eventType);
    }
  }, [selectedProjectId]);

  // Set up SSE connection when project changes
  useEffect(() => {
    if (selectedProjectId) {
      // console.log('[TestSuitesTab] Setting up SSE connection for project:', selectedProjectId);
      
      // Create SSE manager
      sseManagerRef.current = testSuitesApi.createEventStream(selectedProjectId, handleTestExecutionEvent);
      
      // Connect to SSE
      sseManagerRef.current.connect(selectedProjectId, handleTestExecutionEvent);

      // Create Step SSE manager
      stepSSEManagerRef.current = stepTrackingApi.createStepEventStream(selectedProjectId, handleStepExecutionEvent);
      
      // Connect to Step SSE
      stepSSEManagerRef.current.connect(selectedProjectId, handleStepExecutionEvent);
      
      // Load initial data
      loadTestSuites(selectedProjectId);
    } else {
      // Disconnect SSE when no project selected
      if (sseManagerRef.current) {
        console.log('[TestSuitesTab] Disconnecting SSE');
        sseManagerRef.current.disconnect();
        sseManagerRef.current = null;
      }

      // Disconnect Step SSE
      if (stepSSEManagerRef.current) {
        console.log('[TestSuitesTab] Disconnecting Step SSE');
        stepSSEManagerRef.current.disconnect();
        stepSSEManagerRef.current = null;
      }
      
      // Clear data
      setTestSuites([]);
      setError(null);
    }

    // Cleanup on unmount or project change
    return () => {
      if (sseManagerRef.current) {
        console.log('[TestSuitesTab] Cleanup: Disconnecting SSE');
        sseManagerRef.current.disconnect();
        sseManagerRef.current = null;
      }

      if (stepSSEManagerRef.current) {
        console.log('[TestSuitesTab] Cleanup: Disconnecting Step SSE');
        stepSSEManagerRef.current.disconnect();
        stepSSEManagerRef.current = null;
      }
    };
      }, [selectedProjectId, handleTestExecutionEvent, handleStepExecutionEvent]);

  // Remove polling and execution tracking related code since we use SSE now

  const handleRunTestSuite = async (userStoryId: string) => {
    if (!selectedProjectId) {
      console.error('No project selected');
      return;
    }

    try {
      console.log('[TestSuitesTab] Running test suite with configuration:', testConfig);
      
      // Start test execution (SSE will handle real-time updates)
      const result = await testSuitesApi.runTestSuite(selectedProjectId, userStoryId, testConfig);
      
      if (!result.success) {
        setError('Failed to start test suite execution');
        console.error('Test suite start failed:', result.message);
      } else {
        console.log('[TestSuitesTab] Test suite execution started successfully');
        // SSE will handle status updates automatically
      }
      
    } catch (error) {
      console.error('Failed to run test suite:', error);
      setError('Failed to run test suite');
    }
  };

  const handleRunTestCase = async (testCaseId: string) => {
    if (!selectedProjectId) {
      console.error('No project selected');
      return;
    }

    try {
      console.log('[TestSuitesTab] Running test case with configuration:', testConfig);
      
      // Start test execution (SSE will handle real-time updates)
      const result = await testSuitesApi.runTestCase(selectedProjectId, testCaseId, testConfig);
      
      if (!result.success) {
        setError('Failed to start test case execution');
        console.error('Test case start failed:', result.message);
      } else {
        console.log('[TestSuitesTab] Test case execution started successfully');
        // SSE will handle status updates automatically
      }
      
    } catch (error) {
      console.error('Failed to run test case:', error);
      setError('Failed to run test case');
    }
  };

  const handleDownloadReport = async () => {
    if (!selectedProjectId) {
      console.error('No project selected');
      return;
    }

    try {
      await testSuitesApi.downloadLatestReportWithUI(selectedProjectId);
      console.log('Report downloaded successfully');
    } catch (error) {
      console.error('Failed to download report:', error);
      setError('Failed to download report');
    }
  };

  // Show empty state if no project selected
  if (!selectedProjectId) {
    return (
      <div className="w-full bg-white h-full flex flex-col p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Test Suites</h2>
          <p className="text-gray-600 text-sm">
            Manage and execute your test suites. Each User Story contains multiple Test Cases with detailed test steps.
          </p>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Project Selected</h3>
            <p className="text-gray-600 text-sm max-w-sm">
              Please select a project from the Projects tab to view and manage test suites.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white h-full flex flex-col p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Test Suites</h2>
        <p className="text-gray-600 text-sm">
          Manage and execute your test suites for project: <span className="font-medium text-blue-600">{selectedProjectId}</span>
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading test suites...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Test Suites</h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button 
              onClick={() => selectedProjectId && loadTestSuites(selectedProjectId)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      ) : testSuites.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Test Suites Found</h3>
            <p className="text-gray-600 text-sm max-w-sm">
              This project doesn't have any test suites yet. Upload an Excel file with test cases to get started.
            </p>
          </div>
        </div>
      ) : (
        <TestSuitesTable 
          testSuites={testSuites}
          onRunTestSuite={handleRunTestSuite}
          onRunTestCase={handleRunTestCase}
          onDownloadReport={handleDownloadReport}
        />
      )}
    </div>
  );
}
