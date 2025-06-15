// Re-export types from hooks for centralized type management
export type { MainLayoutState, MainLayoutActions } from '../hooks/useMainLayoutState';
export type { TabHandlers } from '../hooks/useTabHandlers';

// Additional component prop types
export interface LeftTabsProps {
    activeTab: string;
    onTabClick: (tabId: string) => void;
}

export interface RightTabsProps {
    activeRightTab: string;
    onTabClick: (tabId: string) => void;
}

export interface LeftHeaderActionsProps {
    activeTab: string;
    showTable: boolean;
    onReturnToDashboard: () => void;
}

export interface InfoPanelProps {
    currentFileName: string;
    showTable: boolean;
    lastSaveInfo: {
        status: 'success' | 'error' | null;
        timestamp: Date | null;
        message?: string;
    };
    fileTrackingInfo: any;
    isExcelEditMode: boolean;
    isFileInDatabase: boolean;
    tableStats: any;
    loadingStats: boolean;
    onEditModeToggle: () => void;
    formatSaveTime: (timestamp: Date | null) => string;
}

export interface OptionsDropdownMenuProps {
    isFileInDatabase: boolean;
    fileTrackingInfo: any;
    showTable: boolean;
    isExcelEditMode: boolean;
    onFullscreen: () => void;
    onDelete: () => void;
    onEditModeToggle: () => void;
}

export interface FileSyncAlertDialogProps {
    show: boolean;
    fileTrackingInfo: any;
    onClose: () => void;
    onSync: () => void;
    formatSaveTime: (timestamp: Date | null) => string;
}
