import { MainLayoutState, MainLayoutActions } from './useMainLayoutState';

export interface TabHandlers {
    handleTabClick: (tabId: string) => void;
    handleRightTabClick: (tabId: string) => void;
}

export const useTabHandlers = (
    state: MainLayoutState,
    actions: MainLayoutActions
): TabHandlers => {
    const {
        activeTab,
        showTable,
        currentFileName,
        currentFile
    } = state;

    const {
        setActiveTab,
        setActiveRightTab,
        customSetShowTable,
        customSetCurrentFileName,
        customSetCurrentFile,
        setIsExcelEditMode
    } = actions;

    // Function to handle tab click for left container
    const handleTabClick = (tabId: string) => {
        console.log("Tab switching from:", activeTab, "to:", tabId);

        // Save current tab's table state before switching
        if (activeTab) {
            console.log("Saving current state - showTable:", showTable, "fileName:", currentFileName, "file:", currentFile);

            // Update states immediately to ensure they're saved
            state.tabTableStates = {
                ...state.tabTableStates,
                [activeTab]: showTable
            };

            state.tabFileNames = {
                ...state.tabFileNames,
                [activeTab]: currentFileName
            };

            state.tabFiles = {
                ...state.tabFiles,
                [activeTab]: currentFile
            };
        }

        // Reset edit mode when switching tabs
        setIsExcelEditMode(false);

        // Switch to new tab immediately (useEffect will handle state restoration)
        setActiveTab(tabId);
    };

    // Function to handle tab click for right container
    const handleRightTabClick = (tabId: string) => {
        setActiveRightTab(tabId);
    };

    return {
        handleTabClick,
        handleRightTabClick
    };
};
