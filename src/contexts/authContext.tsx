import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

import { User } from '@/types/auth';

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  loginWithCredentials: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: false,
  loginWithCredentials: async () => {},
  logout: () => {},
});

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [auth, setAuth] = useState<AuthContextType>({
    isAuthenticated: false,
    user: null,
    loading: true,
    loginWithCredentials: async () => {},
    logout: () => {},
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuth(prev => ({
          ...prev,
          isAuthenticated: true,
          user,
          loading: false,
        }));
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('user');
        setAuth(prev => ({
          ...prev,
          loading: false,
        }));
      }
    } else {
      setAuth(prev => ({
        ...prev,
        loading: false,
      }));
    }  }, []);    // Custom authentication function
  const loginWithCredentials = useCallback(async (username: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      
      if (response.status === 200) {
        // Prepare user data with UI-friendly properties
        const apiData = response.data;
        
        // Map backend user data to our User type, including UI-specific fields
        const userData = {
          ...apiData,
          // Use fullName as name if name is not provided
          name: apiData.name || apiData.fullName || apiData.username,
          // Set a default avatar URL if not provided
          avatarUrl: apiData.avatarUrl || null
        };
        
        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        setAuth(prev => ({
          ...prev,
          isAuthenticated: true,
          user: userData,
        }));
        
        navigate('/');
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [navigate]);
  
  const logout = useCallback(() => {
    // Clear local storage
    localStorage.removeItem('user');
    
    // Reset auth state
    setAuth(prev => ({
      ...prev,
      isAuthenticated: false,
      user: null,
    }));
    
    // Redirect to login page
    navigate('/login');
  }, [navigate]);
  return (
    <AuthContext.Provider 
      value={{
        ...auth,
        loginWithCredentials,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
