import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import logoImage from "@assets/Traveling_Church_Logo_Lockup_1766868168920.png";

export default function Navigation() {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const isHomePage = location === "/";

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
    { id: "mission", label: "Mission", type: "scroll" },
    { id: "journey", label: "Journey", type: "scroll" },
    { id: "values", label: "Values", type: "scroll" },
    { id: "pastor", label: "Pastor", type: "scroll" },
    { id: "programs", label: "Programs", type: "link", href: "/programs" },
    { id: "events", label: "Events", type: "scroll" },
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
              className="h-14"
            />
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-4 text-sm">
            {navItems.map((item) => (
              item.type === "link" ? (
                <Link
                  key={item.id}
                  href={item.href!}
                  className={`nav-link text-muted-foreground font-medium hover:text-primary transition-colors ${
                    location.startsWith("/programs") && item.id === "programs" ? "text-primary" : ""
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
                      location.startsWith("/programs") && item.id === "programs" ? "bg-muted text-primary" : ""
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
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
