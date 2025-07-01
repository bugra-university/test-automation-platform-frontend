import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../ui/button';
import { TestRunsTable } from '../../Shared/Tables/TestRunsTable';

interface TestRunsTabProps {
  selectedProjectId?: string | null;
}

export const TestRunsTab: React.FC<TestRunsTabProps> = ({ selectedProjectId }) => {
  return (
    <div className="w-full bg-white h-full flex flex-col rounded-lg overflow-hidden">
      {/* Header Section */}
      <div className="flex justify-between items-center h-[72px] px-8 rounded-t-lg">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Test Runs</h1>
        </div>
        <div className="flex gap-3 items-center">
          <Button 
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Test Run
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Table Section */}
      <div className="flex-1 overflow-hidden px-8 pt-8 pb-6">
        <TestRunsTable 
          testRuns={[]} // Bu veri API'den gelecek
          onDownloadReport={(id) => console.log(`Downloading report: ${id}`)}
          onViewDetails={(id) => console.log(`Viewing details: ${id}`)}
        />
      </div>
    </div>
  );
};
