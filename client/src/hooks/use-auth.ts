import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";
import { auth, onAuthChange, logoutFirebase, type FirebaseUser } from "@/lib/firebase";

async function fetchUser(): Promise<User | null> {
  const response = await fetch("/api/auth/user", {
    credentials: "include",
  });

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
    const response = await fetch("/api/auth/firebase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
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
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const syncedUser = await syncFirebaseUser(firebaseUser);
        if (syncedUser) {
          queryClient.setQueryData(["/api/auth/user"], syncedUser);
        }
      }
      setIsFirebaseLoading(false);
    });

    return () => unsubscribe();
  }, [queryClient]);

  const logout = async () => {
    try {
      await logoutFirebase();
      queryClient.setQueryData(["/api/auth/user"], null);
      window.location.href = "/api/logout";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/api/logout";
    }
  };

  return {
    user,
    isLoading: isQueryLoading || isFirebaseLoading,
    isAuthenticated: !!user,
    logout,
    isLoggingOut: false,
    refetch,
  };
}
