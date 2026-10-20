import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { 
  auth, 
  signInWithGoogle, 
  signOut, 
  syncUserProfile, 
  updateUserBalanceInDb, 
  verifyUserRoleOnBackend, 
  testFirestoreConnection 
} from '../services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isOwner: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsRegular: () => void;
  logout: () => Promise<void>;
  topUpWallet: (amount: number) => Promise<void>;
  deductBalance: (amount: number) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Validate connection to Firestore on boot
    testFirestoreConnection().catch((e) => console.warn('Init firestore test:', e));

    // Listen to real Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (currentFirebaseUser) => {
      setIsLoading(true);
      if (currentFirebaseUser) {
        setFirebaseUser(currentFirebaseUser);
        try {
          const profile = await syncUserProfile(currentFirebaseUser);
          setUser(profile);
        } catch (err) {
          console.warn('Profile sync fallback:', err);
          const isOwner = await verifyUserRoleOnBackend(currentFirebaseUser.email);
          setUser({
            uid: currentFirebaseUser.uid,
            email: currentFirebaseUser.email || '',
            displayName: currentFirebaseUser.displayName || (isOwner ? 'VIP Owner' : 'Customer Account'),
            photoURL: currentFirebaseUser.photoURL || undefined,
            isOwner,
            balance: isOwner ? Infinity : 20.00,
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const fbUser = await signInWithGoogle();
      setFirebaseUser(fbUser);
      const profile = await syncUserProfile(fbUser);
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsRegular = () => {
    setUser({
      uid: 'demo_user_uid',
      email: 'client@boostpro.app',
      displayName: 'Customer Account',
      photoURL: undefined,
      isOwner: false,
      balance: 35.00,
      createdAt: new Date().toISOString(),
    });
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      setFirebaseUser(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const topUpWallet = async (amount: number) => {
    if (!user || user.isOwner) return; // Owner never needs to top up
    const newBal = (user.balance || 0) + amount;
    setUser({ ...user, balance: newBal });
    try {
      await updateUserBalanceInDb(user.uid, newBal);
    } catch (e) {
      console.warn('Error saving balance to Firestore:', e);
    }
  };

  const deductBalance = async (amount: number): Promise<boolean> => {
    if (!user) return false;
    // CRITICAL: Owner is NEVER charged!
    if (user.isOwner) return true;

    if (user.balance < amount) {
      return false; // Insufficient funds
    }

    const newBal = user.balance - amount;
    setUser({ ...user, balance: newBal });
    try {
      await updateUserBalanceInDb(user.uid, newBal);
    } catch (e) {
      console.warn('Error deducting balance in Firestore:', e);
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isOwner: Boolean(user?.isOwner),
        isLoading,
        loginWithGoogle,
        loginAsRegular,
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
