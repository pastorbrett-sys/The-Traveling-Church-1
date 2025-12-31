import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  type User as FirebaseUser
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw error;
  }
}

export async function handleRedirectResult(): Promise<FirebaseUser | null> {
  try {
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
  return result.user;
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
