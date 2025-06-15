import apiClient from './apiClient';
import { TestCase, TestStep } from '../types/testing';

const API_URL = '/api/test-cases';

export const testCaseApi = {
    getTestCase: async (id: number): Promise<TestCase> => {
        const response = await apiClient.get(`${API_URL}/${id}`);
        return response.data;
    },

    updateTestCase: async (id: number, testCase: Partial<TestCase>): Promise<TestCase> => {
        const response = await apiClient.put(`${API_URL}/${id}`, testCase);
        return response.data;
    },

    deleteTestCase: async (id: number): Promise<void> => {
        await apiClient.delete(`${API_URL}/${id}`);
    },

    getSteps: async (caseId: number): Promise<TestStep[]> => {
        const response = await apiClient.get(`${API_URL}/${caseId}/steps`);
        return response.data;
    },

    updateStep: async (caseId: number, stepId: number, step: Partial<TestStep>): Promise<TestStep> => {
        const response = await apiClient.put(`${API_URL}/${caseId}/steps/${stepId}`, step);
        return response.data;
    },

    createStep: async (caseId: number, step: Partial<TestStep>): Promise<TestStep> => {
        const response = await apiClient.post(`${API_URL}/${caseId}/steps`, step);
        return response.data;
    },

    deleteStep: async (caseId: number, stepId: number): Promise<void> => {
        await apiClient.delete(`${API_URL}/${caseId}/steps/${stepId}`);
    },

    reorderSteps: async (caseId: number, stepIds: number[]): Promise<void> => {
        await apiClient.post(`${API_URL}/${caseId}/steps/reorder`, { stepIds });
    }
};
