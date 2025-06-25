import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  BarChart,
  Building2,
  FolderKanban,
  Receipt,
  FileBarChart,
  Users,
  Settings,
  HelpCircle,
  User,
  LogOut
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

// Test platform menu items
const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/'
  },
  {
    title: 'Analytics',
    icon: BarChart,
    path: '/analytics'
  },
  {
    title: 'Projects',
    icon: FolderKanban,
    path: '/projects'
  },
  {
    title: 'Environments',
    icon: Building2,
    path: '/environments'
  },
  {
    title: 'Teams',
    icon: Users,
    path: '/teams'
  },
  {
    title: 'Integrations',
    icon: Receipt, 
    path: '/integrations'
  },
  {
    title: 'Configurations',
    icon: FileBarChart,
    path: '/configurations'
  },
  {
    title: 'Repository',
    icon: FolderKanban,
    path: '/repository'
  },
  {
    title: 'Documentation',
    icon: FileBarChart,
    path: '/documentation'
  }
];

// Bottom menu items
const bottomMenuItems = [
  {
    title: 'Settings',
    icon: Settings,
    path: '/settings'
  },
  {
    title: 'Help',
    icon: HelpCircle,
    path: '/help'
  }
];

const TestSidebar: React.FC = () => {
  const location = useLocation();
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
    return (    <div className="flex flex-col h-full w-full" id="main-test-sidebar">
        
        {/* Main Menu - aligned with tab content */}
      <nav className="px-3 pt-4 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2.5 my-1 text-sm font-medium rounded-full",
                "transition-colors duration-150",
                isActive 
                  ? "text-blue-600" 
                  : "text-gray-600 hover:text-blue-600 hover:bg-[#ededed]"
              )}
            >
              <Icon className={cn("h-5 w-5 mr-3", isActive ? "text-blue-600" : "text-gray-500")} />
              <span>{item.title}</span>
            </Link>
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
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2.5 my-1 text-sm font-medium rounded-full",
                  "transition-colors duration-150",
                  isActive 
                    ? "text-blue-600" 
                    : "text-gray-600 hover:text-blue-600 hover:bg-[#ededed]"
                )}
              >
                <Icon className={cn("h-5 w-5 mr-3", isActive ? "text-blue-600" : "text-gray-500")} />
                <span>{item.title}</span>
              </Link>
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
            </DropdownMenuTrigger>            <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-md rounded-md overflow-hidden" align="end" forceMount>
              <DropdownMenuLabel className="font-normal bg-white px-4 py-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                  <p className="text-xs text-gray-500">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuGroup className="bg-white">
                <DropdownMenuItem onClick={() => navigate("/profile")} className="px-4 py-2 hover:bg-blue-100 hover:text-blue-600 cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")} className="px-4 py-2 hover:bg-blue-100 hover:text-blue-600 cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem onClick={handleLogout} className="px-4 py-2 hover:bg-blue-100 hover:text-blue-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
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
