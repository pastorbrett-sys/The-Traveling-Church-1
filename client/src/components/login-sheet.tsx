import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Capacitor } from "@capacitor/core";

interface LoginSheetProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
  isAmharic?: boolean;
}

// Feature list with checkmarks
const FEATURES_EN = [
  "Smart Search",
  "AI Verse Insights", 
  "Save Notes",
  "Pastor Chat"
];

const FEATURES_AM = [
  "ብልጥ ፍለጋ",
  "AI የቁጥር ግንዛቤ",
  "ማስታወሻ አስቀምጥ",
  "የፓስተር ውይይት"
];

export function LoginSheet({ isOpen, onClose, redirectUrl = "/", isAmharic = false }: LoginSheetProps) {
  const isNative = Capacitor.isNativePlatform();
  const isIOS = Capacitor.getPlatform() === "ios";
  
  const features = isAmharic ? FEATURES_AM : FEATURES_EN;
  
  const t = {
    headline: isAmharic ? "የ AI ባህሪያትን ያግኙ።\n100% ነፃ!" : "Access AI Features.\n100% Free!",
    subtitle: isAmharic ? "ክሬዲት ካርድ አያስፈልግም" : "No credit card required",
    createAccount: isAmharic ? "ነፃ መለያ ፍጠር" : "Create a free account",
    signIn: isAmharic ? "ግባ" : "Sign In"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[200]"
            onClick={onClose}
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
            className="fixed left-0 right-0 bg-background rounded-t-3xl z-[201] flex flex-col"
            style={{
              bottom: isNative && isIOS ? "80px" : "0px",
              maxHeight: isNative ? "70vh" : "85vh",
              paddingBottom: isNative && !isIOS ? "24px" : "16px"
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>
            
            {/* Close button (optional, top right) */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
              data-testid="button-close-login-sheet"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {/* Headline */}
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mt-4 whitespace-pre-line">
                {t.headline}
              </h2>
              
              {/* Subtitle */}
              <p className="text-muted-foreground mt-2 text-base">
                {t.subtitle}
              </p>
              
              {/* Feature list with checkmarks */}
              <div className="mt-6 space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-foreground font-medium text-lg">{feature}</span>
                  </div>
                ))}
              </div>
              
              {/* Buttons */}
              <div className="mt-8 space-y-3">
                <Link href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}>
                  <Button 
                    className="w-full h-14 text-lg font-semibold bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-full"
                    size="lg"
                    onClick={onClose}
                    data-testid="button-create-account"
                  >
                    {t.createAccount}
                  </Button>
                </Link>
                
                <Link href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}>
                  <button 
                    className="w-full py-3 text-center text-foreground font-medium text-base hover:text-[#c08e00] transition-colors"
                    onClick={onClose}
                    data-testid="button-signin-text"
                  >
                    {t.signIn}
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
