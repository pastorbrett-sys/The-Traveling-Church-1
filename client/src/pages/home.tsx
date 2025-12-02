import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import MissionSection from "@/components/mission-section";
import JourneyGallery from "@/components/journey-gallery";
import ValuesSection from "@/components/values-section";
import WhatsAppSection from "@/components/whatsapp-section";
import PastorSection from "@/components/pastor-section";
import MenResourcesSection from "@/components/men-resources-section";
import { EventCalendar } from "@/components/event-calendar";
import ContactForm from "@/components/contact-form";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="bg-background text-foreground antialiased">
      <Navigation />
      <HeroSection />
      <MissionSection />
      <WhatsAppSection />
      <ValuesSection />
      <PastorSection />
      <MenResourcesSection />
      <JourneyGallery />
      <EventCalendar />
      <ContactForm />
      <Footer />
    </div>
  );
}
