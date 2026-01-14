import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Mail, MessageCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import vagabondLogo from "@/assets/vagabond-logo.png";

export default function Support() {
  useEffect(() => {
    document.title = "Support | Vagabond Bible";
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
        <h1 className="text-3xl font-bold text-[hsl(20,10%,20%)] mb-4" data-testid="heading-support">
          Support
        </h1>
        <p className="text-lg text-[hsl(20,10%,50%)] mb-12">
          We're here to help you on your spiritual journey with Vagabond Bible.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 border border-[hsl(30,20%,88%)] shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[hsl(30,30%,95%)] rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-[hsl(20,10%,40%)]" />
              </div>
              <h2 className="text-xl font-semibold text-[hsl(20,10%,20%)]">Email Support</h2>
            </div>
            <p className="text-[hsl(20,10%,40%)] mb-4">
              For general questions, feedback, or assistance with your account.
            </p>
            <a 
              href="mailto:pastorbrett@thetravelingchurch.com"
              className="inline-flex items-center text-[hsl(25,70%,45%)] hover:text-[hsl(25,70%,35%)] font-medium"
              data-testid="link-support-email"
            >
              pastorbrett@thetravelingchurch.com
            </a>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[hsl(30,20%,88%)] shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[hsl(30,30%,95%)] rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-[hsl(20,10%,40%)]" />
              </div>
              <h2 className="text-xl font-semibold text-[hsl(20,10%,20%)]">Response Time</h2>
            </div>
            <p className="text-[hsl(20,10%,40%)]">
              We aim to respond to all inquiries within 24-48 hours. For urgent matters, please indicate so in your subject line.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 border border-[hsl(30,20%,88%)] shadow-sm mb-12">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-[hsl(20,10%,40%)]" />
            <h2 className="text-xl font-semibold text-[hsl(20,10%,20%)]">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-[hsl(20,10%,20%)] mb-2">How do I upgrade to Pro?</h3>
              <p className="text-[hsl(20,10%,40%)]">
                You can upgrade to Vagabond Bible Pro from within the app. Look for the upgrade option in the menu or when accessing premium features.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-[hsl(20,10%,20%)] mb-2">How do I cancel my subscription?</h3>
              <p className="text-[hsl(20,10%,40%)]">
                Go to your Profile in the app and tap "Manage Subscription" to cancel or modify your plan. For iOS, this will take you to your Apple subscription settings. If you subscribed on the web, you'll be taken to Stripe to manage your subscription.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-[hsl(20,10%,20%)] mb-2">How do I delete my account?</h3>
              <p className="text-[hsl(20,10%,40%)]">
                Go to your Profile in the app and tap "Delete Account." This will permanently remove your account and all associated data.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-[hsl(20,10%,20%)] mb-2">Is Pastor Brett a real person?</h3>
              <p className="text-[hsl(20,10%,40%)]">
                Pastor Brett is an AI-powered pastoral assistant designed to help you explore Scripture and grow in your faith. While powered by AI, the responses are guided by sound biblical principles.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center text-[hsl(20,10%,50%)]">
          <p className="mb-2">Vagabond Bible</p>
          <p className="text-sm">A ministry of The Traveling Church</p>
        </div>
      </main>
    </div>
  );
}
