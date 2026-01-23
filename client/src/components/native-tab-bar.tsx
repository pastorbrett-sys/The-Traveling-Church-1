import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { usePlatform } from "@/contexts/platform-context";
import { Book, MessageCircle, FileText, User } from "lucide-react";
import { motion } from "framer-motion";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { getDefaultBibleTranslation } from "@/lib/i18n";

// Check if translation is Amharic-based
function isAmharicTranslation(translation: string): boolean {
  return translation === "ETH" || translation === "AMPROT";
}

// Localized tab labels
const tabLabels = {
  en: {
    bible: "Bible",
    chat: "Chat",
    notes: "Notes",
    profile: "Profile",
  },
  am: {
    bible: "መጽሐፍ ቅዱስ",
    chat: "ውይይት",
    notes: "ማስታወሻዎች",
    profile: "መገለጫ",
  }
};

function getLocalizedLabels(translation: string) {
  return isAmharicTranslation(translation) ? tabLabels.am : tabLabels.en;
}

interface TabItem {
  id: string;
  labelKey: keyof typeof tabLabels.en;
  href: string;
  icon: typeof Book;
}

const tabs: TabItem[] = [
  { id: "bible", labelKey: "bible", href: "/pastor-chat?tab=bible", icon: Book },
  { id: "chat", labelKey: "chat", href: "/pastor-chat?tab=chat", icon: MessageCircle },
  { id: "notes", labelKey: "notes", href: "/notes", icon: FileText },
  { id: "profile", labelKey: "profile", href: "/profile", icon: User },
];

export function NativeTabBar() {
  const { isNative } = usePlatform();
  const [location, setLocation] = useLocation();
  const [currentUrl, setCurrentUrl] = useState(window.location.pathname + window.location.search);
  const [tappedTab, setTappedTab] = useState<string | null>(null);
  const [translation, setTranslation] = useState(() => {
    return localStorage.getItem("bibleTranslation") || getDefaultBibleTranslation();
  });
  
  // Listen for translation changes (storage for cross-tab, custom event for same-tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const newTranslation = localStorage.getItem("bibleTranslation") || getDefaultBibleTranslation();
      setTranslation(newTranslation);
    };
    
    // Custom event for same-tab updates
    const handleTranslationChange = (e: CustomEvent) => {
      setTranslation(e.detail || getDefaultBibleTranslation());
    };
    
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);
    window.addEventListener("translationChanged", handleTranslationChange as EventListener);
    
    // Check on mount in case it changed
    handleStorageChange();
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
      window.removeEventListener("translationChanged", handleTranslationChange as EventListener);
    };
  }, []);
  
  const labels = getLocalizedLabels(translation);
  
  // Track URL changes including query params
  useEffect(() => {
    const updateUrl = () => {
      setCurrentUrl(window.location.pathname + window.location.search);
    };
    
    // Update on popstate (browser back/forward)
    window.addEventListener("popstate", updateUrl);
    
    // Also update when location changes
    updateUrl();
    
    return () => window.removeEventListener("popstate", updateUrl);
  }, [location]);
  
  if (!isNative) return null;
  
  // Hide on video landing page and login
  if (location === "/" || location === "/login" || location === "/vagabond-bible") return null;
  
  const isActive = (href: string) => {
    const [hrefPath, hrefQuery] = href.split("?");
    const [currentPath, currentQuery] = currentUrl.split("?");
    
    // For pastor-chat tabs, check both path and query param
    if (hrefPath === "/pastor-chat" && currentPath === "/pastor-chat") {
      const currentParams = new URLSearchParams(currentQuery || "");
      const hrefParams = new URLSearchParams(hrefQuery || "");
      const currentTab = currentParams.get("tab") || "bible";
      const targetTab = hrefParams.get("tab") || "bible";
      return currentTab === targetTab;
    }
    
    // For other routes, simple path matching
    if (hrefPath === currentPath) return true;
    return currentPath.startsWith(hrefPath + "/");
  };
  
  const handleTabClick = async (tab: TabItem) => {
    // Trigger haptic feedback on native
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Haptics not available on web, ignore
    }
    
    setTappedTab(tab.id);
    setLocation(tab.href);
    // Immediately update currentUrl to ensure active state changes
    setCurrentUrl(tab.href);
    // Reset tapped state after animation completes
    setTimeout(() => setTappedTab(null), 300);
  };
  
  // @capacitor-community/safe-area plugin handles Android insets automatically
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-[150]"
      style={{ 
        background: 'linear-gradient(to bottom, #1a1a1a 0%, #000000 100%)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
      data-testid="native-tab-bar"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);
          const isTapped = tappedTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors"
              style={{ color: active ? '#b8860b' : 'rgba(255, 255, 255, 0.7)' }}
              data-testid={`tab-${tab.id}`}
            >
              <motion.div
                animate={isTapped ? {
                  scale: [1, 1.3, 0.95, 1.1, 1],
                  y: [0, -4, 1, -2, 0],
                } : { scale: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
              >
                <Icon className={`w-5 h-5 ${active ? "stroke-[2.5px]" : ""}`} />
              </motion.div>
              <span className={`text-[10px] ${active ? "font-semibold" : "font-medium"}`}>
                {labels[tab.labelKey]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function NativeTabBarSpacer() {
  const { isNative } = usePlatform();
  
  if (!isNative) return null;
  
  // @capacitor-community/safe-area plugin handles Android insets automatically
  return <div style={{ height: 'calc(64px + env(safe-area-inset-bottom, 0px))' }} />;
}
