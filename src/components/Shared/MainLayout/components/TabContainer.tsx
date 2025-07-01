import React, { ReactNode } from 'react';

interface TabContainerProps {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export const TabContainer: React.FC<TabContainerProps> = ({
  title,
  actions,
  children
}) => {
  // Only show header if title or actions exist
  const showHeader = title || actions;
  
  return (
    <div className="tab-container h-full flex flex-col">
      {showHeader && (
        <div className="container-header">
          <div className="container-header-left">
            {title && <h2>{title}</h2>}
          </div>
          <div className="container-header-right">
            {actions}
          </div>
        </div>
      )}
      <div className="container-content">
        {children}
      </div>
    </div>
  );
}; 