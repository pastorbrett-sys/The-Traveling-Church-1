import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { usePlatform } from "@/contexts/platform-context";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { NativeTabBarSpacer } from "@/components/native-tab-bar";

import candleLitImage from "@assets/E97050D6-450C-4805-819C-819ACE781EAA_1769473638700.png";
import candleUnlitImage from "@assets/628562E5-A608-46BF-815A-C1ABF3D15D12_1769473638700.png";
import matchLightingImage from "@assets/97EB6137-7CC3-42DE-8006-6F15161A8754_1769473638700.png";
import litCandleImage from "@assets/candle_cropped.png";

// Locked candle + glow component (same ratios as prayer-requests page)
function LockedCandleGlow() {
  return (
    <div className="relative" style={{ width: '480px', height: '1280px' }}>
      <img 
        src={litCandleImage} 
        alt="Lit candle" 
        className="absolute inset-0 w-full h-full object-contain"
      />
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '400px',
          height: '240px',
          top: '428px',
          left: '50%',
          marginLeft: '-200px',
          background: 'radial-gradient(circle, rgba(251,191,36,0.9) 0%, rgba(251,191,36,0) 70%)',
        }}
        animate={{
          opacity: [0.49, 0.7, 0.49],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
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
      className="absolute inset-x-0 top-16 bottom-24 flex flex-col items-center justify-end p-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative w-48 h-64 mb-6"
      >
        <AnimatePresence mode="wait">
          {candleState === "unlit" && (
            <motion.img
              key="unlit"
              src={candleUnlitImage}
              alt="Unlit candle"
              className="w-full h-full object-contain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
          {candleState === "lighting" && (
            <motion.div
              key="lighting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full"
            >
              <motion.img
                src={matchLightingImage}
                alt="Lighting candle"
                className="w-full h-full object-contain"
                initial={{ x: 50, rotate: -15 }}
                animate={{ x: 0, rotate: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </motion.div>
          )}
          {(candleState === "lit" || candleState === "success") && (
            <motion.div
              key="lit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative w-full h-full"
            >
              <motion.img
                src={candleLitImage}
                alt="Lit candle"
                className="w-full h-full object-contain"
              />
              <motion.div
                className="absolute top-8 left-1/2 -translate-x-1/2 w-8 h-12"
                animate={{
                  scale: [1, 1.1, 0.95, 1.05, 1],
                  opacity: [0.8, 1, 0.9, 1, 0.85],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="w-full h-full bg-gradient-to-t from-amber-500 via-orange-400 to-yellow-200 rounded-full blur-sm" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {showSuccess && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 0.6, repeat: 2 }}
              className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl"
            />
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Card with candle behind it - locked together */}
        <div className="relative mb-6">
          {/* Candle positioned behind, showing top 1/3 */}
          <div className="absolute left-1/2 -translate-x-1/2 overflow-hidden" style={{ top: '-200px', height: '280px', width: '480px' }}>
            <LockedCandleGlow />
          </div>
          
          {/* Black card with dark grey border */}
          <div className="relative bg-black rounded-2xl p-5 border border-white/20">
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
