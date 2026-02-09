import React, { useState, useEffect, useRef } from "react";
import { BarChart3, AlertTriangle, Loader, Plus } from 'lucide-react';
import { testSuitesApi, TestSuite } from '../../../api/testSuitesApi';
import { TestSuitesTable } from '../../Shared/Tables/TestSuitesTable';
import { useToast } from '../../../components/ui/UseToast';
// Excel viewer styles for consistent look
import "../../../styles/dashboard/excel-viewer/excel-viewer.css";
import "../../../styles/dashboard/excel-viewer/sheet-tabs.css";

// Test Suites API integration complete - using real data from database

interface TestSuitesTabProps {
  selectedProjectId: number | null;
  testConfig: {
    isHeadless: boolean;
    browser: string;
  };
}

export function TestSuitesTab({ selectedProjectId, testConfig }: TestSuitesTabProps) {
  const { toast } = useToast();
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  /** Current step (1-based) per test case id for live step progress */
  const [currentStepByTestCaseId, setCurrentStepByTestCaseId] = useState<Record<string, number>>({});
  /** Live step results (duration, lastRun) as steps complete during run */
  const [stepResultsLive, setStepResultsLive] = useState<Record<string, Record<number, { durationMs: number; lastRun: string }>>>({});
  /** When we added each test to runningTests (ms), so we don't remove due to stale SSE/poll */
  const runStartedAtRef = useRef<Record<string, number>>({});

  const loadTestSuites = async (projectId: number, options?: { silent?: boolean }) => {
    const silent = options?.silent === true;
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      const response = await testSuitesApi.getTestSuites(projectId);
      if (response.success && response.testSuites) {
        setTestSuites(response.testSuites);
      } else if (!silent) {
        setError('Failed to load test suites');
      }
    } catch (err) {
      console.error('Error loading test suites:', err);
      if (!silent) setError('Error loading test suites');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Set up SSE connection for real-time updates (use backend URL so events are received)
  const sseBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081';
  useEffect(() => {
    if (!selectedProjectId) return;

    const eventSource = new EventSource(`${sseBaseUrl}/api/projects/${selectedProjectId}/test-suites/events`);
    
    const handleTestComplete = async (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received test completion event:', data);
        
        // Remove from running tests and clear current step for this test
        if (data.testCaseId) {
          // Only clear if this completion is for the run we started (avoid stale SSE from previous run)
          const ourStart = runStartedAtRef.current[data.testCaseId];
          const eventEnd = data.endTime ? new Date(data.endTime).getTime() : 0;
          if (ourStart != null && eventEnd > 0 && eventEnd < ourStart) return; // stale event from before we started
          delete runStartedAtRef.current[data.testCaseId];
          setRunningTests(prev => {
            const next = new Set(prev);
            next.delete(data.testCaseId);
            return next;
          });
          setCurrentStepByTestCaseId(prev => {
            const next = { ...prev };
            delete next[data.testCaseId];
            return next;
          });
          setStepResultsLive(prev => {
            const next = { ...prev };
            delete next[data.testCaseId];
            return next;
          });
        }
        
        // Show popup notification so user sees the result immediately
        const passed = data.success === true;
        const durationSec = data.duration != null ? (typeof data.duration === 'number' ? (data.duration / 1000).toFixed(1) : data.duration) : '—';
        toast({
          title: passed ? 'Test passed' : 'Test failed',
          description: `${data.testCaseId || 'Test'} completed in ${durationSec}s. ${passed ? 'All steps passed.' : 'Check the report for details.'}`,
        });
        
        // Refresh data without showing loader so expanded menus stay open
        await loadTestSuites(selectedProjectId, { silent: true });
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
  }, [selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId) {
      loadTestSuites(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Listen to step events for live step-by-step progress and live duration/lastRun
  useEffect(() => {
    const handleStepEvent = (e: Event) => {
      const { eventType, data } = (e as CustomEvent).detail || {};
      const tcStr = data?.testCaseIdStr;
      if (!tcStr) return;
      // US_02/US_03 use composite run key (e.g. US_02-TC01); backend sends testCaseIdStr "TC01". Match so live updates apply to the right row.
      const runningKey = Object.keys(runStartedAtRef.current).find((k) => k === tcStr || k.endsWith('-' + tcStr)) ?? tcStr;
      if (eventType === 'step_started' && data.stepNumber != null) {
        setCurrentStepByTestCaseId((prev) => ({ ...prev, [runningKey]: data.stepNumber }));
      } else if (eventType === 'step_completed' || eventType === 'step_failed') {
        if (data.stepNumber != null) {
          setCurrentStepByTestCaseId((prev) => ({ ...prev, [runningKey]: data.stepNumber + 1 }));
          const durationMs = typeof data.duration === 'number' ? data.duration : 0;
          const lastRun = data.endTime ? new Date(data.endTime).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '') : new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '');
          setStepResultsLive((prev) => ({
            ...prev,
            [runningKey]: {
              ...(prev[runningKey] || {}),
              [data.stepNumber]: { durationMs, lastRun },
            },
          }));
        }
      }
    };
    window.addEventListener('globalStepSSEEvent', handleStepEvent);
    return () => window.removeEventListener('globalStepSSEEvent', handleStepEvent);
  }, []);

  const pollTestStatus = async (projectId: number, testCaseId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes with 2-second intervals
    
    const poll = async () => {
      try {
        const response = await testSuitesApi.getLatestTestRuns(projectId);
        const testRuns = response.testRuns || [];
        
        // Find newest run for this test case (list is newest first)
        const relevantRun = testRuns.find((run: any) => {
          const params = run.parameters || {};
          return params.testCaseId === testCaseId;
        });

        if (relevantRun && (relevantRun.status === 'COMPLETED' || relevantRun.status === 'FAILED')) {
          // Only treat as "our" run after we've been polling a few times (backend creates TestRun async; first polls may see old run)
          const runStart = relevantRun.startTime || relevantRun.createdAt;
          const ourStart = runStartedAtRef.current[testCaseId];
          const isOurRun = ourStart != null && runStart && new Date(runStart).getTime() >= ourStart - 5000;
          if (attempts >= 2 || isOurRun) {
            delete runStartedAtRef.current[testCaseId];
            await loadTestSuites(projectId, { silent: true });
            setRunningTests(prev => {
              const next = new Set(prev);
              next.delete(testCaseId);
              return next;
            });
            setCurrentStepByTestCaseId(prev => {
              const next = { ...prev };
              delete next[testCaseId];
              return next;
            });
            setStepResultsLive(prev => {
              const next = { ...prev };
              delete next[testCaseId];
              return next;
            });
            return;
          }
        }

        // Continue polling if not complete or not yet our run
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 2000);
        }
      } catch (error) {
        console.error('Error polling test status:', error);
      }
    };

    // Start polling
    poll();
  };

  const handleRunTestSuite = async (userStoryId: string) => {
    if (!selectedProjectId) return;
    const userStory = testSuites.find(us => us.id === userStoryId);
    const testCaseIds = userStory?.testCases?.map(tc => tc.id) ?? [];
    if (testCaseIds.length > 0) {
      const now = Date.now();
      testCaseIds.forEach(id => { runStartedAtRef.current[id] = now; });
      setRunningTests(prev => {
        const next = new Set(prev);
        testCaseIds.forEach(id => next.add(id));
        return next;
      });
    }
    try {
      const response = await testSuitesApi.runTestSuite(selectedProjectId, userStoryId, testConfig);
      if (!response.success) {
        if (testCaseIds.length > 0) {
          testCaseIds.forEach(id => delete runStartedAtRef.current[id]);
          setRunningTests(prev => {
            const next = new Set(prev);
            testCaseIds.forEach(id => next.delete(id));
            return next;
          });
        }
        console.error('Failed to start test suite execution');
        return;
      }
      testCaseIds.forEach(id => pollTestStatus(selectedProjectId, id));
    } catch (err) {
      if (testCaseIds.length > 0) {
        testCaseIds.forEach(id => delete runStartedAtRef.current[id]);
        setRunningTests(prev => {
          const next = new Set(prev);
          testCaseIds.forEach(id => next.delete(id));
          return next;
        });
      }
      console.error('Error running test suite:', err);
    }
  };

  const handleRunTestCase = async (testCaseId: string) => {
    if (!selectedProjectId) return;
    // Optimistic update: show "running" and stop button immediately so UI never sticks on play
    runStartedAtRef.current[testCaseId] = Date.now();
    setRunningTests(prev => {
      const next = new Set(prev);
      next.add(testCaseId);
      return next;
    });
    try {
      const response = await testSuitesApi.runTestCase(selectedProjectId, testCaseId, testConfig);
      if (!response.success) {
        delete runStartedAtRef.current[testCaseId];
        setRunningTests(prev => {
          const next = new Set(prev);
          next.delete(testCaseId);
          return next;
        });
        console.error('Failed to start test case execution');
        return;
      }
      pollTestStatus(selectedProjectId, testCaseId);
    } catch (err) {
      delete runStartedAtRef.current[testCaseId];
      setRunningTests(prev => {
        const next = new Set(prev);
        next.delete(testCaseId);
        return next;
      });
      console.error('Error running test case:', err);
    }
  };

  const handleStopTestCase = (testCaseId: string) => {
    delete runStartedAtRef.current[testCaseId];
    setRunningTests(prev => {
      const next = new Set(prev);
      next.delete(testCaseId);
      return next;
    });
    setCurrentStepByTestCaseId(prev => {
      const next = { ...prev };
      delete next[testCaseId];
      return next;
    });
    setStepResultsLive(prev => {
      const next = { ...prev };
      delete next[testCaseId];
      return next;
    });
  };

  const handleStopTestSuite = (userStoryId: string) => {
    const suite = testSuites.find(s => s.id === userStoryId);
    if (suite?.testCases) {
      suite.testCases.forEach((tc: { id: string }) => {
        delete runStartedAtRef.current[tc.id];
      });
      setRunningTests(prev => {
        const next = new Set(prev);
        suite.testCases.forEach((tc: { id: string }) => next.delete(tc.id));
        return next;
      });
      setCurrentStepByTestCaseId(prev => {
        const next = { ...prev };
        suite.testCases.forEach((tc: { id: string }) => delete next[tc.id]);
        return next;
      });
      setStepResultsLive(prev => {
        const next = { ...prev };
        suite.testCases.forEach((tc: { id: string }) => delete next[tc.id]);
        return next;
      });
    }
  };

  const handleDownloadReport = async (userStoryId?: string) => {
    if (!selectedProjectId) return;
    
    try {
      await testSuitesApi.downloadLatestReportWithUI(selectedProjectId);
      // Handle report download
      console.log('Report downloaded successfully');
    } catch (err) {
      console.error('Error downloading report:', err);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="h-[72px] px-8 border-b flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Test Suites</h1>
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Test Suite
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden px-8 pt-8 pb-8">
        <div className="w-full overflow-auto max-h-[calc(100vh-300px)]">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center space-x-4">
                <Loader className="w-6 h-6 text-blue-600 animate-spin" />
                <span className="text-gray-600">Loading test suites...</span>
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
              onStopTestCase={handleStopTestCase}
              onStopTestSuite={handleStopTestSuite}
              onDownloadReport={handleDownloadReport}
              runningTests={runningTests}
              currentStepByTestCaseId={currentStepByTestCaseId}
              stepResultsLive={stepResultsLive}
            />
          )}
        </div>
      </div>
    </div>
  );
}
