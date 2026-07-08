import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/api/auth/profile');
        if (res.data && res.data.success) {
          setUser(res.data.data);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (err) {
        console.error('Session validation failed:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Standard Email & Password Login
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Try Admin login first
      try {
        const res = await api.post('/api/auth/admin/login', { email, password });
        if (res.data && res.data.success) {
          const { admin, accessToken } = res.data.data;
          const adminUser = { ...admin, type: 'admin' };
          localStorage.setItem('token', accessToken);
          localStorage.setItem('user', JSON.stringify(adminUser));
          setUser(adminUser);
          return { success: true };
        }
      } catch (adminErr) {
        // If it's a 401/400 (auth error), try normal user login
        if (adminErr.response && (adminErr.response.status === 401 || adminErr.response.status === 400)) {
          const res = await api.post('/api/auth/login', { email, password });
          if (res.data && res.data.success) {
            const { user: normalUser, accessToken } = res.data.data;
            const clientUser = { ...normalUser, type: 'user' };
            localStorage.setItem('token', accessToken);
            localStorage.setItem('user', JSON.stringify(clientUser));
            setUser(clientUser);
            return { success: true };
          }
        } else {
          throw adminErr;
        }
      }
      return { success: false, message: 'Invalid email or password' };
    } catch (err) {
      console.error('Login error:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Invalid email or password.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Standard Email & Password Registration
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const res = await api.post('/api/auth/register', { name, email, password });
      
      if (res.data && res.data.success) {
        const { user: normalUser, accessToken } = res.data.data;
        const clientUser = { ...normalUser, type: 'user' };
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(clientUser));
        setUser(clientUser);
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Registration failed' };
    } catch (err) {
      console.error('Registration error:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Email already exists or invalid data.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Login
  const googleLogin = async (idToken) => {
    try {
      setLoading(true);
      const res = await api.post('/api/auth/google-login', { idToken });
      
      if (res.data && res.data.success) {
        const { admin, accessToken } = res.data.data;
        const adminUser = { ...admin, type: 'admin' };
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(adminUser));
        setUser(adminUser);
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Google authentication failed' };
    } catch (err) {
      console.error('Google login error:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Unauthorized Google account.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout Session
  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error on server:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/api/auth/profile');
      if (res.data && res.data.success) {
        setUser(res.data.data);
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      console.error('Refresh profile error:', err);
      return { success: false };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    googleLogin,
    logout,
    refreshProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
