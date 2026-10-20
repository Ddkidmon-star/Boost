import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Search, 
  ArrowUpRight,
  X,
  Rocket
} from 'lucide-react';
import { useSMM } from '../context/SMMContext';
import { useAuth } from '../context/AuthContext';
import { PLATFORMS } from '../data/mockServices';
import { SocialPlatform } from '../types';

export const ServicesScreen: React.FC = () => {
  const { services, setPreselectedServiceId, setActiveTab } = useSMM();
  const { isOwner } = useAuth();

  const [selectedFilterPlatform, setSelectedFilterPlatform] = useState<SocialPlatform | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return services.filter((srv) => {
      if (selectedFilterPlatform !== 'all' && srv.platform !== selectedFilterPlatform) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = srv.name.toLowerCase().includes(q);
        const matchCat = srv.category.toLowerCase().includes(q);
        const matchId = String(srv.service).includes(q);
        return matchName || matchCat || matchId;
      }
      return true;
    });
  }, [services, selectedFilterPlatform, searchQuery]);

  const handleSelectService = (serviceId: string | number) => {
    setPreselectedServiceId(serviceId);
    setActiveTab('order');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 pb-24 space-y-5">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-red-600" />
              <span>SMM Services Catalog</span>
            </h2>
            <p className="text-xs text-slate-500">
              Browse {services.length.toLocaleString()} verified services directly from smm8.com
            </p>
          </div>

          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl">
            {filtered.length.toLocaleString()} Shown
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, TikTok, Likes, Instagram, YouTube..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Platform Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <button
            onClick={() => setSelectedFilterPlatform('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
              selectedFilterPlatform === 'all'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            All Platforms
          </button>
          {PLATFORMS.map((p) => {
            const isSel = selectedFilterPlatform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedFilterPlatform(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                  isSel
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-3">
        {filtered.slice(0, 80).map((srv) => {
          const rateNum = parseFloat(srv.rate);
          return (
            <div
              key={srv.service}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-2 hover:border-red-300 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200">
                      #{srv.service}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 capitalize">
                      {srv.platform}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {srv.name}
                  </h4>
                </div>

                <div className="text-right shrink-0">
                  {isOwner ? (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      $0.00 FREE
                    </span>
                  ) : (
                    <span className="text-xs sm:text-sm font-black font-mono text-slate-900">
                      ${rateNum.toFixed(2)} / 1K
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span>Min: {Number(srv.min).toLocaleString()}</span>
                  <span>•</span>
                  <span>Max: {Number(srv.max).toLocaleString()}</span>
                </div>

                <button
                  onClick={() => handleSelectService(srv.service)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 font-bold text-xs transition cursor-pointer"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Boost With This</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length > 80 && (
          <div className="text-center py-4 text-xs text-slate-500 font-medium">
            Showing first 80 of {filtered.length.toLocaleString()} matching services. Refine your search above.
          </div>
        )}
      </div>
    </div>
  );
};
