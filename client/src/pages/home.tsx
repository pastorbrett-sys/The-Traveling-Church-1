import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import MissionSection from "@/components/mission-section";
import JourneyGallery from "@/components/journey-gallery";
import ValuesSection from "@/components/values-section";
import LeadershipSection from "@/components/leadership-section";
import WhatsAppSection from "@/components/whatsapp-section";
import PastorSection from "@/components/pastor-section";
import DonateSection from "@/components/donate-section";
import { EventCalendar } from "@/components/event-calendar";
import ContactForm from "@/components/contact-form";
import Footer from "@/components/footer";
import FloatingDonateButton from "@/components/floating-donate-button";

export default function Home() {
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
      <EventCalendar />
      <ContactForm />
      <Footer />
      <FloatingDonateButton />
    </div>
  );
}
