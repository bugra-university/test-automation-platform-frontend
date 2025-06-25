import React from 'react';

interface ReportsTabProps {
  selectedProjectId: number | null;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ selectedProjectId }) => {
  return (
    <div className="w-full bg-white h-full flex flex-col p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Reports</h2>
        <p className="text-gray-600 text-sm">
          Reports section - content will be added later.
        </p>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-gray-600 text-sm">
            Reports functionality will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
};
