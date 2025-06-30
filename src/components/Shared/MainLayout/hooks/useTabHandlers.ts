import { MainLayoutState, MainLayoutActions } from './useMainLayoutState';
import { getProjectExcel } from '../../../../api/excelApi';

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
    } = state;     const {
        setActiveTab,
        setActiveRightTab,
        setIsExcelEditMode,
        customSetShowTable,
        customSetCurrentFileName,
        customSetCurrentFile
    } = actions;

    // Function to handle tab click for left container
    const handleTabClick = async (tabId: string) => {
        console.log("Tab switching from:", activeTab, "to:", tabId);

        // Save current tab's table state before switching
        if (activeTab) {
            console.log("Saving current state - showTable:", showTable, "fileName:", currentFileName, "file:", currentFile);

            // Use custom setters to properly save state
            customSetShowTable(showTable);
            if (currentFileName) {
                customSetCurrentFileName(currentFileName);
            }
            if (currentFile) {
                customSetCurrentFile(currentFile);
            }
        }

        // Reset edit mode when switching tabs
        setIsExcelEditMode(false);

        // Switch to new tab immediately (useEffect will handle state restoration)
        setActiveTab(tabId);

        // If switching to Backlog tab and there's an active project, load its Excel data
        if (tabId === 'run-tests' && state.activeProject) {
            console.log('Loading Excel data for active project:', state.activeProject.name);
            try {
                const excelData = await getProjectExcel(state.activeProject.id);
                
                if (excelData) {
                    console.log('Excel data found for project:', state.activeProject.name);
                    
                    // Convert Blob to File
                    const file = new File([excelData.fileData], excelData.fileName, {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    });
                    
                    // Set file data
                    await customSetCurrentFile(file);
                    customSetCurrentFileName(excelData.fileName);
                    customSetShowTable(true);
                    
                    console.log('Excel data loaded and table shown for project:', state.activeProject.name);
                } else {
                    console.log('No Excel data found for project:', state.activeProject.name);
                    // Clear any existing data
                    await customSetCurrentFile(null);
                    customSetCurrentFileName('');
                    customSetShowTable(false);
                }
            } catch (error) {
                console.error('Error loading Excel data for project:', error);
            }
        }
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
