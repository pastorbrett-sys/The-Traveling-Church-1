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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
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
    // On native apps, use Capacitor Firebase Authentication plugin
    if (Capacitor.isNativePlatform()) {
      const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");
      
      // Use skipNativeAuth to get credential, then sign in with web SDK
      // This ensures the web Firebase SDK is aware of the auth state
      const result = await FirebaseAuthentication.signInWithGoogle({
        skipNativeAuth: true,
        scopes: ['profile', 'email']
      });
      
      if (result.credential?.idToken) {
        // Create Firebase credential from the native result
        const credential = GoogleAuthProvider.credential(
          result.credential.idToken,
          result.credential.accessToken || null
        );
        
        // Sign in to Firebase Web SDK with the credential
        const userCredential = await signInWithCredential(auth, credential);
        return userCredential.user;
      }
      
      console.error("No credential returned from native Google sign-in");
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
  await signOut(auth);
}

export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export type { FirebaseUser };
