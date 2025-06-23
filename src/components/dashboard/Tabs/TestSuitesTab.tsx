import React, { useState } from "react";
import { Play, Square, BarChart3, Edit, ChevronDown, ChevronRight } from 'lucide-react';

// Mock data based on actual Excel content
const mockTestSuites = [
  {
    id: "US_01",
    name: "User Registration to the Site",
    description: "User registration to the Site (Customer)\n(Register)",
    type: "user_story",
    expanded: false,
    status: "passed",
    progress: { completed: 3, total: 5 },
    lastRun: "2024-12-19",
    duration: "2m 30s",
    testCases: [
      {
        id: "TC01",
        name: "Sign up when all areas are filled",
        description: "Sign up when all areas are filled",
        type: "test_case",
        expanded: false,
        status: "passed",
        progress: { completed: 8, total: 8 },
        lastRun: "2024-12-19",
        duration: "45s",
        steps: [
          { id: 1, description: "Go to Site", status: "passed" },
          { id: 2, description: "Click on the link", status: "passed" },
          { id: 3, description: "Enter a username in the username box", status: "passed" },
          { id: 4, description: "Enter an email to your email address box", status: "passed" },
          { id: 5, description: "Enter a password in the password box", status: "passed" },
          { id: 6, description: "I agree to privacy policy check box", status: "passed" },
          { id: 7, description: "Click on Sign up button", status: "passed" },
          { id: 8, description: "Validate the registration process", status: "passed" }
        ]
      },
      {
        id: "TC02",
        name: "No registration without password",
        description: "No registration is done without filling the password space",
        type: "test_case",
        expanded: false,
        status: "passed",
        progress: { completed: 8, total: 8 },
        lastRun: "2024-12-19",
        duration: "38s",
        steps: [
          { id: 1, description: "Go to Site", status: "passed" },
          { id: 2, description: "Click on the link", status: "passed" },
          { id: 3, description: "Empty the username box", status: "passed" },
          { id: 4, description: "Enter an email to your email address box", status: "passed" },
          { id: 5, description: "Enter a password in the password box", status: "passed" },
          { id: 6, description: "I agree to privacy policy check box", status: "passed" },
          { id: 7, description: "Click on Sign up button", status: "passed" },
          { id: 8, description: "Verify that registration process does not happen", status: "passed" }
        ]
      },
      {
        id: "TC03",
        name: "Registration with invalid email",
        description: "Registration with invalid email format",
        type: "test_case",
        expanded: false,
        status: "failed",
        progress: { completed: 6, total: 8 },
        lastRun: "2024-12-18",
        duration: "42s",
        steps: []
      },
      {
        id: "TC04",
        name: "Registration without privacy policy",
        description: "Registration without accepting privacy policy",
        type: "test_case",
        expanded: false,
        status: "blocked",
        progress: { completed: 0, total: 7 },
        lastRun: null,
        duration: null,
        steps: []
      },
      {
        id: "TC05",
        name: "Registration with weak password",
        description: "Registration with password that doesn't meet requirements",
        type: "test_case",
        expanded: false,
        status: "pending",
        progress: { completed: 0, total: 8 },
        lastRun: null,
        duration: null,
        steps: []
      }
    ]
  },
  {
    id: "US_02",
    name: "Login with Registered Information",
    description: "The site should not be registered with the previously registered information.\n(Register)",
    type: "user_story",
    expanded: false,
    status: "running",
    progress: { completed: 1, total: 3 },
    lastRun: "2024-12-19",
    duration: "1m 15s",
    testCases: [
      {
        id: "TC01",
        name: "Sign up with a registered username",
        description: "Sign up with a registered username",
        type: "test_case",
        expanded: false,
        status: "passed",
        progress: { completed: 6, total: 6 },
        lastRun: "2024-12-19",
        duration: "35s",
        steps: []
      },
      {
        id: "TC02",
        name: "Not to log in with an unregistered User",
        description: "Not to log in with an unregistered User",
        type: "test_case",
        expanded: false,
        status: "running",
        progress: { completed: 3, total: 6 },
        lastRun: "2024-12-19",
        duration: "20s",
        steps: []
      },
      {
        id: "TC03",
        name: "Login with wrong password",
        description: "Login with wrong password should fail",
        type: "test_case",
        expanded: false,
        status: "pending",
        progress: { completed: 0, total: 6 },
        lastRun: null,
        duration: null,
        steps: []
      }
    ]
  },
  {
    id: "US_03",
    name: "User Billing Address",
    description: "User Billing Address (. Address).\n(My Account - Addresssses - Billing Address)",
    type: "user_story",
    expanded: false,
    status: "failed",
    progress: { completed: 0, total: 2 },
    lastRun: "2024-12-18",
    duration: "0s",
    testCases: [
      {
        id: "TC01",
        name: "Add valid billing address",
        description: "Add valid billing address with all required fields",
        type: "test_case",
        expanded: false,
        status: "failed",
        progress: { completed: 4, total: 8 },
        lastRun: "2024-12-18",
        duration: "1m 02s",
        steps: []
      },
      {
        id: "TC02",
        name: "Add billing address without required fields",
        description: "Attempt to add billing address without required fields",
        type: "test_case",
        expanded: false,
        status: "pending",
        progress: { completed: 0, total: 6 },
        lastRun: null,
        duration: null,
        steps: []
      }
    ]
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'passed': return <span className="w-2 h-2 rounded-full bg-green-500"></span>;
    case 'failed': return <span className="w-2 h-2 rounded-full bg-red-500"></span>;
    case 'running': return <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>;
    case 'blocked': return <span className="w-2 h-2 rounded-full bg-yellow-500"></span>;
    case 'pending': return <span className="w-2 h-2 rounded-full bg-gray-400"></span>;
    default: return <span className="w-2 h-2 rounded-full bg-gray-300"></span>;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'passed': return 'Passed';
    case 'failed': return 'Failed';
    case 'running': return 'Running';
    case 'blocked': return 'Blocked';
    case 'pending': return 'Pending';
    default: return 'Unknown';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'passed': return 'text-green-600';
    case 'failed': return 'text-red-600';
    case 'running': return 'text-blue-600';
    case 'blocked': return 'text-yellow-600';
    case 'pending': return 'text-gray-600';
    default: return 'text-gray-500';
  }
};

const TestSuitesTable = () => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const renderUserStory = (userStory: any) => {
    const isExpanded = expandedItems.has(userStory.id);
    
    return (
      <React.Fragment key={userStory.id}>
        {/* User Story Row */}
        <tr className="border-b border-gray-200 hover:bg-gray-50">
          <td className="px-6 py-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleExpanded(userStory.id)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                )}
              </button>
              <span className="font-medium text-gray-900">{userStory.id}</span>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="text-sm text-gray-900 font-medium">{userStory.name}</div>
            <div className="text-xs text-gray-500 mt-1 line-clamp-2">{userStory.description}</div>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center space-x-2">
              {getStatusIcon(userStory.status)}
              <span className={`text-sm font-medium ${getStatusColor(userStory.status)}`}>
                {getStatusText(userStory.status)}
              </span>
            </div>
          </td>
          <td className="px-6 py-4">
            <span className="text-sm text-gray-600">
              {userStory.progress.completed}/{userStory.progress.total}
            </span>
          </td>
          <td className="px-6 py-4">
            <span className="text-sm text-gray-600">
              {userStory.lastRun || 'Never'}
            </span>
          </td>
          <td className="px-6 py-4">
            <span className="text-sm text-gray-600">
              {userStory.duration || '-'}
            </span>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center space-x-2">
              {userStory.status === 'running' ? (
                <button className="p-1 hover:bg-gray-100 rounded" title="Stop">
                  <Square className="h-4 w-4 text-red-600" />
                </button>
              ) : (
                <button className="p-1 hover:bg-gray-100 rounded" title="Run">
                  <Play className="h-4 w-4 text-green-600" />
                </button>
              )}
              <button className="p-1 hover:bg-gray-100 rounded" title="Report">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded" title="Edit">
                <Edit className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </td>
        </tr>

        {/* Test Cases (when expanded) */}
        {isExpanded && userStory.testCases.map((testCase: any) => renderTestCase(testCase, userStory.id))}
      </React.Fragment>
    );
  };

  const renderTestCase = (testCase: any, parentId: string) => {
    const testCaseId = `${parentId}-${testCase.id}`;
    const isExpanded = expandedItems.has(testCaseId);
    
    return (
      <React.Fragment key={testCaseId}>
        {/* Test Case Row */}
        <tr className="border-b border-gray-100 bg-gray-50 hover:bg-gray-100">
          <td className="px-6 py-3">
            <div className="flex items-center space-x-2 pl-6">
              {testCase.steps && testCase.steps.length > 0 && (
                <button
                  onClick={() => toggleExpanded(testCaseId)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-gray-600" />
                  )}
                </button>
              )}
              <span className="text-sm font-medium text-gray-800">{testCase.id}</span>
            </div>
          </td>
          <td className="px-6 py-3">
            <div className="text-sm text-gray-800">{testCase.name}</div>
            <div className="text-xs text-gray-500 mt-1">{testCase.description}</div>
          </td>
          <td className="px-6 py-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon(testCase.status)}
              <span className={`text-sm ${getStatusColor(testCase.status)}`}>
                {getStatusText(testCase.status)}
              </span>
            </div>
          </td>
          <td className="px-6 py-3">
            <span className="text-sm text-gray-600">
              {testCase.progress.completed}/{testCase.progress.total}
            </span>
          </td>
          <td className="px-6 py-3">
            <span className="text-sm text-gray-600">
              {testCase.lastRun || 'Never'}
            </span>
          </td>
          <td className="px-6 py-3">
            <span className="text-sm text-gray-600">
              {testCase.duration || '-'}
            </span>
          </td>
          <td className="px-6 py-3">
            <div className="flex items-center space-x-2">
              {testCase.status === 'running' ? (
                <button className="p-1 hover:bg-gray-100 rounded" title="Stop">
                  <Square className="h-3 w-3 text-red-600" />
                </button>
              ) : (
                <button className="p-1 hover:bg-gray-100 rounded" title="Run">
                  <Play className="h-3 w-3 text-green-600" />
                </button>
              )}
              <button className="p-1 hover:bg-gray-100 rounded" title="Report">
                <BarChart3 className="h-3 w-3 text-blue-600" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded" title="Edit">
                <Edit className="h-3 w-3 text-gray-600" />
              </button>
            </div>
          </td>
        </tr>

        {/* Test Steps (when test case is expanded) */}
        {isExpanded && testCase.steps && testCase.steps.map((step: any) => (
          <tr key={`${testCaseId}-step-${step.id}`} className="border-b border-gray-100 bg-blue-50 hover:bg-blue-100">
            <td className="px-6 py-2">
              <div className="flex items-center space-x-2 pl-12">
                <span className="text-xs font-medium text-gray-700">{step.id}</span>
              </div>
            </td>
            <td className="px-6 py-2">
              <div className="text-xs text-gray-700">{step.description}</div>
            </td>
            <td className="px-6 py-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(step.status)}
                <span className={`text-xs ${getStatusColor(step.status)}`}>
                  {getStatusText(step.status)}
                </span>
              </div>
            </td>
            <td className="px-6 py-2">
              <span className="text-xs text-gray-500">-</span>
            </td>
            <td className="px-6 py-2">
              <span className="text-xs text-gray-500">-</span>
            </td>
            <td className="px-6 py-2">
              <span className="text-xs text-gray-500">-</span>
            </td>
            <td className="px-6 py-2">
              <div className="flex items-center space-x-1">
                <button className="p-1 hover:bg-gray-100 rounded" title="Run Step">
                  <Play className="h-3 w-3 text-green-600" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded" title="Edit Step">
                  <Edit className="h-3 w-3 text-gray-600" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </React.Fragment>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Test Objective
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Run
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockTestSuites.map(userStory => renderUserStory(userStory))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export function TestSuitesTab() {
  return (
    <div className="w-full bg-white h-full flex flex-col p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Test Suites</h2>
        <p className="text-gray-600 text-sm">
          Manage and execute your test suites. Each User Story contains multiple Test Cases with detailed test steps.
        </p>
      </div>
      
      <TestSuitesTable />
    </div>
  );
}
