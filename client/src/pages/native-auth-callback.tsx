import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

// This page handles the OAuth callback on web, then redirects back to the native app
export default function NativeAuthCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function handleCallback() {
      try {
        // Wait for Firebase auth state to be ready
        await new Promise<void>((resolve) => {
          const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve();
          });
          // Timeout after 10 seconds
          setTimeout(() => resolve(), 10000);
        });

        const user = auth.currentUser;
        
        if (!user) {
          setStatus("error");
          setErrorMessage("Authentication failed. Please try again.");
          return;
        }

        // Get the ID token
        const idToken = await user.getIdToken();
        
        // Exchange for a short-lived code via backend
        const response = await fetch("/api/native-auth/generate-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate auth code");
        }

        const { code } = await response.json();
        
        setStatus("success");
        
        // Redirect to the native app with the code
        const redirectUrl = `com.vagabondbible.app://auth-callback?code=${code}`;
        
        // Small delay to show success message
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 500);
        
      } catch (error: any) {
        console.error("Callback error:", error);
        setStatus("error");
        setErrorMessage(error.message || "Something went wrong");
      }
    }

    handleCallback();
  }, []);

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'linear-gradient(to bottom, #1a1a1a 0%, #000000 100%)' }}
    >
      {status === "loading" && (
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-lg">Completing sign in...</p>
        </div>
      )}
      
      {status === "success" && (
        <div className="text-center text-white">
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg mb-2">Signed in successfully!</p>
          <p className="text-sm text-gray-400">Returning to app...</p>
        </div>
      )}
      
      {status === "error" && (
        <div className="text-center text-white">
          <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-lg mb-2">Sign in failed</p>
          <p className="text-sm text-gray-400 mb-4">{errorMessage}</p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-[#b8860b] text-white rounded-lg"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
