import React, { useState, useEffect, useMemo } from 'react';
import { 
  Rocket, 
  Link as LinkIcon, 
  Clipboard, 
  Check, 
  AlertCircle, 
  Clock, 
  Search,
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2,
  Sparkles,
  Download,
  Flame,
  Zap,
  Info
} from 'lucide-react';
import { useSMM } from '../context/SMMContext';
import { useAuth } from '../context/AuthContext';
import { PLATFORMS } from '../data/mockServices';
import { detectPlatformFromUrl, calculateOrderCost, formatCurrency } from '../services/smmApi';
import { SocialPlatform, SMMService, BoostOrder } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface OrderScreenProps {
  onOpenTopUp: () => void;
}

export const OrderScreen: React.FC<OrderScreenProps> = ({ onOpenTopUp }) => {
  const { 
    services, 
    selectedPlatform, 
    setSelectedPlatform, 
    placeOrder, 
    isSubmittingOrder,
    setActiveTab,
    preselectedServiceId,
    setPreselectedServiceId,
  } = useSMM();
  const { user, isOwner } = useAuth();
  const { isInstalled } = usePWAInstall();

  // State
  const [selectedAction, setSelectedAction] = useState<string>('likes');
  const [selectedServiceId, setSelectedServiceId] = useState<string | number>('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [platformSearch, setPlatformSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [detectedPlatform, setDetectedPlatform] = useState<SocialPlatform | null>(null);
  const [quantity, setQuantity] = useState<number>(1000);
  const [isCopied, setIsCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<BoostOrder | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Filter platforms by category and search
  const visiblePlatforms = useMemo(() => {
    return PLATFORMS.filter((p) => {
      if (activeCategory === 'social') {
        if (!['tiktok', 'instagram', 'youtube', 'facebook', 'twitter', 'threads', 'snapchat'].includes(p.id)) return false;
      } else if (activeCategory === 'messaging') {
        if (!['telegram', 'whatsapp', 'discord'].includes(p.id)) return false;
      } else if (activeCategory === 'music') {
        if (!['spotify', 'audiomack', 'soundcloud', 'applemusic'].includes(p.id)) return false;
      } else if (activeCategory === 'stream') {
        if (!['twitch', 'kick', 'youtube'].includes(p.id)) return false;
      } else if (activeCategory === 'web') {
        if (!['website', 'google', 'linkedin', 'reddit', 'pinterest', 'quora', 'other'].includes(p.id)) return false;
      }

      if (platformSearch.trim()) {
        const q = platformSearch.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [activeCategory, platformSearch]);

  // 1. All services for current platform
  const platformServices = useMemo(() => {
    return services.filter((s) => s.platform === selectedPlatform);
  }, [services, selectedPlatform]);

  // 2. Available actions for this platform
  const availableActions = useMemo(() => {
    const actions: { id: string; label: string; icon: string }[] = [
      { id: 'likes', label: 'Likes & Hearts', icon: '❤️' },
      { id: 'followers', label: 'Followers / Subs', icon: '👥' },
      { id: 'views', label: 'Views & Plays', icon: '👁️' },
      { id: 'comments', label: 'Comments', icon: '💬' },
      { id: 'shares', label: 'Shares & Saves', icon: '🔄' },
      { id: 'other', label: 'All Packages', icon: '⚡' },
    ];

    // Filter out actions that have 0 services in this platform
    return actions.filter((act) => {
      if (act.id === 'other') return true;
      return platformServices.some((s) => {
        if (s.actionType === act.id) return true;
        const text = `${s.category} ${s.name}`.toLowerCase();
        if (act.id === 'likes' && (text.includes('like') || text.includes('reaction'))) return true;
        if (act.id === 'followers' && (text.includes('follower') || text.includes('sub') || text.includes('member'))) return true;
        if (act.id === 'views' && (text.includes('view') || text.includes('stream') || text.includes('play'))) return true;
        if (act.id === 'comments' && text.includes('comment')) return true;
        if (act.id === 'shares' && (text.includes('share') || text.includes('save') || text.includes('retweet'))) return true;
        return false;
      });
    });
  }, [platformServices]);

  // 3. Make sure selectedAction is valid for the platform
  useEffect(() => {
    if (availableActions.length > 0 && !availableActions.some((a) => a.id === selectedAction)) {
      setSelectedAction(availableActions[0].id);
    }
  }, [selectedPlatform, availableActions, selectedAction]);

  // 4. Filter services for the selected action
  const actionServices = useMemo(() => {
    let list = platformServices.filter((s) => {
      if (selectedAction === 'other') return true;
      if (s.actionType === selectedAction) return true;
      const text = `${s.category} ${s.name}`.toLowerCase();
      if (selectedAction === 'likes') return text.includes('like') || text.includes('reaction');
      if (selectedAction === 'followers') return text.includes('follower') || text.includes('sub') || text.includes('member');
      if (selectedAction === 'views') return text.includes('view') || text.includes('stream') || text.includes('play') || text.includes('watch');
      if (selectedAction === 'comments') return text.includes('comment');
      if (selectedAction === 'shares') return text.includes('share') || text.includes('save') || text.includes('retweet');
      return false;
    });

    if (serviceSearch.trim()) {
      const q = serviceSearch.toLowerCase();
      list = list.filter((s) => `${s.name} ${s.category} ${s.service}`.toLowerCase().includes(q));
    }

    return list;
  }, [platformServices, selectedAction, serviceSearch]);

  // 5. Currently active service
  const currentService: SMMService | undefined = useMemo(() => {
    return actionServices.find((s) => String(s.service) === String(selectedServiceId)) || actionServices[0];
  }, [actionServices, selectedServiceId]);

  // Auto-select first service when action or platform changes
  useEffect(() => {
    if (actionServices.length > 0 && !actionServices.some((s) => String(s.service) === String(selectedServiceId))) {
      setSelectedServiceId(actionServices[0].service);
      const minQty = Number(actionServices[0].min) || 100;
      setQuantity((prev) => Math.max(prev, minQty));
    }
  }, [actionServices, selectedServiceId]);

  // Handle preselection from Services Catalog screen
  useEffect(() => {
    if (preselectedServiceId) {
      const match = services.find((s) => String(s.service) === String(preselectedServiceId));
      if (match) {
        setSelectedPlatform(match.platform);
        if (match.actionType) {
          setSelectedAction(match.actionType);
        }
        setSelectedServiceId(match.service);
        setQuantity(Math.max(Number(match.min) || 100, 1000));
      }
      setPreselectedServiceId(null);
    }
  }, [preselectedServiceId, services, setSelectedPlatform, setPreselectedServiceId]);

  // Smart Link Detector
  const handleLinkChange = (value: string) => {
    setLinkInput(value);
    setErrorMessage(null);
    const detected = detectPlatformFromUrl(value);
    if (detected) {
      setDetectedPlatform(detected);
      if (detected !== selectedPlatform) {
        setSelectedPlatform(detected);
      }
    } else {
      setDetectedPlatform(null);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleLinkChange(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch {
      setErrorMessage('Please paste the URL directly into the field.');
    }
  };

  // Quantity helpers
  const minQuantity = currentService ? Number(currentService.min) || 10 : 10;
  const maxQuantity = currentService ? Number(currentService.max) || 100000 : 100000;
  const ratePerThousand = currentService?.rate || '0.00';

  const orderCost = useMemo(() => {
    return calculateOrderCost(ratePerThousand, quantity, isOwner);
  }, [ratePerThousand, quantity, isOwner]);

  const handleAdjustQuantity = (delta: number) => {
    setQuantity((prev) => Math.min(Math.max(prev + delta, minQuantity), maxQuantity));
  };

  // Submit Order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user) {
      setErrorMessage('Please sign in to place orders.');
      return;
    }

    if (!linkInput.trim()) {
      setErrorMessage('Please enter your target profile URL, post link, or username.');
      return;
    }

    if (!currentService) {
      setErrorMessage('Please select a service option.');
      return;
    }

    if (quantity < minQuantity) {
      setErrorMessage(`Minimum order quantity is ${minQuantity.toLocaleString()}.`);
      return;
    }

    if (quantity > maxQuantity) {
      setErrorMessage(`Maximum order quantity is ${maxQuantity.toLocaleString()}.`);
      return;
    }

    if (!isOwner && (user.balance ?? 0) < orderCost) {
      setErrorMessage(`Insufficient wallet balance. Total cost is $${orderCost.toFixed(2)}. Please top up.`);
      return;
    }

    const res = await placeOrder(currentService.service, linkInput.trim(), quantity);
    if (res.success && res.order) {
      setSuccessOrder(res.order);
      setLinkInput('');
    } else {
      setErrorMessage(res.error || 'Failed to submit order. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 pb-24 space-y-6">
      {/* PWA Home Screen Prompt Banner (if not installed) */}
      {!isInstalled && (
        <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-3.5 text-white shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Install BoostPro Mobile App</p>
              <p className="text-[11px] text-white/80 leading-tight">Add to home screen for fullscreen standalone access</p>
            </div>
          </div>
          <button
            onClick={() => setShowInstallModal(true)}
            className="px-3 py-1.5 rounded-xl bg-white text-red-600 font-bold text-xs hover:bg-red-50 transition cursor-pointer shrink-0 shadow-xs"
          >
            Add to Phone
          </button>
        </div>
      )}

      {/* Main Order Configuration Form */}
      <form onSubmit={handleSubmitOrder} className="space-y-6">
        
        {/* STEP 1: SELECT PLATFORM & WEBSITES */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 text-[11px] font-bold flex items-center justify-center">1</span>
              <span>Select Website / Platform ({PLATFORMS.length} Available)</span>
            </label>
            
            {/* Quick search */}
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search websites..."
                value={platformSearch}
                onChange={(e) => setPlatformSearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Websites' },
              { id: 'social', label: 'Social & Video' },
              { id: 'messaging', label: 'Messaging' },
              { id: 'music', label: 'Music & Audio' },
              { id: 'stream', label: 'Livestream' },
              { id: 'web', label: 'Web & Traffic' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer active:scale-95 ${
                  activeCategory === cat.id
                    ? 'bg-red-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid of All Websites */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 pt-1 max-h-56 overflow-y-auto pr-1">
            {visiblePlatforms.map((platform) => {
              const isSelected = selectedPlatform === platform.id;
              const count = services.filter((s) => s.platform === platform.id).length;

              return (
                <button
                  type="button"
                  key={platform.id}
                  onClick={() => {
                    setSelectedPlatform(platform.id);
                    setServiceSearch('');
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-50 border-2 border-red-600 text-red-700 shadow-xs font-bold scale-[1.02]'
                      : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center mb-1 text-sm shadow-2xs"
                    style={{
                      backgroundColor: isSelected ? platform.color : '#e2e8f0',
                      color: isSelected ? '#ffffff' : '#334155',
                    }}
                  >
                    {platform.id === 'tiktok' && '🎵'}
                    {platform.id === 'instagram' && '📸'}
                    {platform.id === 'youtube' && '▶️'}
                    {platform.id === 'telegram' && '✈️'}
                    {platform.id === 'facebook' && '👍'}
                    {platform.id === 'twitter' && '𝕏'}
                    {platform.id === 'spotify' && '🎧'}
                    {platform.id === 'website' && '🌐'}
                    {platform.id === 'whatsapp' && '💬'}
                    {platform.id === 'threads' && '@'}
                    {platform.id === 'linkedin' && '💼'}
                    {platform.id === 'snapchat' && '👻'}
                    {platform.id === 'twitch' && '📺'}
                    {platform.id === 'kick' && '⚡'}
                    {platform.id === 'discord' && '🎮'}
                    {platform.id === 'reddit' && '🔥'}
                    {platform.id === 'audiomack' && '🎶'}
                    {platform.id === 'soundcloud' && '☁️'}
                    {platform.id === 'pinterest' && '📌'}
                    {platform.id === 'google' && '⭐'}
                    {platform.id === 'applemusic' && '🍎'}
                    {platform.id === 'quora' && '❓'}
                    {platform.id === 'other' && '📦'}
                  </div>
                  <span className="text-[10px] font-bold text-center truncate w-full">{platform.name}</span>
                  <span className={`text-[9px] font-mono mt-0.5 ${isSelected ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
                    {count} pkgs
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: SELECT ACTION / SERVICE TYPE (Likes, Followers, Views, etc.) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 text-[11px] font-bold flex items-center justify-center">2</span>
              <span>Select Boost Type</span>
            </label>
            <span className="text-[11px] text-red-600 font-bold capitalize">
              {selectedPlatform} {selectedAction}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {availableActions.map((act) => {
              const isSelected = selectedAction === act.id;
              return (
                <button
                  type="button"
                  key={act.id}
                  onClick={() => {
                    setSelectedAction(act.id);
                    setServiceSearch('');
                  }}
                  className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-sm shadow-red-500/30'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span>{act.icon}</span>
                  <span>{act.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 3: CHOOSE PLENTY OPTIONS FROM API KEY */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 text-[11px] font-bold flex items-center justify-center">3</span>
              <span>Choose Service Tier ({actionServices.length} options)</span>
            </label>
            {isOwner && (
              <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                Owner Free Boost
              </span>
            )}
          </div>

          {/* Quick search filter for options */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search among ${actionServices.length} ${selectedAction} options...`}
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 transition"
            />
          </div>

          {/* List of Options directly from API key */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 no-scrollbar">
            {actionServices.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No matching service tiers found.
              </div>
            ) : (
              actionServices.map((srv) => {
                const isSelected = String(srv.service) === String(selectedServiceId);
                const rateNum = parseFloat(srv.rate);
                return (
                  <div
                    key={srv.service}
                    onClick={() => {
                      setSelectedServiceId(srv.service);
                      const minQ = Number(srv.min) || 10;
                      setQuantity((prev) => Math.max(prev, minQ));
                    }}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-red-50/70 border-red-500 shadow-xs ring-1 ring-red-500/30'
                        : 'bg-slate-50/80 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${
                          isSelected ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 font-bold">
                          #{srv.service}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">
                          {srv.name}
                        </h4>
                      </div>

                      {/* Price Badge */}
                      <div className="shrink-0 text-right">
                        {isOwner ? (
                          <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            $0.00 FREE
                          </span>
                        ) : (
                          <span className="text-xs font-bold font-mono text-slate-900">
                            ${rateNum.toFixed(2)} / 1K
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pl-6">
                      <span>Min: {Number(srv.min).toLocaleString()}</span>
                      <span>•</span>
                      <span>Max: {Number(srv.max).toLocaleString()}</span>
                      {srv.category && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[200px] text-slate-400">{srv.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* STEP 4: TARGET LINK OR USERNAME */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 text-[11px] font-bold flex items-center justify-center">4</span>
              <span>Target Link / Account Handle</span>
            </label>
            {detectedPlatform && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ✓ {detectedPlatform.toUpperCase()} Detected
              </span>
            )}
          </div>

          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <LinkIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={linkInput}
              onChange={(e) => handleLinkChange(e.target.value)}
              placeholder={
                selectedAction === 'followers'
                  ? `e.g. https://www.${selectedPlatform}.com/@username or @handle`
                  : `e.g. https://www.${selectedPlatform}.com/video/123456... or post URL`
              }
              className="w-full pl-10 pr-20 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
            />
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clipboard className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Pasted' : 'Paste'}</span>
            </button>
          </div>
        </div>

        {/* STEP 5: QUANTITY & AMOUNT SELECTOR */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 text-[11px] font-bold flex items-center justify-center">5</span>
              <span>Order Quantity</span>
            </label>
            <span className="text-[11px] text-slate-500 font-mono">
              Limit: {minQuantity.toLocaleString()} – {maxQuantity.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleAdjustQuantity(-500)}
              className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg flex items-center justify-center transition cursor-pointer"
            >
              -
            </button>

            <input
              type="number"
              min={minQuantity}
              max={maxQuantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="flex-1 py-2.5 px-4 text-center bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black font-mono text-slate-900 focus:outline-none focus:border-red-500"
            />

            <button
              type="button"
              onClick={() => handleAdjustQuantity(500)}
              className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg flex items-center justify-center transition cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-2">
            {[500, 1000, 2500, 5000, 10000].map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => setQuantity(Math.min(Math.max(preset, minQuantity), maxQuantity))}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                  quantity === preset
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                +{preset.toLocaleString()}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setQuantity(maxQuantity)}
              className="py-1.5 px-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              Max ({maxQuantity.toLocaleString()})
            </button>
          </div>

          {/* Summary & Pricing Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 mt-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Service Selected:</span>
              <span className="font-bold text-slate-900 truncate max-w-[220px]">
                {currentService?.name || 'None selected'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Rate per 1,000 units:</span>
              <span className="font-mono font-bold text-slate-900">
                {isOwner ? '$0.00 / Free' : `$${parseFloat(ratePerThousand).toFixed(2)}`}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Total Investment</span>
                {isOwner && (
                  <span className="text-[10px] text-emerald-600 font-bold">Owner Master Key Privilege (100% Free)</span>
                )}
              </div>
              <span className={`text-lg font-black font-mono ${isOwner ? 'text-emerald-600' : 'text-red-600'}`}>
                {isOwner ? '$0.00 USD' : `$${orderCost.toFixed(2)} USD`}
              </span>
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            {errorMessage.toLowerCase().includes('insufficient') && !isOwner && (
              <button
                type="button"
                onClick={onOpenTopUp}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shrink-0 cursor-pointer transition shadow-xs"
              >
                Deposit via Paystack
              </button>
            )}
          </div>
        )}

        {/* STEP 6: UPGRADED PRO SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={isSubmittingOrder || !currentService}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-red-600/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmittingOrder ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span>Transmitting Order to SMM v2 Engine...</span>
            </>
          ) : (
            <>
              <Rocket className="w-5 h-5" />
              <span>Confirm & Launch Boost</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* SUCCESS MODAL ON ORDER PLACEMENT */}
      {successOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Boost Order Dispatched!</h3>
              <p className="text-xs text-slate-500">
                Order successfully submitted to SMM Panel v2 engine.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Remote API Order ID:</span>
                <span className="font-mono font-bold text-slate-900">#{successOrder.apiOrderId || successOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold text-slate-900 truncate max-w-[180px]">{successOrder.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quantity:</span>
                <span className="font-mono font-bold text-slate-900">{successOrder.quantity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Charge:</span>
                <span className="font-mono font-bold text-emerald-600">{formatCurrency(successOrder.charge, isOwner)}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setSuccessOrder(null);
                  setActiveTab('orders');
                }}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Track Live Activity
              </button>
              <button
                type="button"
                onClick={() => setSuccessOrder(null)}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PWA Install Modal */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
};
