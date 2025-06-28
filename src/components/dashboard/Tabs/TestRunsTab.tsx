import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, MoreHorizontal, ChevronDown, ChevronRight, Play, Square, BarChart3, Eye, Trash2 } from "lucide-react";
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
    return saved ? JSON.parse(saved) : [60, 40]; // Default: 60% left, 40% right
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
  }

  function TestRunListItem({ testRun, isChild = false, isSelected, onSelect }: TestRunListItemProps) {
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
          className={`p-3 cursor-pointer relative flex items-center gap-3 rounded-lg mx-2 ${
            isSelected
              ? "bg-primary/10 border-l-4 border-primary/60 shadow-sm"
              : isHovered
                ? "bg-muted/50 border-l-4 border-primary/60"
                : "border-l-4 border-transparent"
          } ${isChild ? "ml-6 bg-primary/5 mt-1.5" : "mb-1"}`}
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(testRun.id);
                      }}
                      className="p-1.5 hover:bg-accent rounded-full ml-1 w-6 h-6 flex items-center justify-center"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                {formatDistanceToNow(new Date(testRun.timestamp))}
              </div>
            </div>

            {/* Preview of description */}
            <div className="text-xs text-muted-foreground truncate mb-2">
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

        {/* Render children if expanded */}
        {isExpanded && hasChildren && (
          <div className="mt-2 mb-1">
            {testRun.children!.map((child) => (
              <TestRunListItem
                key={child.id}
                testRun={child}
                isChild={true}
                isSelected={selectedTestRun?.id === child.id}
                onSelect={() => handleTestRunSelect(child)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const renderASCIICard = (testRun: TestRun | null) => {
    if (!testRun) {
      return (
        <div className="flex h-full items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-4">🧪</div>
            <p className="text-lg font-medium mb-2">Select a test run to view details</p>
            <p className="text-sm">Choose a test run from the left panel to see detailed information</p>
          </div>
        </div>
      );
    }

    const statusColor = testRun.status === 'passed' ? 'text-green-600' : 
                       testRun.status === 'failed' ? 'text-red-600' : 
                       testRun.status === 'running' ? 'text-blue-600' : 'text-yellow-600';

    return (
      <div className="p-6 h-full overflow-auto">
        <div className="max-w-4xl">
          {/* ASCII Header */}
          <div className="font-mono text-sm border rounded-lg p-4 bg-gray-50">
            <div className="text-center mb-4 font-bold">
              ┌─────────────────────────────────────────────────────────────────────────────────────────┐
              <br />
              │                                    🏃 TEST RUN DETAILS                                     │
              <br />
              ├─────────────────────────────────────────────────────────────────────────────────────────┤
            </div>

            {/* Test Run Card */}
            <div className="mb-4">
              ┌─ Test Run Card ──────────────────────────────────────────────────────────────────────┐
              <br />
              │  🧪 {testRun.type === 'user_story' ? 'Test Suite' : 'Test Case'}: {testRun.title.padEnd(50)} 🕐 {formatDistanceToNow(new Date(testRun.timestamp)).padStart(12)} │
              <br />
              │  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
              <br />
              │  │ 🤖 Triggered by: {testRun.trigger} │  ⚡ Status: {testRun.status.toUpperCase()} │  ⏱️ Duration: {testRun.duration} │ │
              <br />
              │  └─────────────────────────────────────────────────────────────────────────────────┘ │
              <br />
              │  📈 Results: {testRun.results.passed} Passed, {testRun.results.failed} Failed, {testRun.results.skipped} Skipped                                      │
              <br />
              {testRun.testCases && (
                <>
                  │  🧪 Test Cases: {testRun.testCases.join(', ')}                                                               │
                  <br />
                </>
              )}
              {testRun.error && (
                <>
                  │  💥 Error: {testRun.error.substring(0, 70)}...                                   │
                  <br />
                </>
              )}
              {testRun.currentStep && (
                <>
                  │  ⚡ Currently executing: {testRun.currentStep.substring(0, 60)}...                                │
                  <br />
                </>
              )}
              │  ┌──────────────────────────────────────────────────────────────────────────┐   │
              <br />
              │  │ 👁️ View Details   📄 View Report   📊 Test Results   {testRun.status === 'running' ? '🛑 Stop Test' : '🗑️ Delete'}         │
              <br />
              │  └──────────────────────────────────────────────────────────────────────────┘   │
              <br />
              └─────────────────────────────────────────────────────────────────────────────────┘
            </div>

            <div className="text-center">
              └─────────────────────────────────────────────────────────────────────────────────────────┘
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Report
            </Button>
            {testRun.status === 'running' ? (
              <Button variant="destructive" size="sm">
                <Square className="h-4 w-4 mr-2" />
                Stop Test
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Run Again
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>

          {/* Additional Details */}
          <div className="mt-6 space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Test Configuration</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Trigger:</span>
                  <span>{testRun.trigger} by {testRun.triggerBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span>{testRun.type === 'user_story' ? 'User Story' : 'Test Case'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={statusColor}>{testRun.status.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span>{testRun.duration}</span>
                </div>
              </div>
            </div>

            {testRun.children && testRun.children.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Child Test Cases</h3>
                <div className="space-y-2">
                  {testRun.children.map((child) => (
                    <div key={child.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{child.title}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${
                          child.status === 'passed' ? 'text-green-600' : 
                          child.status === 'failed' ? 'text-red-600' : 
                          child.status === 'running' ? 'text-blue-600' : 'text-yellow-600'
                        }`}>
                          {child.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <ResizablePanelGroup 
        direction="horizontal" 
        className="flex-1"
        onLayout={handlePanelLayout}
      >
        {/* Left Panel - Test Run List */}
        <ResizablePanel defaultSize={panelSizes[0]} minSize={25}>
          <div className="h-full flex flex-col border-r border-border/50">
            {/* Header with Search */}
            <div className="p-4 flex items-center gap-2">
              <Input
                placeholder="Search test runs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-background/80 rounded-full"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Filter by Status</DropdownMenuItem>
                  <DropdownMenuItem>Sort by Date</DropdownMenuItem>
                  <DropdownMenuItem>Sort by Duration</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Test Run List */}
            <ScrollArea className="flex-1">
              {filteredTestRuns.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p>No test runs found</p>
                </div>
              ) : (
                <div className="p-2">
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
            </ScrollArea>
          </div>
        </ResizablePanel>

        {/* Resizable Handle */}
        <ResizableHandle withHandle />

        {/* Right Panel - Test Run Details */}
        <ResizablePanel defaultSize={panelSizes[1]}>
          {renderASCIICard(selectedTestRun)}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
