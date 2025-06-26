// Mock test report data based on actual ExtentReport files
export interface TestReport {
  id: string;
  fileName: string;
  title: string;
  description: string;
  testCase: string;
  status: 'passed' | 'failed' | 'mixed';
  passedCount: number;
  totalCount: number;
  executedAt: string;
  fileSize: string;
  duration: string;
  testDetails: {
    testName: string;
    startTime: string;
    endTime: string;
    steps: number;
  };
}

export const mockTestReports: TestReport[] = [
  {
    id: "report_1",
    fileName: "extentReport__01_56_15_25062025.html",
    title: "US_01 - User Registration",
    description: "User registration to the Site (Customer) (Register)",
    testCase: "TC01: Sign up when all areas are filled correctly",
    status: "passed",
    passedCount: 1,
    totalCount: 1,
    executedAt: "2025-06-25 01:56:15",
    fileSize: "14KB",
    duration: "10s+567ms",
    testDetails: {
      testName: "Kullanıcı kaydı",
      startTime: "Jun 25, 2025 01:56:15 AM",
      endTime: "Jun 25, 2025 01:56:26 AM",
      steps: 7
    }
  },
  {
    id: "report_2", 
    fileName: "extentReport__04_13_13_25062025.html",
    title: "US_02 - Invalid User Registration",
    description: "Invalid new user registration (Register)",
    testCase: "TC01: Registration with invalid email format",
    status: "failed",
    passedCount: 0,
    totalCount: 2,
    executedAt: "2025-06-25 04:13:13",
    fileSize: "15KB",
    duration: "8s+234ms",
    testDetails: {
      testName: "Geçersiz kullanıcı kaydı",
      startTime: "Jun 25, 2025 04:13:13 AM", 
      endTime: "Jun 25, 2025 04:13:21 AM",
      steps: 5
    }
  },
  {
    id: "report_3",
    fileName: "extentReport__03_39_29_25062025.html", 
    title: "US_03 - Billing Address Management",
    description: "Adding comprehensive billing address functionality with validation",
    testCase: "TC01: Add billing address with valid data including validation",
    status: "mixed",
    passedCount: 3,
    totalCount: 5,
    executedAt: "2025-06-25 03:39:29",
    fileSize: "15KB", 
    duration: "15s+891ms",
    testDetails: {
      testName: "Fatura adresi ekleme",
      startTime: "Jun 25, 2025 03:39:29 AM",
      endTime: "Jun 25, 2025 03:39:44 AM", 
      steps: 8
    }
  },
  {
    id: "report_4",
    fileName: "extentReport__04_58_57_25062025.html",
    title: "US_06 - Product Comparison",
    description: "Compare products functionality for better user experience",
    testCase: "TC01: Compare multiple products side by side successfully",
    status: "passed",
    passedCount: 4,
    totalCount: 4,
    executedAt: "2025-06-25 04:58:57",
    fileSize: "15KB",
    duration: "12s+456ms",
    testDetails: {
      testName: "Ürün karşılaştırma",
      startTime: "Jun 25, 2025 04:58:57 AM",
      endTime: "Jun 25, 2025 04:59:09 AM",
      steps: 6
    }
  },
  {
    id: "report_5", 
    fileName: "extentReport__02_32_04_25062025.html",
    title: "US_08 - Shopping Cart Operations",
    description: "Shopping cart add, remove and update functionality",
    testCase: "TC02: Add multiple items and update quantities",
    status: "failed",
    passedCount: 2,
    totalCount: 6,
    executedAt: "2025-06-25 02:32:04",
    fileSize: "15KB",
    duration: "18s+123ms",
    testDetails: {
      testName: "Alışveriş sepeti işlemleri",
      startTime: "Jun 25, 2025 02:32:04 AM",
      endTime: "Jun 25, 2025 02:32:22 AM",
      steps: 9
    }
  },
  {
    id: "report_6",
    fileName: "extentReport__06_39_23_24062025.html", 
    title: "US_12 - Vendor Management",
    description: "Vendor registration and product management system",
    testCase: "TC01: Vendor sign in and product addition process",
    status: "passed",
    passedCount: 3,
    totalCount: 3,
    executedAt: "2024-06-24 06:39:23",
    fileSize: "12KB",
    duration: "9s+678ms",
    testDetails: {
      testName: "Satıcı yönetimi",
      startTime: "Jun 24, 2024 06:39:23 AM",
      endTime: "Jun 24, 2024 06:39:32 AM",
      steps: 4
    }
  },
  {
    id: "report_7",
    fileName: "extentReport__01_04_42_27092023.html",
    title: "US_18 - User Profile Management", 
    description: "User profile update and account settings management",
    testCase: "TC03: Update profile information and verify changes",
    status: "mixed",
    passedCount: 5,
    totalCount: 7,
    executedAt: "2023-09-27 01:04:42",
    fileSize: "15KB",
    duration: "14s+789ms",
    testDetails: {
      testName: "Kullanıcı profil yönetimi",
      startTime: "Sep 27, 2023 01:04:42 AM",
      endTime: "Sep 27, 2023 01:04:56 AM", 
      steps: 10
    }
  },
  {
    id: "report_8",
    fileName: "extentReport__04_36_01_25062025.html",
    title: "US_20 - Payment Processing",
    description: "Complete payment flow with different payment methods",
    testCase: "TC01: Process payment with credit card successfully", 
    status: "passed",
    passedCount: 6,
    totalCount: 6,
    executedAt: "2025-06-25 04:36:01",
    fileSize: "12KB",
    duration: "16s+234ms",
    testDetails: {
      testName: "Ödeme işlemi",
      startTime: "Jun 25, 2025 04:36:01 AM",
      endTime: "Jun 25, 2025 04:36:17 AM",
      steps: 8
    }
  }
];

export const getReportsByStatus = (status: 'passed' | 'failed' | 'mixed') => {
  return mockTestReports.filter(report => report.status === status);
};

export const getReportById = (id: string) => {
  return mockTestReports.find(report => report.id === id);
};

export const getTotalReportsCount = () => mockTestReports.length;

export const getStatusCounts = () => {
  const passed = mockTestReports.filter(r => r.status === 'passed').length;
  const failed = mockTestReports.filter(r => r.status === 'failed').length; 
  const mixed = mockTestReports.filter(r => r.status === 'mixed').length;
  
  return { passed, failed, mixed, total: mockTestReports.length };
}; 