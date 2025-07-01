import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

interface User {
  roles: string[];
  [key: string]: any;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  [key: string]: any;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { isAuthenticated, user } = useAuth() as AuthContextType;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.some(role => 
      user.roles.includes(role)
    );
    
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" />;
    }
  }

  return <>{children}</>;
};
