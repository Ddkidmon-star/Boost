import React, { useState, useEffect, useMemo } from 'react';
import { 
  Rocket, 
  Link as LinkIcon, 
  Clipboard, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Clock, 
  Sliders, 
  ArrowRight,
  TrendingUp,
  LogIn,
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
  const { user, isOwner, loginWithGoogle, isLoading: isAuthLoading } = useAuth();

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

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    platformServices.forEach((s) => set.add(s.category));
    return Array.from(set);
  }, [platformServices]);

  // Filtered services
  const filteredServices = useMemo(() => {
    if (selectedCategory === 'all') return platformServices;
    return platformServices.filter((s) => s.category === selectedCategory);
  }, [platformServices, selectedCategory]);

  // Current service
  const currentService: SMMService | undefined = useMemo(() => {
    return services.find((s) => String(s.service) === String(selectedServiceId)) || filteredServices[0];
  }, [services, selectedServiceId, filteredServices]);

  // Handle preselection
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

  useEffect(() => {
    if (filteredServices.length > 0 && !filteredServices.some((s) => String(s.service) === String(selectedServiceId))) {
      setSelectedServiceId(filteredServices[0].service);
      const minQty = Number(filteredServices[0].min) || 100;
      setQuantity((prev) => Math.max(prev, minQty));
    }
  }, [filteredServices, selectedServiceId]);

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

  const calculatedCost = useMemo(() => {
    if (!currentService) return 0;
    return calculateOrderCost(currentService.rate, quantity, isOwner);
  }, [currentService, quantity, isOwner]);

  const minLimit = Number(currentService?.min) || 50;
  const maxLimit = Number(currentService?.max) || 100000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user) {
      setErrorMessage('Please sign in with Google to place orders.');
      return;
    }

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

  const handleAddQuantity = (amount: number) => {
    setQuantity((prev) => Math.min(maxLimit, Math.max(minLimit, prev + amount)));
  };

  const activePlatformConfig = PLATFORMS.find((p) => p.id === selectedPlatform) || PLATFORMS[0];

  return (
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-xl mx-auto space-y-4">
      {/* Pink Hero Callout Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-950/70 via-[#180821] to-fuchsia-950/70 border border-pink-500/30 p-4 sm:p-5 shadow-[0_0_30px_rgba(244,63,94,0.15)]">
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-pink-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SMM v2 Engine • Real High-Speed Growth</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Instant Social Media Boost
            </h1>
            <p className="text-xs text-pink-200/70 mt-1">
              Real followers, views, likes & subscribers delivered in minutes.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 p-[2px] shadow-lg shadow-pink-500/30 shrink-0">
            <div className="w-full h-full bg-[#180821] rounded-[14px] flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-pink-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Google Login Prompt Banner if not logged in */}
      {!user && (
        <div className="p-4 rounded-3xl bg-[#1b0922] border-2 border-pink-500/40 shadow-xl shadow-pink-500/20 text-center space-y-3">
          <div>
            <h3 className="text-sm font-bold text-white">Sign In with Google</h3>
            <p className="text-xs text-pink-200/70 mt-0.5">
              Connect your account to save your boosts in real Firebase database.
            </p>
          </div>
          <button
            onClick={loginWithGoogle}
            disabled={isAuthLoading}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs shadow-lg flex items-center justify-center gap-2.5 transition cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isAuthLoading ? 'Opening Google Sign-In...' : 'Sign in with Google Account'}</span>
          </button>
        </div>
      )}

      {/* 1. Platform Selector Tabs in Pink */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-pink-300/80 flex items-center justify-between">
          <span>Select Platform</span>
          {detectedPlatform && (
            <span className="text-pink-400 font-mono text-[10px] lowercase flex items-center gap-1 font-bold">
              <Check className="w-3 h-3 text-pink-400" /> Auto-detected
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
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 text-white shadow-lg shadow-pink-500/30 scale-[1.02]'
                    : 'bg-[#150a1c] text-pink-200/60 hover:text-white border border-pink-900/30 hover:border-pink-500/40'
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
            <label className="text-[11px] font-bold uppercase tracking-wider text-pink-300/80 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-pink-400" />
              <span>Target Link or Handle</span>
            </label>
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="text-[11px] font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1 transition cursor-pointer"
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
              className="w-full bg-[#120718] border border-pink-900/40 focus:border-pink-500 rounded-2xl px-4 py-3 text-sm text-white placeholder-pink-300/30 focus:outline-none focus:ring-2 focus:ring-pink-500/30 transition font-mono pr-24 shadow-inner"
            />
            {detectedPlatform && (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <span className="px-2.5 py-1 rounded-xl bg-pink-500/20 text-pink-300 text-[10px] font-bold border border-pink-500/40 capitalize flex items-center gap-1 shadow-sm">
                  <Check className="w-2.5 h-2.5 text-pink-400" />
                  {detectedPlatform}
                </span>
              </div>
            )}
          </div>
          <p className="text-[11px] text-pink-300/60 flex items-center gap-1">
            <Info className="w-3 h-3 text-pink-400 shrink-0" />
            <span>Smart link detector auto-identifies platform and configures services.</span>
          </p>
        </div>

        {/* 3. Category & Service Selection */}
        <div className="space-y-2">
          {categories.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-pink-500 text-white font-extrabold shadow-md shadow-pink-500/30'
                    : 'bg-[#150a1c] text-pink-200/60 hover:text-white border border-pink-900/30'
                }`}
              >
                All Services
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-pink-500 text-white font-extrabold shadow-md shadow-pink-500/30'
                      : 'bg-[#150a1c] text-pink-200/60 hover:text-white border border-pink-900/30'
                  }`}
                >
                  {cat.replace(`${activePlatformConfig.name} - `, '')}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-pink-300/80 flex items-center justify-between">
              <span>Select Service</span>
              <span className="text-[10px] text-pink-400 font-mono">ID #{currentService?.service}</span>
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
                className="w-full bg-[#120718] border border-pink-900/40 focus:border-pink-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/30 appearance-none transition cursor-pointer pr-10 shadow-inner"
              >
                {filteredServices.map((srv) => (
                  <option key={srv.service} value={srv.service} className="bg-[#17091f] text-white py-1">
                    #{srv.service} - {srv.name} ({isOwner ? 'FREE' : `$${srv.rate}/1k`})
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-pink-400">
                <Sliders className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Service Specs Card */}
          {currentService && (
            <div className="bg-[#15091c] border border-pink-500/20 rounded-2xl p-3.5 text-xs space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-pink-100">
                <span className="font-bold text-white">{currentService.name}</span>
                <span className="font-mono font-extrabold text-pink-400 shrink-0 ml-2">
                  {isOwner ? 'FREE' : `$${currentService.rate} / 1k`}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-pink-900/30 text-[11px] text-pink-200/70">
                <div>
                  <span className="text-pink-400/80 block text-[9px] uppercase font-bold">Min</span>
                  <span className="font-mono text-white font-bold">{Number(currentService.min).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-pink-400/80 block text-[9px] uppercase font-bold">Max</span>
                  <span className="font-mono text-white font-bold">{Number(currentService.max).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-pink-400/80 block text-[9px] uppercase font-bold">Delivery Speed</span>
                  <span className="text-pink-300 flex items-center gap-1 font-mono font-bold">
                    <Clock className="w-2.5 h-2.5 text-pink-400" />
                    {currentService.averageTime || 'Instant'}
                  </span>
                </div>
              </div>
              {currentService.description && (
                <p className="text-[11px] text-pink-200/70 leading-relaxed border-t border-pink-900/30 pt-1.5">
                  {currentService.description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* 4. Quantity Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-pink-300/80">
              Quantity
            </label>
            <span className="text-xs font-mono font-bold text-white bg-pink-500/20 px-3 py-1 rounded-xl border border-pink-500/40 shadow-sm">
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
              className="w-full bg-[#120718] border border-pink-900/40 focus:border-pink-500 rounded-2xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-pink-500/30 shadow-inner"
            />
          </div>

          {/* Pink Slider */}
          <input
            type="range"
            min={minLimit}
            max={Math.min(maxLimit, 50000)}
            step={50}
            value={Math.min(quantity, 50000)}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full h-2 bg-pink-950/60 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />

          {/* Quick Increment Chips in Pink */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[100, 500, 1000, 2500, 5000, 10000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleAddQuantity(amt)}
                className="px-3 py-1.5 rounded-xl bg-[#17091f] hover:bg-pink-900/40 border border-pink-900/30 text-[11px] font-mono text-pink-200 hover:text-white transition cursor-pointer"
              >
                +{amt >= 1000 ? `${amt / 1000}k` : amt}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setQuantity(minLimit)}
              className="px-2.5 py-1.5 rounded-xl bg-[#17091f] hover:bg-pink-900/40 border border-pink-900/30 text-[10px] font-mono text-pink-400 hover:text-pink-300 transition cursor-pointer font-bold"
            >
              Min
            </button>
          </div>
        </div>

        {/* 5. Cost Summary & Calculation */}
        <div className="rounded-3xl bg-gradient-to-b from-[#180821] to-[#120619] border border-pink-500/30 p-4 sm:p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-xs text-pink-300/70">
            <span>Rate per 1,000 units</span>
            <span className="font-mono text-white">{isOwner ? '$0.00 (Free)' : `$${currentService?.rate || '1.00'}`}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-pink-300/70">
            <span>Target Quantity</span>
            <span className="font-mono text-white">{quantity.toLocaleString()}</span>
          </div>

          <div className="border-t border-pink-900/40 pt-2.5 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-extrabold text-pink-300/80 block">Total Price</span>
              {isOwner ? (
                <span className="text-[10px] text-pink-400 font-mono font-bold">Owner Privilege: Free Boost</span>
              ) : (
                <span className="text-[10px] text-pink-300/60 font-mono">
                  Wallet: {formatCurrency(user?.balance || 0, false)}
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-pink-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]">
                {isOwner ? '$0.00 / Free' : `$${calculatedCost.toFixed(2)}`}
              </span>
            </div>
          </div>

          {/* Insufficient funds warning for non-owners */}
          {user && !isOwner && (user?.balance || 0) < calculatedCost && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-rose-300 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Insufficient balance for this boost</span>
              </div>
              <button
                type="button"
                onClick={onOpenTopUp}
                className="px-3 py-1 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-pink-500/30"
              >
                Top Up
              </button>
            </div>
          )}
        </div>

        {/* Error notice */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 6. Submit Boost Button */}
        <button
          type="submit"
          disabled={isSubmittingOrder}
          className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 hover:from-pink-400 hover:to-fuchsia-500 text-white font-black text-sm shadow-[0_0_30px_rgba(236,72,153,0.35)] flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
        >
          {isSubmittingOrder ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Dispatching to SMM Engine...</span>
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4 fill-white/20" />
              <span>SUBMIT BOOST ORDER</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Success Modal in Hot Pink */}
      {successOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#16081e] border-2 border-pink-500/40 rounded-3xl p-6 shadow-2xl shadow-pink-500/30 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 p-[2px] mx-auto shadow-lg shadow-pink-500/40">
              <div className="w-full h-full bg-[#16081e] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-pink-400" />
              </div>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-white">Boost Order Dispatched!</h3>
              <p className="text-xs text-pink-200/70">
                Order sent to SMM engine and saved in real Firestore database.
              </p>
            </div>

            <div className="bg-[#1d0a27] rounded-2xl p-4 border border-pink-500/20 text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-pink-300/70">Order ID:</span>
                <span className="font-mono text-pink-400 font-bold">#{successOrder.apiOrderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-300/70">Service:</span>
                <span className="text-white font-bold truncate max-w-[180px]">{successOrder.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-300/70">Quantity:</span>
                <span className="font-mono text-white font-extrabold">{successOrder.quantity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-300/70">Charged:</span>
                <span className="font-mono text-pink-400 font-extrabold">
                  {isOwner ? '$0.00 / Free' : `$${successOrder.charge.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-300/70">Status:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold text-[10px] border border-pink-500/40">
                  {successOrder.status}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setSuccessOrder(null)}
                className="flex-1 py-3 rounded-2xl bg-pink-950/40 hover:bg-pink-900/40 border border-pink-800/40 text-pink-200 text-xs font-bold transition cursor-pointer"
              >
                Boost Another
              </button>
              <button
                onClick={() => {
                  setSuccessOrder(null);
                  setActiveTab('orders');
                }}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-extrabold transition flex items-center justify-center gap-1.5 shadow-lg shadow-pink-500/30 cursor-pointer"
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
