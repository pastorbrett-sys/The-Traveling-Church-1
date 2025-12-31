import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, User, Mail, Sparkles, CreditCard, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

interface SubscriptionStatus {
  subscription: {
    id: string;
    status: string;
    cancel_at_period_end: boolean;
    current_period_end: number;
    plan?: {
      amount: number;
      interval: string;
    };
  } | null;
  isProUser: boolean;
  stripeCustomerId: string | null;
}

export default function Profile() {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  const { data: subscriptionStatus, isLoading: isSubLoading } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/stripe/my-subscription"],
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    document.title = "My Profile | The Traveling Church";
  }, []);

  const handleManageSubscription = async () => {
    setIsOpeningPortal(true);
    try {
      const res = await apiRequest("POST", "/api/stripe/my-portal");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
    } finally {
      setIsOpeningPortal(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="bg-background text-foreground antialiased min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-background text-foreground antialiased min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-5 pb-16">
          <div className="max-w-2xl mx-auto px-4 md:px-8">
            <Link
              href="/"
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
              data-testid="link-back-home"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <CardTitle data-testid="heading-login-required">Sign In Required</CardTitle>
                <CardDescription>
                  Please sign in to view your profile and manage your subscription.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Link href="/login?redirect=/profile">
                  <Button data-testid="button-login">
                    Sign In to Continue
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isPro = subscriptionStatus?.isProUser || false;
  const subscription = subscriptionStatus?.subscription;
  const isCancelling = subscription?.cancel_at_period_end;

  return (
    <div className="bg-background text-foreground antialiased min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-5 pb-16">
        <div className="max-w-2xl mx-auto px-4 md:px-8">
          <Link
            href="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
            data-testid="link-back-home"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="heading-profile">
                  <User className="w-5 h-5" />
                  My Profile
                </CardTitle>
                <CardDescription>
                  Manage your account and subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover"
                      data-testid="img-profile"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold" data-testid="text-user-name">
                      {user?.firstName || user?.username || "User"}
                      {user?.lastName ? ` ${user.lastName}` : ""}
                    </h2>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm" data-testid="text-user-id">ID: {user?.id}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="heading-subscription">
                  <CreditCard className="w-5 h-5" />
                  Subscription
                </CardTitle>
                <CardDescription>
                  Your current plan and billing
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSubLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : isPro ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-primary" data-testid="badge-pro">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Pro Plan
                        </Badge>
                        {isCancelling && (
                          <Badge variant="outline" className="text-orange-500 border-orange-500" data-testid="badge-cancelling">
                            Cancelling
                          </Badge>
                        )}
                      </div>
                      <span className="text-lg font-semibold" data-testid="text-price">$9.99/month</span>
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span data-testid="text-status">
                          Status: <span className="text-foreground font-medium capitalize">{subscription?.status || "Active"}</span>
                        </span>
                      </div>
                      {subscription?.current_period_end && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span data-testid="text-period-end">
                            {isCancelling ? "Access until: " : "Next billing: "}
                            <span className="text-foreground font-medium">
                              {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>

                    {isCancelling && (
                      <div className="flex items-start gap-2 p-3 bg-orange-500/10 rounded-lg text-sm">
                        <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                        <p className="text-muted-foreground" data-testid="text-cancel-notice">
                          Your subscription has been cancelled. You'll retain Pro access until the end of your billing period.
                        </p>
                      </div>
                    )}

                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleManageSubscription}
                        disabled={isOpeningPortal}
                        className="w-full sm:w-auto"
                        data-testid="button-manage-subscription"
                      >
                        {isOpeningPortal ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Opening...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Manage Subscription
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Update payment method, view invoices, or cancel your subscription
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" data-testid="badge-free">
                        Free Plan
                      </Badge>
                    </div>

                    <Separator />

                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                      <h3 className="font-semibold flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Upgrade to Pro
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Get unlimited AI Pastor conversations and exclusive features for $9.99/month.
                      </p>
                      <Link href="/pastor-chat">
                        <Button size="sm" data-testid="button-upgrade">
                          Try AI Pastor Chat
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
