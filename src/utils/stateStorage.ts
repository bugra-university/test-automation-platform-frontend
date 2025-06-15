// State persistence utility for handling browser refresh
export class StateStorage {
    private static prefix = 'test_platform_';

    // Save tab states to localStorage
    static saveTabStates(tabStates: { [key: string]: boolean }) {
        try {
            localStorage.setItem(`${this.prefix}tab_table_states`, JSON.stringify(tabStates));
        } catch (error) {
            console.error('Error saving tab states:', error);
        }
    }

    // Load tab states from localStorage
    static loadTabStates(): { [key: string]: boolean } {
        try {
            const saved = localStorage.getItem(`${this.prefix}tab_table_states`);
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Error loading tab states:', error);
            return {};
        }
    }

    // Save file names to localStorage
    static saveTabFileNames(fileNames: { [key: string]: string }) {
        try {
            localStorage.setItem(`${this.prefix}tab_file_names`, JSON.stringify(fileNames));
        } catch (error) {
            console.error('Error saving file names:', error);
        }
    }

    // Load file names from localStorage
    static loadTabFileNames(): { [key: string]: string } {
        try {
            const saved = localStorage.getItem(`${this.prefix}tab_file_names`);
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Error loading file names:', error);
            return {};
        }
    }

    // Save current active tab
    static saveActiveTab(tabId: string) {
        try {
            localStorage.setItem(`${this.prefix}active_tab`, tabId);
        } catch (error) {
            console.error('Error saving active tab:', error);
        }
    }

    // Load current active tab
    static loadActiveTab(): string {
        try {
            return localStorage.getItem(`${this.prefix}active_tab`) || 'run-tests';
        } catch (error) {
            console.error('Error loading active tab:', error);
            return 'run-tests';
        }
    }

    // Save last save info
    static saveLastSaveInfo(saveInfo: any) {
        try {
            localStorage.setItem(`${this.prefix}last_save_info`, JSON.stringify(saveInfo));
        } catch (error) {
            console.error('Error saving last save info:', error);
        }
    }

    // Load last save info
    static loadLastSaveInfo(): any {
        try {
            const saved = localStorage.getItem(`${this.prefix}last_save_info`);
            return saved ? JSON.parse(saved) : { status: null, timestamp: null };
        } catch (error) {
            console.error('Error loading last save info:', error);
            return { status: null, timestamp: null };
        }
    }    // Check if file exists in database by querying backend
    static async checkFileInDatabase(fileName: string): Promise<boolean> {
        try {
            // Use relative URL to avoid CORS issues
            const response = await fetch(`http://localhost:8080/api/product-backlog/table-stats`);

            if (!response.ok) {
                console.warn('Backend API not available, cannot check file status');
                return false;
            }

            const stats = await response.json();

            if (stats && stats.fileDetails) {
                return stats.fileDetails.some((file: any) =>
                    file.fileName === fileName || fileName.includes(file.fileName)
                );
            }
            return false;
        } catch (error) {
            console.error('Error checking file in database:', error);
            return false;
        }
    }    // Save file metadata (not the actual file, just metadata for restoration)
    static saveFileMetadata(tabId: string, originalName: string, storedFileName: string, fileSize: number, fileType: string) {
        try {
            const metadata = {
                originalName,
                storedFileName,
                fileSize,
                fileType,
                timestamp: Date.now()
            };
            localStorage.setItem(`${this.prefix}file_metadata_${tabId}`, JSON.stringify(metadata));
        } catch (error) {
            console.error('Error saving file metadata:', error);
        }
    }

    // Load file metadata
    static loadFileMetadata(tabId: string): { originalName: string; storedFileName: string; fileSize: number; fileType: string; timestamp: number } | null {
        try {
            const saved = localStorage.getItem(`${this.prefix}file_metadata_${tabId}`);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Error loading file metadata:', error);
            return null;
        }
    }

    // Clear all stored state (for logout or reset)
    static clearAll() {
        try {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Error clearing stored state:', error);
        }
    }
}
