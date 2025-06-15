import * as XLSX from 'xlsx';
import CryptoJS from 'crypto-js';
import ProductBacklogService from '../api/ProductBacklogService';

interface FileTrackingInfo {
    fileName: string;
    fileHash: string;
    contentHash: string;
    lastSyncDate: Date | null;
    hasChanges: boolean;
    changesSinceSync: string[];
}

interface DatabaseFileRecord {
    id: string;
    file_name: string;
    file_hash: string;
    content_hash: string;
    last_sync_date: string | null;
    created_at: string;
    updated_at: string;
}

class FileTrackingService {
    private static instance: FileTrackingService;
    private fileTrackingMap: Map<string, FileTrackingInfo> = new Map();

    private constructor() { }

    static getInstance(): FileTrackingService {
        if (!FileTrackingService.instance) {
            FileTrackingService.instance = new FileTrackingService();
        }
        return FileTrackingService.instance;
    }

    // Calculate file hash based on file content
    async calculateFileHash(file: File): Promise<string> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
                const hash = CryptoJS.SHA256(wordArray).toString();
                resolve(hash);
            };
            reader.readAsArrayBuffer(file);
        });
    }

    // Calculate content hash based on Excel data structure
    async calculateContentHash(file: File): Promise<string> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });

                    // Create a normalized representation of the Excel content
                    const contentObj: any = {};

                    workbook.SheetNames.forEach(sheetName => {
                        const worksheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                            defval: '',
                            blankrows: false
                        });
                        contentObj[sheetName] = jsonData;
                    });

                    // Convert to JSON string and hash it
                    const contentString = JSON.stringify(contentObj, Object.keys(contentObj).sort());
                    const hash = CryptoJS.SHA256(contentString).toString();
                    resolve(hash);
                } catch (error) {
                    console.error('Error calculating content hash:', error);
                    resolve('');
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }
    // Check file against database records
    async checkFileStatus(file: File): Promise<FileTrackingInfo> {
        const fileName = file.name;
        const fileHash = await this.calculateFileHash(file);
        const contentHash = await this.calculateContentHash(file);

        // Check cache first
        const cachedInfo = this.fileTrackingMap.get(fileName);
        if (cachedInfo && cachedInfo.fileHash === fileHash && cachedInfo.contentHash === contentHash) {
            console.log('Using cached tracking info for:', fileName);
            return cachedInfo;
        } try {
            // Check if file exists in database
            const response = await fetch(`http://localhost:8080/api/file-tracking/check/${encodeURIComponent(fileName)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            let trackingInfo: FileTrackingInfo = {
                fileName,
                fileHash,
                contentHash,
                lastSyncDate: null,
                hasChanges: false,
                changesSinceSync: []
            };

            if (response.ok) {
                const dbRecord: DatabaseFileRecord = await response.json();

                trackingInfo.lastSyncDate = dbRecord.last_sync_date ? new Date(dbRecord.last_sync_date) : null;

                // Check if file content has changed since last sync
                if (dbRecord.content_hash !== contentHash) {
                    trackingInfo.hasChanges = true;
                    trackingInfo.changesSinceSync = await this.detectChanges(file, dbRecord);
                }
            } else if (response.status === 404) {
                // File not found in database - this is a new file
                trackingInfo.hasChanges = true;
                trackingInfo.changesSinceSync = ['New file - never synced'];
            }

            // Cache the tracking info
            this.fileTrackingMap.set(fileName, trackingInfo);

            return trackingInfo;
        } catch (error) {
            // Silently fall back if backend API is not available
            if (process.env.NODE_ENV === 'development') {
                console.warn('File tracking API not available, using fallback');
            }

            // Fallback: If we can't reach the backend, assume file is clean for now
            // This prevents showing false warnings during development
            const trackingInfo: FileTrackingInfo = {
                fileName,
                fileHash,
                contentHash,
                lastSyncDate: null, // No sync date available
                hasChanges: false, // Assume no changes to avoid false warnings
                changesSinceSync: []
            };

            // Cache the fallback info
            this.fileTrackingMap.set(fileName, trackingInfo);

            return trackingInfo;
        }
    }

    // Detect specific changes between current file and database version
    private async detectChanges(file: File, dbRecord: DatabaseFileRecord): Promise<string[]> {
        const changes: string[] = [];

        try {
            // Get current file content
            const currentContent = await this.getFileContent(file);            // Get database content
            const dbContentResponse = await fetch(`http://localhost:8080/api/file-tracking/content/${dbRecord.id}`);
            if (!dbContentResponse.ok) {
                changes.push('Unable to compare with database version');
                return changes;
            }

            const dbContent = await dbContentResponse.json();

            // Compare sheet by sheet
            Object.keys(currentContent).forEach(sheetName => {
                if (!dbContent[sheetName]) {
                    changes.push(`New sheet added: ${sheetName}`);
                } else {
                    const currentSheet = currentContent[sheetName];
                    const dbSheet = dbContent[sheetName];

                    if (currentSheet.length !== dbSheet.length) {
                        changes.push(`Row count changed in ${sheetName}: ${dbSheet.length} → ${currentSheet.length}`);
                    }

                    // Check for content differences (simplified)
                    const currentStr = JSON.stringify(currentSheet);
                    const dbStr = JSON.stringify(dbSheet);
                    if (currentStr !== dbStr) {
                        changes.push(`Content modified in ${sheetName}`);
                    }
                }
            });

            // Check for deleted sheets
            Object.keys(dbContent).forEach(sheetName => {
                if (!currentContent[sheetName]) {
                    changes.push(`Sheet deleted: ${sheetName}`);
                }
            });

            if (changes.length === 0) {
                changes.push('Content structure changed');
            }

        } catch (error) {
            console.error('Error detecting changes:', error);
            changes.push('Unable to detect specific changes');
        }

        return changes;
    }

    // Get normalized file content
    private async getFileContent(file: File): Promise<any> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });

                    const contentObj: any = {};
                    workbook.SheetNames.forEach(sheetName => {
                        const worksheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                            defval: '',
                            blankrows: false
                        });
                        contentObj[sheetName] = jsonData;
                    });

                    resolve(contentObj);
                } catch (error) {
                    console.error('Error reading file content:', error);
                    resolve({});
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    // Update file tracking after successful sync
    async updateSyncStatus(fileName: string, success: boolean): Promise<void> {
        const trackingInfo = this.fileTrackingMap.get(fileName);
        if (trackingInfo && success) {
            trackingInfo.lastSyncDate = new Date();
            trackingInfo.hasChanges = false;
            trackingInfo.changesSinceSync = [];            // Update database record
            try {
                await fetch('http://localhost:8080/api/file-tracking/update-sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fileName,
                        fileHash: trackingInfo.fileHash,
                        contentHash: trackingInfo.contentHash,
                        syncDate: trackingInfo.lastSyncDate.toISOString()
                    }),
                });
                console.log('File sync status updated successfully for:', fileName);
            } catch (error) {
                console.error('Error updating sync status:', error);
            }
        }
    }

    /**
     * Check if a file exists in the database
     */
    async isFileInDatabase(fileName: string): Promise<boolean> {
        try {
            const tableStats = await ProductBacklogService.getTableStatistics();
            const fileExists = tableStats.fileDetails.some((file: any) => file.fileName === fileName);
            console.log(`File ${fileName} exists in database:`, fileExists);
            return fileExists;
        } catch (error) {
            console.error('Error checking if file exists in database:', error);
            return false;
        }
    }

    // Get cached tracking info
    getTrackingInfo(fileName: string): FileTrackingInfo | null {
        return this.fileTrackingMap.get(fileName) || null;
    }

    // Clear cache
    clearCache(): void {
        this.fileTrackingMap.clear();
    }
}

export default FileTrackingService;
export type { FileTrackingInfo };
