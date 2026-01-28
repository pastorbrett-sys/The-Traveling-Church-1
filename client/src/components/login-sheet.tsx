import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Capacitor } from "@capacitor/core";

type FeatureType = "chat" | "notes" | "insights" | "search" | "general";

interface LoginSheetProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
  isAmharic?: boolean;
  feature?: FeatureType;
}

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

const FEATURE_HEADLINES = {
  en: {
    chat: "Chat with Pastor Brett",
    notes: "Save Your Notes",
    insights: "Get AI Insights",
    search: "Use Smart Search",
    general: "Create an Account"
  },
  am: {
    chat: "ከፓስተር ብሬት ጋር ውይይት",
    notes: "ማስታወሻዎችዎን ያስቀምጡ",
    insights: "AI ግንዛቤ ያግኙ",
    search: "ብልጥ ፍለጋ ይጠቀሙ",
    general: "መለያ ይፍጠሩ"
  }
};

const FEATURE_SUBTITLES = {
  en: {
    chat: "Sign in to start chatting with your AI Bible companion",
    notes: "Create an account to save and access your notes",
    insights: "Sign in to get AI-powered verse insights",
    search: "Create an account to use smart Bible search",
    general: "Sign up to unlock these features"
  },
  am: {
    chat: "ከ AI መጽሐፍ ቅዱስ ጓደኛዎ ጋር ውይይት ለመጀመር ይግቡ",
    notes: "ማስታወሻዎችዎን ለማስቀመጥና ለማግኘት መለያ ይፍጠሩ",
    insights: "AI የቃላት ግንዛቤ ለማግኘት ይግቡ",
    search: "ብልጥ መጽሐፍ ቅዱስ ፍለጋ ለመጠቀም መለያ ይፍጠሩ",
    general: "የሚከተሉትን ለመጠቀም ይመዝገቡ"
  }
};

export function LoginSheet({ isOpen, onClose, redirectUrl = "/", isAmharic = false, feature = "general" }: LoginSheetProps) {
  const isNative = Capacitor.isNativePlatform();
  const isIOS = Capacitor.getPlatform() === "ios";
  const lang = isAmharic ? "am" : "en";
  
  const features = isAmharic ? FEATURES_AM : FEATURES_EN;
  const showFeatureList = feature === "general";
  
  const t = {
    headline: FEATURE_HEADLINES[lang][feature],
    subtitle: FEATURE_SUBTITLES[lang][feature],
    createAccount: isAmharic ? "መለያ ፍጠር" : "Create Account",
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
          
          {/* Sheet - matches verse-share-sheet styling */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
            className="fixed left-0 right-0 bg-background rounded-t-3xl z-[201] flex flex-col"
            style={{
              bottom: isNative && isIOS ? "80px" : "0px",
              maxHeight: isNative ? "75vh" : "90vh",
            }}
          >
            {/* Header with drag handle and close */}
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <div className="w-16" />
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
              <button 
                onClick={onClose}
                className="w-16 flex justify-end"
                data-testid="button-close-login-sheet"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            {/* Content area - moved up */}
            <div className="flex-1 overflow-y-auto px-6 pt-2 select-none">
              {/* Headline */}
              <h2 className="text-2xl font-bold text-foreground leading-tight">
                {t.headline}
              </h2>
              
              {/* Subtitle */}
              <p className="text-muted-foreground mt-1 text-sm">
                {t.subtitle}
              </p>
              
              {/* Feature list with line checkmarks */}
              <div className="mt-5 space-y-2.5">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2.5">
                    <Check className="w-5 h-5 text-[#c08e00] flex-shrink-0" strokeWidth={2.5} />
                    <span className="text-foreground font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Buttons - matching verse-share-sheet exactly */}
            <div 
              className="px-4 pt-6 flex flex-col items-center gap-4"
              style={{
                paddingBottom: isNative && !isIOS ? "32px" : isNative ? "16px" : "24px"
              }}
            >
              <Link href={`/login?tab=signin&redirect=${encodeURIComponent(redirectUrl)}`} className="w-full max-w-md">
                <Button 
                  variant="outline"
                  className="w-full hover:bg-[#daa520]/20 hover:text-[#daa520] hover:border-[#daa520]"
                  onClick={onClose}
                  data-testid="button-signin-text"
                >
                  {t.signIn}
                </Button>
              </Link>
              
              <Link href={`/login?tab=signup&redirect=${encodeURIComponent(redirectUrl)}`} className="w-full max-w-md">
                <Button 
                  className="w-full bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white"
                  size="lg"
                  onClick={onClose}
                  data-testid="button-create-account"
                >
                  {t.createAccount}
                </Button>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
