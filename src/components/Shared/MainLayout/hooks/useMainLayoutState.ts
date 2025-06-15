import { useState, useEffect, useRef } from 'react';
import { StateStorage } from '../../../../utils/stateStorage';
import FileTrackingService, { FileTrackingInfo } from '../../../../services/FileTrackingService';
import ProductBacklogService from '../../../../api/ProductBacklogService';

export interface MainLayoutState {
    // Tab states
    activeTab: string;
    activeRightTab: string;

    // Table states
    showTable: boolean;
    tabTableStates: { [key: string]: boolean };
    tabFileNames: { [key: string]: string };
    tabFiles: { [key: string]: File | null };

    // File states
    currentFileName: string;
    currentFile: File | null;
    isExcelEditMode: boolean;

    // Save and sync states
    lastSaveInfo: {
        status: 'success' | 'error' | null;
        timestamp: Date | null;
        message?: string;
    };
    fileTrackingInfo: FileTrackingInfo | null;
    showSyncAlert: boolean;

    // Database states
    tableStats: any;
    loadingStats: boolean;
    isFileInDatabase: boolean;
    checkingFileInDB: boolean;
}

export interface MainLayoutActions {
    setActiveTab: (tab: string) => void;
    setActiveRightTab: (tab: string) => void;
    customSetShowTable: (value: boolean | ((prev: boolean) => boolean)) => void;
    customSetCurrentFileName: (fileName: string) => void;
    customSetCurrentFile: (file: File | null) => Promise<void>;
    setIsExcelEditMode: (value: boolean) => void;
    setLastSaveInfo: (info: MainLayoutState['lastSaveInfo']) => void;
    setShowSyncAlert: (show: boolean) => void;
    loadTableStatistics: () => Promise<void>;
    checkFileInDatabase: (fileName: string) => Promise<void>;
}

export const useMainLayoutState = (): [MainLayoutState, MainLayoutActions] => {
    // Initialize states
    const [activeTab, setActiveTab] = useState(() => StateStorage.loadActiveTab());
    const [activeRightTab, setActiveRightTab] = useState("test-results");
    const [showTable, setShowTable] = useState(false);
    const [tabTableStates, setTabTableStates] = useState<{ [key: string]: boolean }>(() => StateStorage.loadTabStates());
    const [tabFileNames, setTabFileNames] = useState<{ [key: string]: string }>(() => StateStorage.loadTabFileNames());
    const [tabFiles, setTabFiles] = useState<{ [key: string]: File | null }>({});

    const [currentFileName, setCurrentFileName] = useState<string>("");
    const [currentFile, setCurrentFile] = useState<File | null>(null);
    const [isExcelEditMode, setIsExcelEditMode] = useState<boolean>(false);

    const [lastSaveInfo, setLastSaveInfo] = useState<{
        status: 'success' | 'error' | null;
        timestamp: Date | null;
        message?: string;
    }>(() => StateStorage.loadLastSaveInfo());

    const [fileTrackingInfo, setFileTrackingInfo] = useState<FileTrackingInfo | null>(null);
    const [showSyncAlert, setShowSyncAlert] = useState<boolean>(false);

    const [tableStats, setTableStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState<boolean>(false);
    const [isFileInDatabase, setIsFileInDatabase] = useState<boolean>(false);
    const [checkingFileInDB, setCheckingFileInDB] = useState<boolean>(false);

    const fileTrackingService = FileTrackingService.getInstance();    // Ref to track loading state and prevent duplicate loads
    const loadingFileRef = useRef<string | null>(null);

    // Ref to track restoration attempts per tab to prevent loops
    const restorationAttemptedRef = useRef<Set<string>>(new Set());

    // Ref to track if component has mounted to prevent initial duplicate effects
    const mountedRef = useRef<boolean>(false);// Function to load database table statistics
    const loadTableStatistics = async () => {
        setLoadingStats(true);
        try {
            const stats = await ProductBacklogService.getTableStatistics();
            setTableStats(stats);
        } catch (error) {
            console.error('Error loading table statistics:', error);
            setTableStats(null);
        } finally {
            setLoadingStats(false);
        }
    };// Function to check if current file exists in database
    const checkFileInDatabase = async (fileName: string) => {
        setCheckingFileInDB(true);
        try {
            const exists = await fileTrackingService.isFileInDatabase(fileName);
            setIsFileInDatabase(exists);
        } catch (error) {
            console.error('Error checking file in database:', error);
            setIsFileInDatabase(false);
        } finally {
            setCheckingFileInDB(false);
        }
    };// Custom setShowTable function that also updates tab states
    const customSetShowTable = (value: boolean | ((prev: boolean) => boolean)) => {
        const newValue = typeof value === 'function' ? value(showTable) : value;

        setShowTable(newValue);

        // Update current tab's state immediately
        setTabTableStates(prev => ({
            ...prev,
            [activeTab]: newValue
        }));
    };    // Custom setCurrentFileName function that also updates tab states
    const customSetCurrentFileName = (fileName: string) => {
        setCurrentFileName(fileName);

        // Update current tab's filename immediately
        setTabFileNames(prev => ({
            ...prev,
            [activeTab]: fileName
        }));
    };    // Custom setCurrentFile function that also updates tab states and checks file status
    const customSetCurrentFile = async (file: File | null) => {
        setCurrentFile(file);

        // Update current tab's file immediately
        setTabFiles(prev => ({
            ...prev,
            [activeTab]: file
        }));

        // Clear restoration flag when user manually sets a file
        if (file) {
            restorationAttemptedRef.current.delete(activeTab);
        }

        // Check file tracking status if file is provided
        if (file) {
            try {
                const trackingInfo = await fileTrackingService.checkFileStatus(file);

                setFileTrackingInfo(trackingInfo);

                // Update lastSaveInfo based on tracking info
                if (trackingInfo.lastSyncDate) {
                    setLastSaveInfo({
                        status: trackingInfo.hasChanges ? 'error' : 'success',
                        timestamp: trackingInfo.lastSyncDate,
                        message: trackingInfo.hasChanges
                            ? `Changes detected: ${trackingInfo.changesSinceSync.join(', ')}`
                            : 'File is up to date'
                    });
                } else {
                    setLastSaveInfo({
                        status: null,
                        timestamp: null,
                        message: 'File never synced to database'
                    });
                }

                // Show alert only if there are real changes (not API errors)
                if (trackingInfo.hasChanges && trackingInfo.lastSyncDate &&
                    trackingInfo.changesSinceSync.length > 0 &&
                    !trackingInfo.changesSinceSync.some(change => change.includes('Unable to verify'))) {
                    setShowSyncAlert(true);
                }

            } catch (error) {
                console.error('Error checking file status:', error);
                setFileTrackingInfo(null);
            }
        } else {
            setFileTrackingInfo(null);
            setShowSyncAlert(false);
        }

        // Check if current file exists in database
        if (file?.name) {
            await checkFileInDatabase(file.name);
        }
    };// Note: File metadata is now saved by the upload component after getting the stored filename
    const saveFileMetadata = (file: File | null) => {
        // This is handled by the upload component now
        if (process.env.NODE_ENV === 'development') {
            console.log("saveFileMetadata called - delegating to upload component");
        }
    };

    // Load file metadata and prompt user to re-upload if needed
    const loadFileMetadata = () => {
        const metadata = StateStorage.loadFileMetadata(activeTab);
        if (metadata && !currentFile) {
            console.log("File metadata found for tab:", activeTab, metadata);
            // You could show a notification to user that they need to re-upload the file
            // or implement a more sophisticated file restoration mechanism
        }
        return metadata;
    };    // Function to load file from backend using stored filename
    const loadFileFromBackend = async (storedFileName: string, originalName: string) => {
        // Prevent duplicate loading attempts
        if (loadingFileRef.current === storedFileName) {
            if (process.env.NODE_ENV === 'development') {
                console.log("Load file request already in progress for this file, skipping:", storedFileName);
            }
            return null;
        }

        loadingFileRef.current = storedFileName;

        try {
            if (process.env.NODE_ENV === 'development') {
                console.log(`Attempting to load file from backend: ${storedFileName}`);
            }

            const response = await fetch(`http://localhost:8080/api/product-backlog/download/${storedFileName}`); if (response.ok) {
                const blob = await response.blob();

                // Create a File object from the blob
                const file = new File([blob], originalName, {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });

                console.log(`File loaded successfully from backend: ${originalName}`);

                // Set the file in current tab
                setCurrentFile(file);
                setTabFiles(prev => ({
                    ...prev,
                    [activeTab]: file
                }));

                // Update filename to use original name for user display
                setCurrentFileName(originalName);
                setTabFileNames(prev => ({
                    ...prev,
                    [activeTab]: originalName
                }));                // Set showTable to true since we have a loaded file
                setShowTable(true);
                setTabTableStates(prev => ({
                    ...prev,
                    [activeTab]: true
                }));

                // Clear restoration flag since we successfully loaded the file
                restorationAttemptedRef.current.delete(activeTab);

                return file;
            } else {
                console.error(`Failed to load file from backend: ${response.status}`);
                // Clear restoration flag on failure to allow retry later
                restorationAttemptedRef.current.delete(activeTab);
                return null;
            }
        } catch (error) {
            console.error('Error loading file from backend:', error);
            // Clear restoration flag on error to allow retry later
            restorationAttemptedRef.current.delete(activeTab);
            return null;
        } finally {
            loadingFileRef.current = null;
        }
    };

    // Load table statistics on component mount and when save is successful
    useEffect(() => {
        loadTableStatistics();
    }, []);    // Listen for successful save events to reload table statistics
    useEffect(() => {
        const handleSaveSuccess = () => {
            if (process.env.NODE_ENV === 'development') {
                console.log('Save success event received, reloading table statistics');
            }
            loadTableStatistics();
        };

        window.addEventListener('excelSaveSuccess', handleSaveSuccess);

        return () => {
            window.removeEventListener('excelSaveSuccess', handleSaveSuccess);
        };
    }, []);    // Listen for file status changes to update database status
    useEffect(() => {
        const handleFileStatusChange = (event: any) => {
            const { fileName, isInDatabase } = event.detail;
            if (fileName === currentFileName) {
                setIsFileInDatabase(isInDatabase);
            }
        };

        window.addEventListener('fileStatusChanged', handleFileStatusChange);

        return () => {
            window.removeEventListener('fileStatusChanged', handleFileStatusChange);
        };
    }, [currentFileName]);

    // Save states to localStorage
    useEffect(() => {
        StateStorage.saveActiveTab(activeTab);
    }, [activeTab]);

    useEffect(() => {
        StateStorage.saveTabStates(tabTableStates);
    }, [tabTableStates]);

    useEffect(() => {
        StateStorage.saveTabFileNames(tabFileNames);
    }, [tabFileNames]);

    useEffect(() => {
        StateStorage.saveLastSaveInfo(lastSaveInfo);
    }, [lastSaveInfo]);

    // Check if current file exists in database when filename changes
    useEffect(() => {
        const checkFileInDatabaseEffect = async () => {
            if (currentFileName) {
                setCheckingFileInDB(true);
                try {
                    const exists = await StateStorage.checkFileInDatabase(currentFileName);
                    setIsFileInDatabase(exists);
                } catch (error) {
                    console.error('Error checking file in database:', error);
                    setIsFileInDatabase(false);
                } finally {
                    setCheckingFileInDB(false);
                }
            } else {
                setIsFileInDatabase(false);
            }
        };

        checkFileInDatabaseEffect();
    }, [currentFileName]);    // Minimal debug logging for state restoration (only log significant changes)
    useEffect(() => {
        // Disable debug logging temporarily to reduce console spam
        // if (process.env.NODE_ENV === 'development') {
        //     console.log("MainLayout state - Tab:", activeTab, "File:", currentFileName, "ShowTable:", showTable);
        // }
    }, [activeTab]);    // Restore tab state and file info when activeTab changes
    useEffect(() => {
        // Disable debug logging temporarily to reduce console spam  
        // if (process.env.NODE_ENV === 'development') {
        //     console.log("Active tab changed to:", activeTab);
        // }

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
        }// Restore file if it exists
        if (newTabFile !== undefined) {
            setCurrentFile(newTabFile);
        } else {
            setCurrentFile(null);            // File restoration logic - restore file from backend if metadata exists
            const restorationKey = `${activeTab}`;
            const storedMetadata = StateStorage.loadFileMetadata(activeTab);
            const needsRestoration = storedMetadata?.storedFileName && storedMetadata?.originalName;

            // Restore file if we have metadata but no actual file object
            if (!newTabFile && !loadingFileRef.current &&
                !restorationAttemptedRef.current.has(restorationKey) && needsRestoration) {

                if (process.env.NODE_ENV === 'development') {
                    console.log("Attempting file restoration for tab:", activeTab, "metadata:", storedMetadata);
                }
                restorationAttemptedRef.current.add(restorationKey);
                loadFileFromBackend(storedMetadata.storedFileName, storedMetadata.originalName);
            }
        }

        // No need to log metadata every time - it's already logged during restoration
    }, [activeTab]); // Keep only activeTab as dependency

    const state: MainLayoutState = {
        activeTab,
        activeRightTab,
        showTable,
        tabTableStates,
        tabFileNames,
        tabFiles,
        currentFileName,
        currentFile,
        isExcelEditMode,
        lastSaveInfo,
        fileTrackingInfo,
        showSyncAlert,
        tableStats,
        loadingStats,
        isFileInDatabase,
        checkingFileInDB
    };

    const actions: MainLayoutActions = {
        setActiveTab,
        setActiveRightTab,
        customSetShowTable,
        customSetCurrentFileName,
        customSetCurrentFile,
        setIsExcelEditMode,
        setLastSaveInfo,
        setShowSyncAlert,
        loadTableStatistics,
        checkFileInDatabase
    };

    return [state, actions];
};
