import apiClient from './apiClient';
import { TestRun, TestResult } from '../types/testing';

const API_URL = '/api/test-runs';

export const testRunApi = {
    getTestRuns: async (): Promise<TestRun[]> => {
        const response = await apiClient.get(API_URL);
        return response.data;
    },

    getTestRun: async (id: number): Promise<TestRun> => {
        const response = await apiClient.get(`${API_URL}/${id}`);
        return response.data;
    },

    createTestRun: async (testRun: Partial<TestRun>): Promise<TestRun> => {
        const response = await apiClient.post(API_URL, testRun);
        return response.data;
    },

    startTestRun: async (id: number): Promise<TestRun> => {
        const response = await apiClient.post(`${API_URL}/${id}/start`);
        return response.data;
    },

    stopTestRun: async (id: number): Promise<TestRun> => {
        const response = await apiClient.post(`${API_URL}/${id}/stop`);
        return response.data;
    },

    getTestResults: async (runId: number): Promise<TestResult[]> => {
        const response = await apiClient.get(`${API_URL}/${runId}/results`);
        return response.data;
    },

    getTestResultDetails: async (runId: number, resultId: number): Promise<TestResult> => {
        const response = await apiClient.get(`${API_URL}/${runId}/results/${resultId}`);
        return response.data;
    }
};
