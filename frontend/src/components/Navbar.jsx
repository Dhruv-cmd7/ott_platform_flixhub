import React, { useState, useEffect } from 'react';
import { Menu, Bell, Search, ChevronDown, User, LogOut, Settings, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/dashboard/notifications');
      if (res.data && res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id) => {
    try {
      await api.patch(`/api/dashboard/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreads = notifications.filter(n => !n.isRead);
      await Promise.all(unreads.map(n => api.patch(`/api/dashboard/notifications/${n._id}/read`)));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  return (
    <header className="h-16 glass-panel border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left side: Hamburger and Search */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-gray-400 hover:text-white p-2 rounded-md hover:bg-white/5 transition-colors focus:outline-none"
        >
          <Menu size={20} />
        </button>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center gap-2 bg-white/[0.03] border border-white/5 px-3 py-1.5 rounded-lg w-64 focus-within:border-[#e50914]/50 focus-within:bg-white/[0.05] transition-all">
          <Search size={16} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search catalog, users..."
            className="bg-transparent border-none text-xs text-gray-200 outline-none w-full placeholder-gray-500"
          />
        </div>
      </div>

      {/* Right side: Actions & User Dropdown */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
            className="relative text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors focus:outline-none cursor-pointer"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#e50914] text-[9px] font-bold text-white rounded-full flex items-center justify-center ring-2 ring-[#0f0f12]">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#14141b]/95 border border-white/10 shadow-2xl py-2.5 z-20 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] text-red-500 hover:text-red-400 font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <CheckCheck size={12} />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-white/[0.03]">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div 
                        key={n._id}
                        onClick={() => !n.isRead && markAsRead(n._id)}
                        className={`p-3.5 flex items-start gap-2.5 hover:bg-white/[0.02] transition-colors cursor-pointer ${
                          !n.isRead ? 'bg-white/[0.01]' : 'opacity-60'
                        }`}
                      >
                        {!n.isRead && (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        )}
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-200 truncate">{n.title}</p>
                          <p className="text-[11px] text-gray-400 line-clamp-2">{n.message}</p>
                          <p className="text-[9px] text-gray-500">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-gray-500">
                      No notifications yet
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 hover:bg-white/[0.03] p-1.5 rounded-lg transition-colors focus:outline-none"
          >
            {/* Custom Avatar Initials */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#e50914] to-red-500 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-red-900/20">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A'}
            </div>
            <div className="hidden sm:flex flex-col items-start text-left">
              <span className="text-xs font-semibold text-gray-200 truncate max-w-[100px]">
                {user?.name}
              </span>
              <span className="text-[10px] text-gray-400">{user?.role}</span>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <>
              {/* Overlay to close on click outside */}
              <div
                onClick={() => setDropdownOpen(false)}
                className="fixed inset-0 z-10"
              />

              <div className="absolute right-0 mt-2 w-48 rounded-lg bg-[#14141b] border border-white/5 shadow-2xl py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-white/5">
                  <p className="text-xs text-gray-400 font-semibold truncate">{user?.email}</p>
                </div>

                <Link
                  to="/admin/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User size={14} />
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/admin/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings size={14} />
                  <span>Settings</span>
                </Link>

                <div className="border-t border-white/5 my-1"></div>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
