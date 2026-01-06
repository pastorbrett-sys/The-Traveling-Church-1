import { useEffect } from "react";
import { Link } from "wouter";
import { XCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export default function CheckoutCancel() {
  useEffect(() => {
    document.title = "Payment Cancelled | The Traveling Church";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="container max-w-lg mx-auto px-4 text-center">
          <div className="bg-orange-100 dark:bg-orange-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-orange-600 dark:text-orange-400" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4" data-testid="text-cancel-title">
            Payment Cancelled
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8" data-testid="text-cancel-message">
            No worries! Your payment was not processed. You can still enjoy 10 free messages with Vagabond Bible, or subscribe anytime to get unlimited access.
          </p>
          
          <Link href="/pastor-chat">
            <Button size="lg" className="w-full sm:w-auto" data-testid="button-back-to-chat">
              <MessageCircle className="w-5 h-5 mr-2" />
              Back to Vagabond Bible
            </Button>
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
