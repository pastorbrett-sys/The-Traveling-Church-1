import { Check } from "lucide-react";
import { Link } from "wouter";

export default function CounselingPage() {
  const tiers = [
    {
      name: "Basic",
      price: "$50",
      sessions: "1 session per month",
      features: [
        "Monthly 1-on-1 spiritual counseling",
        "Video call via Zoom or Google Meet",
        "Flexible scheduling with Calendly",
        "Email support between sessions",
        "Cancel anytime"
      ],
      stripeLink: "#" // Will be replaced with actual Stripe Checkout URL
    },
    {
      name: "Standard",
      price: "$100",
      sessions: "2 sessions per month",
      features: [
        "Monthly 2 x 1-on-1 spiritual counseling",
        "Video call via Zoom or Google Meet",
        "Priority scheduling with Calendly",
        "Email support between sessions",
        "Cancel anytime"
      ],
      stripeLink: "#",
      popular: true
    },
    {
      name: "Premium",
      price: "$200",
      sessions: "3 sessions per month",
      features: [
        "Monthly 3 x 1-on-1 spiritual counseling",
        "Video call via Zoom or Google Meet",
        "Priority scheduling with Calendly",
        "Direct messaging support",
        "Optional community group access",
        "Cancel anytime"
      ],
      stripeLink: "#"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <a className="text-primary font-semibold hover:underline" data-testid="link-back-home">
              ← Back to The Traveling Church
            </a>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-counseling">
            Meet With Spiritual Men Who Get It.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Honest, faith-based conversations with spiritual counselors who understand the challenges men face. 
            No judgment. Just real talk grounded in faith.
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Choose Your Plan
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`bg-card rounded-lg p-8 border-2 ${
                  tier.popular ? "border-primary" : "border-border"
                } relative`}
                data-testid={`card-tier-${tier.name.toLowerCase()}`}
              >
                {tier.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{tier.sessions}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={tier.stripeLink}
                  className={`block w-full text-center py-3 rounded-lg font-medium transition-colors ${
                    tier.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                  data-testid={`button-join-${tier.name.toLowerCase()}`}
                >
                  Join Now
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">How do sessions work?</h3>
              <p className="text-muted-foreground">
                After subscribing, you'll receive a welcome email with your booking link and optional intake form. 
                Book your session at a time that works for you, and you'll automatically receive a video call link.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Yes. You can cancel your subscription at any time with no penalties or fees.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">How do I reschedule a session?</h3>
              <p className="text-muted-foreground">
                Use your booking link to reschedule anytime. You'll receive confirmation emails for any changes.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Who are the counselors?</h3>
              <p className="text-muted-foreground">
                Our counselors are spiritual men with deep faith foundations who understand the unique pressures 
                and challenges men face in today's world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>For questions or support, email: support@thetravelingchurch.com</p>
          <p className="mt-2">© 2025 The Traveling Church. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
