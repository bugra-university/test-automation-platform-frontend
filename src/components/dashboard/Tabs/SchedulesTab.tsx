import React, { useState, useEffect } from 'react';
import { DayPilot, DayPilotCalendar, DayPilotNavigator } from "@daypilot/daypilot-lite-react";
import { testSuitesApi, TestSuite, TestCase } from '../../../api/testSuitesApi';
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
            console.log("Running test schedule:", args.source.id());
            // TODO: Implement run now functionality
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
            if (window.confirm("Are you sure you want to delete this schedule?")) {
              setSchedules(prev => prev.filter(s => s.id !== args.source.id()));
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

  // Mock test schedules data
  useEffect(() => {
    const today = new Date();
    const mockSchedules: TestSchedule[] = [
      {
        id: "schedule_1",
        text: "US_01 - User Registration",
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0).toISOString(),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30).toISOString(),
        userStory: "US_01",
        testCases: ["TC01", "TC02", "TC03"],
        scheduleType: "daily",
        status: "scheduled"
      },
      {
        id: "schedule_2", 
        text: "US_03 - Billing Address",
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 0).toISOString(),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 45).toISOString(),
        userStory: "US_03",
        testCases: ["TC01", "TC02"],
        scheduleType: "weekly",
        status: "completed"
      },
      {
        id: "schedule_3",
        text: "US_08 - Shopping Cart", 
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 10, 30).toISOString(),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 11, 15).toISOString(),
        userStory: "US_08",
        testCases: ["TC01", "TC02", "TC03", "TC04"],
        scheduleType: "once",
        status: "failed"
      },
      {
        id: "schedule_4",
        text: "US_02 - Invalid Registration",
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0).toISOString(),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30).toISOString(),
        userStory: "US_02", 
        testCases: ["TC01", "TC02"],
        scheduleType: "daily",
        status: "running"
      }
    ];
    setSchedules(mockSchedules);
  }, []);

  const handleCreateSchedule = () => {
    setScheduleModal({
      isOpen: true,
      mode: 'create',
      schedule: null,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    });
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
          style={{
            background: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            cursor: "pointer",
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
              onSave={(newSchedule) => {
                if (scheduleModal.mode === 'create') {
                  setSchedules(prev => [...prev, newSchedule]);
                } else {
                  setSchedules(prev => prev.map(s => 
                    s.id === newSchedule.id ? newSchedule : s
                  ));
                }
                setScheduleModal({ ...scheduleModal, isOpen: false });
              }}
              onCancel={() => setScheduleModal({ ...scheduleModal, isOpen: false })}
            />
          </div>
        </div>
      )}
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
        }
      } catch (error) {
        console.error('Error loading user stories:', error);
      } finally {
        setLoadingUserStories(false);
      }
    };

    loadUserStories();
  }, [selectedProjectId]);

  const handleUserStoryChange = async (userStoryId: string) => {
    setFormData(prev => ({ ...prev, userStory: userStoryId }));
    // Reset test cases when user story changes
    setSelectedTestCases([]);
    
    // Load test cases for selected user story
    if (selectedProjectId && userStoryId) {
      setLoadingTestCases(true);
      try {
        const response = await testSuitesApi.getTestCases(selectedProjectId, userStoryId);
        if (response.success) {
          setTestCasesByUserStory(prev => ({
            ...prev,
            [userStoryId]: response.testCases
          }));
        }
      } catch (error) {
        console.error('Error loading test cases:', error);
      } finally {
        setLoadingTestCases(false);
      }
    }
  };

  const handleTestCaseToggle = (testCaseId: string) => {
    setSelectedTestCases(prev => 
      prev.includes(testCaseId) 
        ? prev.filter(tc => tc !== testCaseId)
        : [...prev, testCaseId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSchedule: TestSchedule = {
      id: schedule?.id || `schedule_${Date.now()}`,
      text: formData.title || formData.userStory,
      start: formData.startDateTime,
      end: formData.endDateTime,
      userStory: formData.userStory,
      testCases: selectedTestCases,
      scheduleType: formData.scheduleType,
      status: formData.status
    };

    onSave(newSchedule);
  };

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toISOString().slice(0, 16); // Format for datetime-local input
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
            fontWeight: '500'
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
            fontWeight: '500'
          }}
        >
          {mode === 'create' ? 'Create Schedule' : 'Update Schedule'}
        </button>
      </div>
    </form>
  );
};

export default SchedulesTab;
