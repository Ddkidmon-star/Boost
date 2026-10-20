import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Search, 
  Zap, 
  Clock, 
  ShieldCheck, 
  RotateCcw, 
  ArrowUpRight,
  Sparkles,
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

  // Filtered services
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
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <span>Services Catalog</span>
        </h2>
        <p className="text-xs text-slate-400">
          Verified high-speed services from SMM v2 engine (<code className="text-cyan-400">action=services</code>)
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by ID, followers, views, likes, comments..."
          className="w-full bg-[#0d101a] border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Platform Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedFilterPlatform('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            selectedFilterPlatform === 'all'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
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
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedFilterPlatform === platform.id
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
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
          <div className="py-12 text-center text-slate-500 text-xs">
            No services match your search criteria.
          </div>
        ) : (
          filtered.map((service) => {
            const platformConfig = PLATFORMS.find((p) => p.id === service.platform) || PLATFORMS[0];

            return (
              <div
                key={service.service}
                className="bg-[#0e111c] border border-slate-800/90 hover:border-slate-700 rounded-2xl p-3.5 space-y-2.5 transition shadow-md"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                      ID #{service.service}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${platformConfig.badgeBg}`}>
                      {platformConfig.name}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold font-mono text-cyan-300">
                      {isOwner ? 'FREE / $0.00' : `$${service.rate} / 1k`}
                    </span>
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-xs font-bold text-white leading-tight">
                  {service.name}
                </h3>

                {/* Specs / Badges */}
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono flex-wrap">
                  <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    Min: {Number(service.min).toLocaleString()}
                  </span>
                  <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    Max: {Number(service.max).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-cyan-400/90">
                    <Clock className="w-3 h-3" />
                    <span>{service.averageTime || 'Instant'}</span>
                  </span>
                  {service.refill && (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <RotateCcw className="w-3 h-3" />
                      <span>Refill Guaranteed</span>
                    </span>
                  )}
                </div>

                {/* Bottom action */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">
                    {service.category}
                  </span>

                  <button
                    onClick={() => handleSelectService(service.service)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
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
