export type SocialPlatform = 
  | 'tiktok'
  | 'instagram'
  | 'youtube'
  | 'twitter'
  | 'facebook'
  | 'spotify'
  | 'telegram';

export interface SMMService {
  service: string | number; // e.g. "101", 101
  name: string;
  category: string;
  rate: string; // e.g. "1.25" per 1,000 units
  min: string | number;
  max: string | number;
  platform: SocialPlatform;
  type?: 'Default' | 'Custom Comments' | 'Package' | 'Subscriptions';
  dripfeed?: boolean;
  refill?: boolean;
  averageTime?: string;
  description?: string;
}

export type OrderStatus = 
  | 'Pending' 
  | 'In progress' 
  | 'Completed' 
  | 'Partial' 
  | 'Canceled' 
  | 'Processing';

export interface BoostOrder {
  id: string; // Internal order id
  apiOrderId?: string | number; // Remote SMM provider order id
  userId?: string;
  userEmail?: string;
  serviceId: string | number;
  serviceName: string;
  platform: SocialPlatform;
  link: string;
  quantity: number;
  charge: number; // 0.00 for Owner Preciousddkid@gmail.com
  status: OrderStatus;
  startCount: number;
  remains: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  rawApiResponse?: Record<string, unknown>;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isOwner: boolean; // Computed silently: email.toLowerCase() === 'preciousddkid@gmail.com'
  balance: number; // Regular users have numeric balance, owner has Infinity / $0 charges
  createdAt: string;
}

export interface SMMConfig {
  endpoint: string; // e.g., 'https://smm8.com/api/v2' or 'https://theowlet.com/api/v2'
  apiKey: string;
  useProxy: boolean;
}

export interface PlatformConfig {
  id: SocialPlatform;
  name: string;
  icon: string;
  color: string;
  badgeBg: string;
  placeholder: string;
  urlPatterns: RegExp[];
}
