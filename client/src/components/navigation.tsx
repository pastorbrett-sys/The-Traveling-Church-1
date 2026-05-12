import { useState, useEffect } from "react";
import { Menu, X, LogIn, LogOut, User, Award, Timer, Download } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { usePlatform } from "@/contexts/platform-context";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import seaScrollDarkLogo from "@assets/Sea Scroll Logo Black.svg";
import travelingChurchLogo from "@assets/Traveling_Church_Logo_Black_Text_1766868484383.png";
import { isVagabondBibleDomain } from "@/lib/host-detection";

interface NavigationProps {
  customLogo?: string;
  showAuth?: boolean;
  hideNavLinks?: boolean;
  rightContent?: React.ReactNode;
}

export default function Navigation({ customLogo, showAuth = false, hideNavLinks = false, rightContent }: NavigationProps = {}) {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const isHomePage = location === "/";
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const { isNative, platform } = usePlatform();
  const { canInstall, promptInstall, isInstalled, isIOS, isChromium } = usePWAInstall();

  const handleGetApp = async () => {
    window.gtag?.('event', 'click_get_app', { source: 'navigation' });
    const isIOSDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isIOSDevice) {
      window.open("https://apps.apple.com/us/app/vagabond-bible/id6757680520", "_blank");
      return;
    }
    if (canInstall) {
      await promptInstall();
      return;
    }
    if (isInstalled) {
      alert("Sea Scroll is already installed!");
      return;
    }
    if (isChromium) {
      alert("To install, tap the browser menu (⋮) and select 'Install app' or 'Add to Home screen'.");
      return;
    }
    const isMac = /Macintosh|Mac OS X/i.test(navigator.userAgent);
    if (isMac) {
      window.open("https://apps.apple.com/us/app/vagabond-bible/id6757680520", "_blank");
      return;
    }
    alert("To install Sea Scroll, open this page in Google Chrome.");
  };

  useEffect(() => {
    if (!isHomePage) return;
    
    const handleScroll = () => {
      const sections = ["home", "mission", "community", "values", "pastor", "men-resources", "journey", "events", "contact"];
      let currentSection = "home";

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            currentSection = sectionId;
          }
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const handleNavClick = (sectionId: string) => {
    if (!isHomePage) {
      // Navigate to home page first, then scroll will happen via hash
      setLocation(`/#${sectionId}`);
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 60;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      
      setMobileMenuOpen(false);
    }
  };

  const navItems = [
    { id: "home", label: "Home", type: "link", href: "/" },
    { id: "missions", label: "Missions", type: "link", href: "/missions" },
    { id: "programs", label: "Programs", type: "link", href: "/programs" },
    { id: "secret-bible", label: "Secret Bible", type: "link", href: "/secretbible" },
    { id: "pastor-chat", label: "Sea Scroll", type: "link", href: "/vagabond-bible" },
    { id: "find-a-service", label: "Find a Bible Study", type: "link", href: "/find-a-service" },
    { id: "contact", label: "Contact", type: "scroll" },
    { id: "support", label: "Support", type: "link", href: "/keep-us-alive" },
  ];

  const getNavStyle = () => {
    if (!isNative) return undefined;
    if (platform === 'android') {
      return { paddingTop: 'var(--android-status-bar-height, 44px)' };
    }
    return { paddingTop: 'env(safe-area-inset-top, 0px)' };
  };

  return (
    <>
    <nav 
      className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-sm"
      style={getNavStyle()}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {customLogo ? (
            <div
              className="flex items-center"
              data-testid="logo-vagabond"
            >
              <img 
                src={customLogo} 
                alt="Sea Scroll AI" 
                className="h-11"
              />
            </div>
          ) : (
            <button
              onClick={() => handleNavClick("home")}
              className="flex items-center"
              data-testid="link-home"
            >
              {isVagabondBibleDomain() ? (
                <img 
                  src={seaScrollDarkLogo} 
                  alt="Sea Scroll" 
                  className="h-11"
                />
              ) : (
                <img 
                  src={travelingChurchLogo} 
                  alt="The Traveling Church" 
                  className="h-11"
                />
              )}
            </button>
          )}
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 text-sm">
            {!hideNavLinks && navItems.map((item) => (
              item.type === "link" ? (
                <Link
                  key={item.id}
                  href={item.href!}
                  className={`nav-link text-muted-foreground font-medium hover:text-primary transition-colors ${
                    (location === "/" && item.id === "home") || (location.startsWith("/programs") && item.id === "programs") || (location.startsWith("/missions") && item.id === "missions") || ((location === "/pastor-chat" || location.startsWith("/bible-buddy") || location === "/vagabond-bible") && item.id === "pastor-chat") || (location === "/prayer-timer" && item.id === "prayer-timer") || (location === "/keep-us-alive" && item.id === "support") || (location === "/find-a-service" && item.id === "find-a-service") ? "text-primary" : ""
                  }`}
                  data-testid={`link-${item.id}`}
                >
                  {item.label}
                </Link>
              ) : item.type === "external" ? (
                <a
                  key={item.id}
                  href={item.href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-link text-muted-foreground font-medium hover:text-primary transition-colors"
                  data-testid={`link-${item.id}`}
                >
                  {item.label}
                </a>
              ) : (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`nav-link text-muted-foreground font-medium hover:text-primary transition-colors ${
                    activeSection === item.id && isHomePage ? "text-primary" : ""
                  }`}
                  data-testid={`link-${item.id}`}
                >
                  {item.label}
                </button>
              )
            ))}
            
            {/* Auth Buttons - only shown when showAuth is true */}
            {showAuth && (
              <>
                {isAuthLoading ? (
                  <div className="ml-2 pl-4 border-l border-border">
                    <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  </div>
                ) : isAuthenticated ? (
                  <div className="flex items-center gap-3 ml-2">
                    <Link
                      href="/prayer-timer"
                      className={`text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors ${location === "/prayer-timer" ? "text-primary" : ""}`}
                      data-testid="link-prayer"
                    >
                      <Timer className="w-4 h-4" />
                      Prayer
                    </Link>
                    <div className="h-4 border-l border-border" />
                    <Link
                      href="/ambassador"
                      className={`text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors ${location.startsWith("/ambassador") || location === "/admin" ? "text-primary" : ""}`}
                      data-testid="link-ambassador"
                    >
                      <Award className="w-4 h-4" />
                      Ambassadors
                    </Link>
                    <div className="h-4 border-l border-border" />
                    <Link
                      href="/profile"
                      className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                      data-testid="link-profile"
                    >
                      <User className="w-4 h-4" />
                      {user?.firstName || 'User'}
                    </Link>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-black text-black hover:bg-black hover:text-white"
                      onClick={handleGetApp}
                      data-testid="button-get-app"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Get the App
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => logout()}
                      data-testid="button-logout"
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 ml-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-black text-black hover:bg-black hover:text-white"
                      onClick={handleGetApp}
                      data-testid="button-get-app"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Get the App
                    </Button>
                    <Link href={location !== "/" ? `/login?redirect=${encodeURIComponent(location)}` : "/login"}>
                      <Button
                        type="button"
                        size="sm"
                        className="bg-[#c08e00] hover:bg-[#a67a00] text-white"
                        data-testid="button-login"
                      >
                        <LogIn className="w-4 h-4 mr-1" />
                        Login
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right content slot (e.g., Bible version selector in native mode) */}
          {rightContent ? (
            <div className="flex items-center">{rightContent}</div>
          ) : !isNative ? (
            /* Mobile Menu Button - hidden in native mode since bottom tab bar handles navigation */
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-foreground relative w-10 h-10 flex items-center justify-center"
              data-testid="button-mobile-menu"
              aria-label="Toggle menu"
            >
              <X 
                key={mobileMenuOpen ? 'x-visible' : 'x-hidden'}
                className={`w-6 h-6 absolute ${mobileMenuOpen ? 'menu-icon-enter' : 'opacity-0'}`} 
              />
              <Menu 
                key={mobileMenuOpen ? 'menu-hidden' : 'menu-visible'}
                className={`w-6 h-6 absolute ${!mobileMenuOpen ? 'menu-icon-enter' : 'opacity-0'}`} 
              />
            </button>
          ) : null}
        </div>

        {/* Mobile Navigation Menu - Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed left-0 right-0 top-[64px] z-50 bg-card border-b border-border shadow-lg max-h-[calc(100vh-64px)] overflow-y-auto">
            <div className="flex flex-col gap-3 p-4">
              {!hideNavLinks && navItems.map((item, index) => (
                item.type === "link" ? (
                  <Link
                    key={item.id}
                    href={item.href!}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-left py-2 px-3 rounded-md text-muted-foreground font-medium hover:bg-muted transition-colors animate-fade-in-up ${
                      (location === "/" && item.id === "home") || (location.startsWith("/programs") && item.id === "programs") || (location.startsWith("/missions") && item.id === "missions") || ((location === "/pastor-chat" || location.startsWith("/bible-buddy") || location === "/vagabond-bible") && item.id === "pastor-chat") || (location === "/prayer-timer" && item.id === "prayer-timer") || (location === "/keep-us-alive" && item.id === "support") || (location === "/find-a-service" && item.id === "find-a-service") ? "bg-muted text-primary" : ""
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    data-testid={`link-${item.id}`}
                  >
                    {item.label}
                  </Link>
                ) : item.type === "external" ? (
                  <a
                    key={item.id}
                    href={item.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-left py-2 px-3 rounded-md text-muted-foreground font-medium hover:bg-muted transition-colors animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                    data-testid={`link-${item.id}`}
                  >
                    {item.label}
                  </a>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`text-left py-2 px-3 rounded-md text-muted-foreground font-medium hover:bg-muted transition-colors animate-fade-in-up ${
                      activeSection === item.id && isHomePage ? "bg-muted text-primary" : ""
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    data-testid={`link-${item.id}`}
                  >
                    {item.label}
                  </button>
                )
              ))}
              
              {/* Mobile Auth Buttons - only shown when showAuth is true */}
              {showAuth && (
                <div className="mt-3 pt-3 border-t border-border animate-fade-in-up" style={{ animationDelay: `${navItems.length * 50}ms` }}>
                  {isAuthLoading ? (
                    <div className="h-10 w-full bg-muted animate-pulse rounded" />
                  ) : isAuthenticated ? (
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/prayer-timer"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`text-sm text-muted-foreground hover:text-primary flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${location === "/prayer-timer" || location === "/prayer-requests" ? "bg-muted text-primary" : ""}`}
                        data-testid="link-mobile-prayer"
                      >
                        <Timer className="w-4 h-4" />
                        Prayer
                      </Link>
                      <Link
                        href="/ambassador"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`text-sm text-muted-foreground hover:text-primary flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${location.startsWith("/ambassador") || location === "/admin" ? "bg-muted text-primary" : ""}`}
                        data-testid="link-mobile-ambassador"
                      >
                        <Award className="w-4 h-4" />
                        Ambassadors
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 px-3 py-2 transition-colors"
                        data-testid="link-mobile-profile"
                      >
                        <User className="w-4 h-4" />
                        {user?.firstName || 'User'} - My Profile
                      </Link>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start border-black text-black hover:bg-black hover:text-white"
                        onClick={() => { handleGetApp(); setMobileMenuOpen(false); }}
                        data-testid="button-mobile-get-app"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Get the App
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => logout()}
                        data-testid="button-mobile-logout"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-black text-black hover:bg-black hover:text-white"
                        onClick={() => { handleGetApp(); setMobileMenuOpen(false); }}
                        data-testid="button-mobile-get-app"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Get the App
                      </Button>
                      <Link href={location !== "/" ? `/login?redirect=${encodeURIComponent(location)}` : "/login"} onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          type="button"
                          className="w-full bg-[#c08e00] hover:bg-[#a67a00] text-white"
                          data-testid="button-mobile-login"
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          Login
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
    {isNative ? (
      <div 
        aria-hidden="true"
        style={{ 
          height: platform === 'android' 
            ? 'calc(64px + var(--android-status-bar-height, 44px))' 
            : 'calc(64px + env(safe-area-inset-top, 0px))' 
        }} 
      />
    ) : (
      <div className="h-[64px]" aria-hidden="true" />
    )}
    </>
  );
}
