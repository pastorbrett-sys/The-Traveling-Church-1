import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ArrowLeft, User, Mail, CreditCard, Calendar, AlertCircle, Loader2, Search, BookOpen, MessageSquare, StickyNote, Infinity, MessagesSquare, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, apiFetch } from "@/lib/queryClient";
import { openExternalUrl } from "@/lib/open-url";
import { usePlatform } from "@/contexts/platform-context";
import { useRevenueCat } from "@/contexts/revenuecat-context";
import { useToast } from "@/hooks/use-toast";
import vagabondLogo from "@/assets/vagabond-logo.png";
import upgradeIcon from "@assets/Uppgrade_icon_1767730633674.png";

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
  chat_message: UsageItem;
  resetAt: string;
  isPro: boolean;
}


export default function Profile() {
  const { user, isLoading: isAuthLoading, isAuthenticated, logout, isLoggingOut } = useAuth();
  const [, setLocation] = useLocation();
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const { isNative } = usePlatform();
  const { purchaseProduct, restorePurchases, isProUser: isRevenueCatPro, refreshEntitlements } = useRevenueCat();
  const { toast } = useToast();

  const { data: subscriptionStatus, isLoading: isSubLoading } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/stripe/my-subscription"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: usageSummary, isLoading: isUsageLoading } = useQuery<UsageSummary>({
    queryKey: ["/api/usage/summary"],
    enabled: isAuthenticated,
    retry: false,
    refetchOnMount: "always",
    staleTime: 0,
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
        await openExternalUrl(data.url);
      } else if (data.customerReset) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Portal error:", error);
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const handleSubscribe = async () => {
    setIsCheckingOut(true);
    try {
      const productsRes = await apiFetch("/api/stripe/products-with-prices");
      if (!productsRes.ok) throw new Error("Failed to load products");
      const productsData = await productsRes.json();
      const proPlan = productsData.data?.find((p: any) => p.metadata?.tier === "pro");
      if (!proPlan) throw new Error("Pro plan not found");
      const proPrice = proPlan?.prices?.find((p: any) => p.recurring?.interval === "month");
      if (!proPrice) throw new Error("Monthly price not found");
      
      const checkoutRes = await apiRequest("POST", "/api/stripe/checkout", { priceId: proPrice.id });
      const checkoutData = await checkoutRes.json();
      if (checkoutData.url) {
        await openExternalUrl(checkoutData.url);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Unable to start checkout. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleNativePurchase = async () => {
    setIsPurchasing(true);
    try {
      const success = await purchaseProduct("vagabond_bible_pro_monthly");
      if (success) {
        setShowPaywall(false);
        toast({
          title: "Welcome to Pro!",
          description: "Your subscription is now active. Enjoy unlimited access!",
        });
        await refreshEntitlements();
      }
    } catch (error) {
      console.error("Native purchase error:", error);
      toast({
        title: "Purchase Failed",
        description: "Unable to complete purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    try {
      const success = await restorePurchases();
      if (success) {
        toast({
          title: "Purchases Restored",
          description: "Your Pro subscription has been restored successfully!",
        });
        await refreshEntitlements();
      } else {
        toast({
          title: "No Purchases Found",
          description: "No previous purchases were found for this account.",
        });
      }
    } catch (error) {
      console.error("Restore error:", error);
      toast({
        title: "Restore Failed",
        description: "Unable to restore purchases. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
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
      <div className={`bg-[hsl(40,30%,96%)] text-foreground antialiased flex flex-col ${
        isNative ? "h-screen overflow-hidden" : "min-h-screen"
      }`}>
        {!isNative && <VagabondHeader />}
        <main className={`flex-1 flex items-center justify-center ${isNative ? "safe-area-top" : ""}`}>
          <Loader2 className="w-8 h-8 animate-spin text-[hsl(25,35%,45%)]" />
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`bg-[hsl(40,30%,96%)] text-foreground antialiased flex flex-col ${
        isNative ? "h-screen overflow-hidden" : "min-h-screen"
      }`}>
        {!isNative && <VagabondHeader />}
        <main className={`flex-1 overflow-y-auto ${isNative ? "safe-area-top pb-20 pt-4" : "pt-5 pb-16"}`}>
          <div className="max-w-2xl mx-auto px-4 md:px-8">
            {!isNative && (
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center text-[hsl(20,10%,40%)] hover:text-[hsl(20,10%,20%)] mb-6 transition-colors"
                data-testid="link-back-home"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
            )}

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
        {!isNative && (
          <footer className="py-6 text-center text-sm text-[hsl(20,10%,40%)]">
            <p>&copy; {new Date().getFullYear()} Vagabond Bible. All rights reserved.</p>
          </footer>
        )}
      </div>
    );
  }

  const isPro = subscriptionStatus?.isProUser || isRevenueCatPro || false;
  const subscription = subscriptionStatus?.subscription;
  const isCancelling = subscription?.cancel_at_period_end;

  return (
    <div className={`bg-[hsl(40,30%,96%)] text-foreground antialiased flex flex-col ${
      isNative ? "h-screen overflow-hidden" : "min-h-screen"
    }`}>
      {!isNative && <VagabondHeader />}

      <main className={`flex-1 overflow-y-auto ${isNative ? "safe-area-top pb-20 pt-4" : "pt-5 pb-16"}`}>
        <div className="max-w-2xl mx-auto px-4 md:px-8">
          {!isNative && (
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center text-[hsl(20,10%,40%)] hover:text-[hsl(20,10%,20%)] mb-6 transition-colors"
              data-testid="link-back-home"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          )}

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

                <Separator className="my-4" />

                <Button
                  variant="outline"
                  onClick={async () => {
                    await logout();
                    setLocation("/vagabond-bible");
                  }}
                  disabled={isLoggingOut}
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  data-testid="button-logout"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing Out...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </>
                  )}
                </Button>
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
                        <Badge variant="default" className="bg-[hsl(25,35%,45%)]" data-testid="badge-pro">
                          <img src={upgradeIcon} alt="" className="w-3 h-3 mr-1" />
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
                      {isNative && isRevenueCatPro && !subscription ? (
                        <>
                          <p className="text-sm text-muted-foreground">
                            To manage your subscription, go to your device Settings → Subscriptions.
                          </p>
                          <Button
                            variant="ghost"
                            onClick={handleRestorePurchases}
                            disabled={isRestoring}
                            className="mt-2 text-sm"
                            data-testid="button-refresh-subscription"
                          >
                            {isRestoring ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Refreshing...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh Subscription Status
                              </>
                            )}
                          </Button>
                        </>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-[#ffffff]" data-testid="badge-free">
                        Free Plan
                      </Badge>
                    </div>

                    <Separator />

                    <div className="bg-[hsl(25,35%,45%)]/5 rounded-lg p-4 border border-[hsl(25,35%,45%)]/20">
                      <h3 className="font-semibold flex items-center gap-2 mb-2 text-[hsl(20,10%,20%)]">
                        <img src={upgradeIcon} alt="" className="w-5 h-5" />
                        Upgrade to Pro
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Get unlimited conversations and exclusive features for $9.99/month.
                      </p>
                      <Button size="sm" className="btn-upgrade" data-testid="button-upgrade" onClick={() => setShowPaywall(true)}>
                        Upgrade Now!
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="heading-usage">
                  <img src={upgradeIcon} alt="" className="w-5 h-5" />
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
                        key: 'chat_message', 
                        label: 'Pastor Chat Messages', 
                        icon: MessagesSquare,
                        data: usageSummary?.chat_message,
                        description: 'AI pastoral conversations'
                      },
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
                        <div className="bg-[hsl(25,35%,45%)]/5 rounded-lg p-4 border border-[hsl(25,35%,45%)]/20">
                          <p className="text-sm text-muted-foreground mb-3">
                            Want unlimited access to all features?
                          </p>
                          <Button size="sm" className="btn-upgrade" data-testid="button-upgrade-usage" onClick={() => setShowPaywall(true)}>
                            Upgrade to Pro
                          </Button>
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

      {!isNative && (
        <footer className="py-6 text-center text-sm text-[hsl(20,10%,40%)]">
          <p>&copy; {new Date().getFullYear()} Vagabond Bible. All rights reserved.</p>
        </footer>
      )}

      {/* Upgrade Modal */}
      <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
        <DialogContent className="fixed left-0 top-0 translate-x-0 translate-y-0 h-[100dvh] max-h-[100dvh] w-full rounded-none border-0 sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:h-auto sm:max-h-[85vh] sm:max-w-md sm:rounded-lg sm:border bg-[hsl(40,30%,96%)] sm:border-[hsl(30,20%,88%)] overflow-y-auto p-0">
          <div className={`flex flex-col justify-center min-h-full p-6 sm:p-6 ${isNative ? 'pt-12' : ''}`}>
            <DialogHeader className="text-center">
              <div className={`mx-auto w-20 h-20 sm:w-16 sm:h-16 flex items-center justify-center ${isNative ? 'mb-6' : 'mb-4 sm:mb-2'}`}>
                <img src={upgradeIcon} alt="Upgrade" className="w-20 h-20 sm:w-16 sm:h-16" />
              </div>
              <DialogTitle className="text-2xl sm:text-xl text-[hsl(20,10%,20%)]">
                Upgrade to Pro
              </DialogTitle>
              <DialogDescription className={`text-[hsl(20,10%,40%)] ${isNative ? 'text-sm mt-3' : 'text-base sm:text-sm'}`}>
                Enjoy Vagabond Bible for free, anytime. Upgrade to Pro to unlock optional advanced AI features for deeper study and insight. Cancel anytime.
              </DialogDescription>
            </DialogHeader>
            
            <div className={`bg-white/50 rounded-lg p-5 sm:p-4 border border-[hsl(30,20%,88%)] ${isNative ? 'mt-8' : 'mt-6 sm:mt-4'}`}>
              <h3 className="font-semibold text-lg sm:text-base mb-3 sm:mb-2 text-[hsl(20,10%,20%)]">Upgrade to Pro for:</h3>
              <ul className={`${isNative ? 'space-y-3' : 'space-y-2 sm:space-y-2'} text-base sm:text-sm text-[hsl(20,10%,35%)]`}>
                <li>• Unlimited Smart Searches</li>
                <li>• Unlimited Book Synopses</li>
                <li>• Unlimited Verse Insights</li>
                <li>• Unlimited Notes</li>
              </ul>
            </div>
            
            <div className="flex flex-col gap-3 sm:gap-2 mt-8 sm:mt-4">
              {isNative ? (
                <>
                  <Button 
                    onClick={handleNativePurchase} 
                    className="w-full btn-upgrade py-6 sm:py-4 text-[16px] font-medium" 
                    disabled={isPurchasing}
                    data-testid="button-checkout"
                  >
                    {isPurchasing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : "Subscribe Now - $9.99/month"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleRestorePurchases}
                    disabled={isRestoring}
                    className="w-full text-sm hover:bg-[#c08e00]/10 hover:text-[#c08e00]"
                    data-testid="button-restore-purchases"
                  >
                    {isRestoring ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Restoring...
                      </>
                    ) : "Restore Purchases"}
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={handleSubscribe} 
                    className="w-full btn-upgrade py-6 sm:py-4 text-[16px] font-medium" 
                    disabled={isCheckingOut}
                    data-testid="button-checkout"
                  >
                    {isCheckingOut ? "Redirecting..." : "Subscribe Now"}
                  </Button>
                  <p className="text-xs text-center text-[hsl(20,10%,40%)]">
                    Cancel anytime. Secure payment via Stripe.
                  </p>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
