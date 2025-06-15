import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TestSuitesTab } from "../components/dashboard/Tabs/TestSuitesTab";
import { RunTestsTab } from "../components/dashboard/Tabs/RunTestsTab";
import { TestCasesTab } from "../components/dashboard/Tabs/TestCasesTab";
import { TestRunsTab } from "../components/dashboard/Tabs/TestRunsTab";
import { ReportsTab } from "../components/dashboard/Tabs/ReportsTab";
import { SchedulesTab } from "../components/dashboard/Tabs/SchedulesTab";
import { toast } from "../components/ui/UseToast";
import { mockApis } from "../data/mockData";
import FlagPreloader from "../utils/flagPreloader";

import {
  Dialog,
  DialogContent,
} from "../components/ui/dialog";

import "../styles/dashboard/tabs/test-dashboard.css";
import "../styles/dashboard/tabs/run-tests.css";
import "../styles/Layout/container-headers.css";


// Define the Test type (previously Api type)
interface Test {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  businessFunction: string;
  status: string; // "running" | "stopped" | "degraded" -> "passed" | "failed" | "skipped"
  environment: string; // "production" | "qa" | "development" -> "Chrome" | "Firefox" | "Safari" 
  cached: boolean;
  version: string;
  deprecated: boolean;
  apiFamily?: string;  // could be renamed to testSuite
  collectionId?: string;
  lastUpdatedDate: string;
  [key: string]: any; // For other properties
}

interface TestSuite {
  name: string;
  tests: Test[];
}

// Helper function to group Tests by suite
const groupTestsBySuite = (tests: any[]): TestSuite[] => {
  const suites: Record<string, TestSuite> = {};

  tests.forEach((test) => {
    // Use the apiFamily field or businessFunction as fallback
    const suite = test.apiFamily || test.businessFunction;

    if (!suites[suite]) {
      suites[suite] = {
        name: suite,
        tests: []
      };
    }
    suites[suite].tests.push(test);
  });

  return Object.values(suites);
};

// Badge and progress bar styles are now in api-dashboard.css

interface TestDashboardProps {
  activeTabFromHeader?: string;
  showTable?: boolean;
  setShowTable?: (show: boolean) => void;
  setCurrentFileName?: (fileName: string) => void;
  currentFile?: File | null;
  setCurrentFile?: (file: File | null) => void;
  isExcelEditMode?: boolean;
  setIsExcelEditMode?: (editMode: boolean) => void;
  lastSaveInfo?: {
    status: 'success' | 'error' | null;
    timestamp: Date | null;
    message?: string;
  };  setLastSaveInfo?: (saveInfo: {
    status: 'success' | 'error' | null;
    timestamp: Date | null;
    message?: string;
  }) => void;
}

export default function TestDashboard({ 
  activeTabFromHeader, 
  showTable, 
  setShowTable, 
  setCurrentFileName: externalSetCurrentFileName,
  currentFile,
  setCurrentFile,
  isExcelEditMode,
  setIsExcelEditMode,
  lastSaveInfo,
  setLastSaveInfo
}: TestDashboardProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string | null>(null);  
  const [filterEnvironment, setFilterEnvironment] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("run-tests");
  
  // Create a local state for current file name if not provided externally
  const [localCurrentFileName, setLocalCurrentFileName] = useState<string>("");
  // Use external setter if provided, otherwise use local setter
  const setCurrentFileName = externalSetCurrentFileName || setLocalCurrentFileName;
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [dialogContent, setDialogContent] = useState<React.ReactNode | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Update activeTab when activeTabFromHeader changes
  useEffect(() => {
    if (activeTabFromHeader) {
      setActiveTab(activeTabFromHeader);
    }
  }, [activeTabFromHeader]);

  // Using the existing mockApis data as test data
  const filteredTests = mockApis.filter((test) => {
    if (filterStatus && test.status !== filterStatus) return false;
    if (filterEnvironment && test.environment !== filterEnvironment) return false;
    if (
      searchQuery &&
      !test.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !test.businessFunction.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });


  const handleMetricsPreview = async () => {
    try {
      const response = await fetch('/TestOutput/reports/test_metrics.csv');
      const csvText = await response.text();
      
      // Convert CSV to readable format for preview
      const lines = csvText.split('\n').slice(0, 10); // Show first 10 lines
      const preview = lines.map(line => line.split(','));
      
      setDialogContent(
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Test Metrics Preview</h3>
          <div className="max-h-[400px] overflow-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  {preview[0]?.map((header, i) => (
                    <th key={i} className="px-4 py-2 border">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(1).map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-2 border">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
      setDialogOpen(true);
    } catch (error) {
      console.error('Error loading metrics preview:', error);
      toast({
        title: "Error",
        description: "Failed to load metrics preview. Please try again."
      });
    }
  };  const renderActiveTab = () => {
    switch (activeTab) {      
      case "test-suites":
        return <TestSuitesTab />;      
      case "run-tests":
        // We need to get setCurrentFileName from props
        return <RunTestsTab 
          showTable={showTable} 
          setShowTable={setShowTable} 
          setCurrentFileName={setCurrentFileName}
          currentFile={currentFile}
          setCurrentFile={setCurrentFile}
          isExcelEditMode={isExcelEditMode}
          setIsExcelEditMode={setIsExcelEditMode}
          lastSaveInfo={lastSaveInfo}
          setLastSaveInfo={setLastSaveInfo}
        />;
      case "test-cases":
        return <TestCasesTab />;
      case "test-runs":
        return <TestRunsTab />;      case "reports":
        return <ReportsTab />;      
      case "schedules":
        return <SchedulesTab />;
      case "deprecated":        
      default:
        return <RunTestsTab 
          showTable={showTable} 
          setShowTable={setShowTable} 
          setCurrentFileName={setCurrentFileName}
          currentFile={currentFile}
          setCurrentFile={setCurrentFile}
          isExcelEditMode={isExcelEditMode}
          setIsExcelEditMode={setIsExcelEditMode}
          activeTab={activeTab}
          lastSaveInfo={lastSaveInfo}
          setLastSaveInfo={setLastSaveInfo}
        />;
    }
  };

  return (
    <div className="flex-1 flex flex-col api-dashboard overflow-hidden">
      {/* Preload flag emojis */}
      <FlagPreloader />
      
      <main className="flex-1">        <div className="px-6 flex flex-col">
          <div className="test-content">
            {renderActiveTab()}
          </div>
        </div>
      </main>
      
      {/* Preview Dialog */}
      {dialogOpen && dialogContent && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {dialogContent}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
