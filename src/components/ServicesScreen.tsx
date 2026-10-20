import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Search, 
  Clock, 
  RotateCcw, 
  ArrowUpRight,
  X
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
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-xl mx-auto space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-pink-400" />
          <span>Services Catalog</span>
        </h2>
        <p className="text-xs text-pink-200/60">
          Verified SMM Panel v2 services from API provider (<code className="text-pink-400">action=services</code>)
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-pink-400/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by ID, followers, views, likes, comments..."
          className="w-full bg-[#120718] border border-pink-900/40 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-pink-300/30 focus:outline-none focus:border-pink-500 shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-pink-400/60 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Platform Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedFilterPlatform('all')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            selectedFilterPlatform === 'all'
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/30'
              : 'bg-[#15091c] text-pink-300/60 hover:text-white border border-pink-900/30'
          }`}
        >
          All ({services.length})
        </button>
        {PLATFORMS.map((platform) => {
          const count = services.filter((s) => s.platform === platform.id).length;
          return (
            <button
              key={platform.id}
              onClick={() => setSelectedFilterPlatform(platform.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedFilterPlatform === platform.id
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/30'
                  : 'bg-[#15091c] text-pink-300/60 hover:text-white border border-pink-900/30'
              }`}
            >
              {platform.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Services List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-pink-300/60 text-xs">
            No services match your search criteria.
          </div>
        ) : (
          filtered.map((service) => {
            const platformConfig = PLATFORMS.find((p) => p.id === service.platform) || PLATFORMS[0];

            return (
              <div
                key={service.service}
                className="bg-[#15091c] border border-pink-500/20 hover:border-pink-500/40 rounded-3xl p-4 space-y-2.5 transition shadow-lg shadow-pink-950/20"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-pink-300 bg-pink-500/20 px-2.5 py-0.5 rounded-xl border border-pink-500/40 shadow-sm">
                      ID #{service.service}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-400 border border-pink-500/20">
                      {platformConfig.name}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black font-mono text-pink-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]">
                      {isOwner ? 'FREE / $0.00' : `$${service.rate} / 1k`}
                    </span>
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-xs font-bold text-white leading-tight">
                  {service.name}
                </h3>

                {/* Specs */}
                <div className="flex items-center gap-2.5 text-[11px] text-pink-300/70 font-mono flex-wrap">
                  <span className="bg-[#1c0b24] px-2 py-0.5 rounded-lg border border-pink-900/40">
                    Min: {Number(service.min).toLocaleString()}
                  </span>
                  <span className="bg-[#1c0b24] px-2 py-0.5 rounded-lg border border-pink-900/40">
                    Max: {Number(service.max).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-pink-400">
                    <Clock className="w-3 h-3" />
                    <span>{service.averageTime || 'Instant'}</span>
                  </span>
                  {service.refill && (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <RotateCcw className="w-3 h-3" />
                      <span>Refill</span>
                    </span>
                  )}
                </div>

                {/* Bottom action */}
                <div className="flex items-center justify-between pt-2 border-t border-pink-900/30">
                  <span className="text-[10px] text-pink-300/60 font-medium truncate max-w-[200px]">
                    {service.category}
                  </span>

                  <button
                    onClick={() => handleSelectService(service.service)}
                    className="px-3.5 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 hover:text-white border border-pink-500/40 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Boost Now</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
