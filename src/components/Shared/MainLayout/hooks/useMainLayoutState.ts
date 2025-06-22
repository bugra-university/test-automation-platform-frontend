import { useState, useEffect, useMemo } from 'react';
import { Project } from '../../../../api/projectsApi';
import { getProjectExcel, deleteProjectExcel } from '../../../../api/excelApi';

export interface MainLayoutState {
    // Tab states
    activeTab: string;
    activeRightTab: string;
    activeProject: Project | null;

    // Table states
    showTable: boolean;
    tabTableStates: { [key: string]: boolean };
    tabFileNames: { [key: string]: string };
    tabFiles: { [key: string]: File | null };

    // File states
    currentFileName: string;
    currentFile: File | null;
    isExcelEditMode: boolean;
    isSaving: boolean;

    // Save and sync states
    lastSaveInfo: {
        status: 'success' | 'error' | null;
        timestamp: Date | null;
        message?: string;
    };

    // Database states
    tableStats: any;
    loadingStats: boolean;
}

export interface MainLayoutActions {
    setActiveTab: (tab: string) => void;
    setActiveRightTab: (tab: string) => void;
    setActiveProject: (project: Project | null) => void;
    customSetShowTable: (value: boolean | ((prev: boolean) => boolean)) => void;
    customSetCurrentFileName: (fileName: string) => void;
    customSetCurrentFile: (file: File | null) => Promise<void>;
    setIsExcelEditMode: (value: boolean) => void;
    setIsSaving: (saving: boolean) => void;
    setLastSaveInfo: (info: MainLayoutState['lastSaveInfo']) => void;
    loadTableStatistics: () => Promise<void>;
    loadProjectExcelAndSwitchTab: (project: Project) => Promise<void>;
    deleteExcel: (projectId: number) => Promise<void>;
    uploadNewExcel: () => void;
}

export const useMainLayoutState = (): [MainLayoutState, MainLayoutActions] => {
    // Initialize states with default values
    const [activeTab, setActiveTab] = useState("projects");
    const [activeRightTab, setActiveRightTab] = useState("test-results");
    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [showTable, setShowTable] = useState(false);
    const [tabTableStates, setTabTableStates] = useState<{ [key: string]: boolean }>({});
    const [tabFileNames, setTabFileNames] = useState<{ [key: string]: string }>({});
    const [tabFiles, setTabFiles] = useState<{ [key: string]: File | null }>({});
    const [currentFileName, setCurrentFileName] = useState<string>("");
    const [currentFile, setCurrentFile] = useState<File | null>(null);
    const [isExcelEditMode, setIsExcelEditMode] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [lastSaveInfo, setLastSaveInfo] = useState<{
        status: 'success' | 'error' | null;
        timestamp: Date | null;
        message?: string;
    }>({
        status: null,
        timestamp: null
    });

    const [tableStats, setTableStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState<boolean>(false);

    // Load last session state from localStorage on mount
    useEffect(() => {
        const loadLastSession = async () => {
            try {
                const lastProjectData = localStorage.getItem('lastActiveProject');
                const lastTabData = localStorage.getItem('lastActiveTab');
                
                // Restore last tab if exists, otherwise default to projects
                if (lastTabData) {
                    setActiveTab(lastTabData);
                    console.log('Restored last active tab:', lastTabData);
                }
                
                if (lastProjectData) {
                    const project = JSON.parse(lastProjectData);
                    console.log('Loading last active project from localStorage:', project);
                    
                    // Set active project first
                    setActiveProject(project);
                    
                    // Only load Excel if we're on the backlog tab
                    if (lastTabData === 'run-tests') {
                        // Try to load Excel data for this project
                        const excelData = await getProjectExcel(project.id);
                        
                        if (excelData) {
                            console.log('Excel data found for project:', project.name);
                            
                            // Convert Blob to File
                            const file = new File([excelData.fileData], excelData.fileName, {
                                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                            });
                            
                            // Set file data
                            setCurrentFile(file);
                            setCurrentFileName(excelData.fileName);
                            setShowTable(true);
                            
                            console.log('Setting showTable to true, file:', file.name);
                        } else {
                            console.log('No Excel data found for project:', project.name);
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading last session:', error);
                localStorage.removeItem('lastActiveProject');
                localStorage.removeItem('lastActiveTab');
            }
        };

        loadLastSession();
    }, []); // Only run on mount

    // Function to load database table statistics
    const loadTableStatistics = async () => {
        setLoadingStats(true);
        try {
            // Backend API endpoint not ready yet - using mock data
            console.log('Table statistics loading disabled - backend not ready');
            setTableStats(null);
        } catch (error) {
            console.error('Error loading table statistics:', error);
            setTableStats(null);
        } finally {
            setLoadingStats(false);
        }
    };

    // Function to load project Excel and switch to backlog tab
    const loadProjectExcelAndSwitchTab = async (project: Project) => {
        try {
            console.log('Loading Excel for project:', project.name, project.id);
            
            // Set active project first
            setActiveProject(project);
            
            // Save to localStorage for persistence
            localStorage.setItem('lastActiveProject', JSON.stringify(project));
            
            // Try to load Excel data for this project
            const excelData = await getProjectExcel(project.id);
            
            if (excelData) {
                console.log('Excel data found for project:', project.name);
                
                // Convert Blob to File
                const file = new File([excelData.fileData], excelData.fileName, {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });
                
                // Set file data
                setCurrentFile(file);
                setCurrentFileName(excelData.fileName);
                
                console.log('loadProjectExcelAndSwitchTab: Setting showTable to true, file:', file.name);
                console.log('showTable state after setting:', showTable);
                console.log('Switching to backlog tab...');
                
                // Switch to backlog tab AND set state directly for run-tests tab
                enhancedSetActiveTab('run-tests');
                setTabTableStates(prev => ({
                    ...prev,
                    'run-tests': true
                }));
                setShowTable(true);
                
                console.log('Set run-tests tab state to true');
            } else {
                console.log('No Excel data found for project:', project.name);
                // Clear any existing Excel data
                setCurrentFile(null);
                setCurrentFileName('');
                
                // Use customSetShowTable to save to tab states too
                customSetShowTable(false);
                
                console.log('Cleared Excel data for project without files');
                
                // Switch to backlog tab AND clear state directly for run-tests tab
                enhancedSetActiveTab('run-tests');
                setTabTableStates(prev => ({
                    ...prev,
                    'run-tests': false
                }));
                setShowTable(false);
                
                console.log('Set run-tests tab state to false');
            }
        } catch (error) {
            console.error('Error loading project Excel:', error);
            // Don't clear existing data on error - could be network issue
            // Just switch to backlog tab
            enhancedSetActiveTab('run-tests');
        }
    };

    // Custom setShowTable function that also updates tab states
    const customSetShowTable = (value: boolean | ((prev: boolean) => boolean)) => {
        const newValue = typeof value === 'function' ? value(showTable) : value;

        setShowTable(newValue);

        // Update current tab's state immediately
        setTabTableStates(prev => ({
            ...prev,
            [activeTab]: newValue
        }));
    };

    // Custom setCurrentFileName function that also updates tab states
    const customSetCurrentFileName = (fileName: string) => {
        setCurrentFileName(fileName);

        // Update current tab's filename immediately
        setTabFileNames(prev => ({
            ...prev,
            [activeTab]: fileName
        }));
    };

    // Custom setCurrentFile function that also updates tab states
    const customSetCurrentFile = async (file: File | null) => {
        setCurrentFile(file);

        // Update current tab's file immediately
        setTabFiles(prev => ({
            ...prev,
            [activeTab]: file
        }));

        // If file is provided, set its name
        if (file) {
            customSetCurrentFileName(file.name);
        }
    };

    // Listen for global file save events to update UI
    useEffect(() => {
        const handleSaveSuccess = () => {
            setLastSaveInfo({
                status: 'success',
                timestamp: new Date(),
                message: 'File saved to database successfully'
            });
        };

        window.addEventListener('excelSaveSuccess', handleSaveSuccess);

        return () => {
            window.removeEventListener('excelSaveSuccess', handleSaveSuccess);
        };
    }, []);

    // DISABLED: Tab state restoration - causing conflicts
    // Will be re-implemented after fixing core state management
    /*
    useEffect(() => {
        // When activeTab changes, restore the state for the new tab
        const newTabTableState = tabTableStates[activeTab];
        const newTabFileName = tabFileNames[activeTab];
        const newTabFile = tabFiles[activeTab];

        // Restore table state if it exists
        if (newTabTableState !== undefined) {
            setShowTable(newTabTableState);
        } else {
            setShowTable(false);
        }

        // Restore filename if it exists
        if (newTabFileName !== undefined) {
            setCurrentFileName(newTabFileName);
        } else {
            setCurrentFileName("");
        }

        // Restore file if it exists
        if (newTabFile !== undefined) {
            setCurrentFile(newTabFile);
        } else {
            setCurrentFile(null);
        }
    }, [activeTab, tabTableStates, tabFileNames, tabFiles]);
    */

    const state: MainLayoutState = {
        activeTab,
        activeRightTab,
        activeProject,
        showTable,
        tabTableStates,
        tabFileNames,
        tabFiles,
        currentFileName,
        currentFile,
        isExcelEditMode,
        isSaving,
        lastSaveInfo,
        tableStats,
        loadingStats
    };

    // Enhanced setActiveTab that saves to localStorage
    const enhancedSetActiveTab = (tab: string) => {
        setActiveTab(tab);
        localStorage.setItem('lastActiveTab', tab);
    };

    // Delete Excel file and all related data
    const deleteExcel = async (projectId: number) => {
        try {
            console.log('Deleting Excel for project:', projectId);
            
            const result = await deleteProjectExcel(projectId);
            
            if (result.success) {
                // Clear all state related to Excel
                setCurrentFile(null);
                setCurrentFileName('');
                setShowTable(false);
                setIsExcelEditMode(false);
                
                // Clear tab states for this project
                setTabTableStates(prev => ({
                    ...prev,
                    'run-tests': false
                }));
                
                // Show success message
                setLastSaveInfo({
                    status: 'success',
                    timestamp: new Date(),
                    message: 'Excel file and all related data deleted successfully'
                });
                
                console.log('Excel deletion successful:', result.message);
            } else {
                setLastSaveInfo({
                    status: 'error',
                    timestamp: new Date(),
                    message: result.message || 'Failed to delete Excel file'
                });
                console.error('Excel deletion failed:', result.message);
            }
        } catch (error) {
            console.error('Error deleting Excel:', error);
            setLastSaveInfo({
                status: 'error',
                timestamp: new Date(),
                message: 'Network error during deletion'
            });
        }
    };

      // Upload new Excel file (clear state and show upload screen)
  const uploadNewExcel = () => {
    // Clear current state first
    setCurrentFile(null);
    setCurrentFileName('');
    setShowTable(false);
    setIsExcelEditMode(false);
    
    // Clear tab states
    setTabTableStates(prev => ({
      ...prev,
      'run-tests': false
    }));
    
    // Switch to upload state
    enhancedSetActiveTab('run-tests');
    
    console.log('Cleared state for new Excel upload');
  };

    const actions: MainLayoutActions = {
        setActiveTab: enhancedSetActiveTab,
        setActiveRightTab,
        setActiveProject,
        customSetShowTable,
        customSetCurrentFileName,
        customSetCurrentFile,
        setIsExcelEditMode,
        setIsSaving,
        setLastSaveInfo,
        loadTableStatistics,
        loadProjectExcelAndSwitchTab,
        deleteExcel,
        uploadNewExcel
    };

    return [state, actions];
};
