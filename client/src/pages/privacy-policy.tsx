import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import vagabondLogo from "@/assets/vagabond-logo.png";

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Privacy Policy | Vagabond Bible";
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(30,20%,97%)]">
      <nav className="bg-white/95 backdrop-blur-sm border-b border-[hsl(30,20%,88%)] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <img src={vagabondLogo} alt="Vagabond Bible" className="h-10" />
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-[hsl(20,10%,40%)]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-[hsl(20,10%,20%)] mb-8" data-testid="heading-privacy-policy">
          Privacy Policy
        </h1>
        
        <div className="prose prose-lg max-w-none text-[hsl(20,10%,30%)]">
          <p className="text-sm text-[hsl(20,10%,50%)] mb-8">Last updated: January 2025</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[hsl(20,10%,20%)] mb-4">1. Introduction</h2>
            <p className="mb-4">
              Vagabond Bible ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application and website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[hsl(20,10%,20%)] mb-4">2. Information We Collect</h2>
            <h3 className="text-lg font-medium text-[hsl(20,10%,25%)] mb-2">Account Information</h3>
            <p className="mb-4">
              When you create an account, we collect your email address and display name through Google Sign-In authentication.
            </p>
            <h3 className="text-lg font-medium text-[hsl(20,10%,25%)] mb-2">User Content</h3>
            <p className="mb-4">
              We store the notes you create, your chat conversations with Pastor Brett (our AI assistant), and your reading preferences to provide a personalized experience.
            </p>
            <h3 className="text-lg font-medium text-[hsl(20,10%,25%)] mb-2">Usage Data</h3>
            <p className="mb-4">
              We collect information about how you use the app, including features accessed and interaction patterns, to improve our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[hsl(20,10%,20%)] mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>To provide and maintain our service</li>
              <li>To personalize your experience</li>
              <li>To process your subscription and payments</li>
              <li>To send you important updates about the service</li>
              <li>To improve our AI features and responses</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[hsl(20,10%,20%)] mb-4">4. AI-Powered Features</h2>
            <p className="mb-4">
              Our app uses artificial intelligence (OpenAI) to power features like Pastor Chat, Smart Search, and Verse Insights. When you use these features, your queries are processed by our AI systems to generate responses. We do not use your personal conversations to train AI models.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[hsl(20,10%,20%)] mb-4">5. Third-Party Services</h2>
            <p className="mb-4">We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Firebase</strong> - Authentication and user management</li>
              <li><strong>OpenAI</strong> - AI-powered features</li>
              <li><strong>Stripe</strong> - Payment processing (web)</li>
              <li><strong>RevenueCat</strong> - Subscription management (mobile)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[hsl(20,10%,20%)] mb-4">6. Data Security</h2>
            <p className="mb-4">
              We implement appropriate security measures to protect your personal information. All data is transmitted using secure HTTPS connections.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[hsl(20,10%,20%)] mb-4">7. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Access your personal data</li>
              <li>Request correction of your data</li>
              <li>Request deletion of your account and data</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[hsl(20,10%,20%)] mb-4">8. Account Deletion</h2>
            <p className="mb-4">
              You can request deletion of your account and all associated data by contacting us at support@vagabondbible.com. We will process your request within 30 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[hsl(20,10%,20%)] mb-4">9. Children's Privacy</h2>
            <p className="mb-4">
              Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[hsl(20,10%,20%)] mb-4">10. Changes to This Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[hsl(20,10%,20%)] mb-4">11. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mb-4">
              <strong>Email:</strong> support@vagabondbible.com
            </p>
          </section>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-[hsl(20,10%,40%)] border-t border-[hsl(30,20%,88%)]">
        <p>&copy; {new Date().getFullYear()} Vagabond Bible. All rights reserved.</p>
      </footer>
    </div>
  );
}
