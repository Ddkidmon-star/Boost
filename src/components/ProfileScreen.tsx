import React, { useState } from 'react';
import { 
  User, 
  Wallet, 
  Key, 
  LogOut, 
  Check, 
  Smartphone, 
  Terminal, 
  Copy, 
  LogIn
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
  const { user, isOwner, logout, loginWithGoogle } = useAuth();
  const { orders, config } = useSMM();

  const [copiedCode, setCopiedCode] = useState(false);
  const [showDeveloperDocs, setShowDeveloperDocs] = useState(false);

  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'Completed').length;
  const totalUnits = orders.reduce((acc, o) => acc + o.quantity, 0);

  const reactNativeSnippet = `// React Native / Expo SMM v2 Engine Implementation
import { auth } from './firebaseConfig';

const SMM_ENDPOINT = "${config.endpoint || 'https://smm8.com/api/v2'}";
const MASTER_KEY = "YOUR_MASTER_API_KEY";

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
      {/* Profile Card in Pink */}
      <div className="bg-[#15091c] border border-pink-500/20 rounded-3xl p-5 shadow-xl shadow-pink-950/20 relative overflow-hidden">
        {user ? (
          <div className="flex items-center gap-3.5">
            <img
              src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt=""
              className="w-14 h-14 rounded-2xl object-cover border-2 border-pink-500/40 shadow-lg shadow-pink-500/20"
            />
            <div className="overflow-hidden flex-1">
              <h2 className="text-base font-bold text-white truncate">
                {user.displayName || 'Social Creator'}
              </h2>
              <p className="text-xs text-pink-300/70 font-mono truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-mono text-pink-300 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                  Firebase Connected
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-2 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center mx-auto text-pink-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Not Signed In</h3>
              <p className="text-xs text-pink-300/60">Sign in with your Google account to access your wallet</p>
            </div>
            <button
              onClick={loginWithGoogle}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-lg shadow-pink-500/30 inline-flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign in with Google</span>
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-pink-900/30 text-center">
          <div className="bg-[#1b0a24] p-2.5 rounded-2xl border border-pink-900/40">
            <span className="text-[10px] text-pink-300/70 uppercase font-mono block">Boosts</span>
            <span className="text-sm font-extrabold font-mono text-white">{totalOrders}</span>
          </div>
          <div className="bg-[#1b0a24] p-2.5 rounded-2xl border border-pink-900/40">
            <span className="text-[10px] text-pink-300/70 uppercase font-mono block">Done</span>
            <span className="text-sm font-extrabold font-mono text-emerald-400">{completedOrders}</span>
          </div>
          <div className="bg-[#1b0a24] p-2.5 rounded-2xl border border-pink-900/40">
            <span className="text-[10px] text-pink-300/70 uppercase font-mono block">Units</span>
            <span className="text-sm font-extrabold font-mono text-pink-400">{totalUnits.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Wallet Balance Card */}
      <div className="bg-[#15091c] border border-pink-500/20 rounded-3xl p-5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold text-pink-300/70 block">Wallet Balance</span>
              <span className={`text-xl font-black font-mono ${isOwner ? 'text-pink-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'text-white'}`}>
                {formatCurrency(user?.balance || 0, isOwner)}
              </span>
            </div>
          </div>

          {/* Top-up button: Hidden/disabled for owner as required by prompt specs */}
          {!isOwner ? (
            <button
              onClick={onOpenTopUp}
              disabled={!user}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-pink-500/30 disabled:opacity-50"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Add Funds</span>
            </button>
          ) : (
            <div className="text-right">
              <span className="text-[10px] text-pink-300 font-mono bg-pink-500/15 px-3 py-1.5 rounded-xl border border-pink-500/30 font-bold">
                Unlimited Free Boosts
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Settings & Configuration Section */}
      <div className="bg-[#15091c] border border-pink-500/20 rounded-3xl p-2 space-y-1 shadow-lg text-xs">
        <button
          onClick={onOpenApiSettings}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-pink-900/30 transition text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">SMM v2 Engine Settings</p>
              <p className="text-[11px] text-pink-300/60 font-mono truncate max-w-[220px]">
                {config.endpoint}
              </p>
            </div>
          </div>
          <span className="text-pink-400 font-bold">Configure</span>
        </button>

        <button
          onClick={() => setShowDeveloperDocs(!showDeveloperDocs)}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-pink-900/30 transition text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">React Native / Expo Engine Code</p>
              <p className="text-[11px] text-pink-300/60">Export native code snippets</p>
            </div>
          </div>
          <span className="text-fuchsia-400 font-bold">{showDeveloperDocs ? 'Hide' : 'View'}</span>
        </button>
      </div>

      {/* Developer Expo Code */}
      {showDeveloperDocs && (
        <div className="bg-[#110517] border border-pink-500/30 rounded-3xl p-4 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-pink-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                React Native / Expo v2 Handler
              </h3>
            </div>
            <button
              onClick={handleCopyCode}
              className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1 font-mono cursor-pointer font-bold"
            >
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          <div className="bg-[#0c0310] p-3 rounded-2xl border border-pink-900/40 text-[11px] font-mono text-pink-300 overflow-x-auto max-h-56">
            <pre>{reactNativeSnippet}</pre>
          </div>
        </div>
      )}

      {/* Logout button if logged in */}
      {user && (
        <button
          onClick={logout}
          className="w-full py-3.5 rounded-2xl bg-[#17091f] hover:bg-rose-500/20 border border-pink-900/40 hover:border-rose-500/40 text-pink-300/80 hover:text-rose-300 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Google Account</span>
        </button>
      )}
    </div>
  );
};
