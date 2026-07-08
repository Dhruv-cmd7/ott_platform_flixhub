import React, { useState, useEffect, useCallback } from 'react';
import { Film, Plus, Edit2, Trash2, Search, Eye, Star, ToggleLeft, ToggleRight, Flame, Bookmark, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const POSTER_FALLBACK = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=300&auto=format&fit=crop';

const AddContentModal = ({ onClose, onSuccess }) => {
  const [tab, setTab] = useState('movie');
  const [form, setForm] = useState({ title: '', description: '', releaseYear: new Date().getFullYear(), thumbnailUrl: '', bannerUrl: '', videoUrl: '', duration: '', ageRating: 'PG-13' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.thumbnailUrl || !form.bannerUrl) {
      setError('Title, Thumbnail URL and Banner URL are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const endpoint = tab === 'movie' ? '/api/movies' : '/api/series';
      const payload = tab === 'movie'
        ? { ...form, duration: Number(form.duration) || 90 }
        : { ...form };
      await api.post(endpoint, payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create content.');
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, type = 'text', hint = '') => (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        placeholder={hint}
        className="w-full bg-white/[0.02] border border-white/5 rounded-lg text-sm text-gray-200 px-4 py-2.5 outline-none focus:border-[#e50914]/50 focus:bg-white/[0.04] transition-all"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#13131a] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Add New Content</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"><X size={18} /></button>
        </div>

        <div className="flex gap-2 px-6 pt-4">
          {['movie', 'series'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${tab === t ? 'bg-[#e50914] text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>{t}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />{error}
            </div>
          )}
          {field('Title *', 'title', 'text', 'Enter content title')}
          {field('Description', 'description', 'text', 'Brief synopsis...')}
          <div className="grid grid-cols-2 gap-4">
            {field('Release Year', 'releaseYear', 'number', '2024')}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Age Rating</label>
              <select value={form.ageRating} onChange={e => setForm(p => ({ ...p, ageRating: e.target.value }))} className="w-full bg-white/[0.02] border border-white/5 rounded-lg text-sm text-gray-200 px-4 py-2.5 outline-none focus:border-[#e50914]/50 transition-all">
                {['G', 'PG', 'PG-13', 'R', 'NC-17', 'TV-MA', 'TV-14', 'TV-G'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          {field('Thumbnail URL *', 'thumbnailUrl', 'url', 'https://...')}
          {field('Banner URL *', 'bannerUrl', 'url', 'https://...')}
          {tab === 'movie' && field('Video URL', 'videoUrl', 'url', 'https://...')}
          {tab === 'movie' && field('Duration (minutes)', 'duration', 'number', '120')}

          <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-semibold bg-[#e50914] hover:bg-[#ff1e27] text-white rounded-lg transition-all disabled:opacity-50 flex items-center gap-2">
              {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : '+ Add Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Content = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [movRes, serRes] = await Promise.all([
        api.get('/api/movies', { params: { limit: 50 } }),
        api.get('/api/series', { params: { limit: 50 } }),
      ]);
      const movies = (movRes.data.data?.movies ?? movRes.data.data ?? []).map(m => ({ ...m, contentType: 'movie' }));
      const series = (serRes.data.data?.series ?? serRes.data.data ?? []).map(s => ({ ...s, contentType: 'series' }));
      setItems([...movies, ...series].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error('Error loading catalog:', err);
      showToast('Failed to load catalog. Check backend.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    try {
      const endpoint = item.contentType === 'movie' ? `/api/movies/${item._id}` : `/api/series/${item._id}`;
      await api.delete(endpoint);
      showToast(`"${item.title}" deleted successfully.`);
      setItems(prev => prev.filter(i => i._id !== item._id));
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed.', 'error');
    }
  };

  const handleToggle = async (item, field) => {
    try {
      const endpoint = item.contentType === 'movie' ? `/api/movies/${item._id}` : `/api/series/${item._id}`;
      const res = await api.put(endpoint, { [field]: !item[field] });
      const updated = res.data.data ?? res.data;
      setItems(prev => prev.map(i => i._id === item._id ? { ...updated, contentType: item.contentType } : i));
      showToast(`"${item.title}" updated.`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed.', 'error');
    }
  };

  const filtered = items.filter(item => {
    const matchSearch = !search || item.title?.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || item.contentType === filterType;
    const matchStatus = !filterStatus
      || (filterStatus === 'published' && item.isPublished)
      || (filterStatus === 'draft' && !item.isPublished)
      || (filterStatus === 'featured' && item.isFeatured)
      || (filterStatus === 'trending' && item.isTrending);
    return matchSearch && matchType && matchStatus;
  });

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
          <h1 className="text-3xl font-extrabold tracking-tight text-white m-0">Movies & Series</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your platform video titles, episodes, and release states.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#e50914] hover:bg-[#ff1e27] text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-lg hover:shadow-red-600/20 active:scale-[0.98] transition-all">
          <Plus size={16} /> Add New Media
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 justify-between bg-white/[0.01] border border-white/5 p-4 rounded-xl">
        <div className="relative flex items-center bg-white/[0.03] border border-white/5 rounded-lg w-full md:w-80 focus-within:border-[#e50914]/50 transition-all">
          <Search className="absolute left-3 text-gray-500" size={16} />
          <input type="text" placeholder="Search by title..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-gray-200 pl-10 pr-4 py-2.5 outline-none placeholder-gray-500" />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="bg-white/[0.03] border border-white/5 rounded-lg text-xs text-gray-300 px-3 py-2.5 outline-none focus:border-[#e50914]/50 w-full md:w-auto">
            <option value="">All Types</option>
            <option value="movie">Movies</option>
            <option value="series">Series</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-white/[0.03] border border-white/5 rounded-lg text-xs text-gray-300 px-3 py-2.5 outline-none focus:border-[#e50914]/50 w-full md:w-auto">
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="featured">Featured</option>
            <option value="trending">Trending</option>
          </select>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-gray-500">{filtered.length} title{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Media Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl overflow-hidden border border-white/5 animate-pulse">
              <div className="aspect-[16/9] bg-white/5" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-white/5 rounded w-3/4" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-xl border border-white/5 p-16 text-center">
          <Film size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Content Found</h3>
          <p className="text-gray-500 text-sm mb-6">Add your first movie or series to get started.</p>
          <button onClick={() => setShowModal(true)} className="bg-[#e50914] hover:bg-[#ff1e27] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all">+ Add Content</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((media) => (
            <div key={media._id} className="glass-card rounded-xl overflow-hidden border border-white/5 group hover:border-white/15 transition-all flex flex-col justify-between">
              {/* Poster */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-white/5">
                <img
                  src={media.thumbnailUrl || POSTER_FALLBACK}
                  alt={media.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  onError={e => { e.target.src = POSTER_FALLBACK; }}
                />
                <span className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-gray-200 border border-white/10 uppercase">
                  {media.contentType}
                </span>
                <span className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  media.isPublished ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-black'
                }`}>
                  {media.isPublished ? 'Published' : 'Draft'}
                </span>
                {media.isFeatured && (
                  <span className="absolute bottom-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-yellow-500 text-black uppercase flex items-center gap-0.5">
                    <Bookmark size={9} /> Featured
                  </span>
                )}
                {media.isTrending && (
                  <span className="absolute bottom-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-500 text-white uppercase flex items-center gap-0.5">
                    <Flame size={9} /> Trending
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4 space-y-2 flex-1">
                <h3 className="text-sm font-bold text-white group-hover:text-[#e50914] transition-colors truncate">{media.title}</h3>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{media.releaseYear}</span>
                  <span className="flex items-center gap-1"><Eye size={11} />{(media.views ?? 0).toLocaleString()}</span>
                  <span className="flex items-center gap-1 text-yellow-400"><Star size={10} fill="currentColor" />{media.averageRating?.toFixed(1) ?? 'N/A'}</span>
                </div>
              </div>

              {/* Toggle Controls */}
              <div className="px-3 py-2 bg-white/[0.01] border-t border-white/5 flex items-center justify-between gap-1">
                <button title="Toggle Publish" onClick={() => handleToggle(media, 'isPublished')}
                  className={`p-1.5 rounded transition-all ${media.isPublished ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
                  {media.isPublished ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                </button>
                <button title="Toggle Featured" onClick={() => handleToggle(media, 'isFeatured')}
                  className={`p-1.5 rounded transition-all ${media.isFeatured ? 'text-yellow-400 hover:bg-yellow-500/10' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
                  <Bookmark size={14} />
                </button>
                <button title="Toggle Trending" onClick={() => handleToggle(media, 'isTrending')}
                  className={`p-1.5 rounded transition-all ${media.isTrending ? 'text-orange-400 hover:bg-orange-500/10' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
                  <Flame size={14} />
                </button>
                <div className="w-px h-4 bg-white/5" />
                <button title="Delete Content" onClick={() => handleDelete(media)}
                  className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all ml-auto">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <AddContentModal onClose={() => setShowModal(false)} onSuccess={() => { fetchAll(); showToast('Content added successfully!'); }} />}
    </div>
  );
};

export default Content;
