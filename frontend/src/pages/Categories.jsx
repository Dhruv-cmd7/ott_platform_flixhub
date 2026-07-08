import React, { useState, useEffect, useCallback } from 'react';
import { Compass, Plus, Edit2, Trash2, X, CheckCircle2, AlertTriangle, RefreshCw, Tag, Globe } from 'lucide-react';
import api from '../services/api';

const AddModal = ({ type, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const endpointMap = { category: '/api/metadata/categories', genre: '/api/metadata/genres', language: '/api/metadata/languages' };
      await api.post(endpointMap[type], { name: name.trim(), description: description.trim() });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to create ${type}.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#13131a] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-base font-bold text-white capitalize">Add New {type}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />{error}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={`e.g. ${type === 'category' ? 'Action & Adventure' : type === 'genre' ? 'Cyberpunk' : 'English'}`}
              className="w-full bg-white/[0.02] border border-white/5 rounded-lg text-sm text-gray-200 px-4 py-2.5 outline-none focus:border-[#e50914]/50 focus:bg-white/[0.04] transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description..."
              className="w-full bg-white/[0.02] border border-white/5 rounded-lg text-sm text-gray-200 px-4 py-2.5 outline-none focus:border-[#e50914]/50 focus:bg-white/[0.04] transition-all" />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-semibold bg-[#e50914] hover:bg-[#ff1e27] text-white rounded-lg transition-all disabled:opacity-50 flex items-center gap-2">
              {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : `+ Add ${type}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MetadataSection = ({ title, icon: Icon, items, loading, onDelete, onAdd, color }) => (
  <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
    <div className="flex items-center justify-between p-5 border-b border-white/5">
      <div className="flex items-center gap-2">
        <Icon size={18} className={color} />
        <h2 className="text-base font-bold text-white">{title}</h2>
        {!loading && <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{items.length}</span>}
      </div>
      <button onClick={onAdd} className="flex items-center gap-1.5 text-xs font-semibold bg-[#e50914]/10 hover:bg-[#e50914]/20 text-[#e50914] px-3 py-1.5 rounded-lg transition-all">
        <Plus size={13} /> Add
      </button>
    </div>
    <div className="p-4">
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-6">No {title.toLowerCase()} found. Add one to get started.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map(item => (
            <div key={item._id} className="flex items-center justify-between bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-lg px-3 py-2.5 group transition-all">
              <div className="min-w-0">
                <span className="text-sm font-medium text-gray-200 truncate block">{item.name}</span>
                {item.slug && <span className="text-[10px] text-gray-600 font-mono">{item.slug}</span>}
              </div>
              <button onClick={() => onDelete(item)} className="ml-2 p-1 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'category' | 'genre' | 'language'
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, genRes, langRes] = await Promise.all([
        api.get('/api/metadata/categories'),
        api.get('/api/metadata/genres'),
        api.get('/api/metadata/languages'),
      ]);
      setCategories(catRes.data.data ?? catRes.data ?? []);
      setGenres(genRes.data.data ?? genRes.data ?? []);
      setLanguages(langRes.data.data ?? langRes.data ?? []);
    } catch (err) {
      console.error('Error loading metadata:', err);
      showToast('Failed to load metadata from server.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async (type, item) => {
    if (!window.confirm(`Delete "${item.name}"? This may affect content using this tag.`)) return;
    const endpointMap = { category: '/api/metadata/categories', genre: '/api/metadata/genres', language: '/api/metadata/languages' };
    try {
      await api.delete(`${endpointMap[type]}/${item._id}`);
      if (type === 'category') setCategories(prev => prev.filter(i => i._id !== item._id));
      if (type === 'genre') setGenres(prev => prev.filter(i => i._id !== item._id));
      if (type === 'language') setLanguages(prev => prev.filter(i => i._id !== item._id));
      showToast(`"${item.name}" deleted successfully.`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed.', 'error');
    }
  };

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
          <h1 className="text-3xl font-extrabold tracking-tight text-white m-0">Categories & Genres</h1>
          <p className="text-gray-400 text-sm mt-1">Organize your video content by category tags, sub-genres, and languages.</p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-semibold px-4 py-2.5 rounded-lg border border-white/5 transition-all">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <MetadataSection title="Categories" icon={Compass} items={categories} loading={loading}
        onDelete={(item) => handleDelete('category', item)} onAdd={() => setModal('category')} color="text-[#e50914]" />

      <MetadataSection title="Genres" icon={Tag} items={genres} loading={loading}
        onDelete={(item) => handleDelete('genre', item)} onAdd={() => setModal('genre')} color="text-purple-400" />

      <MetadataSection title="Languages" icon={Globe} items={languages} loading={loading}
        onDelete={(item) => handleDelete('language', item)} onAdd={() => setModal('language')} color="text-blue-400" />

      {modal && (
        <AddModal
          type={modal}
          onClose={() => setModal(null)}
          onSuccess={() => { fetchAll(); showToast(`${modal.charAt(0).toUpperCase() + modal.slice(1)} added successfully!`); }}
        />
      )}
    </div>
  );
};

export default Categories;
