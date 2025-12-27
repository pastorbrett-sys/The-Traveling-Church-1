import { Heart } from "lucide-react";

export default function DonateSection() {
  const donateLink = "https://donate.stripe.com/dRm9AVakieMSgJX6WP4wM00";

  return (
    <section id="donate" className="py-16 md:py-24 bg-gradient-to-br from-secondary/5 to-primary/5">
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background: linear-gradient(270deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(346, 77%, 50%), hsl(var(--primary)));
          background-size: 300% 300%;
          animation: gradient-shift 4s ease infinite;
        }
        .animate-gradient-icon {
          background: linear-gradient(270deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(346, 77%, 50%), hsl(var(--primary)));
          background-size: 300% 300%;
          animation: gradient-shift 4s ease infinite;
        }
      `}</style>
      <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full animate-gradient-icon mb-6">
          <Heart className="w-8 h-8 md:w-10 md:h-10 text-white" />
        </div>
        
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" data-testid="heading-donate">
          Support Our Mission
        </h2>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-donate-description">
          Your generosity helps us continue spreading the gospel around the world. 
          Every donation makes a difference in reaching more communities with God's love.
        </p>
        
        <a
          href={donateLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 animate-gradient text-white px-8 py-4 rounded-full font-medium text-lg animate-bounce-rotate"
          data-testid="button-donate"
        >
          <Heart className="w-5 h-5" />
          Donate Now
        </a>
      </div>
    </section>
  );
}
