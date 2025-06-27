import React, { useState, useEffect } from 'react';
import { DayPilot, DayPilotCalendar, DayPilotNavigator } from "@daypilot/daypilot-lite-react";
import { testSuitesApi, TestSuite, TestCase } from '../../../api/testSuitesApi';
import { scheduleApi } from '../../../api/scheduleApi';
import AlertDelete from '../Alert/AlertDelete';
import "./SchedulesTab.css";

const styles = {
  wrap: {
    display: "flex"
  },
  left: {
    marginRight: "10px"
  },
  main: {
    flexGrow: "1"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
    padding: "0 1rem"
  }
};

interface TestSchedule {
  id: string;
  text: string;
  start: string;
  end: string;
  userStory: string;
  testCases: string[];
  scheduleType: 'once' | 'daily' | 'weekly' | 'monthly';
  status: 'scheduled' | 'running' | 'completed' | 'failed' | 'paused';
  backColor?: string;
  nextRun?: string;
  lastRun?: {
    date: string;
    status: 'passed' | 'failed';
  };
}

interface SchedulesTabProps {
  selectedProjectId: number | null;
}

const SchedulesTab: React.FC<SchedulesTabProps> = ({ selectedProjectId }) => {
  const [calendar, setCalendar] = useState<any>(null);
  const [schedules, setSchedules] = useState<TestSchedule[]>([]);
  const [startDate, setStartDate] = useState<any>(DayPilot.Date.today());
  const [scheduleModal, setScheduleModal] = useState({
    isOpen: false,
    mode: 'create' as 'create' | 'edit',
    schedule: null as TestSchedule | null,
    startTime: '',
    endTime: ''
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    schedule: null as TestSchedule | null,
    isDeleting: false
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'scheduled': return '#2e78d6';  // Mavi
      case 'running':   return '#ff9800';  // Turuncu  
      case 'completed': return '#4caf50';  // Yeşil
      case 'failed':    return '#f44336';  // Kırmızı
      case 'paused':    return '#9e9e9e';  // Gri
      default:          return '#2e78d6';
    }
  };

  const config = {
    viewType: "Week" as const,
    durationBarVisible: false,
    timeRangeSelectedHandling: "Enabled" as const,
    
    onTimeRangeSelected: async (args: any) => {
      if (!selectedProjectId) {
        console.warn('No project selected');
        calendar.clearSelection();
        return;
      }
      
      // Custom modal açacağız (DayPilot.Modal.prompt yerine)
      setScheduleModal({
        isOpen: true,
        mode: 'create',
        schedule: null,
        startTime: args.start.toString(),
        endTime: args.end.toString()
      });
      calendar.clearSelection();
    },
    
    onEventClick: async (args: any) => {
      // Event detaylarını göster
      const schedule = schedules.find(s => s.id === args.e.id());
      if (schedule) {
        setScheduleModal({
          isOpen: true,
          mode: 'edit',
          schedule: schedule,
          startTime: schedule.start,
          endTime: schedule.end
        });
      }
    },
    
    contextMenu: new DayPilot.Menu({
      items: [
        {
          text: "View Details",
          onClick: async (args: any) => {
            const schedule = schedules.find(s => s.id === args.source.id());
            if (schedule) {
              setScheduleModal({
                isOpen: true,
                mode: 'edit',
                schedule: schedule,
                startTime: schedule.start,
                endTime: schedule.end
              });
            }
          },
        },
        {
          text: "Run Now",
          onClick: async (args: any) => {
            if (!selectedProjectId) return;
            
            try {
              const scheduleId = parseInt(args.source.id());
              await scheduleApi.runScheduleNow(selectedProjectId, scheduleId);
              console.log("Schedule run request sent successfully");
              // Could add toast notification here
              
              // Reload schedules to show updated status
              const response = await scheduleApi.getSchedulesByProject(selectedProjectId);
              if (response.success && response.schedules) {
                const calendarSchedules = response.schedules.map(schedule => {
                  // Convert UTC times to Turkey timezone for display
                  const startUTC = new Date(schedule.startTime);
                  const endUTC = new Date(schedule.endTime);
                  const turkeyOffset = 3 * 60 * 60 * 1000; // UTC+3 in milliseconds
                  
                  return {
                    id: schedule.id?.toString() || 'temp',
                    text: schedule.title || `${schedule.userStoryId} - Test Schedule`,
                    start: new Date(startUTC.getTime() + turkeyOffset).toISOString(),
                    end: new Date(endUTC.getTime() + turkeyOffset).toISOString(),
                    userStory: schedule.userStoryId,
                    testCases: schedule.testCaseIds,
                    scheduleType: schedule.scheduleType.toLowerCase() as 'once' | 'daily' | 'weekly' | 'monthly',
                    status: schedule.status.toLowerCase() as 'scheduled' | 'running' | 'completed' | 'failed' | 'paused',
                    backColor: getStatusColor(schedule.status),
                    nextRun: schedule.nextRunTime,
                    lastRun: schedule.lastRunTime ? {
                      date: schedule.lastRunTime,
                      status: schedule.status === 'COMPLETED' ? 'passed' as const : 'failed' as const
                    } : undefined
                  };
                });
                setSchedules(calendarSchedules);
              }
            } catch (error) {
              console.error("Error running schedule:", error);
              // Could add toast notification here
            }
          },
        },
        {
          text: "-"
        },
        {
          text: "Edit Schedule",
          onClick: async (args: any) => {
            const schedule = schedules.find(s => s.id === args.source.id());
            if (schedule) {
              setScheduleModal({
                isOpen: true,
                mode: 'edit',
                schedule: schedule,
                startTime: schedule.start,
                endTime: schedule.end
              });
            }
          }
        },
        {
          text: "Delete",
          onClick: async (args: any) => {
            if (!selectedProjectId) return;
            
            const schedule = schedules.find(s => s.id === args.source.id());
            if (schedule) {
              setDeleteModal({
                isOpen: true,
                schedule: schedule,
                isDeleting: false
              });
            }
          },
        }
      ]
    }),
    
    onBeforeEventRender: (args: any) => {
      const schedule = schedules.find(s => s.id === args.data.id);
      if (schedule) {
        args.data.backColor = getStatusColor(schedule.status);
        
        // Status icon ekle
        args.data.areas = [
          {
            top: 3,
            right: 3,
            width: 20,
            height: 20,
            symbol: "icons/daypilot.svg#minichevron-down-2",
            fontColor: "#fff",
            toolTip: "Show context menu",
            action: "ContextMenu",
          }
        ];

        // Test case count badge
        if (schedule.testCases && schedule.testCases.length > 0) {
          args.data.areas.push({
            bottom: 3,
            left: 3,
            width: 20,
            height: 16,
            text: schedule.testCases.length.toString(),
            fontColor: "#fff",
            backColor: "rgba(0,0,0,0.3)",
            style: "border-radius: 8px; font-size: 10px; text-align: center; line-height: 16px;",
            toolTip: `${schedule.testCases.length} test cases`
          });
        }
      }
    }
  };

  // Load schedules from API
  useEffect(() => {
    if (!selectedProjectId) return;

    const loadSchedules = async () => {
      try {
        const response = await scheduleApi.getSchedulesByProject(selectedProjectId);
        if (response.success && response.schedules) {
          // Convert API schedules to calendar format
          const calendarSchedules = response.schedules.map(schedule => {
            // Convert UTC times to Turkey timezone for display
            const startUTC = new Date(schedule.startTime);
            const endUTC = new Date(schedule.endTime);
            const turkeyOffset = 3 * 60 * 60 * 1000; // UTC+3 in milliseconds
            
            return {
              id: schedule.id?.toString() || 'temp',
              text: schedule.title || `${schedule.userStoryId} - Test Schedule`,
              start: new Date(startUTC.getTime() + turkeyOffset).toISOString(),
              end: new Date(endUTC.getTime() + turkeyOffset).toISOString(),
              userStory: schedule.userStoryId,
              testCases: schedule.testCaseIds,
              scheduleType: schedule.scheduleType.toLowerCase() as 'once' | 'daily' | 'weekly' | 'monthly',
              status: schedule.status.toLowerCase() as 'scheduled' | 'running' | 'completed' | 'failed' | 'paused',
              backColor: getStatusColor(schedule.status),
              nextRun: schedule.nextRunTime,
              lastRun: schedule.lastRunTime ? {
                date: schedule.lastRunTime,
                status: schedule.status === 'COMPLETED' ? 'passed' as const : 'failed' as const
              } : undefined
            };
          });
          setSchedules(calendarSchedules);
        }
      } catch (error) {
        console.error('Error loading schedules:', error);
        // Keep existing schedules or show empty state
      }
    };

    loadSchedules();
  }, [selectedProjectId]);

  const handleCreateSchedule = () => {
    if (!selectedProjectId) {
      console.warn('No project selected');
      return;
    }
    
    setScheduleModal({
      isOpen: true,
      mode: 'create',
      schedule: null,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    });
  };

  const handleDeleteSchedule = async () => {
    if (!selectedProjectId || !deleteModal.schedule) return;
    
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    
    try {
      const scheduleId = parseInt(deleteModal.schedule.id);
      await scheduleApi.deleteSchedule(selectedProjectId, scheduleId);
      console.log("Schedule deleted successfully");
      
      // Remove from local state
      setSchedules(prev => prev.filter(s => s.id !== deleteModal.schedule?.id));
      
      // Close modal
      setDeleteModal({
        isOpen: false,
        schedule: null,
        isDeleting: false
      });
    } catch (error) {
      console.error("Error deleting schedule:", error);
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
      // Could add toast notification here
    }
  };

  return (
    <div className="schedules-tab-container" style={{ 
      width: "100%", 
      height: "100%", 
      display: "flex", 
      flexDirection: "column", 
      overflow: "hidden",
      background: "#f8f9fa"
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "24px 24px 1rem 24px",
        background: "#f8f9fa"
      }}>
        <button
          onClick={handleCreateSchedule}
          disabled={!selectedProjectId}
          style={{
            background: selectedProjectId ? "#1976d2" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            cursor: selectedProjectId ? "pointer" : "not-allowed",
            fontWeight: 500,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          + New Schedule
        </button>
      </div>

      {/* Calendar Layout */}
      <div style={{
        ...styles.wrap, 
        padding: "0 24px 24px 24px", 
        flex: 1,
        overflow: "hidden"
      }}>
        <div style={styles.left}>
          <DayPilotNavigator
            selectMode={"Week"}
            showMonths={3}
            skipMonths={3}
            selectionDay={startDate}
            onTimeRangeSelected={(args: any) => {
              setStartDate(args.day);
            }}
          />
        </div>
        <div style={styles.main}>
          <DayPilotCalendar
            {...config}
            events={schedules}
            startDate={startDate}
            controlRef={setCalendar}
          />
        </div>
      </div>

      {/* Test Schedule Modal */}
      {scheduleModal.isOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            minWidth: "500px",
            maxWidth: "700px",
            maxHeight: "80vh",
            overflow: "auto"
          }}>
            <h3 style={{ 
              marginBottom: "20px", 
              fontSize: "18px", 
              fontWeight: "600",
              color: "#333"
            }}>
              {scheduleModal.mode === 'create' ? 'Create New Test Schedule' : 'Edit Test Schedule'}
            </h3>
            
            <ScheduleForm 
              mode={scheduleModal.mode}
              schedule={scheduleModal.schedule}
              startTime={scheduleModal.startTime}
              endTime={scheduleModal.endTime}
              selectedProjectId={selectedProjectId}
              onSave={async (newSchedule) => {
                if (scheduleModal.mode === 'create') {
                  setSchedules(prev => [...prev, newSchedule]);
                } else {
                  setSchedules(prev => prev.map(s => 
                    s.id === newSchedule.id ? newSchedule : s
                  ));
                }
                setScheduleModal({ ...scheduleModal, isOpen: false });
                
                // Reload schedules from API to ensure consistency
                if (selectedProjectId) {
                  try {
                    const response = await scheduleApi.getSchedulesByProject(selectedProjectId);
                    if (response.success && response.schedules) {
                      const calendarSchedules = response.schedules.map(schedule => {
                        // Convert UTC times to Turkey timezone for display
                        const startUTC = new Date(schedule.startTime);
                        const endUTC = new Date(schedule.endTime);
                        const turkeyOffset = 3 * 60 * 60 * 1000; // UTC+3 in milliseconds
                        
                        return {
                          id: schedule.id?.toString() || 'temp',
                          text: schedule.title || `${schedule.userStoryId} - Test Schedule`,
                          start: new Date(startUTC.getTime() + turkeyOffset).toISOString(),
                          end: new Date(endUTC.getTime() + turkeyOffset).toISOString(),
                          userStory: schedule.userStoryId,
                          testCases: schedule.testCaseIds,
                          scheduleType: schedule.scheduleType.toLowerCase() as 'once' | 'daily' | 'weekly' | 'monthly',
                          status: schedule.status.toLowerCase() as 'scheduled' | 'running' | 'completed' | 'failed' | 'paused',
                          backColor: getStatusColor(schedule.status),
                          nextRun: schedule.nextRunTime,
                          lastRun: schedule.lastRunTime ? {
                            date: schedule.lastRunTime,
                            status: schedule.status === 'COMPLETED' ? 'passed' as const : 'failed' as const
                          } : undefined
                        };
                      });
                      setSchedules(calendarSchedules);
                    }
                  } catch (error) {
                    console.error('Error reloading schedules:', error);
                  }
                }
              }}
              onCancel={() => setScheduleModal({ ...scheduleModal, isOpen: false })}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AlertDelete
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, schedule: null, isDeleting: false })}
        onConfirm={handleDeleteSchedule}
        title={deleteModal.schedule?.text || 'this schedule'}
        isDeleting={deleteModal.isDeleting}
        type="schedule"
      />
    </div>
  );
};

// ScheduleForm Component
interface ScheduleFormProps {
  mode: 'create' | 'edit';
  schedule: TestSchedule | null;
  startTime: string;
  endTime: string;
  selectedProjectId: number | null;
  onSave: (schedule: TestSchedule) => void;
  onCancel: () => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ 
  mode, 
  schedule, 
  startTime, 
  endTime, 
  selectedProjectId,
  onSave, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    title: schedule?.text || '',
    userStory: schedule?.userStory || '',
    testCases: schedule?.testCases || [],
    scheduleType: schedule?.scheduleType || 'once' as const,
    status: schedule?.status || 'scheduled' as const,
    startDateTime: schedule?.start || startTime,
    endDateTime: schedule?.end || endTime,
    description: ''
  });

  const [selectedTestCases, setSelectedTestCases] = useState<string[]>(
    schedule?.testCases || []
  );

  // API data states
  const [userStories, setUserStories] = useState<TestSuite[]>([]);
  const [testCasesByUserStory, setTestCasesByUserStory] = useState<{ [key: string]: TestCase[] }>({});
  const [loadingUserStories, setLoadingUserStories] = useState(false);
  const [loadingTestCases, setLoadingTestCases] = useState(false);

  // Load user stories from API
  useEffect(() => {
    if (!selectedProjectId) return;

    const loadUserStories = async () => {
      setLoadingUserStories(true);
      try {
        const response = await testSuitesApi.getTestSuites(selectedProjectId);
        if (response.success) {
          setUserStories(response.testSuites);
          
          // If in edit mode and schedule has a user story, load its test cases
          if (mode === 'edit' && schedule?.userStory) {
            await loadTestCasesForUserStory(schedule.userStory);
          }
        }
      } catch (error) {
        console.error('Error loading user stories:', error);
      } finally {
        setLoadingUserStories(false);
      }
    };

    loadUserStories();
  }, [selectedProjectId, mode, schedule]);

  // Helper function to load test cases for a user story
  const loadTestCasesForUserStory = async (userStoryId: string) => {
    if (!selectedProjectId) return;
    
    setLoadingTestCases(true);
    try {
      const response = await testSuitesApi.getTestCases(selectedProjectId, userStoryId);
      if (response.success) {
        // Sort test cases by ID numerically (TC01, TC02, TC03...)
        const sortedTestCases = response.testCases.sort((a, b) => {
          // Extract number from TC01, TC02 etc.
          const aNum = parseInt(a.id.replace(/^TC0?/, ''));
          const bNum = parseInt(b.id.replace(/^TC0?/, ''));
          return aNum - bNum;
        });
        
        setTestCasesByUserStory(prev => ({
          ...prev,
          [userStoryId]: sortedTestCases
        }));
      }
    } catch (error) {
      console.error('Error loading test cases:', error);
    } finally {
      setLoadingTestCases(false);
    }
  };

  const handleUserStoryChange = async (userStoryId: string) => {
    setFormData(prev => ({ ...prev, userStory: userStoryId }));
    // Reset test cases when user story changes (only in create mode)
    if (mode === 'create') {
      setSelectedTestCases([]);
    }
    
    // Load test cases for selected user story
    if (userStoryId) {
      await loadTestCasesForUserStory(userStoryId);
    }
  };

  const handleTestCaseToggle = (testCaseId: string) => {
    setSelectedTestCases(prev => 
      prev.includes(testCaseId) 
        ? prev.filter(tc => tc !== testCaseId)
        : [...prev, testCaseId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProjectId) {
      console.error('No project selected');
      return;
    }

    try {
      const scheduleData = {
        title: formData.title || undefined,
        userStoryId: formData.userStory,
        testCaseIds: selectedTestCases,
        startTime: formData.startDateTime,
        endTime: formData.endDateTime,
        scheduleType: formData.scheduleType.toUpperCase() as 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY',
        status: formData.status.toUpperCase() as 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PAUSED',
        description: formData.description || undefined
      };

      let response;
      if (mode === 'create') {
        response = await scheduleApi.createSchedule(selectedProjectId, scheduleData);
      } else if (schedule?.id) {
        response = await scheduleApi.updateSchedule(selectedProjectId, parseInt(schedule.id), scheduleData);
      }

      if (response?.success) {
        // Convert response to calendar format and notify parent
        const calendarSchedule = {
          id: response.schedule?.id?.toString() || `schedule_${Date.now()}`,
          text: response.schedule?.title || `${response.schedule?.userStoryId} - Test Schedule`,
          start: response.schedule?.startTime || formData.startDateTime,
          end: response.schedule?.endTime || formData.endDateTime,
          userStory: response.schedule?.userStoryId || formData.userStory,
          testCases: response.schedule?.testCaseIds || selectedTestCases,
          scheduleType: (response.schedule?.scheduleType?.toLowerCase() || formData.scheduleType) as 'once' | 'daily' | 'weekly' | 'monthly',
          status: (response.schedule?.status?.toLowerCase() || formData.status) as 'scheduled' | 'running' | 'completed' | 'failed' | 'paused'
        };

        onSave(calendarSchedule);
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      // Could add toast notification here
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    // For edit modal, we need to show the actual calendar time (which is already UTC+3)
    // So we need to subtract the Turkey offset to get the original time
    const turkeyOffset = 3 * 60 * 60 * 1000; // UTC+3 in milliseconds
    const originalTime = new Date(date.getTime() - turkeyOffset);
    const localDate = new Date(originalTime.getTime() - originalTime.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16); // Format for datetime-local input
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Title */}
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>
          Schedule Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter schedule title (optional - will use User Story if empty)"
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
      </div>

      {/* User Story */}
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>
          User Story *
        </label>
        <select
          value={formData.userStory}
          onChange={(e) => handleUserStoryChange(e.target.value)}
          required
          disabled={loadingUserStories}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="">{loadingUserStories ? 'Loading...' : 'Select User Story'}</option>
          {userStories.map(us => (
            <option key={us.id} value={us.id}>{us.id} - {us.name}</option>
          ))}
        </select>
      </div>

      {/* Test Cases */}
      {formData.userStory && (
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>
            Test Cases *
          </label>
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '6px', 
            padding: '12px',
            maxHeight: '120px',
            overflow: 'auto'
          }}>
            {loadingTestCases ? (
              <p style={{ color: '#666', fontSize: '14px' }}>Loading test cases...</p>
            ) : testCasesByUserStory[formData.userStory]?.map(testCase => (
              <label 
                key={testCase.id}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '8px',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedTestCases.includes(testCase.id)}
                  onChange={() => handleTestCaseToggle(testCase.id)}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontSize: '14px' }}>{testCase.id} - {testCase.name}</span>
              </label>
            )) || <p style={{ color: '#666', fontSize: '14px' }}>No test cases available</p>}
          </div>
          {selectedTestCases.length > 0 && (
            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              {selectedTestCases.length} test case(s) selected
            </p>
          )}
        </div>
      )}

      {/* Date Time */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>
            Start Time *
          </label>
          <input
            type="datetime-local"
            value={formatDateTime(formData.startDateTime)}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              startDateTime: new Date(e.target.value).toISOString() 
            }))}
            required
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>
            End Time *
          </label>
          <input
            type="datetime-local"
            value={formatDateTime(formData.endDateTime)}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              endDateTime: new Date(e.target.value).toISOString() 
            }))}
            required
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* Schedule Type */}
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>
          Repeat Schedule
        </label>
        <select
          value={formData.scheduleType}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            scheduleType: e.target.value as 'once' | 'daily' | 'weekly' | 'monthly' 
          }))}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="once">Run Once</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {/* Status (only for edit mode) */}
      {mode === 'edit' && (
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' }}>
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              status: e.target.value as TestSchedule['status']
            }))}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="scheduled">Scheduled</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginTop: '20px',
        justifyContent: 'flex-end'
      }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '10px 20px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            background: 'white',
            color: '#666',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!formData.userStory || selectedTestCases.length === 0}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            background: formData.userStory && selectedTestCases.length > 0 ? '#1976d2' : '#ccc',
            color: 'white',
            cursor: formData.userStory && selectedTestCases.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {mode === 'create' ? 'Create Schedule' : 'Update Schedule'}
        </button>
      </div>
    </form>
  );
};

export default SchedulesTab;
