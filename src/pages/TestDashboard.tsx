import React, { useState, useEffect } from "react";
import { TestSuitesTab } from "../components/dashboard/Tabs/TestSuitesTab";
import { RunTestsTab } from "../components/dashboard/Tabs/RunTestsTab";
import { TestCasesTab } from "../components/dashboard/Tabs/TestCasesTab";
import { TestRunsTab } from "../components/dashboard/Tabs/TestRunsTab";
import { ReportsTab } from "../components/dashboard/Tabs/ReportsTab";
import { SchedulesTab } from "../components/dashboard/Tabs/SchedulesTab";

import "../styles/dashboard/tabs/test-dashboard.css";
import "../styles/dashboard/tabs/run-tests.css";
import "../styles/Layout/container-headers.css";

// Badge and progress bar styles are now in api-dashboard.css

interface TestDashboardProps {
  readonly activeTabFromHeader?: string;
  readonly showTable?: boolean;
  readonly setShowTable?: (show: boolean) => void;
  readonly setCurrentFileName?: (fileName: string) => void;
  readonly currentFile?: File | null;
  readonly setCurrentFile?: (file: File | null) => void;
  readonly isExcelEditMode?: boolean;
  readonly setIsExcelEditMode?: (editMode: boolean) => void;
  readonly lastSaveInfo?: {
    status: 'success' | 'error' | null;
    timestamp: Date | null;
    message?: string;
  };
  readonly setLastSaveInfo?: (saveInfo: {
    status: 'success' | 'error' | null;
    timestamp: Date | null;
    message?: string;
  }) => void;
  readonly onLogout?: () => void;
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
  lastSaveInfo,  setLastSaveInfo,
  onLogout
}: TestDashboardProps) {
  const [activeTab, setActiveTab] = useState("run-tests");
  
  // Use external setter if provided, otherwise use a dummy function
  const setCurrentFileName = externalSetCurrentFileName || (() => {});
  
  // Update activeTab when activeTabFromHeader changes
  useEffect(() => {
    if (activeTabFromHeader) {
      setActiveTab(activeTabFromHeader);
    }  }, [activeTabFromHeader]);
  const renderActiveTab = () => {
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
      <main className="flex-1">
        <div className="px-6 flex flex-col">
          <div className="test-content">
            {renderActiveTab()}
          </div>
        </div>
      </main>
    </div>
  );
}
