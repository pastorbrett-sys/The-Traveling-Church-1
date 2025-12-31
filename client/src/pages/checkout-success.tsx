import { useEffect } from "react";
import { Link } from "wouter";
import { CheckCircle, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export default function CheckoutSuccess() {
  useEffect(() => {
    document.title = "Payment Successful | The Traveling Church";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="container max-w-lg mx-auto px-4 text-center">
          <div className="bg-green-100 dark:bg-green-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4" data-testid="text-success-title">
            Welcome to Pro!
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8" data-testid="text-success-message">
            Thank you for subscribing to The Traveling Church Pro plan. You now have unlimited access to the AI Pastor for spiritual guidance and support.
          </p>
          
          <div className="space-y-4">
            <Link href="/pastor-chat">
              <Button size="lg" className="w-full sm:w-auto" data-testid="button-go-to-chat">
                <MessageCircle className="w-5 h-5 mr-2" />
                Continue to AI Pastor
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            
            <div>
              <Link href="/">
                <Button variant="ghost" data-testid="link-home">
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
