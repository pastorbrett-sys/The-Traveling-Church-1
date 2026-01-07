import { useLocation, Link } from "wouter";
import { usePlatform } from "@/contexts/platform-context";
import { Book, MessageCircle, FileText, User } from "lucide-react";

interface TabItem {
  id: string;
  label: string;
  href: string;
  icon: typeof Book;
}

const tabs: TabItem[] = [
  { id: "home", label: "Bible", href: "/", icon: Book },
  { id: "chat", label: "Chat", href: "/pastor-chat", icon: MessageCircle },
  { id: "notes", label: "Notes", href: "/notes", icon: FileText },
  { id: "profile", label: "Profile", href: "/profile", icon: User },
];

export function NativeTabBar() {
  const { isNative } = usePlatform();
  const [location] = useLocation();
  
  if (!isNative) return null;
  
  if (location === "/" || location === "/login") return null;
  
  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
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
            <Link
              key={tab.id}
              href={tab.href}
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
            </Link>
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
