import apiClient from './apiClient';

const API_URL = '/api';

export interface TestResultDTO {
    id: string;
    testCaseId: string;
    testRunId: string;
    status: 'PASS' | 'FAIL' | 'RUNNING' | 'PENDING';
    startTime: string;
    endTime: string;
    durationMs: number;
    errorMessage?: string;
    stackTrace?: string;
}

export interface TestRunDTO {
    id: string;
    projectId: string;
    status: string;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    startTime: string;
    endTime?: string;
}

export interface TestCaseDTO {
    id: string;
    suiteId: string;
    name: string;
    description?: string;
    className: string;
    methodName: string;
    totalRuns: number;
    successCount: number;
    failureCount: number;
}

const testApi = {
    getAllTestResults: () => apiClient.get<TestResultDTO[]>(`${API_URL}/test-results`),
    getTestResultsByRun: (testRunId: string) => apiClient.get<TestResultDTO[]>(`${API_URL}/test-results/test-run/${testRunId}`),
    getTestResultsByCase: (testCaseId: string) => apiClient.get<TestResultDTO[]>(`${API_URL}/test-results/test-case/${testCaseId}`),

    getAllTestRuns: () => apiClient.get<TestRunDTO[]>(`${API_URL}/test-runs`),
    getActiveTestRuns: () => apiClient.get<TestRunDTO[]>(`${API_URL}/test-runs/active`),
    createTestRun: (testRun: Partial<TestRunDTO>) => apiClient.post<TestRunDTO>(`${API_URL}/test-runs`, testRun),
    updateTestRunStatus: (id: string, status: string) => apiClient.put<TestRunDTO>(`${API_URL}/test-runs/${id}/status`, status), stopTestRun: (id: string) => apiClient.delete(`${API_URL}/test-runs/${id}`),

    getAllTestCases: () => apiClient.get<TestCaseDTO[]>(`${API_URL}/test-cases`),
    getTestCasesBySuite: (suiteId: string) => apiClient.get<TestCaseDTO[]>(`${API_URL}/test-cases/suite/${suiteId}`),
};

export default testApi;
