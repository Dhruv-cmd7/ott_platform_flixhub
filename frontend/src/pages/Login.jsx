import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, CheckCircle2, ShieldAlert, Mail, Lock, LogIn, User as UserIcon } from 'lucide-react';

const Login = () => {
  const { login, register, googleLogin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode toggling
  const [isSignUp, setIsSignUp] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status/feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isGoogleConfigured = clientId && clientId !== 'YOUR_GOOGLE_CLIENT_ID_HERE';

  // Check if redirected due to session expiration
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setError('Your session has expired. Please login again.');
    }
  }, [location]);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  // Clear states when toggling between sign-in and sign-up
  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Input verification
    if (isSignUp) {
      if (!name || !email || !password || !confirmPassword) {
        setError('Please fill in all fields.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    } else {
      if (!email || !password) {
        setError('Please enter your email and password.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isSignUp) {
        // Register Customer account in DB
        const result = await register(name, email, password);
        if (result.success) {
          setSuccess('Account created successfully! Logging you in...');
          setTimeout(() => {
            navigate('/watch', { replace: true });
          }, 1500);
        } else {
          setError(result.message || 'Registration failed.');
          setIsSubmitting(false);
        }
      } else {
        // Sign In (Admin / User)
        const result = await login(email, password);
        if (result.success) {
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => {
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
          }, 1000);
        } else {
          setError(result.message || 'Invalid credentials.');
          setIsSubmitting(false);
        }
      }
    } catch (err) {
      setError('An error occurred during authentication.');
      setIsSubmitting(false);
    }
  };

  const handleGoogleResponse = async (googleResponse) => {
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const idToken = googleResponse.credential;
      if (!idToken) {
        setError('Failed to retrieve authentication token from Google.');
        setIsSubmitting(false);
        return;
      }

      const result = await googleLogin(idToken);

      if (result.success) {
        setSuccess('Authentication successful! Access granted.');
        setTimeout(() => {
          const from = location.state?.from?.pathname || '/';
          navigate(from, { replace: true });
        }, 1000);
      } else {
        setError(result.message || 'Access Denied: Not an authorized email address.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Google Auth error:', err);
      setError('An error occurred during Google Sign-In.');
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isGoogleConfigured || isSignUp) return;

    const initGoogleBtn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("googleBtn"),
          { 
            theme: "filled_black", 
            size: "large", 
            width: "320",
            text: "signin_with",
            shape: "pill"
          }
        );
      } else {
        setTimeout(initGoogleBtn, 300);
      }
    };

    initGoogleBtn();
  }, [clientId, isGoogleConfigured, isSignUp]);

  return (
    <div className="min-h-screen w-full bg-[#0a0a0d] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#e50914]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Login / Registration Card */}
      <div className="w-full max-w-md bg-[#121218]/90 border border-white/5 p-8 md:p-10 rounded-2xl shadow-2xl relative z-10 text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Branding */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center gap-2 mb-1">
            <span className="text-3xl font-extrabold text-[#e50914] tracking-wider uppercase">
              FLIX<span className="text-white font-medium">Hub</span>
            </span>
            <span className="text-[10px] font-bold bg-[#e50914]/20 text-[#e50914] px-1.5 py-0.5 rounded uppercase">
              Portal
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            {isSignUp ? 'Create your brand new customer account' : 'Sign in to access your dashboard'}
          </p>
        </div>

        {/* Tab Switcher Headers */}
        <div className="flex bg-[#161620] p-1.5 rounded-lg mb-6 border border-white/5">
          <button
            onClick={() => isSignUp && toggleMode()}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              !isSignUp ? 'bg-[#e50914] text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => !isSignUp && toggleMode()}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              isSignUp ? 'bg-[#e50914] text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-left animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-sm text-left animate-in fade-in slide-in-from-top-1 duration-200">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          {/* Name Field (Sign Up Only) */}
          {isSignUp && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-150">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <UserIcon size={18} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-[#161620] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Mail size={18} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#161620] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] transition-colors"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Lock size={18} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#161620] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] transition-colors"
                required
              />
            </div>
          </div>

          {/* Confirm Password (Sign Up Only) */}
          {isSignUp && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-150">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#161620] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#e50914] hover:bg-[#b80710] active:bg-[#99060d] text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn size={18} />
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              </>
            )}
          </button>
        </form>

        {/* Divider & Google Login (Sign In Only) */}
        {!isSignUp && isGoogleConfigured && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#121218] px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              {isSubmitting ? (
                <p className="text-xs text-gray-500">Redirecting to Google...</p>
              ) : (
                <div id="googleBtn" className="min-h-[44px] flex items-center justify-center"></div>
              )}
            </div>
          </>
        )}

        {/* Toggle suggestion */}
        <p className="text-xs text-gray-500 mt-6">
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <button onClick={toggleMode} className="text-[#e50914] hover:underline font-semibold cursor-pointer bg-transparent border-none p-0 outline-none">
                Sign In
              </button>
            </>
          ) : (
            <>
              New to the platform?{' '}
              <button onClick={toggleMode} className="text-[#e50914] hover:underline font-semibold cursor-pointer bg-transparent border-none p-0 outline-none">
                Create Account
              </button>
            </>
          )}
        </p>

      </div>
    </div>
  );
};

export default Login;
