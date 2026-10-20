import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Layers } from 'lucide-react';

interface DualPanelSwipeLayoutProps {
  screen1: React.ReactNode;
  screen2: React.ReactNode;
  activeScreenIndex: number;
  onScreenChange: (index: number) => void;
}

export const DualPanelSwipeLayout: React.FC<DualPanelSwipeLayoutProps> = ({
  screen1,
  screen2,
  activeScreenIndex,
  onScreenChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const touchCurrentXRef = useRef<number>(0);
  const isSwipingHorizontalRef = useRef<boolean | null>(null);

  // Touch Handlers for horizontal swipe detection
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    touchCurrentXRef.current = e.touches[0].clientX;
    isSwipingHorizontalRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    touchCurrentXRef.current = currentX;

    const diffX = Math.abs(currentX - touchStartXRef.current);
    const diffY = Math.abs(currentY - touchStartYRef.current);

    if (isSwipingHorizontalRef.current === null && (diffX > 8 || diffY > 8)) {
      isSwipingHorizontalRef.current = diffX > diffY;
    }
  };

  const handleTouchEnd = () => {
    if (isSwipingHorizontalRef.current) {
      const deltaX = touchCurrentXRef.current - touchStartXRef.current;
      const SWIPE_THRESHOLD = 45; // pixels to trigger swipe

      if (deltaX < -SWIPE_THRESHOLD && activeScreenIndex === 0) {
        // Swiped right-to-left: move to Screen 2 (The Owlet)
        onScreenChange(1);
      } else if (deltaX > SWIPE_THRESHOLD && activeScreenIndex === 1) {
        // Swiped left-to-right: move to Screen 1 (SMM8)
        onScreenChange(0);
      }
    }
    isSwipingHorizontalRef.current = null;
  };

  // Mouse Drag Support for desktop phone wrapper
  const isMouseDownRef = useRef<boolean>(false);
  const mouseStartXRef = useRef<number>(0);
  const mouseCurrentXRef = useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag when clicking near header / indicator / non-interactive areas
    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, a, select, [data-no-swipe]')) return;
    isMouseDownRef.current = true;
    mouseStartXRef.current = e.clientX;
    mouseCurrentXRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    mouseCurrentXRef.current = e.clientX;
  };

  const handleMouseUp = () => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    const deltaX = mouseCurrentXRef.current - mouseStartXRef.current;
    if (deltaX < -50 && activeScreenIndex === 0) {
      onScreenChange(1);
    } else if (deltaX > 50 && activeScreenIndex === 1) {
      onScreenChange(0);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative overflow-x-hidden">
      {/* PAGE INDICATORS & SWIPE CONTROLS NEAR TOP (Cleanly positioned below header) */}
      <div className="sticky top-[52px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 py-1.5 select-none shadow-2xs">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => onScreenChange(0)}
            disabled={activeScreenIndex === 0}
            className={`p-1.5 rounded-xl transition cursor-pointer active:scale-95 ${
              activeScreenIndex === 0
                ? 'text-slate-300 opacity-30 cursor-default'
                : 'text-slate-600 hover:text-red-600 hover:bg-slate-100'
            }`}
            title="Switch to SMM8 Provider"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Swipe Indicator Dots & Provider Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 border border-slate-200/90 shadow-inner">
            {/* Dot 1: SMM8 Panel */}
            <button
              type="button"
              onClick={() => onScreenChange(0)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer ${
                activeScreenIndex === 0
                  ? 'bg-white text-red-600 shadow-sm shadow-red-500/10 scale-102 ring-1 ring-red-500/20'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  activeScreenIndex === 0 ? 'bg-red-600 animate-pulse' : 'bg-slate-300'
                }`}
              />
              <span>SMM8</span>
              <span className="hidden sm:inline text-[10px] font-mono text-slate-400 font-normal">
                (smm8.com)
              </span>
            </button>

            {/* Dot 2: The Owlet */}
            <button
              type="button"
              onClick={() => onScreenChange(1)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer ${
                activeScreenIndex === 1
                  ? 'bg-white text-indigo-600 shadow-sm shadow-indigo-500/10 scale-102 ring-1 ring-indigo-500/20'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  activeScreenIndex === 1 ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'
                }`}
              />
              <span>The Owlet</span>
              <span className="hidden sm:inline text-[10px] font-mono text-slate-400 font-normal">
                (theowlet.com)
              </span>
            </button>
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => onScreenChange(1)}
            disabled={activeScreenIndex === 1}
            className={`p-1 rounded-xl transition cursor-pointer ${
              activeScreenIndex === 1
                ? 'text-slate-300 opacity-40 cursor-default'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
            }`}
            title="Switch to The Owlet Provider"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Subtle swipe hint text */}
        <div className="flex items-center justify-center gap-1 mt-1 text-[10px] font-medium text-slate-600">
          <span>{activeScreenIndex === 0 ? 'Swipe left for The Owlet 👉' : '👈 Swipe right for SMM8'}</span>
        </div>
      </div>

      {/* HORIZONTAL SWIPE CONTAINER */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="w-full flex-1 flex transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: `translateX(-${activeScreenIndex * 100}%)`,
        }}
      >
        {/* SCREEN 1: SMM8 DASHBOARD (Kept untouched) */}
        <div className="w-full min-w-full shrink-0 flex flex-col">
          {screen1}
        </div>

        {/* SCREEN 2: THE OWLET DASHBOARD */}
        <div className="w-full min-w-full shrink-0 flex flex-col">
          {screen2}
        </div>
      </div>
    </div>
  );
};
