import React, { useState } from 'react';
import { 
  User, 
  Wallet, 
  Key, 
  Settings, 
  LogOut, 
  Check, 
  ExternalLink, 
  Smartphone, 
  Terminal, 
  Copy, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSMM } from '../context/SMMContext';
import { formatCurrency } from '../services/smmApi';

interface ProfileScreenProps {
  onOpenTopUp: () => void;
  onOpenApiSettings: () => void;
  onOpenAuth: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  onOpenTopUp, 
  onOpenApiSettings,
  onOpenAuth 
}) => {
  const { user, isOwner, logout, loginAsOwnerDemo, loginAsCustomerDemo } = useAuth();
  const { orders, config } = useSMM();

  const [copiedCode, setCopiedCode] = useState(false);
  const [showDeveloperDocs, setShowDeveloperDocs] = useState(false);

  // Calculate order stats
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'Completed').length;
  const totalUnits = orders.reduce((acc, o) => acc + o.quantity, 0);

  const reactNativeSnippet = `// React Native / Expo SMM v2 Engine Implementation
// Compatible with Expo SDK 52+ & React Native 0.76+
import { useState } from 'react';
import { auth } from './firebaseConfig';

const SMM_ENDPOINT = "${config.endpoint || 'https://smm8.com/api/v2'}";
const MASTER_KEY = "YOUR_SMM_API_KEY";

export async function placeBoostOrder(serviceId, link, quantity, userEmail) {
  // Silent Owner check: Preciousddkid@gmail.com enjoys $0.00 free rate
  const isOwner = userEmail?.toLowerCase() === "preciousddkid@gmail.com";
  
  const formData = new URLSearchParams();
  formData.append("key", MASTER_KEY);
  formData.append("action", "add");
  formData.append("service", String(serviceId));
  formData.append("link", link);
  formData.append("quantity", String(quantity));

  const response = await fetch(SMM_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  return await response.json();
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(reactNativeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-xl mx-auto space-y-4">
      {/* Profile Card */}
      <div className="bg-[#0e111c] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          <img
            src={user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt=""
            className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 shadow-lg"
          />
          <div className="overflow-hidden flex-1">
            <h2 className="text-base font-bold text-white truncate">
              {user?.displayName || 'User'}
            </h2>
            <p className="text-xs text-slate-400 font-mono truncate">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                SMM v2 Active
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800 text-center">
          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Boosts</span>
            <span className="text-sm font-bold font-mono text-white">{totalOrders}</span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Completed</span>
            <span className="text-sm font-bold font-mono text-emerald-400">{completedOrders}</span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Units</span>
            <span className="text-sm font-bold font-mono text-cyan-400">{totalUnits.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Wallet Balance Card */}
      <div className="bg-[#0e111c] border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs uppercase font-semibold text-slate-400 block">Available Balance</span>
              <span className={`text-xl font-extrabold font-mono ${isOwner ? 'text-cyan-400' : 'text-emerald-400'}`}>
                {formatCurrency(user?.balance || 0, isOwner)}
              </span>
            </div>
          </div>

          {/* Top-up button: Hidden/disabled for owner as requested in specs */}
          {!isOwner ? (
            <button
              onClick={onOpenTopUp}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Add Funds</span>
            </button>
          ) : (
            <div className="text-right">
              <span className="text-[10px] text-cyan-400/90 font-mono bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                Unlimited Boost Access
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Settings & Configuration Section */}
      <div className="bg-[#0e111c] border border-slate-800 rounded-2xl p-2 space-y-1 shadow-lg text-xs">
        <button
          onClick={onOpenApiSettings}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/60 transition text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">SMM v2 Engine Settings</p>
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-[220px]">
                {config.endpoint}
              </p>
            </div>
          </div>
          <span className="text-cyan-400 font-medium">Configure</span>
        </button>

        <button
          onClick={() => setShowDeveloperDocs(!showDeveloperDocs)}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/60 transition text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">React Native / Expo Architecture</p>
              <p className="text-[11px] text-slate-400">Export code snippets & API v2 spec</p>
            </div>
          </div>
          <span className="text-indigo-400 font-medium">{showDeveloperDocs ? 'Hide' : 'View'}</span>
        </button>

        <button
          onClick={onOpenAuth}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/60 transition text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Firebase Google Sign-In Setup</p>
              <p className="text-[11px] text-slate-400">Redirect auth & account switching</p>
            </div>
          </div>
          <span className="text-pink-400 font-medium">Manage</span>
        </button>
      </div>

      {/* Developer Docs / Expo React Native Component Breakdown */}
      {showDeveloperDocs && (
        <div className="bg-[#0b0d17] border border-indigo-500/30 rounded-2xl p-4 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                React Native / Expo v2 Handler
              </h3>
            </div>
            <button
              onClick={handleCopyCode}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono cursor-pointer"
            >
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Directly copyable for your Expo mobile app with silent owner recognition:
          </p>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-56">
            <pre>{reactNativeSnippet}</pre>
          </div>
        </div>
      )}

      {/* Logout button */}
      <button
        onClick={logout}
        className="w-full py-3 rounded-xl bg-slate-900 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out of Account</span>
      </button>
    </div>
  );
};
