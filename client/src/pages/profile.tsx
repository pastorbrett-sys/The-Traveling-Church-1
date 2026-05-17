import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ArrowLeft, User, Mail, CreditCard, Calendar, AlertCircle, Loader2, Search, BookOpen, MessageSquare, StickyNote, Infinity as InfinityIcon, MessagesSquare, LogOut, RefreshCw, Trash2, Award, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, apiFetch } from "@/lib/queryClient";
import { openExternalUrl } from "@/lib/open-url";
import { usePlatform } from "@/contexts/platform-context";
import { useRevenueCat } from "@/contexts/revenuecat-context";
import { useToast } from "@/hooks/use-toast";
import { UpgradeDialog } from "@/components/upgrade-dialog";
import { getDefaultBibleTranslation } from "@/lib/i18n";
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
import vagabondLogo from "@assets/Sea Scroll Logo Black.svg";
import upgradeIcon from "@assets/Uppgrade_icon_1767730633674.png";
import { NotificationSettings } from "@/components/notification-settings";
import { TraditionSettings } from "@/components/tradition-settings";

interface PricingTierResponse {
  tier: 'premium' | 'emerging';
  price: number;
  priceDisplay: string;
  detectedCountry: string;
}

// Check if translation is Amharic-based
function isAmharicTranslation(translation: string): boolean {
  return translation === "ETH" || translation === "AMPROT";
}

// Localized UI text for Profile page
const profileUiText = {
  en: {
    myProfile: "My Profile",
    back: "Back",
    signInRequired: "Sign In Required",
    signInDescription: "Please sign in to view your profile and manage your subscription.",
    signInToContinue: "Sign In to Continue",
    accountInformation: "Account Information",
    manageAccountDetails: "Manage your account details",
    name: "Name",
    email: "Email",
    signOut: "Sign Out",
    subscription: "Subscription",
    currentPlanAndBilling: "Your current plan and billing",
    currentPlan: "Current Plan",
    free: "Free",
    pro: "Pro",
    proPlan: "Pro Plan",
    status: "Status",
    active: "Active",
    month: "month",
    canceled: "Canceled",
    pastDue: "Past Due",
    trialing: "Trial",
    incomplete: "Incomplete",
    activeSubscription: "Active Subscription",
    canceledEnds: "Canceled - ends",
    cancelling: "Cancelling",
    accessUntil: "Access until: ",
    nextBilling: "Next billing: ",
    manageSubscription: "Manage Subscription",
    restorePurchases: "Restore Purchases",
    upgradeToPro: "Upgrade to Pro",
    usageThisPeriod: "Usage This Period",
    trackDailyUsage: "Track your daily feature usage",
    resetsAt: "Resets",
    smartSearch: "Smart Search",
    bookSynopsis: "Book Synopsis",
    verseInsight: "Verse Insights",
    notes: "Notes",
    chatMessages: "Chat Messages",
    unlimited: "Unlimited",
    used: "used",
    remaining: "remaining",
    deleteAccount: "Delete Account",
    deleteAccountWarning: "This action cannot be undone. This will permanently delete your account and all associated data.",
    cancel: "Cancel",
    confirmDelete: "Yes, Delete My Account",
    signingOut: "Signing out...",
    deleting: "Deleting...",
    restoring: "Restoring...",
    loading: "Loading...",
    perMonth: "per month",
    perYear: "per year",
    purchasesRestored: "Purchases Restored",
    purchasesRestoredDesc: "Your Pro subscription has been restored successfully!",
    noPurchasesFound: "No Purchases Found",
    noPurchasesFoundDesc: "No previous purchases were found for this account.",
    restoreFailed: "Restore Failed",
    restoreFailedDesc: "Unable to restore purchases. Please try again.",
    accountDeleted: "Account Deleted",
    accountDeletedDesc: "Your account and all data have been permanently deleted.",
    deletionFailed: "Deletion Failed",
    deletionFailedDesc: "Unable to delete account. Please try again.",
    manageSubDescription: "Update payment method, view invoices, or cancel your subscription",
    aiCreditsRemaining: "AI Credits Remaining",
    unlimitedAccess: "You have unlimited access to all features",
    usageResets: "Your usage resets",
    pastorChatMessages: "Pastor Chat Messages",
    aiPastoralConversations: "AI pastoral conversations",
    smartSearches: "Smart Searches",
    aiPoweredBibleSearches: "AI-powered Bible searches",
    bookSynopses: "Book Synopses",
    aiBookOverviews: "AI book overviews",
    verseInsightsLabel: "Verse Insights",
    aiVerseExplanations: "AI verse explanations",
    savedNotes: "Saved Notes",
    personalStudyNotes: "Personal study notes",
    wantUnlimitedAccess: "Want unlimited access to all features?",
    ambassadorProgram: "Ambassadors",
    ambassadorDescription: "Become an Ambassador to earn rewards by sharing Sea Scroll with others.",
    becomeAmbassador: "Become an Ambassador",
    applicationPending: "Application Pending",
    pendingApproval: "Your application is being reviewed",
    viewDashboard: "View Dashboard",
    yourReferrals: "Your Referrals",
    notifications: "Notifications",
    manageNotifications: "Manage your notification preferences",
    verseOfWeek: "Verse of the Week",
    verseOfWeekDesc: "Receive an inspiring Bible verse every Tuesday morning",
    enableNotifications: "Enable push notifications to receive verses",
  },
  am: {
    myProfile: "የእኔ መገለጫ",
    back: "ተመለስ",
    signInRequired: "መግባት ያስፈልጋል",
    signInDescription: "መገለጫዎን ለማየት እና ምዝገባዎን ለማስተዳደር እባክዎ ይግቡ።",
    signInToContinue: "ለመቀጠል ይግቡ",
    accountInformation: "የመለያ መረጃ",
    manageAccountDetails: "የመለያዎን ዝርዝሮች ያስተዳድሩ",
    name: "ስም",
    email: "ኢሜይል",
    signOut: "ውጣ",
    subscription: "ምዝገባ",
    currentPlanAndBilling: "የአሁኑ እቅድዎ እና ክፍያ",
    currentPlan: "የአሁኑ እቅድ",
    free: "ነፃ",
    pro: "ፕሮ",
    proPlan: "ፕሮ እቅድ",
    status: "ሁኔታ",
    active: "ንቁ",
    month: "ወር",
    canceled: "ተሰርዟል",
    pastDue: "ያለፈበት ክፍያ",
    trialing: "ሙከራ",
    incomplete: "ያልተጠናቀቀ",
    activeSubscription: "ንቁ ምዝገባ",
    canceledEnds: "ተሰርዟል - ያበቃል",
    cancelling: "በመሰረዝ ላይ",
    accessUntil: "መዳረሻ እስከ: ",
    nextBilling: "ቀጣይ ክፍያ: ",
    manageSubscription: "ምዝገባ ያስተዳድሩ",
    restorePurchases: "ግዢዎችን መልስ",
    upgradeToPro: "ወደ ፕሮ አሻሽል",
    usageThisPeriod: "በዚህ ጊዜ ውስጥ አጠቃቀም",
    trackDailyUsage: "የዕለታዊ ባህሪ አጠቃቀምዎን ይከታተሉ",
    resetsAt: "ይዘጋጃል",
    smartSearch: "ብልጥ ፍለጋ",
    bookSynopsis: "የመጽሐፍ ማጠቃለያ",
    verseInsight: "የጥቅስ ግንዛቤዎች",
    notes: "ማስታወሻዎች",
    chatMessages: "የውይይት መልዕክቶች",
    unlimited: "ያልተገደበ",
    used: "ጥቅም ላይ ውሏል",
    remaining: "ቀርቷል",
    deleteAccount: "መለያ ሰርዝ",
    deleteAccountWarning: "ይህ እርምጃ ሊቀለበስ አይችልም። ይህ መለያዎን እና ሁሉንም ተዛማጅ ውሂብ በቋሚነት ይሰርዛል።",
    cancel: "ሰርዝ",
    confirmDelete: "አዎ፣ መለያዬን ሰርዝ",
    signingOut: "በመውጣት ላይ...",
    deleting: "በመሰረዝ ላይ...",
    restoring: "በማደስ ላይ...",
    loading: "በመጫን ላይ...",
    perMonth: "በወር",
    perYear: "በዓመት",
    purchasesRestored: "ግዢዎች ተመልሰዋል",
    purchasesRestoredDesc: "የፕሮ ምዝገባዎ በተሳካ ሁኔታ ተመልሷል!",
    noPurchasesFound: "ምንም ግዢዎች አልተገኙም",
    noPurchasesFoundDesc: "ለዚህ መለያ ምንም ቀድሞ የተገዙ ነገሮች አልተገኙም።",
    restoreFailed: "መመለስ አልተሳካም",
    restoreFailedDesc: "ግዢዎችን መመለስ አልተቻለም። እባክዎ እንደገና ይሞክሩ።",
    accountDeleted: "መለያ ተሰርዟል",
    accountDeletedDesc: "መለያዎ እና ሁሉም ውሂብ በቋሚነት ተሰርዟል።",
    deletionFailed: "መሰረዝ አልተሳካም",
    deletionFailedDesc: "መለያን መሰረዝ አልተቻለም። እባክዎ እንደገና ይሞክሩ።",
    manageSubDescription: "የክፍያ ዘዴን ያዘምኑ፣ ደረሰኞችን ይመልከቱ ወይም ምዝገባዎን ይሰርዙ",
    aiCreditsRemaining: "የ AI ክሬዲቶች ቀሪ",
    unlimitedAccess: "ወደ ሁሉም ባህሪያት ያልተገደበ መዳረሻ አለዎት",
    usageResets: "አጠቃቀምዎ ይዘጋጃል",
    pastorChatMessages: "የፓስተር ውይይት መልዕክቶች",
    aiPastoralConversations: "የ AI የእረኝነት ውይይቶች",
    smartSearches: "ብልጥ ፍለጋዎች",
    aiPoweredBibleSearches: "በ AI የተደገፉ የመጽሐፍ ቅዱስ ፍለጋዎች",
    bookSynopses: "የመጽሐፍ ማጠቃለያዎች",
    aiBookOverviews: "የ AI የመጽሐፍ ማጠቃለያዎች",
    verseInsightsLabel: "የጥቅስ ግንዛቤዎች",
    aiVerseExplanations: "የ AI የጥቅስ ማብራሪያዎች",
    savedNotes: "የተቀመጡ ማስታወሻዎች",
    personalStudyNotes: "የግል ጥናት ማስታወሻዎች",
    wantUnlimitedAccess: "ወደ ሁሉም ባህሪያት ያልተገደበ መዳረሻ ይፈልጋሉ?",
    ambassadorProgram: "አምባሳደሮች",
    ambassadorDescription: "ቫጋቦንድ መጽሐፍ ቅዱስን ለሌሎች በማጋራት ሽልማቶችን ለማግኘት አምባሳደር ይሁኑ።",
    becomeAmbassador: "አምባሳደር ይሁኑ",
    applicationPending: "ማመልከቻ በመጠባበቅ ላይ",
    pendingApproval: "ማመልከቻዎ በመገምገም ላይ ነው",
    viewDashboard: "ዳሽቦርድ ይመልከቱ",
    yourReferrals: "ሪፈራሎችዎ",
    notifications: "ማሳወቂያዎች",
    manageNotifications: "የማሳወቂያ ምርጫዎችዎን ያስተዳድሩ",
    verseOfWeek: "የሳምንቱ ጥቅስ",
    verseOfWeekDesc: "በየማክሰኞ ጠዋት አነቃቂ የመጽሐፍ ቅዱስ ጥቅስ ይቀበሉ",
    enableNotifications: "ጥቅሶችን ለመቀበል ማሳወቂያዎችን ያንቁ",
  }
};

function getProfileLocalizedText(translation: string) {
  return isAmharicTranslation(translation) ? profileUiText.am : profileUiText.en;
}

// Helper to translate Stripe subscription status
function getLocalizedStatus(status: string, t: ReturnType<typeof getProfileLocalizedText>): string {
  const statusMap: Record<string, string> = {
    active: t.active,
    canceled: t.canceled || "Canceled",
    past_due: t.pastDue || "Past Due",
    trialing: t.trialing || "Trial",
    incomplete: t.incomplete || "Incomplete",
  };
  return statusMap[status] || status;
}

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
  pricingTier?: 'premium' | 'emerging';
  credits?: number;
  resetType?: 'daily' | 'monthly';
}

interface ProfileData {
  subscription: SubscriptionStatus;
  usage: UsageSummary;
}

interface AmbassadorInfo {
  id: string;
  status: string;
  referralCode: string;
  isSuperAdmin: boolean;
}

export default function Profile() {
  const { user, isLoading: isAuthLoading, isAuthenticated, logout, isLoggingOut } = useAuth();
  const [, setLocation] = useLocation();
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pricing, setPricing] = useState<PricingTierResponse | null>(null);
  const { isNative, platform } = usePlatform();
  const { restorePurchases, isProUser: isRevenueCatPro, refreshEntitlements } = useRevenueCat();
  const { toast } = useToast();
  
  // Get translation from localStorage for localization
  const [translation, setTranslation] = useState(() => {
    return localStorage.getItem("bibleTranslation") || getDefaultBibleTranslation();
  });
  
  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const newTranslation = localStorage.getItem("bibleTranslation") || getDefaultBibleTranslation();
      setTranslation(newTranslation);
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);

  // Guest check - redirect to Bible page (guests can't access profile)
  // The NativeTabBar intercepts the navigation, but this handles direct URL access
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      window.location.href = "/pastor-chat?tab=bible";
    }
  }, [isAuthLoading, isAuthenticated]);

  useEffect(() => {
    if (!isNative) {
      apiFetch('/api/pricing/tier')
        .then(res => res.json())
        .then((data: PricingTierResponse) => {
          setPricing(data);
        })
        .catch(err => {
          console.error("Failed to fetch pricing tier:", err);
          setPricing({ tier: 'premium', price: 7.99, priceDisplay: '$7.99', detectedCountry: 'unknown' });
        });
    }
  }, [isNative]);
  
  // Get localized text
  const t = getProfileLocalizedText(translation);

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

  // Fetch ambassador status
  const { data: ambassadorData, isLoading: isAmbassadorLoading } = useQuery<{ ambassador: AmbassadorInfo } | null>({
    queryKey: ["/api/ambassador/me", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      try {
        const res = await apiFetch(`/api/ambassador/me?userId=${user.id}`);
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    },
    enabled: isAuthenticated && !!user?.id,
    retry: false,
    staleTime: 60000,
  });

  const ambassador = ambassadorData?.ambassador;
  const isActiveAmbassador = ambassador?.status === "active";

  // Ambassador card - rendered in different positions based on status
  const ambassadorCard = (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" data-testid="heading-ambassador">
          <Award className="w-5 h-5 text-[#c08e00]" />
          {t.ambassadorProgram}
        </CardTitle>
        <CardDescription>
          {t.ambassadorDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAmbassadorLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : ambassador ? (
          <div className="space-y-3">
            {ambassador.status === "pending" ? (
              <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                <div>
                  <p className="font-medium text-yellow-600">{t.applicationPending}</p>
                  <p className="text-sm text-muted-foreground">{t.pendingApproval}</p>
                </div>
              </div>
            ) : ambassador.status === "active" ? (
              <Button
                onClick={() => setLocation("/ambassador")}
                className="w-full bg-[#c08e00] hover:bg-[#a07800] text-white"
                data-testid="button-ambassador-dashboard"
              >
                {t.viewDashboard}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => setLocation("/ambassador")}
                variant="outline"
                className="w-full border-[#c08e00] text-[#c08e00] hover:bg-[#c08e00]/10"
                data-testid="button-become-ambassador"
              >
                {t.becomeAmbassador}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        ) : (
          <Button
            onClick={() => setLocation("/ambassador")}
            className="w-full bg-[#c08e00] hover:bg-[#a07800] text-white"
            data-testid="button-become-ambassador"
          >
            {t.becomeAmbassador}
            <ChevronRight className="w-4 h-4 ml-2 text-white" />
          </Button>
        )}
      </CardContent>
    </Card>
  );

  useEffect(() => {
    document.title = `${t.myProfile} | Sea Scroll`;
    console.log('[Profile] platform:', platform, 'isNative:', isNative);
  }, [platform, isNative, t.myProfile]);

  // Helper function to get Android/iOS status bar padding - same pattern as navigation.tsx
  const getMainStyle = (): React.CSSProperties => {
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
          title: t.purchasesRestored,
          description: t.purchasesRestoredDesc,
        });
        await refreshEntitlements();
      } else {
        toast({
          title: t.noPurchasesFound,
          description: t.noPurchasesFoundDesc,
        });
      }
    } catch (error) {
      console.error("Restore error:", error);
      toast({
        title: t.restoreFailed,
        description: t.restoreFailedDesc,
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
          title: t.accountDeleted,
          description: t.accountDeletedDesc,
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
        title: t.deletionFailed,
        description: t.deletionFailedDesc,
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
            <img src={vagabondLogo} alt="Sea Scroll AI" className="h-10" data-testid="img-vagabond-logo" />
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
    // Guests are redirected via the useEffect at the top of the component
    return null;
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
              {t.back}
            </button>
          )}

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="heading-profile">
                  <User className="w-5 h-5" />
                  {t.myProfile}
                </CardTitle>
                <CardDescription>
                  {t.manageAccountDetails}
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
                      {t.signingOut}
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      {t.signOut}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Ambassador card - shown here for active ambassadors */}
            {isActiveAmbassador && ambassadorCard}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="heading-subscription">
                  <CreditCard className="w-5 h-5" />
                  {t.subscription}
                </CardTitle>
                <CardDescription>
                  {t.currentPlanAndBilling}
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
                        <Badge variant="default" className="bg-[#d79942]" data-testid="badge-pro">
                          <img src={upgradeIcon} alt="" className="w-3 h-3 mr-1" />
                          {t.proPlan}
                        </Badge>
                        {isCancelling && (
                          <Badge variant="outline" className="text-orange-500 border-orange-500" data-testid="badge-cancelling">
                            {t.canceledEnds}
                          </Badge>
                        )}
                      </div>
                      <span className="text-lg font-semibold" data-testid="text-price">{pricing?.priceDisplay || '$7.99'}/{t.month}</span>
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span data-testid="text-status">
                          {t.status}: <span className="text-foreground font-medium capitalize">{getLocalizedStatus(subscription?.status || "active", t)}</span>
                        </span>
                      </div>
                      {subscription?.current_period_end && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span data-testid="text-period-end">
                            {isCancelling ? t.accessUntil : t.nextBilling}
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
                      {isNative && isRevenueCatPro && !subscription && !subscriptionStatus?.stripeCustomerId ? (
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
                            onClick={handleManageSubscription}
                            disabled={isOpeningPortal}
                            className="w-full sm:w-auto bg-[#c08e00] text-white hover:bg-[#a87c00] rounded-xl"
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
                                {t.manageSubscription}
                              </>
                            )}
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            {t.manageSubDescription}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-[#ffffff]" data-testid="badge-free">
                        {t.free}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="bg-[hsl(39,70%,95%)] rounded-lg p-4 border border-[#d79942]/20">
                      <h3 className="font-semibold flex items-center gap-2 mb-2 text-[#d79942]">
                        <img src={upgradeIcon} alt="" className="w-5 h-5" />
                        {t.upgradeToPro}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {pricing?.priceDisplay || '$7.99'}/{t.perMonth}
                      </p>
                      <Button size="sm" className="btn-upgrade" data-testid="button-upgrade" onClick={() => setShowPaywall(true)}>
                        {t.upgradeToPro}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tradition preference */}
            <TraditionSettings isAuthenticated={!!user?.id} />

            {/* Notification Settings - only shown on native platforms */}
            {user?.id && (
              <NotificationSettings 
                userId={user.id}
                t={{
                  notifications: t.notifications,
                  manageNotifications: t.manageNotifications,
                  verseOfWeek: t.verseOfWeek,
                  verseOfWeekDesc: t.verseOfWeekDesc,
                  enableNotifications: t.enableNotifications,
                }}
              />
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="heading-usage">
                  <img src={upgradeIcon} alt="" className="w-5 h-5" />
                  {t.aiCreditsRemaining}
                </CardTitle>
                <CardDescription>
                  {usageSummary?.isPro 
                    ? (usageSummary?.resetType === 'daily' 
                      ? `${usageSummary?.pricingTier === 'emerging' ? 'Emerging' : 'Premium'} Plan - Resets daily at midnight UTC`
                      : t.unlimitedAccess)
                    : `${t.usageResets} ${usageSummary?.resetAt ? new Date(usageSummary.resetAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : ''}`
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
                        label: t.pastorChatMessages, 
                        icon: MessagesSquare,
                        data: usageSummary?.chat_message,
                        description: t.aiPastoralConversations
                      },
                      { 
                        key: 'smart_search', 
                        label: t.smartSearches, 
                        icon: Search,
                        data: usageSummary?.smart_search,
                        description: t.aiPoweredBibleSearches
                      },
                      { 
                        key: 'book_synopsis', 
                        label: t.bookSynopses, 
                        icon: BookOpen,
                        data: usageSummary?.book_synopsis,
                        description: t.aiBookOverviews
                      },
                      { 
                        key: 'verse_insight', 
                        label: t.verseInsightsLabel, 
                        icon: MessageSquare,
                        data: usageSummary?.verse_insight,
                        description: t.aiVerseExplanations
                      },
                      { 
                        key: 'notes', 
                        label: t.savedNotes, 
                        icon: StickyNote,
                        data: usageSummary?.notes,
                        description: t.personalStudyNotes
                      },
                    ].map(({ key, label, icon: Icon, data, description }) => (
                      <div key={key} className="flex items-center justify-between py-2" data-testid={`usage-row-${key}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[hsl(39,70%,95%)] flex items-center justify-center">
                            <Icon className="w-4 h-4 text-[#d79942]" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{label}</p>
                            <p className="text-xs text-muted-foreground">{description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {usageSummary?.isPro && (data?.limit === Number.POSITIVE_INFINITY || !Number.isFinite(data?.limit ?? 0)) ? (
                            <Badge variant="outline" className="border-[#d79942] text-[#d79942]" data-testid={`badge-unlimited-${key}`}>
                              <InfinityIcon className="w-3 h-3 mr-1" />
                              {t.unlimited}
                            </Badge>
                          ) : (
                            <span className={`text-sm font-medium ${data?.remaining === 0 ? 'text-red-500' : ''}`} data-testid={`text-usage-${key}`}>
                              {data?.remaining ?? 0} / {data?.limit ?? 0}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {!usageSummary?.isPro && (
                      <>
                        <Separator className="my-4" />
                        <div className="bg-[hsl(39,70%,95%)] rounded-lg p-4 border border-[#d79942]/20">
                          <p className="text-sm text-muted-foreground mb-3">
                            {t.wantUnlimitedAccess}
                          </p>
                          <Button size="sm" className="btn-upgrade" data-testid="button-upgrade-usage" onClick={() => setShowPaywall(true)}>
                            {t.upgradeToPro}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ambassador card - shown here for non-active ambassadors */}
            {!isActiveAmbassador && ambassadorCard}
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
                  {t.deleteAccount}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[hsl(40,30%,96%)]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-600">{t.deleteAccount}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.deleteAccountWarning}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid="button-cancel-delete">{t.cancel}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    data-testid="button-confirm-delete"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t.deleting}
                      </>
                    ) : (
                      t.confirmDelete
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

      <UpgradeDialog open={showPaywall} onClose={() => setShowPaywall(false)} translation={translation} />
    </div>
  );
}
