import React, { useState } from 'react';
import { Rocket, Wallet, Smartphone, Monitor, Download, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../services/smmApi';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface HeaderProps {
  onOpenTopUp: () => void;
  isMobileFrame?: boolean;
  onToggleFrame?: () => void;
  provider?: 'smm8' | 'theowlet';
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenTopUp, 
  isMobileFrame = false, 
  onToggleFrame,
  provider = 'smm8'
}) => {
  const { user, isOwner } = useAuth();
  const { isInstalled } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const isOwlet = provider === 'theowlet';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 py-2.5 select-none shadow-xs">
        <div className="flex items-center justify-between gap-3 max-w-5xl mx-auto">
          {/* Executive Brand / Logo */}
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-2xl p-[2px] shadow-sm ${
              isOwlet 
                ? 'bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-700 shadow-indigo-500/20' 
                : 'bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 shadow-red-500/20'
            }`}>
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                {isOwlet ? (
                  <span className="text-base">🦉</span>
                ) : (
                  <Rocket className="w-4 h-4 text-red-600" />
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
                  BOOST<span className={isOwlet ? "text-indigo-600 font-black" : "text-red-600 font-black"}>PRO</span>
                </span>
                {isOwlet ? (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    (The Owlet)
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold">
                    v2.0
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 leading-none mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isOwlet ? 'Connected to theowlet.com' : 'API Connected • smm8.com'}</span>
              </div>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Add to Home Screen / Install PWA Button */}
            {!isInstalled && (
              <button
                onClick={() => setShowInstallModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition cursor-pointer shadow-xs"
                title="Install app to your home screen"
              >
                <Download className="w-3.5 h-3.5 text-red-600" />
                <span>Install Mobile App</span>
              </button>
            )}

            {/* Desktop Mobile Mockup Toggle */}
            <button
              onClick={onToggleFrame}
              title={isMobileFrame ? "Switch to Fullscreen" : "Switch to Mobile Phone View"}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
            >
              {isMobileFrame ? (
                <>
                  <Monitor className="w-3.5 h-3.5 text-slate-500" />
                  <span>Full View</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Phone View</span>
                </>
              )}
            </button>

            {/* Account Balance & Wallet */}
            {user && (
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-red-600" />
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-semibold leading-tight">
                      Balance
                    </span>
                    <span className={`text-xs sm:text-sm font-extrabold font-mono ${
                      isOwner ? 'text-red-600' : 'text-slate-900'
                    }`}>
                      {formatCurrency(user.balance || 0, isOwner)}
                    </span>
                  </div>
                </div>

                {/* Top Up button: hidden for owner since owner gets everything $0.00 / Free */}
                {!isOwner && (
                  <button
                    onClick={onOpenTopUp}
                    className="ml-2.5 px-2.5 py-1 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold shadow-xs transition cursor-pointer active:scale-95 flex items-center gap-1"
                  >
                    <span>+ Deposit</span>
                  </button>
                )}
              </div>
            )}

            {/* User Profile Avatar */}
            {user && (
              <img
                src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user.displayName}
                className="w-8 h-8 rounded-xl object-cover border border-slate-200 shadow-xs"
              />
            )}
          </div>
        </div>
      </header>

      {/* PWA Install Modal */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </>
  );
};
