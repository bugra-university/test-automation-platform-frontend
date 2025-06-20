import apiClient from './apiClient';

export interface Project {
    id: number;
    name: string;
    description: string;
    owner_id: number;
    owner_username: string;
    created_at: string;
    updated_at: string;
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
    // Get all projects for current user
    getProjects: async (): Promise<Project[]> => {
        const response = await apiClient.get<ProjectResponse>(API_URL);
        return response.data.projects ?? [];
    },

    // Create a new project
    createProject: async (data: CreateProjectRequest): Promise<Project> => {
        const response = await apiClient.post<ProjectResponse>(API_URL, data);
        if (!response.data.success || !response.data.project) {
            throw new Error(response.data.message ?? 'Failed to create project');
        }
        return response.data.project;
    },

    // Get a specific project by ID
    getProject: async (id: number): Promise<Project> => {
        const response = await apiClient.get<ProjectResponse>(`${API_URL}/${id}`);
        if (!response.data.success || !response.data.project) {
            throw new Error(response.data.message ?? 'Project not found');
        }
        return response.data.project;
    }
};
