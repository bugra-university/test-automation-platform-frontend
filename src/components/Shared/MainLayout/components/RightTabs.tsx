import React from 'react';

interface RightTabsProps {
  activeRightTab: string;
  onTabClick: (tabId: string) => void;
}

export const RightTabs: React.FC<RightTabsProps> = ({ activeRightTab, onTabClick }) => {
  const tabs = [
    { id: 'test-results', label: 'Information' },
    { id: 'actions', label: 'Actions' },
    { id: 'last-activity', label: 'Last Activity' }
  ];

  return (
    <div className="header-tabs-container ml-3">
      <style dangerouslySetInnerHTML={{
        __html: `
          .scrollable-tabs::-webkit-scrollbar {
            display: none;
          }
          .scrollable-tabs {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
        `
      }} />
      <div className="tabs-nav scrollable-tabs overflow-x-auto" style={{ 
        whiteSpace: 'nowrap'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-item ${activeRightTab === tab.id ? "tab-active" : ""}`}
            onClick={() => onTabClick(tab.id)}
            style={{ flexShrink: 0 }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
