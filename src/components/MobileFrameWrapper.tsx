import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface MobileFrameWrapperProps {
  children: React.ReactNode;
  isMobileFrame: boolean;
}

export const MobileFrameWrapper: React.FC<MobileFrameWrapperProps> = ({ children, isMobileFrame }) => {
  if (!isMobileFrame) {
    return <div className="min-h-screen bg-slate-50 text-slate-900">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 py-4 sm:py-8 px-2 flex items-center justify-center">
      {/* Smartphone Device Frame */}
      <div className="w-full max-w-[430px] h-[890px] max-h-[95vh] bg-white border-[8px] border-slate-800 rounded-[52px] shadow-2xl overflow-hidden flex flex-col relative ring-1 ring-slate-700/50">
        {/* iOS Dynamic Island & Status Bar */}
        <div className="w-full h-11 bg-white px-7 flex items-center justify-between shrink-0 select-none z-40 border-b border-slate-100">
          <span className="text-[12px] font-bold text-slate-900 tracking-tight">9:41</span>
          
          {/* Dynamic Island Pill */}
          <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center gap-1.5 px-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-slate-700" />
          </div>

          <div className="flex items-center gap-1.5 text-slate-600">
            <Signal className="w-3 h-3 text-slate-600" />
            <Wifi className="w-3 h-3 text-slate-600" />
            <BatteryMedium className="w-4 h-4 text-slate-800" />
          </div>
        </div>

        {/* Mobile Viewport Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col bg-slate-50">
          {children}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="w-full h-5 bg-white flex items-center justify-center shrink-0 z-40 border-t border-slate-100">
          <div className="w-32 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};
