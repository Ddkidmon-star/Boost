import React, { useState, useEffect, useMemo } from 'react';
import { 
  Rocket, 
  Link as LinkIcon, 
  Clipboard, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Sliders, 
  ArrowRight,
  TrendingUp,
  Zap,
  Info
} from 'lucide-react';
import { useSMM } from '../context/SMMContext';
import { useAuth } from '../context/AuthContext';
import { PLATFORMS } from '../data/mockServices';
import { detectPlatformFromUrl, calculateOrderCost, formatCurrency } from '../services/smmApi';
import { SocialPlatform, SMMService, BoostOrder } from '../types';

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

  const [linkInput, setLinkInput] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<SocialPlatform | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | number>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quantity, setQuantity] = useState<number>(1000);
  const [isCopied, setIsCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<BoostOrder | null>(null);

  // Filter services by platform
  const platformServices = useMemo(() => {
    return services.filter((s) => s.platform === selectedPlatform);
  }, [services, selectedPlatform]);

  // Extract unique categories for selected platform
  const categories = useMemo(() => {
    const set = new Set<string>();
    platformServices.forEach((s) => set.add(s.category));
    return Array.from(set);
  }, [platformServices]);

  // Filtered services by category
  const filteredServices = useMemo(() => {
    if (selectedCategory === 'all') return platformServices;
    return platformServices.filter((s) => s.category === selectedCategory);
  }, [platformServices, selectedCategory]);

  // Currently selected service object
  const currentService: SMMService | undefined = useMemo(() => {
    return services.find((s) => String(s.service) === String(selectedServiceId)) || filteredServices[0];
  }, [services, selectedServiceId, filteredServices]);

  // Handle pre-selected service from Services tab
  useEffect(() => {
    if (preselectedServiceId) {
      const match = services.find((s) => String(s.service) === String(preselectedServiceId));
      if (match) {
        setSelectedPlatform(match.platform);
        setSelectedServiceId(match.service);
        setSelectedCategory('all');
        setQuantity(Math.max(Number(match.min) || 100, 1000));
      }
      setPreselectedServiceId(null);
    }
  }, [preselectedServiceId, services, setSelectedPlatform, setPreselectedServiceId]);

  // Sync selectedServiceId when platform changes
  useEffect(() => {
    if (filteredServices.length > 0 && !filteredServices.some((s) => String(s.service) === String(selectedServiceId))) {
      setSelectedServiceId(filteredServices[0].service);
      const minQty = Number(filteredServices[0].min) || 100;
      setQuantity((prev) => Math.max(prev, minQty));
    }
  }, [filteredServices, selectedServiceId]);

  // Smart Link Detector logic
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

  // Clipboard paste helper
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleLinkChange(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch {
      // Browser permissions error
      setErrorMessage('Please paste the URL directly into the field.');
    }
  };

  // Cost calculation
  const calculatedCost = useMemo(() => {
    if (!currentService) return 0;
    return calculateOrderCost(currentService.rate, quantity, isOwner);
  }, [currentService, quantity, isOwner]);

  const minLimit = Number(currentService?.min) || 50;
  const maxLimit = Number(currentService?.max) || 100000;

  // Handle boost order submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!linkInput.trim()) {
      setErrorMessage('Please enter a valid social media link or profile handle.');
      return;
    }

    if (!currentService) {
      setErrorMessage('Please select a boosting service.');
      return;
    }

    if (quantity < minLimit) {
      setErrorMessage(`Quantity must be at least ${minLimit.toLocaleString()}.`);
      return;
    }

    if (quantity > maxLimit) {
      setErrorMessage(`Quantity cannot exceed ${maxLimit.toLocaleString()}.`);
      return;
    }

    const result = await placeOrder(currentService.service, linkInput.trim(), quantity);

    if (result.success && result.order) {
      setSuccessOrder(result.order);
      setLinkInput('');
    } else {
      setErrorMessage(result.error || 'Failed to submit boost order.');
    }
  };

  // Quick increment chips
  const handleAddQuantity = (amount: number) => {
    setQuantity((prev) => Math.min(maxLimit, Math.max(minLimit, prev + amount)));
  };

  const activePlatformConfig = PLATFORMS.find((p) => p.id === selectedPlatform) || PLATFORMS[0];

  return (
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-xl mx-auto space-y-4">
      {/* Top Banner / Feature Callout */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/20 p-4 shadow-xl">
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SMM v2 Engine • Instant Delivery</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Boost Your Social Presence
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Paste your link, pick high retention growth, and dispatch live in seconds.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
      </div>

      {/* 1. Platform Selector Tabs */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Select Platform</span>
          {detectedPlatform && (
            <span className="text-cyan-400 font-mono text-[10px] lowercase flex items-center gap-1">
              <Check className="w-3 h-3" /> Auto-detected
            </span>
          )}
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
          {PLATFORMS.map((platform) => {
            const isSelected = selectedPlatform === platform.id;
            return (
              <button
                key={platform.id}
                onClick={() => {
                  setSelectedPlatform(platform.id);
                  setSelectedCategory('all');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20 scale-[1.02]'
                    : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{platform.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 2. SMART LINK DETECTOR INPUT */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Social Media Link or Username</span>
            </label>
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
            >
              {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Clipboard className="w-3 h-3" />}
              <span>{isCopied ? 'Pasted!' : 'Paste Link'}</span>
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={linkInput}
              onChange={(e) => handleLinkChange(e.target.value)}
              placeholder={activePlatformConfig.placeholder}
              className="w-full bg-[#0d101a] border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition font-mono pr-20"
            />
            {detectedPlatform && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 capitalize flex items-center gap-1">
                  <Check className="w-2.5 h-2.5 text-cyan-400" />
                  {detectedPlatform}
                </span>
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Smart detector auto-identifies TikTok, Instagram, YouTube, X, and switches platform.</span>
          </p>
        </div>

        {/* 3. Category Filter & Service Selection */}
        <div className="space-y-2">
          {categories.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-slate-700 text-white font-semibold'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-300'
                }`}
              >
                All Services
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {cat.replace(`${activePlatformConfig.name} - `, '')}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Select Service</span>
              <span className="text-[10px] text-slate-400">ID #{currentService?.service}</span>
            </label>
            <div className="relative">
              <select
                value={selectedServiceId}
                onChange={(e) => {
                  setSelectedServiceId(e.target.value);
                  const s = services.find((srv) => String(srv.service) === e.target.value);
                  if (s) {
                    setQuantity((prev) => Math.max(Number(s.min) || 100, prev));
                  }
                }}
                className="w-full bg-[#0d101a] border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 appearance-none transition cursor-pointer pr-8"
              >
                {filteredServices.map((srv) => (
                  <option key={srv.service} value={srv.service} className="bg-slate-900 text-white py-1">
                    #{srv.service} - {srv.name} ({isOwner ? 'FREE' : `$${srv.rate}/1k`})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Sliders className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Service Details Card */}
          {currentService && (
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-medium text-white">{currentService.name}</span>
                <span className="font-mono font-bold text-cyan-400 shrink-0 ml-2">
                  {isOwner ? 'FREE' : `$${currentService.rate} / 1,000`}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-[11px] text-slate-400">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Min</span>
                  <span className="font-mono text-slate-200">{Number(currentService.min).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Max</span>
                  <span className="font-mono text-slate-200">{Number(currentService.max).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Avg Speed</span>
                  <span className="text-cyan-300 flex items-center gap-1 font-mono">
                    <Clock className="w-2.5 h-2.5" />
                    {currentService.averageTime || 'Instant'}
                  </span>
                </div>
              </div>
              {currentService.description && (
                <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/60 pt-1.5">
                  {currentService.description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* 4. Quantity Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Quantity
            </label>
            <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
              {quantity.toLocaleString()} units
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              min={minLimit}
              max={maxLimit}
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setQuantity(val);
              }}
              className="w-full bg-[#0d101a] border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>

          {/* Slider */}
          <input
            type="range"
            min={minLimit}
            max={Math.min(maxLimit, 50000)}
            step={50}
            value={Math.min(quantity, 50000)}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />

          {/* Quick Increment Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[100, 500, 1000, 2500, 5000, 10000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleAddQuantity(amt)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-white transition cursor-pointer"
              >
                +{amt >= 1000 ? `${amt / 1000}k` : amt}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setQuantity(minLimit)}
              className="px-2 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              Min
            </button>
          </div>
        </div>

        {/* 5. Cost Summary & Calculation */}
        <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Rate per 1,000 units</span>
            <span className="font-mono text-slate-300">{isOwner ? '$0.00 (Free)' : `$${currentService?.rate || '1.00'}`}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Target Quantity</span>
            <span className="font-mono text-slate-300">{quantity.toLocaleString()}</span>
          </div>

          <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-semibold text-slate-400 block">Total Price</span>
              {isOwner ? (
                <span className="text-[10px] text-cyan-400 font-mono">Owner Privilege: Free Boost</span>
              ) : (
                <span className="text-[10px] text-slate-400 font-mono">
                  Wallet: {formatCurrency(user?.balance || 0, false)}
                </span>
              )}
            </div>
            <div className="text-right">
              <span className={`text-xl font-extrabold font-mono ${isOwner ? 'text-cyan-400' : 'text-emerald-400'}`}>
                {isOwner ? '$0.00 / Free' : `$${calculatedCost.toFixed(2)}`}
              </span>
            </div>
          </div>

          {/* Insufficient funds prompt for non-owners */}
          {!isOwner && (user?.balance || 0) < calculatedCost && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Insufficient balance for this boost</span>
              </div>
              <button
                type="button"
                onClick={onOpenTopUp}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition cursor-pointer"
              >
                Top Up
              </button>
            </div>
          )}
        </div>

        {/* Error notice */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 6. Submit Boost Button */}
        <button
          type="submit"
          disabled={isSubmittingOrder}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-pink-500 hover:from-cyan-400 hover:via-indigo-500 hover:to-pink-400 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
        >
          {isSubmittingOrder ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Connecting to SMM Engine...</span>
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4 fill-white/20" />
              <span>Submit Boost Order</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Success Modal / Confirmation Dialog */}
      {successOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#111422] border border-cyan-500/30 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6 text-cyan-400" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Boost Order Dispatched!</h3>
              <p className="text-xs text-slate-400">
                Order sent to SMM v2 engine. Delivery starting shortly.
              </p>
            </div>

            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Order ID:</span>
                <span className="font-mono text-cyan-300 font-bold">#{successOrder.apiOrderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Service:</span>
                <span className="text-slate-200 font-medium truncate max-w-[180px]">{successOrder.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Quantity:</span>
                <span className="font-mono text-white font-bold">{successOrder.quantity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Charged:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {isOwner ? '$0.00 / Free' : `$${successOrder.charge.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-semibold text-[10px]">
                  {successOrder.status}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSuccessOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Boost Another
              </button>
              <button
                onClick={() => {
                  setSuccessOrder(null);
                  setActiveTab('orders');
                }}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Track Live</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
