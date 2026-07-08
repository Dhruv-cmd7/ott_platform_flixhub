import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, Mail, CheckCircle2, XCircle, AlertTriangle, RefreshCw, ShieldOff, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const Subscribers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [toast, setToast] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      const res = await api.get('/api/dashboard/users', { params });
      if (res.data.success) {
        setUsers(res.data.data?.users ?? res.data.data ?? []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      showToast('Failed to load subscribers.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus]);

  useEffect(() => {
    const debounce = setTimeout(() => fetchUsers(), 400);
    return () => clearTimeout(debounce);
  }, [fetchUsers]);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    setTogglingId(user._id);
    try {
      await api.patch(`/api/dashboard/users/${user._id}/status`, { status: newStatus });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, status: newStatus } : u));
      showToast(`${user.name}'s account ${newStatus === 'active' ? 'reactivated' : 'suspended'} successfully.`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update account status.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const statusBadge = (status) => {
    const map = {
      active: 'bg-emerald-500/10 text-emerald-400',
      suspended: 'bg-red-500/10 text-red-400',
      inactive: 'bg-gray-500/10 text-gray-400',
    };
    return map[status] || 'bg-gray-500/10 text-gray-400';
  };

  const totalCount = users.length;
  const activeCount = users.filter(u => u.status === 'active').length;
  const suspendedCount = users.filter(u => u.status === 'suspended').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium animate-in slide-in-from-right duration-300 ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
          {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white m-0">Subscribers</h1>
          <p className="text-gray-400 text-sm mt-1">Monitor registered users, their subscription tiers, and account states.</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-semibold px-4 py-2.5 rounded-lg border border-white/5 transition-all">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: totalCount, color: 'text-white' },
          { label: 'Active', value: activeCount, color: 'text-emerald-400' },
          { label: 'Suspended', value: suspendedCount, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 rounded-xl border border-white/5 text-center">
            <div className={`text-2xl font-extrabold ${s.color}`}>{loading ? '—' : s.value}</div>
            <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 justify-between bg-white/[0.01] border border-white/5 p-4 rounded-xl">
        <div className="relative flex items-center bg-white/[0.03] border border-white/5 rounded-lg w-full md:w-80 focus-within:border-[#e50914]/50 transition-all">
          <Search className="absolute left-3 text-gray-500" size={16} />
          <input type="text" placeholder="Search by name, email..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-gray-200 pl-10 pr-4 py-2.5 outline-none placeholder-gray-500" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-white/[0.03] border border-white/5 rounded-lg text-xs text-gray-300 px-3 py-2.5 outline-none focus:border-[#e50914]/50 w-full md:w-auto">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Subscribers Table */}
      <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01] text-gray-500 text-xs font-semibold uppercase">
                <th className="p-4">Subscriber</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Subscription</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="p-4">
                        <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <Users size={40} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-500 text-sm">No users found. Try clearing your search filters.</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="text-gray-300 hover:bg-white/[0.01] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#e50914]/10 flex items-center justify-center font-bold text-[#e50914] text-sm">
                          {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white leading-none">{user.name}</h4>
                          <span className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <Mail size={11} />{user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-gray-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-300">
                      {user.activeSubscription ?? <span className="text-gray-600 italic">No active plan</span>}
                    </td>
                    <td className="p-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase inline-flex items-center gap-1 ${statusBadge(user.status)}`}>
                        {user.status === 'active' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        disabled={togglingId === user._id}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded transition-all disabled:opacity-50 ${
                          user.status === 'active'
                            ? 'text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20'
                            : 'text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20'
                        }`}
                      >
                        {togglingId === user._id
                          ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          : user.status === 'active' ? <ShieldOff size={13} /> : <ShieldCheck size={13} />
                        }
                        {user.status === 'active' ? 'Suspend' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Subscribers;
