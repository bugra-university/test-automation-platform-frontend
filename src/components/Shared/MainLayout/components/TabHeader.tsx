import React, { ReactNode } from 'react';

interface TabHeaderProps {
  title: string;
  actions?: ReactNode;
}

export const TabHeader: React.FC<TabHeaderProps> = ({ 
  title, 
  actions 
}) => {
  return (
    <div className="container-header">
      <div className="container-header-left">
        <h2>{title}</h2>
      </div>
      <div className="container-header-right">
        {actions}
      </div>
    </div>
  );
}; 