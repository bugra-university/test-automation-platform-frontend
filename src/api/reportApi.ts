import apiClient from './apiClient';

export interface TestReport {
  id: string;
  fileName: string;
  title: string;
  description: string;
  testCase: string;
  status: 'passed' | 'failed' | 'mixed';
  passedCount: number;
  totalCount: number;
  executedAt: string;
  fileSize: string;
  duration: string;
  filePath: string;
  createdAt: string;
  testName: string;
  startTime?: string;
  endTime?: string;
  stepsCount?: number;
}

export interface ReportStats {
  total: number;
  passed: number;
  failed: number;
  mixed: number;
}

// Get all test reports
export const getAllReports = async (): Promise<TestReport[]> => {
  try {
    const response = await apiClient.get('/api/reports');
    return response.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

// Get reports by status
export const getReportsByStatus = async (status: string): Promise<TestReport[]> => {
  try {
    const response = await apiClient.get(`/api/reports/status/${status}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching reports by status ${status}:`, error);
    throw error;
  }
};

// Get a specific report by ID
export const getReportById = async (reportId: string): Promise<TestReport> => {
  try {
    const response = await apiClient.get(`/api/reports/${reportId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching report ${reportId}:`, error);
    throw error;
  }
};

// Download a report file
export const downloadReport = async (reportId: string): Promise<void> => {
  try {
    const response = await apiClient.get(`/api/reports/${reportId}/download`, {
      responseType: 'blob'
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from response headers or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = `report_${reportId}.html`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Error downloading report ${reportId}:`, error);
    throw error;
  }
};

// View report content in new window
export const viewReport = async (reportId: string): Promise<void> => {
  try {
    const response = await apiClient.get(`/api/reports/${reportId}/view`);
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(response.data);
      newWindow.document.close();
    }
  } catch (error) {
    console.error(`Error viewing report ${reportId}:`, error);
    throw error;
  }
};

// Delete a report
export const deleteReport = async (reportId: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/reports/${reportId}`);
  } catch (error) {
    console.error(`Error deleting report ${reportId}:`, error);
    throw error;
  }
};

// Get report statistics
export const getReportStats = async (): Promise<ReportStats> => {
  try {
    const response = await apiClient.get('/api/reports/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching report stats:', error);
    throw error;
  }
};
