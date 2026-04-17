import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Campaigns from './pages/Campaigns';
import AdminCampaigns from './pages/AdminCampaigns';

import Login from './pages/Login';
import Home from './pages/Home';
import ReportWaste from './pages/ReportWaste';
import MyReports from './pages/MyReports';
import WasteList from './pages/WasteList';
import AdminDashboard from './pages/AdminDashboard';
import MapPage from './pages/MapPage';
import Leaderboard from './pages/Leaderboard';
import NotFound from './pages/NotFound';
import ChatbotWidget from './components/chatbot/ChatbotWidget';
import WorkerPortal from './pages/WorkerPortal';
import SubAdminDashboard from './pages/SubAdminDashboard';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/check`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.isAuthenticated) {
          setIsAuthenticated(true);
          setUserRole(data.user?.role || 'user');
        }
      } catch (_) { }
      finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) return null;

  return (
    <Router>
      {isAuthenticated && (
        <Navbar
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
          userRole={userRole}
          setUserRole={setUserRole}
        />
      )}

      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            <Login
              setIsAuthenticated={setIsAuthenticated}
              setUserRole={setUserRole}
            />
          }
        />

        {/* Any logged-in user */}
        <Route path="/" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole}>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/report" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole}>
            <ReportWaste />
          </ProtectedRoute>
        } />
        <Route path="/myreports" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole}>
            <MyReports />
          </ProtectedRoute>
        } />

        {/* Leaderboard — accessible to all logged-in users */}
        <Route path="/leaderboard" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole}>
            <Leaderboard />
          </ProtectedRoute>
        } />

        {/* Admin only */}
        <Route path="/admin" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/wastelist" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="admin">
            <WasteList />
          </ProtectedRoute>
        } />
        <Route path="/map" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="admin">
            <MapPage />
          </ProtectedRoute>
        } />

        <Route path="/campaigns" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole}>
            <Campaigns />
          </ProtectedRoute>
        } />

        <Route path="/admin/campaigns" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="admin">
            <AdminCampaigns />
          </ProtectedRoute>
        } />

        <Route path="/worker-portal" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="worker">
            <WorkerPortal />
          </ProtectedRoute>
        } />
        <Route path="/sub-admin" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole}>
            <SubAdminDashboard userRole={userRole} />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {isAuthenticated && <Footer />}
      {isAuthenticated && (
        <ChatbotWidget userRole={userRole || 'user'} />
      )}
    </Router>
  );
};

export default App;