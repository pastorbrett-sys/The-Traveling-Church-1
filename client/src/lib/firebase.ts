import { initializeApp } from "firebase/app";
import { 
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithCredential,
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  type User as FirebaseUser,
  type Auth
} from "firebase/auth";
import { Capacitor } from "@capacitor/core";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD04isY5WpNZqfCPrbfeRJuZWDs8X15k7Q",
  authDomain: "travelingchurch-1b4ab.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "travelingchurch-1b4ab",
  storageBucket: "travelingchurch-1b4ab.firebasestorage.app",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:120766949732:web:710ac04f4a4a8e44a5b271",
};

// Debug: Log Firebase config status (without exposing sensitive values)
if (Capacitor.isNativePlatform()) {
  console.log('[Firebase Config] Native platform detected');
  console.log('[Firebase Config] API Key present:', !!firebaseConfig.apiKey);
  console.log('[Firebase Config] Project ID:', firebaseConfig.projectId || 'MISSING');
  console.log('[Firebase Config] App ID present:', !!firebaseConfig.appId);
}

const app = initializeApp(firebaseConfig);

// Use initializeAuth with explicit persistence for Capacitor compatibility
// WKWebView has issues with default persistence, causing onAuthStateChanged to never fire
function createAuth(): Auth {
  if (Capacitor.isNativePlatform()) {
    // On native, use indexedDB persistence with fallback to browserLocal
    // This avoids the WKWebView persistence deadlock
    try {
      return initializeAuth(app, {
        persistence: [indexedDBLocalPersistence, browserLocalPersistence]
      });
    } catch (e) {
      // If already initialized, return existing instance
      return getAuth(app);
    }
  }
  // On web, use default getAuth
  return getAuth(app);
}

export const auth = createAuth();

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    // On native apps, use Capacitor Firebase Authentication plugin with native auth
    if (Capacitor.isNativePlatform()) {
      const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");
      
      console.log("[NATIVE AUTH] Starting Google sign-in with native SDK...");
      
      // skipNativeAuth is now FALSE in config, so this uses native iOS Firebase SDK
      const result = await FirebaseAuthentication.signInWithGoogle();
      
      console.log("[NATIVE AUTH] Google sign-in complete, user:", result.user?.email);
      
      if (result.user) {
        // Return a shim user object that matches FirebaseUser interface
        const idTokenResult = await FirebaseAuthentication.getIdToken();
        return createNativeUserShim(result.user, idTokenResult.token);
      }
      
      return null;
    }
    
    // On web, try popup first
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    if (error.code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw error;
  }
}

// Create a shim user object for native auth that matches FirebaseUser interface
function createNativeUserShim(nativeUser: any, idToken: string): FirebaseUser {
  return {
    uid: nativeUser.uid,
    email: nativeUser.email,
    emailVerified: nativeUser.emailVerified ?? false,
    displayName: nativeUser.displayName,
    photoURL: nativeUser.photoUrl,
    phoneNumber: nativeUser.phoneNumber,
    isAnonymous: nativeUser.isAnonymous ?? false,
    providerId: 'firebase',
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => idToken,
    getIdTokenResult: async () => ({ token: idToken } as any),
    reload: async () => {},
    toJSON: () => ({}),
  } as FirebaseUser;
}

export async function handleRedirectResult(): Promise<FirebaseUser | null> {
  try {
    // Skip redirect handling on native - we use native plugin instead
    if (Capacitor.isNativePlatform()) {
      return null;
    }
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (error) {
    console.error("Redirect result error:", error);
    return null;
  }
}

export async function signUpWithEmail(email: string, password: string, displayName?: string): Promise<FirebaseUser> {
  // On native, use native Firebase SDK
  if (Capacitor.isNativePlatform()) {
    const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");
    
    console.log("[NATIVE AUTH] Starting email sign-up with native SDK...");
    const result = await FirebaseAuthentication.createUserWithEmailAndPassword({ email, password });
    
    if (result.user) {
      // Send verification email
      await FirebaseAuthentication.sendEmailVerification();
      const idTokenResult = await FirebaseAuthentication.getIdToken();
      console.log("[NATIVE AUTH] Email sign-up complete, user:", result.user.email);
      return createNativeUserShim(result.user, idTokenResult.token);
    }
    throw new Error("Sign up failed - no user returned");
  }
  
  // On web, use Web SDK
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && result.user) {
    await updateProfile(result.user, { displayName });
  }
  if (result.user) {
    await sendEmailVerification(result.user);
  }
  return result.user;
}

export async function resendVerificationEmail(): Promise<void> {
  const user = auth.currentUser;
  if (user && !user.emailVerified) {
    await sendEmailVerification(user);
  }
}

export async function signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
  // On native, use native Firebase SDK
  if (Capacitor.isNativePlatform()) {
    const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");
    
    console.log("[NATIVE AUTH] Starting email sign-in with native SDK...");
    
    try {
      const result = await FirebaseAuthentication.signInWithEmailAndPassword({ email, password });
      
      if (result.user) {
        const idTokenResult = await FirebaseAuthentication.getIdToken();
        console.log("[NATIVE AUTH] Email sign-in complete, user:", result.user.email);
        return createNativeUserShim(result.user, idTokenResult.token);
      }
      throw new Error("Sign in failed - no user returned");
    } catch (error: any) {
      console.error("[NATIVE AUTH] Email sign-in FAILED:", error);
      throw error;
    }
  }
  
  // On web, use Web SDK
  console.log("[FIREBASE DEBUG] signInWithEmail called (web)");
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up first.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check and try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    default:
      return 'An error occurred. Please try again.';
  }
}

export async function logoutFirebase(): Promise<void> {
  // On native, use native Firebase SDK
  if (Capacitor.isNativePlatform()) {
    const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");
    await FirebaseAuthentication.signOut();
    return;
  }
  
  // On web, use Web SDK
  await signOut(auth);
}

export async function getIdToken(): Promise<string | null> {
  // On native, use native Firebase SDK
  if (Capacitor.isNativePlatform()) {
    try {
      const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");
      const result = await FirebaseAuthentication.getIdToken();
      return result.token;
    } catch {
      return null;
    }
  }
  
  // On web, use Web SDK
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  // On native, use native Firebase SDK's auth state listener
  if (Capacitor.isNativePlatform()) {
    let unsubscribe: (() => void) | null = null;
    
    import("@capacitor-firebase/authentication").then(({ FirebaseAuthentication }) => {
      FirebaseAuthentication.addListener('authStateChange', async (state) => {
        console.log("[NATIVE AUTH] Auth state changed:", state.user?.email || "null");
        
        if (state.user) {
          try {
            const idTokenResult = await FirebaseAuthentication.getIdToken();
            const shimUser = createNativeUserShim(state.user, idTokenResult.token);
            callback(shimUser);
          } catch (e) {
            console.error("[NATIVE AUTH] Failed to get token on auth change:", e);
            callback(null);
          }
        } else {
          callback(null);
        }
      });
    });
    
    // Return cleanup function
    return () => {
      import("@capacitor-firebase/authentication").then(({ FirebaseAuthentication }) => {
        FirebaseAuthentication.removeAllListeners();
      });
    };
  }
  
  // On web, use Web SDK
  return onAuthStateChanged(auth, callback);
}

export type { FirebaseUser };
