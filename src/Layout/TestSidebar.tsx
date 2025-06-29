import React from 'react';
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
  FileBarChart
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useAuth } from '../contexts/authContext';
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
}

const TestSidebar: React.FC<TestSidebarProps> = ({ activeTab, onTabClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
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
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tabId;
          const isHowItWorks = item.title === 'How It Works';

          return (
            <button
              key={item.tabId}
              onClick={() => handleMenuClick(item.tabId)}
              className={cn(
                "flex items-center px-3 py-2.5 my-1 text-sm font-medium rounded-full w-full text-left",
                "transition-colors duration-150",
                isActive 
                  ? "text-blue-600" 
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
                  "flex items-center px-3 py-2.5 my-1 text-sm font-medium rounded-full w-full text-left",
                  "transition-colors duration-150",
                  isActive 
                    ? "text-blue-600" 
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
