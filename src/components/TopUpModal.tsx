import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  Wallet, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  KeyRound, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getPaystackStatus, 
  initializePaystackTransaction, 
  verifyPaystackTransaction, 
  savePaystackKeys,
  nairaToUsd,
  usdToNaira,
  PaystackStatus 
} from '../services/paystack';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose }) => {
  const { user, topUpWallet } = useAuth();
  
  const [selectedNaira, setSelectedNaira] = useState<number>(5000);
  const [customNaira, setCustomNaira] = useState<string>('');
  const [status, setStatus] = useState<PaystackStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // Key configuration drawer
  const [showKeySetup, setShowKeySetup] = useState(false);
  const [secretKeyInput, setSecretKeyInput] = useState('');
  const [publicKeyInput, setPublicKeyInput] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [keySaveMsg, setKeySaveMsg] = useState<string | null>(null);

  // Transaction state
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeReference, setActiveReference] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPaystackStatus();
    }
  }, [isOpen]);

  const loadPaystackStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const s = await getPaystackStatus();
      setStatus(s);
      if (!s.configured) {
        // Automatically suggest key setup if owner wants to plug it in
        setShowKeySetup(false);
      }
    } finally {
      setIsLoadingStatus(false);
    }
  };

  if (!isOpen) return null;

  const currentNairaAmount = customNaira ? Math.max(100, parseInt(customNaira, 10) || 0) : selectedNaira;
  const estimatedUsd = nairaToUsd(currentNairaAmount);

  const handleSaveKeys = async () => {
    if (!secretKeyInput.trim()) {
      setKeySaveMsg('Please enter your Paystack Secret Key (sk_live_... or sk_test_...)');
      return;
    }
    setIsSavingKey(true);
    setKeySaveMsg(null);
    try {
      const res = await savePaystackKeys(secretKeyInput.trim(), publicKeyInput.trim());
      if (res.success) {
        setKeySaveMsg('Paystack Secret Key activated on backend!');
        setShowKeySetup(false);
        setSecretKeyInput('');
        await loadPaystackStatus();
      } else {
        setKeySaveMsg(res.message || 'Failed to save key');
      }
    } catch (e: any) {
      setKeySaveMsg(e.message || 'Error communicating with backend');
    } finally {
      setIsSavingKey(false);
    }
  };

  const handlePaystackCheckout = async () => {
    if (currentNairaAmount <= 0) return;
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const userEmail = user?.email || 'customer@boostpro.app';

    try {
      const res = await initializePaystackTransaction({
        email: userEmail,
        amount: currentNairaAmount,
        currency: 'NGN'
      });

      if (res.status && res.data?.authorization_url) {
        setActiveReference(res.data.reference);
        setAuthUrl(res.data.authorization_url);

        // Open checkout popup / new tab
        const popup = window.open(res.data.authorization_url, '_blank');
        if (!popup) {
          // If popup blocked, let user click the direct link
          setErrorMsg('Popup was blocked by your browser. Please tap the button below to complete payment.');
        }
      } else {
        if (!status?.configured) {
          setShowKeySetup(true);
          setErrorMsg('Paystack Secret Key is needed on the backend to accept live payments. Enter your key below.');
        } else {
          setErrorMsg(res.message || 'Payment initialization was not completed.');
        }
      }
    } catch (err: any) {
      console.error('Paystack checkout error:', err);
      setErrorMsg(err.message || 'Network error connecting to payment gateway.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!activeReference) return;
    setIsVerifying(true);
    setErrorMsg(null);
    try {
      const res = await verifyPaystackTransaction(activeReference);
      if (res.status && res.verified) {
        const addedUsd = nairaToUsd(res.amount ? res.amount : currentNairaAmount);
        await topUpWallet(addedUsd);
        setSuccessMsg(`Payment verified! Added $${addedUsd.toFixed(2)} (₦${(res.amount || currentNairaAmount).toLocaleString()}) to your wallet.`);
        setActiveReference(null);
        setAuthUrl(null);
        setTimeout(() => {
          onClose();
        }, 2200);
      } else {
        setErrorMsg(res.message || 'Payment has not been confirmed yet. If you just paid, please wait a few seconds and tap verify again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to verify transaction.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 p-[2px] shadow-sm shadow-red-500/20">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Wallet className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Deposit with <span className="text-cyan-700 font-black">Paystack</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Current Balance: <span className="font-bold text-slate-900">${(user?.balance || 0).toFixed(2)}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gateway Security Badge */}
        <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-cyan-50/60 border border-cyan-200/60 text-cyan-900 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-600 shrink-0" />
            <span className="font-semibold text-[11px]">Instant Card, Bank Transfer, USSD via Paystack</span>
          </div>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-white font-bold border border-cyan-200 text-cyan-700">
            Live
          </span>
        </div>

        {/* Error / Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {/* If Transaction In Flight */}
        {activeReference ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-center">
            <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              <RefreshCw className="w-5 h-5 animate-spin text-red-600" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">Waiting for Payment Confirmation</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete your transaction of <strong>₦{currentNairaAmount.toLocaleString()}</strong> in the Paystack window.
              </p>
            </div>

            {authUrl && (
              <a
                href={authUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-bold underline"
              >
                <span>Re-open Paystack Payment Window</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={handleVerifyPayment}
              disabled={isVerifying}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98 disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Verifying Transaction...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I Have Completed Payment</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            {/* Amount Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Select Deposit Amount
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  Rate: ₦1,500 ≈ $1.00 USD
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[2000, 5000, 10000, 20000, 50000, 100000].map((naira) => (
                  <button
                    key={naira}
                    type="button"
                    onClick={() => {
                      setSelectedNaira(naira);
                      setCustomNaira('');
                    }}
                    className={`py-2.5 px-2 rounded-2xl border text-center transition cursor-pointer ${
                      selectedNaira === naira && !customNaira
                        ? 'border-red-600 bg-red-50/70 text-red-700 font-extrabold shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold'
                    }`}
                  >
                    <div className="text-xs font-mono font-bold">₦{naira.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500 font-mono">≈ ${nairaToUsd(naira).toFixed(2)}</div>
                  </button>
                ))}
              </div>

              {/* Custom amount input */}
              <div className="pt-1">
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                  Or enter custom amount in Naira (₦):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-xs">
                    ₦
                  </span>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    value={customNaira}
                    onChange={(e) => setCustomNaira(e.target.value)}
                    className="w-full pl-8 pr-16 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 font-bold">
                    ≈ ${estimatedUsd.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Wallet Credit Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Wallet Credited:</span>
              <span className="font-extrabold font-mono text-emerald-600 text-sm">
                +${estimatedUsd.toFixed(2)} USD
              </span>
            </div>

            {/* Paystack Action Button */}
            <button
              onClick={handlePaystackCheckout}
              disabled={isProcessing || currentNairaAmount <= 0}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-sm shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Connecting to Paystack...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay ₦{currentNairaAmount.toLocaleString()} via Paystack</span>
                  <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
                </>
              )}
            </button>
          </>
        )}

        {/* Backend Paystack Key Config Accordion (Owner Feature) */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => setShowKeySetup(!showKeySetup)}
            className="text-[11px] text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1.5 transition cursor-pointer mx-auto"
          >
            <KeyRound className="w-3 h-3 text-red-600" />
            <span>
              {status?.configured 
                ? 'Paystack Secret Key: Configured & Active on Backend' 
                : 'Owner: Click to Enter Paystack Secret Key'}
            </span>
          </button>

          {showKeySetup && (
            <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-left">
              <div>
                <span className="font-bold text-slate-900 block text-[11px]">
                  Backend Paystack Secret Key
                </span>
                <span className="text-[10px] text-slate-500">
                  Stored securely on the backend server; never exposed to customer browsers.
                </span>
              </div>

              <input
                type="password"
                placeholder="sk_live_... or sk_test_..."
                value={secretKeyInput}
                onChange={(e) => setSecretKeyInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500"
              />

              <input
                type="text"
                placeholder="pk_live_... (optional public key)"
                value={publicKeyInput}
                onChange={(e) => setPublicKeyInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500"
              />

              {keySaveMsg && (
                <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  {keySaveMsg}
                </div>
              )}

              <button
                onClick={handleSaveKeys}
                disabled={isSavingKey || !secretKeyInput.trim()}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
              >
                {isSavingKey ? 'Saving to Backend...' : 'Activate Paystack Key'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
