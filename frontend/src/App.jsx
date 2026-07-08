import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Content from './pages/Content';
import Categories from './pages/Categories';
import Subscribers from './pages/Subscribers';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Restricted from './pages/Restricted';
import Watch from './pages/Watch';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Home />} />

          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Restricted Access Route */}
          <Route
            path="/restricted"
            element={
              <ProtectedRoute>
                <Restricted />
              </ProtectedRoute>
            }
          />

          {/* Client Watch/Stream Route */}
          <Route
            path="/watch"
            element={
              <ProtectedRoute>
                <Watch />
              </ProtectedRoute>
            }
          />

          {/* Protected Administrative Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard / Home */}
            <Route index element={<Dashboard />} />

            {/* Media Content Management */}
            <Route path="content" element={<Content />} />

            {/* Genre and Categories Management */}
            <Route path="categories" element={<Categories />} />

            {/* Users and Subscribers Management */}
            <Route path="subscribers" element={<Subscribers />} />

            {/* Admin Profile Details & Security */}
            <Route path="profile" element={<Profile />} />

            {/* General App Settings */}
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
