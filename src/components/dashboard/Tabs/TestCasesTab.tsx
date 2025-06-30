import React from "react";
import { Plus } from "lucide-react";

interface TestCasesTabProps {
  selectedProjectId?: string;
}

export function TestCasesTab({ selectedProjectId }: TestCasesTabProps) {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="h-[72px] px-8 border-b flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">All Test Cases</h1>
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Test Case
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        {/* İçerik buraya gelecek */}
      </div>
    </div>
  );
}

export {};
