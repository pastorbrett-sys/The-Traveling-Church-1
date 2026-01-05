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
      <div className="bg-[hsl(40,30%,96%)] text-foreground antialiased min-h-screen flex flex-col">
        <header className="bg-white border-b border-[hsl(30,20%,88%)] py-4">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
            <Link href="/vagabond-bible" className="flex items-center gap-2">
              <img src={vagabondLogo} alt="Vagabond Bible" className="h-10 w-auto" />
              <span className="font-heading text-xl font-bold text-[hsl(20,10%,20%)]">Vagabond Bible</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[hsl(25,35%,45%)] border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-[hsl(40,30%,96%)] text-foreground antialiased min-h-screen flex flex-col">
      <header className="bg-white border-b border-[hsl(30,20%,88%)] py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
          <Link href="/vagabond-bible" className="flex items-center gap-2">
            <img src={vagabondLogo} alt="Vagabond Bible" className="h-10 w-auto" />
            <span className="font-heading text-xl font-bold text-[hsl(20,10%,20%)]">Vagabond Bible</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 py-12 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 w-full">
          <Card className="border-2 border-[hsl(30,20%,88%)]">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl text-[hsl(20,10%,20%)]" data-testid="heading-sign-in">
                Welcome to Vagabond Bible
              </CardTitle>
              <CardDescription className="text-base">
                Sign in or create an account to start your journey
              </CardDescription>
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
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin" data-testid="tab-signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" data-testid="tab-signup">Create Account</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-4 mt-4">
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        required
                        data-testid="input-signin-email"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          required
                          data-testid="input-signin-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11"
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
                      className="text-sm text-primary hover:underline w-full text-center"
                      data-testid="button-forgot-password"
                    >
                      Forgot password?
                    </button>
                  </form>
                  
                  <div className="relative py-2">
                    <Separator />
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-sm text-muted-foreground">
                      or
                    </span>
                  </div>
                  
                  <Button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                    variant="outline"
                    className="w-full h-11"
                    data-testid="button-signin-google"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <SiGoogle className="w-4 h-4 mr-2" />
                    )}
                    Continue with Google
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4 mt-4">
                  <div className="bg-[hsl(25,35%,45%)]/5 rounded-lg p-3 border border-[hsl(25,35%,45%)]/20 mb-4">
                    <p className="text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[hsl(25,35%,45%)]" />
                      Get 10 free messages when you sign up!
                    </p>
                  </div>
                  
                  <form onSubmit={handleEmailSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Your name"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        data-testid="input-signup-name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        required
                        data-testid="input-signup-email"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        required
                        data-testid="input-signup-password"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                      <Input
                        id="signup-confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        required
                        data-testid="input-signup-confirm-password"
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11"
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
                  
                  <div className="relative py-2">
                    <Separator />
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-sm text-muted-foreground">
                      or
                    </span>
                  </div>
                  
                  <Button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                    variant="outline"
                    className="w-full h-11"
                    data-testid="button-signup-google"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <SiGoogle className="w-4 h-4 mr-2" />
                    )}
                    Sign up with Google
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-[hsl(20,10%,40%)]">
        <p>&copy; {new Date().getFullYear()} Vagabond Bible. All rights reserved.</p>
      </footer>
    </div>
  );
}
