import React from 'react';
import { Sparkles, Wallet, LogOut, LogIn, Smartphone, Monitor } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../services/smmApi';

interface HeaderProps {
  onOpenTopUp: () => void;
  onOpenAuth: () => void;
  isMobileFrame: boolean;
  onToggleFrame: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenTopUp, 
  onOpenAuth, 
  isMobileFrame, 
  onToggleFrame 
}) => {
  const { user, isOwner, logout, loginWithGoogle, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-[#0e0612]/95 backdrop-blur-xl border-b border-pink-900/30 px-4 py-3 select-none shadow-lg shadow-pink-950/20">
      <div className="flex items-center justify-between gap-2 max-w-5xl mx-auto">
        {/* Brand / Logo in Hot Pink */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-fuchsia-600 p-[2px] shadow-lg shadow-pink-500/30">
            <div className="w-full h-full bg-[#14081a] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-pink-400 fill-pink-400/30 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base tracking-wider text-white">
                BOOST<span className="text-pink-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]">PINK</span>
              </span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-pink-300/60 leading-none">Real SMM v2 Engine</p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Frame switch toggle (visible on desktop) */}
          <button
            onClick={onToggleFrame}
            title={isMobileFrame ? "Switch to Fullscreen" : "Switch to Mobile Phone Frame"}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-pink-300/80 hover:text-white bg-pink-950/40 hover:bg-pink-900/40 border border-pink-800/40 transition"
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-pink-400" />
                <span>Full</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-pink-400" />
                <span>Phone</span>
              </>
            )}
          </button>

          {/* User Logged In: Balance & Avatar */}
          {user ? (
            <>
              {/* Account Balance Display */}
              <div className="flex items-center bg-[#17091f] border border-pink-500/30 rounded-2xl px-3 py-1.5 shadow-[0_0_15px_rgba(236,72,153,0.15)]">
                <div className="flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-pink-400" />
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] uppercase font-mono tracking-wider text-pink-300/60 leading-tight">
                      Balance
                    </span>
                    <span className={`text-xs sm:text-sm font-extrabold font-mono ${
                      isOwner 
                        ? 'text-pink-300 drop-shadow-[0_0_10px_rgba(244,114,182,0.6)]' 
                        : 'text-pink-100'
                    }`}>
                      {formatCurrency(user.balance || 0, isOwner)}
                    </span>
                  </div>
                </div>

                {/* Top up button: Hidden for owner */}
                {!isOwner && (
                  <button
                    onClick={onOpenTopUp}
                    className="ml-2 px-2.5 py-1 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white text-[11px] font-bold shadow-sm shadow-pink-500/30 transition cursor-pointer"
                  >
                    + Add
                  </button>
                )}
              </div>

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-1.5">
                <img
                  src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-xl object-cover border-2 border-pink-500/40 shadow-md shadow-pink-500/20"
                />
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1.5 rounded-xl bg-pink-950/40 hover:bg-rose-500/20 border border-pink-800/40 text-pink-400 hover:text-rose-300 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            /* Not logged in: Direct Google Sign-In button */
            <button
              onClick={loginWithGoogle}
              disabled={isLoading}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 hover:from-pink-400 hover:to-fuchsia-500 text-white font-bold text-xs shadow-lg shadow-pink-500/30 flex items-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Connecting...' : 'Google Login'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
