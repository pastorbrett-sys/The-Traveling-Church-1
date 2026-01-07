import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { usePlatform } from "@/contexts/platform-context";
import { Book, MessageCircle, FileText, User } from "lucide-react";
import { motion } from "framer-motion";

interface TabItem {
  id: string;
  label: string;
  href: string;
  icon: typeof Book;
}

const tabs: TabItem[] = [
  { id: "bible", label: "Bible", href: "/pastor-chat?tab=bible", icon: Book },
  { id: "chat", label: "Chat", href: "/pastor-chat?tab=chat", icon: MessageCircle },
  { id: "notes", label: "Notes", href: "/notes", icon: FileText },
  { id: "profile", label: "Profile", href: "/profile", icon: User },
];

export function NativeTabBar() {
  const { isNative } = usePlatform();
  const [location, setLocation] = useLocation();
  const [currentUrl, setCurrentUrl] = useState(window.location.pathname + window.location.search);
  const [tappedTab, setTappedTab] = useState<string | null>(null);
  
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
  
  const handleTabClick = (tab: TabItem) => {
    setTappedTab(tab.id);
    setLocation(tab.href);
    // Immediately update currentUrl to ensure active state changes
    setCurrentUrl(tab.href);
    // Reset tapped state after animation completes
    setTimeout(() => setTappedTab(null), 300);
  };
  
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom"
      style={{ background: 'linear-gradient(to bottom, #1a1a1a 0%, #000000 100%)' }}
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
                {tab.label}
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
  
  return <div className="h-16 safe-area-bottom" />;
}
