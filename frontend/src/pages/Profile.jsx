import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Shield, Key, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';

const Profile = () => {
  const { user, refreshProfile } = useAuth();

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.put('/api/auth/change-password', {
        oldPassword: currentPassword,
        newPassword,
      });

      setSuccess(response.data.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white m-0">Admin Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your administrative credentials and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Card: User Info Overview */}
        <div className="glass-card p-6 rounded-xl border border-white/5 h-fit space-y-6">
          <div className="flex flex-col items-center text-center pb-6 border-b border-white/5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#e50914] to-red-500 flex items-center justify-center font-extrabold text-white text-3xl shadow-xl shadow-red-900/10 mb-4">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A'}
            </div>
            <h3 className="text-xl font-bold text-white">{user?.name}</h3>
            <span className="text-xs font-bold text-[#e50914] bg-[#e50914]/10 px-2.5 py-1 rounded-full uppercase mt-2 tracking-wider">
              {user?.role}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <User size={16} className="text-gray-500" />
              <div>
                <span className="text-xs text-gray-500 block">Full Name</span>
                <span className="font-medium">{user?.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Mail size={16} className="text-gray-500" />
              <div>
                <span className="text-xs text-gray-500 block">Email Address</span>
                <span className="font-medium truncate block max-w-[200px]">{user?.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Shield size={16} className="text-gray-500" />
              <div>
                <span className="text-xs text-gray-500 block">Permission Level</span>
                <span className="font-medium text-gray-400">Full System Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Change Password Form */}
        <div className="lg:col-span-2 glass-card p-6 md:p-8 rounded-xl border border-white/5 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-white/5">
            <Key className="text-[#e50914]" size={20} />
            <h2 className="text-lg font-bold text-white">Security & Password</h2>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-lg text-sm">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Password */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                  Current Password
                </label>
                <div className="relative flex items-center bg-white/[0.02] border border-white/5 rounded-lg focus-within:border-[#e50914]/50 focus-within:bg-white/[0.04] transition-all">
                  <Lock className="absolute left-3 text-gray-500" size={16} />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-transparent border-none text-sm text-gray-200 pl-10 pr-4 py-3 outline-none placeholder-gray-600"
                    required
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                  New Password
                </label>
                <div className="relative flex items-center bg-white/[0.02] border border-white/5 rounded-lg focus-within:border-[#e50914]/50 focus-within:bg-white/[0.04] transition-all">
                  <Lock className="absolute left-3 text-gray-500" size={16} />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-transparent border-none text-sm text-gray-200 pl-10 pr-4 py-3 outline-none placeholder-gray-600"
                    required
                  />
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                  Confirm New Password
                </label>
                <div className="relative flex items-center bg-white/[0.02] border border-white/5 rounded-lg focus-within:border-[#e50914]/50 focus-within:bg-white/[0.04] transition-all">
                  <Lock className="absolute left-3 text-gray-500" size={16} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-transparent border-none text-sm text-gray-200 pl-10 pr-4 py-3 outline-none placeholder-gray-600"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#e50914] hover:bg-[#ff1e27] text-white font-semibold px-6 py-2.5 rounded-lg shadow-lg hover:shadow-red-600/20 active:scale-[0.98] transition-all duration-150 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
