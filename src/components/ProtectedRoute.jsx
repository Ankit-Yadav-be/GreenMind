import React from 'react';
import { Navigate } from 'react-router-dom';

// requiredRole: 'admin' | 'user' | undefined (any authenticated user)
const ProtectedRoute = ({ isAuthenticated, userRole, requiredRole, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'admin' && userRole !== 'admin') {
    // Logged in but not admin — send to home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;