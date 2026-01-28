import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Capacitor } from "@capacitor/core";
import { createPortal } from "react-dom";

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

  // Use portal to render outside parent stacking contexts (like NativeTabBar with z-150)
  // This ensures the sheet and backdrop have proper z-index behavior
  const sheetContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - extremely high z-index to cover ALL elements including action bars and tab bars */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-[9998]"
            onClick={onClose}
            data-testid="login-sheet-backdrop"
          />
          
          {/* Sheet - above backdrop, covers everything */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ 
              type: "tween", 
              duration: 0.25, 
              ease: [0.32, 0.72, 0, 1]
            }}
            className="fixed left-0 right-0 bg-background rounded-t-2xl z-[9999] flex flex-col"
            style={{
              bottom: 0,
              maxHeight: isNative ? "75vh" : "90vh",
              paddingBottom: isNative ? "env(safe-area-inset-bottom, 0px)" : "0px",
            }}
          >
            {/* Close button - top right, highest z-index to ensure clickability */}
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-4 right-4 p-2 z-[10000] touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              data-testid="button-close-login-sheet"
            >
              <X className="w-5 h-5 text-muted-foreground pointer-events-none" />
            </button>
            
            {/* Content area - tight top padding to match reference */}
            <div className="overflow-y-auto px-6 pt-5 select-none">
              {/* Headline */}
              <h2 className="text-2xl font-bold text-foreground leading-tight">
                {t.headline}
              </h2>
              
              {/* Subtitle */}
              <p className="text-muted-foreground mt-1 text-sm">
                {t.subtitle}
              </p>
              
              {/* Feature list with line checkmarks */}
              <div className="mt-4 space-y-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2.5">
                    <Check className="w-5 h-5 text-[#c08e00] flex-shrink-0 pointer-events-none" strokeWidth={2.5} />
                    <span className="text-foreground font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Buttons - consistent spacing */}
            <div 
              className="px-6 pt-5 flex flex-col items-center gap-3"
              style={{
                paddingBottom: isNative && !isIOS ? "28px" : isNative ? "16px" : "24px"
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

  // Portal to document.body to escape parent stacking contexts
  return createPortal(sheetContent, document.body);
}
