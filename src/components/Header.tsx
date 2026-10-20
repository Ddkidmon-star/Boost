import React, { useState } from 'react';
import { Zap, Wallet, ShieldCheck, ChevronDown, LogOut, User, RefreshCw, Smartphone, Monitor } from 'lucide-react';
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
  const { user, isOwner, logout, loginAsOwnerDemo, loginAsCustomerDemo } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#0c0e17]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 select-none">
      <div className="flex items-center justify-between gap-2 max-w-5xl mx-auto">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-pink-500 p-[1.5px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#0c0e17] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm md:text-base tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                BOOST<span className="text-cyan-400">PRO</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v2
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-none hidden sm:block">SMM Panel Engine</p>
          </div>
        </div>

        {/* Right side: Device toggle, Balance Pill, User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Frame switch toggle (visible on desktop) */}
          <button
            onClick={onToggleFrame}
            title={isMobileFrame ? "Switch to Fullscreen" : "Switch to Mobile Phone Frame"}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 border border-slate-800 transition"
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                <span>Full</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                <span>Phone</span>
              </>
            )}
          </button>

          {/* Account Balance Display */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 sm:px-3 py-1.5 shadow-inner">
            <div className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 leading-tight">
                  Balance
                </span>
                <span className={`text-xs sm:text-sm font-bold font-mono ${isOwner ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'text-emerald-400'}`}>
                  {formatCurrency(user?.balance || 0, isOwner)}
                </span>
              </div>
            </div>

            {/* Top up button - Only shown for non-owner customers */}
            {!isOwner && (
              <button
                onClick={onOpenTopUp}
                className="ml-2 px-2 py-0.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 transition cursor-pointer"
              >
                + Add
              </button>
            )}
          </div>

          {/* User Menu Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
            >
              <img
                src={user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user?.displayName || 'User'}
                className="w-7 h-7 rounded-lg object-cover border border-slate-700"
              />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-[#111422] border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3.5 py-2.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <img
                      src={user?.photoURL}
                      alt=""
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div className="overflow-hidden">
                      <p className="font-semibold text-white truncate">{user?.displayName || 'Active Account'}</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{user?.email}</p>
                    </div>
                  </div>
                  {/* Note: In compliance with owner specification, DO NOT show 'Owner' badge on UI */}
                </div>

                {/* Fast Role / Account Switcher for Instant Testing */}
                <div className="p-2 border-b border-slate-800/60 bg-slate-950/40">
                  <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 px-2 mb-1.5 flex items-center justify-between">
                    <span>Account Switcher</span>
                    <RefreshCw className="w-2.5 h-2.5 text-slate-500" />
                  </p>
                  
                  <button
                    onClick={() => {
                      loginAsOwnerDemo();
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                      isOwner ? 'bg-cyan-500/15 text-cyan-300 font-medium border border-cyan-500/30' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="truncate">
                      <div className="text-xs">Preciousddkid@gmail.com</div>
                      <div className="text-[10px] text-slate-400">$0.00 / Free boost rate</div>
                    </div>
                    {isOwner && <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 ml-1" />}
                  </button>

                  <button
                    onClick={() => {
                      loginAsCustomerDemo();
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between mt-1 transition ${
                      !isOwner ? 'bg-indigo-500/15 text-indigo-300 font-medium border border-indigo-500/30' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="truncate">
                      <div className="text-xs">alex.creator@gmail.com</div>
                      <div className="text-[10px] text-slate-400">Regular Customer ($25.00)</div>
                    </div>
                    {!isOwner && <User className="w-4 h-4 text-indigo-400 shrink-0 ml-1" />}
                  </button>
                </div>

                <div className="p-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenAuth();
                    }}
                    className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Firebase Sign-In / Switch</span>
                  </button>

                  <button
                    onClick={async () => {
                      setShowUserMenu(false);
                      await logout();
                    }}
                    className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Click outside backdrop for user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};
