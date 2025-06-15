import apiClient from './apiClient';
import { TestSuite, TestCase, TestRun, TestResult } from '../types/testing';

const API_URL = '/api/test-suites';

export const testSuiteApi = {
    getTestSuites: async (): Promise<TestSuite[]> => {
        const response = await apiClient.get(API_URL);
        return response.data;
    },

    getTestSuite: async (id: number): Promise<TestSuite> => {
        const response = await apiClient.get(`${API_URL}/${id}`);
        return response.data;
    },

    createTestSuite: async (testSuite: Partial<TestSuite>): Promise<TestSuite> => {
        const response = await apiClient.post(API_URL, testSuite);
        return response.data;
    },

    updateTestSuite: async (id: number, testSuite: Partial<TestSuite>): Promise<TestSuite> => {
        const response = await apiClient.put(`${API_URL}/${id}`, testSuite);
        return response.data;
    },

    deleteTestSuite: async (id: number): Promise<void> => {
        await apiClient.delete(`${API_URL}/${id}`);
    },

    getTestCases: async (suiteId: number): Promise<TestCase[]> => {
        const response = await apiClient.get(`${API_URL}/${suiteId}/test-cases`);
        return response.data;
    },

    addTestCase: async (suiteId: number, testCase: Partial<TestCase>): Promise<TestCase> => {
        const response = await apiClient.post(`${API_URL}/${suiteId}/test-cases`, testCase);
        return response.data;
    }
};
