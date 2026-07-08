import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Play, Info, Plus, Search, Bell, LogOut, Volume2, VolumeX, 
  Maximize, Minimize, Tv, Film, Heart, Check, ChevronDown, Sparkles, CheckCheck
} from 'lucide-react';

const Watch = () => {
  const { user, logout } = useAuth();
  
  // Data lists
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [featured, setFeatured] = useState(null);
  
  // Loading & states
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home'); // home, movies, tv, list
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlist, setWatchlist] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  
  // Custom video player state
  const [activeVideo, setActiveVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Fetch movies and TV shows
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [moviesRes, seriesRes] = await Promise.all([
          api.get('/api/movies?limit=50'),
          api.get('/api/series?limit=50')
        ]);
        
        const moviesList = moviesRes.data?.data?.movies || [];
        const seriesList = seriesRes.data?.data?.series || [];
        
        setMovies(moviesList);
        setSeries(seriesList);
        
        // Find featured item
        const featuredMovie = moviesList.find(m => m.isFeatured && m.isPublished) || moviesList[0] || null;
        setFeatured(featuredMovie);
      } catch (err) {
        console.error('Error fetching stream data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

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

  // Filter lists based on search and active tabs
  const getFilteredMovies = () => {
    let list = movies.filter(m => m.isPublished);
    if (searchQuery) {
      list = list.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list;
  };

  const getFilteredSeries = () => {
    let list = series.filter(s => s.isPublished);
    if (searchQuery) {
      list = list.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list;
  };

  // Video Player Utilities
  const startVideo = (media) => {
    setActiveVideo(media);
    setIsPlaying(true);
    setCurrentTime(0);
    // Auto request fullscreen on start
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(err => console.log('Playback error:', err));
      }
    }, 200);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(err => console.log(err));
        setIsPlaying(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeekChange = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      videoRef.current.muted = vol === 0;
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (videoRef.current) {
      videoRef.current.muted = nextMute;
      videoRef.current.volume = nextMute ? 0 : volume || 0.5;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen().catch(err => console.log(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  // Close player
  const closePlayer = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setActiveVideo(null);
    setIsPlaying(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.log(err));
    }
    setIsFullscreen(false);
  };

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Toggle watchlist item
  const toggleWatchlist = (media) => {
    const exists = watchlist.some(item => item._id === media._id);
    if (exists) {
      setWatchlist(watchlist.filter(item => item._id !== media._id));
    } else {
      setWatchlist([...watchlist, media]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0d] text-gray-200 select-none overflow-x-hidden font-sans pb-20">
      
      {/* Dynamic Header */}
      <nav className="fixed top-0 left-0 w-full z-40 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-xs px-6 py-4 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-1.5 cursor-pointer">
            <span className="text-2xl font-black text-[#e50914] tracking-wider uppercase">
              FLIX<span className="text-white font-medium">Hub</span>
            </span>
          </div>
          
          {/* Nav Categories */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
            <button 
              onClick={() => { setActiveTab('home'); setSearchQuery(''); }}
              className={`hover:text-white transition-colors cursor-pointer ${activeTab === 'home' ? 'text-white font-bold' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => { setActiveTab('movies'); setSearchQuery(''); }}
              className={`hover:text-white transition-colors cursor-pointer ${activeTab === 'movies' ? 'text-white font-bold' : ''}`}
            >
              Movies
            </button>
            <button 
              onClick={() => { setActiveTab('tv'); setSearchQuery(''); }}
              className={`hover:text-white transition-colors cursor-pointer ${activeTab === 'tv' ? 'text-white font-bold' : ''}`}
            >
              TV Shows
            </button>
            <button 
              onClick={() => { setActiveTab('list'); setSearchQuery(''); }}
              className={`hover:text-white transition-colors cursor-pointer ${activeTab === 'list' ? 'text-white font-bold' : ''}`}
            >
              My List ({watchlist.length})
            </button>
          </div>
        </div>

        {/* Right Nav Utilities */}
        <div className="flex items-center gap-6">
          {/* Search bar */}
          <div className="relative flex items-center bg-black/40 border border-white/10 rounded-full px-3 py-1.5 focus-within:border-red-600 focus-within:ring-1 focus-within:ring-red-600 transition-all">
            <Search size={16} className="text-gray-400 mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Search catalog..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs text-white outline-none w-[120px] sm:w-[200px]"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              className="relative text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors focus:outline-none cursor-pointer"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#e50914] text-[9px] font-bold text-white rounded-full flex items-center justify-center ring-2 ring-[#0a0a0d]">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 mt-3 w-80 rounded-xl bg-[#121218]/95 border border-white/10 shadow-2xl py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                  <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-[10px] text-[#e50914] hover:text-red-400 font-semibold cursor-pointer flex items-center gap-1"
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

          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-8 h-8 rounded-md bg-gradient-to-tr from-[#e50914] to-red-500 flex items-center justify-center font-bold text-white text-sm shadow-md cursor-pointer uppercase"
            >
              {user?.name ? user.name[0] : 'U'}
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-[#121218]/95 border border-white/10 rounded-xl p-4 shadow-2xl z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="border-b border-white/5 pb-2.5 mb-2.5">
                  <span className="text-xs text-gray-500 block">Logged in as</span>
                  <span className="text-sm font-semibold text-white block truncate">{user?.name}</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5 truncate">{user?.email}</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Membership:</span>
                    <span className="text-emerald-400 font-semibold">{user?.activeSubscription ? 'Premium' : 'Free Tier'}</span>
                  </div>
                </div>
                <div className="border-t border-white/5 mt-3 pt-3">
                  <button 
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 bg-[#e50914] hover:bg-[#b80710] text-white py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section (Featured Content) */}
      {featured && activeTab === 'home' && !searchQuery && (
        <div 
          className="relative w-full h-[65vh] sm:h-[80vh] flex items-end justify-start bg-cover bg-center overflow-hidden"
          style={{ backgroundImage: `url(${featured.bannerUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925'})` }}
        >
          {/* Gradients to darken background */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0d] via-transparent to-black/50"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent"></div>

          <div className="relative z-10 max-w-2xl px-6 md:px-12 pb-16 md:pb-24 space-y-4 text-left">
            <div className="flex items-center gap-2.5 text-xs text-red-500 font-bold uppercase tracking-widest">
              <Sparkles size={14} />
              <span>Featured Movie</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-none tracking-tight">
              {featured.title}
            </h1>

            <div className="flex items-center gap-3 text-xs md:text-sm text-gray-300 font-medium">
              <span className="border border-white/20 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-white bg-white/10">
                {featured.ageRating || 'PG-13'}
              </span>
              <span>{featured.releaseYear}</span>
              <span>{featured.duration} mins</span>
              <span className="text-yellow-500 font-semibold">★ {featured.averageRating || '8.4'}</span>
            </div>

            <p className="text-xs md:text-sm text-gray-400 leading-relaxed line-clamp-3">
              {featured.description}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => startVideo(featured)}
                className="bg-white hover:bg-gray-200 active:scale-[0.98] text-black font-semibold px-6 py-2.5 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-all shadow-lg"
              >
                <Play size={18} className="fill-black" />
                <span>Play Now</span>
              </button>
              
              <button 
                onClick={() => toggleWatchlist(featured)}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 cursor-pointer transition-all border border-white/10"
              >
                {watchlist.some(item => item._id === featured._id) ? <Check size={18} /> : <Plus size={18} />}
                <span>My List</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className={`px-6 md:px-12 space-y-12 ${activeTab !== 'home' || searchQuery ? 'pt-28' : 'mt-8'}`}>
        
        {/* Search Results / Custom category title */}
        {searchQuery && (
          <div>
            <h2 className="text-2xl font-extrabold text-white mb-2">Search Results for "{searchQuery}"</h2>
            <p className="text-gray-500 text-xs">Showing matches in titles and descriptions</p>
          </div>
        )}

        {/* Home Tab Catalog Rows */}
        {activeTab === 'home' && (
          <>
            {/* Row 1: Trending Movies */}
            {getFilteredMovies().filter(m => m.isTrending).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Film size={18} className="text-[#e50914]" />
                  <span>Trending Movies</span>
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth">
                  {getFilteredMovies().filter(m => m.isTrending).map(movie => (
                    <MediaCard key={movie._id} item={movie} onPlay={startVideo} onList={toggleWatchlist} isListed={watchlist.some(w => w._id === movie._id)} />
                  ))}
                </div>
              </div>
            )}

            {/* Row 2: Popular TV Shows */}
            {getFilteredSeries().length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Tv size={18} className="text-[#e50914]" />
                  <span>Popular Series & TV Shows</span>
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth">
                  {getFilteredSeries().map(show => (
                    <MediaCard key={show._id} item={show} onPlay={startVideo} onList={toggleWatchlist} isListed={watchlist.some(w => w._id === show._id)} />
                  ))}
                </div>
              </div>
            )}

            {/* Row 3: All Movies */}
            {getFilteredMovies().length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Film size={18} className="text-[#e50914]" />
                  <span>All Streaming Movies</span>
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth">
                  {getFilteredMovies().map(movie => (
                    <MediaCard key={movie._id} item={movie} onPlay={startVideo} onList={toggleWatchlist} isListed={watchlist.some(w => w._id === movie._id)} />
                  ))}
                </div>
              </div>
            )}

            {getFilteredMovies().length === 0 && getFilteredSeries().length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500">No media content found matching your search.</p>
              </div>
            )}
          </>
        )}

        {/* Movies Tab Catalog Grid */}
        {activeTab === 'movies' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">Browse Movies</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {getFilteredMovies().map(movie => (
                <MediaCard key={movie._id} item={movie} onPlay={startVideo} onList={toggleWatchlist} isListed={watchlist.some(w => w._id === movie._id)} grid />
              ))}
            </div>
            {getFilteredMovies().length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500">No movies found matching your search.</p>
              </div>
            )}
          </div>
        )}

        {/* TV Series Tab Catalog Grid */}
        {activeTab === 'tv' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">Browse TV Series</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {getFilteredSeries().map(show => (
                <MediaCard key={show._id} item={show} onPlay={startVideo} onList={toggleWatchlist} isListed={watchlist.some(w => w._id === show._id)} grid />
              ))}
            </div>
            {getFilteredSeries().length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500">No series found matching your search.</p>
              </div>
            )}
          </div>
        )}

        {/* My List Catalog Grid */}
        {activeTab === 'list' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">My Watchlist</h3>
            {watchlist.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {watchlist.map(item => (
                  <MediaCard key={item._id} item={item} onPlay={startVideo} onList={toggleWatchlist} isListed={true} grid />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-2xl">
                <Heart size={40} className="text-gray-600 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-gray-400">Your Watchlist is empty</h4>
                <p className="text-xs text-gray-500 mt-1">Add movies and series to your watchlist to keep track of them.</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Advanced Fullscreen Video Player Modal */}
      {activeVideo && (
        <div 
          ref={playerContainerRef}
          onMouseMove={handleMouseMove}
          className="fixed inset-0 bg-black z-50 flex items-center justify-center cursor-none"
          style={{ cursor: showControls ? 'default' : 'none' }}
        >
          {/* Custom HTML5 Video Component */}
          <video
            ref={videoRef}
            src={activeVideo.videoUrl || activeVideo.trailerUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onClick={togglePlay}
            autoPlay
            className="w-full h-full object-contain"
          />

          {/* Custom Video Controls Panel overlay */}
          <div 
            className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 flex flex-col justify-between p-6 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Top Bar (Title & Close Button) */}
            <div className="flex items-center justify-between text-left">
              <div>
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Streaming Now</span>
                <h2 className="text-lg md:text-xl font-bold text-white">{activeVideo.title}</h2>
              </div>
              <button 
                onClick={closePlayer}
                className="bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-full p-2.5 cursor-pointer transition-colors"
              >
                ✕ Close
              </button>
            </div>

            {/* Bottom Controls Bar */}
            <div className="space-y-4">
              {/* Timeline Progress Bar */}
              <div className="flex items-center gap-4 text-xs font-medium">
                <span>{formatTime(currentTime)}</span>
                <input 
                  type="range" 
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeekChange}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#e50914]"
                />
                <span>{formatTime(duration)}</span>
              </div>

              {/* Controls triggers */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {/* Play/Pause */}
                  <button 
                    onClick={togglePlay}
                    className="bg-white hover:bg-gray-200 text-black rounded-full p-2.5 cursor-pointer shadow-md flex items-center justify-center"
                  >
                    {isPlaying ? (
                      <span className="text-sm font-bold px-1 py-0.5">⏸</span>
                    ) : (
                      <Play size={16} className="fill-black pl-0.5" />
                    )}
                  </button>

                  {/* Volume control */}
                  <div className="flex items-center gap-2">
                    <button onClick={toggleMute} className="text-gray-300 hover:text-white cursor-pointer">
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <input 
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Fullscreen toggle */}
                  <button onClick={toggleFullscreen} className="text-gray-300 hover:text-white cursor-pointer">
                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

// Media Card Component
const MediaCard = ({ item, onPlay, onList, isListed, grid }) => {
  return (
    <div 
      className={`glass-card rounded-xl overflow-hidden border border-white/5 group hover:border-[#e50914]/50 hover:shadow-xl transition-all duration-300 shrink-0 text-left relative ${
        grid ? 'w-full' : 'w-[150px] sm:w-[200px]'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-white/5">
        <img 
          src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600'} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Play overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-300">
          <button 
            onClick={() => onPlay(item)}
            className="w-10 h-10 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Play size={18} className="fill-white pl-0.5" />
          </button>
          
          <button 
            onClick={() => onList(item)}
            className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center shadow-lg hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
          >
            {isListed ? <Check size={18} /> : <Plus size={18} />}
          </button>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {item.isTrending && (
            <span className="bg-[#e50914] text-white text-[8px] font-black uppercase px-1 rounded">
              Hot
            </span>
          )}
        </div>
      </div>

      {/* Info details */}
      <div className="p-3 space-y-1">
        <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1 group-hover:text-[#e50914] transition-colors">
          {item.title}
        </h4>
        <div className="flex items-center justify-between text-[10px] text-gray-400">
          <span>{item.releaseYear}</span>
          <span>{item.duration ? `${item.duration} mins` : '1 Season'}</span>
        </div>
      </div>
    </div>
  );
};

export default Watch;
