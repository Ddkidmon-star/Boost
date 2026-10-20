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

  const filteredOrders = orders.filter((ord) => {
    if (filterStatus === 'active' && !(ord.status === 'In progress' || ord.status === 'Pending' || ord.status === 'Processing')) {
      return false;
    }
    if (filterStatus === 'completed' && ord.status !== 'Completed') {
      return false;
    }
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40 animate-pulse shadow-sm shadow-pink-500/20">
            <Activity className="w-3 h-3 text-pink-400" /> In Progress
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40">
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-950/40 text-pink-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-xl mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-pink-400" />
            <span>Orders & Live Tracking</span>
          </h2>
          <p className="text-xs text-pink-200/60">
            Real-time status updates via SMM v2 engine & Firestore sync
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Auto-Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={autoRefresh ? "Pause Live Progress" : "Resume Live Progress"}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 transition cursor-pointer ${
              autoRefresh 
                ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 shadow-sm shadow-pink-500/20' 
                : 'bg-[#15091c] text-pink-300/60 border-pink-900/30'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-pink-400 animate-ping' : 'bg-slate-500'}`} />
            <span>Live Auto</span>
          </button>

          <button
            onClick={handleRefreshAll}
            disabled={isRefreshingAll}
            className="p-2 rounded-xl bg-[#15091c] hover:bg-pink-900/30 border border-pink-900/40 text-pink-300 hover:text-white transition disabled:opacity-50 cursor-pointer"
            title="Refresh All Orders"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshingAll ? 'animate-spin text-pink-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search in Pink */}
      <div className="space-y-2">
        <div className="flex items-center gap-1 bg-[#14081b] p-1.5 rounded-2xl border border-pink-900/30 text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`flex-1 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              filterStatus === 'all' 
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/30' 
                : 'text-pink-300/60 hover:text-white'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`flex-1 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              filterStatus === 'active' 
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/30' 
                : 'text-pink-300/60 hover:text-white'
            }`}
          >
            Active ({orders.filter((o) => o.status === 'In progress' || o.status === 'Pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`flex-1 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              filterStatus === 'completed' 
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/30' 
                : 'text-pink-300/60 hover:text-white'
            }`}
          >
            Done ({orders.filter((o) => o.status === 'Completed').length})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-pink-400/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, link, or service name..."
            className="w-full bg-[#120718] border border-pink-900/40 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-pink-300/30 focus:outline-none focus:border-pink-500 shadow-inner"
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
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="py-14 px-4 text-center rounded-3xl bg-[#14081c]/60 border border-dashed border-pink-900/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-950/40 border border-pink-500/30 flex items-center justify-center mx-auto text-pink-400">
            <ListOrdered className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">No boost orders found</p>
            <p className="text-xs text-pink-300/60 mt-0.5">
              {searchQuery ? 'Try matching another query or clear filter' : 'Submit your first social media boost to start tracking!'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('order')}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-lg shadow-pink-500/30"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
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
                className="bg-[#15091c] border border-pink-500/20 hover:border-pink-500/40 rounded-3xl p-4 space-y-3 transition shadow-lg shadow-pink-950/20"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-pink-300 bg-pink-500/20 px-2.5 py-0.5 rounded-xl border border-pink-500/40 shadow-sm">
                      #{ord.apiOrderId || ord.id.replace('ord_', '')}
                    </span>
                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-400 border border-pink-500/20">
                      {platformConfig.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {getStatusBadge(ord.status)}
                    <button
                      onClick={() => handleRefreshSingle(ord)}
                      disabled={isSingleRefreshing}
                      className="p-1 rounded-xl text-pink-400 hover:text-white hover:bg-pink-900/30 transition cursor-pointer"
                      title="Poll status from SMM v2 engine"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSingleRefreshing ? 'animate-spin text-pink-400' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Service Name & Link */}
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white leading-tight">
                    {ord.serviceName}
                  </p>
                  <a
                    href={ord.link.startsWith('http') ? ord.link : `https://${ord.link}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-pink-400 hover:text-pink-300 flex items-center gap-1 truncate max-w-full font-bold"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">{ord.link}</span>
                  </a>
                </div>

                {/* Pink Progress Bar & Counters */}
                <div className="space-y-1.5 bg-[#1a0b22] p-3 rounded-2xl border border-pink-900/40 shadow-inner">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-pink-300/70">
                      Progress: <strong className="text-white font-mono">{delivered.toLocaleString()}</strong> / {ord.quantity.toLocaleString()}
                    </span>
                    <span className="font-mono font-extrabold text-pink-400">{progressPercent}%</span>
                  </div>

                  {/* Visual Bar in Hot Pink */}
                  <div className="w-full h-2.5 bg-pink-950/60 rounded-full overflow-hidden p-[1px]">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        ord.status === 'Completed'
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 shadow-[0_0_10px_#ec4899]'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-pink-300/70 font-mono pt-1">
                    <span>Start: {ord.startCount.toLocaleString()}</span>
                    <span>Remains: {ord.remains.toLocaleString()}</span>
                    <span>
                      Charge: <strong className="text-pink-400 font-bold">{isOwner ? '$0.00 / Free' : `$${ord.charge.toFixed(2)}`}</strong>
                    </span>
                  </div>
                </div>

                {/* Footer details row */}
                <div className="flex items-center justify-between text-[10px] text-pink-300/60 pt-1 border-t border-pink-900/30">
                  <span>Ordered {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <button
                    onClick={() => setSelectedOrderDetails(ord)}
                    className="text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#16081e] border-2 border-pink-500/40 rounded-3xl p-5 shadow-2xl space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-pink-400" />
                <h3 className="text-sm font-bold text-white">SMM v2 Payload Inspector</h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-pink-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-pink-200/70">
              Live SMM v2 engine protocol parameters for Order #{selectedOrderDetails.apiOrderId}
            </p>

            <div className="bg-[#0f0413] rounded-2xl p-3 border border-pink-900/40 text-[11px] font-mono text-pink-300 overflow-x-auto max-h-60">
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
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold transition shadow-md shadow-pink-500/30 cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
