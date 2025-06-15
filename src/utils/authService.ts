import apiClient from '../api/apiClient';

/**
 * Authentication utility service
 */
const authService = {
    /**
     * Login with username and password
     */
    login: async (username: string, password: string) => {
        try {
            // Use apiClient instead of axios to ensure baseURL is used
            const response = await apiClient.post('/auth/login', { username, password });
            if (response.status === 200) {
                localStorage.setItem('auth_user', JSON.stringify(response.data));
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    },

    /**
     * Logout the current user
     */
    logout: () => {
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: () => {
        return localStorage.getItem('auth_user') !== null;
    },

    /**
     * Get current user info
     */
    getUserInfo: () => {
        const userStr = localStorage.getItem('auth_user');
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Decode JWT token
     */
    decodeJWT: (token: string): any => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (error) {
            console.error('Error decoding JWT:', error);
            return null;
        }
    }
};

export default authService;
