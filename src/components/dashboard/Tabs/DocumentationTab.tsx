import React from "react";

interface DocumentationTabProps {
  selectedProjectId?: number | null;
}

export function DocumentationTab({ selectedProjectId }: DocumentationTabProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-[72px] px-8 border-b flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Documentation</h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        {/* Boş içerik */}
      </div>
    </div>
  );
} 