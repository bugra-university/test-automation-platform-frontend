import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  BarChart,
  Building2,
  FolderKanban,
  FileText,
  Settings,
  AlertCircle,
  User,
  LogOut,
  Users,
  Layers,
  FileBarChart,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useAuth } from '../contexts/authContext';
import { projectsApi, type Project } from '../api/projectsApi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/Shared/DropDown/DropdownMenu';

// Test platform menu items - now using tab IDs instead of routes
const menuItems = [
  {
    title: 'Projects',
    icon: FolderKanban,
    tabId: 'projects',
    level: 0
  },
  {
    title: 'Backlog',
    icon: FileText,
    tabId: 'run-tests',
    level: 0
  },
  {
    title: 'Test Suites',
    icon: Layers,
    tabId: 'test-suites',
    level: 0
  },
  {
    title: 'Test Cases',
    icon: FileBarChart,
    tabId: 'test-cases',
    level: 0
  },
  {
    title: 'Test Runs',
    icon: BarChart,
    tabId: 'test-runs',
    level: 0
  },
  {
    title: 'Reports',
    icon: FileBarChart,
    tabId: 'reports',
    level: 0
  },
  {
    title: 'Schedules',
    icon: LayoutDashboard,
    tabId: 'schedules',
    level: 0
  },
  {
    title: 'Documentation',
    icon: FileText,
    tabId: 'documentation',
    level: 0
  },
  {
    title: 'How It Works',
    icon: AlertCircle,
    tabId: 'how-it-works',
    level: 1
  }
];

// Bottom menu items
const bottomMenuItems = [
  {
    title: 'Settings',
    icon: Settings,
    tabId: 'settings'
  },
  {
    title: 'Help',
    icon: AlertCircle,
    tabId: 'help'
  }
];

interface TestSidebarProps {
  activeTab?: string;
  onTabClick?: (tabId: string) => void;
  activeProject?: Project | null;
  onProjectSelect?: (project: Project) => void;
}

const TestSidebar: React.FC<TestSidebarProps> = ({ activeTab, onTabClick, activeProject, onProjectSelect }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showProjectDropdown && !target.closest('.project-dropdown')) {
        setShowProjectDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProjectDropdown]);

  // Load projects when component mounts
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoadingProjects(true);
        const data = await projectsApi.getProjects();
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading projects:', error);
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);
  
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const handleMenuClick = (tabId: string) => {
    if (onTabClick) {
      onTabClick(tabId);
    }
  };

  return (
    <div className="flex flex-col h-full w-full" id="main-test-sidebar">
        
        {/* Main Menu - aligned with tab content */}
      <nav className="px-3 pt-4 flex-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tabId;
          const isHowItWorks = item.title === 'How It Works';
          const isProjectsTab = item.tabId === 'projects';

          return (
            <React.Fragment key={item.tabId}>
              <button
                onClick={() => handleMenuClick(item.tabId)}
                className={cn(
                  "flex items-center px-3 py-2.5 my-1 text-sm font-medium rounded-[9999px] w-full text-left",
                  "transition-colors duration-150",
                  isActive 
                    ? "text-blue-600 bg-[#e8eef9]" 
                    : "text-gray-600 hover:text-blue-600 hover:bg-[#ededed]",
                  item.level > 0 ? "ml-4" : "" // Add left margin for nested items
                )}
              >
                <Icon 
                  className={cn(
                    "h-5 w-5 mr-3", 
                    isActive ? "text-blue-600" : isHowItWorks ? "text-yellow-500" : "text-gray-500"
                  )} 
                />
                <span>{item.title}</span>
              </button>

              {/* Show project selector bar only after Projects menu item */}
              {isProjectsTab && (
                <div className="px-3 mb-2">
                  <div className="relative project-dropdown">
                    <button
                      onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                      disabled={loadingProjects}
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-left hover:bg-gray-100 transition-colors duration-150 flex items-center justify-between"
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <FolderKanban className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                        <span className="truncate">
                          {loadingProjects ? (
                            'Loading projects...'
                          ) : activeProject ? (
                            activeProject.name
                          ) : (
                            'Select a project'
                          )}
                        </span>
                      </div>
                      {showProjectDropdown ? (
                        <ChevronUp className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    
                    {showProjectDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-gray-50 border border-gray-300 rounded-lg shadow-lg z-[9999] max-h-48 overflow-y-auto">
                        {projects.length > 0 ? (
                          <>
                            {projects.map((project) => (
                              <button
                                key={project.id}
                                onClick={() => {
                                  onProjectSelect?.(project);
                                  setShowProjectDropdown(false);
                                  if (onTabClick) {
                                    onTabClick('run-tests');
                                  }
                                }}
                                className={cn(
                                  "w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors duration-150 flex items-center",
                                  activeProject?.id === project.id ? "bg-blue-50 text-blue-600" : "text-gray-700"
                                )}
                              >
                                <FolderKanban className="h-4 w-4 mr-2 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="truncate font-medium">{project.name}</div>
                                  {project.description && (
                                    <div className="truncate text-xs text-gray-500">{project.description}</div>
                                  )}
                                </div>
                              </button>
                            ))}
                            <div className="border-t border-gray-200 my-1"></div>
                            <button
                              onClick={() => {
                                handleMenuClick('projects');
                                setShowProjectDropdown(false);
                              }}
                              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors duration-150 flex items-center text-gray-700"
                            >
                              <FolderKanban className="h-4 w-4 mr-2 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <div className="truncate font-medium">View All Projects</div>
                              </div>
                            </button>
                          </>
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500">No projects found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Bottom Section with thin separator */}
      <div>
        {/* Thin separator line */}
        <div className="mx-6 border-t border-gray-200 my-3"></div>
          {/* Bottom menu items */}
        <nav className="px-3 pb-3">
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tabId;

            return (
              <button
                key={item.tabId}
                onClick={() => handleMenuClick(item.tabId)}
                className={cn(
                  "flex items-center px-3 py-2.5 my-1 text-sm font-medium rounded-[9999px] w-full text-left",
                  "transition-colors duration-150",
                  isActive 
                    ? "text-blue-600 bg-[#e8eef9]" 
                    : "text-gray-600 hover:text-blue-600 hover:bg-[#ededed]"
                )}
              >
                <Icon className={cn("h-5 w-5 mr-3", isActive ? "text-blue-600" : "text-gray-500")} />
                <span>{item.title}</span>
              </button>
            );
          })}        </nav>        {/* User Profile */}
        <div className="px-4 py-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 px-2 py-2 rounded-full hover:bg-[#ededed] cursor-pointer transition-colors duration-150 hover:text-blue-600">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatarUrl} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-base">
                    {user?.name ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-base font-medium text-gray-800">{user?.name || "User"}</span>
                  <span className="text-sm text-gray-500">{user?.email || "user@example.com"}</span>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-md rounded-md overflow-hidden" align="end" forceMount>
              <DropdownMenuLabel className="font-normal bg-white px-4 py-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                  <p className="text-xs text-gray-500">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuGroup>
                <DropdownMenuItem className="hover:bg-gray-50 focus:bg-gray-50 px-4 py-3">
                  <User className="mr-3 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-50 focus:bg-gray-50 px-4 py-3">
                  <Settings className="mr-3 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="hover:bg-red-50 focus:bg-red-50 px-4 py-3"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default TestSidebar;
