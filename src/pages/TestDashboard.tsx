import React, { useState, useEffect } from "react";
import { ProjectsTab } from "../components/dashboard/Tabs/ProjectsTab";
import { TestSuitesTab } from "../components/dashboard/Tabs/TestSuitesTab";
import { RunTestsTab } from "../components/dashboard/Tabs/RunTestsTab";
import { TestCasesTab } from "../components/dashboard/Tabs/TestCasesTab";
import { TestRunsTab } from "../components/dashboard/Tabs/TestRunsTab";

import { SchedulesTab } from "../components/dashboard/Tabs/SchedulesTab";
import { FeaturesSectionWithCardGradient } from "../components/ui/features-section-with-card-gradient";
import { Project } from "@/api/projectsApi";

import "../styles/dashboard/tabs/test-dashboard.css";
import "../styles/dashboard/tabs/run-tests.css";
import "../styles/Layout/container-headers.css";

// Badge and progress bar styles are now in api-dashboard.css

interface TestDashboardProps {
  readonly activeTabFromHeader?: string;
  readonly activeProject?: Project | null;
  readonly setActiveProject?: (project: Project | null) => void;
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
  readonly loadProjectExcelAndSwitchTab?: (project: Project) => Promise<void>;
  readonly onLogout?: () => void;
  readonly testConfig?: {
    isHeadless: boolean;
    browser: string;
  };
}

export default function TestDashboard({ 
  activeTabFromHeader, 
  activeProject,
  setActiveProject,
  showTable, 
  setShowTable, 
  setCurrentFileName: externalSetCurrentFileName,
  currentFile,
  setCurrentFile,
  isExcelEditMode,
  setIsExcelEditMode,
  lastSaveInfo,
  setLastSaveInfo,
  loadProjectExcelAndSwitchTab,
  onLogout,
  testConfig
}: TestDashboardProps) {
  const [activeTab, setActiveTab] = useState("projects");
  
  // Use external setter if provided, otherwise use a dummy function
  const setCurrentFileName = externalSetCurrentFileName || (() => {});
  
  // Update activeTab when activeTabFromHeader changes
  useEffect(() => {
    if (activeTabFromHeader) {
      setActiveTab(activeTabFromHeader);
    }
  }, [activeTabFromHeader]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "projects":
        return <ProjectsTab 
          onProjectSelect={setActiveProject || (() => {})} 
          loadProjectExcelAndSwitchTab={loadProjectExcelAndSwitchTab}
        />;
      case "test-suites":
        return <TestSuitesTab 
          selectedProjectId={activeProject?.id || null} 
          testConfig={testConfig || { isHeadless: false, browser: 'chrome' }} 
        />;      
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
        return <TestRunsTab />;      
      case "reports":
        return (
          <div className="w-full bg-white h-full flex flex-col">
            <div 
              className="flex-1 overflow-auto reports-scroll-wrapper" 
              style={{ scrollbarWidth: 'thin' }}
            >
              <FeaturesSectionWithCardGradient />
            </div>
          </div>
        );      
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
