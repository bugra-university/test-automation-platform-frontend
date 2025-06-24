import React, { useState, useEffect, useCallback } from "react";
import { Play, Square, BarChart3, Edit, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { testSuitesApi, TestSuite, ExecutionStatus } from '../../../api/testSuitesApi';

// Test Suites API integration complete - using real data from database

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

interface ExecutionTracker {
  executionId: string;
  type: 'test_suite' | 'test_case';
  targetId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  output?: string;
}

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
              {userStory.progress.completed}/{userStory.progress.total}
            </span>
          </td>
          <td className="px-6 py-4">
            <span className="text-sm text-gray-600">
              {userStory.lastRun || 'Never'}
            </span>
          </td>
          <td className="px-6 py-4">
            <span className="text-sm text-gray-600">
              {userStory.duration || '-'}
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
              {testCase.progress.completed}/{testCase.progress.total}
            </span>
          </td>
          <td className="px-6 py-3">
            <span className="text-sm text-gray-600">
              {testCase.lastRun || 'Never'}
            </span>
          </td>
          <td className="px-6 py-3">
            <span className="text-sm text-gray-600">
              {testCase.duration || '-'}
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
              <span className="text-xs text-gray-500">-</span>
            </td>
            <td className="px-6 py-2">
              <span className="text-xs text-gray-500">-</span>
            </td>
            <td className="px-6 py-2">
              <span className="text-xs text-gray-500">-</span>
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
  const [runningExecutions, setRunningExecutions] = useState<Map<string, ExecutionTracker>>(new Map());

  const loadTestSuites = async (projectId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await testSuitesApi.getTestSuites(projectId);
      if (response.success) {
        setTestSuites(response.testSuites);
      } else {
        setError(response.message || 'Failed to load test suites');
      }
    } catch (error) {
      console.error('Error loading test suites:', error);
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      loadTestSuites(selectedProjectId);
    } else {
      // No project selected - clear data
      setTestSuites([]);
      setError(null);
    }
  }, [selectedProjectId]);

  const addExecution = useCallback((executionId: string, type: 'test_suite' | 'test_case', targetId: string) => {
    const execution: ExecutionTracker = {
      executionId,
      type,
      targetId,
      status: 'running',
      startTime: new Date()
    };
    
    setRunningExecutions(prev => new Map(prev.set(executionId, execution)));
  }, []);

  const updateExecution = useCallback((executionId: string, status: ExecutionStatus) => {
    setRunningExecutions(prev => {
      const newMap = new Map(prev);
      const execution = newMap.get(executionId);
      
      if (execution) {
        execution.status = status.status === 'COMPLETED' ? 'completed' : 
                          status.status === 'FAILED' ? 'failed' : 'running';
        execution.output = status.output;
        
        if (status.endTime) {
          execution.endTime = new Date(status.endTime);
        }
        
        // Remove from tracking if completed
        if (execution.status !== 'running') {
          setTimeout(() => {
            setRunningExecutions(current => {
              const updated = new Map(current);
              updated.delete(executionId);
              return updated;
            });
          }, 5000); // Remove after 5 seconds
        }
      }
      
      return newMap;
    });
  }, []);

  const handleRunTestSuite = async (userStoryId: string) => {
    if (!selectedProjectId) {
      console.error('No project selected');
      return;
    }

    try {
      console.log('Running test suite with configuration:', testConfig);
      
      // Start execution with polling
      const { executionId, result } = await testSuitesApi.startTestSuiteWithPolling(
        selectedProjectId,
        userStoryId,
        testConfig,
        (status) => updateExecution(executionId, status)
      );
      
      // Add to tracking
      addExecution(executionId, 'test_suite', userStoryId);
      
      console.log('Test suite execution started:', { executionId, result });
      
      // Update UI immediately to show "running" status
      setTestSuites(prev => prev.map(suite => 
        suite.id === userStoryId 
          ? { ...suite, status: 'running' as const }
          : suite
      ));
      
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
      console.log('Running test case with configuration:', testConfig);
      
      // Start execution with polling
      const { executionId, result } = await testSuitesApi.startTestCaseWithPolling(
        selectedProjectId,
        testCaseId,
        testConfig,
        (status) => updateExecution(executionId, status)
      );
      
      // Add to tracking
      addExecution(executionId, 'test_case', testCaseId);
      
      console.log('Test case execution started:', { executionId, result });
      
      // Update UI immediately to show "running" status
      setTestSuites(prev => prev.map(suite => ({
        ...suite,
        testCases: suite.testCases.map(tc =>
          tc.id === testCaseId
            ? { ...tc, status: 'running' as const }
            : tc
        )
      })));
      
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

  const getExecutionStatus = (targetId: string, type: 'test_suite' | 'test_case') => {
    for (const execution of Array.from(runningExecutions.values())) {
      if (execution.targetId === targetId && execution.type === type) {
        return execution;
      }
    }
    return null;
  };

  const renderExecutionStatus = (execution: ExecutionTracker | null) => {
    if (!execution) return null;
    
    const duration = execution.endTime 
      ? `${Math.round((execution.endTime.getTime() - execution.startTime.getTime()) / 1000)}s`
      : `${Math.round((new Date().getTime() - execution.startTime.getTime()) / 1000)}s`;

    return (
      <div className="flex items-center gap-2 text-xs">
        {execution.status === 'running' && (
          <div className="flex items-center gap-1 text-blue-600">
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Running ({duration})</span>
          </div>
        )}
        {execution.status === 'completed' && (
          <div className="flex items-center gap-1 text-green-600">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span>Completed ({duration})</span>
          </div>
        )}
        {execution.status === 'failed' && (
          <div className="flex items-center gap-1 text-red-600">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span>Failed ({duration})</span>
          </div>
        )}
      </div>
    );
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
