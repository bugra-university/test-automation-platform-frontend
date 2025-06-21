import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { User } from '../types/auth';

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
  readonly children: React.ReactNode;
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
    const checkAuthStatus = () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      console.log('Checking auth status on page load:', { 
        hasUser: !!storedUser, 
        hasToken: !!storedToken 
      });
      
      if (storedUser && storedToken) {
        try {
          const user = JSON.parse(storedUser);
          console.log('Restoring user session:', user);
          setAuth(prev => ({
            ...prev,
            isAuthenticated: true,
            user,
            loading: false,
          }));
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setAuth(prev => ({
            ...prev,
            isAuthenticated: false,
            user: null,
            loading: false,
          }));
        }
      } else {
        console.log('No stored auth data found');
        setAuth(prev => ({
          ...prev,
          isAuthenticated: false,
          user: null,
          loading: false,
        }));
      }
    };

    checkAuthStatus();
  }, []);

  const loginWithCredentials = useCallback(async (username: string, password: string) => {
    try {
      const response = await apiClient.post('/api/auth/login', { 
        username, 
        password 
      });
      
      if (response.status === 200) {
        // Backend'den gelen username'i al
        const { username: returnedUsername } = response.data;
        
        // User objesi oluştur
        const userData: User = {
          id: 1, // Geçici ID
          username: returnedUsername,
          email: `${returnedUsername}@test.com`,
          fullName: returnedUsername,
          name: returnedUsername,
          avatarUrl: undefined,
          roles: ['ROLE_USER'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // User bilgilerini ve token'ı localStorage'a kaydet
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', 'authenticated'); // Simple token for persistence
        
        setAuth(prev => ({
          ...prev,
          isAuthenticated: true,
          user: userData,
        }));
        
        console.log('Login successful, navigating to dashboard...', { isAuthenticated: true, user: userData });
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
    localStorage.removeItem('token');
    
    // Reset auth state
    setAuth(prev => ({
      ...prev,
      isAuthenticated: false,
      user: null,
    }));
      // Redirect to login page
    navigate('/login');
  }, [navigate]);

  const contextValue = useMemo(() => ({
    ...auth,
    loginWithCredentials,
    logout
  }), [auth, loginWithCredentials, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
