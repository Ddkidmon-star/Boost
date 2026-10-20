import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SMMProvider, useSMM } from './context/SMMContext';
import { Header } from './components/Header';
import { OwletHeader } from './components/OwletHeader';
import { BottomNav } from './components/BottomNav';
import { OrderScreen } from './components/OrderScreen';
import { OwletOrderScreen } from './components/OwletOrderScreen';
import { OrdersScreen } from './components/OrdersScreen';
import { ServicesScreen } from './components/ServicesScreen';
import { OwletCatalogScreen } from './components/OwletCatalogScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { TopUpModal } from './components/TopUpModal';
import { AuthScreen } from './components/AuthScreen';
import { MobileFrameWrapper } from './components/MobileFrameWrapper';
import { DualPanelSwipeLayout } from './components/DualPanelSwipeLayout';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { activeTab } = useSMM();
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [activeScreenIndex, setActiveScreenIndex] = useState(0); // 0 = SMM8, 1 = The Owlet

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 p-[2px] animate-spin shadow-md">
          <div className="w-full h-full bg-white rounded-[14px]" />
        </div>
        <p className="text-xs text-slate-500 font-mono mt-4 font-bold">Synchronizing Boost Engine...</p>
      </div>
    );
  }

  // Mandatory Authentication Gate:
  if (!user) {
    return (
      <MobileFrameWrapper isMobileFrame={isMobileFrame}>
        <AuthScreen />
      </MobileFrameWrapper>
    );
  }

  // SCREEN 1: Default SMM8 Dashboard
  const screen1Content = (
    <div className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-red-500/15 selection:text-red-900">
      <main className="flex-1">
        {activeTab === 'order' && (
          <OrderScreen onOpenTopUp={() => setIsTopUpOpen(true)} />
        )}
        {activeTab === 'orders' && <OrdersScreen />}
        {activeTab === 'services' && <ServicesScreen />}
        {activeTab === 'profile' && (
          <ProfileScreen onOpenTopUp={() => setIsTopUpOpen(true)} />
        )}
      </main>
    </div>
  );

  // SCREEN 2: Dedicated dashboard for The Owlet
  const screen2Content = (
    <div className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500/15 selection:text-indigo-900">
      <main className="flex-1">
        {activeTab === 'order' && (
          <OwletOrderScreen onOpenTopUp={() => setIsTopUpOpen(true)} />
        )}
        {activeTab === 'orders' && <OrdersScreen />}
        {activeTab === 'services' && <OwletCatalogScreen />}
        {activeTab === 'profile' && (
          <ProfileScreen onOpenTopUp={() => setIsTopUpOpen(true)} />
        )}
      </main>
    </div>
  );

  // Authenticated Dual-Panel Dashboard
  return (
    <MobileFrameWrapper isMobileFrame={isMobileFrame}>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {/* Unified Top Header that syncs with current provider */}
        <Header
          provider={activeScreenIndex === 1 ? 'theowlet' : 'smm8'}
          onOpenTopUp={() => setIsTopUpOpen(true)}
          isMobileFrame={isMobileFrame}
          onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}
        />

        {/* Horizontal Swipe/Page Slider Layout */}
        <DualPanelSwipeLayout
          screen1={screen1Content}
          screen2={screen2Content}
          activeScreenIndex={activeScreenIndex}
          onScreenChange={setActiveScreenIndex}
        />

        {/* Bottom Tab Navigation: Pinned at bottom across both screens */}
        <BottomNav />

        {/* Wallet Deposit Modal (for regular customers) */}
        <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
      </div>
    </MobileFrameWrapper>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SMMProvider>
        <AppContent />
      </SMMProvider>
    </AuthProvider>
  );
}
