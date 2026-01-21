import { useEffect, useState } from "react";
import { useSearch, useLocation } from "wouter";
import { Mail, Loader2, Eye, EyeOff, User } from "lucide-react";
import { SiGoogle, SiApple } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { 
  signInWithGoogle,
  signInWithApple,
  signInWithEmail, 
  signUpWithEmail, 
  resetPassword,
  getFirebaseErrorMessage,
  handleRedirectResult,
} from "@/lib/firebase";
import ambassadorLogo from "@assets/Ambassador_Logo_1768768266982.png";

export default function AmbassadorLogin() {
  const { user, isAuthenticated, isLoading, refetch } = useAuth();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const inviteCode = params.get("invite") || "";
  
  const [activeTab, setActiveTab] = useState<string>("signin");
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isAppleSubmitting, setIsAppleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpName, setSignUpName] = useState("");

  useEffect(() => {
    document.title = "Ambassador Login | Vagabond Bible";
  }, []);

  useEffect(() => {
    handleRedirectResult().then((user) => {
      if (user) {
        refetch();
      }
    });
  }, [refetch]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      checkAmbassadorStatus();
    }
  }, [isLoading, isAuthenticated, user]);

  const checkAmbassadorStatus = async () => {
    if (!user) return;
    
    try {
      const res = await fetch(`/api/ambassador/me?userId=${user.id}`);
      if (res.ok) {
        const { ambassador } = await res.json();
        if (ambassador.status === "active") {
          // Check for stored redirect URL (e.g., from admin panel)
          const adminRedirect = sessionStorage.getItem("adminRedirect");
          if (adminRedirect && ambassador.isSuperAdmin) {
            sessionStorage.removeItem("adminRedirect");
            setLocation(adminRedirect);
          } else if (ambassador.isSuperAdmin) {
            setLocation("/admin");
          } else {
            setLocation("/ambassador/dashboard");
          }
        } else {
          setLocation("/ambassador/pending");
        }
      } else {
        if (activeTab === "signup") {
          setLocation("/ambassador/pending");
        }
      }
    } catch (err) {
      console.error("Ambassador check error:", err);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    setError(null);
    try {
      const firebaseUser = await signInWithGoogle();
      if (firebaseUser) {
        await refetch();
      }
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err.code) || err.message);
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsAppleSubmitting(true);
    setError(null);
    try {
      const firebaseUser = await signInWithApple();
      if (firebaseUser) {
        await refetch();
      }
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err.code) || err.message);
    } finally {
      setIsAppleSubmitting(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailSubmitting(true);
    setError(null);
    try {
      await signInWithEmail(signInEmail, signInPassword);
      await refetch();
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err.code) || err.message);
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailSubmitting(true);
    setError(null);
    try {
      const firebaseUser = await signUpWithEmail(signUpEmail, signUpPassword, signUpName);
      
      const res = await fetch("/api/ambassador/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: firebaseUser.uid,
          email: signUpEmail,
          name: signUpName || signUpEmail.split("@")[0],
          inviteCode: inviteCode,
        }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to register as ambassador");
      }
      
      await refetch();
      setLocation("/ambassador/pending");
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err.code) || err.message);
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!signInEmail) {
      setError("Please enter your email address first");
      return;
    }
    try {
      await resetPassword(signInEmail);
      setSuccessMessage("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err.code) || err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom, #191919, #000000)' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#c08e00]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom, #191919, #000000)' }}>
      <Card className="w-full max-w-md bg-[#1a1a1a] border-[#333] shadow-2xl">
        <CardHeader className="text-center pb-2">
          <img 
            src={ambassadorLogo} 
            alt="Vagabond Bible Ambassador" 
            className="h-24 mx-auto mb-4 object-contain"
          />
          {inviteCode && (
            <p className="text-sm text-[#c08e00] mt-2">
              You've been invited to join the Ambassador Program
            </p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex gap-2 p-1 bg-[#0a0a0a] rounded-lg">
            <button
              onClick={() => { setActiveTab("signin"); setError(null); setSuccessMessage(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "signin" 
                  ? "bg-[#c08e00] text-black" 
                  : "text-gray-400 hover:text-white"
              }`}
              data-testid="button-signin-tab"
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab("signup"); setError(null); setSuccessMessage(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "signup" 
                  ? "bg-[#c08e00] text-black" 
                  : "text-gray-400 hover:text-white"
              }`}
              data-testid="button-signup-tab"
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-900/30 border border-green-800 rounded-lg text-green-300 text-sm">
              {successMessage}
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleGoogleSignIn}
              disabled={isGoogleSubmitting}
              className="w-full bg-white hover:bg-gray-100 text-black font-medium"
              data-testid="button-google-signin"
            >
              {isGoogleSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <SiGoogle className="w-4 h-4 mr-2" />
              )}
              Continue with Google
            </Button>

            <Button
              onClick={handleAppleSignIn}
              disabled={isAppleSubmitting}
              className="w-full bg-black hover:bg-gray-900 text-white font-medium border border-gray-700"
              data-testid="button-apple-signin"
            >
              {isAppleSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <SiApple className="w-4 h-4 mr-2" />
              )}
              Continue with Apple
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#1a1a1a] px-2 text-gray-500">or</span>
            </div>
          </div>

          {activeTab === "signin" ? (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="text-gray-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="signin-email"
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-10 bg-[#0a0a0a] border-gray-700 text-white"
                    data-testid="input-signin-email"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signin-password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10 bg-[#0a0a0a] border-gray-700 text-white"
                    data-testid="input-signin-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-[#c08e00] hover:underline"
                data-testid="button-forgot-password"
              >
                Forgot password?
              </button>

              <Button
                type="submit"
                disabled={isEmailSubmitting}
                className="w-full bg-[#c08e00] hover:bg-[#a07800] text-black font-medium"
                data-testid="button-signin-submit"
              >
                {isEmailSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Sign In
              </Button>
            </form>
          ) : (
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-gray-300">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="signup-name"
                    type="text"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="Your name"
                    className="pl-10 bg-[#0a0a0a] border-gray-700 text-white"
                    data-testid="input-signup-name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-gray-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="signup-email"
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-10 bg-[#0a0a0a] border-gray-700 text-white"
                    data-testid="input-signup-email"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10 bg-[#0a0a0a] border-gray-700 text-white"
                    data-testid="input-signup-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isEmailSubmitting}
                className="w-full bg-[#c08e00] hover:bg-[#a07800] text-black font-medium"
                data-testid="button-signup-submit"
              >
                {isEmailSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Create Ambassador Account
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
