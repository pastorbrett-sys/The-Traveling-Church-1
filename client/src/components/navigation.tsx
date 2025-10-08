import { useState, useEffect } from "react";

export default function Navigation() {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "mission", "journey", "values", "pastor", "blog", "contact"];
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
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => handleNavClick("home")}
            className="text-lg font-semibold text-primary"
            data-testid="link-home"
          >
            The Traveling Church
          </button>
          <div className="flex gap-3 md:gap-4 text-xs md:text-sm">
            <button
              onClick={() => handleNavClick("mission")}
              className={`nav-link text-muted-foreground font-medium ${
                activeSection === "mission" ? "active" : ""
              }`}
              data-testid="link-mission"
            >
              Mission
            </button>
            <button
              onClick={() => handleNavClick("journey")}
              className={`nav-link text-muted-foreground font-medium ${
                activeSection === "journey" ? "active" : ""
              }`}
              data-testid="link-journey"
            >
              Journey
            </button>
            <button
              onClick={() => handleNavClick("values")}
              className={`nav-link text-muted-foreground font-medium ${
                activeSection === "values" ? "active" : ""
              }`}
              data-testid="link-values"
            >
              Values
            </button>
            <button
              onClick={() => handleNavClick("pastor")}
              className={`nav-link text-muted-foreground font-medium ${
                activeSection === "pastor" ? "active" : ""
              }`}
              data-testid="link-pastor"
            >
              Pastor
            </button>
            <button
              onClick={() => handleNavClick("blog")}
              className={`nav-link text-muted-foreground font-medium ${
                activeSection === "blog" ? "active" : ""
              }`}
              data-testid="link-blog"
            >
              Journal
            </button>
            <button
              onClick={() => handleNavClick("contact")}
              className={`nav-link text-muted-foreground font-medium ${
                activeSection === "contact" ? "active" : ""
              }`}
              data-testid="link-contact"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
