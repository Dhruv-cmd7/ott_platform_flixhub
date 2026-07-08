import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Film,
  Tv,
  Users,
  Settings,
  User,
  LogOut,
  X,
  Compass,
  Sliders,
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Movies & Series', href: '/admin/content', icon: Film },
    { name: 'Categories & Genres', href: '/admin/categories', icon: Compass },
    { name: 'Subscribers', href: '/admin/subscribers', icon: Users },
    { name: 'Admin Profile', href: '/admin/profile', icon: User },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#121216] border-r border-white/5 flex flex-col justify-between transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header Logo */}
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-[#e50914] tracking-wider uppercase">
                FLIX<span className="text-white text-base font-medium">Hub</span>
              </span>
              <span className="text-[10px] font-bold bg-[#e50914]/10 text-[#e50914] px-1.5 py-0.5 rounded uppercase">
                Admin
              </span>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
 
          {/* User Brief Info */}
          <div className="px-6 py-5 border-b border-white/5 bg-white/[0.01]">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Logged In As</p>
            <p className="text-sm font-semibold text-gray-200 mt-1 truncate">{user?.name}</p>
            <p className="text-xs text-[#e50914] mt-0.5 font-medium">{user?.role}</p>
          </div>
 
          {/* Navigation Links */}
          <nav className="px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-150 group ${
                    isActive
                      ? 'bg-[#e50914]/10 text-white border-l-2 border-[#e50914]'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                  onClick={() => {
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                >
                  <Icon
                    size={18}
                    className={`transition-colors duration-200 ${
                      isActive ? 'text-[#e50914]' : 'text-gray-400 group-hover:text-white'
                    }`}
                  />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout Button */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-[#e50914]/10 hover:text-[#e50914] transition-all duration-200 group"
          >
            <LogOut
              size={18}
              className="text-gray-400 group-hover:text-[#e50914] transition-colors"
            />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
