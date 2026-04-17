import React from 'react';
import { Navigate } from 'react-router-dom';

// requiredRole: 'admin' | 'user' | undefined (any authenticated user)
const ProtectedRoute = ({ isAuthenticated, userRole, requiredRole, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

const ADMIN_ROLES = ['admin', 'super_admin', 'category_head', 'area_head'];
if (requiredRole === 'admin' && !ADMIN_ROLES.includes(userRole)) {
  return <Navigate to="/" replace />;
}
if (requiredRole && requiredRole !== 'admin' && userRole !== requiredRole) {
  return <Navigate to="/" replace />;
}

  return children;
};

export default ProtectedRoute;