import { useState, useEffect } from "react";
import { Menu, X, LogIn, LogOut, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import logoImage from "@assets/Traveling_Church_Vector_SVG_1766874390629.png";

export default function Navigation() {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const isHomePage = location === "/";
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();

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
    { id: "pastor-chat", label: "AI Bible Buddy", type: "link", href: "/pastor-chat" },
    { id: "contact", label: "Contact", type: "scroll" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
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
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 text-sm">
            {navItems.map((item) => (
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
            
            {/* Auth Buttons */}
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
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-foreground"
            data-testid="button-mobile-menu"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                item.type === "link" ? (
                  <Link
                    key={item.id}
                    href={item.href!}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-left py-2 px-3 rounded-md text-muted-foreground font-medium hover:bg-muted transition-colors ${
                      (location === "/" && item.id === "home") || (location.startsWith("/programs") && item.id === "programs") || (location.startsWith("/missions") && item.id === "missions") || ((location === "/pastor-chat" || location.startsWith("/bible-buddy")) && item.id === "pastor-chat") ? "bg-muted text-primary" : ""
                    }`}
                    data-testid={`link-${item.id}`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`text-left py-2 px-3 rounded-md text-muted-foreground font-medium hover:bg-muted transition-colors ${
                      activeSection === item.id && isHomePage ? "bg-muted text-primary" : ""
                    }`}
                    data-testid={`link-${item.id}`}
                  >
                    {item.label}
                  </button>
                )
              ))}
              
              {/* Mobile Auth Buttons */}
              <div className="mt-3 pt-3 border-t border-border">
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
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
