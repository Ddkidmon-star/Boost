import React, { useState } from 'react';
import { X, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, isLoading } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google Sign-In was cancelled or failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#16081e] border-2 border-pink-500/40 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center">
              <LogIn className="w-4 h-4 text-pink-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Google Authentication</h3>
              <p className="text-[10px] text-pink-300/70">Firebase Auth Provider</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-pink-400 hover:text-white hover:bg-pink-900/30 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center py-2 space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 p-[2px] mx-auto shadow-lg shadow-pink-500/30">
            <div className="w-full h-full bg-[#16081e] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-pink-400" />
            </div>
          </div>
          <h4 className="text-base font-extrabold text-white pt-2">Sign in to SMM Boost</h4>
          <p className="text-xs text-pink-200/70 leading-relaxed px-2">
            Authenticate securely with your Google account to access live boosting services and real-time order tracking.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Real Firebase Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2.5 transition shadow-lg shadow-pink-950/40 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
          <span>{isLoading ? 'Opening Google Account...' : 'Continue with Google'}</span>
        </button>

        <p className="text-[10px] text-pink-300/50 text-center font-mono">
          Background validation silently recognizes owner privileges.
        </p>
      </div>
    </div>
  );
};
