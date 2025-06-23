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

export interface RunTestResponse {
    success: boolean;
    message: string;
    runResult: {
        userStoryId?: string;
        testCaseId?: number;
        status: string;
        startTime: string;
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
     * Run a test suite (User Story)
     */
    runTestSuite: async (projectId: number, userStoryId: string): Promise<RunTestResponse> => {
        try {
            const response = await apiClient.post(`${API_URL}/${projectId}/test-suites/${userStoryId}/run`);
            return response.data;
        } catch (error) {
            console.error('Error running test suite:', error);
            throw error;
        }
    },

    /**
     * Run a specific test case
     */
    runTestCase: async (projectId: number, testCaseId: number): Promise<RunTestResponse> => {
        try {
            const response = await apiClient.post(`${API_URL}/${projectId}/test-suites/test-cases/${testCaseId}/run`);
            return response.data;
        } catch (error) {
            console.error('Error running test case:', error);
            throw error;
        }
    },

    /**
     * Get test suites statistics for a project
     */
    getTestSuitesStatistics: async (projectId: number): Promise<{
        success: boolean;
        statistics: {
            totalStories: number;
            totalTestCases: number;
            passedCount: number;
            failedCount: number;
            pendingCount: number;
            notRunCount: number;
        };
        message?: string;
    }> => {
        try {
            const response = await apiClient.get(`${API_URL}/${projectId}/test-suites/statistics`);
            return response.data;
        } catch (error) {
            console.error('Error fetching test suites statistics:', error);
            throw error;
        }
    }
}; 