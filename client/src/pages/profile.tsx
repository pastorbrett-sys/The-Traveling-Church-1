import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, User, Mail, Sparkles, CreditCard, Calendar, AlertCircle, Loader2, Search, BookOpen, MessageSquare, StickyNote, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import vagabondLogo from "@assets/Vagabond_Bible_AI_Icon_1767553973302.png";

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

interface UsageItem {
  used: number;
  limit: number;
  remaining: number;
}

interface UsageSummary {
  smart_search: UsageItem;
  book_synopsis: UsageItem;
  verse_insight: UsageItem;
  notes: UsageItem;
  resetAt: string;
  isPro: boolean;
}

export default function Profile() {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  const { data: subscriptionStatus, isLoading: isSubLoading } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/stripe/my-subscription"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: usageSummary, isLoading: isUsageLoading } = useQuery<UsageSummary>({
    queryKey: ["/api/usage/summary"],
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    document.title = "My Profile | Vagabond Bible";
  }, []);

  const handleManageSubscription = async () => {
    setIsOpeningPortal(true);
    try {
      const res = await apiRequest("POST", "/api/stripe/my-portal");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.customerReset) {
        // Customer was reset, reload the page to show updated state
        window.location.reload();
      }
    } catch (error) {
      console.error("Portal error:", error);
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const VagabondHeader = () => (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-[hsl(30,20%,88%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/vagabond-bible">
            <img src={vagabondLogo} alt="Vagabond Bible AI" className="h-10" data-testid="img-vagabond-logo" />
          </Link>
        </div>
      </div>
    </nav>
  );

  if (isAuthLoading) {
    return (
      <div className="bg-[hsl(40,30%,96%)] text-foreground antialiased min-h-screen flex flex-col">
        <VagabondHeader />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[hsl(25,35%,45%)]" />
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-[hsl(40,30%,96%)] text-foreground antialiased min-h-screen flex flex-col">
        <VagabondHeader />
        <main className="flex-1 pt-5 pb-16">
          <div className="max-w-2xl mx-auto px-4 md:px-8">
            <Link
              href="/vagabond-bible"
              className="inline-flex items-center text-[hsl(20,10%,40%)] hover:text-[hsl(20,10%,20%)] mb-6 transition-colors"
              data-testid="link-back-home"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Vagabond Bible
            </Link>

            <Card className="border-[hsl(30,20%,88%)]">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-[hsl(25,35%,45%)]/10 flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-[hsl(25,35%,45%)]" />
                </div>
                <CardTitle data-testid="heading-login-required">Sign In Required</CardTitle>
                <CardDescription>
                  Please sign in to view your profile and manage your subscription.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Link href="/login?redirect=/profile">
                  <Button className="bg-[hsl(25,35%,45%)] hover:bg-[hsl(25,35%,38%)]" data-testid="button-login">
                    Sign In to Continue
                  </Button>
                </Link>
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

  const isPro = subscriptionStatus?.isProUser || false;
  const subscription = subscriptionStatus?.subscription;
  const isCancelling = subscription?.cancel_at_period_end;

  return (
    <div className="bg-[hsl(40,30%,96%)] text-foreground antialiased min-h-screen flex flex-col">
      <VagabondHeader />

      <main className="flex-1 pt-5 pb-16">
        <div className="max-w-2xl mx-auto px-4 md:px-8">
          <Link
            href="/vagabond-bible"
            className="inline-flex items-center text-[hsl(20,10%,40%)] hover:text-[hsl(20,10%,20%)] mb-6 transition-colors"
            data-testid="link-back-home"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vagabond Bible
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
                      {user?.firstName || "User"}
                      {user?.lastName ? ` ${user.lastName}` : ""}
                    </h2>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm truncate max-w-[120px] sm:max-w-none sm:truncate-none" data-testid="text-user-id">ID: {user?.id}</span>
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
                        Get unlimited conversations and exclusive features for $9.99/month.
                      </p>
                      <Link href="/pastor-chat?upgrade=true">
                        <Button size="sm" className="bg-[hsl(25,35%,45%)] hover:bg-[hsl(25,35%,38%)]" data-testid="button-upgrade">
                          Upgrade Now!
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="heading-usage">
                  <Sparkles className="w-5 h-5" />
                  AI Credits Remaining
                </CardTitle>
                <CardDescription>
                  {usageSummary?.isPro 
                    ? "You have unlimited access to all features"
                    : `Your usage resets ${usageSummary?.resetAt ? new Date(usageSummary.resetAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'next month'}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isUsageLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[
                      { 
                        key: 'smart_search', 
                        label: 'Smart Searches', 
                        icon: Search,
                        data: usageSummary?.smart_search,
                        description: 'AI-powered Bible searches'
                      },
                      { 
                        key: 'book_synopsis', 
                        label: 'Book Synopses', 
                        icon: BookOpen,
                        data: usageSummary?.book_synopsis,
                        description: 'AI book overviews'
                      },
                      { 
                        key: 'verse_insight', 
                        label: 'Verse Insights', 
                        icon: MessageSquare,
                        data: usageSummary?.verse_insight,
                        description: 'AI verse explanations'
                      },
                      { 
                        key: 'notes', 
                        label: 'Saved Notes', 
                        icon: StickyNote,
                        data: usageSummary?.notes,
                        description: 'Personal study notes'
                      },
                    ].map(({ key, label, icon: Icon, data, description }) => (
                      <div key={key} className="flex items-center justify-between py-2" data-testid={`usage-row-${key}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[hsl(25,35%,45%)]/10 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-[hsl(25,35%,45%)]" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{label}</p>
                            <p className="text-xs text-muted-foreground">{description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {usageSummary?.isPro ? (
                            <Badge variant="outline" className="border-[hsl(25,35%,45%)] text-[hsl(25,35%,45%)]" data-testid={`badge-unlimited-${key}`}>
                              <Infinity className="w-3 h-3 mr-1" />
                              Unlimited
                            </Badge>
                          ) : (
                            <span className="text-sm font-medium" data-testid={`text-usage-${key}`}>
                              {data?.remaining ?? 0} of {data?.limit ?? 0}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {!usageSummary?.isPro && (
                      <>
                        <Separator className="my-4" />
                        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                          <p className="text-sm text-muted-foreground mb-3">
                            Want unlimited access to all features?
                          </p>
                          <Link href="/pastor-chat?upgrade=true">
                            <Button size="sm" className="bg-[hsl(25,35%,45%)] hover:bg-[hsl(25,35%,38%)]" data-testid="button-upgrade-usage">
                              <Sparkles className="w-4 h-4 mr-2" />
                              Upgrade to Pro
                            </Button>
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-[hsl(20,10%,40%)]">
        <p>&copy; {new Date().getFullYear()} Vagabond Bible. All rights reserved.</p>
      </footer>
    </div>
  );
}
