import apiClient from './apiClient';

export interface UploadResponse {
    success: boolean;
    message: string;
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