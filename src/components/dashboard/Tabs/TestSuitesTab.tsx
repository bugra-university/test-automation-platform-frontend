import React, { useState, useEffect, useCallback, useRef } from "react";
import { Play, Square, BarChart3, Edit, ChevronDown, ChevronRight, AlertTriangle, Download, CheckCircle, XCircle, Clock, Loader, Plus } from 'lucide-react';
import { testSuitesApi, TestSuite, ExecutionStatus, TestExecutionEvent, SSEConnectionManager } from '../../../api/testSuitesApi';
import { stepTrackingApi, StepExecutionEvent, StepSSEConnectionManager } from '../../../api/stepTrackingApi';
import { TestSuitesTable } from '../../Shared/Tables/TestSuitesTable';
// Excel viewer styles for consistent look
import "../../../styles/dashboard/excel-viewer/excel-viewer.css";
import "../../../styles/dashboard/excel-viewer/sheet-tabs.css";

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
  const sseManager = useRef<SSEConnectionManager | null>(null);
  const stepSSEManager = useRef<StepSSEConnectionManager | null>(null);

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

  useEffect(() => {
    if (selectedProjectId) {
      loadTestSuites(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleRunTestSuite = async (userStoryId: string) => {
    if (!selectedProjectId) return;
    
    try {
      const response = await testSuitesApi.runTestSuite(selectedProjectId, userStoryId, testConfig);
      if (!response.success) {
        console.error('Failed to start test suite execution');
      }
      // Execution status will be updated via SSE
    } catch (err) {
      console.error('Error running test suite:', err);
    }
  };

  const handleRunTestCase = async (testCaseId: string) => {
    if (!selectedProjectId) return;
    
    try {
      const response = await testSuitesApi.runTestCase(selectedProjectId, testCaseId, testConfig);
      if (!response.success) {
        console.error('Failed to start test case execution');
      }
      // Execution status will be updated via SSE
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
          />
        )}
      </div>
    </div>
  );
}
