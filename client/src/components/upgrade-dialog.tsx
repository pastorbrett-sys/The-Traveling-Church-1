import { Link } from "wouter";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const featureLabel = FEATURE_LABELS[feature] || feature;
  const featureDescription = FEATURE_DESCRIPTIONS[feature] || feature;
  
  const resetDate = resetAt 
    ? new Date(resetAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    : null;

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
          <Link href="/pastor-chat?upgrade=true">
            <Button 
              className="w-full bg-[hsl(25,35%,45%)] hover:bg-[hsl(25,35%,38%)] text-white"
              data-testid="button-upgrade-pro"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            onClick={onClose}
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
