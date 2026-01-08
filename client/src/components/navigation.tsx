import { useState, useEffect } from "react";
import { Menu, X, LogIn, LogOut, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { usePlatform } from "@/contexts/platform-context";
import logoImage from "@assets/Traveling_Church_Vector_SVG_1766874390629.png";

interface NavigationProps {
  customLogo?: string;
  showAuth?: boolean;
  hideNavLinks?: boolean;
  rightContent?: React.ReactNode;
}

export default function Navigation({ customLogo, showAuth = false, hideNavLinks = false, rightContent }: NavigationProps = {}) {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const isHomePage = location === "/";
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const { isNative } = usePlatform();

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
      window.location.href = `/#${sectionId}`;
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
    { id: "pastor-chat", label: "Vagabond Bible", type: "link", href: "/vagabond-bible" },
    { id: "contact", label: "Contact", type: "scroll" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {customLogo ? (
            <Link
              href="/vagabond-bible"
              className="flex items-center"
              data-testid="link-home"
            >
              <img 
                src={customLogo} 
                alt="Vagabond Bible AI" 
                className="h-11"
              />
            </Link>
          ) : (
            <button
              onClick={() => handleNavClick("home")}
              className="flex items-center"
              data-testid="link-home"
            >
              <img 
                src={logoImage} 
                alt="The Traveling Church" 
                className="h-11"
              />
            </button>
          )}
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 text-sm">
            {!hideNavLinks && navItems.map((item) => (
              item.type === "link" ? (
                <Link
                  key={item.id}
                  href={item.href!}
                  className={`nav-link text-muted-foreground font-medium hover:text-primary transition-colors ${
                    (location === "/" && item.id === "home") || (location.startsWith("/programs") && item.id === "programs") || (location.startsWith("/missions") && item.id === "missions") || ((location === "/pastor-chat" || location.startsWith("/bible-buddy")) && item.id === "pastor-chat") ? "text-primary" : ""
                  }`}
                  data-testid={`link-${item.id}`}
                >
                  {item.label}
                </Link>
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
                  <div className="flex items-center gap-3 ml-2 pl-4 border-l border-border">
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
                      onClick={() => logout()}
                      data-testid="button-logout"
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Link href={location !== "/" ? `/login?redirect=${encodeURIComponent(location)}` : "/login"}>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="ml-2"
                      data-testid="button-login"
                    >
                      <LogIn className="w-4 h-4 mr-1" />
                      Login
                    </Button>
                  </Link>
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
          <div className="lg:hidden fixed left-0 right-0 top-[64px] z-50 bg-background border-b border-border shadow-lg max-h-[calc(100vh-64px)] overflow-y-auto">
            <div className="flex flex-col gap-3 p-4">
              {!hideNavLinks && navItems.map((item, index) => (
                item.type === "link" ? (
                  <Link
                    key={item.id}
                    href={item.href!}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-left py-2 px-3 rounded-md text-muted-foreground font-medium hover:bg-muted transition-colors animate-fade-in-up ${
                      (location === "/" && item.id === "home") || (location.startsWith("/programs") && item.id === "programs") || (location.startsWith("/missions") && item.id === "missions") || ((location === "/pastor-chat" || location.startsWith("/bible-buddy")) && item.id === "pastor-chat") ? "bg-muted text-primary" : ""
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    data-testid={`link-${item.id}`}
                  >
                    {item.label}
                  </Link>
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
                        className="w-full justify-start"
                        onClick={() => logout()}
                        data-testid="button-mobile-logout"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <Link href={location !== "/" ? `/login?redirect=${encodeURIComponent(location)}` : "/login"} onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        type="button"
                        variant="default"
                        className="w-full"
                        data-testid="button-mobile-login"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
