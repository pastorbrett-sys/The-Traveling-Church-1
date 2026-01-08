import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { usePlatform } from "@/contexts/platform-context";
import { useToast } from "@/hooks/use-toast";
import upgradeIcon from "@assets/Uppgrade_icon_1767730633674.png";

interface UpgradeDialogProps {
  open: boolean;
  onClose: () => void;
  feature: string;
  resetAt?: string | null;
}

const FEATURE_LABELS: Record<string, string> = {
  smart_search: "Smart Search",
  book_synopsis: "Book Synopsis",
  verse_insight: "Verse Insights",
  notes: "Notes",
};

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  smart_search: "AI-powered Bible searches",
  book_synopsis: "AI book overviews",
  verse_insight: "AI verse explanations",
  notes: "saved notes",
};

export function UpgradeDialog({ open, onClose, feature, resetAt }: UpgradeDialogProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const { isNative } = usePlatform();
  const { toast } = useToast();
  
  const featureLabel = FEATURE_LABELS[feature] || feature;
  const featureDescription = FEATURE_DESCRIPTIONS[feature] || feature;
  
  const resetDate = resetAt 
    ? new Date(resetAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    : null;

  const handleUpgrade = async () => {
    setIsCheckingOut(true);
    try {
      const productsRes = await fetch("/api/stripe/products-with-prices");
      
      if (!productsRes.ok) {
        throw new Error("Failed to load products");
      }
      
      const productsData = await productsRes.json();
      
      if (!productsData.data || productsData.data.length === 0) {
        throw new Error("No products found");
      }
      
      const proPlan = productsData.data?.find((p: any) => p.metadata?.tier === "pro");
      
      if (!proPlan) {
        throw new Error("Pro plan not found");
      }
      
      const proPrice = proPlan?.prices?.find((p: any) => p.recurring?.interval === "month");
      
      if (!proPrice) {
        throw new Error("Monthly price not found");
      }
      
      const checkoutRes = await apiRequest("POST", "/api/stripe/checkout", {
        priceId: proPrice.id,
      });
      const checkoutData = await checkoutRes.json();
      
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
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
        throw new Error("No subscription packages available");
      }
      
      const monthlyPackage = offerings.current.availablePackages.find(
        (pkg: any) => pkg.packageType === "MONTHLY"
      ) || offerings.current.availablePackages[0];
      
      const result = await Purchases.purchasePackage({ aPackage: monthlyPackage });
      
      if (result.customerInfo.entitlements.active["pro"]) {
        toast({
          title: "Welcome to Pro!",
          description: "You now have unlimited access to all features.",
        });
        onClose();
        window.location.reload();
      }
    } catch (error: any) {
      if (error.code !== "PURCHASE_CANCELLED") {
        console.error("Purchase error:", error);
        toast({
          title: "Purchase failed",
          description: error.message || "Unable to complete purchase. Please try again.",
          variant: "destructive",
        });
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
      
      if (customerInfo.customerInfo.entitlements.active["pro"]) {
        toast({
          title: "Purchases restored!",
          description: "Your Pro subscription has been restored.",
        });
        onClose();
        window.location.reload();
      } else {
        toast({
          title: "No purchases found",
          description: "No previous Pro subscription was found for this account.",
        });
      }
    } catch (error: any) {
      console.error("Restore error:", error);
      toast({
        title: "Restore failed",
        description: "Unable to restore purchases. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="fixed left-0 top-0 translate-x-0 translate-y-0 h-[100dvh] max-h-[100dvh] w-full rounded-none border-0 sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:h-auto sm:max-h-[85vh] sm:max-w-md sm:rounded-lg sm:border bg-[hsl(40,30%,96%)] sm:border-[hsl(30,20%,88%)] overflow-y-auto p-0">
        <div className={`flex flex-col justify-center min-h-full p-6 sm:p-6 ${isNative ? 'pt-12' : ''}`}>
          <DialogHeader className="text-center">
            <div className={`mx-auto w-20 h-20 sm:w-16 sm:h-16 flex items-center justify-center ${isNative ? 'mb-6' : 'mb-4 sm:mb-2'}`}>
              <img src={upgradeIcon} alt="Upgrade" className="w-20 h-20 sm:w-16 sm:h-16" />
            </div>
            <DialogTitle className="text-2xl sm:text-xl text-[hsl(20,10%,20%)]" data-testid="heading-upgrade-dialog">
              {featureLabel} Limit Reached
            </DialogTitle>
            <DialogDescription className={`text-[hsl(20,10%,40%)] ${isNative ? 'text-sm mt-3' : 'text-base sm:text-sm'}`}>
              You've used all your {featureDescription} for this {feature === 'notes' ? 'account' : 'month'}.
              {resetDate && feature !== 'notes' && (
                <span className="block mt-1">
                  Your limit resets on {resetDate}.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className={`bg-white/50 rounded-lg p-5 sm:p-4 border border-[hsl(30,20%,88%)] ${isNative ? 'mt-8' : 'mt-6 sm:mt-2'}`}>
            <h4 className="font-semibold text-[hsl(20,10%,20%)] mb-3 sm:mb-2 text-lg sm:text-base">Upgrade to Pro for:</h4>
            <ul className={`${isNative ? 'space-y-3' : 'space-y-2 sm:space-y-1'} text-base sm:text-sm text-[hsl(20,10%,35%)]`}>
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
                  disabled={isPurchasing}
                  className="w-full btn-upgrade text-base py-6 sm:py-4"
                  data-testid="button-upgrade-pro"
                >
                  {isPurchasing ? (
                    <>
                      <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Subscribe Now - $9.99/month"
                  )}
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
                  onClick={handleUpgrade}
                  disabled={isCheckingOut}
                  className="w-full btn-upgrade text-base py-6 sm:py-4"
                  data-testid="button-upgrade-pro"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Subscribe Now"
                  )}
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
  );
}
