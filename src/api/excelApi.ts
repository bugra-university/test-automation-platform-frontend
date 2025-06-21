import apiClient from './apiClient';

export interface UploadResponse {
    success: boolean;
    message: string;
}

export const uploadAndSaveExcel = async (projectId: number, file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await apiClient.post(`/projects/${projectId}/upload-and-parse`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error: any) {
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