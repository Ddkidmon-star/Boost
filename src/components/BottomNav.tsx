import React from 'react';
import { Rocket, Activity, Layers, UserCircle2 } from 'lucide-react';
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
      label: 'Activity',
      icon: Activity,
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
    },
    {
      id: 'services' as const,
      label: 'Catalog',
      icon: Layers,
    },
    {
      id: 'profile' as const,
      label: 'Account',
      icon: UserCircle2,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-2 pb-safe select-none shadow-lg">
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
                  ? 'text-red-600 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {/* Subtle top indicator bar */}
              {isActive && (
                <div className="absolute -top-2 w-8 h-1 rounded-full bg-red-600 shadow-xs shadow-red-500/50" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'stroke-[2.5] text-red-600' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 tracking-tight ${
                isActive ? 'font-bold text-slate-900' : 'font-medium text-slate-500'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
