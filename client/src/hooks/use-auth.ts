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

  return response.json();
}

async function syncFirebaseUser(firebaseUser: FirebaseUser): Promise<User | null> {
  try {
    const idToken = await firebaseUser.getIdToken();
    const response = await apiFetch("/api/auth/firebase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      console.error("Failed to sync Firebase user");
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error syncing Firebase user:", error);
    return null;
  }
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);
  // Track whether initial auth check is complete
  const [initialAuthComplete, setInitialAuthComplete] = useState(false);
  // Track if we've done the initial Firebase check
  const initialCheckDoneRef = useRef(false);
  // Track if Firebase has successfully authenticated - prevents fallback from overwriting
  const firebaseAuthSucceededRef = useRef(false);

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
    
    // Wait for Firebase to be ready before enabling fallback
    const waitForFirebaseReady = async () => {
      try {
        if (typeof auth.authStateReady === 'function') {
          await Promise.race([
            auth.authStateReady(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
          ]);
        }
      } catch (e) {
        console.log("Firebase auth ready timeout - proceeding");
      }
    };

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      // For the initial callback, wait for Firebase to be ready first
      if (!initialCheckDoneRef.current) {
        initialCheckDoneRef.current = true;
        clearTimeout(timeoutId);
        await waitForFirebaseReady();
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
    
    // Fallback timeout for slow Firebase init
    timeoutId = setTimeout(() => {
      if (!initialCheckDoneRef.current) {
        console.log("Firebase auth timeout - falling back to session check");
        initialCheckDoneRef.current = true;
        setInitialAuthComplete(true);
        setIsFirebaseLoading(false);
      }
    }, 2500);

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [queryClient]);

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
