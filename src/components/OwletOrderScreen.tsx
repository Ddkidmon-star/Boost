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
  CheckCircle2,
  Sparkles,
  KeyRound,
  Layers,
  Globe,
  Radio,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSMM } from '../context/SMMContext';
import { PLATFORMS } from '../data/mockServices';
import { detectPlatformFromUrl, calculateOrderCost, formatCurrency } from '../services/smmApi';
import { owletClient, DEFAULT_OWLET_SERVICES } from '../services/owletApi';
import { SocialPlatform, SMMService, BoostOrder } from '../types';
import { saveOrderToFirestore } from '../services/firebase';

interface OwletOrderScreenProps {
  onOpenTopUp: () => void;
  onOrderSuccess?: (order: BoostOrder) => void;
}

const PLATFORM_CATEGORIES = [
  { id: 'all', label: 'All Websites' },
  { id: 'social', label: 'Social & Video' },
  { id: 'messaging', label: 'Messaging' },
  { id: 'music', label: 'Music & Audio' },
  { id: 'stream', label: 'Livestream' },
  { id: 'web', label: 'Web & Traffic' },
];

export const OwletOrderScreen: React.FC<OwletOrderScreenProps> = ({ 
  onOpenTopUp,
  onOrderSuccess
}) => {
  const { user, isOwner, deductBalance } = useAuth();
  const { setActiveTab } = useSMM();

  // State
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('tiktok');
  const [selectedAction, setSelectedAction] = useState<string>('followers');
  const [services, setServices] = useState<SMMService[]>(DEFAULT_OWLET_SERVICES);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | number>('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [platformSearch, setPlatformSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [linkInput, setLinkInput] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<SocialPlatform | null>(null);
  const [quantity, setQuantity] = useState<number>(1000);
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<BoostOrder | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [keySaveMessage, setKeySaveMessage] = useState<string | null>(null);
  const [hasBackendKey, setHasBackendKey] = useState(false);

  // Load backend status and services from The Owlet API
  useEffect(() => {
    setIsLoadingServices(true);
    owletClient.getBackendStatus().then((status) => {
      setHasBackendKey(status.hasMasterKey);
    });

    owletClient.getServices().then((fetched) => {
      if (fetched && fetched.length > 0) {
        setServices(fetched);
      }
      setIsLoadingServices(false);
    });
  }, []);

  // Filter platforms by category and search
  const visiblePlatforms = useMemo(() => {
    return PLATFORMS.filter((p) => {
      // Category filter
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

      // Search filter
      if (platformSearch.trim()) {
        const q = platformSearch.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [activeCategory, platformSearch]);

  // Filter services by current platform
  const platformServices = useMemo(() => {
    return services.filter((s) => s.platform === selectedPlatform);
  }, [services, selectedPlatform]);

  // Available boost actions for platform
  const availableActions = useMemo(() => {
    const actions: { id: string; label: string; icon: string }[] = [
      { id: 'followers', label: 'Followers / Subs / Members', icon: '👥' },
      { id: 'likes', label: 'Likes & Reactions', icon: '❤️' },
      { id: 'views', label: 'Views & Traffic', icon: '👁️' },
      { id: 'comments', label: 'Comments & Reviews', icon: '💬' },
      { id: 'shares', label: 'Shares & Saves', icon: '🔄' },
      { id: 'other', label: 'All Packages', icon: '⚡' },
    ];

    return actions.filter((act) => {
      if (act.id === 'other') return true;
      return platformServices.some((s) => {
        if (s.actionType === act.id) return true;
        const text = `${s.category} ${s.name}`.toLowerCase();
        if (act.id === 'followers' && (text.includes('follower') || text.includes('subscriber') || text.includes('member') || text.includes('sub'))) return true;
        if (act.id === 'likes' && (text.includes('like') || text.includes('reaction') || text.includes('upvote'))) return true;
        if (act.id === 'views' && (text.includes('view') || text.includes('stream') || text.includes('play') || text.includes('traffic') || text.includes('visitor'))) return true;
        if (act.id === 'comments' && (text.includes('comment') || text.includes('review'))) return true;
        if (act.id === 'shares' && (text.includes('share') || text.includes('save') || text.includes('repost') || text.includes('retweet'))) return true;
        return false;
      });
    });
  }, [platformServices]);

  // Auto-select valid action
  useEffect(() => {
    if (availableActions.length > 0 && !availableActions.some((a) => a.id === selectedAction)) {
      setSelectedAction(availableActions[0].id);
    }
  }, [selectedPlatform, availableActions, selectedAction]);

  // Filter services by action and search
  const filteredServices = useMemo(() => {
    let list = platformServices.filter((s) => {
      if (selectedAction === 'other') return true;
      if (s.actionType === selectedAction) return true;
      const text = `${s.category} ${s.name}`.toLowerCase();
      if (selectedAction === 'followers') return text.includes('follower') || text.includes('sub') || text.includes('member');
      if (selectedAction === 'likes') return text.includes('like') || text.includes('heart') || text.includes('reaction');
      if (selectedAction === 'views') return text.includes('view') || text.includes('stream') || text.includes('play') || text.includes('traffic') || text.includes('visitor');
      if (selectedAction === 'comments') return text.includes('comment') || text.includes('review');
      if (selectedAction === 'shares') return text.includes('share') || text.includes('save') || text.includes('repost');
      return true;
    });

    if (serviceSearch.trim()) {
      const q = serviceSearch.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
    }

    return list;
  }, [platformServices, selectedAction, serviceSearch]);

  // Default select first service
  useEffect(() => {
    if (filteredServices.length > 0) {
      if (!filteredServices.some((s) => String(s.service) === String(selectedServiceId))) {
        setSelectedServiceId(filteredServices[0].service);
      }
    } else {
      setSelectedServiceId('');
    }
  }, [filteredServices, selectedServiceId]);

  const activeService = useMemo(() => {
    return services.find((s) => String(s.service) === String(selectedServiceId)) || filteredServices[0];
  }, [services, selectedServiceId, filteredServices]);

  // Clamp quantity within min/max
  useEffect(() => {
    if (activeService) {
      const minVal = Number(activeService.min) || 10;
      const maxVal = Number(activeService.max) || 100000;
      if (quantity < minVal) setQuantity(minVal);
      if (quantity > maxVal) setQuantity(maxVal);
    }
  }, [activeService]);

  // Auto-detect platform from pasted link
  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLinkInput(val);
    const detected = detectPlatformFromUrl(val);
    setDetectedPlatform(detected);
    if (detected && detected !== selectedPlatform) {
      setSelectedPlatform(detected);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setLinkInput(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        const detected = detectPlatformFromUrl(text);
        setDetectedPlatform(detected);
        if (detected && detected !== selectedPlatform) {
          setSelectedPlatform(detected);
        }
      }
    } catch {
      // Clipboard denied
    }
  };

  // Order calculation
  const orderCost = useMemo(() => {
    if (!activeService) return 0;
    return calculateOrderCost(activeService.rate, quantity, isOwner);
  }, [activeService, quantity, isOwner]);

  // Submit Owlet Boost
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessOrder(null);

    if (!user) {
      setErrorMessage('Please sign in with Google to place an Owlet boost.');
      return;
    }

    if (!linkInput.trim()) {
      setErrorMessage('Please enter a target profile URL, post link, or username.');
      return;
    }

    if (!activeService) {
      setErrorMessage('Please select an Owlet service from the catalog.');
      return;
    }

    const minQty = Number(activeService.min) || 10;
    const maxQty = Number(activeService.max) || 100000;

    if (quantity < minQty) {
      setErrorMessage(`Minimum quantity for this service is ${minQty.toLocaleString()}`);
      return;
    }
    if (quantity > maxQty) {
      setErrorMessage(`Maximum quantity for this service is ${maxQty.toLocaleString()}`);
      return;
    }

    // Balance check for regular customers
    if (!isOwner && user.balance < orderCost) {
      setErrorMessage(
        `Insufficient wallet balance. Total cost is $${orderCost.toFixed(2)}, but you currently have $${user.balance.toFixed(2)}.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Deduct balance for customers (owner is $0.00 / free)
      if (!isOwner && orderCost > 0) {
        const deducted = await deductBalance(orderCost);
        if (!deducted) {
          throw new Error('Could not deduct wallet balance. Please check your funds.');
        }
      }

      // Place order via Owlet client
      const newOrder = await owletClient.placeOrder(
        activeService.service,
        linkInput.trim(),
        quantity,
        selectedPlatform,
        activeService.name,
        activeService.rate,
        isOwner,
        user.uid,
        user.email
      );

      // Sync to Firestore for real-time tracking
      await saveOrderToFirestore(newOrder).catch((err) => {
        console.warn('Could not mirror order to Firestore:', err);
      });

      setSuccessOrder(newOrder);
      if (onOrderSuccess) onOrderSuccess(newOrder);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit Owlet boost order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveOwletKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;

    setIsSavingKey(true);
    setKeySaveMessage(null);
    const ok = await owletClient.saveMasterKey(keyInput.trim());
    setIsSavingKey(false);
    if (ok) {
      setKeySaveMessage('OWLET_MASTER_KEY saved successfully to backend!');
      setHasBackendKey(true);
      setTimeout(() => {
        setShowKeyModal(false);
        setKeySaveMessage(null);
      }, 1500);
    } else {
      setKeySaveMessage('Failed to save API key. Please check server logs.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-2.5 pb-28 space-y-4">
      {/* Shifted-up Compact Status Banner for The Owlet */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-indigo-200 border border-white/10 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>The Owlet Network • Live Connected</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span>The Owlet Boost Engine</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                theowlet.com
              </span>
            </h2>
            <p className="text-xs text-indigo-200/80 mt-0.5 max-w-md">
              Connected live to {services.length.toLocaleString()} real services across 23 websites & social platforms.
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
            <button
              onClick={() => setShowKeyModal(true)}
              className="px-3 py-1 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
              title="Configure OWLET_MASTER_KEY"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-300" />
              <span>{hasBackendKey ? 'Key Connected' : 'Change Key'}</span>
            </button>
            <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>5,000+ Services Live</span>
            </span>
          </div>
        </div>
      </div>

      {/* 1. COMPREHENSIVE WEBSITES & SOCIAL PLATFORMS SELECTOR */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px]">1</span>
            <span>Select Website / Social Platform ({PLATFORMS.length} Available)</span>
          </label>
          
          {/* Quick Platform Search */}
          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter websites..."
              value={platformSearch}
              onChange={(e) => setPlatformSearch(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {PLATFORM_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer active:scale-95 ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Platform Selection Grid with All Websites from the API Key */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-56 overflow-y-auto pr-1">
          {visiblePlatforms.map((platform) => {
            const isSelected = selectedPlatform === platform.id;
            const count = services.filter((s) => s.platform === platform.id).length;

            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => {
                  setSelectedPlatform(platform.id);
                  setErrorMessage(null);
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer select-none active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-50 to-violet-50/60 border-indigo-600 shadow-xs ring-2 ring-indigo-500/20'
                    : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-1 text-sm shadow-2xs"
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
                <span
                  className={`text-[10px] tracking-tight leading-tight text-center truncate w-full ${
                    isSelected ? 'font-black text-indigo-950' : 'font-semibold text-slate-700'
                  }`}
                >
                  {platform.name}
                </span>
                <span className={`text-[9px] font-mono mt-0.5 ${isSelected ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                  {count} pkgs
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. BOOST TYPE BUTTONS */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px]">2</span>
            <span>Boost Objective / Service Category</span>
          </label>
          <span className="text-[11px] font-bold text-indigo-600 capitalize">
            {selectedPlatform} • {platformServices.length} services
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {availableActions.map((act) => {
            const isSelected = selectedAction === act.id;
            return (
              <button
                key={act.id}
                type="button"
                onClick={() => setSelectedAction(act.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer active:scale-95 shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{act.icon}</span>
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. OWLET REAL PACKAGE SELECTION */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px]">3</span>
            <span>Choose Owlet Package ({filteredServices.length} options)</span>
          </label>
          <div className="relative w-40">
            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tiers..."
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              className="w-full pl-7 pr-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {isLoadingServices ? (
            <div className="text-center py-6 text-slate-400 text-xs flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>Loading real Owlet API packages...</span>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              No packages found for this category filter. Try selecting "All Packages".
            </div>
          ) : (
            filteredServices.map((service) => {
              const isSelected = String(service.service) === String(selectedServiceId);
              return (
                <div
                  key={service.service}
                  onClick={() => setSelectedServiceId(service.service)}
                  className={`p-3 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-600 ring-1 ring-indigo-500/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                          #{service.service}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">
                          {service.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                        <span>Min: {Number(service.min).toLocaleString()}</span>
                        <span>•</span>
                        <span>Max: {Number(service.max).toLocaleString()}</span>
                        {service.category && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[150px] text-slate-400">{service.category}</span>
                          </>
                        )}
                        <span className="flex items-center gap-1 text-indigo-600 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>{service.averageTime || 'Instant-30m'}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black font-mono text-indigo-600">
                        {isOwner ? '$0.00 / Free' : `$${service.rate}/1k`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. TARGET LINK FIELD */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px]">4</span>
            <span>Target Link / Profile URL</span>
          </label>
          <button
            type="button"
            onClick={handlePaste}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 transition active:scale-95"
          >
            {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Clipboard className="w-3 h-3" />}
            <span>{isCopied ? 'Pasted!' : 'Paste Link'}</span>
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={linkInput}
            onChange={handleLinkChange}
            placeholder={
              PLATFORMS.find((p) => p.id === selectedPlatform)?.placeholder || 'Enter target profile URL or post link'
            }
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
          />
        </div>

        {detectedPlatform && (
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium px-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Target confirmed: {detectedPlatform.toUpperCase()} link verified</span>
          </div>
        )}
      </div>

      {/* 5. QUANTITY SELECTION */}
      {activeService && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px]">5</span>
              <span>Boost Quantity</span>
            </label>
            <span className="text-xs font-mono font-black text-indigo-600">
              {quantity.toLocaleString()} units
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={Number(activeService.min) || 10}
              max={Number(activeService.max) || 100000}
              step={100}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[100, 500, 1000, 2500, 5000, 10000, 25000].map((preset) => {
              if (preset < Number(activeService.min) || preset > Number(activeService.max)) return null;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setQuantity(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition cursor-pointer active:scale-95 ${
                    quantity === preset
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  +{preset >= 1000 ? `${preset / 1000}k` : preset}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. ORDER SUMMARY CARD */}
      {activeService && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 text-white shadow-md space-y-2.5">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-semibold text-indigo-200">The Owlet Order Summary</span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-bold">
              theowlet.com
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-indigo-300 text-[11px] block">Selected Package</span>
              <span className="font-bold text-white text-xs line-clamp-1">{activeService.name}</span>
            </div>
            <div className="text-right">
              <span className="text-indigo-300 text-[11px] block">Total Amount</span>
              <span className={`text-sm sm:text-base font-black font-mono ${isOwner ? 'text-emerald-400' : 'text-white'}`}>
                {isOwner ? '$0.00 / Free' : `$${orderCost.toFixed(2)}`}
              </span>
            </div>
          </div>

          {/* Insufficient balance prompt */}
          {!isOwner && user && user.balance < orderCost && (
            <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Insufficient balance (${user.balance.toFixed(2)})</span>
              </div>
              <button
                type="button"
                onClick={onOpenTopUp}
                className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] transition cursor-pointer"
              >
                + Deposit Paystack
              </button>
            </div>
          )}
        </div>
      )}

      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          {errorMessage.toLowerCase().includes('balance') && (
            <button
              onClick={onOpenTopUp}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0 transition cursor-pointer shadow-xs"
            >
              Deposit Funds via Paystack
            </button>
          )}
        </div>
      )}

      {/* SUCCESS ORDER BANNER */}
      {successOrder && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2.5">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Owlet Boost Submitted Successfully!</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-emerald-700">Order ID:</span>
              <p className="font-mono font-bold text-emerald-900">#{successOrder.apiOrderId}</p>
            </div>
            <div>
              <span className="text-emerald-700">Status:</span>
              <p className="font-bold text-emerald-900">{successOrder.status}</p>
            </div>
            <div>
              <span className="text-emerald-700">Delivering:</span>
              <p className="font-mono font-bold text-emerald-900">{successOrder.quantity.toLocaleString()} units</p>
            </div>
            <div>
              <span className="text-emerald-700">Cost:</span>
              <p className="font-mono font-bold text-emerald-900">
                {isOwner ? '$0.00 / Free' : `$${successOrder.charge.toFixed(2)}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
            >
              View in Activity Tracker
            </button>
          </div>
        </div>
      )}

      {/* 7. DEDICATED SUBMIT OWLET BOOST ACTION BUTTON */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !linkInput.trim()}
          className={`w-full py-3.5 rounded-2xl font-black text-sm tracking-wide text-white transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
            isSubmitting || !linkInput.trim()
              ? 'bg-slate-400 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-700 hover:via-indigo-700 hover:to-purple-700 shadow-indigo-500/25 hover:shadow-indigo-500/35'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Transmitting to The Owlet v2...</span>
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              <span>Submit Owlet Boost</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-base text-slate-900">Owlet Master API Key</h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Connected live to <code className="font-mono text-slate-700">https://theowlet.com/api/v2</code> with <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-bold">OWLET_MASTER_KEY</code>.
            </p>

            <form onSubmit={handleSaveOwletKey} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  The Owlet API Key:
                </label>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Paste your The Owlet API key"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {keySaveMessage && (
                <p className="text-xs font-bold text-indigo-600">{keySaveMessage}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingKey || !keyInput.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50"
                >
                  {isSavingKey ? 'Saving...' : 'Save & Activate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
