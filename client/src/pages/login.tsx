import { useEffect, useState } from "react";
import { useSearch, useLocation } from "wouter";
import { Mail, Loader2, Eye, EyeOff, User } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { Capacitor } from "@capacitor/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  resetPassword,
  getFirebaseErrorMessage,
  handleRedirectResult,
  logoutFirebase
} from "@/lib/firebase";
import vagabondLogoWhite from "@assets/White_Logo_Big_1767755759050.png";

export default function Login() {
  const { user, isAuthenticated, isLoading, refetch } = useAuth();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const redirectTo = params.get("redirect") || "/pastor-chat";
  const isNativeFlow = params.get("native") === "true";
  
  // Distinguish between Safari View Controller (web) and native app WebView
  // Safari View Controller: isNativeFlow=true but NOT running in Capacitor native platform
  // Native app WebView: Capacitor.isNativePlatform() is true
  const isInSafariSheet = isNativeFlow && !Capacitor.isNativePlatform();
  const isInNativeApp = Capacitor.isNativePlatform();
  
  const [activeTab, setActiveTab] = useState<string>("signin");
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // For native flow: track if user wants to use a different account
  const [nativeWantsDifferentAccount, setNativeWantsDifferentAccount] = useState(false);
  // For native flow: track if we're in the process of redirecting back to app
  const [isNativeRedirecting, setIsNativeRedirecting] = useState(false);
  
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  useEffect(() => {
    document.title = "Sign In | Vagabond Bible";
  }, []);

  useEffect(() => {
    handleRedirectResult().then((user) => {
      if (user) {
        refetch();
      }
    });
  }, [refetch]);

  // Function to redirect back to native app with auth code
  const handleNativeRedirect = async () => {
    setIsNativeRedirecting(true);
    setError(null);
    
    try {
      console.log("[NATIVE AUTH] Starting redirect flow...");
      const { auth } = await import("@/lib/firebase");
      
      // Wait for auth state to be ready
      let firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        console.log("[NATIVE AUTH] Waiting for auth.currentUser...");
        for (let i = 0; i < 50 && !firebaseUser; i++) {
          await new Promise(r => setTimeout(r, 100));
          firebaseUser = auth.currentUser;
        }
      }
      
      if (!firebaseUser) {
        console.error("[NATIVE AUTH] No user available after waiting");
        setError("Unable to get user details. Please try again.");
        setIsNativeRedirecting(false);
        return;
      }
      
      console.log("[NATIVE AUTH] User found:", firebaseUser.email);
      const idToken = await firebaseUser.getIdToken();
      console.log("[NATIVE AUTH] Got ID token, generating auth code...");
      
      const response = await fetch("/api/native-auth/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      
      if (response.ok) {
        const { code } = await response.json();
        console.log("[NATIVE AUTH] Auth code generated, redirecting to app...");
        window.location.href = `com.vagabondbible.app://auth-callback?code=${code}`;
      } else {
        const errorText = await response.text();
        console.error("[NATIVE AUTH] Failed to generate code:", response.status, errorText);
        setError("Failed to complete authentication. Please try again.");
        setIsNativeRedirecting(false);
      }
    } catch (err) {
      console.error("[NATIVE AUTH] Redirect failed:", err);
      setError("Authentication failed. Please try again.");
      setIsNativeRedirecting(false);
    }
  };

  // Handle native flow: when user signs out to use different account
  const handleUseDifferentAccount = async () => {
    setIsGoogleSubmitting(true);
    setError(null);
    try {
      await logoutFirebase();
      setNativeWantsDifferentAccount(true);
      await refetch();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  useEffect(() => {
    console.log("[LOGIN] Auth state changed - isLoading:", isLoading, "isAuthenticated:", isAuthenticated, "isInSafariSheet:", isInSafariSheet, "isInNativeApp:", isInNativeApp);
    
    if (!isLoading && isAuthenticated) {
      console.log("[LOGIN] User is authenticated, handling redirect...");
      
      // In Safari View Controller: Show confirmation screen, don't auto-redirect
      // This lets the user see who they're signing in as before returning to app
      if (isInSafariSheet) {
        console.log("[LOGIN] Safari sheet - showing confirmation screen, NOT auto-redirecting");
        return;
      }
      
      // In native app OR regular web: Navigate to destination
      console.log("[LOGIN] Navigating to:", redirectTo);
      window.scrollTo(0, 0);
      setLocation(redirectTo);
    }
  }, [isLoading, isAuthenticated, redirectTo, setLocation, isInSafariSheet, isInNativeApp]);

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    setError(null);
    try {
      const signedInUser = await signInWithGoogle();
      if (signedInUser) {
        await refetch();
        // For Safari sheet: after signing in, reset the "different account" flag
        // so the confirmation screen shows with the new account
        if (isInSafariSheet) {
          setNativeWantsDifferentAccount(false);
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return;
      }
      console.error("Sign in error:", err);
      setError(getFirebaseErrorMessage(err.code));
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[LOGIN DEBUG] Starting email sign in...");
    setIsEmailSubmitting(true);
    setError(null);
    
    try {
      console.log("[LOGIN DEBUG] Calling signInWithEmail...");
      const signedInUser = await signInWithEmail(signInEmail, signInPassword);
      console.log("[LOGIN DEBUG] signInWithEmail SUCCESS, user:", signedInUser?.email);
      console.log("[LOGIN DEBUG] Calling refetch...");
      await refetch();
      console.log("[LOGIN DEBUG] refetch complete");
      // For Safari sheet: after signing in, reset the "different account" flag
      if (isInSafariSheet) {
        setNativeWantsDifferentAccount(false);
      }
    } catch (err: any) {
      console.error("[LOGIN DEBUG] Sign in FAILED:", err);
      console.error("[LOGIN DEBUG] Error code:", err.code);
      console.error("[LOGIN DEBUG] Error message:", err.message);
      setError(getFirebaseErrorMessage(err.code));
    } finally {
      console.log("[LOGIN DEBUG] Finally block - stopping spinner");
      setIsEmailSubmitting(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    if (signUpPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsEmailSubmitting(false);
      return;
    }
    
    try {
      await signUpWithEmail(signUpEmail, signUpPassword);
      setSuccessMessage("Account created! We've sent a verification email to " + signUpEmail + ". Please check your inbox and verify your email, then sign in.");
      setActiveTab("signin");
      setSignInEmail(signUpEmail);
      setSignUpEmail("");
      setSignUpPassword("");
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError(getFirebaseErrorMessage(err.code));
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!signInEmail) {
      setError("Please enter your email address first.");
      return;
    }
    
    setIsEmailSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await resetPassword(signInEmail);
      setSuccessMessage("Password reset email sent to " + signInEmail + "! Check your inbox and follow the link to reset your password.");
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(getFirebaseErrorMessage(err.code));
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="antialiased min-h-[100dvh] flex flex-col text-white safe-area-top" style={{ background: 'linear-gradient(to bottom, #1a1a1a 0%, #000000 100%)' }}>
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 rounded-full animate-spin border-white border-t-transparent" />
        </main>
      </div>
    );
  }

  // If authenticated in native app or regular web, don't show login page (navigation will happen)
  if (isAuthenticated && !isInSafariSheet) {
    return null;
  }

  // Safari sheet: Show confirmation screen when authenticated
  if (isInSafariSheet && isAuthenticated && !nativeWantsDifferentAccount) {
    return (
      <div className="antialiased min-h-[100dvh] flex flex-col text-white" style={{ background: 'linear-gradient(to bottom, #1a1a1a 0%, #000000 100%)' }}>
        <main className="flex-1 flex items-center justify-center px-5" style={{ paddingTop: 'max(3rem, env(safe-area-inset-top, 48px))', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))' }}>
          <div className="max-w-md mx-auto w-full">
            <Card className="border-0 shadow-none bg-transparent animate-fade-up" style={{ animationDuration: '0.4s' }}>
              <CardHeader className="text-center pb-4 pt-0">
                <div className="flex justify-center mb-4">
                  <img src={vagabondLogoWhite} alt="Vagabond Bible" className="object-contain h-16" style={{ marginLeft: '-13px' }} />
                </div>
                <h2 className="text-xl font-semibold text-white mt-4">Welcome Back!</h2>
              </CardHeader>

              <CardContent className="space-y-6 pt-4">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md" data-testid="error-message">
                    {error}
                  </div>
                )}

                {/* Show current user info */}
                <div className="flex items-center gap-4 p-4 bg-[#2a2a2a] rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-[#3a3a3a] flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{user?.email}</p>
                    <p className="text-gray-400 text-sm">Signed in</p>
                  </div>
                </div>

                {/* Continue button */}
                <Button
                  type="button"
                  onClick={handleNativeRedirect}
                  disabled={isNativeRedirecting}
                  className="w-full h-12 bg-[#b8860b] hover:bg-[#a07608] text-white border-0 text-base"
                  style={{ animation: 'subtleGlow 3s ease-in-out infinite' }}
                  data-testid="button-native-continue"
                >
                  {isNativeRedirecting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Continue to App"
                  )}
                </Button>

                {/* Use different account */}
                <Button
                  type="button"
                  onClick={handleUseDifferentAccount}
                  disabled={isNativeRedirecting || isGoogleSubmitting}
                  variant="outline"
                  className="w-full h-11 bg-transparent border-[#333333] text-white hover:bg-[#222222]"
                  data-testid="button-native-different-account"
                >
                  {isGoogleSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Use a Different Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="antialiased min-h-[100dvh] flex flex-col text-white" style={{ background: 'linear-gradient(to bottom, #1a1a1a 0%, #000000 100%)' }}>
      <main className="flex-1 flex items-center justify-center px-5" style={{ paddingTop: 'max(3rem, env(safe-area-inset-top, 48px))', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))' }}>
        <div className="max-w-md mx-auto w-full">
          <Card className="border-0 shadow-none bg-transparent animate-fade-up" style={{ animationDuration: '0.4s' }}>
            <CardHeader className="text-center pb-4 pt-0">
              <div className="flex justify-center mb-4">
                <img src={vagabondLogoWhite} alt="Vagabond Bible" className="object-contain h-16" style={{ marginLeft: '-13px' }} />
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md" data-testid="error-message">
                  {error}
                </div>
              )}
              
              {successMessage && (
                <div className="bg-green-100 text-green-800 text-sm p-3 rounded-md" data-testid="success-message">
                  {successMessage}
                </div>
              )}

              {/* Tab Switcher */}
              <div className="grid w-full grid-cols-2 bg-[#2a2a2a] rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => { setActiveTab("signin"); setError(null); setSuccessMessage(null); }}
                  className={`py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "signin" ? "bg-[#3a3a3a] text-white" : "text-gray-400"}`}
                  data-testid="tab-signin"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab("signup"); setError(null); setSuccessMessage(null); }}
                  className={`py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "signup" ? "bg-[#3a3a3a] text-white" : "text-gray-400"}`}
                  data-testid="tab-signup"
                >
                  Create Account
                </button>
              </div>

              {/* Unified Form - Fixed Position Elements */}
              <form onSubmit={activeTab === "signin" ? handleEmailSignIn : handleEmailSignUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={activeTab === "signin" ? signInEmail : signUpEmail}
                    onChange={(e) => activeTab === "signin" ? setSignInEmail(e.target.value) : setSignUpEmail(e.target.value)}
                    required
                    data-testid={activeTab === "signin" ? "input-signin-email" : "input-signup-email"}
                    className="bg-[#181818] border-[#2a2a2a] text-white placeholder:text-gray-500 focus:border-[#b8860b] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={activeTab === "signin" ? "Enter your password" : "At least 6 characters"}
                      value={activeTab === "signin" ? signInPassword : signUpPassword}
                      onChange={(e) => activeTab === "signin" ? setSignInPassword(e.target.value) : setSignUpPassword(e.target.value)}
                      required
                      data-testid={activeTab === "signin" ? "input-signin-password" : "input-signup-password"}
                      className="bg-[#181818] border-[#2a2a2a] text-white placeholder:text-gray-500 focus:border-[#b8860b] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  disabled={isEmailSubmitting || isGoogleSubmitting}
                  className="w-full h-11 bg-[#b8860b] hover:bg-[#a07608] text-white border-0"
                  style={{ animation: 'subtleGlow 3s ease-in-out infinite' }}
                  data-testid={activeTab === "signin" ? "button-signin-email" : "button-signup-email"}
                >
                  {isEmailSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : activeTab === "signup" ? (
                    <Mail className="w-4 h-4 mr-2" />
                  ) : null}
                  {activeTab === "signin" ? "Sign In" : "Create Account"}
                </Button>
              </form>

              {/* Forgot Password - Fixed position, just fades */}
              <div className="h-10 flex items-center justify-center" style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm hover:underline text-[#b8860b] transition-opacity duration-200"
                  style={{ opacity: activeTab === "signin" ? 1 : 0, pointerEvents: activeTab === "signin" ? "auto" : "none" }}
                  data-testid="button-forgot-password"
                >
                  Forgot password?
                </button>
              </div>
              
              {/* Bottom Section - Slides up when on Create Account */}
              <div 
                className="space-y-4 transition-transform duration-300 ease-out"
                style={{ transform: activeTab === "signup" ? "translateY(-44px)" : "translateY(-8px)" }}
              >
                <div className="flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-[#333333]" />
                  <span className="text-sm text-gray-500">or</span>
                  <div className="flex-1 h-px bg-[#333333]" />
                </div>
                
                <Button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isEmailSubmitting || isGoogleSubmitting}
                  variant="outline"
                  className="w-full h-11 bg-transparent border-[#333333] text-white hover:bg-[#222222]"
                  data-testid={activeTab === "signin" ? "button-signin-google" : "button-signup-google"}
                >
                  {isGoogleSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <SiGoogle className="w-4 h-4 mr-2" />
                  )}
                  {activeTab === "signin" ? "Continue with Google" : "Sign up with Google"}
                </Button>
                
                <p className="text-xs text-center text-gray-500">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
