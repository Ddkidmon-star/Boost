import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Search, Clock, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSMM } from '../context/SMMContext';
import { PLATFORMS } from '../data/mockServices';
import { owletClient, DEFAULT_OWLET_SERVICES } from '../services/owletApi';
import { SMMService, SocialPlatform } from '../types';

interface OwletCatalogScreenProps {
  onSelectService?: (service: SMMService) => void;
}

export const OwletCatalogScreen: React.FC<OwletCatalogScreenProps> = ({ onSelectService }) => {
  const { isOwner } = useAuth();
  const { setActiveTab } = useSMM();
  const [services, setServices] = useState<SMMService[]>(DEFAULT_OWLET_SERVICES);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    owletClient.getServices().then((data) => {
      if (data && data.length > 0) setServices(data);
      setIsLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const matchPlatform = selectedPlatform === 'all' || s.platform === selectedPlatform;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
      return matchPlatform && matchSearch;
    });
  }, [services, selectedPlatform, searchQuery]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 pb-28 space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span>The Owlet Service Catalog</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
              theowlet.com
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            {services.length} high-velocity viral services available via The Owlet API
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Owlet packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>

      {/* Platform Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedPlatform('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 ${
            selectedPlatform === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All ({services.length})
        </button>
        {PLATFORMS.map((p) => {
          const count = services.filter((s) => s.platform === p.id).length;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPlatform(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 whitespace-nowrap ${
                selectedPlatform === p.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {p.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Service List */}
      <div className="space-y-2">
        {filtered.map((item) => (
          <div
            key={item.service}
            className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                  #{item.service}
                </span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {item.category}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span>Min: {Number(item.min).toLocaleString()}</span>
                <span>•</span>
                <span>Max: {Number(item.max).toLocaleString()}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-indigo-600 font-medium">
                  <Clock className="w-3 h-3" />
                  <span>{item.averageTime || '10-30 min'}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono">Rate per 1k</span>
                <span className="text-xs font-black font-mono text-indigo-600">
                  {isOwner ? '$0.00 / Free' : `$${item.rate}`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onSelectService) onSelectService(item);
                  setActiveTab('order');
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer active:scale-95"
              >
                Boost Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
