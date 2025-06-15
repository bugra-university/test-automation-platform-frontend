import apiClient from './apiClient';
import { User } from '../types/auth';

export const authApi = {
    syncUser: () => {
        return apiClient.get('/auth/sync-user');
    },

    getCurrentUser: () => {
        return apiClient.get<User>('/users/me');
    },

    login: (credentials: { username: string; password: string }) => {
        return apiClient.post('/auth/login', credentials);
    }
};
