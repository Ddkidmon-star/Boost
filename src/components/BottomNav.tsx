import React from 'react';
import { Rocket, ListOrdered, Layers, User } from 'lucide-react';
import { useSMM } from '../context/SMMContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, orders } = useSMM();

  // Count active / in progress orders for badge
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
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#090b13]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 pb-safe select-none">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-4 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-cyan-400 scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active glow pill */}
              {isActive && (
                <div className="absolute -top-1.5 w-7 h-1 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-cyan-500 text-[10px] font-bold text-black flex items-center justify-center shadow-md animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 font-medium tracking-tight ${isActive ? 'font-bold text-slate-100' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
