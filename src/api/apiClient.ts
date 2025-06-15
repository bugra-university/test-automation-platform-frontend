import axios from 'axios';
import authService from '../utils/authService';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Authentication interceptor that adds credentials to every request
apiClient.interceptors.request.use(
    async (config) => {
        // Check if user is authenticated
        if (authService.isAuthenticated()) {
            const userInfo = authService.getUserInfo();
            if (userInfo) {
                // Add Basic Auth or pass the username in headers - depends on your backend setup
                // For a more secure approach, you would typically use sessions or JWT tokens
                config.headers['Authorization'] = `Basic ${btoa(`${userInfo.username}:${userInfo.password || ''}`)}`;
                // Or just set the username for identification
                config.headers['X-User-ID'] = userInfo.username;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Error response interceptor to handle authentication errors
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        // Handle 401 Unauthorized or 403 Forbidden errors
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Log user out on auth errors
            store.dispatch(logout());
            authService.logout(); // This will redirect to login page
        } return Promise.reject(error);
    }
);

export default apiClient;
