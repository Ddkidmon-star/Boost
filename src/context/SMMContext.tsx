import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { SMMService, BoostOrder, SocialPlatform, OrderStatus } from '../types';
import { smmClient, SMMConfigState } from '../services/smmApi';
import { DEFAULT_SERVICES } from '../data/mockServices';
import { useAuth } from './AuthContext';

interface SMMContextType {
  services: SMMService[];
  orders: BoostOrder[];
  selectedPlatform: SocialPlatform;
  setSelectedPlatform: (p: SocialPlatform) => void;
  activeTab: 'order' | 'orders' | 'services' | 'profile';
  setActiveTab: (t: 'order' | 'orders' | 'services' | 'profile') => void;
  isLoadingServices: boolean;
  isSubmittingOrder: boolean;
  preselectedServiceId: string | number | null;
  setPreselectedServiceId: (id: string | number | null) => void;
  placeOrder: (serviceId: string | number, link: string, quantity: number) => Promise<{ success: boolean; order?: BoostOrder; error?: string }>;
  refreshOrderStatus: (orderId: string) => Promise<void>;
  refreshAllOrders: () => Promise<void>;
  config: SMMConfigState;
  updateConfig: (newConfig: Partial<SMMConfigState>) => void;
  autoRefresh: boolean;
  setAutoRefresh: (val: boolean) => void;
}

const SMMContext = createContext<SMMContextType | undefined>(undefined);

export const SMMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isOwner, deductBalance } = useAuth();
  const [services, setServices] = useState<SMMService[]>(DEFAULT_SERVICES);
  const [orders, setOrders] = useState<BoostOrder[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('tiktok');
  const [activeTab, setActiveTab] = useState<'order' | 'orders' | 'services' | 'profile'>('order');
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | number | null>(null);
  const [config, setConfig] = useState<SMMConfigState>(smmClient.getConfig());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load initial services and stored orders
  useEffect(() => {
    const initialOrders = smmClient.getStoredOrders();
    if (initialOrders.length === 0) {
      // Seed a couple of realistic demo orders so the orders tab is immediately informative
      const seedOrders: BoostOrder[] = [
        {
          id: 'ord_sample_1',
          apiOrderId: 819204,
          serviceId: 101,
          serviceName: 'TikTok Followers [Instant - Real Looking - 30 Days Refill]',
          platform: 'tiktok',
          link: 'https://www.tiktok.com/@growth_creator',
          quantity: 2500,
          charge: isOwner ? 0.00 : 7.00,
          status: 'In progress',
          startCount: 4120,
          remains: 680,
          currency: 'USD',
          createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'ord_sample_2',
          apiOrderId: 819098,
          serviceId: 202,
          serviceName: 'Instagram Likes [Reels & Posts - Instant High Speed]',
          platform: 'instagram',
          link: 'https://instagram.com/p/C482js98Lp',
          quantity: 1000,
          charge: isOwner ? 0.00 : 0.65,
          status: 'Completed',
          startCount: 120,
          remains: 0,
          currency: 'USD',
          createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
        }
      ];
      setOrders(seedOrders);
      seedOrders.forEach((o) => smmClient.saveOrderToStorage(o));
    } else {
      setOrders(initialOrders);
    }

    // Load services from API/Catalog
    setIsLoadingServices(true);
    smmClient.getServices().then((fetched) => {
      if (fetched && fetched.length > 0) {
        setServices(fetched);
      }
      setIsLoadingServices(false);
    });
  }, [isOwner]);

  // Periodic simulated progress engine for active orders
  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const simulateProgressTick = useCallback(() => {
    setOrders((prevOrders) => {
      let hasChanges = false;
      const updated = prevOrders.map((ord) => {
        if (ord.status === 'In progress' || ord.status === 'Processing' || ord.status === 'Pending') {
          // If status was Pending, switch to In Progress
          if (ord.status === 'Pending') {
            hasChanges = true;
            return { ...ord, status: 'In progress' as OrderStatus, updatedAt: new Date().toISOString() };
          }

          // Advance remains towards 0
          if (ord.remains > 0) {
            hasChanges = true;
            const step = Math.max(1, Math.floor(ord.quantity * 0.08));
            const newRemains = Math.max(0, ord.remains - step);
            const isFinished = newRemains === 0;

            return {
              ...ord,
              remains: newRemains,
              status: (isFinished ? 'Completed' : 'In progress') as OrderStatus,
              updatedAt: new Date().toISOString(),
            };
          }
        }
        return ord;
      });

      if (hasChanges) {
        try {
          localStorage.setItem('smm_boost_orders', JSON.stringify(updated));
        } catch {
          // Ignore
        }
      }
      return updated;
    });
  }, []);

  useEffect(() => {
    if (!autoRefresh) {
      if (autoRefreshIntervalRef.current) clearInterval(autoRefreshIntervalRef.current);
      return;
    }

    autoRefreshIntervalRef.current = setInterval(() => {
      simulateProgressTick();
    }, 4000); // Progress tick every 4 seconds for lively interactive UX

    return () => {
      if (autoRefreshIntervalRef.current) clearInterval(autoRefreshIntervalRef.current);
    };
  }, [autoRefresh, simulateProgressTick]);

  // Place boost order
  const placeOrder = async (
    serviceId: string | number,
    link: string,
    quantity: number
  ): Promise<{ success: boolean; order?: BoostOrder; error?: string }> => {
    const service = services.find((s) => String(s.service) === String(serviceId));
    if (!service) {
      return { success: false, error: 'Selected service not found' };
    }

    const minQty = Number(service.min) || 10;
    const maxQty = Number(service.max) || 100000;

    if (quantity < minQty) {
      return { success: false, error: `Minimum quantity for this service is ${minQty.toLocaleString()}` };
    }
    if (quantity > maxQty) {
      return { success: false, error: `Maximum quantity for this service is ${maxQty.toLocaleString()}` };
    }

    // Cost logic
    const cost = isOwner ? 0.00 : Number(((parseFloat(service.rate) * quantity) / 1000).toFixed(4));

    // For regular users, check and deduct wallet balance
    if (!isOwner) {
      const currentBalance = user?.balance ?? 0;
      if (currentBalance < cost) {
        return {
          success: false,
          error: `Insufficient wallet balance ($${currentBalance.toFixed(2)}). Boost costs $${cost.toFixed(2)}. Please top up your wallet.`,
        };
      }
      const deducted = deductBalance(cost);
      if (!deducted) {
        return { success: false, error: 'Payment deduction failed' };
      }
    }

    setIsSubmittingOrder(true);
    try {
      const newOrder = await smmClient.placeOrder(
        service.service,
        link,
        quantity,
        service.platform,
        service.name,
        service.rate,
        isOwner
      );

      setOrders((prev) => [newOrder, ...prev]);
      return { success: true, order: newOrder };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to submit boost order to SMM engine' };
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Refresh single order status
  const refreshOrderStatus = async (orderId: string) => {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;

    const targetApiId = ord.apiOrderId || ord.id;
    const remoteUpdates = await smmClient.getOrderStatus(targetApiId);

    if (remoteUpdates && Object.keys(remoteUpdates).length > 0) {
      const updated = smmClient.updateStoredOrder(ord.id, remoteUpdates);
      setOrders(updated);
    }
  };

  // Refresh all orders
  const refreshAllOrders = async () => {
    for (const ord of orders) {
      if (ord.status === 'In progress' || ord.status === 'Pending') {
        await refreshOrderStatus(ord.id);
      }
    }
  };

  const updateConfig = (newCfg: Partial<SMMConfigState>) => {
    const updated = smmClient.saveConfig(newCfg);
    setConfig(updated);
    // Reload services if endpoint or key changed
    smmClient.getServices().then((fetched) => {
      if (fetched && fetched.length > 0) setServices(fetched);
    });
  };

  return (
    <SMMContext.Provider
      value={{
        services,
        orders,
        selectedPlatform,
        setSelectedPlatform,
        activeTab,
        setActiveTab,
        isLoadingServices,
        isSubmittingOrder,
        preselectedServiceId,
        setPreselectedServiceId,
        placeOrder,
        refreshOrderStatus,
        refreshAllOrders,
        config,
        updateConfig,
        autoRefresh,
        setAutoRefresh,
      }}
    >
      {children}
    </SMMContext.Provider>
  );
};

export const useSMM = () => {
  const context = useContext(SMMContext);
  if (!context) {
    throw new Error('useSMM must be used within an SMMProvider');
  }
  return context;
};
