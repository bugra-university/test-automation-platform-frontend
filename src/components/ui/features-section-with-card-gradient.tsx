import React, { useState } from "react";
import { cn } from "../../lib/utils";
import { Grid } from "./grid";
import { mockTestReports, TestReport } from "../../data/mockReports";

interface GridItem {
  title: string;
  description: string;
  testCase?: string;
  status?: 'passed' | 'failed' | 'mixed';
  passedCount?: number;
  totalCount?: number;
  executedAt?: string;
  isTestReport?: boolean;
  skeleton?: boolean;
}

export function FeaturesSectionWithCardGradient() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleActionClick = (e: React.MouseEvent, action: string, report: TestReport) => {
    e.stopPropagation();
    console.log(`${action} action for report:`, report.fileName);
    // TODO: Implement actual actions
  };

  const formatExecutionTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Convert mock reports to grid format
  const reportCards: GridItem[] = mockTestReports.slice(0, 8).map(report => ({
    title: report.title,
    description: report.description,
    testCase: report.testCase,
    status: report.status,
    passedCount: report.passedCount,
    totalCount: report.totalCount,
    executedAt: formatExecutionTime(report.executedAt),
    isTestReport: true
  }));

  // Static feature cards for remaining slots
  const staticFeatures: GridItem[] = [
    {
      title: "Real-time Test Monitoring",
      description: "Monitor your test executions in real-time with live updates and progress tracking.",
      skeleton: true,
    },
    {
      title: "Advanced Test Analytics", 
      description: "Get detailed insights into test performance, trends, and failure patterns.",
      skeleton: true,
    },
    {
      title: "Test Scheduling",
      description: "Schedule automated test runs at specific times or intervals.",
      skeleton: true,
    },
    {
      title: "Team Collaboration",
      description: "Share test results and collaborate with your team members effectively.",
      skeleton: true,
    },
  ];

  // Combine all cards
  const grid = [...reportCards, ...staticFeatures];

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 md:gap-2 max-w-7xl mx-auto">
        {grid.map((feature, idx) => (
          <div
            key={feature.isTestReport ? `report-${idx}` : `static-${idx}`}
            className="relative bg-gradient-to-b dark:from-neutral-900 from-neutral-100 dark:to-neutral-950 to-white p-6 rounded-3xl overflow-hidden hover:transform hover:-translate-y-1 transition-all duration-200 cursor-pointer h-72 flex flex-col"
            onClick={() => setSelectedCard(selectedCard === feature.title ? null : feature.title)}
          >
            <Grid size={20} />
            <div className="flex-1 flex flex-col">
              <p className="text-base font-bold text-neutral-800 dark:text-white relative z-20 truncate">
                {feature.title}
              </p>

              {feature.isTestReport ? (
                <>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-2 text-sm font-medium relative z-20 overflow-hidden" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {feature.description}
                  </p>
                  <p className="text-neutral-500 dark:text-neutral-500 mt-2 text-sm font-normal relative z-20 flex-1 overflow-hidden" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {feature.testCase}
                  </p>

                  {/* Status Badge and Date */}
                  <div className="mt-4 flex items-center justify-between relative z-20">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      feature.status === 'passed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : feature.status === 'failed'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {feature.status === 'passed' ? '✅' : feature.status === 'failed' ? '❌' : '⚠️'} 
                      {feature.status === 'passed' ? 'Passed' : feature.status === 'failed' ? 'Failed' : 'Mixed'} 
                      ({feature.passedCount}/{feature.totalCount})
                    </span>
                    <span className="text-neutral-500 dark:text-neutral-400 text-xs font-medium">
                      {feature.executedAt}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-neutral-600 dark:text-neutral-400 mt-4 text-base font-normal relative z-20 overflow-hidden" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {feature.description}
                </p>
              )}
            </div>

            {/* Action Bar */}
            {selectedCard === feature.title && feature.isTestReport && (
              <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-4 rounded-b-3xl animate-in slide-in-from-bottom-2 duration-200 z-30">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const report = mockTestReports[idx];
                      if (report) handleActionClick(e, 'view', report);
                    }}
                    className="report-action-btn inline-flex items-center gap-1 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300 rounded-full text-xs font-semibold transition-colors"
                    style={{ padding: '4px 12px !important', height: 'auto !important', borderRadius: '9999px !important' }}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const report = mockTestReports[idx];
                      if (report) handleActionClick(e, 'download', report);
                    }}
                    className="report-action-btn inline-flex items-center gap-1 bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-600 dark:hover:bg-neutral-500 text-neutral-600 dark:text-neutral-300 rounded-full text-xs font-semibold transition-colors"
                    style={{ padding: '4px 12px !important', height: 'auto !important', borderRadius: '9999px !important' }}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const report = mockTestReports[idx];
                      if (report) handleActionClick(e, 'delete', report);
                    }}
                    className="report-action-btn inline-flex items-center gap-1 bg-neutral-400 hover:bg-neutral-500 dark:bg-neutral-500 dark:hover:bg-neutral-400 text-neutral-600 dark:text-neutral-300 rounded-full text-xs font-semibold transition-colors"
                    style={{ padding: '4px 12px !important', height: 'auto !important', borderRadius: '9999px !important' }}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const grid: GridItem[] = [
  {
    title: "US_01 - User Registration",
    description:
      "User registration to the Site (Customer) (Register)",
    testCase: "TC01: Sign up when all areas are filled",
    status: "passed",
    passedCount: 12,
    totalCount: 15,
    executedAt: "2024-01-15 14:30",
    isTestReport: true,
  },
  {
    title: "US_02 - Invalid User Registration",
    description:
      "Invalid new user registration (Register)",
    testCase: "TC01: Registration with invalid email format",
    status: "failed",
    passedCount: 8,
    totalCount: 12,
    executedAt: "2024-01-15 15:45",
    isTestReport: true,
  },
  {
    title: "US_03 - Billing Address Management System",
    description:
      "Adding comprehensive billing address functionality with validation, multiple address support, and integration with payment systems for seamless user experience",
    testCase: "TC01: Add billing address with valid data including street address, city, state, postal code, and country validation with proper error handling and user feedback mechanisms",
    status: "mixed",
    passedCount: 18,
    totalCount: 22,
    executedAt: "2024-01-15 16:20",
    isTestReport: true,
  },
  {
    title: "US_06 - Product Comparison",
    description:
      "Compare products functionality",
    testCase: "TC01: Compare multiple products side by side",
    status: "passed",
    passedCount: 25,
    totalCount: 25,
    executedAt: "2024-01-15 17:10",
    isTestReport: true,
  },
  {
    title: "Cross-browser Testing",
    description:
      "Execute tests across different browsers and platforms to ensure compatibility and consistent user experience.",
  },
  {
    title: "Test Case Management",
    description:
      "Organize and manage your test cases efficiently with our comprehensive test case management system.",
  },
  {
    title: "Integration Support",
    description:
      "Seamlessly integrate with your existing CI/CD pipeline and development tools for streamlined testing workflows.",
  },
  {
    title: "Team Collaboration",
    description:
      "Work collaboratively with your team using our built-in collaboration tools, allowing you to share results and provide feedback.",
  },
]; 