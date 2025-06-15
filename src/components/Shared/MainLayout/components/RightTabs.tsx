import React from 'react';

interface RightTabsProps {
  activeRightTab: string;
  onTabClick: (tabId: string) => void;
}

export const RightTabs: React.FC<RightTabsProps> = ({ activeRightTab, onTabClick }) => {
  const tabs = [
    { id: 'test-results', label: 'Information' },
    { id: 'last-activity', label: 'Last Activity' }
  ];

  return (
    <div className="header-tabs-container ml-3">
      <div className="tabs-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-item ${activeRightTab === tab.id ? "tab-active" : ""}`}
            onClick={() => onTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
