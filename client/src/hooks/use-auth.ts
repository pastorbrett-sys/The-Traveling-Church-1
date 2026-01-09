import { useEffect, useState } from "react";
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

  const { data: user, isLoading: isQueryLoading, refetch } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    // Timeout fallback in case Firebase auth state never fires (native app edge case)
    timeoutId = setTimeout(() => {
      console.log("Firebase auth timeout - proceeding without Firebase auth state");
      setIsFirebaseLoading(false);
    }, 5000);

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      clearTimeout(timeoutId);
      if (firebaseUser) {
        const syncedUser = await syncFirebaseUser(firebaseUser);
        if (syncedUser) {
          queryClient.setQueryData(["/api/auth/user"], syncedUser);
        }
      }
      setIsFirebaseLoading(false);
    });

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
      // Call backend logout without redirect
      await apiFetch("/api/logout", { method: "GET" });
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
