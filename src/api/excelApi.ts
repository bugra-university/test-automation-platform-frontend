import apiClient from './apiClient';

export interface UploadResponse {
    success: boolean;
    message: string;
}

export interface ProjectExcelData {
    fileName: string;
    fileData: Blob;
    hasData: boolean;
}

export const uploadAndSaveExcel = async (projectId: number, file: File): Promise<UploadResponse> => {
    console.log('Starting Excel upload for project:', projectId);
    console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type
    });

    const formData = new FormData();
    formData.append('file', file);

    try {
        console.log('Sending request to:', `/api/projects/${projectId}/upload-and-parse`);
        const response = await apiClient.post(`/api/projects/${projectId}/upload-and-parse`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log('Upload response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Upload error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            error: error.message
        });

        if (error.response) {
            return {
                success: false,
                message: error.response.data.message || 'An unknown error occurred during upload.',
            };
        }
        return {
            success: false,
            message: error.message || 'Network error or server is not reachable.',
        };
    }
};

export const getProjectExcel = async (projectId: number): Promise<ProjectExcelData | null> => {
    try {
        console.log('Fetching Excel data for project:', projectId);
        const response = await apiClient.get(`/api/projects/${projectId}/latest-excel`, {
            responseType: 'blob'
        });

        if (response.data.size === 0) {
            console.log('No Excel data found for project:', projectId);
            return null;
        }

        const contentDisposition = response.headers['content-disposition'];
        let fileName = `project_${projectId}_data.xlsx`;

        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
            if (fileNameMatch) {
                fileName = fileNameMatch[1];
            }
        }

        return {
            fileName,
            fileData: response.data,
            hasData: true
        };
    } catch (error: any) {
        console.error('Error fetching project Excel:', error);
        if (error.response?.status === 404) {
            console.log('No Excel file found for project:', projectId);
            return null;
        }
        throw error;
    }
};

export const deleteProjectExcel = async (projectId: number): Promise<UploadResponse> => {
    try {
        console.log('Deleting Excel data for project:', projectId);
        const response = await apiClient.delete(`/api/projects/${projectId}/excel`);
        console.log('Delete response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Delete error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            error: error.message
        });

        if (error.response) {
            return {
                success: false,
                message: error.response.data.message || 'An unknown error occurred during deletion.',
            };
        }
        return {
            success: false,
            message: error.message || 'Network error or server is not reachable.',
        };
    }
}; 