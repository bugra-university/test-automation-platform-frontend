import { useState, useEffect } from 'react';
import { Project } from '../../../../api/projectsApi';
import { getProjectExcel, deleteProjectExcel } from '../../../../api/excelApi';

export interface MainLayoutState {
    activeTab: string;
    activeRightTab: string;
    activeProject: Project | null;

    showTable: boolean;
    tabTableStates: { [key: string]: boolean };
    tabFileNames: { [key: string]: string };
    tabFiles: { [key: string]: File | null };

    currentFileName: string;
    currentFile: File | null;
    isExcelEditMode: boolean;
    isSaving: boolean;

    lastSaveInfo: {
        status: 'success' | 'error' | null;
        timestamp: Date | null;
        message?: string;
    };

    tableStats: any;
    loadingStats: boolean;

    testConfig: {
        isHeadless: boolean;
        browser: string;
    };
}

export interface MainLayoutActions {
    setActiveTab: (tab: string) => void;
    setActiveRightTab: (tab: string) => void;
    setActiveProject: (project: Project | null) => Promise<void>;
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
    setTestConfig: (config: { isHeadless: boolean; browser: string }) => void;
}

export const useMainLayoutState = (): [MainLayoutState, MainLayoutActions] => {
    const [activeTab, setActiveTab] = useState("projects");
    const [activeRightTab, setActiveRightTab] = useState("test-results");
    const [activeProject, setActiveProjectInternal] = useState<Project | null>(null);

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
    const [testConfig, setTestConfig] = useState<{ isHeadless: boolean; browser: string }>({
        isHeadless: false,
        browser: 'chrome'
    });

    const enhancedSetActiveTab = (tab: string) => {
        setActiveTab(tab);
        localStorage.setItem('lastActiveTab', tab);
    };

    const customSetShowTable = (value: boolean | ((prev: boolean) => boolean)) => {
        const newValue = typeof value === 'function' ? value(showTable) : value;

        setShowTable(newValue);

        setTabTableStates(prev => ({
            ...prev,
            [activeTab]: newValue
        }));
    };

    const customSetCurrentFileName = (fileName: string) => {
        setCurrentFileName(fileName);

        setTabFileNames(prev => ({
            ...prev,
            [activeTab]: fileName
        }));
    };

    const customSetCurrentFile = async (file: File | null) => {
        setCurrentFile(file);

        setTabFiles(prev => ({
            ...prev,
            [activeTab]: file
        }));

        if (file) {
            customSetCurrentFileName(file.name);
        }
    };

    const setActiveProject = async (project: Project | null) => {
        setActiveProjectInternal(project);
        if (project) {
            localStorage.setItem('lastActiveProject', JSON.stringify(project));
            setTabTableStates(prev => ({ ...prev, 'run-tests': false }));
            setTabFileNames(prev => ({ ...prev, 'run-tests': '' }));
            setTabFiles(prev => ({ ...prev, 'run-tests': null }));
            if (activeTab === 'run-tests') {
                console.log('Active tab is backlog, loading Excel data for project:', project.name);
                try {
                    const excelData = await getProjectExcel(project.id);

                    if (excelData) {
                        console.log('Excel data found for project:', project.name);

                        const file = new File([excelData.fileData], excelData.fileName, {
                            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        });

                        setCurrentFile(file);
                        setCurrentFileName(excelData.fileName);
                        setShowTable(true);

                        setTabTableStates(prev => ({
                            ...prev,
                            'run-tests': true
                        }));

                        console.log('Excel data loaded and table shown for project:', project.name);
                    } else {
                        console.log('No Excel data found for project:', project.name);
                        setCurrentFile(null);
                        setCurrentFileName('');
                        setShowTable(false);

                        setTabTableStates(prev => ({
                            ...prev,
                            'run-tests': false
                        }));

                        window.dispatchEvent(new CustomEvent('showToast', {
                            detail: {
                                title: 'Excel File Required',
                                description: `Please upload an Excel file for ${project.name} first`
                            }
                        }));
                    }
                } catch (error) {
                    console.error('Error loading Excel data for project:', error);
                }
            }
        } else {
            localStorage.removeItem('lastActiveProject');

            if (activeTab === 'run-tests') {
                setCurrentFile(null);
                setCurrentFileName('');
                setShowTable(false);
                setTabTableStates(prev => ({
                    ...prev,
                    'run-tests': false
                }));
            }
        }
    };

    const loadTableStatistics = async () => {
        setLoadingStats(true);
        try {
            console.log('Table statistics loading disabled - backend not ready');
            setTableStats(null);
        } catch (error) {
            console.error('Error loading table statistics:', error);
            setTableStats(null);
        } finally {
            setLoadingStats(false);
        }
    };

    const loadProjectExcelAndSwitchTab = async (project: Project) => {
        try {
            console.log('Loading Excel for project:', project.name, project.id);

            setActiveProjectInternal(project);

            localStorage.setItem('lastActiveProject', JSON.stringify(project));

            const excelData = await getProjectExcel(project.id);

            if (excelData) {
                console.log('Excel data found for project:', project.name);

                const file = new File([excelData.fileData], excelData.fileName, {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });

                setCurrentFile(file);
                setCurrentFileName(excelData.fileName);

                console.log('loadProjectExcelAndSwitchTab: Setting showTable to true, file:', file.name);
                console.log('showTable state after setting:', showTable);
                console.log('Switching to backlog tab...');

                enhancedSetActiveTab('run-tests');
                setTabTableStates(prev => ({
                    ...prev,
                    'run-tests': true
                }));
                setShowTable(true);

                console.log('Set run-tests tab state to true');
            } else {
                console.log('No Excel data found for project:', project.name);
                setCurrentFile(null);
                setCurrentFileName('');

                customSetShowTable(false);

                console.log('Cleared Excel data for project without files');

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
            enhancedSetActiveTab('run-tests');
        }
    };

    const deleteExcel = async (projectId: number) => {
        try {
            console.log('Deleting Excel for project:', projectId);

            const result = await deleteProjectExcel(projectId);

            if (result.success) {
                setCurrentFile(null);
                setCurrentFileName('');
                setShowTable(false);
                setIsExcelEditMode(false);

                setTabTableStates(prev => ({
                    ...prev,
                    'run-tests': false
                }));

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

    const uploadNewExcel = () => {
        setCurrentFile(null);
        setCurrentFileName('');
        setShowTable(false);
        setIsExcelEditMode(false);

        setTabTableStates(prev => ({
            ...prev,
            'run-tests': false
        }));

        enhancedSetActiveTab('run-tests');

        console.log('Cleared state for new Excel upload');
    };

    useEffect(() => {
        const loadLastSession = async () => {
            try {
                const lastProjectData = localStorage.getItem('lastActiveProject');
                const lastTabData = localStorage.getItem('lastActiveTab');

                if (lastTabData) {
                    setActiveTab(lastTabData);
                    console.log('Restored last active tab:', lastTabData);
                }

                if (lastProjectData) {
                    const project = JSON.parse(lastProjectData);
                    console.log('Loading last active project from localStorage:', project);

                    setActiveProjectInternal(project);

                    if (lastTabData === 'run-tests') {
                        const excelData = await getProjectExcel(project.id);

                        if (excelData) {
                            console.log('Excel data found for project:', project.name);

                            const file = new File([excelData.fileData], excelData.fileName, {
                                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                            });

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
    }, []);

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
        loadingStats,
        testConfig
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
        uploadNewExcel,
        setTestConfig
    };

    return [state, actions];
};
