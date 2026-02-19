import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { usePlatform } from "@/contexts/platform-context";
import { useAuth } from "@/hooks/use-auth";
import { Book, MessageCircle, FileText, User, Timer } from "lucide-react";
import { motion } from "framer-motion";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { getDefaultBibleTranslation } from "@/lib/i18n";
import { LoginSheet } from "@/components/login-sheet";
import { getGlobalActiveTab, setGlobalActiveTab, subscribeToActiveTab } from "@/lib/active-tab-store";

function isAmharicTranslation(translation: string): boolean {
  return translation === "ETH" || translation === "AMPROT";
}

const tabLabels = {
  en: {
    bible: "Bible",
    chat: "Study",
    prayer: "Prayer",
    notes: "Notes",
    profile: "Profile",
  },
  am: {
    bible: "መጽሐፍ ቅዱስ",
    chat: "ጥናት",
    prayer: "ጸሎት",
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
  { id: "chat", labelKey: "chat", href: "/pastor-chat?tab=chat", icon: MessageCircle },
  { id: "bible", labelKey: "bible", href: "/pastor-chat?tab=bible", icon: Book },
  { id: "prayer", labelKey: "prayer", href: "/prayer-timer", icon: Timer },
  { id: "notes", labelKey: "notes", href: "/notes", icon: FileText },
  { id: "profile", labelKey: "profile", href: "/profile", icon: User },
];

export function NativeTabBar() {
  const { isNative } = usePlatform();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [tappedTab, setTappedTab] = useState<string | null>(null);
  const [showLoginSheet, setShowLoginSheet] = useState(false);
  const [globalTab, setGlobalTab] = useState(getGlobalActiveTab);
  const [translation, setTranslation] = useState(() => {
    return localStorage.getItem("bibleTranslation") || getDefaultBibleTranslation();
  });
  
  useEffect(() => {
    const handleStorageChange = () => {
      const newTranslation = localStorage.getItem("bibleTranslation") || getDefaultBibleTranslation();
      setTranslation(newTranslation);
    };
    
    const handleTranslationChange = (e: CustomEvent) => {
      setTranslation(e.detail || getDefaultBibleTranslation());
    };
    
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);
    window.addEventListener("translationChanged", handleTranslationChange as EventListener);
    
    handleStorageChange();
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
      window.removeEventListener("translationChanged", handleTranslationChange as EventListener);
    };
  }, []);

  useEffect(() => {
    return subscribeToActiveTab(() => {
      setGlobalTab(getGlobalActiveTab());
    });
  }, []);

  useEffect(() => {
    if (!isNative) return;
    document.documentElement.style.setProperty("background-color", "#000000", "important");
    document.body.style.setProperty("background-color", "#000000", "important");
    return () => {
      document.documentElement.style.removeProperty("background-color");
      document.body.style.removeProperty("background-color");
    };
  }, [isNative]);
  
  const labels = getLocalizedLabels(translation);
  
  if (!isNative) return null;
  
  const pathOnly = location.split("?")[0];
  if (pathOnly === "/" || pathOnly === "/login" || pathOnly === "/vagabond-bible" || pathOnly.startsWith("/ambassador")) return null;
  
  const getActiveTabId = (): string => {
    const currentPath = window.location.pathname;
    
    if (currentPath === "/pastor-chat") {
      if (globalTab === "chat" || globalTab === "bible") {
        return globalTab;
      }
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "bible") return "bible";
      return "chat";
    }
    
    if (currentPath === "/prayer-timer") return "prayer";
    if (currentPath === "/notes" || currentPath.startsWith("/notes/")) return "notes";
    if (currentPath === "/profile" || currentPath.startsWith("/profile/")) return "profile";
    
    return "";
  };
  
  const activeTabId = getActiveTabId();
  
  const handleTabClick = async (tab: TabItem) => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
    }
    
    if ((tab.id === "notes" || tab.id === "profile") && !isAuthLoading && !user) {
      setTappedTab(tab.id);
      setTimeout(() => setTappedTab(null), 300);
      setShowLoginSheet(true);
      return;
    }
    
    setTappedTab(tab.id);
    if (tab.id === "chat" || tab.id === "bible") {
      setGlobalActiveTab(tab.id);
    }
    setLocation(tab.href);
    setTimeout(() => setTappedTab(null), 300);
  };
  
  return (
    <nav 
      className="fixed left-0 right-0 z-[150]"
      style={{ 
        bottom: 0,
        background: '#000000',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        borderTop: '1px solid #1a1a1a'
      }}
      data-testid="native-tab-bar"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTabId === tab.id;
          const isTapped = tappedTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors select-none"
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
                className="flex items-center justify-center"
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
      
      <LoginSheet
        isOpen={showLoginSheet}
        onClose={() => setShowLoginSheet(false)}
        redirectUrl="/pastor-chat?tab=bible"
        isAmharic={isAmharicTranslation(translation)}
      />
    </nav>
  );
}

export function NativeTabBarSpacer() {
  const { isNative } = usePlatform();
  
  if (!isNative) return null;
  
  return <div style={{ height: 'calc(64px + env(safe-area-inset-bottom, 0px))' }} />;
}
