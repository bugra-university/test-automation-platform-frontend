// Mock test run data for email-like interface
export interface TestRun {
  id: string;
  type: 'user_story' | 'test_case';
  title: string;
  description: string;
  userStoryId?: string;
  testCaseId?: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  trigger: 'manual' | 'schedule' | 'api';
  triggerBy: string;
  duration: string;
  timestamp: string;
  testCases?: string[];
  results: {
    passed: number;
    failed: number;
    skipped: number;
    total: number;
  };
  currentStep?: string;
  error?: string;
  children?: TestRun[];
}

export const mockTestRuns: TestRun[] = [
  {
    id: "us01",
    type: "user_story",
    title: "US01 - User registration to the Site (Customer)",
    description: "Complete user registration functionality for customers including validation scenarios and edge cases",
    userStoryId: "US01",
    status: "failed",
    trigger: "manual",
    triggerBy: "Test Team",
    duration: "8m 45s",
    timestamp: "2024-01-27T14:30:00Z",
    testCases: ["TC01", "TC02", "TC03", "TC04", "TC05", "TC06"],
    results: {
      passed: 4,
      failed: 2,
      skipped: 0,
      total: 6
    },
    children: [
      {
        id: "us01-tc01",
        type: "test_case",
        title: "TC01 - Sign up when all areas are filled",
        description: "Positive scenario: Verify successful user registration when all required fields are properly filled",
        testCaseId: "TC01",
        userStoryId: "US01",
        status: "passed",
        trigger: "manual",
        triggerBy: "Test Team",
        duration: "1m 15s",
        timestamp: "2024-01-27T14:30:30Z",
        results: {
          passed: 1,
          failed: 0,
          skipped: 0,
          total: 1
        }
      },
      {
        id: "us01-tc02",
        type: "test_case",
        title: "TC02 - No registration without filling the password space",
        description: "Negative scenario: Verify that registration fails when password field is empty",
        testCaseId: "TC02",
        userStoryId: "US01",
        status: "passed",
        trigger: "manual",
        triggerBy: "Test Team",
        duration: "50s",
        timestamp: "2024-01-27T14:31:45Z",
        results: {
          passed: 1,
          failed: 0,
          skipped: 0,
          total: 1
        }
      },
      {
        id: "us01-tc03",
        type: "test_case",
        title: "TC03 - Sign up by adding a user domain symbol",
        description: "Test registration with special domain symbols in email address",
        testCaseId: "TC03",
        userStoryId: "US01",
        status: "passed",
        trigger: "manual",
        triggerBy: "Test Team",
        duration: "1m 10s",
        timestamp: "2024-01-27T14:32:35Z",
        results: {
          passed: 1,
          failed: 0,
          skipped: 0,
          total: 1
        }
      },
      {
        id: "us01-tc04",
        type: "test_case",
        title: "TC04 - No registration without filling the email area",
        description: "Negative scenario: Verify that registration fails when email field is empty",
        testCaseId: "TC04",
        userStoryId: "US01",
        status: "failed",
        trigger: "manual",
        triggerBy: "Test Team",
        duration: "45s",
        timestamp: "2024-01-27T14:33:50Z",
        results: {
          passed: 0,
          failed: 1,
          skipped: 0,
          total: 1
        },
        error: "Email validation error not displayed properly"
      },
      {
        id: "us01-tc05",
        type: "test_case",
        title: "TC05 - The email field @ no registration is done",
        description: "Negative scenario: Verify registration fails when email is missing @ symbol",
        testCaseId: "TC05",
        userStoryId: "US01",
        status: "passed",
        trigger: "manual",
        triggerBy: "Test Team",
        duration: "55s",
        timestamp: "2024-01-27T14:34:45Z",
        results: {
          passed: 1,
          failed: 0,
          skipped: 0,
          total: 1
        }
      },
      {
        id: "us01-tc06",
        type: "test_case",
        title: "TC06 - Registration without adding .com to the email field",
        description: "Negative scenario: Verify registration fails when email is missing domain extension",
        testCaseId: "TC06",
        userStoryId: "US01",
        status: "failed",
        trigger: "manual",
        triggerBy: "Test Team",
        duration: "1m 05s",
        timestamp: "2024-01-27T14:35:50Z",
        results: {
          passed: 0,
          failed: 1,
          skipped: 0,
          total: 1
        },
        error: "Domain validation not working for incomplete domains"
      }
    ]
  },
  {
    id: "us02",
    type: "user_story",
    title: "US02 - Site registration with previously registered information",
    description: "The site should not be registered with the previously registered information (Register)",
    userStoryId: "US02",
    status: "passed",
    trigger: "schedule",
    triggerBy: "Auto Scheduler",
    duration: "3m 20s",
    timestamp: "2024-01-27T13:15:00Z",
    testCases: ["TC01", "TC02"],
    results: {
      passed: 2,
      failed: 0,
      skipped: 0,
      total: 2
    },
    children: [
      {
        id: "us02-tc01",
        type: "test_case",
        title: "TC01 - Duplicate email registration prevention",
        description: "Verify that system prevents registration with already existing email address",
        testCaseId: "TC01",
        userStoryId: "US02",
        status: "passed",
        trigger: "schedule",
        triggerBy: "Auto Scheduler",
        duration: "1m 45s",
        timestamp: "2024-01-27T13:15:30Z",
        results: {
          passed: 1,
          failed: 0,
          skipped: 0,
          total: 1
        }
      },
      {
        id: "us02-tc02",
        type: "test_case",
        title: "TC02 - Duplicate username prevention",
        description: "Verify that system prevents registration with already existing username",
        testCaseId: "TC02",
        userStoryId: "US02",
        status: "passed",
        trigger: "schedule",
        triggerBy: "Auto Scheduler",
        duration: "1m 35s",
        timestamp: "2024-01-27T13:17:05Z",
        results: {
          passed: 1,
          failed: 0,
          skipped: 0,
          total: 1
        }
      }
    ]
  },
  {
    id: "us03",
    type: "user_story",
    title: "US03 - User Billing Address Management",
    description: "User Billing Address functionality (My Account - Addresses - Billing Address)",
    userStoryId: "US03",
    status: "running",
    trigger: "manual",
    triggerBy: "Sarah Tester",
    duration: "2m 35s",
    timestamp: "2024-01-27T12:00:00Z",
    testCases: ["TC01", "TC02"],
    results: {
      passed: 1,
      failed: 0,
      skipped: 0,
      total: 2
    },
    currentStep: "Testing billing address validation and save functionality",
    children: [
      {
        id: "us03-tc01",
        type: "test_case",
        title: "TC01 - Add new billing address",
        description: "Verify user can successfully add a new billing address with all required fields",
        testCaseId: "TC01",
        userStoryId: "US03",
        status: "passed",
        trigger: "manual",
        triggerBy: "Sarah Tester",
        duration: "1m 20s",
        timestamp: "2024-01-27T12:00:30Z",
        results: {
          passed: 1,
          failed: 0,
          skipped: 0,
          total: 1
        }
      },
      {
        id: "us03-tc02",
        type: "test_case",
        title: "TC02 - Edit existing billing address",
        description: "Verify user can edit and update existing billing address information",
        testCaseId: "TC02",
        userStoryId: "US03",
        status: "running",
        trigger: "manual",
        triggerBy: "Sarah Tester",
        duration: "1m 15s",
        timestamp: "2024-01-27T12:01:50Z",
        results: {
          passed: 0,
          failed: 0,
          skipped: 0,
          total: 1
        },
        currentStep: "Validating address update functionality"
      }
    ]
  },
  {
    id: "us04",
    type: "user_story",
    title: "US04 - User Shipping Addresses Management",
    description: "User Shipping Addresses (Detail Address) functionality (My Account - Addresses - Shipping Address)",
    userStoryId: "US04",
    status: "passed",
    trigger: "schedule",
    triggerBy: "Auto Scheduler",
    duration: "4m 15s",
    timestamp: "2024-01-27T11:00:00Z",
    testCases: ["TC01", "TC02", "TC03"],
    results: {
      passed: 3,
      failed: 0,
      skipped: 0,
      total: 3
    },
    children: [
      {
        id: "us04-tc01",
        type: "test_case",
        title: "TC01 - Add shipping address",
        description: "Verify user can add new shipping address with complete details",
        testCaseId: "TC01",
        userStoryId: "US04",
        status: "passed",
        trigger: "schedule",
        triggerBy: "Auto Scheduler",
        duration: "1m 30s",
        timestamp: "2024-01-27T11:00:30Z",
        results: {
          passed: 1,
          failed: 0,
          skipped: 0,
          total: 1
        }
      },
      {
        id: "us04-tc02",
        type: "test_case",
        title: "TC02 - Set default shipping address",
        description: "Verify user can set a shipping address as default for orders",
        testCaseId: "TC02",
        userStoryId: "US04",
        status: "passed",
        trigger: "schedule",
        triggerBy: "Auto Scheduler",
        duration: "1m 20s",
        timestamp: "2024-01-27T11:02:00Z",
        results: {
          passed: 1,
          failed: 0,
          skipped: 0,
          total: 1
        }
      },
      {
        id: "us04-tc03",
        type: "test_case",
        title: "TC03 - Delete shipping address",
        description: "Verify user can delete non-default shipping addresses",
        testCaseId: "TC03",
        userStoryId: "US04",
        status: "passed",
        trigger: "schedule",
        triggerBy: "Auto Scheduler",
        duration: "1m 25s",
        timestamp: "2024-01-27T11:03:20Z",
        results: {
          passed: 1,
          failed: 0,
          skipped: 0,
          total: 1
        }
      }
    ]
  },
  {
    id: "us05",
    type: "user_story",
    title: "US05 - User Account Details Management",
    description: "User Account Details functionality for managing personal information and account settings",
    userStoryId: "US05",
    status: "pending",
    trigger: "manual",
    triggerBy: "QA Team",
    duration: "0m 00s",
    timestamp: "2024-01-27T10:00:00Z",
    testCases: ["TC01", "TC02"],
    results: {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 2
    },
    children: [
      {
        id: "us05-tc01",
        type: "test_case",
        title: "TC01 - Update personal information",
        description: "Verify user can update personal information like name, phone number",
        testCaseId: "TC01",
        userStoryId: "US05",
        status: "pending",
        trigger: "manual",
        triggerBy: "QA Team",
        duration: "0m 00s",
        timestamp: "2024-01-27T10:00:00Z",
        results: {
          passed: 0,
          failed: 0,
          skipped: 0,
          total: 1
        }
      },
      {
        id: "us05-tc02",
        type: "test_case",
        title: "TC02 - Change password functionality",
        description: "Verify user can successfully change account password with proper validation",
        testCaseId: "TC02",
        userStoryId: "US05",
        status: "pending",
        trigger: "manual",
        triggerBy: "QA Team",
        duration: "0m 00s",
        timestamp: "2024-01-27T10:00:00Z",
        results: {
          passed: 0,
          failed: 0,
          skipped: 0,
          total: 1
        }
      }
    ]
  }
];

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'passed':
      return '✅';
    case 'failed':
      return '❌';
    case 'running':
      return '🔄';
    case 'pending':
      return '⏳';
    default:
      return '⚪';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'passed':
      return 'text-green-600';
    case 'failed':
      return 'text-red-600';
    case 'running':
      return 'text-blue-600';
    case 'pending':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
  }
};

export const formatDuration = (duration: string) => {
  return duration;
};

export const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString();
}; 