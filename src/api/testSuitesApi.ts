import apiClient from './apiClient';

const API_URL = '/api/projects';

export interface TestSuite {
    id: string;
    name: string;
    description: string;
    type: 'user_story';
    expanded: boolean;
    status: 'passed' | 'failed' | 'running' | 'blocked' | 'pending';
    progress: {
        completed: number;
        total: number;
    };
    lastRun: string | null;
    duration: string | null;
    testCases: TestCase[];
}

export interface TestCase {
    id: string;
    name: string;
    description: string;
    type: 'test_case';
    expanded: boolean;
    status: 'passed' | 'failed' | 'running' | 'blocked' | 'pending';
    progress: {
        completed: number;
        total: number;
    };
    lastRun: string | null;
    duration: string | null;
    hasSteps: boolean;
    stepCount: number;
    isComplete: boolean;
    steps: TestStep[];
}

export interface TestStep {
    id: number;
    description: string;
    status: 'passed' | 'failed' | 'running' | 'blocked' | 'pending';
    testData?: string;
    expectedResult?: string;
    actualResult?: string;
}

export interface TestSuitesResponse {
    success: boolean;
    testSuites: TestSuite[];
    count: number;
    message?: string;
}

export interface TestCasesResponse {
    success: boolean;
    testCases: TestCase[];
    userStoryId: string;
    message?: string;
}

export interface TestStepsResponse {
    success: boolean;
    testSteps: TestStep[];
    testCaseId: number;
    message?: string;
}

export interface TestConfiguration {
    isHeadless: boolean;
    browser: string;
}

export interface RunTestResponse {
    success: boolean;
    message: string;
    runResult: {
        userStoryId?: string;
        testCaseId?: number;
        status: string;
        startTime: string;
        configuration?: TestConfiguration;
    };
}

export interface TestExecutionResult {
    executionId?: string;
    status: string;
    startTime: string;
    endTime?: string;
    message: string;
    configuration: TestConfiguration;
    async?: boolean;
}

export interface ExecutionStatus {
    found: boolean;
    status?: string;
    startTime?: string;
    endTime?: string;
    output?: string;
    configuration?: TestConfiguration;
    message?: string;
}

export interface TestSuitesStatistics {
    totalStories: number;
    totalTestCases: number;
    statusCounts: {
        passed: number;
        failed: number;
        pending: number;
        not_run: number;
    };
}

export const testSuitesApi = {
    /**
     * Get all test suites (User Stories with Test Cases) for a project
     */
    getTestSuites: async (projectId: number): Promise<TestSuitesResponse> => {
        try {
            const response = await apiClient.get(`${API_URL}/${projectId}/test-suites`);
            return response.data;
        } catch (error) {
            console.error('Error fetching test suites:', error);
            throw error;
        }
    },

    /**
     * Get test cases for a specific user story
     */
    getTestCases: async (projectId: number, userStoryId: string): Promise<TestCasesResponse> => {
        try {
            const response = await apiClient.get(`${API_URL}/${projectId}/test-suites/${userStoryId}/test-cases`);
            return response.data;
        } catch (error) {
            console.error('Error fetching test cases:', error);
            throw error;
        }
    },

    /**
     * Get test steps for a specific test case
     */
    getTestSteps: async (projectId: number, testCaseId: number): Promise<TestStepsResponse> => {
        try {
            const response = await apiClient.get(`${API_URL}/${projectId}/test-suites/test-cases/${testCaseId}/steps`);
            return response.data;
        } catch (error) {
            console.error('Error fetching test steps:', error);
            throw error;
        }
    },

    /**
     * Run a test suite (User Story) with configuration
     */
    runTestSuite: async (projectId: number, userStoryId: string, config?: TestConfiguration): Promise<RunTestResponse> => {
        try {
            const response = await apiClient.post(`${API_URL}/${projectId}/test-suites/${userStoryId}/run`, config);
            return response.data;
        } catch (error) {
            console.error('Error running test suite:', error);
            throw error;
        }
    },

    /**
     * Run a specific test case with configuration
     */
    runTestCase: async (projectId: number, testCaseId: string, config?: TestConfiguration): Promise<RunTestResponse> => {
        try {
            const response = await apiClient.post(`${API_URL}/${projectId}/test-suites/test-cases/${testCaseId}/run`, config);
            return response.data;
        } catch (error) {
            console.error('Error running test case:', error);
            throw error;
        }
    },

    /**
     * Download latest test report for a project
     */
    downloadLatestReport: async (projectId: number): Promise<Blob> => {
        try {
            const response = await apiClient.get(`${API_URL}/${projectId}/test-suites/reports/latest/download`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error downloading test report:', error);
            throw error;
        }
    },

    getExecutionStatus: async (projectId: number, executionId: string): Promise<ExecutionStatus> => {
        try {
            const response = await apiClient.get(`${API_URL}/${projectId}/test-suites/executions/${executionId}/status`);
            return response.data.executionStatus;
        } catch (error) {
            console.error('Error fetching execution status:', error);
            throw error;
        }
    },

    getTestRunStatus: async (projectId: number, testRunId: number): Promise<any> => {
        try {
            const response = await apiClient.get(`${API_URL}/${projectId}/test-suites/test-runs/${testRunId}/status`);
            return response.data.testRunStatus;
        } catch (error) {
            console.error('Error fetching test run status:', error);
            throw error;
        }
    },

    getLatestTestRuns: async (projectId: number): Promise<any> => {
        try {
            const response = await apiClient.get(`${API_URL}/${projectId}/test-suites/test-runs/latest`);
            return response.data;
        } catch (error) {
            console.error('Error fetching latest test runs:', error);
            throw error;
        }
    },

    getTestSuitesStatistics: async (projectId: number): Promise<TestSuitesStatistics> => {
        try {
            const response = await apiClient.get(`${API_URL}/${projectId}/test-suites/statistics`);
            return response.data.statistics;
        } catch (error) {
            console.error('Error fetching test suites statistics:', error);
            throw error;
        }
    },

    downloadLatestReportWithUI: async (projectId: number): Promise<void> => {
        try {
            const response = await apiClient.get(`${API_URL}/${projectId}/test-suites/reports/latest/download`, {
                responseType: 'blob'
            });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Extract filename from response headers or use default
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'test-report.html';
            if (contentDisposition && contentDisposition.includes('filename=')) {
                filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
            }
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading test report:', error);
            throw error;
        }
    },

    // Real-time execution tracking utilities
    pollExecutionStatus: async (
        projectId: number, 
        executionId: string, 
        onStatusUpdate: (status: ExecutionStatus) => void,
        intervalMs: number = 2000,
        maxAttempts: number = 60 // 2 minutes with 2 second intervals
    ): Promise<void> => {
        let attempts = 0;
        
        const poll = async () => {
            try {
                const status = await testSuitesApi.getExecutionStatus(projectId, executionId);
                onStatusUpdate(status);
                
                // Continue polling if test is still running
                if (status.found && status.status === 'RUNNING' && attempts < maxAttempts) {
                    attempts++;
                    setTimeout(poll, intervalMs);
                }
            } catch (error) {
                console.error('Error polling execution status:', error);
                onStatusUpdate({
                    found: false,
                    message: 'Failed to get execution status'
                });
            }
        };
        
        // Start polling
        poll();
    },

    // Start execution and return polling function
    startTestSuiteWithPolling: async (
        projectId: number,
        userStoryId: string,
        config: TestConfiguration,
        onStatusUpdate: (status: ExecutionStatus) => void
    ): Promise<{ executionId: string; result: RunTestResponse }> => {
        const result = await testSuitesApi.runTestSuite(projectId, userStoryId, config);
        
        // Extract execution ID from result (we'll need to modify backend to return this)
        const executionId = `${projectId}_${userStoryId}_${Date.now()}`;
        
        // Start polling for status updates
        testSuitesApi.pollExecutionStatus(projectId, executionId, onStatusUpdate);
        
        return { executionId, result };
    },

    startTestCaseWithPolling: async (
        projectId: number,
        testCaseId: string,
        config: TestConfiguration,
        onStatusUpdate: (status: ExecutionStatus) => void
    ): Promise<{ executionId: string; result: RunTestResponse }> => {
        const result = await testSuitesApi.runTestCase(projectId, testCaseId, config);
        
        // Extract execution ID from result
        const executionId = `${projectId}_TC_${testCaseId}_${Date.now()}`;
        
        // Start polling for test runs (database-based polling)
        testSuitesApi.pollLatestTestRuns(projectId, testCaseId, onStatusUpdate);
        
        return { executionId, result };
    },

    // Poll latest test runs to find test case execution status
    pollLatestTestRuns: async (
        projectId: number,
        testCaseId: string,
        onStatusUpdate: (status: ExecutionStatus) => void,
        intervalMs: number = 3000,
        maxAttempts: number = 40 // 2 minutes with 3 second intervals
    ): Promise<void> => {
        let attempts = 0;
        
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
                    // Convert database status to ExecutionStatus format
                    const status: ExecutionStatus = {
                        found: true,
                        status: relevantRun.status, // RUNNING, COMPLETED, FAILED
                        startTime: relevantRun.startTime,
                        endTime: relevantRun.endTime,
                        output: `Test run ID: ${relevantRun.id}`,
                        configuration: relevantRun.parameters
                    };
                    
                    onStatusUpdate(status);
                    
                    // Continue polling if test is still running
                    if (relevantRun.status === 'RUNNING' && attempts < maxAttempts) {
                        attempts++;
                        setTimeout(poll, intervalMs);
                    } else if (relevantRun.status === 'COMPLETED' || relevantRun.status === 'FAILED') {
                        console.log(`✅ Test polling completed. Final status: ${relevantRun.status}`);
                    }
                } else if (attempts < maxAttempts) {
                    // Test run not found yet, keep polling
                    attempts++;
                    setTimeout(poll, intervalMs);
                } else {
                    // Max attempts reached
                    onStatusUpdate({
                        found: false,
                        message: 'Test run not found after polling timeout'
                    });
                }
            } catch (error) {
                console.error('Error polling latest test runs:', error);
                onStatusUpdate({
                    found: false,
                    message: 'Failed to poll test run status'
                });
            }
        };
        
        // Start polling after a short delay to allow test run creation
        setTimeout(poll, 1000);
    }
}; 