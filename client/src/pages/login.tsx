import { useEffect, useState } from "react";
import { useSearch, useLocation } from "wouter";
import { Mail, Loader2, Eye, EyeOff } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setIsSubmitting(true);
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
      setIsSubmitting(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await signInWithEmail(signInEmail, signInPassword);
      await refetch();
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(getFirebaseErrorMessage(err.code));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    if (signUpPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsSubmitting(false);
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
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!signInEmail) {
      setError("Please enter your email address first.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await resetPassword(signInEmail);
      setSuccessMessage("Password reset email sent to " + signInEmail + "! Check your inbox and follow the link to reset your password.");
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(getFirebaseErrorMessage(err.code));
    } finally {
      setIsSubmitting(false);
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
          <Card className="border-0 shadow-none bg-transparent">
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

              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setError(null); setSuccessMessage(null); }}>
                <TabsList className="grid w-full grid-cols-2 bg-[#2a2a2a]">
                  <TabsTrigger value="signin" data-testid="tab-signin" className="data-[state=active]:bg-[#3a3a3a] data-[state=active]:text-white text-gray-400">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" data-testid="tab-signup" className="data-[state=active]:bg-[#3a3a3a] data-[state=active]:text-white text-gray-400">Create Account</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-4 mt-4">
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-gray-300">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        required
                        data-testid="input-signin-email"
                        className="bg-[#181818] border-[#2a2a2a] text-white placeholder:text-gray-500 focus:border-[#b8860b] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-gray-300">Password</Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          required
                          data-testid="input-signin-password"
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
                      disabled={isSubmitting}
                      className="w-full h-11 bg-[#b8860b] hover:bg-[#a07608] text-white border-0"
                      style={{ animation: 'subtleGlow 3s ease-in-out infinite' }}
                      data-testid="button-signin-email"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Sign In
                    </Button>
                    
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm hover:underline w-full text-center text-[#b8860b]"
                      data-testid="button-forgot-password"
                    >
                      Forgot password?
                    </button>
                  </form>
                  
                  <div className="flex items-center gap-3 py-2">
                    <div className="flex-1 h-px bg-[#333333]" />
                    <span className="text-sm text-gray-500">or</span>
                    <div className="flex-1 h-px bg-[#333333]" />
                  </div>
                  
                  <Button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                    variant="outline"
                    className="w-full h-11 bg-transparent border-[#333333] text-white hover:bg-[#222222]"
                    data-testid="button-signin-google"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <SiGoogle className="w-4 h-4 mr-2" />
                    )}
                    Continue with Google
                  </Button>
                  
                  <p className="text-xs text-center text-gray-500">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4 mt-4">
                  <form onSubmit={handleEmailSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-gray-300">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        required
                        data-testid="input-signup-email"
                        className="bg-[#181818] border-[#2a2a2a] text-white placeholder:text-gray-500 focus:border-[#b8860b] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-gray-300">Password</Label>
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        required
                        data-testid="input-signup-password"
                        className="bg-[#181818] border-[#2a2a2a] text-white placeholder:text-gray-500 focus:border-[#b8860b] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 bg-[#b8860b] hover:bg-[#a07608] text-white border-0"
                      style={{ animation: 'subtleGlow 3s ease-in-out infinite' }}
                      data-testid="button-signup-email"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4 mr-2" />
                      )}
                      Create Account
                    </Button>
                  </form>
                  
                  <div className="flex items-center gap-3 py-2">
                    <div className="flex-1 h-px bg-[#333333]" />
                    <span className="text-sm text-gray-500">or</span>
                    <div className="flex-1 h-px bg-[#333333]" />
                  </div>
                  
                  <Button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                    variant="outline"
                    className="w-full h-11 bg-transparent border-[#333333] text-white hover:bg-[#222222]"
                    data-testid="button-signup-google"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <SiGoogle className="w-4 h-4 mr-2" />
                    )}
                    Sign up with Google
                  </Button>
                  
                  <p className="text-xs text-center text-gray-500">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
