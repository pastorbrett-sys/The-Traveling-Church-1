import { useEffect, useState } from "react";
import { useSearch, useLocation, Link } from "wouter";
import { Mail, Sparkles, Loader2, Eye, EyeOff } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  resetPassword,
  getFirebaseErrorMessage,
  handleRedirectResult 
} from "@/lib/firebase";
import vagabondLogo from "@assets/Vagabond_Bible_AI_Icon_1767553973302.png";
import vagabondLogoWhite from "@assets/White_Logo_Big_1767755759050.png";
import { usePlatform } from "@/contexts/platform-context";

export default function Login() {
  const { isAuthenticated, isLoading, refetch } = useAuth();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const redirectTo = params.get("redirect") || "/pastor-chat";
  const { isNative } = usePlatform();
  
  const [activeTab, setActiveTab] = useState<string>("signin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");

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
    
    if (signUpPassword !== signUpConfirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }
    
    if (signUpPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsSubmitting(false);
      return;
    }
    
    try {
      await signUpWithEmail(signUpEmail, signUpPassword, signUpName);
      setSuccessMessage("Account created! We've sent a verification email to " + signUpEmail + ". Please check your inbox and verify your email, then sign in.");
      setActiveTab("signin");
      setSignInEmail(signUpEmail);
      setSignUpEmail("");
      setSignUpPassword("");
      setSignUpConfirmPassword("");
      setSignUpName("");
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
      <div className={`antialiased min-h-screen flex flex-col ${isNative ? 'text-white' : 'bg-[hsl(40,30%,96%)] text-foreground'}`} style={isNative ? { background: 'linear-gradient(to bottom, #1a1a1a 0%, #000000 100%)' } : undefined}>
        {!isNative && (
          <header className="bg-white border-b border-[hsl(30,20%,88%)] py-4">
            <div className="max-w-7xl mx-auto px-4 flex items-center">
              <Link href="/vagabond-bible" className="flex items-center">
                <img src={vagabondLogo} alt="Vagabond Bible" className="h-10 w-auto" />
              </Link>
            </div>
          </header>
        )}
        <main className="flex-1 flex items-center justify-center">
          <div className={`w-8 h-8 border-4 rounded-full animate-spin ${isNative ? 'border-white border-t-transparent' : 'border-[hsl(25,35%,45%)] border-t-transparent'}`} />
        </main>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className={`antialiased min-h-screen flex flex-col ${isNative ? 'text-white' : 'bg-[hsl(40,30%,96%)] text-foreground'}`} style={isNative ? { background: 'linear-gradient(to bottom, #1a1a1a 0%, #000000 100%)' } : undefined}>
      {!isNative && (
        <header className="bg-white border-b border-[hsl(30,20%,88%)] py-4">
          <div className="max-w-7xl mx-auto px-4 flex items-center">
            <Link href="/vagabond-bible" className="flex items-center">
              <img src={vagabondLogo} alt="Vagabond Bible" className="h-10 w-auto" />
            </Link>
          </div>
        </header>
      )}
      <main className={`flex-1 flex items-center justify-center ${isNative ? 'pt-12 pb-6 px-5' : 'py-12'}`}>
        <div className="max-w-md mx-auto w-full">
          <Card className={`${isNative ? 'border-0 shadow-none bg-transparent' : 'border-2 border-[hsl(30,20%,88%)]'}`}>
            <CardHeader className={`text-center ${isNative ? 'pb-4 pt-0' : 'pb-2'}`}>
              <div className={`flex justify-center ${isNative ? 'mb-4' : 'mb-3'}`}>
                <img src={isNative ? vagabondLogoWhite : vagabondLogo} alt="Vagabond Bible" className={`object-contain ${isNative ? 'h-16' : 'h-16'}`} style={isNative ? { marginLeft: '-13px' } : undefined} />
              </div>
              {!isNative && (
                <>
                  <CardTitle className="text-2xl text-[hsl(20,10%,20%)]" data-testid="heading-sign-in">Welcome Home</CardTitle>
                  <CardDescription className="text-base">Sign in or create an account</CardDescription>
                </>
              )}
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
                <TabsList className={`grid w-full grid-cols-2 ${isNative ? 'bg-[#2a2a2a]' : ''}`}>
                  <TabsTrigger value="signin" data-testid="tab-signin" className={isNative ? 'data-[state=active]:bg-[#3a3a3a] data-[state=active]:text-white text-gray-400' : ''}>Sign In</TabsTrigger>
                  <TabsTrigger value="signup" data-testid="tab-signup" className={isNative ? 'data-[state=active]:bg-[#3a3a3a] data-[state=active]:text-white text-gray-400' : ''}>Create Account</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-4 mt-4">
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className={isNative ? 'text-gray-300' : ''}>Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        required
                        data-testid="input-signin-email"
                        className={isNative ? 'bg-[#181818] border-[#2a2a2a] text-white placeholder:text-gray-500 focus:border-[#b8860b] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0' : ''}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className={isNative ? 'text-gray-300' : ''}>Password</Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          required
                          data-testid="input-signin-password"
                          className={isNative ? 'bg-[#181818] border-[#2a2a2a] text-white placeholder:text-gray-500 focus:border-[#b8860b] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0' : ''}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 ${isNative ? 'text-gray-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full h-11 ${isNative ? 'bg-[#b8860b] hover:bg-[#a07608] text-white border-0' : ''}`}
                      style={isNative ? {
                        animation: 'subtleGlow 3s ease-in-out infinite',
                      } : undefined}
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
                      className={`text-sm hover:underline w-full text-center ${isNative ? 'text-[#b8860b]' : 'text-primary'}`}
                      data-testid="button-forgot-password"
                    >
                      Forgot password?
                    </button>
                  </form>
                  
                  <div className={`flex items-center gap-3 py-2 ${isNative ? '' : ''}`}>
                    <div className={`flex-1 h-px ${isNative ? 'bg-[#333333]' : 'bg-border'}`} />
                    <span className={`text-sm ${isNative ? 'text-gray-500' : 'text-muted-foreground'}`}>or</span>
                    <div className={`flex-1 h-px ${isNative ? 'bg-[#333333]' : 'bg-border'}`} />
                  </div>
                  
                  <Button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                    variant="outline"
                    className={`w-full h-11 ${isNative ? 'bg-transparent border-[#333333] text-white hover:bg-[#222222]' : ''}`}
                    data-testid="button-signin-google"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <SiGoogle className="w-4 h-4 mr-2" />
                    )}
                    Continue with Google
                  </Button>
                  
                  <p className={`text-xs text-center ${isNative ? 'text-gray-500' : 'text-muted-foreground'}`}>
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4 mt-4">
                  <div className={`rounded-lg p-3 border mb-4 ${isNative ? 'bg-[hsl(25,35%,45%)]/10 border-[hsl(25,35%,45%)]/30' : 'bg-[hsl(25,35%,45%)]/5 border-[hsl(25,35%,45%)]/20'}`}>
                    <p className={`text-sm flex items-center gap-2 ${isNative ? 'text-gray-300' : ''}`}>
                      <Sparkles className="w-4 h-4 text-[hsl(25,35%,45%)]" />
                      Free to Sign up!
                    </p>
                  </div>
                  
                  <form onSubmit={handleEmailSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className={isNative ? 'text-gray-300' : ''}>Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Your name"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        data-testid="input-signup-name"
                        className={isNative ? 'bg-[#181818] border-[#2a2a2a] text-white placeholder:text-gray-500 focus:border-[#b8860b] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0' : ''}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className={isNative ? 'text-gray-300' : ''}>Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        required
                        data-testid="input-signup-email"
                        className={isNative ? 'bg-[#181818] border-[#2a2a2a] text-white placeholder:text-gray-500 focus:border-[#b8860b] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0' : ''}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className={isNative ? 'text-gray-300' : ''}>Password</Label>
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        required
                        data-testid="input-signup-password"
                        className={isNative ? 'bg-[#181818] border-[#2a2a2a] text-white placeholder:text-gray-500 focus:border-[#b8860b] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0' : ''}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password" className={isNative ? 'text-gray-300' : ''}>Confirm Password</Label>
                      <Input
                        id="signup-confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        required
                        data-testid="input-signup-confirm-password"
                        className={isNative ? 'bg-[#181818] border-[#2a2a2a] text-white placeholder:text-gray-500 focus:border-[#b8860b] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0' : ''}
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full h-11 ${isNative ? 'bg-[#b8860b] hover:bg-[#a07608] text-white border-0' : ''}`}
                      style={isNative ? {
                        animation: 'subtleGlow 3s ease-in-out infinite',
                      } : undefined}
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
                  
                  <div className={`flex items-center gap-3 py-2`}>
                    <div className={`flex-1 h-px ${isNative ? 'bg-[#333333]' : 'bg-border'}`} />
                    <span className={`text-sm ${isNative ? 'text-gray-500' : 'text-muted-foreground'}`}>or</span>
                    <div className={`flex-1 h-px ${isNative ? 'bg-[#333333]' : 'bg-border'}`} />
                  </div>
                  
                  <Button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                    variant="outline"
                    className={`w-full h-11 ${isNative ? 'bg-transparent border-[#333333] text-white hover:bg-[#222222]' : ''}`}
                    data-testid="button-signup-google"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <SiGoogle className="w-4 h-4 mr-2" />
                    )}
                    Sign up with Google
                  </Button>
                  
                  <p className={`text-xs text-center ${isNative ? 'text-gray-500' : 'text-muted-foreground'}`}>
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      {!isNative && (
        <footer className="py-6 text-center text-sm text-[hsl(20,10%,40%)]">
          <p>&copy; {new Date().getFullYear()} Vagabond Bible. All rights reserved.</p>
        </footer>
      )}
    </div>
  );
}
