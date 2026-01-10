import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { useQueryClient } from "@tanstack/react-query";
import { exchangeAuthCode } from "@/lib/firebase";
import { apiFetch } from "@/lib/queryClient";

export function useDeepLinks() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let cleanup: (() => void) | undefined;

    async function setupDeepLinks() {
      const { App } = await import("@capacitor/app");
      const { Browser } = await import("@capacitor/browser");

      const handle = await App.addListener("appUrlOpen", async (event) => {
        console.log("[DEEP LINK] Received URL:", event.url);

        // Parse the URL
        const url = new URL(event.url);
        
        // Handle auth callback
        if (url.pathname === "/auth-callback" || url.host === "auth-callback") {
          const code = url.searchParams.get("code");
          
          if (code) {
            console.log("[DEEP LINK] Processing auth code...");
            
            try {
              // Close the browser
              await Browser.close();
              
              // Exchange code for Firebase auth
              const user = await exchangeAuthCode(code);
              
              if (user) {
                // Sync with backend
                const idToken = await user.getIdToken();
                await apiFetch("/api/auth/firebase", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ idToken }),
                });
                
                // Refresh auth state
                queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
                
                console.log("[DEEP LINK] Auth completed successfully!");
              }
            } catch (error) {
              console.error("[DEEP LINK] Auth failed:", error);
            }
          }
        }
      });

      cleanup = () => handle.remove();
    }

    setupDeepLinks();

    return () => {
      if (cleanup) cleanup();
    };
  }, [queryClient]);
}
