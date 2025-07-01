import React, { useState } from 'react';
import { useAuth } from '../../../../contexts/authContext';
import { Avatar } from '../../../ui/avatar';
import { Button } from '../../../ui/button';
import { LogOut } from 'lucide-react';

const TestSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`test-sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="user-section">
        <Avatar className="h-9 w-9">
          <img
            src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name || 'User'}`}
            alt={user?.name || 'User avatar'}
          />
        </Avatar>
        {isExpanded && (
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role">Test Engineer</div>
          </div>
        )}
      </div>

      <div className="sidebar-actions">
        <Button
          variant="ghost"
          className="logout-button"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {isExpanded && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default TestSidebar; 