import React, { useState } from 'react';
import { X, ShieldCheck, User, LogIn, ArrowRight, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { OWNER_EMAIL } from '../services/firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, loginAsOwnerDemo, loginAsCustomerDemo, user } = useAuth();
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch {
      // Handled in auth context
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    loginAsCustomerDemo(customEmail.trim(), customName.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#101322] border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <LogIn className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Firebase Authentication</h3>
              <p className="text-[10px] text-slate-400">Google Sign-In & Redirect</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real Firebase Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isSigningIn}
          className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 transition shadow-lg cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{isSigningIn ? 'Redirecting to Google...' : 'Sign in with Google'}</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-[#101322] px-2 text-[10px] text-slate-500 uppercase font-mono tracking-wider absolute">
            Or Test Accounts
          </span>
        </div>

        {/* Instant Account Switcher for Prompt Evaluation */}
        <div className="space-y-2">
          {/* Owner account option */}
          <button
            onClick={() => {
              loginAsOwnerDemo();
              onClose();
            }}
            className="w-full p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-left transition cursor-pointer flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-cyan-300">
                Sign In as Preciousddkid@gmail.com
              </div>
              <div className="text-[10px] text-slate-400">
                Silent Owner classification • $0.00 / Free orders
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0" />
          </button>

          {/* Regular customer option */}
          <button
            onClick={() => {
              loginAsCustomerDemo();
              onClose();
            }}
            className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition cursor-pointer flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-semibold text-slate-200">
                Sign In as alex.creator@gmail.com
              </div>
              <div className="text-[10px] text-slate-400">
                Regular customer • Standard rates & wallet top-up required
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
        </div>

        {/* Custom Email Form */}
        <form onSubmit={handleCustomLogin} className="space-y-2 pt-2 border-t border-slate-800/80">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Custom Email Sign In
          </label>
          <input
            type="email"
            value={customEmail}
            onChange={(e) => setCustomEmail(e.target.value)}
            placeholder="Enter any email address..."
            className="w-full bg-[#0d101a] border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!customEmail.trim()}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition disabled:opacity-40 cursor-pointer"
          >
            Sign In with Email
          </button>
        </form>
      </div>
    </div>
  );
};
