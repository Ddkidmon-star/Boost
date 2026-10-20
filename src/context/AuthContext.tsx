import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { 
  isOwnerEmail, 
  loginWithGoogleRedirect, 
  logoutUser, 
  subscribeToAuth, 
  checkRedirectAuth, 
  OWNER_EMAIL 
} from '../services/firebase';

interface AuthContextType {
  user: UserProfile | null;
  isOwner: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsOwnerDemo: () => void;
  loginAsCustomerDemo: (email?: string, name?: string) => void;
  logout: () => Promise<void>;
  topUpWallet: (amount: number) => void;
  deductBalance: (amount: number) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'smm_boost_current_user';
const STORAGE_KEY_WALLET_PREFIX = 'smm_wallet_balance_';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to load wallet balance for non-owner
  const getWalletBalance = (email: string): number => {
    if (isOwnerEmail(email)) return Infinity;
    const saved = localStorage.getItem(`${STORAGE_KEY_WALLET_PREFIX}${email.toLowerCase()}`);
    return saved !== null ? parseFloat(saved) : 25.00; // Default $25 for new test accounts
  };

  const saveWalletBalance = (email: string, balance: number) => {
    if (isOwnerEmail(email)) return;
    localStorage.setItem(`${STORAGE_KEY_WALLET_PREFIX}${email.toLowerCase()}`, balance.toFixed(2));
  };

  // Build profile object with silent owner classification
  const buildUserProfile = (email: string, displayName?: string, photoURL?: string, uid?: string): UserProfile => {
    const isOwner = isOwnerEmail(email);
    const balance = isOwner ? Infinity : getWalletBalance(email);

    return {
      uid: uid || `usr_${Date.now()}`,
      email,
      displayName: displayName || (isOwner ? 'Precious' : email.split('@')[0]),
      photoURL: photoURL || (isOwner 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' 
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
      isOwner,
      balance,
      createdAt: new Date().toISOString(),
    };
  };

  useEffect(() => {
    // 1. Check local session first
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const refreshed = buildUserProfile(parsed.email, parsed.displayName, parsed.photoURL, parsed.uid);
        setUser(refreshed);
      } catch {
        // Fall back
      }
    } else {
      // By default, start with the App Owner automatically signed in or ready to boost!
      const initialOwner = buildUserProfile(OWNER_EMAIL, 'Precious', undefined, 'owner-precious-root');
      setUser(initialOwner);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(initialOwner));
    }

    // 2. Check Firebase Redirect result
    checkRedirectAuth().then((firebaseUser) => {
      if (firebaseUser?.email) {
        const profile = buildUserProfile(
          firebaseUser.email,
          firebaseUser.displayName || undefined,
          firebaseUser.photoURL || undefined,
          firebaseUser.uid
        );
        setUser(profile);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
      }
    });

    // 3. Listen to Firebase auth state changes
    const unsubscribe = subscribeToAuth((firebaseUser) => {
      if (firebaseUser?.email) {
        const profile = buildUserProfile(
          firebaseUser.email,
          firebaseUser.displayName || undefined,
          firebaseUser.photoURL || undefined,
          firebaseUser.uid
        );
        setUser(profile);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
      }
      setIsLoading(false);
    });

    setIsLoading(false);
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogleRedirect();
    } catch (e) {
      console.warn('Google sign in error, activating simulated Google Sign-In:', e);
      // Seamless interactive fallback
      loginAsOwnerDemo();
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsOwnerDemo = () => {
    const ownerProfile = buildUserProfile(
      OWNER_EMAIL,
      'Precious',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'owner-precious-1'
    );
    setUser(ownerProfile);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(ownerProfile));
  };

  const loginAsCustomerDemo = (customEmail?: string, customName?: string) => {
    const email = customEmail || 'alex.creator@gmail.com';
    const name = customName || 'Alex Rivers';
    const customerProfile = buildUserProfile(
      email,
      name,
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      `cust_${Date.now()}`
    );
    setUser(customerProfile);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(customerProfile));
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_USER);
  };

  const topUpWallet = (amount: number) => {
    if (!user || user.isOwner) return; // Owner needs no top up
    const newBal = (user.balance || 0) + amount;
    const updated = { ...user, balance: newBal };
    setUser(updated);
    saveWalletBalance(user.email, newBal);
  };

  const deductBalance = (amount: number): boolean => {
    if (!user) return false;
    // CRITICAL: Owner is never charged!
    if (user.isOwner) return true;

    if (user.balance < amount) {
      return false; // Insufficient funds
    }

    const newBal = user.balance - amount;
    const updated = { ...user, balance: newBal };
    setUser(updated);
    saveWalletBalance(user.email, newBal);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isOwner: Boolean(user?.isOwner),
        isLoading,
        loginWithGoogle,
        loginAsOwnerDemo,
        loginAsCustomerDemo,
        logout,
        topUpWallet,
        deductBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
