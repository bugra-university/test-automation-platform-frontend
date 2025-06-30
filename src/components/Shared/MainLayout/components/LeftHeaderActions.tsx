import React from "react";
import { FileText, FolderKanban, Play, FileSpreadsheet, BarChart2, Clock, HelpCircle, FileQuestion } from "lucide-react";

interface LeftHeaderActionsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
}

export function LeftHeaderActions({ activeTab, setActiveTab, onLogout }: LeftHeaderActionsProps) {
  const tabs = [
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "run-tests", label: "Backlog", icon: Play },
    { id: "test-cases", label: "Test Cases", icon: FileSpreadsheet },
    { id: "test-runs", label: "Test Runs", icon: BarChart2 },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "schedules", label: "Schedules", icon: Clock },
    { id: "documentation", label: "Documentation", icon: FileQuestion },
    { id: "how-it-works", label: "How It Works", icon: HelpCircle },
  ];

  return (
    <div className="flex flex-col space-y-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
