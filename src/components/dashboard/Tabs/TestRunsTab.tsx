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
    return saved ? JSON.parse(saved) : [60, 40]; // Default: 62% left, 38% right
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

    return (
      <div className="p-6 space-y-6">
        <div className="bg-gray-50 rounded-lg border shadow-sm p-6">
          <h2 className="text-xl font-semibold">Test Details</h2>
          <p className="text-gray-500">Please provide the structure you want for this panel</p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1"
        onLayout={(sizes: number[]) => {
          setPanelSizes(sizes);
        }}
      >
        {/* Left Panel - Test Run List */}
        <ResizablePanel defaultSize={panelSizes[0]} minSize={25} className="border-r">
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

            {/* Test Runs List */}
            <div className="flex-1 overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              {filteredTestRuns.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p>No test runs found</p>
                </div>
              ) : (
                <div className="pl-2 pr-6">
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

        <ResizableHandle withHandle />

        {/* Right Panel - Test Run Details */}
        <ResizablePanel defaultSize={panelSizes[1]}>
          {renderASCIICard(selectedTestRun)}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
