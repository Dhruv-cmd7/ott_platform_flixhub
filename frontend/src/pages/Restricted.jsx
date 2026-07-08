import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Tv, CreditCard, ShieldAlert, CheckCircle, HelpCircle } from 'lucide-react';

const Restricted = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen w-full bg-[#0a0a0d] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Red/Blue background glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Glass Card */}
      <div className="w-full max-w-xl bg-[#121218]/90 border border-white/5 p-8 md:p-10 rounded-2xl shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl font-extrabold text-[#e50914] tracking-wider uppercase">
              FLIX<span className="text-white font-medium">Hub</span>
            </span>
            <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase">
              Customer
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-2">Access Restricted to Admin</h2>
          <p className="text-gray-400 text-sm mt-1">You are logged in with a standard client account.</p>
        </div>

        {/* Info Box */}
        <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl mb-8 flex gap-3 text-left">
          <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-semibold text-amber-400">Administrative Dashboard Control</h4>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              This area of the platform is strictly reserved for administrators, content managers, and support agents. Your customer profile does not possess the permissions required to view analytics or edit media configurations.
            </p>
          </div>
        </div>

        {/* Customer Account Details Card */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 md:p-6 mb-8 text-left space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
            Customer Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-gray-500 block">Name</span>
              <span className="text-sm font-medium text-gray-200">{user?.name}</span>
            </div>

            <div>
              <span className="text-xs text-gray-500 block">Email Address</span>
              <span className="text-sm font-medium text-gray-200 truncate block">{user?.email}</span>
            </div>

            <div>
              <span className="text-xs text-gray-500 block">Subscription Tier</span>
              <span className="text-sm font-medium text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <CheckCircle size={14} />
                {user?.activeSubscription ? 'Active Subscribed' : 'Free Tier'}
              </span>
            </div>

            <div>
              <span className="text-xs text-gray-500 block">Account Status</span>
              <span className="text-sm font-medium text-blue-400 flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Navigation & Logout Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="https://flixhub.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.1] text-white border border-white/10 font-medium py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Tv size={18} />
            <span>Go to FLIXHub Streaming</span>
          </a>

          <button
            onClick={logout}
            className="flex-1 bg-[#e50914] hover:bg-[#b80710] active:bg-[#99060d] text-white font-medium py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut size={18} />
            <span>Logout Account</span>
          </button>
        </div>

        {/* Support */}
        <div className="mt-8 text-center">
          <a
            href="mailto:support@flixhub.com"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <HelpCircle size={14} />
            <span>Need admin access? Contact system support</span>
          </a>
        </div>

      </div>
    </div>
  );
};

export default Restricted;
