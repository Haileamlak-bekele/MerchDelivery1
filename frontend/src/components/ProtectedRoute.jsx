import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token || !user) {
    // Not logged in
    return <Navigate to="/auth" />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Logged in but not authorized for this route
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;
