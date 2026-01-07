import { useEffect } from "react";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import MissionSection from "@/components/mission-section";
import JourneyGallery from "@/components/journey-gallery";
import ValuesSection from "@/components/values-section";
import LeadershipSection from "@/components/leadership-section";
import MusicMinistrySection from "@/components/music-ministry-section";
import WhatsAppSection from "@/components/whatsapp-section";
import PastorSection from "@/components/pastor-section";
import DonateSection from "@/components/donate-section";
import { EventCalendar } from "@/components/event-calendar";
import ContactForm from "@/components/contact-form";
import Footer from "@/components/footer";
import FloatingDonateButton from "@/components/floating-donate-button";

export default function Home() {
  useEffect(() => {
    if (window.location.hash) {
      const sectionId = window.location.hash.substring(1);
      const element = document.getElementById(sectionId);
      if (element) {
        setTimeout(() => {
          const headerOffset = 60;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }, 100);
      }
    }
  }, []);

  return (
    <div className="bg-background text-foreground antialiased">
      <Navigation />
      <HeroSection />
      <MissionSection />
      <WhatsAppSection />
      <ValuesSection />
      <PastorSection />
      <DonateSection />
      <JourneyGallery />
      <LeadershipSection />
      <MusicMinistrySection />
      <EventCalendar />
      <ContactForm />
      <Footer />
      <FloatingDonateButton />
    </div>
  );
}
