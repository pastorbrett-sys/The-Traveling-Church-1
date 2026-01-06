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
  
  const featureLabel = FEATURE_LABELS[feature] || feature;
  const featureDescription = FEATURE_DESCRIPTIONS[feature] || feature;
  
  const resetDate = resetAt 
    ? new Date(resetAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    : null;

  const handleUpgrade = async () => {
    setIsCheckingOut(true);
    try {
      // Fetch the Pro plan price
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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="fixed left-0 top-0 translate-x-0 translate-y-0 h-[100dvh] max-h-[100dvh] w-full rounded-none border-0 sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:h-auto sm:max-h-[85vh] sm:max-w-md sm:rounded-lg sm:border bg-[hsl(40,30%,96%)] sm:border-[hsl(30,20%,88%)] overflow-y-auto p-0">
        <div className="flex flex-col justify-center min-h-full p-6 sm:p-6">
          <DialogHeader className="text-center">
            <div className="mx-auto w-20 h-20 sm:w-16 sm:h-16 flex items-center justify-center mb-4 sm:mb-2">
              <img src={upgradeIcon} alt="Upgrade" className="w-20 h-20 sm:w-16 sm:h-16" />
            </div>
            <DialogTitle className="text-2xl sm:text-xl text-[hsl(20,10%,20%)]" data-testid="heading-upgrade-dialog">
              {featureLabel} Limit Reached
            </DialogTitle>
            <DialogDescription className="text-[hsl(20,10%,40%)] text-base sm:text-sm">
              You've used all your {featureDescription} for this {feature === 'notes' ? 'account' : 'month'}.
              {resetDate && feature !== 'notes' && (
                <span className="block mt-1">
                  Your limit resets on {resetDate}.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-white/50 rounded-lg p-5 sm:p-4 border border-[hsl(30,20%,88%)] mt-6 sm:mt-2">
            <h4 className="font-semibold text-[hsl(20,10%,20%)] mb-3 sm:mb-2 text-lg sm:text-base">Upgrade to Pro for:</h4>
            <ul className="text-base sm:text-sm text-[hsl(20,10%,35%)] space-y-2 sm:space-y-1">
              <li>• Unlimited Smart Searches</li>
              <li>• Unlimited Book Synopses</li>
              <li>• Unlimited Verse Insights</li>
              <li>• Unlimited Notes</li>
              <li>• Priority support</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:gap-2 mt-8 sm:mt-4">
            <Button 
              onClick={handleUpgrade}
              disabled={isCheckingOut}
              className="w-full btn-upgrade text-lg sm:text-base py-6 sm:py-4"
              data-testid="button-upgrade-pro"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Upgrade to Pro"
              )}
            </Button>
            <Button 
              variant="ghost" 
              onClick={onClose}
              disabled={isCheckingOut}
              className="text-[hsl(20,10%,40%)] text-lg sm:text-base py-6 sm:py-4"
              data-testid="button-maybe-later"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
