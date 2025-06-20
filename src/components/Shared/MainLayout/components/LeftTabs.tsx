import React from 'react';

interface LeftTabsProps {
  activeTab: string;
  onTabClick: (tabId: string) => void;
}

export const LeftTabs: React.FC<LeftTabsProps> = ({ activeTab, onTabClick }) => {  const tabs = [
    { id: 'projects', label: 'Projects' },
    { id: 'run-tests', label: 'Backlog' },
    { id: 'test-suites', label: 'Test Suites' },
    { id: 'test-cases', label: 'Test Cases' },
    { id: 'test-runs', label: 'Test Runs' },
    { id: 'reports', label: 'Reports' },
    { id: 'schedules', label: 'Schedules' }
  ];

  return (
    <div className="header-tabs-container">
      <div className="tabs-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? "tab-active" : ""}`}
            onClick={() => onTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
