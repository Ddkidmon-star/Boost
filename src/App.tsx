import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SMMProvider, useSMM } from './context/SMMContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OrderScreen } from './components/OrderScreen';
import { OrdersScreen } from './components/OrdersScreen';
import { ServicesScreen } from './components/ServicesScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { TopUpModal } from './components/TopUpModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { LoginModal } from './components/LoginModal';
import { MobileFrameWrapper } from './components/MobileFrameWrapper';

const AppContent: React.FC = () => {
  const { activeTab } = useSMM();
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  return (
    <MobileFrameWrapper isMobileFrame={isMobileFrame}>
      <div className="min-h-screen flex flex-col bg-[#090a0f]">
        {/* Header */}
        <Header
          onOpenTopUp={() => setIsTopUpOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          isMobileFrame={isMobileFrame}
          onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}
        />

        {/* Main Content Area */}
        <main className="flex-1">
          {activeTab === 'order' && (
            <OrderScreen onOpenTopUp={() => setIsTopUpOpen(true)} />
          )}
          {activeTab === 'orders' && <OrdersScreen />}
          {activeTab === 'services' && <ServicesScreen />}
          {activeTab === 'profile' && (
            <ProfileScreen
              onOpenTopUp={() => setIsTopUpOpen(true)}
              onOpenApiSettings={() => setIsApiSettingsOpen(true)}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          )}
        </main>

        {/* Bottom Tab Navigation */}
        <BottomNav />

        {/* Modals */}
        <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
        <ApiSettingsModal isOpen={isApiSettingsOpen} onClose={() => setIsApiSettingsOpen(false)} />
        <LoginModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
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
