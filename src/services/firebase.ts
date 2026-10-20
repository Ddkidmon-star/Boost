import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  getDocFromServer,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { BoostOrder, UserProfile } from '../types';

export const OWNER_EMAIL = 'preciousddkid@gmail.com';

export function isOwnerEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === OWNER_EMAIL;
}

// 1. Initialize Firebase App & Services
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// 2. Error handling according to skill specifications
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((p) => ({
        providerId: p.providerId,
        email: p.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 3. Test Connection
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore connection check notice: client offline or waiting for auth');
    }
    return false;
  }
}

// 4. Real Google Sign In via Firebase Popup
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
  } catch (error) {
    console.error('Google Sign In error:', error);
    throw error;
  }
}

// 5. Sign Out
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// 6. Firestore User Profile Synchronization
export async function syncUserProfile(firebaseUser: FirebaseUser): Promise<UserProfile> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const isOwner = isOwnerEmail(firebaseUser.email);

  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || (isOwner ? 'Precious' : 'Social Creator'),
        photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        isOwner,
        balance: isOwner ? Infinity : 20.00, // $20 welcome balance for new users
        createdAt: new Date().toISOString(),
      };
      await setDoc(userRef, newProfile);
      return newProfile;
    } else {
      const data = snap.data() as UserProfile;
      const updated: UserProfile = {
        ...data,
        isOwner,
        balance: isOwner ? Infinity : (data.balance ?? 20.00),
        displayName: firebaseUser.displayName || data.displayName,
        photoURL: firebaseUser.photoURL || data.photoURL,
      };
      return updated;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
  }
}

// 7. Update User Balance in Firestore
export async function updateUserBalanceInDb(uid: string, newBalance: number): Promise<void> {
  const userRef = doc(db, 'users', uid);
  try {
    await updateDoc(userRef, { balance: newBalance, updatedAt: new Date().toISOString() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }
}

// 8. Save Order to Firestore
export async function saveOrderToFirestore(order: BoostOrder): Promise<void> {
  const orderRef = doc(db, 'orders', order.id);
  try {
    await setDoc(orderRef, order);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `orders/${order.id}`);
  }
}

// 9. Update Order in Firestore
export async function updateOrderInFirestore(orderId: string, updates: Partial<BoostOrder>): Promise<void> {
  const orderRef = doc(db, 'orders', orderId);
  try {
    await updateDoc(orderRef, { ...updates, updatedAt: new Date().toISOString() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
  }
}

// 10. Subscribe to Real-time Orders for User
export function subscribeToUserOrders(
  userId: string,
  userEmail: string,
  onOrders: (orders: BoostOrder[]) => void
): Unsubscribe {
  const ordersColl = collection(db, 'orders');
  const isOwner = isOwnerEmail(userEmail);

  // If owner, query all orders, otherwise query only user's orders
  const q = isOwner 
    ? query(ordersColl) 
    : query(ordersColl, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: BoostOrder[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as BoostOrder);
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onOrders(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    }
  );
}
