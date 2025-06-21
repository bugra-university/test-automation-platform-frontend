import { useState, useEffect, useMemo } from 'react';
import { Project } from '../../../../api/projectsApi';

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
    const [loadingStats, setLoadingStats] = useState<boolean>(false);    // Function to load database table statistics
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

    // Restore tab state and file info when activeTab changes
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

    const actions: MainLayoutActions = {
        setActiveTab,
        setActiveRightTab,
        setActiveProject,
        customSetShowTable,
        customSetCurrentFileName,
        customSetCurrentFile,
        setIsExcelEditMode,
        setIsSaving,
        setLastSaveInfo,
        loadTableStatistics
    };

    return [state, actions];
};
