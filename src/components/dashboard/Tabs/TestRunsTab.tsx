import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, MoreHorizontal, ChevronDown, ChevronRight, Play, Square, BarChart3, Eye, Trash2, Calendar, Clock, AlertCircle, FileText, RefreshCcw, StopCircle, Activity, Timer } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { ScrollArea } from "../../ui/scroll-area";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../Shared/DropDown/DropdownMenu";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../../ui/resizable";
import { mockTestRuns, TestRun } from "../../../data/mockTestRuns";
import { formatDistanceToNow } from "../../../lib/emailUtils";

// Avatar color helper function - User Stories: light blue, Test Cases: light green
const getAvatarColor = (type: 'user_story' | 'test_case') => {
  if (type === 'user_story') {
    return "bg-blue-100 text-blue-700 font-medium text-sm";
  } else {
    return "bg-green-100 text-green-700 font-medium text-sm";
  }
};

export function TestRunsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTestRun, setSelectedTestRun] = useState<TestRun | null>(mockTestRuns.find(t => t.type === 'user_story') || null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  // Panel sizes - load from localStorage or use default
  const [panelSizes, setPanelSizes] = useState<number[]>(() => {
    const saved = localStorage.getItem('testRunsPanelSizes');
    return saved ? JSON.parse(saved) : [50, 50]; // Default: 50% left, 50% right
  });

  // Filter test runs based on search query - only show User Stories in main list
  const filteredTestRuns = useMemo(() => {
    return mockTestRuns
      .filter((testRun) => testRun.type === 'user_story') // Only show User Stories
      .filter(
        (testRun) =>
          testRun.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          testRun.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          testRun.userStoryId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [searchQuery]);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleTestRunSelect = (testRun: TestRun) => {
    setSelectedTestRun(testRun);
  };

  // Handle panel layout changes and save to localStorage
  const handlePanelLayout = (sizes: number[]) => {
    setPanelSizes(sizes);
    localStorage.setItem('testRunsPanelSizes', JSON.stringify(sizes));
  };

  interface TestRunListItemProps {
    testRun: TestRun;
    isChild?: boolean;
    isSelected: boolean;
    onSelect: () => void;
    isLastChild?: boolean;
  }

  function TestRunListItem({ testRun, isChild = false, isSelected, onSelect, isLastChild = false }: TestRunListItemProps) {
    const [isHovered, setIsHovered] = useState(false);
    const itemRef = useRef<HTMLDivElement>(null);
    const hasChildren = testRun.children && testRun.children.length > 0;
    const isExpanded = expandedItems.has(testRun.id);

    // Scroll into view when selected
    useEffect(() => {
      if (isSelected && itemRef.current) {
        itemRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, [isSelected]);

    // Helper function to determine which badges to show - email client style with pastel colors
    const getBadges = (): Array<{label: string, className: string}> => {
      const badges: Array<{label: string, className: string}> = [];

      // Add trigger type badge with pastel colors
      if (testRun.trigger === "manual") {
        badges.push({ label: "Manual", className: "bg-blue-50 text-blue-600 hover:bg-blue-100" });
      } else if (testRun.trigger === "schedule") {
        badges.push({ label: "Schedule", className: "bg-gray-50 text-gray-600 hover:bg-gray-100" });
      }

      // Add results badge if available
      if (testRun.results && testRun.results.total > 0) {
        const totalTests = testRun.results.total;
        const passedTests = testRun.results.passed;
        const failedTests = testRun.results.failed;
        
        if (failedTests > 0) {
          badges.push({
            label: `${passedTests} passed, ${failedTests} failed`,
            className: "bg-red-50 text-red-600 hover:bg-red-100",
          });
        } else {
          badges.push({
            label: `${totalTests} test${totalTests > 1 ? 's' : ''} passed`,
            className: "bg-green-50 text-green-600 hover:bg-green-100",
          });
        }
      }

      return badges;
    };

    return (
      <div key={testRun.id}>
        <div
          ref={itemRef}
          className={`p-3 cursor-pointer relative flex items-center gap-3 rounded-lg ml-2 mr-1 bg-gray-100 ${
            isSelected
              ? "border-l-4 border-primary/60"
              : isHovered
                ? "border-l-4 border-primary/60"
                : "border-l-4 border-transparent"
          } ${isChild ? "ml-10 mt-1.5" : "mb-1"}`}
          onClick={onSelect}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Avatar */}
          <div className="relative">
            <Avatar className={testRun.type === 'user_story' ? "h-11 w-11" : "h-9 w-9"}>
              <AvatarFallback className={getAvatarColor(testRun.type)}>
                {testRun.type === 'user_story' ? testRun.userStoryId : testRun.testCaseId}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0">
            {/* Combined title and time on one line */}
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="truncate text-sm font-medium">
                    {testRun.title.split(' - ').slice(1).join(' - ')}
                  </div>
                  {hasChildren && !isChild && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(testRun.id);
                      }}
                      className="ml-2 cursor-pointer shrink-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground font-medium whitespace-nowrap ml-2">
                {formatDistanceToNow(new Date(testRun.timestamp))}
              </div>
            </div>

            {/* Preview of description */}
            <div className="text-xs text-muted-foreground font-medium truncate mb-2">
              {testRun.description.substring(0, 100)}...
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5">
              {getBadges().map((badge, index) => (
                <Badge key={index} className={`text-xs px-1.5 py-0 ${badge.className} transition-colors cursor-pointer`}>
                  {badge.label}
                </Badge>
              ))}
              {testRun.status === "running" && (
                <Badge className="bg-blue-50 text-blue-600 text-xs px-1.5 py-0 hover:bg-blue-100 transition-colors cursor-pointer">
                  Live
                </Badge>
              )}
              {testRun.status === "failed" && (
                <Badge className="bg-red-50 text-red-600 text-xs px-1.5 py-0 hover:bg-red-100 transition-colors cursor-pointer">
                  Failed
                </Badge>
              )}
            </div>
          </div>


        </div>

        {/* Render children if expanded with smooth animation */}
        {hasChildren && (
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="mt-2 mb-3">
              {testRun.children!.map((child, index) => (
                <TestRunListItem
                  key={child.id}
                  testRun={child}
                  isChild={true}
                  isSelected={selectedTestRun?.id === child.id}
                  onSelect={() => handleTestRunSelect(child)}
                  isLastChild={index === testRun.children!.length - 1}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const renderASCIICard = (testRun: TestRun | null) => {
    if (!testRun) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <p>Select a test run to view details</p>
        </div>
      );
    }

    // Calculate test statistics
    const manualTests = testRun.children?.filter(test => test.trigger === 'manual').length || 0;
    const scheduledTests = testRun.children?.filter(test => test.trigger === 'schedule').length || 0;
    const passedTests = testRun.children?.filter(test => test.status === 'passed').length || 0;
    const failedTests = testRun.children?.filter(test => test.status === 'failed').length || 0;
    const pendingTests = testRun.children?.filter(test => test.status === 'pending').length || 0;

    return (
      <div className="p-4 space-y-4">
        {/* Header with Stats */}
        <div className="flex gap-2 justify-center">
          <div className="bg-gray-100 rounded-full h-10 px-4 text-center flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Manual</span>
            <span className="text-sm font-semibold text-gray-700 ml-2">{manualTests}</span>
          </div>
          <div className="bg-gray-100 rounded-full h-10 px-4 text-center flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Scheduled</span>
            <span className="text-sm font-semibold text-gray-700 ml-2">{scheduledTests}</span>
          </div>
          <div className="bg-green-50 rounded-full h-10 px-4 text-center flex items-center justify-between">
            <span className="text-sm font-medium text-green-600">Passed</span>
            <span className="text-sm font-semibold text-green-700 ml-2">{passedTests}</span>
          </div>
          <div className="bg-yellow-50 rounded-full h-10 px-4 text-center flex items-center justify-between">
            <span className="text-sm font-medium text-yellow-600">Pending</span>
            <span className="text-sm font-semibold text-yellow-700 ml-2">{pendingTests}</span>
          </div>
          <div className="bg-red-50 rounded-full h-10 px-4 text-center flex items-center justify-between">
            <span className="text-sm font-medium text-red-600">Failed</span>
            <span className="text-sm font-semibold text-red-700 ml-2">{failedTests}</span>
          </div>
        </div>

        {/* User Story Card */}
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-700">{testRun.userStoryId}</span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium text-gray-900">User registration to the Site (Customer)</div>
                    <div className="flex items-center text-xs text-muted-foreground font-medium">
                      <Clock className="h-3 w-3 mr-1" />
                      Last Run: Jan 27, 5:30 PM
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <div className="text-xs text-muted-foreground font-medium">
                  Complete user registration functionality for customers including validation scenarios and edge cases
                </div>
              </div>
            </div>
          </div>

          {/* User Story Description */}
          <div className="mb-6">
            <h5 className="text-sm font-medium mb-2">Acceptance Criteria</h5>
            <div className="space-y-2">
              <div className="flex gap-2 text-xs text-muted-foreground font-medium">
                <span>1.</span>
                <span>The name should be entered (Small letter, large letter, figure and special character)</span>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground font-medium">
                <span>2.</span>
                <span>e-mail address should be entered (abc@abc.com must be e-mail address)</span>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground font-medium">
                <span>3.</span>
                <span>Password should be entered. (Parola should be at least 8 characters long. Large and small letters, numbers and !" ? $ % & must be used to make it stronger)</span>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground font-medium">
                <span>4.</span>
                <span>"I to the privacy policy" should not be registered without clicking</span>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground font-medium">
                <span>5.</span>
                <span>SIGN UP button must be clickable (Username, Email address and Password should not occur when the SIGN UP is clicked)</span>
              </div>
            </div>
          </div>

          {/* Test Cases Summary */}
          <div className="bg-gray-50 rounded-md p-4 mb-4">
            <h4 className="text-sm font-medium mb-3">Test Cases Overview</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Total Test Cases:</span>
                  <span className="text-xs text-muted-foreground font-medium">{testRun.children?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Manual Tests:</span>
                  <span className="text-xs text-muted-foreground font-medium">{manualTests}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Scheduled Tests:</span>
                  <span className="text-xs text-muted-foreground font-medium">{scheduledTests}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Passed:</span>
                  <span className="text-xs text-muted-foreground font-medium">{passedTests}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Failed:</span>
                  <span className="text-xs text-muted-foreground font-medium">{failedTests}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Pending:</span>
                  <span className="text-xs text-muted-foreground font-medium">{pendingTests}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Test Execution History */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-3">Recent Executions</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span>Jan 27, 5:30 PM</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-600">All Tests Passed</Badge>
                <span className="text-gray-600">2m 45s</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span>Jan 26, 3:15 PM</span>
                </div>
                <Badge variant="outline" className="bg-red-50 text-red-600">2 Tests Failed</Badge>
                <span className="text-gray-600">3m 10s</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-3 border-t">
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span className="text-xs">View Details</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span className="text-xs">View Report</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <Play className="h-4 w-4" />
              <span className="text-xs">Run All Tests</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 ml-auto text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
              <span className="text-xs">Delete</span>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="test-runs-container">
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full"
        onLayout={handlePanelLayout}
      >
        {/* Left Panel - Test Run List */}
        <ResizablePanel defaultSize={50} minSize={30} maxSize={70} className="border-r">
          <div className="h-full flex flex-col">
            {/* Header with Search */}
            <div className="p-4 flex items-center gap-2">
              <Input
                type="text"
                placeholder="Search test runs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-background/80 rounded-full"
              />
            </div>

            {/* Test Run List */}
            <div className="flex-1 overflow-auto left-panel-scroll">
              {filteredTestRuns.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p>No test runs found</p>
                </div>
              ) : (
                <div className="pl-2 pr-4">
                  {filteredTestRuns.map((testRun) => (
                    <TestRunListItem
                      key={testRun.id}
                      testRun={testRun}
                      isSelected={selectedTestRun?.id === testRun.id}
                      onSelect={() => handleTestRunSelect(testRun)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle 
          withHandle 
          className="w-[1px] [&>div]:border-0 [&>div]:bg-gray-200 [&>div]:opacity-50" 
        />

        {/* Right Panel - Test Run Details */}
        <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
          <div className="h-full overflow-auto">
            {renderASCIICard(selectedTestRun)}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
