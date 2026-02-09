import React, { cloneElement, ReactElement, useEffect, useRef, useCallback } from 'react';
import TestSidebar from './TestSidebar';
import { MainNav } from '../components/Shared/MainLayout/components/MainNav';
import FullScreen from '../components/dashboard/Settings/FullScreen';
import Delete, { DeleteDialog } from '../components/dashboard/Settings/Delete';
import { testSuitesApi } from '../api/testSuitesApi';
import { stepTrackingApi } from '../api/stepTrackingApi';
import '../styles/Layout/right-container.css';
import '../styles/Layout/left-container.css';
import '../styles/Layout/main-layout.css';
import '../styles/Layout/container-headers.css';
import '../styles/Layout/header-tabs.css';

// Import modular components
import { useMainLayoutState } from '../components/Shared/MainLayout/hooks/useMainLayoutState';
import { useTabHandlers } from '../components/Shared/MainLayout/hooks/useTabHandlers';
import { RightTabs } from '../components/Shared/MainLayout/components/RightTabs';
import { RightHeaderActions } from '../components/Shared/MainLayout/components/RightHeaderActions';
import { InfoPanel } from '../components/Shared/MainLayout/components/InfoPanel';
import { formatSaveTime } from '../components/Shared/MainLayout/utils/formatters';
import { uploadAndSaveExcel } from '../api/excelApi';
import { useToast } from '../components/ui/UseToast';
import { Toaster } from '../components/ui/toaster';
import { ActionsPanel } from '../components/Shared/MainLayout/components/ActionsPanel';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [state, actions] = useMainLayoutState();
  const { handleTabClick, handleRightTabClick } = useTabHandlers(state, actions);
  const { toast } = useToast();

  const globalSSEManagerRef = useRef<any>(null);
  const globalStepSSEManagerRef = useRef<any>(null);

  const handleGlobalSSEEvent = useCallback((event: any) => {
    console.log('[MainLayout] 🌐 Global SSE event received:', event.eventType, event.data);

    if (event.eventType === 'test_case_completed' && event.data) {
      const data = event.data;
      const passed = data.success === true;
      const durationSec = data.duration != null
        ? (typeof data.duration === 'number' ? (data.duration / 1000).toFixed(1) : data.duration)
        : '—';
      console.log('[MainLayout] 🧪 Showing toast for test complete:', data.testCaseId, passed, durationSec);
      try {
        toast({
          title: passed ? 'Test geçti' : 'Test kaldı',
          description: `${data.testCaseId || 'Test'} ${durationSec}s içinde tamamlandı. ${passed ? 'Tüm adımlar geçti.' : 'Detay için rapora bakın.'}`,
        });
      } catch (e) {
        console.error('[MainLayout] Toast error:', e);
      }
    }

    window.dispatchEvent(new CustomEvent('globalSSEEvent', {
      detail: { eventType: event.eventType, data: event.data }
    }));
  }, [toast]);

  const handleGlobalStepSSEEvent = useCallback((event: any) => {
    console.log('[MainLayout] 🌐 Global Step SSE event received:', event.eventType, event.data);

    window.dispatchEvent(new CustomEvent('globalStepSSEEvent', {
      detail: { eventType: event.eventType, data: event.data }
    }));
  }, []);

  useEffect(() => {
    if (state.activeProject?.id) {
      const projectId = state.activeProject.id;
      console.log('[MainLayout] 🔌 Setting up global SSE connections for project:', projectId);

      if (globalSSEManagerRef.current) {
        globalSSEManagerRef.current.disconnect();
      }
      if (globalStepSSEManagerRef.current) {
        globalStepSSEManagerRef.current.disconnect();
      }

      globalSSEManagerRef.current = testSuitesApi.createEventStream(projectId, handleGlobalSSEEvent);
      globalStepSSEManagerRef.current = stepTrackingApi.createStepEventStream(projectId, handleGlobalStepSSEEvent);

      globalSSEManagerRef.current.connect(projectId, handleGlobalSSEEvent);
      globalStepSSEManagerRef.current.connect(projectId, handleGlobalStepSSEEvent);

      return () => {
        console.log('[MainLayout] 🔌 Cleaning up global SSE connections');
        if (globalSSEManagerRef.current) {
          globalSSEManagerRef.current.disconnect();
          globalSSEManagerRef.current = null;
        }
        if (globalStepSSEManagerRef.current) {
          globalStepSSEManagerRef.current.disconnect();
          globalStepSSEManagerRef.current = null;
        }
      };
    }
  }, [state.activeProject?.id, handleGlobalSSEEvent, handleGlobalStepSSEEvent]);

  useEffect(() => {
    actions.loadTableStatistics();
  }, [actions]);

  const { handleFullscreen } = FullScreen({ isTableVisible: state.showTable });
  const { handleDelete, showDeleteDialog, confirmDelete, cancelDelete, isDeleting } = Delete({
    isTableVisible: state.showTable,
    setShowTable: actions.customSetShowTable,
    fileName: state.currentFileName,
    onDeleteSuccess: () => {
      actions.setLastSaveInfo({ status: null, timestamp: null, message: undefined });
      actions.loadTableStatistics();
      if (process.env.NODE_ENV === 'development') {
        console.log('Database deletion completed successfully');
      }
    }
  });

  const handleSaveToDatabase = async () => {
    const activeProjectId = state.activeProject?.id;
    console.log('Save to database initiated', {
      activeProject: state.activeProject,
      currentFile: state.currentFile ? {
        name: state.currentFile.name,
        size: state.currentFile.size,
        type: state.currentFile.type
      } : null
    });

    if (!activeProjectId) {
      console.warn('No project selected');
      toast({
        title: "No Project Selected",
        description: "Please select a project before saving.",
      });
      return;
    }

    if (!state.currentFile) {
      console.warn('No file selected');
      toast({
        title: "No File Selected",
        description: "Please upload a file before saving.",
      });
      return;
    }

    actions.setIsSaving(true);
    try {
      console.log('Starting file upload...');
      const response = await uploadAndSaveExcel(activeProjectId, state.currentFile);
      console.log('Upload response:', response);

      if (response.success) {
        console.log('Upload successful');
        toast({
          title: "Success",
          description: response.message || "Data saved to database!",
        });
        actions.setLastSaveInfo({ status: 'success', timestamp: new Date(), message: response.message });
      } else {
        console.error('Upload failed:', response.message);
        toast({
          title: "Error Saving Data",
          description: response.message || "An unknown error occurred.",
        });
        actions.setLastSaveInfo({ status: 'error', timestamp: new Date(), message: response.message });
      }
    } catch (error: any) {
      console.error('Unhandled error during save:', error);
      toast({
        title: "Unhandled Error",
        description: error.message || "An unexpected error occurred.",
      });
      actions.setLastSaveInfo({ status: 'error', timestamp: new Date(), message: error.message });
    } finally {
      console.log('Save operation completed');
      actions.setIsSaving(false);
    }
  };

  const handleEditModeToggle = () => {
    if (state.showTable) {
      actions.setIsExcelEditMode(!state.isExcelEditMode);
    }
  };

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return cloneElement(child as ReactElement<any>, {
        activeTabFromHeader: state.activeTab,
        activeProject: state.activeProject,
        setActiveProject: actions.setActiveProject,
        showTable: state.showTable,
        setShowTable: actions.customSetShowTable,
        setCurrentFileName: actions.customSetCurrentFileName,
        currentFile: state.currentFile,
        setCurrentFile: actions.customSetCurrentFile,
        isExcelEditMode: state.isExcelEditMode,
        setIsExcelEditMode: actions.setIsExcelEditMode,
        lastSaveInfo: state.lastSaveInfo,
        setLastSaveInfo: actions.setLastSaveInfo,
        loadProjectExcelAndSwitchTab: actions.loadProjectExcelAndSwitchTab,
        testConfig: state.testConfig,
        onSaveToDatabase: handleSaveToDatabase,
        isSaving: state.isSaving
      });
    }
    return child;
  });

  return (
    <div className="h-screen flex flex-col">
      <MainNav />

      <div className="flex bg-[#f6f6f6] overflow-hidden main-content-wrapper">
        <div className="p-8 pr-4">
          <div className="sidebar-container">
            <TestSidebar
              activeTab={state.activeTab}
              onTabClick={handleTabClick}
              activeProject={state.activeProject}
              onProjectSelect={actions.setActiveProject}
            />
          </div>
        </div>

        <div className="flex flex-1 p-8 pl-4 gap-4 min-w-0">
          <div className="flex-1 max-w-[calc(100%-380px)] min-w-0">
            <div className="left-container h-full">
              <div className="container-content">
                {childrenWithProps}
              </div>
            </div>
          </div>

          <div className="right-container flex-shrink-0">
            <div className="container-header">
              <div className="container-header-left">
                <RightTabs
                  activeRightTab={state.activeRightTab}
                  onTabClick={handleRightTabClick}
                />
              </div>
              <RightHeaderActions />
            </div>            <div className="container-content">
              {state.activeRightTab === "test-results" && (
                <InfoPanel
                  currentFileName={state.currentFileName}
                  currentFile={state.currentFile}
                  showTable={state.showTable}
                  lastSaveInfo={state.lastSaveInfo}
                  isExcelEditMode={state.isExcelEditMode}
                  isSaving={state.isSaving}
                  tableStats={state.tableStats}
                  loadingStats={state.loadingStats}
                  activeProject={state.activeProject}
                  onEditModeToggle={handleEditModeToggle}
                  onSaveToDatabase={handleSaveToDatabase}
                  onProjectSelect={actions.setActiveProject}
                  formatSaveTime={formatSaveTime}
                  onDatabaseRefresh={actions.loadTableStatistics}
                  onDeleteExcel={actions.deleteExcel}
                  onUploadNewExcel={actions.uploadNewExcel}
                />
              )}
              {state.activeRightTab === "actions" && (
                <ActionsPanel
                  currentFileName={state.currentFileName}
                  currentFile={state.currentFile}
                  showTable={state.showTable}
                  isExcelEditMode={state.isExcelEditMode}
                  isSaving={state.isSaving}
                  activeProject={state.activeProject}
                  onEditModeToggle={handleEditModeToggle}
                  onSaveToDatabase={handleSaveToDatabase}
                  onProjectSelect={actions.setActiveProject}
                  onDeleteExcel={actions.deleteExcel}
                  onUploadNewExcel={actions.uploadNewExcel}
                  lastSaveInfo={state.lastSaveInfo}
                  formatSaveTime={formatSaveTime}
                  testConfig={state.testConfig}
                  onTestConfigChange={actions.setTestConfig}
                />
              )}
              {state.activeRightTab === "last-activity" && (
                <div className="p-4 text-gray-500">
                  No recent activity to display
                </div>
              )}
            </div>
          </div>
        </div>
      </div>      <DeleteDialog
        showDialog={showDeleteDialog}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        fileName={state.currentFileName || "this table"}
        isDeleting={isDeleting}
      />
      <Toaster />
    </div>
  );
};

export default MainLayout;
