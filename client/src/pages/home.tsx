import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import MissionSection from "@/components/mission-section";
import JourneyGallery from "@/components/journey-gallery";
import ValuesSection from "@/components/values-section";
import PastorSection from "@/components/pastor-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="bg-background text-foreground antialiased">
      <Navigation />
      <HeroSection />
      <MissionSection />
      <JourneyGallery />
      <ValuesSection />
      <PastorSection />
      
      {/* Call to Action Section */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">Join the Movement</h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            Wherever you are in the world, you're part of our congregation. Connect with us digitally, share your journey, and help us spread the message of love and acceptance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium shadow-md transition-transform active:scale-95"
              data-testid="button-connect"
            >
              Connect With Us
            </button>
            <button 
              className="bg-secondary text-secondary-foreground px-8 py-3 rounded-lg font-medium shadow-md transition-transform active:scale-95"
              data-testid="button-share"
            >
              Share Your Story
            </button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
