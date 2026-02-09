import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { store } from './store';
import { AuthProvider } from './contexts/authContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import MainLayout from './Layout/MainLayout';
import './App.css';

import Login from './pages/Login';
import Settings from './pages/Settings';
import TestDashboard from './pages/TestDashboard';

const App: React.FC = () => {
  return (
    <ReduxProvider store={store}>
      <HelmetProvider>
        <Router>
          <Helmet>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <html lang="en" />
            <title>Test Automation Platform</title>
            <meta name="description" content="Test Automation Platform for Modern Teams" />
          </Helmet>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TestDashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Settings />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/test-dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TestDashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </Router>
      </HelmetProvider>
    </ReduxProvider>
  );
};

export default App;
