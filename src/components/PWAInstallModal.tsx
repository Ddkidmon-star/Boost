import React from 'react';
import { X, Smartphone, Share, PlusSquare, CheckCircle2, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200/80 space-y-4 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shadow-sm">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Add to Home Screen</h3>
              <p className="text-[11px] text-slate-500">Run as Standalone Mobile App</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Install BoostPro directly onto your device. It launches fullscreen like a native app with zero browser URL bar or distractions.
        </p>

        {isInstallable ? (
          /* Direct Chrome/Android 1-Click Install */
          <button
            onClick={async () => {
              await install();
              onClose();
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Install Standalone App Now</span>
          </button>
        ) : isIOS ? (
          /* Guided iOS Safari Flow */
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-2.5 text-slate-700">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>iPhone / iPad Instructions:</span>
            </div>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                <span>Tap the <strong className="text-slate-900 font-semibold">Share</strong> button in Safari's bottom toolbar (<Share className="w-3.5 h-3.5 inline text-rose-600" />).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                <span>Scroll down and select <strong className="text-slate-900 font-semibold">Add to Home Screen</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-rose-600" />).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                <span>Tap <strong className="text-slate-900 font-semibold">Add</strong> in the top right.</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-1.5 text-slate-600">
            <p className="font-semibold text-slate-900">Browser Installation:</p>
            <p className="text-[11px]">
              Use your browser menu (⋮ or Share) and select <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>.
            </p>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium pt-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Full offline capability & standalone viewport enabled</span>
        </div>
      </div>
    </div>
  );
};
