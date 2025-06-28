// customer-frontend/src/components/ProtectedRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ✅ useAuth hook import karein

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth(); // Auth context se user info aur loading state

  if (loading) {
    // Agar authentication state abhi load ho rahi hai, toh loading indicator dikhayein ya null return karein
    return <div>Loading authentication...</div>;
  }

  // Agar user authenticated nahi hai, login page par redirect karein
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Agar allowedRoles specify kiye gaye hain, toh user ka role check karein
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Agar user ka role allowed nahi hai, toh unauthorized page par redirect karein ya home page par
    console.warn(`Access denied for role: ${user?.role}. Required roles: ${allowedRoles.join(', ')}`);
    return <Navigate to="/" replace />; // Ya koi UnauthorizedPage component bana sakte hain
  }

  // Agar sab conditions theek hain, toh children components ko render karein
  return children;
}

export default ProtectedRoute;