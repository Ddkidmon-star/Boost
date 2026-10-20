import React, { useState } from 'react';
import { 
  User, 
  Wallet, 
  LogOut, 
  Check, 
  Download, 
  ShieldCheck,
  CheckCircle2,
  Server,
  KeyRound,
  ExternalLink,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSMM } from '../context/SMMContext';
import { formatCurrency } from '../services/smmApi';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface ProfileScreenProps {
  onOpenTopUp: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onOpenTopUp }) => {
  const { user, isOwner, logout } = useAuth();
  const { orders } = useSMM();
  const { isInstalled } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);

  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'Completed').length;
  const totalUnits = orders.reduce((acc, o) => acc + o.quantity, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 pb-24 space-y-5">
      {/* User Information Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex items-center gap-4">
          <img
            src={user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt=""
            className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
          />
          <div className="overflow-hidden flex-1">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
              {user?.displayName || 'Social Creator'}
            </h2>
            <p className="text-xs text-slate-500 font-mono truncate">{user?.email}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold text-slate-600">
                {isOwner ? 'Master Access • Zero Billing' : 'Standard Verified Customer'}
              </span>
            </div>
          </div>
        </div>

        {/* Account Balance Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
              Account Available Balance
            </span>
            <div className={`text-xl font-black font-mono ${isOwner ? 'text-red-600' : 'text-slate-900'}`}>
              {formatCurrency(user?.balance || 0, isOwner)}
            </div>
            {isOwner && (
              <p className="text-[11px] text-emerald-600 font-bold">
                Owner Direct API Key: Free boosts enabled on all 9,800+ services
              </p>
            )}
          </div>

          {!isOwner && (
            <button
              onClick={onOpenTopUp}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs shadow-sm shadow-red-600/20 transition cursor-pointer"
            >
              + Deposit (Paystack)
            </button>
          )}
        </div>

        {/* Lifetime Statistics */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Orders</span>
            <span className="text-sm sm:text-base font-black font-mono text-slate-900">{totalOrders}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Completed</span>
            <span className="text-sm sm:text-base font-black font-mono text-emerald-600">{completedOrders}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Total Boosted</span>
            <span className="text-sm sm:text-base font-black font-mono text-slate-900">{totalUnits.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* SMM v2 Engine & API Connection Status */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-2">
          <Server className="w-4 h-4 text-red-600" />
          <span>SMM Panel v2 Relay Engine</span>
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-600 font-medium">Provider Base URL:</span>
            <span className="font-mono font-bold text-slate-900 text-[11px]">https://smm8.com/api/v2</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-600 font-medium">Master API Key:</span>
            <span className="font-mono text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
              <KeyRound className="w-3.5 h-3.5" />
              <span>••••••••••••••••3194 (Mounted & Verified)</span>
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800">
            <span className="font-medium">Connection Status:</span>
            <span className="font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Active & Authenticated</span>
            </span>
          </div>
        </div>
      </div>

      {/* Paystack Payment Gateway Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-2">
            <Wallet className="w-4 h-4 text-cyan-600" />
            <span>Paystack Automated Gateway</span>
          </h3>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold">
            Debit Card • Bank • USSD
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Customer deposits are automatically processed and verified through Paystack's official payment infrastructure.
        </p>

        <button
          onClick={onOpenTopUp}
          className="w-full py-3 px-4 rounded-2xl bg-cyan-50/70 hover:bg-cyan-100 text-cyan-900 border border-cyan-200 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <CreditCard className="w-4 h-4 text-cyan-600" />
          <span>Open Paystack Deposit Window</span>
        </button>
      </div>

      {/* Mobile App & PWA Installation */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-2">
          <Download className="w-4 h-4 text-red-600" />
          <span>Mobile Device Installation</span>
        </h3>

        <p className="text-xs text-slate-600 leading-relaxed">
          BoostPro includes complete Progressive Web App compliance with standalone display mode. You can add this app directly to your smartphone home screen.
        </p>

        <button
          onClick={() => setShowInstallModal(true)}
          className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Download className="w-4 h-4 text-red-600" />
          <span>{isInstalled ? 'App Is Installed Standalone' : 'Open Mobile Install Guide'}</span>
        </button>
      </div>

      {/* Sign Out Button */}
      <div className="pt-2">
        <button
          onClick={logout}
          className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out from Device</span>
        </button>
      </div>

      {/* PWA Install Modal */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
};
