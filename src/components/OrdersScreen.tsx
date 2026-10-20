import React, { useState } from 'react';
import { 
  ListOrdered, 
  RefreshCw, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Activity, 
  Code2, 
  X,
  Play,
  RotateCcw
} from 'lucide-react';
import { useSMM } from '../context/SMMContext';
import { useAuth } from '../context/AuthContext';
import { BoostOrder, OrderStatus } from '../types';
import { PLATFORMS } from '../data/mockServices';

export const OrdersScreen: React.FC = () => {
  const { orders, refreshOrderStatus, refreshAllOrders, autoRefresh, setAutoRefresh, setActiveTab } = useSMM();
  const { isOwner } = useAuth();

  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<BoostOrder | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    // Status filter
    if (filterStatus === 'active' && !(ord.status === 'In progress' || ord.status === 'Pending' || ord.status === 'Processing')) {
      return false;
    }
    if (filterStatus === 'completed' && ord.status !== 'Completed') {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = String(ord.apiOrderId || ord.id).toLowerCase().includes(q);
      const matchLink = ord.link.toLowerCase().includes(q);
      const matchService = ord.serviceName.toLowerCase().includes(q);
      return matchId || matchLink || matchService;
    }
    return true;
  });

  const handleRefreshSingle = async (ord: BoostOrder) => {
    setRefreshingId(ord.id);
    await refreshOrderStatus(ord.id);
    setTimeout(() => setRefreshingId(null), 600);
  };

  const handleRefreshAll = async () => {
    setIsRefreshingAll(true);
    await refreshAllOrders();
    setTimeout(() => setIsRefreshingAll(false), 800);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'In progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 animate-pulse">
            <Activity className="w-3 h-3" /> In Progress
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <RotateCcw className="w-3 h-3" /> Processing
          </span>
        );
      case 'Canceled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3 h-3" /> Canceled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-xl mx-auto space-y-4">
      {/* Top Header & Refresh Actions */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-cyan-400" />
            <span>Orders & Live Tracking</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time status updates via SMM v2 <code className="text-cyan-400">action=status</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Auto-Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={autoRefresh ? "Pause Live Progress" : "Resume Live Progress"}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium border flex items-center gap-1.5 transition ${
              autoRefresh 
                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' 
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'}`} />
            <span>Live Auto</span>
          </button>

          <button
            onClick={handleRefreshAll}
            disabled={isRefreshingAll}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition disabled:opacity-50"
            title="Refresh All Orders"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshingAll ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                filterStatus === 'all' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                filterStatus === 'active' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Active ({orders.filter((o) => o.status === 'In progress' || o.status === 'Pending').length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                filterStatus === 'completed' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Completed ({orders.filter((o) => o.status === 'Completed').length})
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, service, or target link..."
            className="w-full bg-[#0d101a] border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
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
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
            <ListOrdered className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-300">No boost orders found</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {searchQuery ? 'Try matching another query or clear filter' : 'Submit your first social media boost to start tracking!'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('order')}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>New Boost Order</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((ord) => {
            const delivered = ord.quantity - ord.remains;
            const progressPercent = Math.min(100, Math.max(0, Math.round((delivered / ord.quantity) * 100)));
            const platformConfig = PLATFORMS.find((p) => p.id === ord.platform) || PLATFORMS[0];
            const isSingleRefreshing = refreshingId === ord.id;

            return (
              <div
                key={ord.id}
                className="bg-[#0e111c] border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 space-y-3 transition shadow-lg"
              >
                {/* Header row: ID, Platform badge, Status, and Refresh */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                      #{ord.apiOrderId || ord.id.replace('ord_', '')}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${platformConfig.badgeBg}`}>
                      {platformConfig.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {getStatusBadge(ord.status)}
                    <button
                      onClick={() => handleRefreshSingle(ord)}
                      disabled={isSingleRefreshing}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Poll status from SMM v2 engine"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSingleRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Service Name & Link */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white leading-tight">
                    {ord.serviceName}
                  </p>
                  <a
                    href={ord.link.startsWith('http') ? ord.link : `https://${ord.link}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-cyan-400/90 hover:text-cyan-300 flex items-center gap-1 truncate max-w-full"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">{ord.link}</span>
                  </a>
                </div>

                {/* Progress Bar & Counters */}
                <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      Progress: <strong className="text-white font-mono">{delivered.toLocaleString()}</strong> / {ord.quantity.toLocaleString()}
                    </span>
                    <span className="font-mono font-bold text-cyan-400">{progressPercent}%</span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        ord.status === 'Completed'
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-cyan-400 to-indigo-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                    <span>Start: {ord.startCount.toLocaleString()}</span>
                    <span>Remains: {ord.remains.toLocaleString()}</span>
                    <span>
                      Charge: <strong className="text-emerald-400">{isOwner ? '$0.00 / Free' : `$${ord.charge.toFixed(2)}`}</strong>
                    </span>
                  </div>
                </div>

                {/* Footer details row */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>Ordered {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <button
                    onClick={() => setSelectedOrderDetails(ord)}
                    className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition cursor-pointer"
                  >
                    <Code2 className="w-3 h-3" />
                    <span>View SMM Raw Payload</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Raw SMM v2 JSON Inspector Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#101322] border border-cyan-500/30 rounded-2xl p-5 shadow-2xl space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">SMM Engine Payload Inspection</h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Live SMM v2 API protocol response parameters for Order #{selectedOrderDetails.apiOrderId}
            </p>

            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-60">
              <pre>
                {JSON.stringify(
                  {
                    order: selectedOrderDetails.apiOrderId,
                    charge: isOwner ? '0.0000' : selectedOrderDetails.charge.toFixed(4),
                    start_count: String(selectedOrderDetails.startCount),
                    status: selectedOrderDetails.status,
                    remains: String(selectedOrderDetails.remains),
                    currency: 'USD',
                    service: selectedOrderDetails.serviceId,
                    link: selectedOrderDetails.link,
                    quantity: selectedOrderDetails.quantity,
                    created_at: selectedOrderDetails.createdAt,
                    engine_sync: 'POST https://smm8.com/api/v2 (action=status)'
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <button
              onClick={() => setSelectedOrderDetails(null)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
