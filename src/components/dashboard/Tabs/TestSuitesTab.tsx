import React, { useState, useEffect } from "react";
import { BarChart3, AlertTriangle, Loader, Plus } from 'lucide-react';
import { testSuitesApi, TestSuite } from '../../../api/testSuitesApi';
import { TestSuitesTable } from '../../Shared/Tables/TestSuitesTable';
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
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());

  const loadTestSuites = async (projectId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await testSuitesApi.getTestSuites(projectId);
      if (response.success && response.testSuites) {
        setTestSuites(response.testSuites);
      } else {
        setError('Failed to load test suites');
      }
    } catch (err) {
      console.error('Error loading test suites:', err);
      setError('Error loading test suites');
    } finally {
      setLoading(false);
    }
  };

  // Set up SSE connection for real-time updates
  useEffect(() => {
    if (!selectedProjectId) return;

    const eventSource = new EventSource(`/api/projects/${selectedProjectId}/events`);
    
    const handleTestComplete = async (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received test completion event:', data);
        
        // Remove from running tests
        if (data.testCaseId) {
          setRunningTests(prev => {
            const next = new Set(prev);
            next.delete(data.testCaseId);
            return next;
          });
        }
        
        // Refresh test suites data
        await loadTestSuites(selectedProjectId);
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

  const pollTestStatus = async (projectId: number, testCaseId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes with 2-second intervals
    
    const poll = async () => {
      try {
        const response = await testSuitesApi.getLatestTestRuns(projectId);
        const testRuns = response.testRuns || [];
        
        // Find test run for this test case
        const relevantRun = testRuns.find((run: any) => {
          const params = run.parameters || {};
          return params.testCaseId === testCaseId;
        });

        if (relevantRun) {
          if (relevantRun.status === 'COMPLETED' || relevantRun.status === 'FAILED') {
            // Test finished - refresh data and stop polling
            await loadTestSuites(projectId);
            setRunningTests(prev => {
              const next = new Set(prev);
              next.delete(testCaseId);
              return next;
            });
            return;
          }
        }

        // Continue polling if not complete and not exceeded max attempts
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
    
    try {
      const response = await testSuitesApi.runTestSuite(selectedProjectId, userStoryId, testConfig);
      if (response.success) {
        // Mark all test cases in this suite as running
        const userStory = testSuites.find(us => us.id === userStoryId);
        if (userStory?.testCases) {
          const testCaseIds = userStory.testCases.map(tc => tc.id);
          setRunningTests(prev => {
            const next = new Set(prev);
            testCaseIds.forEach(id => next.add(id));
            return next;
          });
          
          // Start polling for each test case
          testCaseIds.forEach(id => {
            pollTestStatus(selectedProjectId, id);
          });
        }
      } else {
        console.error('Failed to start test suite execution');
      }
    } catch (err) {
      console.error('Error running test suite:', err);
    }
  };

  const handleRunTestCase = async (testCaseId: string) => {
    if (!selectedProjectId) return;
    
    try {
      const response = await testSuitesApi.runTestCase(selectedProjectId, testCaseId, testConfig);
      if (response.success) {
        // Mark test case as running
        setRunningTests(prev => {
          const next = new Set(prev);
          next.add(testCaseId);
          return next;
        });
        
        // Start polling for status
        pollTestStatus(selectedProjectId, testCaseId);
      } else {
        console.error('Failed to start test case execution');
      }
    } catch (err) {
      console.error('Error running test case:', err);
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
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
              onDownloadReport={handleDownloadReport}
              runningTests={runningTests}
            />
          )}
        </div>
      </div>
    </div>
  );
}
