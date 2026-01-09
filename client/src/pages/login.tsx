import { useEffect, useState } from "react";
import { useSearch, useLocation } from "wouter";
import { Mail, Loader2, Eye, EyeOff } from "lucide-react";
import { SiGoogle } from "react-icons/si";
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
  handleRedirectResult 
} from "@/lib/firebase";
import vagabondLogoWhite from "@assets/White_Logo_Big_1767755759050.png";

export default function Login() {
  const { isAuthenticated, isLoading, refetch } = useAuth();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const redirectTo = params.get("redirect") || "/pastor-chat";
  
  const [activeTab, setActiveTab] = useState<string>("signin");
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
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

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.scrollTo(0, 0);
      setLocation(redirectTo);
    }
  }, [isLoading, isAuthenticated, redirectTo, setLocation]);

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        await refetch();
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
    setIsEmailSubmitting(true);
    setError(null);
    
    try {
      await signInWithEmail(signInEmail, signInPassword);
      await refetch();
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(getFirebaseErrorMessage(err.code));
    } finally {
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
      <div className="antialiased min-h-screen flex flex-col text-white" style={{ background: 'linear-gradient(to bottom, #1a1a1a 0%, #000000 100%)' }}>
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 rounded-full animate-spin border-white border-t-transparent" />
        </main>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="antialiased min-h-screen flex flex-col text-white" style={{ background: 'linear-gradient(to bottom, #1a1a1a 0%, #000000 100%)' }}>
      <main className="flex-1 flex items-center justify-center pt-12 pb-6 px-5">
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
