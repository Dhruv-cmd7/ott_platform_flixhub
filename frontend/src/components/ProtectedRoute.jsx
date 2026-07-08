import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-gray-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-red-600 animate-spin"></div>
          </div>
          <p className="text-gray-400 text-sm tracking-widest uppercase animate-pulse">
            Verifying Session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page but save the current location they tried to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect standard user to /watch if they try to access admin pages
  if (user.type === 'user' && location.pathname !== '/watch' && location.pathname !== '/restricted') {
    return <Navigate to="/watch" replace />;
  }

  // Redirect admins away from /watch and /restricted back to main dashboard
  if (user.type === 'admin' && (location.pathname === '/watch' || location.pathname === '/restricted')) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
