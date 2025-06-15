export interface TestSuite {
    id: number;
    name: string;
    description: string;
    projectId: number;
    createdAt: string;
    updatedAt: string;
    testCases: TestCase[];
}

export interface TestCase {
    id: number;
    name: string;
    description: string;
    testSuiteId: number;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    status: 'ACTIVE' | 'INACTIVE' | 'DEPRECATED';
    createdAt: string;
    updatedAt: string;
    steps: TestStep[];
}

export interface TestStep {
    id: number;
    order: number;
    action: string;
    expectedResult: string;
    testCaseId: number;
}

export interface TestRun {
    id: number;
    name: string;
    testSuiteId: number;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    startTime: string;
    endTime: string | null;
    results: TestResult[];
}

export interface TestResult {
    id: number;
    testCaseId: number;
    testRunId: number;
    status: 'PASSED' | 'FAILED' | 'SKIPPED' | 'BLOCKED';
    errorMessage?: string;
    screenshotUrl?: string;
    startTime: string;
    endTime: string;
}

export interface Report {
    id: number;
    name: string;
    type: 'TEST_RUN' | 'TEST_SUITE' | 'PROJECT';
    format: 'PDF' | 'HTML' | 'CSV';
    dateRange: {
        startDate: string;
        endDate: string;
    };
    status: 'GENERATED' | 'FAILED';
    url?: string;
    createdAt: string;
}
