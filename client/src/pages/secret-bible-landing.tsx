import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Download } from "lucide-react";

export default function SecretBibleLanding() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          The Secret Bible
        </h1>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Access the Word anywhere, hidden in plain sight. This is our secure landing page for the Secret Bible project.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border-2 border-primary/20">
            <CardContent className="pt-6">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Web Version</h3>
              <p className="text-muted-foreground mb-6">
                Open the Secret Bible directly in your browser.
              </p>
              <Button asChild className="w-full">
                <a href="https://secretbible.org" target="_blank" rel="noopener noreferrer">
                  Launch Web App
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20">
            <CardContent className="pt-6">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Install App (PWA)</h3>
              <p className="text-muted-foreground mb-6">
                Add the Secret Bible to your home screen for offline access.
              </p>
              <Button variant="outline" asChild className="w-full">
                <a href="https://secretbible.org" target="_blank" rel="noopener noreferrer">
                  Download Guide
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-muted p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">How it works</h2>
          <p className="text-muted-foreground">
            The Secret Bible is a Progressive Web App (PWA) that disguises itself on your device. 
            By clicking "Launch" above, you will be taken to the secure portal where you can 
            interact with the app or install it to your device.
          </p>
        </div>
      </main>
    </div>
  );
}
