import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface MobileFrameWrapperProps {
  children: React.ReactNode;
  isMobileFrame: boolean;
}

export const MobileFrameWrapper: React.FC<MobileFrameWrapperProps> = ({ children, isMobileFrame }) => {
  if (!isMobileFrame) {
    return <div className="min-h-screen bg-[#090a0f] text-slate-100">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#06070a] py-4 sm:py-8 px-2 flex items-center justify-center">
      {/* Smartphone Device Frame */}
      <div className="w-full max-w-[430px] h-[890px] max-h-[95vh] bg-[#090b13] border-[6px] border-[#1e2235] rounded-[52px] shadow-[0_0_60px_rgba(34,211,238,0.15)] overflow-hidden flex flex-col relative ring-1 ring-slate-800">
        {/* iOS Dynamic Island & Status Bar */}
        <div className="w-full h-11 bg-[#090b13] px-7 flex items-center justify-between shrink-0 select-none z-40 border-b border-slate-900/40">
          <span className="text-[12px] font-semibold text-white tracking-tight">9:41</span>
          
          {/* Dynamic Island Pill */}
          <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center gap-1.5 px-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-500/80 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-indigo-500/60" />
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Signal className="w-3 h-3 text-slate-300" />
            <Wifi className="w-3 h-3 text-slate-300" />
            <BatteryMedium className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Mobile Viewport Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col bg-[#090a0f]">
          {children}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="w-full h-5 bg-[#090b13] flex items-center justify-center shrink-0 z-40">
          <div className="w-32 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
