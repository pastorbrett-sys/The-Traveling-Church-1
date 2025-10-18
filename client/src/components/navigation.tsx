import { useState, useEffect } from "react";

export default function Navigation() {
  const logoImage = "/public-objects/Traveling Church Logo_1760305502132.png";
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "mission", "community", "values", "pastor", "leadership", "men-resources", "journey", "events", "contact"];
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
  }, []);

  const handleNavClick = (sectionId: string) => {
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
    { id: "mission", label: "Mission" },
    { id: "journey", label: "Journey" },
    { id: "values", label: "Values" },
    { id: "pastor", label: "Pastor" },
    { id: "men-resources", label: "Resources" },
    { id: "events", label: "Events" },
    { id: "contact", label: "Contact" },
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
              className="h-7"
            />
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-4 text-sm">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`nav-link text-muted-foreground font-medium hover:text-primary transition-colors ${
                  activeSection === item.id ? "text-primary" : ""
                }`}
                data-testid={`link-${item.id}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-foreground relative w-10 h-10"
            data-testid="button-mobile-menu"
            aria-label="Toggle menu"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-5 flex flex-col justify-center">
              <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[4px]' : 'mb-1.5'}`}></span>
              <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'mb-1.5'}`}></span>
              <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[4px]' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col gap-3">
              {navItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-left py-2 px-3 rounded-md text-muted-foreground font-medium hover:bg-muted transition-colors animate-slide-in ${
                    activeSection === item.id ? "bg-muted text-primary" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  data-testid={`link-${item.id}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
