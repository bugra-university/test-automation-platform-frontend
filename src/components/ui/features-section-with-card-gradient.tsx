import React, { useState, useEffect } from "react";
import { cn } from "../../lib/utils";
import { Grid } from "./grid";
import { getAllReports, downloadReport, viewReport, deleteReport, TestReport } from "../../api/reportApi";
import AlertDelete from "../dashboard/Alert/AlertDelete";

interface GridItem {
  title: string;
  description: string;
  testCase?: string;
  status?: 'passed' | 'failed' | 'mixed';
  passedCount?: number;
  totalCount?: number;
  executedAt?: string;
  isTestReport?: boolean;
  reportId?: string;
}

export function FeaturesSectionWithCardGradient() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [reports, setReports] = useState<TestReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Delete alert state
  const [deleteAlert, setDeleteAlert] = useState({
    isOpen: false,
    reportId: '',
    reportTitle: '',
    isDeleting: false
  });

  // Load reports on component mount
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllReports();
      setReports(data);
    } catch (err) {
      setError('Failed to load test reports');
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = async (e: React.MouseEvent, action: string, reportId: string) => {
    e.stopPropagation();
    
    try {
      switch (action) {
        case 'view':
          await viewReport(reportId);
          break;
        case 'download':
          await downloadReport(reportId);
          break;
        case 'delete':
          // Find report title for the alert
          const report = reports.find(r => r.id === reportId);
          setDeleteAlert({
            isOpen: true,
            reportId: reportId,
            reportTitle: report?.title || 'Unknown Report',
            isDeleting: false
          });
          break;
      }
    } catch (err) {
      console.error(`Error ${action} report:`, err);
      alert(`Failed to ${action} report. Please try again.`);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteAlert(prev => ({ ...prev, isDeleting: true }));
      await deleteReport(deleteAlert.reportId);
      
      // Reload reports after deletion
      await loadReports();
      setSelectedCard(null);
      
      // Close delete alert
      setDeleteAlert({
        isOpen: false,
        reportId: '',
        reportTitle: '',
        isDeleting: false
      });
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Failed to delete report. Please try again.');
      setDeleteAlert(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteAlert({
      isOpen: false,
      reportId: '',
      reportTitle: '',
      isDeleting: false
    });
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

  // Convert API reports to grid format - sadece gerçek raporlar
  const reportCards: GridItem[] = reports.map(report => ({
    title: report.title,
    description: report.description,
    testCase: report.testCase,
    status: report.status,
    passedCount: report.passedCount,
    totalCount: report.totalCount,
    executedAt: formatExecutionTime(report.executedAt),
    isTestReport: true,
    reportId: report.id
  }));

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Loading test reports...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button 
              onClick={loadReports}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (reportCards.length === 0) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-neutral-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">No test reports found</p>
            <p className="text-neutral-500 dark:text-neutral-500 text-sm mt-2">Run some tests to generate reports</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 md:gap-2 max-w-7xl mx-auto">
          {reportCards.map((feature, idx) => (
            <div
              key={`report-${feature.reportId}`}
              className="relative bg-gradient-to-b dark:from-neutral-900 from-neutral-100 dark:to-neutral-950 to-white p-6 rounded-3xl overflow-hidden hover:transform hover:-translate-y-1 transition-all duration-200 cursor-pointer h-72 flex flex-col"
              onClick={() => setSelectedCard(selectedCard === feature.reportId ? null : feature.reportId || null)}
            >
              <Grid size={20} />
              <div className="flex-1 flex flex-col">
                <p className="text-neutral-800 dark:text-white relative z-20 truncate" style={{ fontSize: '1rem', fontWeight: '600' }}>
                  {feature.title}
                </p>

                <p className="text-neutral-600 dark:text-neutral-400 mt-2 relative z-20 overflow-hidden" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  {feature.description}
                </p>
                <p className="text-neutral-500 dark:text-neutral-500 mt-2 relative z-20 flex-1 overflow-hidden" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  fontSize: '0.85rem',
                  fontWeight: '400'
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
              </div>

              {/* Action Bar - sadece seçili kart için göster */}
              {selectedCard === feature.reportId && feature.reportId && (
                <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-4 rounded-b-3xl animate-in slide-in-from-bottom-2 duration-200 z-30">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => handleActionClick(e, 'view', feature.reportId!)}
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
                      onClick={(e) => handleActionClick(e, 'download', feature.reportId!)}
                      className="report-action-btn inline-flex items-center gap-1 bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-600 dark:hover:bg-neutral-500 text-neutral-600 dark:text-neutral-300 rounded-full text-xs font-semibold transition-colors"
                      style={{ padding: '4px 12px !important', height: 'auto !important', borderRadius: '9999px !important' }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </button>
                    <button
                      onClick={(e) => handleActionClick(e, 'delete', feature.reportId!)}
                      className="report-action-btn inline-flex items-center gap-1 bg-delete hover:bg-delete/80 dark:bg-delete dark:hover:bg-delete/80 text-delete-foreground dark:text-delete-foreground rounded-full text-xs font-semibold transition-colors"
                      style={{ padding: '4px 12px !important', height: 'auto !important', borderRadius: '9999px !important' }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 0 00-1 1v3M4 7h16" />
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

      {/* Delete Confirmation Alert */}
      <AlertDelete
        isOpen={deleteAlert.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={deleteAlert.reportTitle}
        isDeleting={deleteAlert.isDeleting}
        type="report"
      />
    </>
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