import React, { useState, useEffect } from 'react';
import { Sparkles, Wallet, Download, RefreshCw, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../services/smmApi';
import { owletClient } from '../services/owletApi';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface OwletHeaderProps {
  onOpenTopUp: () => void;
  onOpenKeyModal?: () => void;
}

export const OwletHeader: React.FC<OwletHeaderProps> = ({ 
  onOpenTopUp,
  onOpenKeyModal,
}) => {
  const { user, isOwner } = useAuth();
  const { isInstalled } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [backendStatus, setBackendStatus] = useState<{ hasMasterKey: boolean; endpoint: string }>({
    hasMasterKey: false,
    endpoint: 'https://therealowlet.com/api/v2'
  });

  useEffect(() => {
    owletClient.getBackendStatus().then(setBackendStatus);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-indigo-100 px-4 py-3 select-none shadow-xs">
        <div className="flex items-center justify-between gap-3 max-w-5xl mx-auto">
          {/* Executive Brand / Logo for The Owlet */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-700 p-[2px] shadow-sm shadow-indigo-500/25">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white">
                <span className="text-lg font-black tracking-tighter">🦉</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  BOOST<span className="text-indigo-600 font-black">PRO</span>
                </span>
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  (The Owlet)
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 leading-none mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium">Connected to theowlet.com</span>
              </div>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Install PWA Button */}
            {!isInstalled && (
              <button
                onClick={() => setShowInstallModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer shadow-xs"
                title="Install app to your home screen"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Install App</span>
              </button>
            )}

            {/* Account Balance & Wallet */}
            {user && (
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-indigo-600" />
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-semibold leading-tight">
                      Balance
                    </span>
                    <span className={`text-xs sm:text-sm font-extrabold font-mono ${
                      isOwner ? 'text-indigo-600' : 'text-slate-900'
                    }`}>
                      {formatCurrency(user.balance || 0, isOwner)}
                    </span>
                  </div>
                </div>

                {/* Top Up button: hidden for owner since owner gets everything $0.00 / Free */}
                {!isOwner && (
                  <button
                    onClick={onOpenTopUp}
                    className="ml-2.5 px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-xs transition cursor-pointer active:scale-95 flex items-center gap-1"
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
                className="w-8 h-8 rounded-xl object-cover border border-indigo-200 shadow-xs"
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
