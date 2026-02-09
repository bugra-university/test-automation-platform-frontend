import apiClient from './apiClient';

export interface Project {
    id: number;
    name: string;
    description: string;
    ownerId: number;
    ownerUsername: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProjectRequest {
    name: string;
    description: string;
}

export interface ProjectResponse {
    success: boolean;
    project?: Project;
    projects?: Project[];
    message?: string;
}

const API_URL = '/api/projects';

export const projectsApi = {
    getProjects: async (): Promise<Project[]> => {
        const response = await apiClient.get<ProjectResponse>(API_URL);
        return response.data.projects ?? [];
    },

    createProject: async (data: CreateProjectRequest): Promise<Project> => {
        const response = await apiClient.post<ProjectResponse>(API_URL, data);
        if (!response.data.success || !response.data.project) {
            throw new Error(response.data.message ?? 'Failed to create project');
        }
        return response.data.project;
    },

    getProject: async (id: number): Promise<Project> => {
        const response = await apiClient.get<ProjectResponse>(`${API_URL}/${id}`);
        if (!response.data.success || !response.data.project) {
            throw new Error(response.data.message ?? 'Project not found');
        }
        return response.data.project;
    },

    deleteProject: async (id: number): Promise<void> => {
        const response = await apiClient.delete<ProjectResponse>(`${API_URL}/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.message ?? 'Failed to delete project');
        }
    },

    updateProject: async (id: number, data: { name: string; description: string }): Promise<Project> => {
        const response = await apiClient.post<ProjectResponse>(`${API_URL}/${id}/update`, data);
        if (!response.data.success || !response.data.project) {
            throw new Error(response.data.message ?? 'Failed to update project');
        }
        return response.data.project;
    },

    getProjectDatabaseActivity: async (projectId: number) => {
        try {
            const response = await apiClient.get(`${API_URL}/${projectId}/database-activity`);
            return response.data;
        } catch (error) {
            console.error('Error fetching project database activity:', error);
            throw error;
        }
    }
};
