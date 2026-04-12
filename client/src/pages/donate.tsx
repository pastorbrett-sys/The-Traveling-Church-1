import { useEffect } from "react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Link, useSearch } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { DonationWidget } from "@/components/donation-widget";

export default function Donate() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const isSuccess = params.get("success") === "true";
  const isCancelled = params.get("cancelled") === "true";

  useEffect(() => {
    if (isSuccess) {
      window.gtag?.("event", "purchase", { transaction_id: "donation" });
    }
  }, [isSuccess]);

  return (
    <div className="bg-background text-foreground antialiased min-h-screen">
      <Navigation />

      <main className="pt-8 pb-20">
        <div className="max-w-md mx-auto px-4">
          <Link
            href="/programs"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors text-sm"
            data-testid="link-back-programs"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Programs
          </Link>

          {isSuccess && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 text-center" data-testid="banner-success">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
                Thank you for your generosity!
              </h2>
              <p className="text-green-700 dark:text-green-300 text-sm">
                Your donation supports The Traveling Church's mission worldwide. God bless you.
              </p>
            </div>
          )}

          {isCancelled && (
            <div className="mb-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-6 text-center" data-testid="banner-cancelled">
              <p className="text-orange-700 dark:text-orange-300 text-sm">
                No worries — your payment was not processed. You can try again whenever you're ready.
              </p>
            </div>
          )}

          <DonationWidget />
        </div>
      </main>

      <Footer />
    </div>
  );
}
