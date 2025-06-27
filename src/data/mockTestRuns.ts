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
    title: "US01 - Kullanıcı Kayıt Sistemi",
    description: "User registration to the Site (Customer) including email validation and profile setup with comprehensive testing scenarios",
    userStoryId: "US01",
    status: "passed",
    trigger: "schedule",
    triggerBy: "Auto Scheduler",
    duration: "2m 45s",
    timestamp: "2024-01-27T14:30:00Z",
    testCases: ["TC01", "TC02", "TC03"],
    results: {
      passed: 3,
      failed: 0,
      skipped: 0,
      total: 3
    },
    children: [
      {
        id: "us01-tc01",
        type: "test_case",
        title: "TC01_KullaniciKaydiYapilabilmeli",
        description: "Sign up when all areas are filled correctly with valid email and password requirements",
        testCaseId: "TC01",
        userStoryId: "US01",
        status: "passed",
        trigger: "schedule",
        triggerBy: "Auto Scheduler",
        duration: "45s",
        timestamp: "2024-01-27T14:30:15Z",
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
        title: "TC02_GecersizYeniKullaniciKayit",
        description: "Invalid new user registration scenarios including invalid email formats and weak passwords",
        testCaseId: "TC02",
        userStoryId: "US01",
        status: "passed",
        trigger: "schedule",
        triggerBy: "Auto Scheduler",
        duration: "1m 10s",
        timestamp: "2024-01-27T14:31:00Z",
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
        title: "TC03_BillingAdressEkle",
        description: "Adding comprehensive billing address functionality with validation and country selection",
        testCaseId: "TC03",
        userStoryId: "US01",
        status: "passed",
        trigger: "schedule",
        triggerBy: "Auto Scheduler",
        duration: "50s",
        timestamp: "2024-01-27T14:32:10Z",
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
    id: "us02",
    type: "user_story",
    title: "US02 - Login İşlemleri",
    description: "User login functionality with authentication and session management including validation scenarios",
    userStoryId: "US02",
    status: "failed",
    trigger: "manual",
    triggerBy: "John Developer",
    duration: "1m 20s",
    timestamp: "2024-01-27T13:15:00Z",
    testCases: ["TC01", "TC02"],
    results: {
      passed: 1,
      failed: 1,
      skipped: 0,
      total: 2
    },
    children: [
      {
        id: "us02-tc01",
        type: "test_case",
        title: "TC01_ValidLogin",
        description: "Valid user login with correct credentials and session establishment",
        testCaseId: "TC01",
        userStoryId: "US02",
        status: "passed",
        trigger: "manual",
        triggerBy: "John Developer",
        duration: "45s",
        timestamp: "2024-01-27T13:14:00Z",
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
        title: "TC02_LoginValidationFailed",
        description: "Login validation with invalid credentials and error handling",
        testCaseId: "TC02",
        userStoryId: "US02",
        status: "failed",
        trigger: "manual",
        triggerBy: "John Developer",
        duration: "35s",
        timestamp: "2024-01-27T13:15:00Z",
        results: {
          passed: 0,
          failed: 1,
          skipped: 0,
          total: 1
        },
        error: "Element not found: #password-field - The password input field was not located on the login page"
      }
    ]
  },
  {
    id: "us03",
    type: "user_story",
    title: "US03 - Kullanıcı Profil Güncelleme",
    description: "Currently executing user profile update functionality with validation and email verification steps",
    userStoryId: "US03",
    status: "running",
    trigger: "manual",
    triggerBy: "Sarah Tester",
    duration: "0m 35s",
    timestamp: "2024-01-27T12:00:00Z",
    testCases: ["TC01"],
    results: {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 1
    },
    currentStep: "User profile validation step - Verifying user credentials and data updates",
    children: [
      {
        id: "us03-tc01",
        type: "test_case",
        title: "TC01_UserProfileUpdate",
        description: "Update user profile information with email validation and profile setup steps",
        testCaseId: "TC01",
        userStoryId: "US03",
        status: "running",
        trigger: "manual",
        triggerBy: "Sarah Tester",
        duration: "0m 35s",
        timestamp: "2024-01-27T12:00:00Z",
        results: {
          passed: 0,
          failed: 0,
          skipped: 0,
          total: 1
        },
        currentStep: "Profile validation step - Verifying user credentials and session management"
      }
    ]
  },
  {
    id: "us06",
    type: "user_story",
    title: "US06 - Ürün Karşılaştırma",
    description: "Product comparison functionality enabling users to compare multiple products side by side with detailed specifications",
    userStoryId: "US06",
    status: "failed",
    trigger: "schedule",
    triggerBy: "Auto Scheduler",
    duration: "3m 12s",
    timestamp: "2024-01-27T11:45:00Z",
    testCases: ["TC01", "TC02", "TC03", "TC04"],
    results: {
      passed: 2,
      failed: 2,
      skipped: 0,
      total: 4
    },
    children: [
      {
        id: "us06-tc01",
        type: "test_case",
        title: "TC01_CompareMultipleProducts",
        description: "Compare multiple products side by side successfully with price and feature comparison",
        testCaseId: "TC01",
        userStoryId: "US06",
        status: "passed",
        trigger: "schedule",
        triggerBy: "Auto Scheduler",
        duration: "45s",
        timestamp: "2024-01-27T11:45:15Z",
        results: {
          passed: 1,
          failed: 0,
          skipped: 0,
          total: 1
        }
      },
      {
        id: "us06-tc02",
        type: "test_case",
        title: "TC02_ProductDetailsComparison",
        description: "Detailed product specification and feature comparison functionality",
        testCaseId: "TC02",
        userStoryId: "US06",
        status: "failed",
        trigger: "schedule",
        triggerBy: "Auto Scheduler",
        duration: "1m 25s",
        timestamp: "2024-01-27T11:46:00Z",
        results: {
          passed: 0,
          failed: 1,
          skipped: 0,
          total: 1
        },
        error: "Comparison table did not load properly - Missing product specifications data"
      }
    ]
  },
  {
    id: "us08",
    type: "user_story", 
    title: "US08 - Alışveriş Sepeti İşlemleri",
    description: "Shopping cart operations including add, remove, update quantities and checkout process with payment integration",
    userStoryId: "US08",
    status: "running",
    trigger: "manual",
    triggerBy: "Mike Tester",
    duration: "1m 15s",
    timestamp: "2024-01-27T10:30:00Z",
    testCases: ["TC01", "TC02", "TC03"],
    results: {
      passed: 1,
      failed: 0,
      skipped: 0,
      total: 3
    },
    currentStep: "Adding products to cart and validating quantity updates",
    children: [
      {
        id: "us08-tc01",
        type: "test_case",
        title: "TC01_AddProductsToCart",
        description: "Add multiple products to shopping cart with different quantities and variants",
        testCaseId: "TC01",
        userStoryId: "US08",
        status: "passed",
        trigger: "manual",
        triggerBy: "Mike Tester",
        duration: "35s",
        timestamp: "2024-01-27T10:30:15Z",
        results: {
          passed: 1,
          failed: 0,
          skipped: 0,
          total: 1
        }
      },
      {
        id: "us08-tc02",
        type: "test_case",
        title: "TC02_UpdateCartQuantities",
        description: "Update product quantities in shopping cart and verify total calculations",
        testCaseId: "TC02",
        userStoryId: "US08",
        status: "running",
        trigger: "manual",
        triggerBy: "Mike Tester",
        duration: "40s",
        timestamp: "2024-01-27T10:30:50Z",
        results: {
          passed: 0,
          failed: 0,
          skipped: 0,
          total: 1
        },
        currentStep: "Validating cart total calculation after quantity updates"
      }
    ]
  }
];

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'passed': return '✅';
    case 'failed': return '❌';
    case 'running': return '🔄';
    case 'pending': return '⏳';
    default: return '⚪';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'passed': return 'text-green-600';
    case 'failed': return 'text-red-600';
    case 'running': return 'text-blue-600';
    case 'pending': return 'text-yellow-600';
    default: return 'text-gray-600';
  }
};

export const formatDuration = (duration: string) => {
  return duration;
};

export const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
}; 