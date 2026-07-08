import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, Shield, Tv, Smartphone, Heart, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      if (user.type === 'admin') {
        navigate('/admin');
      } else {
        navigate('/watch');
      }
    } else {
      navigate('/login');
    }
  };

  const features = [
    {
      icon: Tv,
      title: 'Enjoy on your TV',
      description: 'Watch on Smart TVs, Playstation, Xbox, Chromecast, Apple TV, Blu-ray players, and more.',
      color: 'from-red-600/20 to-orange-600/20'
    },
    {
      icon: Smartphone,
      title: 'Watch everywhere',
      description: 'Stream unlimited movies and TV shows on your phone, tablet, laptop, and TV.',
      color: 'from-blue-600/20 to-purple-600/20'
    },
    {
      icon: Shield,
      title: 'Safe Kids Profiles',
      description: 'Send kids on adventures with their favorite characters in a space made just for them—free with your membership.',
      color: 'from-emerald-600/20 to-teal-600/20'
    },
    {
      icon: Sparkles,
      title: '4K Ultra HDR Streaming',
      description: 'Experience stunning visuals, immersive audio, and premium 4K quality for supported content.',
      color: 'from-pink-600/20 to-rose-600/20'
    }
  ];

  const plans = [
    {
      name: 'Mobile',
      price: '$4.99',
      resolution: '480p',
      screens: '1 Screen',
      features: ['Mobile & Tablet only', 'Ad-supported streaming', 'Standard audio quality']
    },
    {
      name: 'Standard',
      price: '$12.99',
      resolution: '1080p',
      screens: '2 Screens',
      features: ['All devices supported', 'Ad-free streaming', 'Full HD quality', 'Offline downloads']
    },
    {
      name: 'Premium',
      price: '$19.99',
      resolution: '4K + HDR',
      screens: '4 Screens',
      features: ['All devices supported', 'Ad-free streaming', 'Ultra HD quality', 'Dolby Atmos audio', 'Priority Support']
    }
  ];

  return (
    <div className="min-h-screen bg-[#07070a] text-white selection:bg-[#e50914] selection:text-white overflow-hidden relative font-sans">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#e50914]/15 to-transparent rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-[800px] -left-[200px] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[200px] -right-[200px] w-[600px] h-[600px] bg-[#e50914]/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Header / Navbar */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-extrabold text-[#e50914] tracking-wider uppercase cursor-pointer" onClick={() => navigate('/')}>
            FLIX<span className="text-white font-medium">Hub</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')} 
            className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-white/10 hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            Sign In
          </button>
          <button 
            onClick={handleGetStarted} 
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#e50914] hover:bg-[#ff1e27] shadow-lg shadow-red-900/30 transition-all duration-200 active:scale-[0.97] cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 bg-[#e50914]/10 border border-[#e50914]/30 rounded-full px-4 py-1.5 mb-6 animate-pulse">
          <Sparkles size={14} className="text-[#e50914]" />
          <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Now Streaming 4K Ultra HD</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6 max-w-4xl">
          Unlimited Movies, <br />
          <span className="bg-gradient-to-r from-[#e50914] via-[#ff4d5a] to-[#ff808b] bg-clip-text text-transparent">TV Shows</span>, and More.
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Watch anywhere, cancel anytime. Join today and explore thousands of hours of premium content at your fingertips.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
          <button
            onClick={handleGetStarted}
            className="w-full sm:w-auto px-8 py-4 bg-[#e50914] hover:bg-[#ff1e27] text-white font-bold rounded-xl shadow-xl shadow-red-900/40 hover:shadow-red-950/60 transition-all duration-300 flex items-center justify-center gap-2 text-base active:scale-[0.98] cursor-pointer group"
          >
            <span>Start Watching Now</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Floating Device Icons Mockup */}
        <div className="mt-16 w-full max-w-4xl relative aspect-[16/9] rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-4 shadow-2xl overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-transparent to-transparent z-10" />
          {/* Main Visual: stylized dashboard mockup */}
          <div className="w-full h-full rounded-lg bg-[#0e0e13] border border-white/5 relative overflow-hidden flex flex-col">
            {/* Top Mockup bar */}
            <div className="h-10 border-b border-white/5 px-4 flex items-center justify-between bg-black/40">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
              </div>
              <div className="w-1/3 h-4 bg-white/5 rounded-full" />
              <div className="w-8" />
            </div>
            {/* Catalog Grid Mockup */}
            <div className="flex-1 p-6 grid grid-cols-2 md:grid-cols-4 gap-4 overflow-hidden">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-gradient-to-b from-white/[0.03] to-white/[0.08] rounded-lg border border-white/5 p-3 flex flex-col justify-end relative group hover:border-[#e50914]/30 transition-all">
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                    <Play className="text-[#e50914]" size={28} fill="currentColor" />
                  </div>
                  <div className="space-y-1.5 relative z-10">
                    <div className="h-4 bg-[#e50914]/20 rounded w-2/3" />
                    <div className="h-3 bg-white/5 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Why Choose FlixHub?</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Get access to premium features designed to make your viewing experience simple, fast, and unforgettable.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white border border-white/5 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={22} className="text-[#e50914]" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#e50914] transition-colors">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Plans Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-black">Choose a Plan that Fits You</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Simple pricing plans with zero hidden fees. Switch or cancel at any time.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`p-8 rounded-2xl border flex flex-col justify-between relative transition-all duration-300 ${
                plan.name === 'Standard' 
                  ? 'bg-gradient-to-b from-[#e50914]/10 via-[#101015] to-[#101015] border-[#e50914]/40 shadow-xl shadow-red-950/20 scale-105' 
                  : 'bg-white/[0.01] border-white/5 hover:border-white/10'
              }`}
            >
              {plan.name === 'Standard' && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#e50914] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-xs text-gray-400">/ month</span>
                  </div>
                </div>

                <div className="border-t border-white/5 my-4"></div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Resolution</span>
                    <span className="text-white font-semibold">{plan.resolution}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Simultaneous Screens</span>
                    <span className="text-white font-semibold">{plan.screens}</span>
                  </div>
                </div>

                <div className="border-t border-white/5 my-4"></div>

                <ul className="space-y-3.5">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-xs text-gray-300">
                      <Heart size={12} className="text-[#e50914] shrink-0" fill="currentColor" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={handleGetStarted}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 mt-8 cursor-pointer ${
                  plan.name === 'Standard' 
                    ? 'bg-[#e50914] hover:bg-[#ff1e27] text-white shadow-lg' 
                    : 'bg-white/5 hover:bg-white/10 text-white'
                }`}
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-white/5 text-center text-xs text-gray-500 space-y-4">
        <p className="font-semibold text-gray-400">Questions? Contact support at support@flixhub.com</p>
        <div className="flex justify-center gap-6 text-gray-400">
          <a href="#" className="hover:underline">Terms of Use</a>
          <a href="#" className="hover:underline">Privacy Statement</a>
          <a href="#" className="hover:underline">Cookie Preferences</a>
          <a href="#" className="hover:underline">Corporate Information</a>
        </div>
        <p className="pt-4 border-t border-white/5 mt-4">© {new Date().getFullYear()} FLIXHub OTT Platform. Built with passion for interview demo purposes.</p>
      </footer>
    </div>
  );
};

export default Home;
