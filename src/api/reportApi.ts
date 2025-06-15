import apiClient from './apiClient';
import { Report } from '../types/testing';

const API_URL = '/api/reports';

export const reportApi = {
    getReports: async (): Promise<Report[]> => {
        const response = await apiClient.get(API_URL);
        return response.data;
    },

    getReport: async (id: number): Promise<Report> => {
        const response = await apiClient.get(`${API_URL}/${id}`);
        return response.data;
    },

    generateReport: async (params: {
        type: 'TEST_RUN' | 'TEST_SUITE' | 'PROJECT';
        format: 'PDF' | 'HTML' | 'CSV';
        entityId: number;
        dateRange: { startDate: string; endDate: string };
    }): Promise<Report> => {
        const response = await apiClient.post(API_URL, params);
        return response.data;
    },

    downloadReport: async (id: number): Promise<Blob> => {
        const response = await apiClient.get(`${API_URL}/${id}/download`, {
            responseType: 'blob'
        });
        return response.data;
    },

    scheduleReport: async (params: {
        reportConfig: {
            type: 'TEST_RUN' | 'TEST_SUITE' | 'PROJECT';
            format: 'PDF' | 'HTML' | 'CSV';
            entityId: number;
        };
        schedule: {
            frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
            time: string;
            emails: string[];
        };
    }): Promise<void> => {
        await apiClient.post(`${API_URL}/schedule`, params);
    }
};
