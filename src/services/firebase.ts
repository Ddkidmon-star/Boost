import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithRedirect, 
  signInWithPopup, 
  getRedirectResult, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

export const OWNER_EMAIL = 'preciousddkid@gmail.com';

export function isOwnerEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === OWNER_EMAIL;
}

// Firebase configuration with environment fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoDummyKeyForAppletEnvironment12345",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smm-growth-boost.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "smm-growth-boost",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "smm-growth-boost.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "811001294439",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:811001294439:web:3f12dc5d3e724e45bd9c"
};

// Initialize Firebase safely
let app: ReturnType<typeof initializeApp>;
let auth: ReturnType<typeof getAuth>;
let googleProvider: GoogleAuthProvider;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} catch (e) {
  console.warn('Firebase initialization notice:', e);
}

export { auth, googleProvider };

export async function loginWithGoogleRedirect(): Promise<void> {
  if (!auth || !googleProvider) {
    throw new Error('Firebase Auth is not initialized');
  }
  try {
    // If inside an iframe (like AI Studio preview), signInWithRedirect can be blocked by browser 3rd-party cookie sandboxing.
    // We try popup first or fall back seamlessly.
    await signInWithPopup(auth, googleProvider);
  } catch {
    // Fall back to redirect if popup is blocked
    await signInWithRedirect(auth, googleProvider);
  }
}

export async function checkRedirectAuth(): Promise<FirebaseUser | null> {
  if (!auth) return null;
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (err) {
    console.debug('No redirect result pending or error:', err);
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  if (auth) {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout issue:', e);
    }
  }
}

export function subscribeToAuth(callback: (user: FirebaseUser | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
