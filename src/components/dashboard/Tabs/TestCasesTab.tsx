import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../ui/button';
import { TestCasesTable } from '../../Shared/Tables/TestCasesTable';

interface TestCasesTabProps {
  selectedProjectId?: string | null;
}

export const TestCasesTab: React.FC<TestCasesTabProps> = ({ selectedProjectId }) => {
  return (
    <div className="w-full bg-white h-full flex flex-col rounded-lg overflow-hidden">
      {/* Header Section */}
      <div className="flex justify-between items-center h-[72px] px-8 rounded-t-lg">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Test Cases</h1>
        </div>
        <div className="flex gap-3 items-center">
          <Button 
            className="gap-2 rounded-lg w-[150px] bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Test Case
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Table Section */}
      <div className="flex-1 overflow-hidden px-8 pt-8 pb-6">
        <TestCasesTable 
          testCases={[]} // Bu veri API'den gelecek
          onRunTestCase={(id) => console.log(`Running test case: ${id}`)}
          onDownloadReport={(id) => console.log(`Downloading report: ${id}`)}
        />
      </div>
    </div>
  );
};

export {};
