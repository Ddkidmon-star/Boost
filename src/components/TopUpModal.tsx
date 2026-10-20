import React, { useState } from 'react';
import { X, CreditCard, DollarSign, CheckCircle2, ArrowRight, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose }) => {
  const { user, topUpWallet } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto' | 'paypal' | 'applepay'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleDeposit = async () => {
    if (finalAmount <= 0) return;
    setIsProcessing(true);

    try {
      await topUpWallet(finalAmount);
      setIsProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#16081e] border-2 border-pink-500/40 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-pink-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Top Up Wallet</h3>
              <p className="text-[10px] text-pink-300/70">Current balance: ${(user?.balance || 0).toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-pink-400 hover:text-white hover:bg-pink-900/30 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-white">Deposit Successful!</h4>
            <p className="text-xs text-pink-300/70 font-mono">+${finalAmount.toFixed(2)} added to Firestore wallet</p>
          </div>
        ) : (
          <>
            {/* Quick Amount Chips in Pink */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-pink-300/80">
                Select Amount
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 25, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-2.5 rounded-2xl text-xs font-mono font-black transition cursor-pointer ${
                      selectedAmount === amt && !customAmount
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30'
                        : 'bg-[#1c0a24] text-pink-200/70 hover:bg-pink-900/30 border border-pink-900/40'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="relative mt-2">
                <DollarSign className="w-4 h-4 text-pink-400/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  placeholder="Custom amount (USD)"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                  }}
                  className="w-full bg-[#120718] border border-pink-900/40 focus:border-pink-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-pink-300/30 font-mono focus:outline-none shadow-inner"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-pink-300/80">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border flex items-center gap-2 transition cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-pink-500/20 border-pink-500 text-white font-bold'
                      : 'bg-[#1c0a24] border-pink-900/40 text-pink-300/60 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-pink-400" />
                  <span>Debit / Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('crypto')}
                  className={`p-3 rounded-2xl border flex items-center gap-2 transition cursor-pointer ${
                    paymentMethod === 'crypto'
                      ? 'bg-pink-500/20 border-pink-500 text-white font-bold'
                      : 'bg-[#1c0a24] border-pink-900/40 text-pink-300/60 hover:text-white'
                  }`}
                >
                  <span className="font-bold text-xs text-pink-400">₮</span>
                  <span>USDT / Crypto</span>
                </button>
              </div>
            </div>

            {/* Total checkout info */}
            <div className="bg-[#120718] p-3.5 rounded-2xl border border-pink-900/40 flex items-center justify-between text-xs">
              <span className="text-pink-300/70">Total Deposit</span>
              <span className="font-mono text-base font-black text-pink-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]">
                ${finalAmount.toFixed(2)}
              </span>
            </div>

            {/* Submit button */}
            <button
              onClick={handleDeposit}
              disabled={isProcessing || finalAmount <= 0}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 hover:from-pink-400 hover:to-fuchsia-500 text-white font-black text-xs shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Syncing with Wallet...</span>
                </>
              ) : (
                <>
                  <span>CONFIRM TOP UP (${finalAmount.toFixed(2)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
