import { useLocation } from "wouter";
import { usePlatform } from "@/contexts/platform-context";
import { Book, MessageCircle, FileText, User } from "lucide-react";

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
  
  if (!isNative) return null;
  
  // Hide on video landing page and login
  if (location === "/" || location === "/login" || location === "/vagabond-bible") return null;
  
  const isActive = (href: string) => {
    const [hrefPath, hrefQuery] = href.split("?");
    const [locPath] = location.split("?");
    
    // For pastor-chat tabs, check both path and query param
    if (hrefPath === "/pastor-chat" && locPath === "/pastor-chat") {
      const currentParams = new URLSearchParams(window.location.search);
      const hrefParams = new URLSearchParams(hrefQuery || "");
      const currentTab = currentParams.get("tab") || "bible";
      const targetTab = hrefParams.get("tab") || "bible";
      return currentTab === targetTab;
    }
    
    // For other routes, simple path matching
    if (hrefPath === locPath) return true;
    return locPath.startsWith(hrefPath + "/");
  };
  
  const handleTabClick = (href: string) => {
    // For same-path navigation with different query params, use window.location
    // to ensure the page properly updates
    const [hrefPath] = href.split("?");
    const [locPath] = location.split("?");
    
    if (hrefPath === locPath && hrefPath === "/pastor-chat") {
      // Same base path - force navigation with full URL update
      window.history.pushState({}, "", href);
      window.dispatchEvent(new PopStateEvent("popstate"));
    } else {
      setLocation(href);
    }
  };
  
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-bottom"
      data-testid="native-tab-bar"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.href)}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`tab-${tab.id}`}
            >
              <Icon className={`w-5 h-5 ${active ? "stroke-[2.5px]" : ""}`} />
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
