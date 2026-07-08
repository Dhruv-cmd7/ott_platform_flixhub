import React, { useState, useEffect, useCallback } from 'react';
import { Film, Tv, Users, DollarSign, PlusCircle, TrendingUp, RefreshCw, Eye, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const StatCard = ({ stat, loading }) => {
  const Icon = stat.icon;
  return (
    <div className="glass-card p-6 rounded-xl border border-white/5 hover:border-white/10 transition-all flex items-center justify-between">
      <div className="space-y-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.name}</span>
        {loading ? (
          <div className="h-9 w-24 bg-white/5 rounded animate-pulse" />
        ) : (
          <h3 className="text-3xl font-extrabold text-white">{stat.value}</h3>
        )}
        <span className="text-xs text-emerald-400 flex items-center gap-1">
          <TrendingUp size={12} />
          {stat.change}
        </span>
      </div>
      <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
        <Icon size={24} />
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Dashboard stats error:', err);
      setError('Failed to load dashboard stats. Using cached data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const metricCards = [
    {
      name: 'Total Movies',
      value: stats?.totalMovies?.toLocaleString() ?? '—',
      change: `${stats?.movieGrowth ?? 0}% this month`,
      icon: Film,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      name: 'Total Series',
      value: stats?.totalSeries?.toLocaleString() ?? '—',
      change: `${stats?.seriesGrowth ?? 0}% this month`,
      icon: Tv,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      name: 'Active Subscribers',
      value: stats?.activeSubscribers?.toLocaleString() ?? '—',
      change: `${stats?.subscriberGrowth ?? 0}% this month`,
      icon: Users,
      color: 'text-[#e50914]',
      bg: 'bg-[#e50914]/10',
    },
    {
      name: 'Monthly Revenue',
      value: stats?.monthlyRevenue != null ? `$${Number(stats.monthlyRevenue).toLocaleString()}` : '—',
      change: `${stats?.revenueGrowth ?? 0}% this month`,
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
  ];

  const recentMovies = stats?.recentMovies ?? [];
  const recentUsers = stats?.recentUsers ?? [];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-red-950/20 to-transparent p-6 rounded-2xl border border-white/5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white m-0">
            Welcome back, <span className="text-[#e50914]">{user?.name ?? 'Admin'}</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Here is a quick look at your video streaming platform metrics today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-semibold px-4 py-2.5 rounded-lg border border-white/5 transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/admin/content')}
            className="flex items-center gap-2 bg-[#e50914] hover:bg-[#ff1e27] text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-lg hover:shadow-red-600/20 active:scale-[0.98] transition-all"
          >
            <PlusCircle size={16} />
            Upload Content
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-3 rounded-lg text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((stat) => (
          <StatCard key={stat.name} stat={stat} loading={loading} />
        ))}
      </div>

      {/* Lists / Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Content */}
        <div className="lg:col-span-7 glass-card p-6 rounded-xl border border-white/5 space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Recent Content</h2>
            <button onClick={() => navigate('/admin/content')} className="text-xs font-semibold text-[#e50914] hover:text-[#ff1e27] transition-colors">
              View All Catalog →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-xs font-semibold uppercase">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Views</th>
                  <th className="pb-3">Rating</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="py-3.5">
                          <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : recentMovies.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500 text-sm">No content found. Add movies or series first.</td>
                  </tr>
                ) : (
                  recentMovies.map((item) => (
                    <tr key={item._id} className="text-gray-300 hover:bg-white/[0.01] transition-colors">
                      <td className="py-3.5 font-medium text-white">{item.title}</td>
                      <td className="py-3.5">
                        <span className="text-[10px] bg-white/5 text-gray-300 px-2 py-0.5 rounded capitalize">{item.type ?? 'Movie'}</span>
                      </td>
                      <td className="py-3.5 text-gray-400 flex items-center gap-1">
                        <Eye size={12} /> {(item.views ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 text-yellow-400 text-xs flex items-center gap-1">
                        <Star size={11} fill="currentColor" /> {item.averageRating?.toFixed(1) ?? 'N/A'}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          item.isPublished ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {item.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Subscribers */}
        <div className="lg:col-span-5 glass-card p-6 rounded-xl border border-white/5 space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Recent Users</h2>
            <button onClick={() => navigate('/admin/subscribers')} className="text-xs font-semibold text-[#e50914] hover:text-[#ff1e27] transition-colors">
              Manage Users →
            </button>
          </div>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-white/[0.02] rounded-lg animate-pulse" />
              ))
            ) : recentUsers.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-8">No users found.</p>
            ) : (
              recentUsers.map((u) => (
                <div key={u._id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.01] border border-white/[0.02] hover:border-white/5 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#e50914]/10 flex items-center justify-center text-sm font-bold text-[#e50914]">
                      {u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white leading-none">{u.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{u.email}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {u.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
