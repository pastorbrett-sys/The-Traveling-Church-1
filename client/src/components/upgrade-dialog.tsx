import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";

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
      <DialogContent className="sm:max-w-md bg-[hsl(40,30%,96%)] border-[hsl(30,20%,88%)]">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-[hsl(25,35%,45%)]/10 flex items-center justify-center mb-2">
            <Sparkles className="w-8 h-8 text-[hsl(25,35%,45%)]" />
          </div>
          <DialogTitle className="text-xl text-[hsl(20,10%,20%)]" data-testid="heading-upgrade-dialog">
            {featureLabel} Limit Reached
          </DialogTitle>
          <DialogDescription className="text-[hsl(20,10%,40%)]">
            You've used all your {featureDescription} for this {feature === 'notes' ? 'account' : 'month'}.
            {resetDate && feature !== 'notes' && (
              <span className="block mt-1">
                Your limit resets on {resetDate}.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-white/50 rounded-lg p-4 border border-[hsl(30,20%,88%)] mt-2">
          <h4 className="font-semibold text-[hsl(20,10%,20%)] mb-2">Upgrade to Pro for:</h4>
          <ul className="text-sm text-[hsl(20,10%,35%)] space-y-1">
            <li>• Unlimited Smart Searches</li>
            <li>• Unlimited Book Synopses</li>
            <li>• Unlimited Verse Insights</li>
            <li>• Unlimited Notes</li>
            <li>• Priority support</li>
          </ul>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <Button 
            onClick={handleUpgrade}
            disabled={isCheckingOut}
            className="w-full btn-upgrade"
            data-testid="button-upgrade-pro"
          >
            {isCheckingOut ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </>
            )}
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose}
            disabled={isCheckingOut}
            className="text-[hsl(20,10%,40%)]"
            data-testid="button-maybe-later"
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
