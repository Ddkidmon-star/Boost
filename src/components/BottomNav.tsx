import React from 'react';
import { Rocket, ListOrdered, Layers, User } from 'lucide-react';
import { useSMM } from '../context/SMMContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, orders } = useSMM();

  const activeOrdersCount = orders.filter(
    (o) => o.status === 'In progress' || o.status === 'Pending' || o.status === 'Processing'
  ).length;

  const tabs = [
    {
      id: 'order' as const,
      label: 'Boost',
      icon: Rocket,
    },
    {
      id: 'orders' as const,
      label: 'Orders',
      icon: ListOrdered,
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
    },
    {
      id: 'services' as const,
      label: 'Services',
      icon: Layers,
    },
    {
      id: 'profile' as const,
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#0e0612]/95 backdrop-blur-xl border-t border-pink-900/30 px-2 py-1.5 pb-safe select-none">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-4 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-pink-400 scale-105'
                  : 'text-pink-300/50 hover:text-pink-200'
              }`}
            >
              {/* Pink Active glow indicator */}
              {isActive && (
                <div className="absolute -top-1.5 w-8 h-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 shadow-[0_0_12px_#ec4899]" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'stroke-[2.4] text-pink-400' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-pink-500 text-[10px] font-bold text-white flex items-center justify-center shadow-lg shadow-pink-500/50 animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 font-medium tracking-tight ${isActive ? 'font-extrabold text-white' : 'text-pink-300/50'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
