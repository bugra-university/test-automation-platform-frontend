import apiClient from './apiClient';

const API_URL = '/api/projects';

export interface StepExecutionEvent {
    eventType: 'step_started' | 'step_completed' | 'step_failed' | 'step_connected';
    data: {
        testCaseId?: number;
        stepNumber?: number;
        stepDescription?: string;
        status?: 'pending' | 'running' | 'passed' | 'failed';
        startTime?: string;
        endTime?: string;
        duration?: number;
        errorMessage?: string;
        executionId?: string;
    };
}

export interface StepSSEConnectionManager {
    connect: (projectId: number, onEvent: (event: StepExecutionEvent) => void) => void;
    disconnect: () => void;
    isConnected: () => boolean;
}

export interface StepTrackingResponse {
    success: boolean;
    message?: string;
    stepInfo?: {
        testCaseId: number;
        stepNumber: number;
        stepDescription?: string;
        status: string;
        executionId: string;
    };
}

export const stepTrackingApi = {
    /**
     * Create Server-Sent Events connection for real-time step execution updates
     */
    createStepEventStream: (projectId: number, onEvent: (event: StepExecutionEvent) => void): StepSSEConnectionManager => {
        let eventSource: EventSource | null = null;
        let isConnected = false;

        const connect = (projectId: number, onEvent: (event: StepExecutionEvent) => void) => {
            if (eventSource) {
                eventSource.close();
            }

            // Use full URL with backend address
            const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8081';
            const url = `${baseURL}/api/projects/${projectId}/test-suites/steps/events`;
            console.log('[StepSSE] Connecting to:', url);

            eventSource = new EventSource(url);

            // Handle connection opened
            eventSource.onopen = () => {
                console.log('[StepSSE] Step tracking connection established for project', projectId);
                isConnected = true;
            };

            // Handle specific step events
            eventSource.addEventListener('step_connected', (event) => {
                console.log('[StepSSE] Step tracking connected:', event.data);
                onEvent({
                    eventType: 'step_connected',
                    data: {}
                });
            });

            eventSource.addEventListener('step_started', (event) => {
                console.log('[StepSSE] Step started:', event.data);
                try {
                    const data = JSON.parse(event.data);
                    onEvent({
                        eventType: 'step_started',
                        data: data
                    });
                } catch (e) {
                    console.error('[StepSSE] Error parsing step_started event:', e);
                }
            });

            eventSource.addEventListener('step_completed', (event) => {
                console.log('[StepSSE] Step completed:', event.data);
                try {
                    const data = JSON.parse(event.data);
                    onEvent({
                        eventType: 'step_completed',
                        data: data
                    });
                } catch (e) {
                    console.error('[StepSSE] Error parsing step_completed event:', e);
                }
            });

            eventSource.addEventListener('step_failed', (event) => {
                console.log('[StepSSE] Step failed:', event.data);
                try {
                    const data = JSON.parse(event.data);
                    onEvent({
                        eventType: 'step_failed',
                        data: data
                    });
                } catch (e) {
                    console.error('[StepSSE] Error parsing step_failed event:', e);
                }
            });

            // Handle errors
            eventSource.onerror = (error) => {
                console.error('[StepSSE] Step tracking connection error:', error);
                isConnected = false;

                // Attempt to reconnect after 3 seconds
                setTimeout(() => {
                    if (!isConnected) {
                        console.log('[StepSSE] Attempting to reconnect step tracking...');
                        connect(projectId, onEvent);
                    }
                }, 3000);
            };
        };

        const disconnect = () => {
            if (eventSource) {
                console.log('[StepSSE] Disconnecting step tracking...');
                eventSource.close();
                eventSource = null;
                isConnected = false;
            }
        };

        const isConnectedFn = () => isConnected;

        return {
            connect,
            disconnect,
            isConnected: isConnectedFn
        };
    },

    /**
     * Manually start a step (for testing/debugging)
     */
    startStep: async (
        projectId: number,
        testCaseId: number,
        stepNumber: number,
        stepDescription: string,
        executionId?: string
    ): Promise<StepTrackingResponse> => {
        try {
            const payload = {
                stepDescription,
                executionId: executionId || `manual_${Date.now()}`
            };

            const response = await apiClient.post(
                `${API_URL}/${projectId}/test-suites/${testCaseId}/steps/${stepNumber}/start`,
                payload
            );

            return {
                success: true,
                message: response.data.message,
                stepInfo: response.data.stepInfo
            };
        } catch (error: any) {
            console.error('Failed to start step:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to start step'
            };
        }
    },

    /**
     * Manually complete a step (for testing/debugging)
     */
    completeStep: async (
        projectId: number,
        testCaseId: number,
        stepNumber: number,
        executionId?: string
    ): Promise<StepTrackingResponse> => {
        try {
            const payload = {
                executionId: executionId || `manual_${Date.now()}`
            };

            const response = await apiClient.post(
                `${API_URL}/${projectId}/test-suites/${testCaseId}/steps/${stepNumber}/complete`,
                payload
            );

            return {
                success: true,
                message: response.data.message,
                stepInfo: response.data.stepInfo
            };
        } catch (error: any) {
            console.error('Failed to complete step:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to complete step'
            };
        }
    },

    /**
     * Manually fail a step (for testing/debugging)
     */
    failStep: async (
        projectId: number,
        testCaseId: number,
        stepNumber: number,
        errorMessage: string,
        executionId?: string
    ): Promise<StepTrackingResponse> => {
        try {
            const payload = {
                errorMessage,
                executionId: executionId || `manual_${Date.now()}`
            };

            const response = await apiClient.post(
                `${API_URL}/${projectId}/test-suites/${testCaseId}/steps/${stepNumber}/fail`,
                payload
            );

            return {
                success: true,
                message: response.data.message,
                stepInfo: response.data.stepInfo
            };
        } catch (error: any) {
            console.error('Failed to fail step:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fail step'
            };
        }
    }
}; 