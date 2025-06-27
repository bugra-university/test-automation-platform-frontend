import apiClient from './apiClient';

export interface TestSchedule {
  id?: number;
  projectId: number;
  title?: string;
  userStoryId: string;
  testCaseIds: string[];
  startTime: string; // ISO string
  endTime: string; // ISO string
  scheduleType: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  status: 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PAUSED' | 'CANCELLED';
  createdBy?: string;
  description?: string;
  nextRunTime?: string;
  lastRunTime?: string;
  lastTestRunId?: number;
  repeatSettings?: { [key: string]: any };
  createdAt?: string;
  updatedAt?: string;
}

export interface ScheduleApiResponse<T = any> {
  success: boolean;
  message?: string;
  schedule?: TestSchedule;
  schedules?: TestSchedule[];
  stats?: T;
}

export const scheduleApi = {
  // Create a new schedule
  async createSchedule(projectId: number, schedule: Omit<TestSchedule, 'id' | 'projectId'>): Promise<ScheduleApiResponse> {
    try {
      const response = await apiClient.post(`/api/projects/${projectId}/schedules`, {
        ...schedule,
        projectId
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      throw new Error(error.response?.data?.message || 'Failed to create schedule');
    }
  },

  // Get all schedules for a project
  async getSchedulesByProject(projectId: number): Promise<ScheduleApiResponse> {
    try {
      const response = await apiClient.get(`/api/projects/${projectId}/schedules`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching schedules:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch schedules');
    }
  },

  // Get schedules in date range (for calendar view)
  async getSchedulesInDateRange(
    projectId: number, 
    startDate: string, 
    endDate: string
  ): Promise<ScheduleApiResponse> {
    try {
      const response = await apiClient.get(`/api/projects/${projectId}/schedules/calendar`, {
        params: {
          startDate,
          endDate
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching schedules in date range:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch schedules');
    }
  },

  // Get a specific schedule by ID
  async getScheduleById(projectId: number, scheduleId: number): Promise<ScheduleApiResponse> {
    try {
      const response = await apiClient.get(`/api/projects/${projectId}/schedules/${scheduleId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching schedule:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch schedule');
    }
  },

  // Update a schedule
  async updateSchedule(
    projectId: number, 
    scheduleId: number, 
    schedule: Partial<TestSchedule>
  ): Promise<ScheduleApiResponse> {
    try {
      const response = await apiClient.put(`/api/projects/${projectId}/schedules/${scheduleId}`, {
        ...schedule,
        projectId
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      throw new Error(error.response?.data?.message || 'Failed to update schedule');
    }
  },

  // Delete a schedule
  async deleteSchedule(projectId: number, scheduleId: number): Promise<ScheduleApiResponse> {
    try {
      const response = await apiClient.delete(`/api/projects/${projectId}/schedules/${scheduleId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete schedule');
    }
  },

  // Run a schedule manually
  async runScheduleNow(projectId: number, scheduleId: number): Promise<ScheduleApiResponse> {
    try {
      const response = await apiClient.post(`/api/projects/${projectId}/schedules/${scheduleId}/run`);
      return response.data;
    } catch (error: any) {
      console.error('Error running schedule:', error);
      throw new Error(error.response?.data?.message || 'Failed to run schedule');
    }
  },

  // Toggle schedule status (pause/resume)
  async toggleScheduleStatus(projectId: number, scheduleId: number): Promise<ScheduleApiResponse> {
    try {
      const response = await apiClient.post(`/api/projects/${projectId}/schedules/${scheduleId}/toggle`);
      return response.data;
    } catch (error: any) {
      console.error('Error toggling schedule status:', error);
      throw new Error(error.response?.data?.message || 'Failed to toggle schedule status');
    }
  },

  // Get active schedules
  async getActiveSchedules(projectId: number): Promise<ScheduleApiResponse> {
    try {
      const response = await apiClient.get(`/api/projects/${projectId}/schedules/active`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching active schedules:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch active schedules');
    }
  },

  // Get schedule statistics
  async getScheduleStats(projectId: number): Promise<ScheduleApiResponse> {
    try {
      const response = await apiClient.get(`/api/projects/${projectId}/schedules/stats`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching schedule statistics:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch schedule statistics');
    }
  },

  // Get upcoming schedules
  async getUpcomingSchedules(projectId: number, limit: number = 10): Promise<ScheduleApiResponse> {
    try {
      const response = await apiClient.get(`/api/projects/${projectId}/schedules/upcoming`, {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching upcoming schedules:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch upcoming schedules');
    }
  },

  // Search schedules
  async searchSchedules(projectId: number, query: string): Promise<ScheduleApiResponse> {
    try {
      const response = await apiClient.get(`/api/projects/${projectId}/schedules/search`, {
        params: { query }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error searching schedules:', error);
      throw new Error(error.response?.data?.message || 'Failed to search schedules');
    }
  }
};

// Helper functions for frontend
export const scheduleHelpers = {
  // Convert backend schedule to frontend format
  formatScheduleForCalendar: (schedule: TestSchedule) => ({
    id: schedule.id?.toString() || 'temp',
    text: schedule.title || `${schedule.userStoryId} - Test Schedule`,
    start: schedule.startTime,
    end: schedule.endTime,
    userStory: schedule.userStoryId,
    testCases: schedule.testCaseIds,
    scheduleType: schedule.scheduleType.toLowerCase(),
    status: schedule.status.toLowerCase(),
    backColor: getStatusColor(schedule.status),
    nextRun: schedule.nextRunTime,
    lastRun: schedule.lastRunTime ? {
      date: schedule.lastRunTime,
      status: schedule.status === 'COMPLETED' ? 'passed' : 'failed'
    } : undefined
  }),

  // Convert frontend schedule to backend format
  formatScheduleForBackend: (schedule: any): Omit<TestSchedule, 'id' | 'projectId'> => ({
    title: schedule.title,
    userStoryId: schedule.userStoryId,
    testCaseIds: schedule.testCaseIds,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    scheduleType: schedule.scheduleType.toUpperCase() as TestSchedule['scheduleType'],
    status: schedule.status?.toUpperCase() as TestSchedule['status'] || 'SCHEDULED',
    description: schedule.description,
    createdBy: schedule.createdBy
  }),

  // Get status display name
  getStatusDisplayName: (status: string): string => {
    const statusMap: { [key: string]: string } = {
      'SCHEDULED': 'Scheduled',
      'RUNNING': 'Running',
      'COMPLETED': 'Completed',
      'FAILED': 'Failed',
      'PAUSED': 'Paused',
      'CANCELLED': 'Cancelled'
    };
    return statusMap[status.toUpperCase()] || status;
  },

  // Get schedule type display name
  getScheduleTypeDisplayName: (type: string): string => {
    const typeMap: { [key: string]: string } = {
      'ONCE': 'Run Once',
      'DAILY': 'Daily',
      'WEEKLY': 'Weekly',
      'MONTHLY': 'Monthly'
    };
    return typeMap[type.toUpperCase()] || type;
  },

  // Format date for display
  formatDate: (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  },

  // Calculate next run time for recurring schedules
  calculateNextRunTime: (schedule: TestSchedule): string | null => {
    if (schedule.scheduleType === 'ONCE') return null;
    
    const baseTime = new Date(schedule.lastRunTime || schedule.startTime);
    let nextRun: Date;

    switch (schedule.scheduleType) {
      case 'DAILY':
        nextRun = new Date(baseTime.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'WEEKLY':
        nextRun = new Date(baseTime.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'MONTHLY':
        nextRun = new Date(baseTime);
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
      default:
        return null;
    }

    return nextRun.toISOString();
  }
};

// Helper function for status colors (matches DayPilot colors)
function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'SCHEDULED': return '#2e78d6';  // Blue
    case 'RUNNING':   return '#ff9800';  // Orange
    case 'COMPLETED': return '#4caf50';  // Green
    case 'FAILED':    return '#f44336';  // Red
    case 'PAUSED':    return '#9e9e9e';  // Gray
    case 'CANCELLED': return '#9e9e9e';  // Gray
    default:          return '#2e78d6';
  }
} 