import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest, apiFetch } from "@/lib/queryClient";
import { openExternalUrl } from "@/lib/open-url";
import { usePlatform } from "@/contexts/platform-context";
import { useToast } from "@/hooks/use-toast";
import upgradeIcon from "@assets/Uppgrade_icon_1767730633674.png";

interface PricingTierResponse {
  tier: 'premium' | 'emerging';
  price: number;
  priceDisplay: string;
  detectedCountry: string;
}

interface UpgradeDialogProps {
  open: boolean;
  onClose: () => void;
  feature?: string;
  resetAt?: string | null;
  translation?: string;
}

const uiText = {
  en: {
    upgradeTitle: "Upgrade to Pro",
    description: "Enjoy Vagabond Bible for free, anytime. Upgrade to Pro to unlock optional advanced AI features for deeper study and insight.",
    descriptionNativeSuffix: " Subscription auto-renews monthly. Cancel anytime in Settings.",
    descriptionWebSuffix: " Cancel anytime.",
    upgradeFor: "Upgrade to Pro for:",
    unlimitedSmartSearch: "Unlimited Smart Searches",
    unlimitedSynopsis: "Unlimited Book Synopses",
    unlimitedInsights: "Unlimited Verse Insights",
    unlimitedNotes: "Unlimited Notes",
    subscribeNow: "Subscribe Now",
    subscribePrice: "Subscribe Now - $9.99/month",
    processing: "Processing...",
    loading: "Loading...",
    restorePurchases: "Restore Purchases",
    restoring: "Restoring...",
    subscriptionTerms: "Subscription auto-renews monthly. Cancel anytime.",
    bySubscribing: "By subscribing, you agree to our",
    privacyPolicy: "Privacy Policy",
    and: "and",
    termsOfService: "Terms of Service",
    comingSoon: "Coming Soon",
    comingSoonDesc: "In-app purchases will be available once the app is live on the App Store.",
    welcomePro: "Welcome to Pro!",
    welcomeProDesc: "You now have unlimited access to all features.",
    purchaseFailed: "Purchase failed",
    purchaseFailedDesc: "Unable to complete purchase. Please try again.",
    purchasesRestored: "Purchases restored!",
    purchasesRestoredDesc: "Your Pro subscription has been restored.",
    noPurchases: "No purchases found",
    noPurchasesDesc: "No previous Pro subscription was found for this account.",
    restoreFailed: "Restore failed",
    restoreFailedDesc: "Unable to restore purchases. Please try again.",
  },
  am: {
    upgradeTitle: "ወደ ፕሮ አሻሽል",
    description: "Vagabond Bible በነጻ በማንኛውም ጊዜ ይደሰቱ። ለጥልቅ ጥናትና ግንዛቤ የላቀ የAI ባህሪያትን ለመክፈት ወደ ፕሮ ያሻሽሉ።",
    descriptionNativeSuffix: " ምዝገባ በየወሩ በራስ-ሰር ይታደሳል። በማንኛውም ጊዜ በቅንብሮች ውስጥ ይሰርዙ።",
    descriptionWebSuffix: " በማንኛውም ጊዜ ይሰርዙ።",
    upgradeFor: "ወደ ፕሮ ያሻሽሉ ለ፡",
    unlimitedSmartSearch: "ያልተገደበ ብልጥ ፍለጋዎች",
    unlimitedSynopsis: "ያልተገደበ የመጽሐፍ ማጠቃለያዎች",
    unlimitedInsights: "ያልተገደበ የጥቅስ ግንዛቤዎች",
    unlimitedNotes: "ያልተገደበ ማስታወሻዎች",
    subscribeNow: "አሁን ይመዝገቡ",
    subscribePrice: "አሁን ይመዝገቡ - $9.99/ወር",
    processing: "በማስኬድ ላይ...",
    loading: "በመጫን ላይ...",
    restorePurchases: "ግዢዎችን መልስ",
    restoring: "በመመለስ ላይ...",
    subscriptionTerms: "ምዝገባ በየወሩ በራስ-ሰር ይታደሳል። በማንኛውም ጊዜ ይሰርዙ።",
    bySubscribing: "በመመዝገብ እርስዎ ተስማምተዋል ከ",
    privacyPolicy: "የግላዊነት ፖሊሲ",
    and: "እና",
    termsOfService: "የአገልግሎት ውል",
    comingSoon: "በቅርቡ ይመጣል",
    comingSoonDesc: "የመተግበሪያ ውስጥ ግዢዎች መተግበሪያው በApp Store ላይ ሲገኝ ይገኛሉ።",
    welcomePro: "እንኳን ወደ ፕሮ በደህና መጡ!",
    welcomeProDesc: "አሁን ለሁሉም ባህሪያት ያልተገደበ መዳረሻ አለዎት።",
    purchaseFailed: "ግዢ አልተሳካም",
    purchaseFailedDesc: "ግዢን ማጠናቀቅ አልተቻለም። እባክዎ እንደገና ይሞክሩ።",
    purchasesRestored: "ግዢዎች ተመልሰዋል!",
    purchasesRestoredDesc: "የፕሮ ምዝገባዎ ተመልሷል።",
    noPurchases: "ግዢዎች አልተገኙም",
    noPurchasesDesc: "ለዚህ መለያ ምንም የቀደመ የፕሮ ምዝገባ አልተገኘም።",
    restoreFailed: "መመለስ አልተሳካም",
    restoreFailedDesc: "ግዢዎችን መመለስ አልተቻለም። እባክዎ እንደገና ይሞክሩ።",
  }
};

export function UpgradeDialog({ open, onClose, translation }: UpgradeDialogProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [pricing, setPricing] = useState<PricingTierResponse | null>(null);
  const [isPricingLoading, setIsPricingLoading] = useState(true);
  const { isNative, platform } = usePlatform();
  const { toast } = useToast();
  
  const isAmharic = translation === "ETH" || translation === "AMPROT";
  const t = isAmharic ? uiText.am : uiText.en;

  useEffect(() => {
    if (open && !isNative) {
      setIsPricingLoading(true);
      apiFetch("/api/pricing/tier")
        .then(res => res.json())
        .then((data: PricingTierResponse) => {
          setPricing(data);
        })
        .catch(err => {
          console.error("Failed to fetch pricing tier:", err);
          setPricing({ tier: 'premium', price: 7.99, priceDisplay: '$7.99/month', detectedCountry: 'unknown' });
        })
        .finally(() => setIsPricingLoading(false));
    }
  }, [open, isNative]);

  const handleUpgrade = async () => {
    setIsCheckingOut(true);
    try {
      const { getReferralCode } = await import("@/hooks/use-referral");
      const referralCode = getReferralCode();
      
      const checkoutRes = await apiRequest("POST", "/api/stripe/regional-checkout", {
        referralCode: referralCode || undefined,
      });
      const checkoutData = await checkoutRes.json();
      
      if (checkoutData.url) {
        await openExternalUrl(checkoutData.url);
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert("Unable to start checkout. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleNativePurchase = async () => {
    setIsPurchasing(true);
    try {
      const { Purchases } = await import("@revenuecat/purchases-capacitor");
      const offerings = await Purchases.getOfferings();
      
      if (!offerings.current?.availablePackages?.length) {
        toast({
          title: t.comingSoon,
          description: t.comingSoonDesc,
        });
        return;
      }
      
      const monthlyPackage = offerings.current.availablePackages.find(
        (pkg: any) => pkg.packageType === "MONTHLY"
      ) || offerings.current.availablePackages[0];
      
      const result = await Purchases.purchasePackage({ aPackage: monthlyPackage });
      
      if (result.customerInfo.entitlements.active["Vagabond Bible Pro"]) {
        toast({
          title: t.welcomePro,
          description: t.welcomeProDesc,
        });
        onClose();
        window.location.reload();
      }
    } catch (error: any) {
      if (error.code !== "PURCHASE_CANCELLED") {
        console.error("Purchase error:", error);
        const errorMessage = error.message || "";
        if (errorMessage.includes("offerings") || errorMessage.includes("configuration") || errorMessage.includes("no App Store products")) {
          toast({
            title: t.comingSoon,
            description: t.comingSoonDesc,
          });
        } else {
          toast({
            title: t.purchaseFailed,
            description: t.purchaseFailedDesc,
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    try {
      const { Purchases } = await import("@revenuecat/purchases-capacitor");
      const customerInfo = await Purchases.restorePurchases();
      
      if (customerInfo.customerInfo.entitlements.active["Vagabond Bible Pro"]) {
        toast({
          title: t.purchasesRestored,
          description: t.purchasesRestoredDesc,
        });
        onClose();
        window.location.reload();
      } else {
        toast({
          title: t.noPurchases,
          description: t.noPurchasesDesc,
        });
      }
    } catch (error: any) {
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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="fixed left-0 top-0 translate-x-0 translate-y-0 h-[100dvh] max-h-[100dvh] w-full rounded-none border-0 sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:h-auto sm:max-h-[85vh] sm:max-w-md sm:rounded-lg sm:border bg-[hsl(40,30%,96%)] sm:border-[hsl(30,20%,88%)] overflow-y-auto p-0 [&>button]:hidden z-[10000]" style={platform === 'android' ? { paddingTop: 'var(--android-status-bar-height, 44px)', paddingBottom: '100px' } : platform === 'ios' ? { paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)' } : undefined}>
        {/* Close button - sticky inside content for iOS WKWebView compatibility */}
        <div 
          className="sticky top-0 w-full flex justify-end z-50 pointer-events-none"
          style={platform === 'android' ? { paddingTop: 'calc(var(--android-status-bar-height, 44px) - 20px)', paddingRight: '16px' } : platform === 'ios' ? { paddingTop: 'calc(env(safe-area-inset-top, 0px) - 20px)', paddingRight: '16px' } : { paddingTop: '12px', paddingRight: '12px' }}
        >
          <button
            onClick={onClose}
            className="pointer-events-auto rounded-full w-12 h-12 flex items-center justify-center bg-gray-200"
            data-testid="button-close-upgrade"
          >
            <X className="h-6 w-6 text-black" strokeWidth={2.5} />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="flex flex-col p-6 sm:p-6 flex-1 justify-center -mt-16 pt-[36px] pb-[36px]">
          <DialogHeader className="text-center">
            <div className={`mx-auto w-20 h-20 sm:w-16 sm:h-16 flex items-center justify-center ${isNative ? 'mb-6' : 'mb-4 sm:mb-2'}`}>
              <img src={upgradeIcon} alt="Upgrade" className="w-20 h-20 sm:w-16 sm:h-16" />
            </div>
            <DialogTitle className="text-2xl sm:text-xl text-[hsl(20,10%,20%)]" data-testid="heading-upgrade-dialog">
              {t.upgradeTitle}
            </DialogTitle>
            <DialogDescription className={`text-[hsl(20,10%,40%)] ${isNative ? 'text-sm mt-3' : 'text-base sm:text-sm'}`}>
              {t.description}{isNative ? t.descriptionNativeSuffix : t.descriptionWebSuffix}
            </DialogDescription>
          </DialogHeader>

          <div className={`bg-white/50 rounded-lg p-5 sm:p-4 border border-[hsl(30,20%,88%)] ${isNative ? 'mt-8' : 'mt-6 sm:mt-4'}`}>
            <h3 className="font-semibold text-[hsl(20,10%,20%)] mb-3 sm:mb-2 text-lg sm:text-base">{t.upgradeFor}</h3>
            <ul className={`${isNative ? 'space-y-3' : 'space-y-2 sm:space-y-2'} text-base sm:text-sm text-[hsl(20,10%,35%)]`}>
              <li>• {t.unlimitedSmartSearch}</li>
              <li>• {t.unlimitedSynopsis}</li>
              <li>• {t.unlimitedInsights}</li>
              <li>• {t.unlimitedNotes}</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:gap-2 mt-8 sm:mt-4">
            {isNative ? (
              <>
                <Button 
                  onClick={handleNativePurchase}
                  disabled={isPurchasing}
                  className="w-full btn-upgrade py-6 sm:py-4 text-[16px] font-medium"
                  data-testid="button-upgrade-pro"
                >
                  {isPurchasing ? (
                    <>
                      <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 mr-2 animate-spin" />
                      {t.processing}
                    </>
                  ) : (
                    t.subscribePrice
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRestorePurchases}
                  disabled={isRestoring}
                  className="w-full py-6 text-[16px] font-medium border-gray-300 bg-transparent text-black hover:bg-gray-100 hover:text-gray-600"
                  data-testid="button-restore-purchases"
                >
                  {isRestoring ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t.restoring}
                    </>
                  ) : t.restorePurchases}
                </Button>
                <p className="text-xs text-center text-[hsl(20,10%,50%)] mt-1 leading-relaxed">
                  {t.bySubscribing}{" "}
                  <button 
                    type="button"
                    onClick={() => openExternalUrl("/privacy-policy")}
                    className="underline hover:text-[hsl(20,10%,35%)]"
                    data-testid="link-privacy-policy"
                  >
                    {t.privacyPolicy}
                  </button>
                  {" "}{t.and}{" "}
                  <button 
                    type="button"
                    onClick={() => openExternalUrl("/terms-of-service")}
                    className="underline hover:text-[hsl(20,10%,35%)]"
                    data-testid="link-terms-of-service"
                  >
                    {t.termsOfService}
                  </button>.
                </p>
              </>
            ) : (
              <>
                <Button 
                  onClick={handleUpgrade}
                  disabled={isCheckingOut || isPricingLoading}
                  className="w-full btn-upgrade py-6 sm:py-4 text-[16px] font-medium"
                  data-testid="button-upgrade-pro"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 mr-2 animate-spin" />
                      {t.loading}
                    </>
                  ) : isPricingLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 mr-2 animate-spin" />
                      {t.loading}
                    </>
                  ) : (
                    `${t.subscribeNow} - ${pricing?.priceDisplay || '$7.99/month'}`
                  )}
                </Button>
                {pricing?.tier === 'emerging' && (
                  <p className="text-xs text-center text-[hsl(20,10%,50%)] mt-1">
                    {isAmharic ? 'የመጨረሻ ዋጋ በክፍያ ዘዴ ይወሰናል' : 'Final price determined at checkout based on payment method'}
                  </p>
                )}
                <p className="text-xs text-center text-[hsl(20,10%,50%)] mt-2 leading-relaxed">
                  {t.subscriptionTerms}<br />
                  {t.bySubscribing}{" "}
                  <button 
                    type="button"
                    onClick={() => openExternalUrl("/privacy-policy")}
                    className="underline hover:text-[hsl(20,10%,35%)]"
                    data-testid="link-privacy-policy-web"
                  >
                    {t.privacyPolicy}
                  </button>
                  {" "}{t.and}{" "}
                  <button 
                    type="button"
                    onClick={() => openExternalUrl("/terms-of-service")}
                    className="underline hover:text-[hsl(20,10%,35%)]"
                    data-testid="link-terms-of-service-web"
                  >
                    {t.termsOfService}
                  </button>.
                </p>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
