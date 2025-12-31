import { useEffect, useState } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { ArrowLeft, Mail, Sparkles, Loader2 } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { signInWithGoogle, handleRedirectResult } from "@/lib/firebase";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import logoImage from "@assets/Traveling_Church_Vector_SVG_1766874390629.png";

export default function Login() {
  const { isAuthenticated, isLoading, refetch } = useAuth();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const redirectTo = params.get("redirect") || "/";
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Sign In | The Traveling Church";
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
      setLocation(redirectTo);
    }
  }, [isLoading, isAuthenticated, redirectTo, setLocation]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        await refetch();
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background text-foreground antialiased min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-background text-foreground antialiased min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 py-12">
        <div className="max-w-md mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
            data-testid="link-back-home"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <Card className="border-2">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <img 
                  src={logoImage} 
                  alt="The Traveling Church" 
                  className="h-16"
                  data-testid="img-logo"
                />
              </div>
              <CardTitle className="text-2xl" data-testid="heading-sign-in">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-base">
                Sign in to access your account and AI Pastor Chat
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="w-full h-12 text-base"
                data-testid="button-continue-google"
              >
                {isSigningIn ? (
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                ) : (
                  <SiGoogle className="w-5 h-5 mr-3" />
                )}
                Continue with Google
              </Button>

              <Button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                variant="outline"
                className="w-full h-12 text-base"
                data-testid="button-continue-email"
              >
                <Mail className="w-5 h-5 mr-3" />
                Continue with Email
              </Button>

              <div className="relative py-4">
                <Separator />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-sm text-muted-foreground">
                  New here?
                </span>
              </div>

              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Get Started Free
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Create an account to try 10 free AI Pastor messages. Upgrade anytime for unlimited access.
                </p>
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  variant="secondary"
                  className="w-full"
                  data-testid="button-create-account"
                >
                  {isSigningIn ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Create Free Account
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground pt-2">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
