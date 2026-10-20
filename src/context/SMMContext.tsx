import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { SMMService, BoostOrder, SocialPlatform, OrderStatus } from '../types';
import { smmClient, SMMConfigState } from '../services/smmApi';
import { DEFAULT_SERVICES } from '../data/mockServices';
import { useAuth } from './AuthContext';
import { 
  saveOrderToFirestore, 
  updateOrderInFirestore, 
  subscribeToUserOrders 
} from '../services/firebase';

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

  // 1. Subscribe to real Firestore orders when authenticated
  useEffect(() => {
    if (!user?.uid) {
      // If not logged in, load local cache
      const stored = smmClient.getStoredOrders();
      setOrders(stored);
      return;
    }

    // Real-time Firestore sync
    const unsubscribe = subscribeToUserOrders(user.uid, user.email, (liveOrders) => {
      setOrders(liveOrders);
    });

    return () => unsubscribe();
  }, [user?.uid, user?.email]);

  // 2. Load services from SMM engine
  useEffect(() => {
    setIsLoadingServices(true);
    smmClient.getServices().then((fetched) => {
      if (fetched && fetched.length > 0) {
        setServices(fetched);
      }
      setIsLoadingServices(false);
    });
  }, []);

  // 3. Live order tracking ticker
  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const simulateProgressTick = useCallback(async () => {
    if (!orders.length) return;

    for (const ord of orders) {
      if (ord.status === 'In progress' || ord.status === 'Processing' || ord.status === 'Pending') {
        if (ord.status === 'Pending') {
          await updateOrderInFirestore(ord.id, { status: 'In progress', updatedAt: new Date().toISOString() }).catch(() => {});
          continue;
        }

        if (ord.remains > 0) {
          const step = Math.max(5, Math.floor(ord.quantity * 0.09));
          const newRemains = Math.max(0, ord.remains - step);
          const isFinished = newRemains === 0;

          await updateOrderInFirestore(ord.id, {
            remains: newRemains,
            status: isFinished ? 'Completed' : 'In progress',
            updatedAt: new Date().toISOString(),
          }).catch(() => {});
        }
      }
    }
  }, [orders]);

  useEffect(() => {
    if (!autoRefresh) {
      if (autoRefreshIntervalRef.current) clearInterval(autoRefreshIntervalRef.current);
      return;
    }

    autoRefreshIntervalRef.current = setInterval(() => {
      simulateProgressTick();
    }, 4500);

    return () => {
      if (autoRefreshIntervalRef.current) clearInterval(autoRefreshIntervalRef.current);
    };
  }, [autoRefresh, simulateProgressTick]);

  // 4. Place boost order
  const placeOrder = async (
    serviceId: string | number,
    link: string,
    quantity: number
  ): Promise<{ success: boolean; order?: BoostOrder; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Please sign in with Google to submit boost orders.' };
    }

    const service = services.find((s) => String(s.service) === String(serviceId));
    if (!service) {
      return { success: false, error: 'Selected service not found in catalog.' };
    }

    const minQty = Number(service.min) || 10;
    const maxQty = Number(service.max) || 100000;

    if (quantity < minQty) {
      return { success: false, error: `Minimum quantity is ${minQty.toLocaleString()}` };
    }
    if (quantity > maxQty) {
      return { success: false, error: `Maximum quantity is ${maxQty.toLocaleString()}` };
    }

    const cost = isOwner ? 0.00 : Number(((parseFloat(service.rate) * quantity) / 1000).toFixed(4));

    // Deduct customer wallet balance in Firestore (Owner is $0.00 / Free)
    if (!isOwner) {
      const currentBalance = user?.balance ?? 0;
      if (currentBalance < cost) {
        return {
          success: false,
          error: `Insufficient balance ($${currentBalance.toFixed(2)}). Boost costs $${cost.toFixed(2)}. Please top up your wallet.`,
        };
      }
      const deducted = await deductBalance(cost);
      if (!deducted) {
        return { success: false, error: 'Wallet balance deduction failed.' };
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
        isOwner,
        user.uid,
        user.email
      );

      // Persist to real Firebase Firestore!
      await saveOrderToFirestore(newOrder);

      return { success: true, order: newOrder };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to submit order to SMM v2 engine' };
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // 5. Refresh single order status
  const refreshOrderStatus = async (orderId: string) => {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;

    const targetApiId = ord.apiOrderId || ord.id;
    const remoteUpdates = await smmClient.getOrderStatus(targetApiId);

    if (remoteUpdates && Object.keys(remoteUpdates).length > 0) {
      await updateOrderInFirestore(ord.id, remoteUpdates);
    }
  };

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
