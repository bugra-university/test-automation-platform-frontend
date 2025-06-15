import React from 'react';

interface LeftHeaderActionsProps {
  activeTab: string;
  showTable: boolean;
  onReturnToDashboard: () => void;
}

export const LeftHeaderActions: React.FC<LeftHeaderActionsProps> = ({
  activeTab,
  showTable,
  onReturnToDashboard
}) => {
  return (
    <div className="container-header-right">
      {activeTab === "run-tests" && showTable && (
        <button 
          className="header-action-btn" 
          title="Return to Dashboard"
          onClick={onReturnToDashboard}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
      )}
      <button className="header-action-btn" title="Refresh">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 2v6h-6"></path>
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
          <path d="M3 22v-6h6"></path>
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
        </svg>
      </button>
      <button className="header-action-btn" title="Sort">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6"></line>
          <line x1="4" y1="12" x2="20" y2="12"></line>
          <line x1="4" y1="18" x2="20" y2="18"></line>
        </svg>
      </button>
    </div>
  );
};
