import React, { useState } from 'react';
import { Rocket, ArrowRight, ShieldCheck, Zap, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthScreen: React.FC = () => {
  const { loginWithGoogle, loginAsRegular, isLoading } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      setErrorMsg(err?.message || 'Authentication was interrupted. Please select your Google account.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between p-6 sm:p-8 select-none">
      {/* Top Bar Branding */}
      <div className="flex items-center justify-between max-w-sm mx-auto w-full pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 p-[2px] shadow-sm shadow-red-500/20">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Rocket className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              BOOST<span className="text-red-600 font-black">PRO</span>
            </span>
            <span className="ml-1.5 text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold">
              v2.0
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 shadow-xs">
          <Lock className="w-3 h-3 text-red-600" />
          <span>Encrypted Gateway</span>
        </div>
      </div>

      {/* Center Hero Section */}
      <div className="max-w-sm mx-auto w-full text-center space-y-6 my-auto py-8">
        <div className="w-20 h-20 rounded-3xl bg-slate-50 border-2 border-red-100 p-4 mx-auto shadow-md shadow-red-500/10 flex items-center justify-center">
          <Rocket className="w-10 h-10 text-red-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Enterprise Social Growth <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-red-700 font-black">
              Automation Engine
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
            Direct API connection to SMM Panel v2 for TikTok, Instagram, YouTube, and Telegram boosting.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 gap-2.5 text-left pt-2">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-600">
              <Zap className="w-3.5 h-3.5" />
              <span>SMM v2 Engine</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">9,800+ live verified boosting tiers</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Direct Relay</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">Authentic real-time order dispatching</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 text-left flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Official Google Sign-In Button */}
        <div className="pt-4 space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-4 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-sm flex items-center justify-center gap-3 transition shadow-md border-2 border-slate-200 hover:border-red-500/30 cursor-pointer active:scale-98 disabled:opacity-50"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            <span>{isLoading ? 'Verifying Credentials...' : 'Sign in with Google to Enter'}</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Customer Preview button */}
          <div className="pt-2 flex items-center justify-center">
            <button
              onClick={loginAsRegular}
              className="text-[11px] text-slate-500 hover:text-slate-800 font-medium px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              Preview as Guest Customer
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Footer info */}
      <div className="text-center pb-2">
        <p className="text-[11px] text-slate-400">
          Firebase Authentication & SMM Panel v2 Automated Relay
        </p>
      </div>
    </div>
  );
};
