import React, { useState } from 'react';
import { 
  Activity, 
  RefreshCw, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Code2, 
  X,
  RotateCcw,
  Rocket
} from 'lucide-react';
import { useSMM } from '../context/SMMContext';
import { useAuth } from '../context/AuthContext';
import { BoostOrder, OrderStatus } from '../types';

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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'In progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 shadow-xs animate-pulse">
            <Activity className="w-3 h-3 text-red-600" /> In Progress
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <RotateCcw className="w-3 h-3" /> Processing
          </span>
        );
      case 'Canceled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <AlertCircle className="w-3 h-3" /> Canceled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 pb-24 space-y-5">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-600" />
              <span>Real-Time Activity & Orders</span>
            </h2>
            <p className="text-xs text-slate-500">Live order status from SMM v2 engine</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshAll}
              disabled={isRefreshingAll}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="Refresh all order statuses"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshingAll ? 'animate-spin text-red-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <div className="flex bg-slate-100 p-1 rounded-2xl shrink-0">
            {(['all', 'active', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition capitalize cursor-pointer ${
                  filterStatus === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID, link, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Rocket className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No Boost Orders Found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              You haven't submitted any orders matching this filter yet. Choose a service and launch a boost!
            </p>
            <button
              onClick={() => setActiveTab('order')}
              className="mt-2 py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              Start New Boost
            </button>
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const progress = ord.quantity > 0 
              ? Math.min(100, Math.round(((ord.quantity - ord.remains) / ord.quantity) * 100))
              : 100;
            const isRefreshing = refreshingId === ord.id;

            return (
              <div
                key={ord.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200">
                        #{ord.apiOrderId || ord.id.slice(-6)}
                      </span>
                      {getStatusBadge(ord.status)}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1 pt-0.5">
                      {ord.serviceName}
                    </h4>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold font-mono text-slate-900 block">
                      {ord.quantity.toLocaleString()} units
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {isOwner ? 'Owner Free' : `$${ord.charge.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                {/* Target Link */}
                <div className="flex items-center justify-between text-xs bg-slate-50 rounded-xl px-3 py-2 border border-slate-200/70">
                  <span className="text-slate-600 truncate max-w-[280px] font-mono text-[11px]">
                    {ord.link}
                  </span>
                  <a
                    href={ord.link.startsWith('http') ? ord.link : `https://${ord.link}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-red-600 transition ml-2 shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>Delivered: {(ord.quantity - ord.remains).toLocaleString()}</span>
                    <span>Remains: {ord.remains.toLocaleString()} ({progress}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-rose-600 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-400">
                  <span>{new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOrderDetails(ord)}
                      className="flex items-center gap-1 text-slate-600 hover:text-red-600 font-bold transition cursor-pointer"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                    <button
                      onClick={() => handleRefreshSingle(ord)}
                      disabled={isRefreshing}
                      className="flex items-center gap-1 text-slate-600 hover:text-red-600 font-bold transition cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
                      <span>Check</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* RAW API ORDER DETAILS MODAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-red-600" />
                <h3 className="text-sm font-bold text-slate-900">SMM v2 Order Inspector</h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 font-mono text-xs space-y-2 text-slate-700">
              <div><strong>Internal ID:</strong> {selectedOrderDetails.id}</div>
              <div><strong>Remote SMM ID:</strong> #{selectedOrderDetails.apiOrderId || 'Pending'}</div>
              <div><strong>Service:</strong> {selectedOrderDetails.serviceName}</div>
              <div><strong>Platform:</strong> {selectedOrderDetails.platform.toUpperCase()}</div>
              <div><strong>Link:</strong> {selectedOrderDetails.link}</div>
              <div><strong>Quantity:</strong> {selectedOrderDetails.quantity}</div>
              <div><strong>Charge:</strong> {isOwner ? '$0.00 (Owner Free)' : `$${selectedOrderDetails.charge.toFixed(2)}`}</div>
              <div><strong>Status:</strong> {selectedOrderDetails.status}</div>
              <div><strong>Created:</strong> {new Date(selectedOrderDetails.createdAt).toLocaleString()}</div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-500 mb-1">Raw API Payload / Response:</p>
              <pre className="p-3 bg-slate-950 text-emerald-400 rounded-xl text-[10px] overflow-x-auto font-mono">
                {JSON.stringify(selectedOrderDetails.rawApiResponse || { status: selectedOrderDetails.status, remains: selectedOrderDetails.remains }, null, 2)}
              </pre>
            </div>

            <button
              onClick={() => setSelectedOrderDetails(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
