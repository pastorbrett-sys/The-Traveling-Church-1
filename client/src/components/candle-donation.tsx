import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { usePlatform } from "@/contexts/platform-context";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { NativeTabBarSpacer } from "@/components/native-tab-bar";

// Massive ambient glow that fills entire screen
function WarmGlow() {
  return (
    <>
      {/* Base warm ambient fill */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 30%, rgba(251,191,36,0.35) 0%, rgba(180,120,20,0.2) 40%, rgba(0,0,0,0) 70%)',
        }}
      />
      {/* Animated pulse layer */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 35%, rgba(255,200,50,0.3) 0%, transparent 60%)',
        }}
        animate={{
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </>
  );
}

interface PrayerData {
  name?: string;
  email?: string;
  content: string;
  isAnonymous: boolean;
}

interface CandleDonationProps {
  prayerData: PrayerData;
  onComplete: (prayerId: string | null) => void;
  onSkip: (prayerId: string | null) => void;
}

const DONATION_AMOUNTS = [
  { value: 300, label: "$3" },
  { value: 500, label: "$5" },
  { value: 1000, label: "$10" },
  { value: 2500, label: "$25" },
];

export function CandleDonation({ prayerData, onComplete, onSkip }: CandleDonationProps) {
  const { isNative } = usePlatform();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [candleState, setCandleState] = useState<"unlit" | "lighting" | "lit" | "success">("unlit");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedPrayerId, setSubmittedPrayerId] = useState<string | null>(null);

  // Submit the prayer request
  const submitPrayerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/prayer-requests", prayerData);
      return res.json();
    },
  });

  const donationMutation = useMutation({
    mutationFn: async ({ amountCents, prayerRequestId }: { amountCents: number; prayerRequestId: string | null }) => {
      const res = await apiRequest("POST", "/api/candle-donation/create-checkout", {
        amountCents,
        prayerRequestId,
      });
      return res.json();
    },
    onSuccess: async (data) => {
      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      }
    },
  });

  const handleDonate = async () => {
    if (!selectedAmount) return;
    
    // Start candle lighting animation
    setCandleState("lighting");
    
    // Haptic feedback
    if (isNative) {
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch (e) {}
    }
    
    // First submit the prayer, then proceed to Stripe
    try {
      const prayerResult = await submitPrayerMutation.mutateAsync();
      const prayerId = prayerResult.prayerRequest?.id || null;
      setSubmittedPrayerId(prayerId);
      
      // After brief animation, proceed to Stripe
      setTimeout(() => {
        donationMutation.mutate({ amountCents: selectedAmount, prayerRequestId: prayerId });
      }, 1500);
    } catch (e) {
      setCandleState("unlit");
    }
  };

  const handleSkip = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const prayerResult = await submitPrayerMutation.mutateAsync();
      const prayerId = prayerResult.prayerRequest?.id || null;
      onSkip(prayerId);
    } catch (e) {
      setIsSubmitting(false);
    }
  };

  const triggerSuccessAnimation = async () => {
    setCandleState("lit");
    setShowSuccess(true);
    
    // Haptic celebration
    if (isNative) {
      try {
        await Haptics.notification({ type: NotificationType.Success });
      } catch (e) {}
    }
    
    // Auto-complete after celebration
    setTimeout(() => {
      onComplete(submittedPrayerId);
    }, 3000);
  };

  return (
    <motion.div
      key="donation"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed inset-0 flex items-center justify-center px-4 pb-28"
    >
      {/* Warm ambient glow */}
      <WarmGlow />
      
      {/* Centered content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Black card with dark grey border */}
        <div className="bg-black rounded-2xl p-5 border border-white/20 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-medium text-amber-100">
              Want to Light a Candle?
            </h3>
          </div>
          <p className="text-white/60 text-sm leading-relaxed">
            All proceeds go to The Traveling Church to help us respond personally to every prayer request.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {DONATION_AMOUNTS.map((amount) => (
            <button
              key={amount.value}
              onClick={() => setSelectedAmount(amount.value)}
              className={`py-3 px-2 rounded-xl font-semibold transition-all ${
                selectedAmount === amount.value
                  ? "bg-amber-500 text-black scale-105 shadow-lg shadow-amber-500/30"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
              data-testid={`button-amount-${amount.value}`}
            >
              {amount.label}
            </button>
          ))}
        </div>

        <Button
          onClick={handleDonate}
          disabled={!selectedAmount || donationMutation.isPending || candleState !== "unlit"}
          className="w-full bg-[#c08e00] hover:bg-[#d4a000] text-white font-semibold py-6 rounded-2xl mb-3 shadow-lg shadow-amber-500/20 disabled:opacity-50"
          data-testid="button-donate"
        >
          {donationMutation.isPending || candleState === "lighting" ? (
            <span className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full"
              />
              Lighting Your Candle...
            </span>
          ) : (
            <>
              <Heart className="w-5 h-5 mr-2" />
              Light a Candle {selectedAmount ? `(${DONATION_AMOUNTS.find(a => a.value === selectedAmount)?.label})` : ""}
            </>
          )}
        </Button>

        <button
          onClick={handleSkip}
          disabled={isSubmitting}
          className="w-full py-3 text-white/50 hover:text-white/70 transition-colors text-sm disabled:opacity-50"
          data-testid="button-skip-donation"
        >
          {isSubmitting ? "Sending Prayer..." : "No, Just Send my Prayer"}
        </button>
        
        <NativeTabBarSpacer />
      </motion.div>
    </motion.div>
  );
}
