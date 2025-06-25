import apiClient from './apiClient';

const API_URL = '/api/projects';

export interface ReportData {
  id: string;
  fileName: string;
  displayName: string;
  createdDate: string;
  fileSize: string;
  status: 'pass' | 'fail' | 'unknown';
  passCount: number;
  failCount: number;
  duration: string;
  userStory: string;
  testCases: string[];
}

export interface ReportsResponse {
  success: boolean;
  message: string;
  reports: ReportData[];
  count: number;
}

export interface ReportsStatistics {
  totalReports: number;
  passedReports: number;
  failedReports: number;
  totalSize: string;
}

export interface ReportsStatisticsResponse {
  success: boolean;
  statistics: ReportsStatistics;
}

export const reportsApi = {
  // Get all reports for a project
  getReports: async (projectId: number): Promise<ReportsResponse> => {
    try {
      const response = await apiClient.get(`${API_URL}/${projectId}/reports`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  // Get specific report HTML content
  getReportContent: async (projectId: number, reportId: string): Promise<string> => {
    try {
      const response = await apiClient.get(`${API_URL}/${projectId}/reports/${reportId}/content`);
      return response.data;
    } catch (error) {
      console.error('Error fetching report content:', error);
      throw error;
    }
  },

  // Download specific report
  downloadReport: async (projectId: number, reportId: string): Promise<void> => {
    try {
      const response = await apiClient.get(`${API_URL}/${projectId}/reports/${reportId}/download`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from response headers or use reportId
      const contentDisposition = response.headers['content-disposition'];
      let filename = reportId;
      if (contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    }
  },

  // Delete specific report
  deleteReport: async (projectId: number, reportId: string): Promise<void> => {
    try {
      await apiClient.delete(`${API_URL}/${projectId}/reports/${reportId}`);
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  },

  // Get reports statistics
  getReportsStatistics: async (projectId: number): Promise<ReportsStatisticsResponse> => {
    try {
      const response = await apiClient.get(`${API_URL}/${projectId}/reports/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reports statistics:', error);
      throw error;
    }
  }
}; 