import React, { useState, useEffect } from 'react';
import { DayPilot, DayPilotCalendar, DayPilotNavigator } from "@daypilot/daypilot-lite-react";
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

const SchedulesTab: React.FC = () => {
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
    <div style={{ padding: "20px", background: "#f8f9fa" }}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: "#2c3e50", fontWeight: 600 }}>Test Schedules</h2>
        <button
          onClick={handleCreateSchedule}
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            cursor: "pointer",
            fontWeight: 500,
            fontSize: "14px"
          }}
        >
          + New Schedule
        </button>
      </div>

      {/* Calendar Layout */}
      <div style={styles.wrap}>
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

      {/* TODO: Test Schedule Modal */}
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
            minWidth: "400px",
            maxWidth: "600px"
          }}>
            <h3>{scheduleModal.mode === 'create' ? 'Create New Schedule' : 'Edit Schedule'}</h3>
            <p>Modal content will be implemented in next step...</p>
            <button
              onClick={() => setScheduleModal({ ...scheduleModal, isOpen: false })}
              style={{
                background: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                cursor: "pointer"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulesTab;
