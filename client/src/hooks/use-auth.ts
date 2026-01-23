import { useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";
import { auth, onAuthChange, logoutFirebase, type FirebaseUser } from "@/lib/firebase";
import { apiFetch } from "@/lib/queryClient";

async function fetchUser(): Promise<User | null> {
  const response = await apiFetch("/api/auth/user");

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  const user = await response.json();
  
  // Sync user's language preference based on device locale (for session auth users)
  if (user) {
    syncUserLanguage();
  }
  
  return user;
}

async function syncFirebaseUser(firebaseUser: FirebaseUser): Promise<User | null> {
  try {
    const idToken = await firebaseUser.getIdToken();
    // Detect user's language before syncing to include in signup
    const language = detectUserLanguage();
    
    const response = await apiFetch("/api/auth/firebase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken, language }),
    });

    if (!response.ok) {
      console.error("Failed to sync Firebase user");
      return null;
    }

    const user = await response.json();
    
    // Also sync language preference separately (with auth token)
    syncUserLanguage(idToken);
    
    return user;
  } catch (error) {
    console.error("Error syncing Firebase user:", error);
    return null;
  }
}

// Detect if user's device is set to Amharic and sync language preference
function detectUserLanguage(): 'am' | 'en' {
  const lang = navigator.language || (navigator as any).userLanguage || 'en';
  return lang.startsWith('am') ? 'am' : 'en';
}

// Sync user's language preference to backend (fire and forget)
async function syncUserLanguage(idToken?: string): Promise<void> {
  try {
    const language = detectUserLanguage();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    // Include Authorization header for native apps using Firebase auth
    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken}`;
    }
    
    await apiFetch("/api/auth/language", {
      method: "POST",
      headers,
      body: JSON.stringify({ language }),
    });
    console.log(`[Auth] Synced user language: ${language}`);
  } catch (error) {
    // Don't block auth for language sync failure
    console.error("[Auth] Failed to sync language:", error);
  }
}

export function useAuth() {
  const queryClient = useQueryClient();
  
  // Check if we have cached user data - if so, skip loading state entirely
  const cachedUser = queryClient.getQueryData<User | null>(["/api/auth/user"]);
  const hasCachedUser = cachedUser !== undefined && cachedUser !== null;
  
  // Only show loading if we DON'T have cached user data
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(!hasCachedUser);
  // Track whether initial auth check is complete
  const [initialAuthComplete, setInitialAuthComplete] = useState(false);
  // Track if we've done the initial Firebase check
  const initialCheckDoneRef = useRef(hasCachedUser); // Skip initial check if we have cached user
  // Track if Firebase has successfully authenticated - prevents fallback from overwriting
  const firebaseAuthSucceededRef = useRef(hasCachedUser);

  // Fetch user from server - only runs as fallback when no Firebase user
  const { data: user, isLoading: isQueryLoading, refetch } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      // Guard: Don't fetch if Firebase already authenticated
      if (firebaseAuthSucceededRef.current) {
        return queryClient.getQueryData(["/api/auth/user"]) as User | null;
      }
      return fetchUser();
    },
    retry: false,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    // Only fetch after initial auth check AND Firebase didn't provide user
    enabled: initialAuthComplete,
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    // Wait for Firebase to be ready before enabling fallback (shorter timeout)
    const waitForFirebaseReady = async () => {
      try {
        if (typeof auth.authStateReady === 'function') {
          await Promise.race([
            auth.authStateReady(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 500))
          ]);
        }
      } catch (e) {
        // Quick timeout is fine - Firebase will fire callback when ready
      }
    };

    // Always subscribe to auth changes - this handles logout, session expiration, etc.
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      // For the initial callback, wait for Firebase to be ready first (skip if we have cache)
      if (!initialCheckDoneRef.current) {
        initialCheckDoneRef.current = true;
        clearTimeout(timeoutId);
        // Only wait for Firebase if we don't have cached user
        if (!hasCachedUser) {
          await waitForFirebaseReady();
        }
      }
      
      if (firebaseUser) {
        // Firebase user exists - sync to backend
        const syncedUser = await syncFirebaseUser(firebaseUser);
        if (syncedUser) {
          // Mark Firebase auth as succeeded to prevent fallback query from overwriting
          firebaseAuthSucceededRef.current = true;
          // Cancel any in-flight fallback query
          queryClient.cancelQueries({ queryKey: ["/api/auth/user"] });
          queryClient.setQueryData(["/api/auth/user"], syncedUser);
          setInitialAuthComplete(false); // Disable fallback query
          setIsFirebaseLoading(false);
          return;
        }
      }
      
      // No Firebase user - clear cache and enable fallback for session-based auth
      firebaseAuthSucceededRef.current = false;
      queryClient.setQueryData(["/api/auth/user"], null);
      setInitialAuthComplete(true); // Enable fallback query
      setIsFirebaseLoading(false);
    });
    
    // Only set fallback timeout if we don't have cached user
    if (!hasCachedUser) {
      timeoutId = setTimeout(() => {
        if (!initialCheckDoneRef.current) {
          console.log("Firebase auth timeout - falling back to session check");
          initialCheckDoneRef.current = true;
          setInitialAuthComplete(true);
          setIsFirebaseLoading(false);
        }
      }, 1500);
    }

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [queryClient, hasCachedUser]);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutFirebase();
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.clear();
      // Call backend logout - request JSON to prevent redirect on native
      await apiFetch("/api/logout", { 
        method: "GET",
        headers: { "Accept": "application/json" }
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    user,
    isLoading: isQueryLoading || isFirebaseLoading,
    isAuthenticated: !!user,
    logout,
    isLoggingOut,
    refetch,
  };
}
