import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ArrowLeft, User, Mail, CreditCard, Calendar, AlertCircle, Loader2, Search, BookOpen, MessageSquare, StickyNote, Infinity, MessagesSquare, LogOut, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { openExternalUrl } from "@/lib/open-url";
import { usePlatform } from "@/contexts/platform-context";
import { useRevenueCat } from "@/contexts/revenuecat-context";
import { useToast } from "@/hooks/use-toast";
import { UpgradeDialog } from "@/components/upgrade-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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

interface ProfileData {
  subscription: SubscriptionStatus;
  usage: UsageSummary;
}


export default function Profile() {
  const { user, isLoading: isAuthLoading, isAuthenticated, logout, isLoggingOut } = useAuth();
  const [, setLocation] = useLocation();
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isNative, platform } = usePlatform();
  const { restorePurchases, isProUser: isRevenueCatPro, refreshEntitlements } = useRevenueCat();
  const { toast } = useToast();

  // Combined API call - fetches subscription and usage in one request
  const { data: profileData, isLoading: isProfileLoading } = useQuery<ProfileData>({
    queryKey: ["/api/profile/data"],
    enabled: isAuthenticated,
    retry: false,
    staleTime: 60000, // Cache for 1 minute - prevents refetch on every tab switch
  });

  // Extract data from combined response
  const subscriptionStatus = profileData?.subscription;
  const usageSummary = profileData?.usage;
  const isSubLoading = isProfileLoading;
  const isUsageLoading = isProfileLoading;


  useEffect(() => {
    document.title = "My Profile | Vagabond Bible";
    console.log('[Profile] platform:', platform, 'isNative:', isNative);
  }, [platform, isNative]);

  // Helper function to get Android/iOS status bar padding - same pattern as navigation.tsx
  const getMainStyle = () => {
    if (!isNative) {
      return { paddingTop: '1.25rem', paddingBottom: '4rem' };
    }
    if (platform === 'android') {
      return { 
        paddingTop: 'calc(var(--android-status-bar-height, 44px) + 16px)',
        paddingBottom: 'calc(64px + 16px)' 
      };
    }
    // iOS
    return { 
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
      paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px) + 16px)' 
    };
  };

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

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await apiRequest("DELETE", "/api/account");
      if (res.ok) {
        toast({
          title: "Account Deleted",
          description: "Your account and all data have been permanently deleted.",
        });
        await logout();
        setLocation("/");
      } else {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete account");
      }
    } catch (error: any) {
      console.error("Delete account error:", error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Unable to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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

  // Skeleton loader for perceived faster loading
  const ProfileSkeleton = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Separator className="my-4" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-6 w-28" />
          </div>
          <Skeleton className="h-4 w-40 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Separator />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-6 w-36" />
          </div>
          <Skeleton className="h-4 w-52 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isAuthLoading) {
    return (
      <div className={`bg-[hsl(40,30%,96%)] text-foreground antialiased flex flex-col ${
        isNative ? "h-screen overflow-hidden" : "min-h-screen"
      }`}>
        {!isNative && <VagabondHeader />}
        <main 
          className="flex-1 overflow-y-auto"
          style={getMainStyle()}
        >
          <div className="max-w-2xl mx-auto px-4 md:px-8">
            <ProfileSkeleton />
          </div>
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
        <main 
          className="flex-1 overflow-y-auto"
          style={getMainStyle()}
        >
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

      <main 
        className="flex-1 overflow-y-auto"
        style={getMainStyle()}
      >
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
                    setLocation("/login");
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

          {/* Delete Account */}
          <div className="pt-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  data-testid="button-delete-account"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[hsl(40,30%,96%)]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-600">Delete Account</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="text-left space-y-2 text-sm text-muted-foreground">
                      <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                      <p className="font-medium text-foreground">The following will be permanently deleted:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Your profile and account information</li>
                        <li>All saved notes and highlights</li>
                        <li>Chat conversation history</li>
                        <li>Usage data and preferences</li>
                      </ul>
                      <p className="mt-2 font-medium text-red-600">Important: If you have an active Pro subscription, you must cancel it separately in your device's Settings → Subscriptions to stop billing. Deleting your account does not automatically cancel your subscription.</p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    data-testid="button-confirm-delete"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Account"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Legal Links - inline at bottom of content */}
          <div className={`text-center ${isNative ? 'pt-4 pb-32' : 'py-4'}`}>
            <p className="text-xs text-[hsl(20,10%,50%)]">
              <button 
                type="button"
                onClick={() => openExternalUrl("/privacy-policy")}
                className="underline hover:text-[hsl(20,10%,35%)]"
                data-testid="link-privacy-policy-profile"
              >
                Privacy Policy
              </button>
              <span className="mx-2">|</span>
              <button 
                type="button"
                onClick={() => openExternalUrl("/terms-of-service")}
                className="underline hover:text-[hsl(20,10%,35%)]"
                data-testid="link-terms-of-service-profile"
              >
                Terms of Service
              </button>
            </p>
          </div>
        </div>
      </main>

      <UpgradeDialog open={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  );
}
