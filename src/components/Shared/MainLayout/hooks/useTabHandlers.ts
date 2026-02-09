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
    } = state; const {
        setActiveTab,
        setActiveRightTab,
        setIsExcelEditMode,
        customSetShowTable,
        customSetCurrentFileName,
        customSetCurrentFile
    } = actions;

    const handleTabClick = async (tabId: string) => {
        console.log("Tab switching from:", activeTab, "to:", tabId);

        if (activeTab) {
            console.log("Saving current state - showTable:", showTable, "fileName:", currentFileName, "file:", currentFile);

            customSetShowTable(showTable);
            if (currentFileName) {
                customSetCurrentFileName(currentFileName);
            }
            if (currentFile) {
                customSetCurrentFile(currentFile);
            }
        }

        setIsExcelEditMode(false);

        setActiveTab(tabId);

        if (tabId === 'run-tests' && state.activeProject) {
            const savedFile = state.tabFiles?.['run-tests'];
            if (savedFile) {
                await customSetCurrentFile(savedFile);
                customSetCurrentFileName(state.tabFileNames?.['run-tests'] ?? savedFile.name);
                customSetShowTable(state.tabTableStates?.['run-tests'] ?? true);
            } else {
                console.log('Loading Excel data for active project:', state.activeProject.name);
                try {
                    const excelData = await getProjectExcel(state.activeProject.id);
                    if (excelData) {
                        console.log('Excel data found for project:', state.activeProject.name);
                        const file = new File([excelData.fileData], excelData.fileName, {
                            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        });
                        await customSetCurrentFile(file);
                        customSetCurrentFileName(excelData.fileName);
                        customSetShowTable(true);
                    } else {
                        console.log('No Excel data found for project:', state.activeProject.name);
                        await customSetCurrentFile(null);
                        customSetCurrentFileName('');
                        customSetShowTable(false);
                    }
                } catch (error) {
                    console.error('Error loading Excel data for project:', error);
                }
            }
        }
    };

    const handleRightTabClick = (tabId: string) => {
        setActiveRightTab(tabId);
    };

    return {
        handleTabClick,
        handleRightTabClick
    };
};
