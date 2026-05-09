import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import vagabondLogo from "@assets/Vagabond_Faith_Black_Transparent.png";

export default function DeleteAccount() {
  useEffect(() => {
    document.title = "Delete Account | Vagabond Faith";
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(30,20%,97%)]">
      <nav className="bg-white/95 backdrop-blur-sm border-b border-[hsl(30,20%,88%)] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <img src={vagabondLogo} alt="Vagabond Faith" className="h-10" />
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
        <div className="flex items-center gap-3 mb-8">
          <Trash2 className="w-8 h-8 text-red-600" />
          <h1 className="text-3xl font-bold text-[hsl(20,10%,20%)]" data-testid="heading-delete-account">
            Delete Your Account
          </h1>
        </div>

        <div className="prose prose-lg max-w-none text-[hsl(20,10%,30%)]">
          <p className="text-sm text-[hsl(20,10%,50%)] mb-8">Last updated: February 2026</p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Account Deletion is Permanent</h3>
                <p className="text-red-700">
                  Deleting your account is irreversible. All your data will be permanently removed and cannot be recovered.
                </p>
              </div>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[hsl(20,10%,20%)] mb-4">How to Delete Your Account</h2>
            <p className="mb-4">
              You can delete your Vagabond Faith account directly from within the app by following these steps:
            </p>
            <ol className="list-decimal list-inside space-y-3 mb-4 ml-2">
              <li className="text-[hsl(20,10%,30%)]">Open the Vagabond Faith app</li>
              <li className="text-[hsl(20,10%,30%)]">Sign in to your account</li>
              <li className="text-[hsl(20,10%,30%)]">Tap on your <strong>Profile</strong> (person icon in the bottom navigation)</li>
              <li className="text-[hsl(20,10%,30%)]">Scroll to the bottom of the Profile page</li>
              <li className="text-[hsl(20,10%,30%)]">Tap <strong>"Delete Account"</strong></li>
              <li className="text-[hsl(20,10%,30%)]">Confirm the deletion when prompted</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[hsl(20,10%,20%)] mb-4">What Data Is Deleted</h2>
            <p className="mb-4">
              When you delete your account, the following data is <strong>permanently deleted</strong>:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-2">
              <li className="text-[hsl(20,10%,30%)]">Your account profile (name, email address)</li>
              <li className="text-[hsl(20,10%,30%)]">AI Bible Buddy chat history and conversations</li>
              <li className="text-[hsl(20,10%,30%)]">Saved notes and bookmarks</li>
              <li className="text-[hsl(20,10%,30%)]">Notification preferences and push notification tokens</li>
              <li className="text-[hsl(20,10%,30%)]">Usage data and activity history</li>
              <li className="text-[hsl(20,10%,30%)]">Prayer requests</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[hsl(20,10%,20%)] mb-4">Subscription Cancellation</h2>
            <p className="mb-4">
              If you have an active Pro subscription, please note:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-2">
              <li className="text-[hsl(20,10%,30%)]"><strong>Web subscriptions (Stripe):</strong> Your subscription will be cancelled automatically when your account is deleted.</li>
              <li className="text-[hsl(20,10%,30%)]"><strong>iOS subscriptions (App Store):</strong> You must cancel your subscription separately through your Apple ID settings. Deleting the account does not automatically cancel App Store subscriptions.</li>
              <li className="text-[hsl(20,10%,30%)]"><strong>Android subscriptions (Google Play):</strong> You must cancel your subscription separately through Google Play Store settings. Deleting the account does not automatically cancel Google Play subscriptions.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[hsl(20,10%,20%)] mb-4">Data Retention</h2>
            <p className="mb-4">
              Account deletion is processed immediately. All personal data is removed from our systems with no additional retention period. Anonymous, aggregated analytics data that cannot be linked back to your identity may be retained.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[hsl(20,10%,20%)] mb-4">Alternative: Contact Us</h2>
            <p className="mb-4">
              If you are unable to access your account or need assistance with account deletion, you can contact us at:
            </p>
            <p className="mb-4">
              <strong>Email:</strong>{" "}
              <a href="mailto:support@vagabondbible.com" className="text-[hsl(35,80%,45%)] underline" data-testid="link-support-email">
                support@vagabondbible.com
              </a>
            </p>
            <p className="mb-4">
              We will process your deletion request within 7 business days.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-[hsl(30,20%,88%)] bg-white/50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-[hsl(20,10%,50%)]">
          <p>&copy; {new Date().getFullYear()} Vagabond Faith. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/privacy-policy" className="hover:text-[hsl(35,80%,45%)] underline">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-[hsl(35,80%,45%)] underline">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
